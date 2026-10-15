import React from "react";

/**
 * SearchPill — the right-aligned search control in the page header.
 */
export function SearchPill({ icon: Icon, value, onChange, placeholder, label }) {
  return (
    <label className="vf-searchpill">
      {Icon ? <Icon size={15} strokeWidth={1.75} aria-hidden="true" /> : null}
      <span className="vf-sr-only">{label || placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
