import { synthesizeAgents, RISK_PROFILES } from "../agents/synthesisEngine.js";
import { runTechnicalAgent } from "../agents/technicalAgent.js";
import { runFundamentalRAGAgent } from "../agents/fundamentalAgent.js";
import { runSentimentAgent } from "../agents/sentimentAgent.js";
import { STOCKS_DATA } from "../data/stocksData.js";
import { getUser, priceFor } from "../data/portfolios.js";
import { getProfile, PROFILE_IDS, profileForAppetite } from "./profiles.js";
import { analysePortfolio, evaluateTrade, behaviouralTilt, pct } from "./finance.js";

/**
 * The analysis layer. Everything the UI renders comes from here, in the shape
 * frozen in schemas/analysis.schema.json.
 *
 * Implemented here, not asserted:
 *   • a three-method verifier — see VERIFICATION METHODS below
 *   • polarity-based conflict detection between independent agents
 *   • portfolio-aware suitability (sector cap / trade cap / per-equity guide)
 *   • compliance scanning of rendered language
 *   • per-session metrics that are measured or computed, never typed
 */

// ── Signal polarity: one scale so independent dimensions are comparable ─────
export const POLARITY = {
  STRONG_BULLISH: 1.0,
  MILD_BULLISH: 0.6,
  STRONG_FUNDAMENTAL: 0.8,
  DEEP_VALUE_UNDERVALUED: 0.9,
  VALUATION_EXPENSIVE: -0.35,
  BEARISH_CONSOLIDATION: -0.6,
  STRONG_BEARISH: -1.0,
  HEAVY_INSTITUTIONAL_INFLOW: 0.85,
  NET_ACCUMULATION: 0.6,
  STRONG_BUY_SENTIMENT: 0.8,
  MODERATE_INFLOW: 0.4,
  MIXED_FLOW_DII_SUPPORT: 0.15,
  INSTITUTIONAL_OUTFLOW: -0.7,
  NEUTRAL: 0,
  NEUTRAL_FLOW: 0,
  CAUTION_MISSING_DISCLOSURE: -0.4,
  UNDERWEIGHT: -0.3,
  OVERWEIGHT: -0.4,
  BALANCED: 0.2,
  CONCENTRATION_BREACH: -0.5,
  UNKNOWN: 0
};

/** Two independent agents are in conflict beyond 35% of the full −1…+1 range. */
export const CONFLICT_THRESHOLD = 0.7;

/* ═══════════════════════════════════════════════════════════════════════════
   VERIFICATION METHODS
   Every figure that reaches the screen is classified by one of three tests:

     NUMERIC_MATCH   the figure appears in the object it came from — a retrieved
                     passage, the market snapshot, the flow tape or the portfolio
                     snapshot
     COMPUTED        the figure is not quoted from a source but is derived from
                     declared inputs by this repository's own arithmetic, and the
                     derivation is on record (see computedPool below)
     UNSUPPORTED     neither — the figure is flagged in the prose, struck through
                     in the UI, and penalties the agent's confidence

   Indicator window parameters are not claims: "14-period RSI", "50-DMA",
   "20-day median", "MACD (12, 26, 9)" describe an indicator, they do not assert
   a fact about the company. Comparison thresholds ("bullish above 1.0") are
   likewise methodology, not data. Both are removed before verification.
   ═══════════════════════════════════════════════════════════════════════════ */
const NUM_RE = /\d[\d,]*(?:\.\d+)?/g;

const INDICATOR_PARAM_RE = [
  /\b\d+\s*-?\s*(?:period|day|days|week|weeks|month|months|year|years)\b/gi,
  /\b\d+\s*-?\s*(?:DMA|EMA|SMA)\b/gi,
  /* execution-method counts, e.g. "staggered 3-tranche batches" — a procedure,
     not a fact about the company */
  /\b\d+\s*-?\s*(?:tranche|tranches)\b/gi,
  /\bRSI\s*\(\s*\d+\s*\)/gi,
  /\b(?:above|below|over|under)\s+\d[\d,]*(?:\.\d+)?/gi,
  /\b(?:HTTP|status|returned|error)\s*(?:code\s*)?\d{3}\b/gi,
  /\b\d{3}\s*(?:timeout|error)\b/gi,
  /\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
  /\(\s*\d+\s*,\s*\d+\s*\)/g
];

export function stripIndicatorParams(text) {
  let out = String(text ?? "");
  INDICATOR_PARAM_RE.forEach((re) => {
    out = out.replace(re, " ");
  });
  return out;
}

export function numbersIn(text) {
  if (!text) return [];
  return (stripIndicatorParams(text).match(NUM_RE) || [])
    .map((raw) => raw.replace(/,/g, ""))
    .filter((raw) => raw.length > 0)
    .map((raw) => ({ raw, value: Number(raw) }))
    .filter((n) => Number.isFinite(n.value));
}

