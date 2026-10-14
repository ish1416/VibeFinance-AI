# VibeFinance AI — Technical Plan

Companion to `00-WIN-PLAN.md` (strategy) and `02-UI-RESTYLE-PLAN.md` (design system).
Everything here is specified so three people can work in parallel without blocking each other.

---

## 1. Target topology

```
┌─────────────────────────────── Browser (React 19 + Vite) ───────────────────────────────┐
│  AppFrame / TopNav / IconRail / Dashboard / SidePanel / Dock        ← new design system   │
│  api.ts ──┬── fetch(JSON)  → /api/*          (real path)                                  │
│           ├── EventSource  → /api/analyze/stream?run_id=…   (live agent events)            │
│           └── fixtures/*.json when NEXT_PUBLIC_API=off      (DEMO mode, never fails)       │
└──────────────────────────────────────────┬───────────────────────────────────────────────┘
                                           │ HTTP + SSE
┌──────────────────────────────────────────▼─────────────────────── Python 3.11 / FastAPI ──┐
│  routers/  market · analyze · corpus · portfolio · decisions · metrics · eval · audit      │
│                                                                                            │
│  orchestrator.py                                                                            │
│    ├─ asyncio.gather( A1 technical, A2 fundamental-rag, A3 sentiment-flow, A4 portfolio )   │
│    │     per-agent timeout 12s · independent failure isolation · emits SSE events           │
│    ├─ synthesis.py  deterministic scoring + conflict detector + arbiter + calibration       │
│    ├─ verify.py     claim ↔ retrieved-span verification (numeric match / quote support)     │
│    └─ compliance.py prohibited-phrase filter + suitability gate + AI-use disclosure         │
│                                                                                            │
│  llm/client.py   Gemini Flash (primary) → Groq (fallback) → deterministic template          │
│                  JSON-schema-constrained · 8s timeout · 2 retries · disk cache by prompt hash│
│  rag/            chunker · bm25 · embeddings · hybrid retrieve · rerank                     │
│  data/           snapshots · corpus · index · eval (all committed artifacts)                 │
│  store/          SQLite (users, profiles, portfolios, holdings, watchlist, decisions, runs)   │
└────────────────────────────────────────────────────────────────────────────────────────────┘
        pipeline/ (offline, run once, committed output)
          ingest_market.py   → data/snapshots/<date>/<SYMBOL>.json
          build_corpus.py    → data/corpus/chunks.jsonl
          embed.py           → data/index/{vectors.npy,meta.json,bm25.pkl}
          eval/backtest.py   → data/eval/report.json + reliability.svg
```

**Interface to the previous version:** the current `src/agents/*.js` logic is *ported*, not thrown away —
the indicator math and the weighted-score/guardrail policy move to Python, and the JS modules are replaced
by API calls plus a fixture path. `RISK_PROFILES` (`synthesisEngine.js:2-36`) becomes `data/profiles.json`
so both sides read one source of truth.

**Service choices** (Gravity Index + free-tier research; all no-cost for this build):

| Need | Choice | Why | Fallback |
|---|---|---|---|
| LLM inference | **Google Gemini Flash** (`generateContent`, `responseSchema` for strict JSON) | Free tier, native structured output, strong at extraction | Groq (fast, free tier) → deterministic templates |
| Embeddings | **MiniLM-L6-v2 run locally** (`sentence-transformers`/`fastembed`), vectors committed | No key, no quota, deterministic, works offline during judging | Gemini/Cohere embeddings if quota allows |
| Vector store | **NumPy matrix + BM25** for ~1–3k chunks; **MongoDB Atlas M0** (free forever, built-in Vector Search, no card) if we want a labelled vector DB | M0 is a 10-minute setup and gives the "vector database" optional-extension checkbox with a screenshot | Local index alone |
| Market data | **yfinance** (`RELIANCE.NS`, …) for OHLCV history, labelled `DELAYED`; optional **Upstox read-only Analytics Token** for a genuine `LIVE` label | Zero keys to start; Upstox token is free and read-only if a teammate sets it up | Committed snapshot artifacts |
| Persistence | **SQLite** (stdlib) | Zero setup, file-based, survives the demo, judge-inspectable | — |
| Hosting | **Freebuff Sites / Cloudflare Workers** for the static frontend; **Render free** for the FastAPI service (accept cold start, warm it before judging) | Both free; Workers handles static + tiny proxy | ngrok/LAN demo + local backend |

