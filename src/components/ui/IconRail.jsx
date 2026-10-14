import React from "react";

/**
 * IconRail — the vertical stack of circular actions on the canvas edge.
 * Top group alternates solid black / white; bottom group is white with one
 * optional count badge. Every button is labelled for screen readers.
 */
function RailButton({ action, size = "md" }) {
  const Icon = action.icon;
  const classes = [
    "vf-rail__btn",
    size === "sm" ? "vf-rail__btn--sm" : "",
    action.solid ? "vf-rail__btn--solid" : "",
    action.warn ? "vf-rail__btn--warn" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={action.onClick}
      aria-label={action.label}
      title={action.label}
      aria-pressed={action.pressed}
      disabled={action.disabled}
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      {action.badge ? <span className="vf-rail__count">{action.badge}</span> : null}
    </button>
  );
}

export function IconRail({ top = [], bottom = [] }) {
  return (
    <div className="vf-rail" role="toolbar" aria-label="Quick actions">
      <div className="vf-rail__group">
        {top.map((action) => (
          <RailButton key={action.label} action={action} />
        ))}
      </div>
      <div className="vf-rail__group">
        {bottom.map((action) => (
          <RailButton key={action.label} action={action} size="sm" />
        ))}
      </div>
    </div>
  );
}
