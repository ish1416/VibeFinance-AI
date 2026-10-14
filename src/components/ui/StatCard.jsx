import React from "react";

/**
 * StatCard — one cell of the four-card summary row.
 * tone: blue | green | yellow | lilac | plain ; dashed renders the outline variant.
 */
export function StatCard({ value, label, tone = "plain", dashed = false, deco, title, onClick }) {
  const classes = ["vf-statcard", `vf-statcard--${tone}`, dashed ? "vf-statcard--dashed" : ""]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {deco ? <span className="vf-statcard__deco" aria-hidden="true">{deco}</span> : null}
      <span className="vf-t-stat">{value}</span>
      <span className="vf-statcard__label">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} title={title} aria-label={`${label}: ${value}`}>
        {content}
      </button>
    );
  }

  return (
    <div className={classes} title={title}>
      {content}
    </div>
  );
}