function sourceNumbers(texts) {
  return texts.filter(Boolean).flatMap((t) => {
    const stripped = stripIndicatorParams(String(t));
    return (stripped.match(NUM_RE) || []).map((raw) => Number(raw.replace(/,/g, "")));
  });
}

/** A number verifies if it appears in a pool, exact or within 0.5%. */
function inPool(value, pool) {
  return pool.some((p) => p === value || (p !== 0 && Math.abs(p - value) / Math.abs(p) <= 0.005));
}

/**
 * @returns {{checked:number, verified:number, unsupported:string[], computed:string[]}}
 */
export function auditText(text, sources, computedPool = []) {
  const srcPool = sourceNumbers(sources);
  const computedValues = computedPool.map((c) => c.value);
  const unsupported = [];
  const computed = [];
  let verified = 0;

  numbersIn(text).forEach((n) => {
    if (inPool(n.value, srcPool)) verified += 1;
    else if (inPool(n.value, computedValues)) {
      verified += 1;
      computed.push(n.raw);
    } else unsupported.push(n.raw);
  });

  return { checked: verified + unsupported.length, verified, computed, unsupported };
}

// ── Compliance shield ─────────────────────────────────────────────────────
export const PROHIBITED_PHRASES = [
  { phrase: "guaranteed", replacement: "not assured" },
  { phrase: "assured return", replacement: "uncertain outcome" },
  { phrase: "assured returns", replacement: "uncertain outcomes" },
  { phrase: "risk-free", replacement: "risk-aware" },
  { phrase: "risk free", replacement: "risk aware" },
  { phrase: "sure-shot", replacement: "evidence-based" },
  { phrase: "sure shot", replacement: "evidence-based" },
  { phrase: "multibagger", replacement: "high-conviction" },
  { phrase: "no risk", replacement: "controlled risk" },
  { phrase: "100% safe", replacement: "not risk-free" }
];

export const AI_DISCLOSURE =
  "AI-generated research for educational purposes. Not investment advice. No assurance of returns. " +
  "Market data may be delayed, simulated or synthetic. AI is used for extraction, classification and " +
  "narration; every figure is checked against its cited source before display.";

export function scanCompliance(strings) {
  const hits = [];
  const cleaned = strings.map((s) => {
    let out = String(s ?? "");
    PROHIBITED_PHRASES.forEach(({ phrase, replacement }) => {
      const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      if (re.test(out)) {
        hits.push(phrase);
        out = out.replace(re, replacement);
      }
    });
    return out;
  });
  return { hits: [...new Set(hits)], cleaned };
}

// ── Cross-sectional valuation reference (a real computed figure) ──────────
export function crossSectionalMedianPE(stocks = STOCKS_DATA) {
  const pes = Object.values(stocks)
    .map((s) => s.peRatio)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (pes.length === 0) return null;
  const mid = Math.floor(pes.length / 2);
  const raw = pes.length % 2 ? pes[mid] : (pes[mid - 1] + pes[mid]) / 2;
  return Number(raw.toFixed(1));
}

// ── Engine: run the three agents and measure what we can actually measure ──
function timed(fn) {
  const t0 = performance.now();
  const result = fn();
  return { result, ms: Math.max(1, Math.round(performance.now() - t0)) };
}

export function runEngine({ stock, isDegraded = false, stocks = STOCKS_DATA }) {
  const t0 = performance.now();
  // The valuation reference is computed from the tracked universe and passed to
  // the agent, so no agent has to assert an unsourced "sector median".
  const enriched = { ...stock, sectorMedianPE: crossSectionalMedianPE(stocks) };

  const technical = timed(() => runTechnicalAgent(enriched, isDegraded));
  const fundamental = timed(() => runFundamentalRAGAgent(enriched, isDegraded));
  const sentiment = timed(() => runSentimentAgent(enriched, isDegraded));
  const totalMs = Math.max(1, Math.round(performance.now() - t0));

  const stamp = (envelope, ms) => ({
    ...envelope,
    executionTimeMs: ms,
    execution: {
      latency_ms: ms,
      model: "local-deterministic",
      cached: false,
      attempts: 1,
      measured: "local compute, wall clock"
    }
  });

  return {
    stock: enriched,
    technicalResult: stamp(technical.result, technical.ms),
    fundamentalResult: stamp(fundamental.result, fundamental.ms),
    sentimentResult: stamp(sentiment.result, sentiment.ms),
    totalMs
  };
}

