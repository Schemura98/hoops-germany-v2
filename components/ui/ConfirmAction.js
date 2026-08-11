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
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Fokus beim Schließen zum Auslöser zurückgeben (der Bestätigen-Button holt
    // ihn beim Öffnen per autoFocus) – sonst verlieren Tastaturnutzer die Stelle,
    // obwohl sich das Panel als modaler Dialog ausweist
    // (Deploy-Gate-Befund Kai, 11.08.2026).
    triggerRef.current = document.activeElement;
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
      triggerRef.current?.focus?.();
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
          className={`absolute z-20 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-ink-600 bg-ink-800 p-4 ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          <p className="text-sm font-medium text-paper-50">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              autoFocus
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
