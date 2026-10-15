import React from "react";
import { Search } from "lucide-react";
import { SearchPill } from "./SearchPill";

/**
 * PageHeader — page title (with optional emoji) over a muted subtitle, with the
 * search pill on the right. On narrow screens it stacks (see components.css).
 */
export function PageHeader({ title, emoji, subtitle, search, onSearchChange, searchPlaceholder }) {
  return (
    <div className="vf-pageheader">
      <div>
        <h1 className="vf-t-title">
          {title}
          {emoji ? <span aria-hidden="true"> {emoji}</span> : null}
        </h1>
        {subtitle ? <p className="vf-t-meta vf-pageheader__sub">{subtitle}</p> : null}
      </div>
      {onSearchChange ? (
        <SearchPill
          icon={Search}
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder || "Search"}
          label="Search securities and filings"
        />
      ) : null}
    </div>
  );
}