Never put provider or broker keys in the frontend bundle. All keys live server-side in `.env`
(ship `.env.example` only).

---

## 2. Data policy — what is real, what is simulated, and how we label it

The problem statement explicitly permits simulated data **if limitations are disclosed**; the fatal move is
disclosing nothing and claiming "live NSE". Every source carries a provenance record:

```json
{ "source": "yfinance", "kind": "DELAYED|LIVE|SYNTHETIC|CACHED",
  "fetched_at": "2026-10-14T16:52:11+05:30", "as_of": "2026-10-13",
  "url": "…", "checksum": "sha256:…" }
```

The UI renders a freshness badge per source (`LIVE` • green / `DELAYED 17m` • yellow / `UNAVAILABLE` • red).
The README gets a **Limitations & Disclosure** section listing exactly what is synthetic (the filings
corpus) and what is real (prices, indicators, computed metrics).

---

## 3. Frozen contracts (Block 0 — write these first, everything else codes against them)

### 3.1 Agent output envelope — `schemas/agent.schema.json`

```jsonc
{
  "agent_id": "A1_TECHNICAL",              // A1_TECHNICAL | A2_FUNDAMENTAL_RAG | A3_SENTIMENT_FLOW | A4_PORTFOLIO_RISK
  "agent_name": "Technical Momentum Agent",
  "role": "Price Action & Volume Screener",
  "status": "HEALTHY",                     // HEALTHY | DEGRADED | INSUFFICIENT_EVIDENCE | FAILED
  "signal": "MILD_BULLISH",                // closed enum, mirrored in constants.py
  "score": 75,                             // 0..100, deterministic
  "confidence": 0.78,                      // 0..1, and it must be *calibrated* (see §7)
  "confidence_basis": {                    // so confidence is never a bare constant
    "signal_strength": 0.86, "evidence_support": 0.80,
    "agreement": 0.70, "data_freshness": 1.0
  },
  "evidence": [                            // may be empty only when status != HEALTHY
    { "claim_id": "c1",
      "claim": "Consolidated EBITDA for the quarter stood at ₹42,748 crore, up 2.0% YoY.",
      "claim_type": "FACT",                // FACT | INFERENCE
      "source": { "doc_id": "RIL_SEBI_Q1FY25", "chunk_id": "RIL_SEBI_Q1FY25#104",
                  "page": 3, "section": "Segmental Results",
                  "filed_at": "2024-07-22", "url": "https://…",
                  "quote": "…verbatim passage…", "span": [412, 561] },
      "verification": { "method": "NUMERIC_MATCH", "passed": true, "detail": "₹42,748 Cr found in span" } }
  ],
  "metrics": { "rsi14": 68.4, "volume_z": 2.31, "atr14": 41.2, "dma50": 2840.1, "dma200": 2615.4 },
  "reasoning": "…",                        // LLM narration; must not contain an unverified number
  "action": "ACCUMULATE_ON_PULLBACK",
  "execution": { "latency_ms": 1204, "model": "gemini-flash", "prompt_tokens": 812,
                 "completion_tokens": 244, "cached": false, "attempts": 1 },
  "error": null
}
```

Orchestrator rule: an agent that fails throws inside its own task; the envelope still comes back with
`status: "FAILED"`, `confidence: 0.0`, `evidence: []`, and a human-readable `error`. **The pipeline never
crashes and never emits an uncited FACT.** A validator (`pydantic`) rejects malformed LLM output and
triggers one repair retry, then the deterministic fallback for that agent only.

### 3.2 Analysis (synthesis) response — `schemas/analysis.schema.json`