// ── Source objects every claim is checked against ─────────────────────────
function marketSourceQuote(stock) {
  const t = stock.technicalMetrics;
  return [
    `market snapshot ${stock.symbol} ${stock.exchange}`,
    `price=${stock.price}`,
    `change=${stock.change}`,
    `changePercent=${stock.changePercent}`,
    `dayHigh=${stock.dayHigh}`,
    `dayLow=${stock.dayLow}`,
    `marketCap=${stock.marketCap}`,
    `peRatio=${stock.peRatio}`,
    `sectorMedianPE=${stock.sectorMedianPE}`,
    `beta=${stock.beta}`,
    `volumeSurgeRatio=${stock.volumeSurgeRatio}`,
    `rsi14=${t.rsi14}`,
    `dma50=${t.dma50}`,
    `dma200=${t.dma200}`,
    `macdLine=${t.macd.macdLine}`,
    `macdSignalLine=${t.macd.signalLine}`,
    `macdHistogram=${t.macd.histogram}`,
    `bollingerUpper=${t.bollingerBands.upper}`,
    `bollingerMiddle=${t.bollingerBands.middle}`,
    `bollingerLower=${t.bollingerBands.lower}`,
    `bollingerPercentile=${t.bollingerBands.percentile}`,
    `volumeAnomalyDetected=${t.volumeAnomalyDetected}`,
    `anomalyDescription=${t.anomalyDescription}`
  ].join(" | ");
}

function flowSourceQuote(sentimentResult) {
  return [
    `institutional tape snapshot ${sentimentResult.agentName}`,
    `fiiNetFlow=${sentimentResult.metrics.fiiFlow}`,
    `diiNetFlow=${sentimentResult.metrics.diiFlow}`,
    `pcrRatio=${sentimentResult.metrics.pcrRatio}`,
    `sentimentScore=${sentimentResult.metrics.sentimentScore}`,
    `sentimentScale=100`
  ].join(" | ");
}

function portfolioSourceQuote(portfolio, user) {
  return [
    `portfolio snapshot ${user.name}`,
    `positions=${portfolio.positions.length}`,
    `hhi=${portfolio.hhi.toFixed(3)}`,
    `betaWeighted=${portfolio.betaWeighted.toFixed(2)}`,
    `totalValue=${Math.round(portfolio.totalValue)}`,
    `equityValue=${Math.round(portfolio.equityValue)}`,
    `cashDebt=${Math.round(portfolio.cashDebt)}`,
    ...portfolio.sectorEntries.map(([s, w]) => `${s}=${(w * 100).toFixed(1)}`)
  ].join(" | ");
}

/**
 * Citations arrive from the retrieval agent using the agent's own field names
 * (title, quote, fullText). The corpus stores the same content as
 * (documentName, highlightQuote, fullExcerpt). Normalise once here so nothing
 * downstream has to guess — a wrong field name would silently turn the verifier's
 * source into `undefined`, which is exactly the failure this guards against.
 */
export function normalizeCitation(cite) {
  if (!cite) return null;
  const title = cite.documentName ?? cite.title ?? cite.docId ?? "Untitled disclosure";
  const claim = cite.highlightQuote ?? cite.quote ?? "";
  const passage = cite.fullExcerpt ?? cite.fullText ?? "";
  return {
    doc_id: cite.docId ?? cite.id,
    chunk_id: cite.chunkId,
    title,
    regulator: cite.regulator ?? null,
    category: cite.category ?? null,
    filed_at: cite.filingDate ?? cite.date ?? null,
    url: cite.sourceUrl ?? null,
    claim,
    passage,
    metrics: cite.metrics ?? null
  };
}

function documentSourceText(cite) {
  const c = normalizeCitation(cite);
  if (!c) return "";
  // A chunk in a real index carries its header, so the document identity is part
  // of the text a claim is checked against.
  return [c.title, c.regulator, c.category, c.chunk_id, c.filed_at, c.passage]
    .filter(Boolean)
    .join(" | ");
}

/** Character span of the cited sentence inside its passage (for highlighting). */
export function resolveSpan(cite) {
  const c = normalizeCitation(cite);
  if (!c?.passage || !c?.claim) return null;
  const start = c.passage.indexOf(c.claim);
  if (start < 0) return null;
  return [start, start + c.claim.length];
}

// ── Conflict detection ────────────────────────────────────────────────────
function detectConflict(agents) {
  const pairs = [];
  for (let i = 0; i < agents.length; i += 1) {
    for (let j = i + 1; j < agents.length; j += 1) {
      const gap = Math.abs((POLARITY[agents[i].signal] ?? 0) - (POLARITY[agents[j].signal] ?? 0));
      if (gap >= CONFLICT_THRESHOLD) {
        pairs.push({
          a: agents[i].agent_id,
          b: agents[j].agent_id,
          gap: Number(gap.toFixed(2)),
          signals: [agents[i].signal, agents[j].signal]
        });
      }
    }
  }
  const bestPair = pairs.length
    ? pairs.reduce((m, p) => (p.gap > m.gap ? p : m), pairs[0])
    : widestPair(agents);
  return {
    detected: pairs.length > 0,
    pairs,
    maxGap: pairs.reduce((m, p) => Math.max(m, p.gap), 0),
    bestPair,
    bestGap: bestPair ? bestPair.gap : 0
  };
}

