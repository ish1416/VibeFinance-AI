import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * TopNav — product wordmark + live micro-label on the left, a horizontal icon
 * nav in the centre (one active pill, the rest icon-only) and the account
 * cluster on the right. The small notch under the bar is pure decoration (CSS).
 */
export function TopNav({
  productName = "VibeFinance AI",
  mark = "V",
  liveLabel = "",
  tabs = [],
  activeTab,
  onSelectTab,
  user = {},
  menuItems = []
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="vf-topnav">
      <div className="vf-brand">
        <span className="vf-brand__mark" aria-hidden="true">{mark}</span>
        <span className="vf-brand__name">{productName}</span>
        <span className="vf-brand__live">
          <span className="vf-dot vf-dot--pulse" aria-hidden="true" />
          <span className="vf-t-micro vf-brand__micro">{liveLabel}</span>
        </span>
      </div>

      <nav className="vf-nav" aria-label="Primary">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={`vf-nav__item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
              onClick={() => onSelectTab(tab.id)}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {isActive ? <span>{tab.label}</span> : null}
            </button>
          );
        })}
      </nav>

      <div ref={menuRef} style={{ justifySelf: "end", position: "relative" }}>
        <button
          type="button"
          className="vf-user"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="vf-avatar" aria-hidden="true">{user.initials}</span>
          <span className="vf-user__meta">
            <span className="vf-user__name">{user.name}</span>
            <span className="vf-user__sub">{user.sub}</span>
          </span>
          <ChevronDown size={14} strokeWidth={1.75} color="#8A8A94" aria-hidden="true" />
        </button>

        {menuOpen && menuItems.length > 0 ? (
          <div className="vf-menu" role="menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={`vf-menu__item${item.danger ? " is-danger" : ""}`}
                  onClick={() => {
                    setMenuOpen(false);
                    item.onClick?.();
                  }}
                >
                  {Icon ? <Icon size={15} strokeWidth={1.75} aria-hidden="true" /> : null}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