```jsonc
{
  "run_id": "…", "symbol": "RELIANCE", "generated_at": "…", "snapshot_id": "2026-10-14",
  "profile": { "id": "BALANCED", "name": "Balanced Growth", "weights": {"technical":0.35,"fundamental":0.40,"sentiment":0.25} },
  "agents": [ /* four envelopes */ ],
  "verdict": { "label": "BUY (HIGH CONVICTION)", "badge": "BUY", "score": 86, "confidence": 0.87,
               "entry": 2942.5, "target": 3296, "stop_loss": 2810,
               "horizon": "6-12 Months", "position_size_inr": 25000 },
  "evidence_ledger": [ { "claim_id": "c1", "text": "…", "citation": "RIL_SEBI_Q1FY25#104", "verified": true } ],
  "verification_summary": { "claims_total": 12, "claims_verified": 11, "unsupported": 1,
                            "coverage_pct": 91.7, "suppressed": ["…"] },
  "conflict": { "detected": true, "pairs": [ {"a":"A1_TECHNICAL","b":"A2_FUNDAMENTAL_RAG","gap":42} ],
                "debate": [ {"speaker":"A1_TECHNICAL","statement":"…","rebuts":"A2_FUNDAMENTAL_RAG"} ],
                "policy_applied": "Balanced weights audited balance-sheet evidence above 3-day momentum",
                "rejected_verdicts": ["TRIM / AVOID"],
                "flip_conditions": ["RSI(14) closes below 55", "volume < 0.8× 20-day median"] },
  "portfolio_impact": { "hhi_before": 0.14, "hhi_after": 0.19, "sector_before": 0.18, "sector_after": 0.24,
                        "sector_cap": 0.20, "breach": true, "stress_test": {"nifty_minus_3pct": -0.021},
                        "alternative": "INFY", "suitability": "BLOCKED_BY_SECTOR_CAP" },
  "compliance": { "prohibited_phrases_blocked": 2, "disclosure": "AI-generated research…",
                  "classification": "RESEARCH_EDUCATION_NOT_ADVICE" },
  "degraded": { "active": false, "sources": { "price": "LIVE", "volume": "LIVE", "filings": "UNAVAILABLE" },
                "mitigations": ["A2 confidence capped at 0.44", "capital preservation guardrail enforced"],
                "fallback_mode": "CONSERVATIVE_HOLD" },
  "metrics": { "latency_ms": {"total": 3820, "p50": 2810, "p95": 5400, "per_agent": {}},
               "cost_usd": 0.00042, "signal": "MILD_BULLISH", "confidence": 0.87,
               "risk_concentration": {"hhi": 0.19, "label": "MODERATE"},
               "calibration": { "brier_24m": 0.142, "bin": "0.8-0.9", "observed_hit_rate": 0.79 },
               "forward_return_check": { "window_days": 30, "status": "PENDING|RESOLVED", "realized_pct": null } }
}
```

`metrics.forward_return_check` is the honest version of "30-day signal accuracy": for a historical run we
show the *realized* forward return; for today's live run we show `PENDING` with the resolution date. That
single field turns a fabricated percentage into a defensible methodology.

---

## 4. Pipeline (offline, run once, artifacts committed)

### 4.1 `pipeline/ingest_market.py`
- Symbols: the existing 4 (`RELIANCE`, `INFY`, `HDFCBANK`, `TATAMOTORS`) + add 6–8 more across sectors
  (e.g. `ITC`, `SUNPHARMA`, `LT`, `AXISBANK`, `MARUTI`, `BHARTIARTL`) — signal classification needs breadth;
  a screener over 10 names reads as a product, over 4 as a demo.
- Pull ≥ 500 daily bars via yfinance → compute **in code, versioned**: RSI(14), MACD(12,26,9), DMA50,
  DMA200, ATR(14), Bollinger(20,2), volume z-score vs 20-day median, 52-week range percentile, 30-day
  realized volatility, beta vs NIFTY 50.