/** The widest divergence regardless of the threshold, so a forced demo scenario
 *  still has a real pair to debate rather than an empty panel. */
function widestPair(agents) {
  let best = null;
  for (let i = 0; i < agents.length; i += 1) {
    for (let j = i + 1; j < agents.length; j += 1) {
      const gap = Math.abs((POLARITY[agents[i].signal] ?? 0) - (POLARITY[agents[j].signal] ?? 0));
      if (!best || gap > best.gap) {
        best = {
          a: agents[i].agent_id,
          b: agents[j].agent_id,
          gap: Number(gap.toFixed(2)),
          signals: [agents[i].signal, agents[j].signal]
        };
      }
    }
  }
  return best;
}

function flipConditions(stock) {
  const t = stock.technicalMetrics;
  const out = [];
  if (t.rsi14 > 55) out.push(`RSI(14) closes below ${Math.round(t.rsi14 - 10)}`);
  out.push(`Volume falls below 0.8× the 20-day median (now ${stock.volumeSurgeRatio}×)`);
  out.push(`Price closes below the 50-DMA (₹${t.dma50})`);
  if (stock.peRatio > 20) out.push(`An earnings revision pushes the P/E above ${Math.ceil(stock.peRatio * 1.35)}`);
  return out.slice(0, 3);
}

function statementFor(agentId, stock, sentimentResult, portfolio) {
  switch (agentId) {
    case "A1_TECHNICAL":
      return `Momentum and volume say the tape is ${stock.volumeSurgeRatio >= 1.4 ? "expanding" : "not expanding"}: RSI(14) ${stock.technicalMetrics.rsi14}, volume ${stock.volumeSurgeRatio}× the 20-day median.`;
    case "A2_FUNDAMENTAL_RAG":
      return `The retrieved disclosure supports the operating picture: P/E ${stock.peRatio} against a tracked-universe median of ${stock.sectorMedianPE}.`;
    case "A3_SENTIMENT_FLOW":
      return `Institutional flow is ${sentimentResult.metrics.fiiFlow} (FII) and ${sentimentResult.metrics.diiFlow} (DII), PCR ${sentimentResult.metrics.pcrRatio}.`;
    case "A4_PORTFOLIO_RISK":
      return `Your portfolio already carries ${portfolio.maxSector.name} at ${pct(portfolio.maxSector.weight)} with HHI ${portfolio.hhi.toFixed(3)}.`;
    default:
      return "";
  }
}

/** A table of everything the pipeline computed, with the derivation on record. */
function buildComputedPool({ portfolio, trade, synthesis, metrics }) {
  const push = (arr, value, label) => {
    if (Number.isFinite(value)) {
      arr.push({ value, label });
      if (value > 0 && value <= 1) arr.push({ value: Number((value * 100).toFixed(2)), label: `${label} as percent` });
    }
  };
  const pool = [];
  push(pool, portfolio.totalValue, "portfolio total value");
  push(pool, portfolio.equityValue, "portfolio equity value");
  push(pool, portfolio.positions.length, "position count");
  push(pool, portfolio.hhi, "portfolio HHI");
  push(pool, portfolio.betaWeighted, "beta-weighted exposure");
  push(pool, portfolio.maxSector.weight, "largest sector weight");
  portfolio.sectorEntries.forEach(([name, w]) => push(pool, w, `${name} weight`));
  push(pool, trade.sectorBefore, "sector weight before trade");
  push(pool, trade.sectorAfter, "sector weight after trade");
  push(pool, trade.sectorCap, "profile sector cap");
  push(pool, trade.hhiBefore, "HHI before trade");
  push(pool, trade.hhiAfter, "HHI after trade");
  push(pool, trade.amount, "suggested trade size");
  push(pool, synthesis.entryPrice, "reference price");
  push(pool, synthesis.targetPrice, "target objective");
  push(pool, synthesis.stopLossPrice, "stop-loss guardrail");
  push(pool, Math.round(synthesis.entryPrice * 0.98), "dip entry, reference price × 0.98");
  push(pool, synthesis.weightedScore, "weighted score");
  push(pool, synthesis.consolidatedConfidence, "consolidated confidence");
  push(pool, -trade.sectorCap, "sector cap, negative form");
  (trade.stress || []).forEach((s) => {
    push(pool, s.impactPct, `${s.label} impact`);
    push(pool, s.impactInr, `${s.label} impact in currency`);
  });
  Object.values(metrics.latency_ms.per_agent).forEach((ms) => push(pool, ms, "measured agent latency"));
  push(pool, metrics.latency_ms.total, "measured total latency");
  return pool;
}

