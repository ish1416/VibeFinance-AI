import React from "react";

/**
 * FeaturedCard — the single most important item on the screen (pastel lavender):
 * white pill bottom-left, black circle bottom-right, white badge top-right.
 */
export function FeaturedCard({
  badgeIcon: Badge,
  eyebrow,
  headline,
  scoreValue,
  scoreSub,
  body,
  targets = [],
  footerLeft,
  footerAction
}) {
  return (
    <article className="vf-featuredcard">
      {Badge ? (
        <span className="vf-featuredcard__badge">
          <Badge size={15} strokeWidth={1.75} aria-hidden="true" />
        </span>
      ) : null}

      <div className="vf-featuredcard__top">
        <div>
          {eyebrow ? <span className="vf-card__eyebrow">{eyebrow}</span> : null}
          <div className="vf-featuredcard__verdict">{headline}</div>
        </div>
        {scoreValue !== undefined ? (
          <div className="vf-scorebox">
            <div className="vf-scorebox__num">{scoreValue}</div>
            <div className="vf-scorebox__sub">{scoreSub}</div>
          </div>
        ) : null}
      </div>

      {body ? <p className="vf-t-body" style={{ color: "var(--vf-text-1)", opacity: 0.82 }}>{body}</p> : null}

      {targets.length > 0 ? (
        <div className="vf-targets">
          {targets.map((t) => (
            <div className="vf-target" key={t.label}>
              <div className="vf-target__lbl">{t.label}</div>
              <div className="vf-target__val" style={t.ink ? { color: t.ink } : undefined}>
                {t.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {footerLeft || footerAction ? (
        <div className="vf-featuredcard__foot">
          <div>{footerLeft}</div>
          {footerAction}
        </div>
      ) : null}
    </article>
  );
}
