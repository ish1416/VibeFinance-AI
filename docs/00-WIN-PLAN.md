# VibeFinance AI — How We Win Wild Bugs (PS 04)

**Status:** plan approved and in progress — see §10 for what has already landed.

> **Working copy:** `~/VibeFinance-AI` on branch `hackathon/ps04`. The original `main` is untouched.
> Run it with `npm run dev`, prove the logic with `npm run check:analysis` (12 nominal + 4 degraded runs,
> asserts verification, conflict detection, personalization and the suitability gate).
**Event:** Wild Bugs (Devfolio, online). Build window **Oct 14 00:00 → Oct 15 23:59**, results Oct 16 12:00.
**Time remaining at time of writing:** ~31 hours (Oct 14, 17:00 IST).
**Repo audited:** `ish1416/VibeFinance-AI` @ `67c3707` (single commit), cloned to `~/VibeFinance-AI`, builds clean (`vite build` → 292 kB / 90 kB gzip).

---

## 0. Locked decisions (approved Oct 14)

1. **Engine:** a **Python FastAPI service** owns the brain (indicators, hybrid retrieval, verification, LLM
   calls, backtest, persistence). The React app keeps the presentation and falls back to committed fixtures
   when the API is unreachable, so the demo can never fail.
2. **Cut line:** protect **D1 Evidence Ledger**, **D2 Disagreement Theater**, **D3 Counterfactual
   personalization**. If we run short, sacrifice in this order: extra stocks → behavioural tilt (D5) → audit
   pack (D8) → stress tests → the dark theme. Never D1/D2/D3, never a fabricated number left on screen.
3. **Theme:** **light control-center by default** (matches the reference), with the dark glassmorphism look
   reduced to a `[data-theme="dark"]` token swap behind a rail toggle — one component tree, two token sets,
   never two stylesheets.

---

## 1. Honest audit: what we actually have

The UI is genuinely good-looking and the writing is confident. The *engineering* underneath is a
hardcoded simulation presented as a live system. If a judge opens `src/agents/`, we lose the two
heaviest rubric rows. This is the single largest risk and it is fully fixable in the time we have.

| Claim in UI / README | Reality in code | Verdict |
|---|---|---|
| "Autonomous agents running in parallel" | 3 pure functions called in 3 `useMemo`s **once per render**, in one JS thread. No async, no scheduling, no isolation. `src/App.jsx:26-48` | Misleading |
| "Executed in 84ms / 128ms / 76ms" | `Math.round(performance.now() - startTime) + 84` — a fixed constant added to a ~0.1 ms measurement. `technicalAgent.js:51`, `fundamentalAgent.js:75`, `sentimentAgent.js:75` | Fabricated |
| "Retrieval-augmented generation" | `docs[0]`, `docs[1]` — array indices, not similarity. Zero embedding/vector/search code anywhere in the repo. `fundamentalAgent.js:6,28,29` | Not retrieval |
| "Cryptographically Grounded" | No hash, no signature, no verification of any kind. `DocumentCitationModal.jsx:40` | False claim |
| "30d Signal Accuracy: 84.6%" | String literal. `synthesisEngine.js:155` | Fabricated |
| "Risk Concentration: 8.8/10" | `stock.beta * 10`. Beta is not concentration; there is no portfolio. `synthesisEngine.js:157` | Meaningless metric |
| "Real-time NSE ingestion" | 4 static objects in `stocksData.js`, 10 hardcoded candles each | Simulated (allowed if disclosed) |
| "Bayesian Consensus Arbitration" | A hardcoded `scoreMap` + weighted average. Not Bayesian. `synthesisEngine.js:41-88` | Overstated |
| Degraded-data handling | Works, but the `conflictNotice` branch is **dead code** — it can never fire for the 4 stocks shipped (`synthesisEngine.js:96-107` needs tech≥80 & fund≤50, or fund≥85 & tech≤45; no shipping stock satisfies either) | Half-built |
| Portfolio / watchlist display | **Does not exist.** Mandatory MVP item. | Missing |

Other concrete defects found:

- **No `LICENSE` file** while `README.md` shows an MIT badge and links to `LICENSE`. Submission hygiene.
- **Broken favicon:** `index.html:9` points at `/vite.svg`, but `public/` only has `favicon.svg` + `icons.svg`.
- **Dead assets:** `src/assets/hero.png`, `vite.svg`, `react.svg` — unreferenced (≈26 kB).
- **Lint:** 7 warnings (`npx oxlint`) — unused imports in `CandlestickChart.jsx`, `PerformanceTelemetry.jsx`, `StockHeader.jsx`.
- **Accessibility:** persona cards are `div onClick` with no keyboard path or `role` (`ConsensusDecision.jsx:100`); no `aria-label` on icon-only buttons; modals have no ESC / focus trap.
- **Chart bug:** volume bars render as full-height dark boxes overlapping the candles (visible in the live UI at y≈84–100 of the chart), so the volume subplot reads as a rendering artifact.
- **No persistence:** every profile/stock/degraded selection resets on reload. No decision history, so "behavioral history" is impossible.
- **No tests, no `.env.example`, no deployment config, no backend.**

**What is genuinely good and must be kept:** the visual craft, the reasoning-chain copywriting, the
three-persona risk model, the degradation copy, the citation drawer concept, the architecture modal,
and the rubric-alignment map in the README (the thinking there is right — the code just has to catch up).

---

## 2. Rubric scorecard: where we are vs. where we can be

| Rubric row | Wt | Score today (est.) | Target | The single change that moves it most |
|---|---:|:--:|:--:|---|
| Signal classification & analytical quality | 20 | 11 | **18** | Compute indicators from real OHLCV + make confidence a *calibrated* function of signal strength, disagreement and data freshness — not a constant |
| Multi-agent architecture & synthesis | 20 | 12 | **18** | Real async parallel execution (SSE stream, per-agent timers, per-agent failure isolation) + a visible **disagreement → arbiter** path that actually fires |
| Retrieval & source attribution | 15 | 6 | **14** | Hybrid retrieval (BM25 + embeddings) over a 10× corpus, with the exact retrieved sentence highlighted and **every claim machine-verified** against it |
| Personalization & risk awareness | 15 | 10 | **14** | Same input rendered for 3 profiles **side-by-side** with a divergence score + portfolio-aware suitability, backed by stored profiles/holdings/decision history |
| Engineering & reliability | 10 | 6 | **9** | Persistence, schema-validated agent contracts, per-source freshness, one-button audit export, committed snapshot artifacts |
| Performance & evaluation | 10 | 5 | **9** | A **real** walk-forward backtest that produces the accuracy/calibration/latency numbers rendered in the UI |
| Explainability & commercial relevance | 10 | 7 | **9** | Evidence ledger at claim level, "what would change our mind", SEBI-aware compliance shield, broker-API business model |
| **Total** | 100 | **~57** | **~91** | |

Judges can only score what they can *see in 3 minutes* and *verify in the repo*. So every point above
is tied to something visible on screen or checkable in the code.

---

## 3. The wedge: what makes us different from the other teams

Every other team on this problem statement will ship: N agents in parallel + RAG with citations +
3 risk profiles + a nice dashboard. That is the *entry ticket*, not the win. Our differentiation must be
things that are (a) visible in the demo, (b) cheap to build, (c) impossible to fake.

**D1 — Evidence Ledger with claim-level verification.** Every sentence in the recommendation is a
numbered claim chip `[1]`. Clicking it opens the retrieved filing chunk **with the exact source sentence
highlighted**, plus a machine-generated verification badge: `NUMERIC MATCH ✓` (the ₹42,748 Cr in our
text was found in the retrieved passage), `QUOTE SUPPORTED ✓`, or `UNSUPPORTED ✗`. The header shows
`Evidence coverage 96% · Unsupported claims 0`. This kills the "is this just an LLM making things up?"
question before a judge can ask it, and it maps onto three rubric rows at once. **Nobody else will do
this.**