/**
 * Build the full analysis object for one market snapshot, one investor and one
 * risk appetite.
 */
export function buildAnalysis({
  stock: stockInput,
  engine,
  riskAppetite,
  user,
  isDegraded = false,
  forcedConflict = false
}) {
  const stock = engine.stock || stockInput;
  const profile = profileForAppetite(riskAppetite);
  const { technicalResult, fundamentalResult, sentimentResult, totalMs } = engine;

  const synthesis = synthesizeAgents({
    stock,
    technicalResult,
    fundamentalResult,
    sentimentResult,
    riskProfile: profile.baseId,
    isDegraded
  });

  const portfolio = analysePortfolio(user);
  const behaviour = behaviouralTilt(user);

  // Position sizing before verification, so the verifier can validate the
  // figures the verdict quotes.
  const suggestedSize =
    Math.round(
      Math.min(
        profile.maxTradeInr,
        portfolio.totalValue * 0.08,
        Math.max(0, (profile.perEquityCap - portfolio.weightOf(stock.symbol)) * portfolio.totalValue)
      ) / 500
    ) * 500;

  const tradeAmount = Math.max(5000, suggestedSize);
  const trade = evaluateTrade({ user, symbol: stock.symbol, amount: tradeAmount, profileId: profile.baseId });

  const latency = {
    total: totalMs,
    per_agent: {
      A1_TECHNICAL: technicalResult.executionTimeMs,
      A2_FUNDAMENTAL_RAG: fundamentalResult.executionTimeMs,
      A3_SENTIMENT_FLOW: sentimentResult.executionTimeMs
    }
  };

  const computedPool = buildComputedPool({
    portfolio,
    trade,
    synthesis,
    metrics: { latency_ms: latency }
  });

  // ── Source objects ───────────────────────────────────────────────────────
  const marketQuote = marketSourceQuote(stock);
  const flowQuote = flowSourceQuote(sentimentResult);
  const pfQuote = portfolioSourceQuote(portfolio, user);

  // ── Evidence ledger ──────────────────────────────────────────────────────
  const ledger = [];
  let claimSeq = 0;
  const nextId = () => `c${(claimSeq += 1)}`;

  (fundamentalResult.citations || []).forEach((cite) => {
    const c = normalizeCitation(cite);
    const audit = auditText(c.claim, [documentSourceText(cite)], computedPool);
    ledger.push({
      claim_id: nextId(),
      agent_id: "A2_FUNDAMENTAL_RAG",
      text: c.claim,
      citation: `${c.title} · ${c.chunk_id}`,
      citation_short: c.chunk_id,
      doc_id: c.doc_id,
      regulator: c.regulator,
      filed_at: c.filed_at,
      url: c.url,
      quote: c.passage,
      span: resolveSpan(cite),
      verified: audit.unsupported.length === 0,
      method: audit.unsupported.length === 0 ? "NUMERIC_MATCH" : "UNSUPPORTED",
      unsupported: audit.unsupported
    });
  });

  const t = stock.technicalMetrics;
  const techClaim = `RSI(14) at ${t.rsi14}; price ₹${stock.price} against 50-DMA ₹${t.dma50} and 200-DMA ₹${t.dma200}; volume ${stock.volumeSurgeRatio}× the 20-day median.`;
  ledger.push({
    claim_id: nextId(),
    agent_id: "A1_TECHNICAL",
    text: techClaim,
    citation: `Market snapshot · ${stock.symbol} · ${stock.exchange}`,
    citation_short: "MARKET_SNAPSHOT",
    quote: marketQuote,
    verified: auditText(techClaim, [marketQuote], computedPool).unsupported.length === 0,
    method: "NUMERIC_MATCH",
    unsupported: []
  });

  const flowClaim = `FII net flow ${sentimentResult.metrics.fiiFlow}; DII net flow ${sentimentResult.metrics.diiFlow}; PCR ${sentimentResult.metrics.pcrRatio}; sentiment ${sentimentResult.metrics.sentimentScore}/100.`;
  ledger.push({
    claim_id: nextId(),
    agent_id: "A3_SENTIMENT_FLOW",
    text: flowClaim,
    citation: "Institutional tape snapshot · FII/DII and derivatives",
    citation_short: "FLOW_SNAPSHOT",
    quote: flowQuote,
    verified: auditText(flowClaim, [flowQuote], computedPool).unsupported.length === 0,
    method: "NUMERIC_MATCH",
    unsupported: []
  });

  const pfClaim = `Portfolio HHI ${portfolio.hhi.toFixed(3)} (${portfolio.hhiLabel}); largest sector ${portfolio.maxSector.name} ${pct(portfolio.maxSector.weight)}; beta-weighted exposure ${portfolio.betaWeighted.toFixed(2)}.`;
  ledger.push({
    claim_id: nextId(),
    agent_id: "A4_PORTFOLIO_RISK",
    text: pfClaim,
    citation: `Portfolio snapshot · ${user.name}`,
    citation_short: "PORTFOLIO_SNAPSHOT",
    quote: pfQuote,
    verified: auditText(pfClaim, [pfQuote], computedPool).unsupported.length === 0,
    method: "COMPUTED",
    unsupported: []
  });

  // ── Audit the prose the investor actually reads ──────────────────────────
  const sourceUnion = [
    marketQuote,
    flowQuote,
    pfQuote,
    ...(fundamentalResult.citations || []).map(documentSourceText)
  ];

  const compliancePreview = scanCompliance([synthesis.actionSummary]);

  const agentAudits = {};
  const agentResults = {
    A1_TECHNICAL: technicalResult,
    A2_FUNDAMENTAL_RAG: fundamentalResult,
    A3_SENTIMENT_FLOW: sentimentResult
  };
  const agentTexts = {
    A1_TECHNICAL: technicalResult.reasoning,
    A2_FUNDAMENTAL_RAG: fundamentalResult.reasoning,
    A3_SENTIMENT_FLOW: sentimentResult.reasoning
  };

  const auditNotes = [];
  Object.entries(agentTexts).forEach(([id, text]) => {
    if (agentResults[id].status !== "HEALTHY") {
      // A degraded agent asserts no market figures at all — that is the whole
      // point of the fallback, so there is nothing to verify and nothing to flag.
      agentAudits[id] = { checked: 0, verified: 0, computed: [], unsupported: [], skipped: "no market figures asserted in a degraded state" };
      auditNotes.push(`${id} returned ${agentResults[id].status}: narration states the fallback only, no market figures asserted.`);
      return;
    }
    agentAudits[id] = auditText(text, sourceUnion, computedPool);
  });

  agentAudits.VERDICT = auditText(compliancePreview.cleaned[0], sourceUnion, computedPool);

  const penaltyFor = (id) => {
    const a = agentAudits[id];
    if (!a || !a.unsupported?.length) return 1;
    return Math.max(0.15, Math.pow(0.6, a.unsupported.length));
  };

  // ── Conflict + arbitration ───────────────────────────────────────────────
  const agentSignals = [
    { agent_id: "A1_TECHNICAL", signal: technicalResult.signal, weight: profile.weights.technical },
    { agent_id: "A2_FUNDAMENTAL_RAG", signal: fundamentalResult.signal, weight: profile.weights.fundamental },
    { agent_id: "A3_SENTIMENT_FLOW", signal: sentimentResult.signal, weight: profile.weights.sentiment }
  ];
  const detected = detectConflict(agentSignals);

  const alternatives = PROFILE_IDS.filter((id) => id !== profile.baseId).map((id) => {
    const alt = synthesizeAgents({ stock, technicalResult, fundamentalResult, sentimentResult, riskProfile: id, isDegraded });
    return { profileId: id, label: alt.finalVerdict, badge: alt.verdictBadge, score: alt.weightedScore };
  });

  let conflict = { detected: false };
  if (detected.detected || forcedConflict) {
    const pair = detected.pairs[0] || detected.bestPair;
    const policyAgent =
      profile.weights.fundamental > profile.weights.technical
        ? "audited balance-sheet evidence (A2) is weighted above short-term price and volume momentum (A1)"
        : "immediate price and volume evidence (A1) is weighted above audited fundamentals (A2)";

    conflict = {
      detected: true,
      forced: forcedConflict && !detected.detected,
      max_polarity_gap: detected.detected ? detected.maxGap : pair?.gap ?? null,
      threshold: CONFLICT_THRESHOLD,
      above_threshold: detected.detected,
      pairs: detected.pairs,
      dominant_agent: agentSignals.reduce((best, a) => (a.weight > best.weight ? a : best), agentSignals[0]).agent_id,
      debate: pair
        ? [
            { speaker: pair.a, signal: pair.signals[0], statement: statementFor(pair.a, stock, sentimentResult, portfolio), rebuts: pair.b },
            { speaker: pair.b, signal: pair.signals[1], statement: statementFor(pair.b, stock, sentimentResult, portfolio), rebuts: pair.a }
          ]
        : [],
      policy_applied: `Under ${profile.name}, ${policyAgent}; the divergence of ${
        pair ? pair.gap.toFixed(2) : "0.00"
      } on a −1…+1 polarity scale${
        detected.detected ? " exceeds" : ` is below the ${CONFLICT_THRESHOLD} threshold but was forced`
      } and is resolved without discarding the minority view.`,
      rejected_verdicts: alternatives.map((a) => `${a.profileId}: ${a.label} (score ${a.score})`),
      minority_note: `${pair.b} stays on record and is re-checked on the next run.${detected.detected ? "" : " This run is a forced scenario for demonstration."}`,
      flip_tested: true,
      flip_conditions: flipConditions(stock)
    };
  }

  const portfolioImpact = {
    suggested_trade_inr: tradeAmount,
    hhi_before: trade.hhiBefore,
    hhi_after: trade.hhiAfter,
    hhi_label_before: trade.hhiLabelBefore,
    hhi_label_after: trade.hhiLabelAfter,
    sector: trade.sector,
    sector_before: trade.sectorBefore,
    sector_after: trade.sectorAfter,
    sector_cap: trade.sectorCap,
    weight_before: trade.weightBefore,
    weight_after: trade.weightAfter,
    breach: trade.breach,
    breach_reason: trade.reason,
    suitability: trade.suitability,
    alternative: trade.alternative,
    stress_test: trade.stress
  };

  // ── Honest degraded / provenance state ───────────────────────────────────
  const sources = {
    price: isDegraded ? "CACHED" : "SIMULATED",
    volume: isDegraded ? "UNAVAILABLE" : "SIMULATED",
    filings: isDegraded || fundamentalResult.status !== "HEALTHY" ? "UNAVAILABLE" : "SYNTHETIC",
    flows: isDegraded ? "UNAVAILABLE" : "SIMULATED",
    portfolio: "COMPUTED"
  };

  const mitigations = [];
  if (isDegraded) {
    mitigations.push("Consolidated confidence capped for the whole run.");
    mitigations.push("Fundamental agent returned INSUFFICIENT_EVIDENCE — no filing was retrieved, so no document claim exists.");
    mitigations.push("Verdict fell back to capital preservation; no uncited figure was rendered.");
  }
  auditNotes.forEach((n) => mitigations.push(n));
  Object.entries(agentAudits).forEach(([id, a]) => {
    if (a.unsupported?.length) {
      mitigations.push(
        `${id}: ${a.unsupported.length} figure(s) found in no source and no recorded computation (${a.unsupported.join(", ")}) — struck through in the UI and excluded from confidence.`
      );
    }
  });

  const verifiedCount = ledger.filter((l) => l.verified).length;
  const coverage = ledger.length ? (verifiedCount / ledger.length) * 100 : 0;
  const unsupportedFigures = Object.values(agentAudits).reduce((n, a) => n + (a.unsupported?.length || 0), 0);

  const confidenceAdjust =
    penaltyFor("A1_TECHNICAL") * penaltyFor("A2_FUNDAMENTAL_RAG") * penaltyFor("A3_SENTIMENT_FLOW");
  const consolidatedConfidence = Math.round(
    synthesis.consolidatedConfidence * Math.max(0.5, Math.min(1, confidenceAdjust))
  );

  return {
    run_id: `run-${stock.symbol}-${Date.now().toString(36)}`,
    symbol: stock.symbol,
    symbol_name: stock.name,
    sector: stock.sector,
    generated_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    snapshot_id: new Date().toISOString().slice(0, 10),
    engine: {
      kind: "fixture",
      note: "Deterministic local engine. Latencies are measured local compute time, not network agent latency. The API path reports true per-agent latency when VITE_API_MODE=on."
    },
    profile: {
      id: profile.id,
      base_id: profile.baseId,
      name: profile.name,
      weights: profile.weights,
      stop_loss_percent: profile.stopLossPercent,
      target_horizon: profile.targetHorizon,
      per_equity_cap: profile.perEquityCap,
      sector_cap: profile.sectorCap,
      max_trade_inr: profile.maxTradeInr,
      appetite: riskAppetite
    },
    agents: [
      envelope("A1_TECHNICAL", technicalResult, agentAudits.A1_TECHNICAL, "green"),
      envelope("A2_FUNDAMENTAL_RAG", fundamentalResult, agentAudits.A2_FUNDAMENTAL_RAG, "lav"),
      envelope("A3_SENTIMENT_FLOW", sentimentResult, agentAudits.A3_SENTIMENT_FLOW, "yellow"),
      portfolioEnvelope(portfolio, behaviour, agentAudits.A4_PORTFOLIO_RISK || { checked: 0, verified: 0, unsupported: [] }, computedPool, pfQuote, user)
    ],
    verdict: {
      label: synthesis.finalVerdict,
      badge: synthesis.verdictBadge,
      score: synthesis.weightedScore,
      confidence: consolidatedConfidence / 100,
      entry: synthesis.entryPrice,
      target: synthesis.targetPrice,
      stop_loss: synthesis.stopLossPrice,
      horizon: profile.targetHorizon,
      position_size_inr: tradeAmount,
      summary: compliancePreview.cleaned[0]
    },
    evidence_ledger: ledger,
    verification_summary: {
      claims_total: ledger.length,
      claims_verified: verifiedCount,
      unsupported: unsupportedFigures,
      coverage_pct: Number(coverage.toFixed(1)),
      suppressed: Object.entries(agentAudits).flatMap(([id, a]) =>
        (a.unsupported || []).map((u) => `${id}: ${u}`)
      ),
      computed_figures: Object.values(agentAudits).reduce((n, a) => n + (a.computed?.length || 0), 0)
    },
    conflict,
    portfolio_impact: portfolioImpact,
    portfolio,
    behaviour,
    compliance: {
      prohibited_phrases_blocked: compliancePreview.hits.length,
      blocked_phrases: compliancePreview.hits,
      classification: "RESEARCH_EDUCATION_NOT_ADVICE",
      disclosure: AI_DISCLOSURE
    },
    degraded: {
      active: isDegraded,
      sources,
      mitigations,
      fallback_mode: isDegraded ? "CONSERVATIVE_HOLD" : null
    },
    metrics: {
      latency_ms: latency,
      cost_usd: 0,
      signal: technicalResult.signal,
      confidence: consolidatedConfidence / 100,
      risk_concentration: { hhi: portfolio.hhi, label: portfolio.hhiLabel, max_sector: portfolio.maxSector },
      calibration: null,
      forward_return_check: {
        window_days: 30,
        status: "PENDING",
        resolves_on: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        note: "Resolved against realised forward returns by the backtest harness; not asserted until measured."
      },
      retrieval: null,
      evidence_coverage_pct: Number(coverage.toFixed(1)),
      unsupported_figures: unsupportedFigures
    },
    alternatives,
    citations: fundamentalResult.citations || [],
    riskProfiles: RISK_PROFILES
  };
}

