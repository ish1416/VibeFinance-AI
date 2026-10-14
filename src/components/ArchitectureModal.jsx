import React from "react";
import { X, Cpu, CheckCircle2, Award } from "lucide-react";

export function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog arch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="icon-wrapper cyan">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="modal-title">System Architecture & Judging Rubric Audit</h2>
              <p className="modal-subtitle">Official PS 04 Compliance Specification • VibeFinance AI</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body arch-body">
          {/* Architecture Flow Diagram */}
          <div className="arch-diagram-card glass-panel">
            <h3 className="card-subheading">Parallel Multi-Agent Reasoning Architecture</h3>
            <div className="ascii-architecture">
              {`
   [ Raw Market Feed (NSE) ]            [ SEBI Filings & Transcripts Corpus ]
                 │                                        │
                 ▼                                        ▼
   ┌─────────────────────────────┐        ┌─────────────────────────────┐
   │    Technical Agent (A1)     │        │     Fundamental Agent (A2)  │
   │  • 14-period RSI            │        │   • Chunk-level RAG Parser  │
   │  • 50/200 DMA Golden Cross  │        │   • Audited EBITDA Margins  │
   │  • Volume Anomaly Detection │        │   • Strict Source Citations │
   └──────────────┬──────────────┘        └──────────────┬──────────────┘
                  │                                      │
                  │   ┌──────────────────────────────┐   │
                  └──►│  Sentiment & Flow Agent (A3) ├───┘
                      │  • FII / DII Net Flow Trends │
                      │  • Derivatives Put-Call (PCR)│
                      │  • Financial News NLP Score  │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │ Consensus & Synthesis Engine │
                      │ • Bayesian Conflict Arbiter  │
                      │ • Degraded Data Safeguards   │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │   Personalized Risk Profiler │
                      │ • Conservative / Balanced /  │
                      │   Aggressive Guardrails      │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      [ Final Actionable Recommendation ]
              `}
            </div>
          </div>

          {/* Mandatory MVP Criteria Checklist */}
          <div className="rubric-checklist">
            <h3 className="card-subheading">Official PS 04 Mandatory MVP Verification</h3>
            <div className="criteria-grid">
              <div className="crit-item">
                <CheckCircle2 size={16} className="text-green" />
                <div>
                  <strong>Multi-dimensional Signal Classification (20 pts)</strong>
                  <p>Evaluates 3 independent vectors: Price momentum, volume spikes, and FII/DII flow sentiment with confidence intervals.</p>
                </div>
              </div>

              <div className="crit-item">
                <CheckCircle2 size={16} className="text-green" />
                <div>
                  <strong>RAG Financial Analysis & Source Attribution (15 pts)</strong>
                  <p>Grounds fundamental deductions in real SEBI LODR Regulation 30/33 filings and earnings calls with visible citations.</p>
                </div>
              </div>

              <div className="crit-item">
                <CheckCircle2 size={16} className="text-green" />
                <div>
                  <strong>Multi-Agent Parallel Architecture (20 pts)</strong>
                  <p>Three concurrent specialized agents with defined structured output contracts consumed by a consensus synthesis layer.</p>
                </div>
              </div>

              <div className="crit-item">
                <CheckCircle2 size={16} className="text-green" />
                <div>
                  <strong>Personalized Investor Profiling (15 pts)</strong>
                  <p>Demonstrates that identical market inputs produce different outputs for Conservative, Balanced, and Aggressive profiles.</p>
                </div>
              </div>

              <div className="crit-item">
                <CheckCircle2 size={16} className="text-green" />
                <div>
                  <strong>Graceful Failure Handling (10 pts)</strong>
                  <p>Degraded data simulator handles missing documents and interrupted feeds without pipeline crashes or uncited claims.</p>
                </div>
              </div>

              <div className="crit-item">
                <CheckCircle2 size={16} className="text-green" />
                <div>
                  <strong>Performance Logging & Evaluation (10 pts)</strong>
                  <p>Real-time telemetry captures agent execution latency, 30-day forward accuracy, and portfolio concentration score.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Model Section */}
          <div className="commercial-card glass-panel">
            <div className="comm-header">
              <Award size={18} className="text-cyan" />
              <h4>Commercial Viability & Market Fit</h4>
            </div>
            <p>
              India currently has over <strong>160 million registered demat accounts</strong>, with 80% lacking professional advisory infrastructure.
              VibeFinance AI provides institutional-grade multi-agent equity intelligence directly through a B2C retail subscription and B2B API licensing model for discount brokers (Zerodha, Groww, AngelOne).
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <span className="footer-note">Built for Wild Bugs 24-Hour Hackathon • Team SHAKTI (Ishita Singh & Atharv Soni)</span>
          <button className="btn-done" onClick={onClose}>Close Architecture View</button>
        </div>
      </div>
    </div>
  );
}