**D2 — Disagreement Theater.** When agents conflict, we don't hide it. We show a turn-by-turn debate:
Technical says *exit*, Fundamental says *accumulate*, each rebutting the other with its own evidence,
then the Arbiter states the policy it applied ("under Balanced, audited balance-sheet evidence outranks
a 3-day momentum fade"), the score contribution of each side, **the verdicts that were rejected**, and
`what would flip this decision: RSI closes below 55 AND volume < 0.8× 20-day median`. Optional MVP item
"conflicting signals between agents" → turned into our best moment.

**D3 — Counterfactual personalization.** Instead of a profile toggle that reloads one verdict, show the
**same market snapshot against all three profiles simultaneously** plus a continuous risk-appetite
slider, with a **divergence score** ("identical inputs → 22-point spread in conviction; Conservative
rejects, Aggressive sizes up"). This is the literal MVP requirement made undeniable, and it is the
reason a judge remembers us.

**D4 — Portfolio-aware verdict, not a stock verdict.** Retail investors don't own one ticker. Every
recommendation is rendered against the *user's actual holdings*: "Buying ₹25,000 of RELIANCE pushes your
Energy exposure from 18% → 24% and your top-2 concentration (HHI) from 0.14 → 0.19; under your 20%
sector cap this trade is **blocked** and the suggested alternative is INFY." Backed by real HHI / sector
/ beta-weighted math and a stress test (NIFTY −3%, FII outflow day). Portfolio-level risk is an *optional*
extension that most teams skip because it needs a portfolio at all.

**D5 — Behavioral profiling, not just static risk buckets.** We store the user's decision history
(accepted / ignored / skipped) and derive a behavioral tilt: *"You ignored 4 of your last 5 conservative
HOLDs and averaged 2.4× the position size you declared — your realized behaviour is Aggressive. We are
showing the Aggressive guardrail with an explicit warning."* The problem statement says "risk profile
**or behavioral history**"; this is the part teams won't build.

**D6 — Real, reproducible evaluation.** A committed script walks 24 months forward, generates signals at
t with only information available at t, and measures 30-day forward hit rate, per-signal precision,
target-price MAE, **Brier score + reliability diagram** (confidence calibration), p50/p95 end-to-end
latency and cost per analysis. The UI renders the JSON the script produced. No number on screen is typed
by hand.

**D7 — Degradation you can demo.** A chaos panel with per-source kill switches (price feed, volume,
filings, news, options) and per-source freshness/staleness badges. Kill filings mid-demo and watch Agent 2
switch to `INSUFFICIENT_EVIDENCE` instead of inventing a number, the confidence collapse, and the verdict
flip to capital preservation — with the mitigation printed in the audit trail. Also covers *conflicting
data* (two feeds disagree → prefer the fresher, flag it).

**D8 — SEBI-aware compliance shield + audit pack.** A post-processing guard that blocks prohibited
promotional language (guaranteed/risk-free/sure-shot), enforces the suitability gate, and stamps the
AI-use disclosure SEBI requires of RAs/IAs. Plus a one-click **Audit Pack** download: inputs, prompts,
retrieved chunks, raw agent outputs, timings, model versions, metrics, and the final verdict as JSON+MD.
"Reproducibility" and "commercial relevance" for a B2B broker API, in one button.

> Sequencing rule: D1, D2, D3 are the pitch. D4, D6, D7 are required-or-weighted. D5, D8 are cheap
> add-ons we do last. If we run out of time, we cut in that order — never D1/D2/D3.

---

## 4. The winning architecture in one line

**Real brain, crash-proof demo.** A small Python service actually computes indicators, really retrieves
from a real corpus, really calls an LLM with JSON-schema-constrained output, really verifies every number,
and really backtests. But every artifact (snapshot, embeddings, LLM responses, backtest report) is
cached to disk and committed, so the demo runs identically offline, in <1 s, even if the wifi dies.
Full detail: `docs/01-TECH-PLAN.md`.

Why Python for the brain and not "all in the browser": competitive credibility. Judges recognise
LangGraph-style agent orchestration, hybrid retrieval, calibration metrics and a walk-forward backtest.
A pure client-side React app cannot do honest RAG or an honest backtest, and that is exactly where 45 of
the 100 points live.

---

## 5. The 31-hour sprint (3 people, ~20 productive hours, sleep is scheduled)

Contract-first: `docs/01-TECH-PLAN.md` §3 freezes the agent JSON envelope in Block 0 so the UI can be
built against a fixture while the backend lands.

| Block | Hours | Track A — Frontend / UI (1 person) | Track B — Data & RAG (1 person) | Track C — Agents, Eval & Platform (1 person) |
|---|---|---|---|---|
| **0. Freeze** | 1 | Design tokens file + component skeletons (`docs/02` §3) | `data/` layout, licence, favicon, README honesty pass | Write `schemas/agent.schema.json`, `analysis.schema.json`, API contract, `.env.example`, git branch |
| **1. Foundation** | 3 | Full restyle of existing UI → AppFrame/TopNav/Rail/PageHeader/StatCards/Dock (Stage 1 = visual only, zero logic change) | Ingest real OHLCV + compute RSI/MACD/DMA/volume-z/ATR; author/expand corpus to ≥10 docs/stock with page+URL metadata; chunker | FastAPI skeleton, SSE endpoint, LLM client w/ schema-constrained output + disk cache + Gemini→Groq→template fallback |
| **2. Evidence** | 4 | Evidence-ledger UI: claim chips, highlighted spans, verification badges, coverage meter | Embeddings + BM25 index (hybrid + rerank); retrieval eval (hit-rate@5) | Agents A1/A2 on the real path; verification layer (numeric match + quote support); `evidence_coverage` metric |
| **3. Swarm** | 4 | Wire real run: SSE live per-agent cards, timers, partial states, disagreement theater + arbiter panel | Snapshot artifacts committed; freshness metadata per source | Agents A3/A4; synthesis + conflict detector + calibration hook; degraded/chaos paths; schema validation + retries |
| **4. You** | 3 | Counterfactual 3-profile view + divergence score + risk slider; portfolio panel | Seed 3 demo users (profiles, holdings, watchlists, decision history) | SQLite persistence (users/portfolios/decisions/runs/metrics), risk math (HHI, sector, beta-weighted, stress) |
| **5. Proof** | 3 | Metrics + calibration view driven by `eval/report.json`; citations/telemetry side-panel tabs | Backtest dataset windows (point-in-time, no look-ahead) | `eval/backtest.py` → hit rate, precision, MAE, Brier, reliability bins, p50/p95 latency, cost |
| **6. Armour** | 2 | Degraded/conflict visual language (freshness badges, UNKNOWN states, mitigation trail) | Corpus gap case ("filing missing for stock X") | Compliance shield (prohibited-phrase filter, suitability gate, AI disclosure), audit-pack export |
| **7. Ship** | 2 | Final polish, responsive 1280/768, a11y pass, screenshots | README + `docs/ARCHITECTURE.md` + data-limitations disclosure | Demo-mode freeze (`DEMO=1` reads only cached artifacts), rehearsal, deploy |
| **Buffer** | 4 | Sleep + bugfix | Sleep + bugfix | Sleep + bugfix |

**Hard cut-line:** if Block 7 arrives and something is unfinished, we ship the restyle + real RAG + evidence
ledger + counterfactual profiles and *say so honestly* in the README. Never leave a fabricated number in
the UI.

---

## 6. The 3-minute demo script (judges see this, not our code)

| Time | Beat | Rubric row it hits |
|---|---|---|
| 0:00 | "160M demat accounts, and the retail investor gets a stock screener and a Telegram rumour channel. We built the research desk." | — |
| 0:10 | Load **Aarav, Balanced, 6 holdings, IT at 34%**. Press **Run swarm**. Agents light up **in parallel** with live timers; one is slower and streams in late. | Multi-agent 20 |
| 0:35 | Verdict appears. Click claim `[2]`. The SEBI filing chunk opens with the **source sentence highlighted**, badge `NUMERIC MATCH ✓ ₹42,748 Cr`, coverage meter `96% / 0 unsupported`. | RAG 15 |
| 1:00 | Switch to the **conflict** ticker. Technical says exit, Fundamental says accumulate → debate plays, arbiter names its policy, shows the rejected verdict and the flip conditions. | Multi-agent 20, Explainability 10 |
| 1:25 | **Counterfactual**: same snapshot, Conservative / Balanced / Aggressive side by side, **divergence 22 pts**, drag the appetite slider and watch the verdict and size change live. | Personalization 15 |
| 1:50 | **Portfolio impact**: the buy pushes Energy 18% → 24% and breaches the 20% sector cap → blocked, alternative suggested. Stress test: NIFTY −3% → portfolio −2.1%. | Personalization 15, Commercial 10 |
| 2:10 | **Chaos**: kill the filings feed mid-run. Agent 2 → `INSUFFICIENT_EVIDENCE`, confidence drops, verdict flips to capital preservation, freshness badge goes red, **mitigation printed in the audit trail**; no uncited sentence ever renders. | Engineering 10 |
| 2:30 | **Metrics**: hit rate over 24 months, Brier 0.14, reliability diagram, p95 latency 3.8 s, cost/analysis. **Download audit pack**. | Performance 10 |
| 2:50 | Close: behaviour tilt, SEBI-compliant research framing, B2B API for brokers + B2C subscription. | Commercial 10 |

Record this as the submission video with one clean take; keep a backup recording.

---

## 7. Submission checklist

- [ ] Repo: add `LICENSE` (MIT), fix favicon to `/favicon.svg`, delete dead assets, `npx oxlint` → 0 warnings, `vite build` green.
- [ ] `README.md` rewritten to be **truthful**: mark simulated vs live data explicitly, add a "Limitations & Disclosure" section, add the Mermaid architecture diagram, add rubric mapping, add run instructions for both frontend and backend, keep the team section.
- [ ] `docs/ARCHITECTURE.md` — the "brief written summary of the agent architecture and decision logic" the MVP demands (this file + `01-TECH-PLAN.md` distilled).
- [ ] Committed `data/eval/report.json`, `data/snapshots/*`, `data/index/*` so judges can reproduce offline.
- [ ] Live deploy (frontend + API) with a **DEMO mode** fallback; test on a phone hotspot.
- [ ] Devfolio submission: name, tagline, ≤3 screenshots, GitHub link, live link, 2–4 min video, tech tags.
- [ ] Record a **failure** moment in the video (judges explicitly score graceful degradation).
- [ ] Rehearse the answers in §8.

---

## 8. Judge Q&A prep (answer honestly, lead with the artifact)

| Likely question | Our answer |
|---|---|
| "Is this financial advice?" | No — it is research/education. We classify outputs, enforce a suitability gate, block guaranteed-return language, and stamp the AI-use disclosure SEBI requires of RAs/IAs. The Compliance Shield panel shows the policy checks for this run. |
| "Where does the data come from?" | Real OHLCV + indicators computed by our pipeline, labelled `LIVE` or `DELAYED/SIMULATED` per source with a fetched-at timestamp. Filings corpus is synthetic-but-realistic, disclosed in the README, with document URLs and page metadata. |
| "How do you know the LLM isn't hallucinating?" | Every claim is verified against the retrieved span (numeric match / quote support); unsupported claims are suppressed before render. Coverage and unsupported-claim count are both on screen and in the audit pack. |
| "Are the agents real or prompt theatre?" | They are isolated components with a shared schema, run concurrently with independent timeouts and failure isolation; each has its own compute path and its own evidence. The audit pack has raw per-agent input/output and latency. |
| "What's actually novel vs. Trendlyne/Tijori?" | Claim-level verification, agent disagreement arbitration, counterfactual personalization, and portfolio-aware suitability — none of the retail tools do any of them; the open-source projects do agents without Indian filings, verification or compliance. |
| "Show me it breaking." | We demo it breaking, on purpose. |

---

## 9. Build status

**Landed (verified, not asserted)**

| Area | State | Evidence |
| --- | --- | --- |
| Repo hygiene | done | `LICENSE` (was missing but linked), `/vite.svg` → `/favicon.svg` fix, `.env.example`, `.gitignore` covers secrets, `npx oxlint` → **0 warnings**, `vite build` green |
| Frozen contracts | done | `schemas/agent.schema.json`, `schemas/analysis.schema.json` (Draft 2020-12) |
| Design system | done | `src/styles/{tokens,base,components,views}.css` + 16 primitives in `src/components/ui/` + `src/screens/ControlCenter.jsx`; light control-center shell, 5 main tabs (Decision · Signals · Swarm · Evidence · Portfolio), 3 side-panel tabs (Profile · Session · Status), floating dock |
| Claim verification | done | three methods (NUMERIC_MATCH / COMPUTED / UNSUPPORTED); 100% coverage and **0 unsupported figures** across all 12 nominal runs; unsupported figures render struck-through, never silently dropped |
| Conflict → arbitration | done | polarity detector fires on **3 of 12** symbol×investor combinations (HDFCBANK 0.75 natural); debate turns, arbiter policy, rejected alternative verdicts, flip conditions; forced-scenario switch for the demo |
| Personalization | done | 3 seeded investors + continuous appetite slider; identical HDFCBANK snapshot → `ACCUMULATE ON DIP` / `ACCUMULATE (SIP/STAGGERED)` / `ACCUMULATE ON DIP` with different suitability per investor |
| Portfolio & risk | done | real HHI, sector weights, beta-weighted exposure, 3 stress scenarios, suitability gate (blocks in 6 of 12 combinations) |
| Degraded data | done | UI-verified: score 90→44, confidence 89%→48%, verdict → `HOLD (DEGRADED DATA SAFEGUARD)`, sources CACHED/UNAVAILABLE, 6-step mitigation trail, **no struck-through or uncited figure rendered** |
| Honesty pass | done | fabricated "84.6% accuracy", "cryptographically grounded", "beta×10 concentration" and the unsourced "sector median of 24.5" are gone; accuracy now shows as `PENDING` with its resolution date, latency is labelled measured local compute, and every source carries a provenance label |
| Corpus integrity | done | 10 documents; every `highlightQuote` is now a verbatim span of its `fullExcerpt` (enforced by test) so citations can actually be highlighted and verified |

**Not yet built (the next blocks)**

- Python/FastAPI service: real ingestion, hybrid retrieval (BM25 + embeddings), LLM agents with schema-constrained output and provider fallback, SSE streaming, SQLite persistence.
- `eval/backtest.py`: forward-return hit rate, Brier score, reliability diagram, latency percentiles — replaces the `PENDING` placeholder.
- Vector store, audit-pack export, demo video, README rewrite and deployment.

**Housekeeping decision needed:** the previous UI is fully superseded. `src/App.css`, `src/index.css`, the
8 components in `src/components/*.jsx` and `src/assets/{hero.png,vite.svg,react.svg}` are now unreferenced
(verified: 0 references each). They are left in place until the owners confirm deletion.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| LLM/API quota or outage during judging | Three-tier fallback (Gemini → Groq → deterministic templates) + committed response cache + `DEMO=1` offline mode |
| Adding real LLM introduces hallucination in front of judges | JSON-schema-constrained output + numeric verification + suppression + deterministic numeric core (the LLM never computes a number) |
| Restyle eats the whole budget | Stage 1 is visual-only and reversible; it lands first precisely because the demo must look good even if Blocks 2–6 slip |
| Judges read the code and find "real-time"/"Bayesian"/"cryptographic" language we cannot defend | Purge and replace with precise language in the README, the UI copy and the modals in Block 0 |
| Team sleeps through the deadline | Sleep is scheduled in the buffer block; submission is prepared in Block 7, not at 23:40 |
| Two people edit the same files | Work on `hackathon/ps04`; the new UI lives under `src/{styles,components/ui,views,screens,domain}` and the old UI is untouched, so a rebase of `main` is additive only |
