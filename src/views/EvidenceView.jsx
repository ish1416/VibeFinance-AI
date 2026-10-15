import React from "react";
import { FileText, ShieldCheck, ExternalLink } from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Pill } from "../components/ui/Pill";
import { IconButton } from "../components/ui/IconButton";

/** Wrap every occurrence of a verified figure inside the retrieved passage. */
function Highlighted({ text, numbers = [] }) {
  const values = [...new Set(numbers.map((n) => String(n)))].filter(Boolean);
  if (!text || values.length === 0) return <>{text}</>;

  const escaped = values
    .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${escaped.join("|")})`, "g");

  return (
    <>
      {String(text)
        .split(re)
        .map((part, i) =>
          values.includes(part) ? (
            <mark className="vf-mark" key={`m-${i}`} title="Figure matched against this passage by the verifier">
              {part}
            </mark>
          ) : (
            <span key={`t-${i}`}>{part}</span>
          )
        )}
    </>
  );
}

export function EvidenceView({ analysis, onOpenCitations }) {
  const { verification_summary: vs, evidence_ledger: ledger } = analysis;

  return (
    <div className="vf-stack">
      <div className="vf-statrow">
        <StatCard value={vs.claims_total} label="Claims in this run" tone="blue" />
        <StatCard value={vs.claims_verified} label="Verified against a source" tone="green" />
        <StatCard value={`${vs.coverage_pct}%`} label="Evidence coverage" dashed />
        <StatCard
          value={vs.unsupported}
          label="Unsupported figures"
          tone="yellow"
          deco={vs.unsupported === 0 ? "✓" : "⚠"}
          title="Figures found in no cited source: flagged in the text, excluded from confidence"
        />
      </div>

      <SectionHeader
        label="Evidence ledger"
        count={ledger.length}
        action={
          <Pill tone="outline" emoji="🔒">
            Verification runs before anything is rendered
          </Pill>
        }
      />

      <div className="vf-stack">
        {ledger.map((item) => {
          const figures = (String(item.text).match(/\d[\d,]*(?:\.\d+)?/g) || []).map((n) => n.replace(/,/g, ""));
          return (
            <article className="vf-ledger" key={item.claim_id}>
              <div className="vf-ledger__top">
                <div className="vf-inline">
                  <span className="vf-ledger__id">{item.claim_id}</span>
                  <span className="vf-t-label">{item.agent_id.replace("_", " ")}</span>
                  <Pill tone="outline" icon={FileText}>{item.citation_short}</Pill>
                  {item.regulator ? <Pill tone="soft">{item.regulator}</Pill> : null}
                  {item.filed_at ? <Pill tone="soft">filed {item.filed_at}</Pill> : null}
                </div>
                <div className="vf-inline">
                  <Pill
                    tone={item.verified ? "ok" : "bad"}
                    icon={item.verified ? ShieldCheck : undefined}
                    emoji={item.verified ? undefined : "⚠"}
                  >
                    {item.method}
                  </Pill>
                  {item.url ? (
                    <IconButton
                      label="Open the official disclosure"
                      icon={ExternalLink}
                      size="sm"
                      onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                    />
                  ) : null}
                </div>
              </div>

              <p className="vf-t-cardtitle" style={{ fontWeight: 600 }}>{item.text}</p>

              {item.quote ? (
                <details className="vf-details">
                  <summary>Show the retrieved passage this claim came from ({item.citation})</summary>
                  <div className="vf-quote">
                    <Highlighted text={item.quote} numbers={figures} />
                  </div>
                </details>
              ) : null}

              {item.unsupported?.length ? (
                <Pill tone="bad">Figures not found in the passage: {item.unsupported.join(", ")}</Pill>
              ) : null}
            </article>
          );
        })}
      </div>

      <SectionHeader
        label="Retrieved documents behind the fundamental agent"
        count={analysis.citations.length}
        action={
          <button type="button" className="vf-pillbtn" onClick={onOpenCitations}>
            <FileText size={14} strokeWidth={1.75} aria-hidden="true" />
            Open citation drawer
          </button>
        }
      />

      <div className="vf-grid-3">
        {analysis.citations.map((c) => (
          <article className="vf-card" key={c.docId}>
            <div className="vf-card__head">
              <div>
                <span className="vf-card__eyebrow">{c.chunkId}</span>
                <h3 className="vf-t-cardtitle">{c.title}</h3>
              </div>
            </div>
            <p className="vf-t-body vf-clamp-3">“{c.quote}”</p>
            <div className="vf-card__meta">
              <span>{c.regulator}</span>
              <span>{c.date}</span>
            </div>
            <div className="vf-card__foot">
              <Pill tone="ok" icon={ShieldCheck}>Verified disclosure</Pill>
              <IconButton
                label={`Open source for ${c.title}`}
                icon={ExternalLink}
                size="sm"
                onClick={() => window.open(c.sourceUrl, "_blank", "noopener,noreferrer")}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
