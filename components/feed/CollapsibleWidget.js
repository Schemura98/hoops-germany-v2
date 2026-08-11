"use client";

import { useState } from "react";
import { PiCaretDownBold } from "react-icons/pi";

/**
 * Einklappbarer Wrapper für die Feed-Seitenwidgets (nur Mobil).
 * Die Widgets bringen ihre eigene Karte + h3-Überschrift mit – beides wird
 * hier neutralisiert ([&>div]-Overrides), sodass nur unsere Leiste den Titel
 * trägt und keine doppelte Überschrift/Rahmen entsteht.
 */
export default function CollapsibleWidget({ icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-md border border-ink-600 bg-ink-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-paper-50">
          {icon} {title}
        </span>
        <PiCaretDownBold
          className={`text-mist-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-ink-600 [&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none [&>div]:bg-transparent [&>div]:pt-3 [&>div>h3]:hidden">
          {children}
        </div>
      )}
    </div>
  );
}
