import React from "react";

/**
 * AppFrame — the black outer frame wrapping the light canvas.
 * Region order in the DOM matches the visual order: nav, rail, main, panel.
 */
export function AppFrame({ topNav, rail, main, panel, footnote }) {
  return (
    <div className="vf-frame">
      {topNav}
      <div className="vf-body">
        {rail}
        {main}
        {panel}
      </div>
      {footnote ? <div className="vf-footnote vf-t-meta">{footnote}</div> : null}
    </div>
  );
}
