import React from "react";

/**
 * IconButton — circular action. `label` is required: icon-only controls must be
 * announced to assistive tech. tone: neutral | primary | ok | bad | ghost
 * size: md (34px) | sm (28px) | xs (24px)
 */
export function IconButton({
  label,
  icon: Icon,
  tone = "neutral",
  size = "md",
  onClick,
  pressed,
  disabled,
  className = ""
}) {
  const classes = [
    "vf-iconbtn",
    tone !== "neutral" ? `vf-iconbtn--${tone}` : "",
    size !== "md" ? `vf-iconbtn--${size}` : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
    >
      <Icon size={size === "xs" ? 14 : size === "sm" ? 15 : 16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
