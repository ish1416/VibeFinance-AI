import React from "react";
import { Pill } from "./Pill";

/**
 * ContentCard — the workhorse card: 28px badge top-right, title, clamped body,
 * a meta row, and a pinned bottom row of a status pill + an action cluster.
 */
export function ContentCard({
  badgeIcon: Badge,
  badgeTone = "green",
  eyebrow,
  title,
  desc,
  clamp = 3,
  meta = [],
  status,
  statusTone = "soft",
  statusEmoji,
  actions,
  children,
  wide = false,
  className = ""
}) {
  return (
    <article className={`vf-card${wide ? " vf-card--wide" : ""} ${className}`.trim()}>
      {Badge ? (
        <span className={`vf-card__badge vf-bg-${badgeTone}`}>
          <Badge size={15} strokeWidth={1.75} aria-hidden="true" />
        </span>
      ) : null}

      <div className="vf-card__head">
        <div style={{ minWidth: 0 }}>
          {eyebrow ? <span className="vf-card__eyebrow">{eyebrow}</span> : null}
          <h3 className="vf-t-cardtitle">{title}</h3>
        </div>
      </div>

      {desc ? <p className={`vf-t-body vf-clamp-${clamp} vf-card__desc`}>{desc}</p> : null}

      {meta.length > 0 ? (
        <div className="vf-card__meta">
          {meta.map((m, i) => (
            <span key={`${m.label}-${i}`}>
              {m.icon ? <m.icon size={11} strokeWidth={1.75} aria-hidden="true" /> : null}
              {m.label}
            </span>
          ))}
        </div>
      ) : null}

      {children}

      {status || actions ? (
        <div className="vf-card__foot">
          {status ? (
            <Pill tone={statusTone} emoji={statusEmoji}>{status}</Pill>
          ) : <span />}
          {actions ? <div className="vf-card__actions">{actions}</div> : null}
        </div>
      ) : null}
    </article>
  );
}