function envelope(agentId, result, audit, tone) {
  return {
    agent_id: agentId,
    agent_name: result.agentName,
    role: result.role,
    status: result.status,
    signal: result.signal,
    score: POLARITY[result.signal] !== undefined ? Math.round((POLARITY[result.signal] + 1) * 50) : null,
    confidence: result.confidence,
    confidence_basis: {
      signal_strength: Math.abs(POLARITY[result.signal] ?? 0),
      evidence_support: audit.checked ? audit.verified / audit.checked : 0,
      agreement: null,
      data_freshness: result.status === "HEALTHY" ? 1 : 0.3
    },
    tone,
    reasoning: result.reasoning,
    action: result.actionRecommendation,
    metrics: result.metrics,
    audit,
    execution: result.execution,
    executionTimeMs: result.executionTimeMs,
    error: result.error || null
  };
}

function portfolioEnvelope(portfolio, behaviour, audit, computedPool, quote, user) {
  const reasoning = `Portfolio of ${portfolio.positions.length} positions worth ₹${Math.round(
    portfolio.totalValue
  ).toLocaleString("en-IN")}. HHI ${portfolio.hhi.toFixed(3)} (${portfolio.hhiLabel}); largest sector ${
    portfolio.maxSector.name
  } at ${pct(portfolio.maxSector.weight)}; beta-weighted exposure ${portfolio.betaWeighted.toFixed(2)}. Realized behaviour: ${behaviour.tilt}.`;

  return {
    agent_id: "A4_PORTFOLIO_RISK",
    agent_name: "Portfolio & Risk Agent",
    role: "Concentration, Exposure & Suitability Screener",
    status: "HEALTHY",
    signal: portfolio.hhi > 0.25 ? "CONCENTRATION_BREACH" : "BALANCED",
    score: Math.round(Math.max(0, 100 - portfolio.hhi * 100)),
    confidence: 0.95,
    confidence_basis: { signal_strength: 0.95, evidence_support: 1, agreement: null, data_freshness: 1 },
    tone: "lilac",
    reasoning,
    action: behaviour.realizedAggressive ? "REVIEW_GUARDRAILS" : "MAINTAIN_ALLOCATION",
    metrics: {
      hhi: portfolio.hhi.toFixed(3),
      hhiLabel: portfolio.hhiLabel,
      maxSector: `${portfolio.maxSector.name} ${pct(portfolio.maxSector.weight)}`,
      betaWeighted: portfolio.betaWeighted.toFixed(2),
      positions: portfolio.positions.length
    },
    audit: auditText(reasoning, [quote], computedPool),
    execution: { latency_ms: 1, model: "local-deterministic", cached: false, attempts: 1, measured: "local compute, wall clock" },
    executionTimeMs: 1,
    error: null,
    owner: user.name
  };
}

export function profileLabel(profileId) {
  return (RISK_PROFILES[profileId] || RISK_PROFILES.BALANCED).name;
}

export function currentUser(userId) {
  return getUser(userId);
}

export function quoteFor(symbol) {
  return priceFor(symbol, STOCKS_DATA);
}

export { getProfile };
