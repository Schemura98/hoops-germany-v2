// Barrierefreie Formular-Meldung (Fehler/Erfolg). Ersetzt die bisher pro Seite
// duplizierten roten/grünen Boxen – gleicher visueller Stil, aber mit
// role="alert" + aria-live="polite", damit Screenreader die Meldung sofort
// vorlesen, sobald sie erscheint (z.B. nach fehlgeschlagenem Login-Versuch).
const VARIANTS = {
  error: "bg-red-50 border-red-200 text-red-700",
  success: "bg-green-50 border-green-200 text-green-700",
};

export default function FormAlert({ type = "error", className = "", children }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-lg border px-4 py-3 text-sm ${VARIANTS[type] || VARIANTS.error} ${className}`}
    >
      {children}
    </div>
  );
}
