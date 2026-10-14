import React from "react";
import { FileText, ExternalLink, ShieldCheck, ShieldAlert, Bookmark } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Pill } from "../../components/ui/Pill";

export function CitationsModal({ isOpen, onClose, citations, verification, symbol }) {
  const claims = verification?.claims_total ?? 0;
  const unsupported = verification?.unsupported ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={FileText}
      title="Verified regulatory citations (RAG retrieval)"
      subtitle={`Document attribution for ${symbol} · ${claims} claims checked, ${unsupported} unsupported`}
      footer={
        <>
          <span className="vf-t-meta">
            Every FACT is bound to a retrieved passage. Figures absent from the passage are flagged, never relied upon.
          </span>
          <button type="button" className="vf-pillbtn is-solid" onClick={onClose}>Done reviewing</button>
        </>
      }
    >
      {citations.length === 0 ? (
        <div className="vf-tile">
          <div className="vf-inline">
            <ShieldAlert size={18} strokeWidth={1.75} aria-hidden="true" />
            <strong className="vf-t-label">No citations available on this run</strong>
          </div>
          <p className="vf-t-body" style={{ marginTop: 8 }}>
            When the filing source is unavailable the retrieval agent returns INSUFFICIENT_EVIDENCE and produces no
            document claims. That is a deliberate outcome: no document is invented to fill the gap.
          </p>
        </div>
      ) : (
        citations.map((cite) => (
          <article className="vf-card vf-card--flat" key={cite.docId}>
            <div className="vf-inline">
              <Pill tone="outline" icon={Bookmark}>{cite.chunkId}</Pill>
              <Pill tone="soft">{cite.regulator}</Pill>
              <Pill tone="soft">{cite.date}</Pill>
              <Pill tone="ok" icon={ShieldCheck}>Verified disclosure</Pill>
            </div>

            <h3 className="vf-t-cardtitle">{cite.title}</h3>

            <div className="vf-quote">
              <span className="vf-t-faint">Retrieved highlight</span>
              <p>“{cite.quote}”</p>
            </div>

            <details className="vf-details">
              <summary>Full retrieved passage supplied to the agent</summary>
              <p className="vf-t-body" style={{ whiteSpace: "pre-wrap" }}>{cite.fullText}</p>
            </details>

            {cite.metrics ? (
              <div className="vf-kv">
                {Object.entries(cite.metrics).map(([k, v]) => (
                  <div className="vf-kv__cell" key={k}>
                    <div className="vf-kv__k">{k}</div>
                    <div className="vf-kv__v">{v}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="vf-inline">
              <a className="vf-pillbtn" href={cite.sourceUrl} target="_blank" rel="noopener noreferrer">
                <span>View official exchange disclosure</span>
                <ExternalLink size={13} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))
      )}
    </Modal>
  );
}
