import React from "react";

/**
 * AuditedText — renders a sentence and marks any figure that could not be traced
 * back to a cited source. Struck-through figures are shown, never silently
 * dropped, so the reader can see exactly what the verifier rejected.
 */
export function AuditedText({ text, unsupported = [] }) {
  if (!text) return null;

  const flagged = [...new Set(unsupported.map((n) => String(n)))].filter(Boolean);
  if (flagged.length === 0) return <>{text}</>;

  const escaped = flagged
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${escaped.join("|")})`, "g");
  const flaggedSet = new Set(flagged);

  return (
    <>
      {String(text)
        .split(re)
        .map((part, i) =>
          flaggedSet.has(part) ? (
            <mark
              key={`bad-${i}`}
              className="vf-mark--bad"
              title="Figure not found in any cited source — flagged by the verifier, not relied upon"
            >
              {part}
            </mark>
          ) : (
            <span key={`ok-${i}`}>{part}</span>
          )
        )}
    </>
  );
}
