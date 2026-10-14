import React from "react";
import { Cpu, CheckCircle2, AlertTriangle, Award } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Pill } from "../../components/ui/Pill";

const ARCHITECTURE = `
  [ Snapshot: prices, volume, indicators ]        [ Disclosure corpus: SEBI filings, transcripts ]
                    │                                            │
        ┌───────────┴───────────┐                    ┌───────────┴───────────┐
        ▼                       ▼                    ▼                       ▼
  A1 Technical          A3 Sentiment/Flow      A2 Fundamental-RAG      (retrieval: BM25 + vectors)
  • RSI/MACD/DMA        • FII/DII net flow     • claim extraction
  • volume anomaly      • options PCR          • numeric verification
        │                       │                    │
        └───────────┬───────────┴────────────────────┘
                    ▼
        A4 Portfolio & Risk  ──► concentration, sector caps, stress, behavioural tilt
                    │
                    ▼
        Verifier  ──► every figure checked against the object it came from
                    │              unsupported → flagged, confidence penalised
                    ▼
        Arbiter / Synthesis  ──► polarity conflict detection → policy → verdict + rejected alternatives
                    │
                    ▼
        Compliance shield  ──► prohibited language, suitability gate, AI-use disclosure
                    │
                    ▼
        Analysis object (schemas/analysis.schema.json) ──► dashboard
`;

const ROWS = [
  { c: "Signal classification & analytical quality", w: 20, how: "Three independent dimensions (technical, fundamental, flow) plus portfolio risk, each with a polarity score and a confidence basis rather than a constant." },
  { c: "Multi-agent architecture & synthesis", w: 20, how: "Four role-separated agents with a frozen JSON envelope, a deterministic synthesis core, and explicit arbitration when their polarities diverge." },
  { c: "Retrieval & source attribution", w: 15, how: "Document claims carry doc id, chunk id, section, filing date and URL; the retrieved passage is shown with the supporting figures highlighted." },
  { c: "Personalization & risk awareness", w: 15, how: "Stored portfolios, three profiles plus a continuous appetite slider, behavioural history, and portfolio-aware suitability that can block a trade." },
  { c: "Engineering & reliability", w: 10, how: "Schema-frozen contracts, per-source provenance, measured metrics, a degraded path that never emits an uncited figure, and no fabricated numbers." },
  { c: "Performance & evaluation", w: 10, how: "Session metrics are measured and displayed; signal accuracy is reported as pending until the 30-day window resolves in the backtest harness." },
  { c: "Explainability & commercial relevance", w: 10, how: "Claim ledger, rejected alternatives, flip conditions, mitigation trail, compliance classification and a broker-API business model." }
];

export function RubricModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Cpu}
      title="Architecture, rubric alignment and data disclosure"
      subtitle="Problem Statement 04 · VibeFinance AI · Team SHAKTI"
      footer={
        <>
          <span className="vf-t-meta">Research and education software. Not investment advice.</span>
          <button type="button" className="vf-pillbtn is-solid" onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="vf-stack">
        <div className="vf-arch">{ARCHITECTURE}</div>

        <div className="vf-tile">
          <div className="vf-inline">
            <AlertTriangle size={16} strokeWidth={1.75} aria-hidden="true" />
            <strong className="vf-t-label">What is real and what is simulated on this build</strong>
          </div>
          <div className="vf-stack vf-stack--tight" style={{ marginTop: 10 }}>
            <p className="vf-t-body">
              <strong>Computed, not simulated:</strong> every indicator, concentration figure, weight, stress result,
              confidence and verification outcome is calculated from the snapshot and the stored holdings by code in this repository.
            </p>
            <p className="vf-t-body">
              <strong>Simulated and disclosed:</strong> the market snapshot (prices, volume, flows) is committed data, and the
              filings corpus is synthetic-but-realistic with genuine document metadata. The README documents both, and each
              source carries its own status label in the Status panel.
            </p>
            <p className="vf-t-body">
              <strong>Not yet measured:</strong> signal accuracy and calibration. This build shows a 30-day forward check as
              PENDING with its resolution date instead of quoting an accuracy figure it has not earned. Those numbers arrive
              from the backtest harness and are rendered from its report.
            </p>
            <p className="vf-t-body">
              <strong>Engine latency:</strong> the numbers in the Session panel are wall-clock time measured on this machine
              for the deterministic engine, labelled as such. Real per-agent network latency is reported by the API path.
            </p>
          </div>
        </div>

        <div className="vf-tile">
          <strong className="vf-t-label">Judging rubric alignment</strong>
          <div className="vf-stack vf-stack--tight" style={{ marginTop: 10 }}>
            {ROWS.map((r) => (
              <div key={r.c}>
                <div className="vf-inline">
                  <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden="true" />
                  <span className="vf-t-cardtitle" style={{ fontSize: 14 }}>{r.c}</span>
                  <Pill tone="outline">{r.w} pts</Pill>
                </div>
                <p className="vf-t-body" style={{ marginTop: 2 }}>{r.how}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="vf-tile vf-tile--pastel">
          <div className="vf-inline">
            <Award size={16} strokeWidth={1.75} aria-hidden="true" />
            <strong className="vf-t-label">Commercial model</strong>
          </div>
          <p className="vf-t-body" style={{ marginTop: 8, color: "var(--vf-text-1)", opacity: 0.85 }}>
            A B2C research subscription for retail investors and a B2B intelligence API for brokers, distributors and
            wealth platforms. Operating this for personalized advice in India falls inside the SEBI Research Analyst and
            Investment Adviser regulations, so the product is deliberately positioned as research and education, with AI use
            disclosed and every output classified before display.
          </p>
        </div>
      </div>
    </Modal>
  );
}
