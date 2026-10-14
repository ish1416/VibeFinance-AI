import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal — restyled dialog primitive. Closes on Escape and on backdrop click,
 * moves focus into the dialog on open and returns it to the trigger on close.
 */
export function Modal({ isOpen, onClose, icon: Icon, title, subtitle, footer, children, width }) {
  const dialogRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    lastFocused.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => {
      const focusable = dialogRef.current?.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      focusable?.focus();
    }, 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      lastFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vf-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div
        className="vf-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
        style={width ? { width } : undefined}
      >
        <div className="vf-modal__head">
          <div className="vf-modal__titlewrap">
            {Icon ? (
              <span className="vf-badge vf-bg-lilac">
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
            ) : null}
            <div>
              <h2 className="vf-t-cardtitle">{title}</h2>
              {subtitle ? <p className="vf-t-meta">{subtitle}</p> : null}
            </div>
          </div>
          <button type="button" className="vf-iconbtn" onClick={onClose} aria-label="Close dialog">
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="vf-modal__body vf-scroll">{children}</div>

        {footer ? <div className="vf-modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