- Emit `data/snapshots/<YYYY-MM-DD>/<SYMBOL>.json`: identity, quotes, `indicators`, last 90 candles,
  `provenance` (§2), `peRatio`, `marketCap`, sector, market-cap band.
- Keep the last ~120 snapshots so §7 can replay point-in-time without look-ahead.

### 4.2 `pipeline/build_corpus.py`
Current corpus: 6 documents, ~120 lines total (`src/data/ragCorpus.js`) — too thin for retrieval to look
like retrieval, and `docs[0]`/`docs[1]` retrieval is invisible with a 2-document pool.
- Target **≥ 10 documents per symbol** (~90–100 chunks total): SEBI LODR Reg 30/33 quarterly results,
  earnings-call transcript, annual-report MD&A extract, shareholding pattern / FII-DII disclosure,
  investor presentation, credit-rating rationale, corporate-action disclosure, segment note, guidance
  revision, AGM speech.
- Synthetic-but-realistic, with **real document metadata**: issuer, regulator, filing date, page, section,
  source URL (BSE/NSE filing pages, company IR pages), and a `synthetic: true` flag.
- Add **deliberate retrieval traps** so retrieval quality is demonstrable: a similar-looking passage from a
  *different* quarter, a same-topic passage from a *different* company, and a numeric distractor
  (₹42,748 vs ₹24,748).
- Chunk with structure: 1 chunk ≈ one section, 300–800 chars, metadata-first; keep a stable
  `chunk_id = <DOC_ID>#<n>` plus exact character `span` for highlighting.

### 4.3 `pipeline/embed.py`
- Embed chunks locally (MiniLM-L6-v2) → `data/index/vectors.npy` + `meta.json`; also pickle a BM25 index.
- Hybrid retrieve = `0.6 · cosine + 0.4 · bm25_norm`, top-20 → **rerank** (Cohere rerank if keyed, else a
  cross-encoder or MMR for diversity) → top-5 passed to A2.
- Retrieval eval: for a hand-written set of 30 queries with known correct chunk ids, report
  **hit-rate@1/@5, MRR** → written to `data/eval/retrieval.json` and shown in the Metrics view. Retrieval is
  now measurably good, not asserted.

---

## 5. Agents

| Agent | Deterministic core (never LLM) | LLM's job | Degraded behaviour |
|---|---|---|---|
| **A1 Technical** | RSI/MACD/DMA/ATR/Bollinger/volume-z from the snapshot, threshold→signal rules | narrate the indicator read + flag conflicting indicators | `DEGRADED`: signal `NEUTRAL`, confidence ≤ 0.52, metrics marked `stale`, no breakout action |
| **A2 Fundamental-RAG** | hybrid retrieval (§4.3), claim extraction, **numeric verification**, valuation vs sector median | extract 3–6 claims from retrieved chunks, judge earnings quality | filings unavailable → `INSUFFICIENT_EVIDENCE`, confidence ≤ 0.44, `evidence: []`, verdict cannot upgrade |
| **A3 Sentiment-Flow** | FII/DII net flows, PCR, delivery %, news-tone lexicon | classify tone, summarise the dominant narrative | feed down → `NEUTRAL_FLOW`, confidence ≤ 0.50 |
| **A4 Portfolio-Risk** | HHI, sector weights, beta-weighted exposure, correlation, 3 stress scenarios, position sizing vs profile caps | explain the risk in plain language, propose the trim that fixes a breach | portfolio missing → `FAILED`, synthesis proceeds on A1–A3 and says so |
| **Arbiter (synthesis)** | weighted scoring, conflict detection, calibration adjustment, guardrail prices | write the decision narrative + debate rebuttals | degraded → capital-preservation verdict, confidence capped at 0.54 (existing behaviour, kept) |

Position of A4 is deliberate: it is what turns "stock verdict" into "your portfolio verdict", and it runs
concurrently so it costs no wall-clock time.

