/**
 * Analysis smoke test — run with: npm run check:analysis
 *
 * This exercises the domain layer without a browser and asserts the behaviours
 * the problem statement asks for, so a regression fails loudly instead of
 * silently changing what the dashboard claims:
 *
 *   1. verification      every figure in a nominal run traces to a source
 *   2. degraded path     no uncited FACT, mitigations recorded, pipeline survives
 *   3. conflict           the polarity detector actually fires on real inputs
 *   4. personalization    identical market input → different verdicts per investor
 *   5. suitability        the portfolio gate can block a trade
 */
import { STOCKS_DATA } from "../src/data/stocksData.js";
import { USERS } from "../src/data/portfolios.js";
import { RAG_CORPUS, flattenCorpus } from "../src/data/ragCorpus.js";
import { runEngine, buildAnalysis, resolveSpan } from "../src/domain/analysis.js";

const failures = [];
const notes = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const SYMBOLS = Object.keys(STOCKS_DATA);

// ── 0: corpus integrity — a citation must contain the text it cites ───────
const docs = flattenCorpus(RAG_CORPUS);
check(docs.length >= 6, `corpus has only ${docs.length} documents`);
docs.forEach((d) => {
  const at = d.fullExcerpt.indexOf(d.highlightQuote);
  check(
    at >= 0,
    `corpus ${d.id}: highlightQuote is not a verbatim span of fullExcerpt, so the citation cannot be highlighted or verified`
  );
  if (at >= 0) {
    const span = resolveSpan({ fullExcerpt: d.fullExcerpt, highlightQuote: d.highlightQuote });
    check(Array.isArray(span) && span[0] === at, `corpus ${d.id}: resolveSpan disagrees with indexOf`);
  }
  check(d.synthetic === true, `corpus ${d.id}: synthetic disclosures must be flagged so the UI can disclose them`);
  check(Boolean(d.sourceUrl), `corpus ${d.id}: missing source URL`);
});
notes.push(`corpus: ${docs.length} documents across ${Object.keys(RAG_CORPUS).length} issuers, ${docs.length} span-checked`);

// ── 1 + 2: verification and degradation across the whole matrix ───────────
let coveredRuns = 0;
let conflictRuns = 0;
let blockedRuns = 0;

for (const symbol of SYMBOLS) {
  const stock = STOCKS_DATA[symbol];
  const engine = runEngine({ stock });

  for (const user of USERS) {
    const nominal = buildAnalysis({ stock, engine, riskAppetite: user.riskAppetite, user });

    check(
      nominal.verification_summary.unsupported === 0,
      `${symbol}/${user.id}: ${nominal.verification_summary.unsupported} unsupported figure(s) in a nominal run → ${nominal.verification_summary.suppressed.join(" | ")}`
    );
    check(
      nominal.verification_summary.coverage_pct === 100,
      `${symbol}/${user.id}: coverage is ${nominal.verification_summary.coverage_pct}% (expected 100% on the nominal path)`
    );
    check(
      nominal.evidence_ledger.length >= 4,
      `${symbol}/${user.id}: expected at least 4 ledger claims, got ${nominal.evidence_ledger.length}`
    );
    check(
      nominal.evidence_ledger.every((c) => c.quote && c.quote.length > 20),
      `${symbol}/${user.id}: a ledger claim has no visible source passage`
    );
    coveredRuns += 1;

    if (nominal.conflict.detected) conflictRuns += 1;
    if (nominal.portfolio_impact.breach) blockedRuns += 1;
  }

  // Degraded run: must not crash, must not emit an uncited FACT.
  const degradedEngine = runEngine({ stock, isDegraded: true });
  const degraded = buildAnalysis({
    stock,
    engine: degradedEngine,
    riskAppetite: 6,
    user: USERS[0],
    isDegraded: true
  });

  check(degraded.degraded.active, `${symbol}: degraded run did not flag itself as degraded`);
  check(degraded.degraded.mitigations.length > 0, `${symbol}: degraded run recorded no mitigations`);
  check(
    degraded.verdict.badge === "WARNING" || degraded.verdict.confidence <= 0.6,
    `${symbol}: degraded run produced an unqualified verdict (${degraded.verdict.badge}, confidence ${degraded.verdict.confidence})`
  );
  check(
    degraded.verification_summary.unsupported === 0,
    `${symbol}: degraded run surfaced ${degraded.verification_summary.unsupported} unsupported figure(s)`
  );
  check(
    degraded.verification_summary.coverage_pct === 100,
    `${symbol}: degraded run coverage is ${degraded.verification_summary.coverage_pct}%`
  );
}

// ── 3: the conflict detector must be able to fire ─────────────────────────
check(conflictRuns > 0, "the polarity conflict detector never fired on any shipped security");

// ── 4: identical input, different investor → different output ─────────────
const stock = STOCKS_DATA.HDFCBANK;
const engine = runEngine({ stock });
const verdicts = USERS.map((u) => {
  const a = buildAnalysis({ stock, engine, riskAppetite: u.riskAppetite, user: u });
  return { user: u.id, appetite: u.riskAppetite, label: a.verdict.label, score: a.verdict.score, size: a.portfolio_impact.suggested_trade_inr, suitability: a.portfolio_impact.suitability };
});

check(
  new Set(verdicts.map((v) => v.label)).size > 1,
  `personalization failed: all three investors received the same verdict (${verdicts.map((v) => v.label).join(" / ")})`
);
check(
  new Set(verdicts.map((v) => v.suitability)).size > 1,
  `portfolio gating failed: every investor got the same suitability (${verdicts.map((v) => v.suitability).join(" / ")})`
);
notes.push(
  `personalization on ${stock.symbol}: ${verdicts.map((v) => `${v.user}(appetite ${v.appetite}) → ${v.label} [${v.suitability}]`).join(" | ")}`
);

// ── 5: the suitability gate can block ─────────────────────────────────────
check(blockedRuns > 0, "the suitability gate never blocked a trade across the whole matrix");
notes.push(`suitability blocks observed across the matrix: ${blockedRuns}`);
notes.push(`conflict runs observed: ${conflictRuns} of ${coveredRuns}`);

// ── Report ───────────────────────────────────────────────────────────────
console.log(`\nVibeFinance analysis smoke test — ${coveredRuns} nominal runs, ${SYMBOLS.length} degraded runs\n`);
notes.forEach((n) => console.log(`  · ${n}`));

if (failures.length) {
  console.error(`\n${failures.length} assertion failure(s):\n`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}

console.log("\n✓ all assertions passed\n");
