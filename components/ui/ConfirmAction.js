"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

/**
 * Wiederverwendbares zweistufiges Bestätigungs-Panel für destruktive oder
 * folgenreiche Aktionen – ersetzt window.confirm() im Markendesign
 * (mobiltauglich, mit den vorhandenen Button-Primitiven). Stilistisch am
 * bestehenden „Konto löschen"-Panel aus app/player/edit-profile orientiert,
 * nur als kompaktes Popover statt großer Karte, damit es auch in dichten
 * Listenzeilen (z.B. neben einem Icon-Button) passt.
 *
 * Verwendung:
 * <ConfirmAction
 *   trigger={({ onClick }) => (
 *     <button onClick={onClick} title="Entfernen"><FaTrash /></button>
 *   )}
 *   message="Diesen Eintrag wirklich entfernen?"
 *   confirmLabel="Entfernen"
 *   busy={someBusyFlag}
 *   onConfirm={async () => { ... }}
 * />
 */
export default function ConfirmAction({
  trigger,
  message,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  confirmVariant = "danger",
  busy = false,
  onConfirm,
  align = "right",
  panelClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleConfirm() {
    await onConfirm?.();
    setOpen(false);
  }

  return (
    <span ref={wrapRef} className="relative inline-block">
      {trigger({ onClick: () => setOpen(true), open })}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className={`absolute z-20 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          <p className="text-sm font-medium text-gray-800">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={confirmVariant}
              size="sm"
              onClick={handleConfirm}
              disabled={busy}
            >
              {busy ? "…" : confirmLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      )}
    </span>
  );
}