**Conflict detector fix.** Today's rule can never fire (`synthesisEngine.js:96-107`). Replace with a
signal-polarity distance on a shared scale: `polarity(signal) ∈ [-1, +1]`; conflict when
`max(pairwise |Δpolarity|) ≥ 0.8` **or** any agent's `|score − 50| ≥ 30` while another's is on the opposite
sign. Then *ship a stock that actually conflicts* — a value-trap candidate (cheap P/E, decaying momentum,
negative flow) plus a momentum-with-caution name — and expose a **Force conflict** switch in the chaos panel
for a guaranteed demo.

---

## 6. Verification layer (`verify.py`) — our signature feature

For each claim with `claim_type: FACT`:
1. **Numeric check** — extract all numbers from the claim; every number must be present in the retrieved
   span (normalised: `₹42,748 crore` ↔ `42748`, commas/units stripped, tolerance 0.5%). → `NUMERIC_MATCH`.
2. **Quote check** — the claim's key noun phrases must appear in the span (token overlap ≥ 0.7 after
   stopword removal) → `QUOTE_SUPPORTED`.
3. Otherwise → `UNSUPPORTED`: the claim is **removed from the rendered output**, `verification_summary.suppressed`
   records it, and the agent's confidence is multiplied by `0.6` per suppression (floor 0.15).
4. `coverage_pct = verified / total`. Targets: ≥ 90% coverage, unsupported count on screen (0 is fine to
   display, but the number must come from the computation).

The LLM is instructed it may only assert numbers that appear in the provided context; the verifier is what
makes that true rather than hoped for. Verify this by injecting a poisoned context in a test and asserting
the claim is suppressed.

---

## 7. Personalization, portfolio and behaviour

**Profiles** (`data/profiles.json`, ported from `RISK_PROFILES`): weights, stop-loss %, horizon, per-equity
cap, **sector cap**, max single-trade size, volatility tolerance, allowed instruments. Add fields so the
suitability gate has something to enforce.

**Users** (seed 3, distinct enough to prove personalization):
- `Aarav — Balanced`: 6 holdings, IT 34% (near the 28% cap), ₹4.2 L portfolio, no derivatives.
- `Meera — Conservative`: 4 large-cap holdings + 20% debt, 8% sector caps, dividend-focus, 78% of past
  recommendations accepted.
- `Rohan — Aggressive`: 9 holdings incl. 2 momentum names, concentrated, 41% of recommendations ignored,
  average position 2.4× his declared size → behavioural tilt `AGGRESSIVE_REALIZED`.

