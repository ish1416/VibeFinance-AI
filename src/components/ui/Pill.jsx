import React from "react";

/** Pill — small status/label chip. tone: soft | white | outline | dashed | ok | bad | warn | info | lav | dark */
export function Pill({ tone = "soft", emoji, icon: Icon, children, className = "", ...rest }) {
  return (
    <span className={`vf-pill vf-pill--${tone} ${className}`.trim()} {...rest}>
      {emoji ? <span aria-hidden="true">{emoji}</span> : null}
      {Icon ? <Icon size={11} strokeWidth={1.75} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
