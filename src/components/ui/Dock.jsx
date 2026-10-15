import React from "react";

/**
 * Dock — the floating black pill at the bottom of the main column. Five pastel
 * circular buttons plus a final "+" on the darker grey.
 */
export function Dock({ items = [], onPlus, plusLabel = "More actions" }) {
  return (
    <div className="vf-dock" role="toolbar" aria-label="Quick actions">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`vf-dock__btn vf-bg-${item.tone}${item.active ? " is-on" : ""}`}
          onClick={item.onClick}
          aria-label={item.label}
          title={item.label}
          aria-pressed={item.active}
        >
          <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
          {item.badge ? <span className="vf-dock__count">{item.badge}</span> : null}
        </button>
      ))}
      {onPlus ? (
        <button type="button" className="vf-dock__btn vf-dock__btn--plus" onClick={onPlus} aria-label={plusLabel} title={plusLabel}>
          <span aria-hidden="true" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>+</span>
        </button>
      ) : null}
    </div>
  );
}
