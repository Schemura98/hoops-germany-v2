"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
  const panelRef = useRef(null);
  // Eigene Kennung je Rückfrage – auf einer Feed-Seite stehen Dutzende davon,
  // eine feste Zeichenkette würde sie alle auf denselben Text zeigen lassen.
  const frageId = useId();
  // Waagerechter Ausgleich, damit das Panel im Fenster bleibt (Befund B1).
  const [versatz, setVersatz] = useState(0);

  // ⚠️ DIE FOKUSQUELLE MUSS HIER GEMERKT WERDEN, NICHT IM EFFEKT (Befund
  // Tobias B2, 22.08.2026 – Rückkehr von Kais Befund vom 11.08.2026).
  // Im Effekt ist es zu spät: Der Bestätigen-Knopf holt sich per `autoFocus`
  // den Fokus, bevor der Effekt läuft. Gemerkt wurde deshalb der Knopf IM
  // Panel – und der ist beim Schließen weg, also landete der Fokus auf
  // `BODY`. Wer nur mit der Tastatur arbeitet, wurde damit an den Seitenanfang
  // zurückgeworfen. ⚠️ Der Kommentar unten behauptete die Rückgabe seit dem
  // 11.08.2026, und sie fand nie statt: eine gedruckte Zusicherung ohne Deckung.
  function oeffnen(e) {
    triggerRef.current = e?.currentTarget || document.activeElement;
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    // Fokus beim Schließen zum Auslöser zurückgeben – gemerkt wird er in
    // `oeffnen()`, siehe die Begründung dort.
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
      // Rückfall: Ist nach dem Schließen kein gemerkter Auslöser da, ist das
      // erste bedienbare Element in der Hülle genau er – das Panel existiert
      // dann nicht mehr.
      const ziel =
        triggerRef.current || wrapRef.current?.querySelector("button, [tabindex]");
      ziel?.focus?.();
    };
  }, [open]);

  // ⚠️ B1 (Blocker, Befund Tobias am 22.08.2026): DAS PANEL LAG AUSSERHALB DES
  // BILDSCHIRMS. Es wird absolut am Auslöser ausgerichtet (`right-0` bzw.
  // `left-0`). Sitzt der Auslöser weit links – etwa der Löschknopf an einem
  // Kommentar bei x = 141 –, beginnt ein 288 px breites, rechtsbündiges Panel
  // zwangsläufig bei −115. Gemessen lag der Knopf „Löschen" bei einer Antwort
  // zu **100 %** außerhalb des Fensters, und die Seite wird dabei nicht breiter
  // (`scrollWidth` unverändert), man kann also nicht einmal hinscrollen.
  //
  // ⚠️ `max-w-[calc(100vw-2rem)]` half nicht: Es begrenzt die BREITE, nicht die
  // LAGE. Und `align="left"` allein hilft auch nicht – dann ragt dasselbe Panel
  // auf schmalen Fenstern rechts hinaus.
  //
  // Deshalb wird nach dem Öffnen GEMESSEN und waagerecht ausgeglichen. Das gilt
  // für jede Ausrichtung, jede Fensterbreite und jede künftige Verwendung –
  // eine Ausrichtung pro Aufrufstelle zu setzen hieße, die Falle beim nächsten
  // Einsatz erneut zu stellen.
  useLayoutEffect(() => {
    if (!open) {
      setVersatz(0);
      return;
    }
    function ausgleichen() {
      const el = panelRef.current;
      if (!el) return;
      // Ohne bestehenden Ausgleich messen, sonst misst sich die Korrektur selbst
      // (Merksatz aus CLAUDE.md: eine Messung darf ihre eigene Stellgröße nicht
      // verändern).
      el.style.transform = "";
      const kasten = el.getBoundingClientRect();
      const rand = 8;
      let d = 0;
      if (kasten.left < rand) d = rand - kasten.left;
      else if (kasten.right > window.innerWidth - rand)
        d = window.innerWidth - rand - kasten.right;
      setVersatz(d);
    }
    ausgleichen();
    window.addEventListener("resize", ausgleichen);
    return () => window.removeEventListener("resize", ausgleichen);
  }, [open, message]);

  async function handleConfirm() {
    await onConfirm?.();
    setOpen(false);
  }

  return (
    <span ref={wrapRef} className="relative inline-block">
      {trigger({ onClick: oeffnen, open })}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={frageId}
          style={versatz ? { transform: `translateX(${versatz}px)` } : undefined}
          className={`absolute z-20 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-navy-600 bg-navy-800 p-4 ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          {/* ⚠️ `aria-labelledby`: Der Bestätigen-Knopf holt sich beim Öffnen den
              Fokus, damit wird der Warnsatz mit der Anzahl sonst nicht zwingend
              vorgelesen – ausgerechnet der Satz, der die Folgen ankündigt
              (Befund Tobias B5). */}
          <p id={frageId} className="text-sm font-medium text-paper-50">{message}</p>
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
