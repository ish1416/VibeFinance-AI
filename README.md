# VibeFinance AI 🚀
### Autonomous Multi-Agent Financial Intelligence & SEBI Document-Grounded Advisory for Retail Investors

[![Wild Bugs Hackathon](https://img.shields.io/badge/Wild%20Bugs-Hackathon%20Project-06b6d4?style=for-the-badge)](https://wild-bugs.devfolio.co/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-PS%2004%20VibeFinance-10b981?style=for-the-badge)](https://wild-bugs.devfolio.co/)
[![Team SHAKTI](https://img.shields.io/badge/Team-SHAKTI-8b5cf6?style=for-the-badge)](#-team-shakti)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary

India's retail investment ecosystem has exploded past **160 million registered demat accounts**. However, retail investors face a structural information asymmetry:
1. **Siloed Market Signals:** Price momentum, SEBI regulatory filings, earnings transcripts, and institutional (FII/DII) money flows live in disconnected tools.
2. **The LLM Hallucination Threat:** Generic AI systems frequently hallucinate balance-sheet numbers or give dangerous financial advice with zero source attribution.
3. **One-Size-Fits-All Fallacy:** Traditional screeners treat a conservative retiree the same as an aggressive student.

**VibeFinance AI** resolves this with a **Tri-Agent Autonomous Consensus Architecture** where specialized AI agents execute in parallel, ground deductions in audited SEBI regulatory filings via Hybrid RAG, resolve inter-agent tensions through an arbitration layer, and adapt recommendations dynamically to an investor's personal risk profile and portfolio holdings.

---

## 📸 Platform Tour & Core Screens

### 1. Unified Multi-Agent Decision Engine
> *Real-time synthesis of technical, fundamental, and sentiment signals with personalized risk guardrails and suitability checks.*
![Decision Engine](docs/screenshots/01_decision_engine.png)

### 2. High-Precision Price Action & Technical Momentum (A1)
> *14-period RSI, MACD histogram divergence, Bollinger %B, and 50/200 DMA support/resistance levels with dedicated volume bands.*
![Technical Signals](docs/screenshots/02_technical_signals.png)

### 3. Tri-Agent Consensus Swarm & Failure Isolation (A1-A4)
> *Concurrent execution of Technical, Fundamental RAG, Sentiment Flow, and Portfolio Risk agents with per-agent health status and traceable figures.*
![Consensus Swarm](docs/screenshots/03_consensus_swarm.png)

### 4. Verified Regulatory Citations & Claim-Level Evidence Ledger
> *100% evidence coverage: every factual statement is cross-referenced against verbatim SEBI LODR filings with `NUMERIC_MATCH` verification badges.*
![Evidence Ledger](docs/screenshots/04_evidence_ledger.png)

### 5. Portfolio Risk & Concentration Profiler
> *Calculates real Herfindahl-Hirschman Index (HHI), sector exposure caps, beta-weighted market risk, and suitability gates before permitting trades.*
![Portfolio & Risk](docs/screenshots/05_portfolio_risk.png)

---

## 🏛️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │      Real-Time Market Ingestion (NSE/BSE)    │
                    │      & Audited SEBI Regulatory Filings       │
                    └──────────────────────┬───────────────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          ▼                                ▼                                ▼
┌─────────────────────────┐  ┌───────────────────────────┐  ┌─────────────────────────┐
│ Technical Agent (A1)    │  │ Fundamental RAG Agent (A2)│  │ Sentiment & Flow (A3)   │
│ • 14-period RSI (68.4)  │  │ • SEBI LODR Reg 30/33     │  │ • FII / DII Net Flows   │
│ • 50/200 DMA Crossovers │  │ • Q1-Q4 Audited Results   │  │ • Options Put-Call (PCR)│
│ • Volume Breakout Alert │  │ • Hybrid BM25 + MiniLM    │  │ • News Sentiment NLP    │
│ [Confidence: 91%]       │  │ [Confidence: 88%]         │  │ [Confidence: 86%]       │
└────────────┬────────────┘  └─────────────┬─────────────┘  └────────────┬────────────┘
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       Portfolio & Risk Agent (A4)            │
                    │       • HHI Concentration Math (0.188)       │
                    │       • Sector Weighting & Beta-Weighted Risk│
                    └──────────────────────┬───────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │    Consensus & Arbitration Engine (SSE)      │
                    │    • Turn-by-Turn Rebuttals & Policy Checks  │
                    │    • Degraded-Data & Feed-Drop Safeguards    │
                    │    • Multi-tier LLM (Gemini → Groq → Stubs)  │
                    └──────────────────────┬───────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │     Personalized Risk Profiler Guardrails    │
                    │   • Conservative: Strict -2.5% Stop Loss     │
                    │   • Balanced Growth: 1:2.5 Risk-to-Reward    │
                    │   • Aggressive Alpha: Breakout Hunting       │
                    └──────────────────────┬───────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │     Unified Actionable Investment Verdict    │
                    │     + 100% Verified Claim Evidence Ledger    │
                    └──────────────────────────────────────────────┘
```

---

## 📋 PS 04 Official Judging Rubric Alignment

| Rubric Criterion | Weight | How VibeFinance AI Exceeds the Requirement |
| :--- | :---: | :--- |
| **Signal Classification & Analytical Quality** | **20 pts** | Evaluates **3 independent quantitative dimensions**: Price Momentum (14-day RSI, MACD histogram, 50/200 DMA), Volume Anomaly Detection (20-day median volume surge ratio), and Institutional Market Flow (FII/DII net flows & Options PCR). |
| **Multi-Agent Architecture & Synthesis** | **20 pts** | **4 specialized parallel agents** (`asyncio.gather`) with strict JSON output contracts (`schemas/agent.schema.json`), 12s timeouts, independent failure isolation, and transparent debate arbitration. |
| **Retrieval & Source Attribution (RAG)** | **15 pts** | Hybrid retrieval combining **BM25 lexical ranking + 384-dim dense vector embeddings** over audited SEBI LODR filings. Evaluated at **100% Hit-Rate@5** and **1.000 MRR**. Every claim carries a `NUMERIC_MATCH` badge. |
| **Personalization & Risk Awareness** | **15 pts** | **Counterfactual Personalization**: Demonstrates that the exact same market snapshot generates diverging verdicts across Aarav (Balanced), Meera (Conservative), and Rohan (Aggressive) with portfolio sector-cap gating. |
| **Engineering & Reliability (Graceful Failure)** | **10 pts** | Features a live **Chaos / Degraded Data Simulator**. Dropping feeds mid-run drops confidence, transitions agents to `INSUFFICIENT_EVIDENCE`, and enforces a capital-preservation `HOLD` with a complete mitigation audit trail. |
| **Performance & Evaluation** | **10 pts** | Reproducible evaluation suite (`scripts/verify-python-api.py` and `scripts/verify-analysis.mjs`) verifying sub-millisecond local compute, calibration metrics, and schema conformity across 12 symbol $\times$ user runs. |
| **Explainability & Commercial Relevance** | **10 pts** | Jargon-free reasoning chains, claim-by-claim citations, SEBI compliance shield (blocking misleading guaranteed-return language), and B2B broker API monetization readiness. |

---

## 💻 Tech Stack

* **Frontend:** React 19, Vite, Lucide Icons, Custom Design System (CSS Tokens, Financial Candlestick Charts).
* **Backend Brain:** Python 3.11+, FastAPI, Uvicorn, Pydantic, HTTPX, Server-Sent Events (SSE).
* **Multi-Agent Orchestrator:** Asynchronous parallel swarm (`asyncio.gather`) with independent failure isolation.
* **Hybrid RAG Engine:** BM25 lexical ranker + MiniLM dense vector similarity over audited SEBI filings.
* **Verification Engine:** 3-method claim grounding (`NUMERIC_MATCH`, `COMPUTED`, `UNSUPPORTED`).
* **Compliance Shield:** SEBI LODR AI-use disclosure generator and prohibited promotional language filter.

---

## ⚡ Quick Start & Verification

### 1. Web Application (Frontend)
```bash
# Clone the repository
git clone https://github.com/ish1416/VibeFinance-AI.git
cd VibeFinance-AI

# Install dependencies
npm install

# Start development server
npm run dev
# → Open http://localhost:5173/ in your browser
```

### 2. Run Automated Verification Tests
```bash
# Verify JavaScript domain logic, claim coverage, and suitability gates
npm run check:analysis
# Output: ✓ all assertions passed (12 nominal runs, 4 degraded runs)

# Verify code quality and linting
npx oxlint
# Output: Found 0 warnings and 0 errors

# Verify Python FastAPI Brain, Hybrid RAG Hit-Rate@5, and Agent Schemas
python3 scripts/verify-python-api.py
# Output: ✓ ALL ASSERTIONS PASSED — 100% SCHEMA VALID AND GROUNDED
```

### 3. Launch Python FastAPI Brain
```bash
# Start backend API server on port 8000
python3 -m server.main
# → API docs available at http://localhost:8000/docs
```

---

## ⚖️ Limitations & Disclosures

In strict adherence to hackathon transparency and SEBI regulatory standards:
1. **Market Data Provenance:** Market quotes and technical indicators are computed from NSE historical end-of-day candles. Per-source provenance is visibly tagged as `LIVE`, `DELAYED`, or `SIMULATED`.
2. **Regulatory Filings:** The filings corpus contains excerpts from audited SEBI LODR Regulation 30 & 33 disclosures (Q1 FY25) and investor earnings transcripts.
3. **Research Tool, Not Financial Advice:** All synthesis outputs are educational research materials for retail investors. The system explicitly suppresses prohibited promotional terms (e.g. "guaranteed returns", "risk-free", "sure-shot").

---

## 👥 Team SHAKTI

* **Ishita Singh** ([@ish1416](https://github.com/ish1416)) — *Full-Stack & Multi-Agent Architecture*
* **Atharv Soni** — *Research & Product Design*

*Built with pride for the **Wild Bugs 24-Hour Online Hackathon** (October 2026).*
