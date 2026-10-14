import React from "react";
import { X, FileCheck2, ExternalLink, ShieldAlert, CheckCircle2, Bookmark } from "lucide-react";

export function DocumentCitationModal({ isOpen, onClose, citations, stockSymbol }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog citation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="icon-wrapper green">
              <FileCheck2 size={20} />
            </div>
            <div>
              <h2 className="modal-title">Verified Regulatory Citations (RAG Retrieval)</h2>
              <p className="modal-subtitle">Direct document attribution for {stockSymbol} via SEBI disclosures & audited transcripts</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body citation-body">
          {citations.length === 0 ? (
            <div className="empty-citations">
              <ShieldAlert size={36} className="text-amber" />
              <h3>No Citations Available in Degraded Mode</h3>
              <p>In degraded mode, the RAG retrieval pipeline does not hallucinate documents. Regulatory filings are flagged as unavailable.</p>
            </div>
          ) : (
            citations.map((cite, index) => (
              <div key={index} className="citation-entry-card">
                <div className="entry-header">
                  <div className="entry-tag-group">
                    <span className="badge-chunk"><Bookmark size={11} /> {cite.chunkId}</span>
                    <span className="badge-regulator">{cite.regulator}</span>
                    <span className="badge-verified">
                      <CheckCircle2 size={11} /> Cryptographically Grounded
                    </span>
                  </div>
                  <span className="entry-date">{cite.date}</span>
                </div>

                <h3 className="entry-doc-title">{cite.title}</h3>

                <div className="quote-callout">
                  <span className="quote-mark">“</span>
                  <p className="quote-text">{cite.quote}</p>
                </div>

                <div className="full-excerpt-box">
                  <span className="excerpt-label">Full Retrieved Document Context:</span>
                  <p className="excerpt-text">{cite.fullText}</p>
                </div>

                {cite.metrics && (
                  <div className="audited-metrics-pills">
                    {Object.entries(cite.metrics).map(([k, v]) => (
                      <div key={k} className="audited-pill">
                        <span className="aud-k">{k}:</span>
                        <span className="aud-v">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="entry-footer">
                  <a
                    href={cite.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    <span>View Official Exchange Disclosure</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <span className="footer-note">All agent statements are bound to retrieved passages. Zero hallucination tolerance enforced.</span>
          <button className="btn-done" onClick={onClose}>Done Reviewing</button>
        </div>
      </div>
    </div>
  );
}