**Behavioural engine:** over `decisions` (accepted / ignored / skipped / exited early, with logged
position size and the recommendation's profile) compute — acceptance rate by profile, median size ratio vs
declared, early-exit ratio, response latency to alerts → a `behavioural_tilt` with a **justification
sentence quoting the user's own history**. It only *warns and reframes*; it never overrides an explicit
choice silently.

**Divergence score (D3):** for a fixed snapshot, score all three profiles → `spread = max − min`;
also report per-agent contribution deltas so the UI can say *which* weight moved the verdict. Add a
continuous `risk_appetite 1–10` that interpolates the weights between the Conservative and Aggressive
vectors, so personalization is demonstrably continuous rather than three hard buckets.

**Risk math (A4):** `HHI = Σ wᵢ²` (0–1, `>0.25` = concentrated), sector weights, beta-weighted exposure,
pairwise correlation, and stress scenarios (NIFTY −3%; FII outflow day; sector shock on the largest
exposure). All deterministic, all reproducible, all shown as numbers with formulas documented.

---

## 8. Evaluation harness (`eval/backtest.py`) — replaces the hardcoded "84.6%"

- Walk forward over ~24 months: for each month-end `t`, build the snapshot from data **only up to `t`**
  (indicator window + filings filed before `t` — point-in-time, no look-ahead; this is the integrity claim
  we must be able to defend), run the *same* code path as production, record the signal + confidence, then
  resolve `t + 30 trading days`.
- Report per signal class and per profile: **hit rate**, precision/recall/F1 over `{bullish, neutral,
  bearish}`, mean/median 30-day forward return by signal, target-price MAE, hit rate by confidence bin,
  **Brier score** and a **reliability diagram** (`data/eval/reliability.svg`).
- Latency/cost: p50/p95 per agent and end-to-end, tokens and cost per analysis, and a small load test
  (1 / 3 / 10 concurrent runs) → `data/eval/latency.json`. This is the optional extension "report
  end-to-end latency under different workloads".
- **Calibration:** if the reliability diagram shows over-confidence (it will), apply a monotone mapping
  (isotonic or a simple 2-point linear shrink) fitted on the earlier half and report the improvement on the
  later half. Then "confidence" is a *measured* probability, which is what the rubric is asking for.
- The UI renders `report.json` verbatim; no number is typed by hand anywhere. A judge can re-run
  `python -m eval.backtest` and get the same file.

---

## 9. Degradation matrix (Engineering & Reliability, 10 pts)

| # | Failure | Detection | System behaviour | What the judge sees |
|---|---|---|---|---|
| 1 | Price feed down | fetch/timeout/empty | A1 `DEGRADED`, cached indicators, confidence ≤ 0.52, `HOLD` | red `UNAVAILABLE` badge, cached-at tooltip |
| 2 | Volume feed stale | timestamp age > threshold | volume anomaly → `UNKNOWN`, breakout rules disabled | `volume: DELAYED 6h`, amber |
| 3 | Filing missing for symbol | retrieval returns < 1 chunk above threshold | A2 `INSUFFICIENT_EVIDENCE`, `evidence: []`, cannot upgrade the verdict | "no filing retrieved — fundamentals excluded from the verdict", A2 greyed |
| 4 | LLM provider down / rate-limited | non-200 / timeout ×2 | per-agent template fallback, `execution.cached=false, attempts=2` | "narration degraded, numbers unaffected" |
| 5 | Malformed LLM JSON | schema validation | repair retry, then template fallback | validator line in the audit trail |
| 6 | Conflicting agents | polarity gap ≥ 0.8 | debate → arbiter policy → possibly `NO_ACTION_INSUFFICIENT_CONSENSUS` | the Disagreement Theater |
| 7 | Conflicting *data* (two feeds disagree) | value delta > tolerance | trust the fresher, keep both, flag the delta | "feeds disagree by 0.8% — using the newer" |
| 8 | Portfolio unavailable | empty store | A4 `FAILED`, portfolio panel shows empty state, synthesis still runs | honest empty state, pipeline green |

Implement 1–3, 6, 7 for the demo (the required "at least one" is over-delivered), and unit-test 5 with a
malformed fixture. Each degradation appends to `degraded.mitigations[]`, which the audit trail and the
Audit Pack render.

---

## 10. API surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/market/{symbol}` | snapshot + indicators + provenance |
| `GET` | `/api/market` | screener list across all symbols (signal, confidence, change) |
| `POST` | `/api/analyze` | run one full analysis (body: symbol, profile, user_id, chaos flags) → analysis JSON |
| `GET` | `/api/analyze/stream` | SSE: `agent_started`, `agent_token`, `agent_done`, `verification`, `synthesis`, `done` |
| `POST` | `/api/analyze/counterfactual` | same snapshot × 3 profiles + divergence + per-agent deltas |
| `GET` | `/api/corpus/search?q=&symbol=&k=5` | retrieval inspector: ranks, scores, spans (proves retrieval is real) |
| `GET` | `/api/portfolio/{user_id}` | holdings, weights, HHI, sector, beta, stress tests, watchlist |
| `POST` | `/api/decisions` | record accept/ignore/skip + size → feeds behavioural tilt |
| `GET` | `/api/users` · `/api/profiles` | seeded users + profile definitions |
| `GET` | `/api/metrics/session` | live session metrics (§3.2 `metrics`) |
| `GET` | `/api/eval/report` | backtest JSON + retrieval eval + latency |
| `GET` | `/api/audit/{run_id}` | Audit Pack: `{inputs, prompts, retrieved_chunks, raw_agent_outputs, timings, metrics, verdict}` JSON + MD |
| `POST` | `/api/chaos` | set per-source availability for the demo |

Frontend rule: every screen renders from `analysis.schema.json`; the client ships `fixtures/*.json`
generated from a real run, so `NEXT_PUBLIC_API=off` reproduces the exact demo without a backend.

---

## 11. Persistence (SQLite)

`users(id, name, profile_id, risk_appetite, created_at)` ·
`portfolios(id, user_id, cash, sector_cap, created_at)` · `holdings(id, portfolio_id, symbol, qty, avg_price, sector)`
· `watchlist(id, user_id, symbol, alert_rules_json)` · `decisions(id, user_id, run_id, action, size_inr,
recommended_profile, created_at)` · `runs(id, user_id, symbol, profile_id, snapshot_id, degraded, created_at)`
· `run_events(id, run_id, agent_id, event, payload_json, ts_ms)` · `metrics(id, run_id, key, value, unit)`.

Seed script `store/seed.py` writes the 3 demo users; `data/` for the DB is gitignored, but the seed is
committed so a judge can rebuild it in one command.

---

## 12. Compliance shield (`compliance.py`)

- Prohibited-phrase filter over every rendered string: `guaranteed`, `assured returns`, `risk-free`,
  `sure-shot`, `multibagger guaranteed`, `AI predicts`, `you will make`. A hit is rewritten and counted →
  `compliance.prohibited_phrases_blocked`.
- Suitability gate: per-trade cap, sector cap, instrument restriction (no derivatives for `Meera`),
  concentration limits. A breach downgrades the verdict to `BLOCKED_BY_*` and offers an alternative.
- Mandatory disclosure block: "AI-generated research for educational purposes. Not investment advice. No
  assurance of returns. Past performance is not indicative of future results." + data provenance + the
  AI-use disclosure SEBI requires of RAs/IAs.
- Label the product **research/education**, and say in the README that operating this commercially for
  personalized advice would require RA/IA registration — that is the honest, credible commercial story.

---

## 13. Testing (the thing most teams skip — cheap points in Engineering & Reliability)

- `pytest` unit tests: indicator math vs hand-computed fixtures; weighted scoring per profile
  (Conservative/Balanced/Aggressive produce different verdicts for one snapshot — the MVP requirement as an
  *assertion*); conflict detector fires on the conflict fixture; verifier suppresses a poisoned claim;
  compliance filter catches a forbidden phrase; suitability gate blocks the sector breach;
  degraded path never emits an uncited FACT and never crashes.
- One end-to-end test: fixture snapshot → `/api/analyze` → schema-valid analysis with `coverage_pct ≥ 90`.
- One look-ahead test: assert the backtest at `t` cannot read data after `t`.
- `npx oxlint` → 0 warnings; `vite build` green; `ruff` (or `flake8`) clean.

---

## 14. File tree to build

```
VibeFinance-AI/
├─ docs/00-WIN-PLAN.md 01-TECH-PLAN.md 02-UI-RESTYLE-PLAN.md ARCHITECTURE.md
├─ schemas/{agent,analysis}.schema.json
├─ backend/
│  ├─ main.py                     routers/{market,analyze,corpus,portfolio,decisions,metrics,eval,audit,chaos}.py
│  ├─ orchestrator.py synthesis.py verify.py compliance.py constants.py
│  ├─ agents/{a1_technical,a2_fundamental_rag,a3_sentiment_flow,a4_portfolio_risk}.py
│  ├─ llm/client.py  rag/{chunker,retrieve,rerank}.py  store/{db.py,seed.py}
│  └─ requirements.txt
├─ pipeline/{ingest_market,build_corpus,embed}.py  eval/backtest.py
├─ data/{snapshots,corpus,index,eval,profiles.json}
├─ tests/…
└─ src/  (existing React app + the new design system — see 02-UI-RESTYLE-PLAN.md)
```
