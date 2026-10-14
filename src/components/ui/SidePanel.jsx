import React from "react";
import { SegmentedTabs } from "./SegmentedTabs";

/**
 * SidePanel — the right column: title + subtitle, a segmented tab track, then an
 * independently scrolling stack of cards supplied by the caller.
 */
export function SidePanel({ title, emoji, subtitle, tabs, activeTab, onTabChange, children }) {
  return (
    <aside className="vf-panel" aria-label={title}>
      <div className="vf-panel__head">
        <div>
          <div className="vf-panel__title">
            <h2 className="vf-t-paneltitle">{title}</h2>
            {emoji ? <span aria-hidden="true">{emoji}</span> : null}
          </div>
          {subtitle ? <p className="vf-t-meta">{subtitle}</p> : null}
        </div>
        {tabs && tabs.length > 0 ? (
          <SegmentedTabs items={tabs} value={activeTab} onChange={onTabChange} label={`${title} views`} />
        ) : null}
      </div>

      <div className="vf-panel__stack vf-scroll vf-fade-in" key={activeTab}>
        {children}
      </div>
    </aside>
  );
}
