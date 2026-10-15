import React from "react";

/**
 * SegmentedTabs — a pill track where the active item is white with a soft shadow.
 */
export function SegmentedTabs({ items, value, onChange, label }) {
  return (
    <div className="vf-seg" role="tablist" aria-label={label}>
      {items.map((item) => {
        const isActive = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`vf-seg__item${isActive ? " is-active" : ""}`}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
