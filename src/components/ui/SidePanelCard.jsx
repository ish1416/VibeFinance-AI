import React from "react";
import { Pill } from "./Pill";

/**
 * SidePanelCard — pastel card used in the right-hand panel: icon + category and a
 * date on the top row, up to four lines of body, then a white pill and up to
 * three ghost icon buttons.
 */
export function SidePanelCard({
  tone = "blue",
  icon: Icon,
  category,
  date,
  body,
  clamp = 4,
  pillLabel,
  pillIcon: PillIcon,
  onPill,
  tools = [],
  children
}) {
  return (
    <article className={tone === "dashed" ? "vf-scard vf-scard--dashed" : `vf-scard vf-bg-${tone}`}>
      <div className="vf-scard__top">
        <span className="vf-scard__cat">
          {Icon ? <Icon size={13} strokeWidth={1.75} aria-hidden="true" /> : null}
          {category}
        </span>
        {date ? <span className="vf-scard__date">{date}</span> : null}
      </div>

      {body ? <p className={`vf-scard__body vf-clamp-${clamp}`}>{body}</p> : null}

      {children}

      {pillLabel || tools.length > 0 ? (
        <div className="vf-scard__foot">
          {pillLabel ? (
            <button type="button" onClick={onPill} style={{ display: "inline-flex" }}>
              <Pill tone="white" icon={PillIcon}>{pillLabel}</Pill>
            </button>
          ) : <span />}
          {tools.length > 0 ? (
            <span className="vf-scard__tools">
              {tools.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  className="vf-iconbtn vf-iconbtn--xs vf-iconbtn--ghost"
                  aria-label={tool.label}
                  title={tool.label}
                  onClick={tool.onClick}
                >
                  <tool.icon size={14} strokeWidth={1.75} aria-hidden="true" />
                </button>
              ))}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
