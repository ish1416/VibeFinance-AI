import React from "react";

/**
 * SectionHeader — section label + optional count badge, with a right-side action
 * (usually a white pill button) supplied by the caller.
 */
export function SectionHeader({ label, count, action }) {
  return (
    <div className="vf-sectionheader">
      <div className="vf-sectionheader__left">
        <h2 className="vf-t-label">{label}</h2>
        {count !== undefined && count !== null ? (
          <span className="vf-sectionheader__count" aria-label={`${count} items`}>{count}</span>
        ) : null}
      </div>
      {action || null}
    </div>
  );
}
