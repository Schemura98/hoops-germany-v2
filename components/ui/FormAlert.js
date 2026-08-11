// Barrierefreie Formular-Meldung (Fehler/Erfolg). Ersetzt die bisher pro Seite
// duplizierten roten/grünen Boxen – gleicher visueller Stil, aber mit
// role="alert" + aria-live="polite", damit Screenreader die Meldung sofort
// vorlesen, sobald sie erscheint (z.B. nach fehlgeschlagenem Login-Versuch).
// Status ist keine Marke: entsättigte Signalfarben, Fläche nur als
// 10-%-Tönung der jeweiligen Farbe auf dem dunklen Grund.
const VARIANTS = {
  error: "bg-signal-error/10 border-signal-error/50 text-signal-error",
  success: "bg-signal-ok/10 border-signal-ok/50 text-signal-ok",
};

export default function FormAlert({ type = "error", className = "", children }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-sm border px-4 py-3 text-sm ${VARIANTS[type] || VARIANTS.error} ${className}`}
    >
      {children}
    </div>
  );
}
