// Gate-Konfiguration für parallele Prüfer — seit dem 20.08.2026 nur noch ein
// dünner Aufsatz auf die Projekt-Konfiguration.
//
// WOZU SIE DA WAR: Am 16.08.2026 hat ein Gate-Worktree Port 3000 übernommen,
// während Tobias' Browser-Gate dort maß. Zwei parallele Gates brauchen zwei
// Ports; diese Datei war der zweite.
//
// WARUM SIE JETZT FAST LEER IST: Sie war eine vollständige Abschrift der
// Projekt-Konfiguration, die sich nur im Port unterschied. Jede Verbesserung
// dort musste hier von Hand nachgezogen werden — und genau das ist nicht
// passiert: Als die Projekt-Konfiguration am 20.08.2026 auf die
// Production-Runtime umgestellt wurde, startete diese Datei weiter `npm run
// dev`. Ein zweiter Prüfer hätte also stillschweigend die schwächere Prüfung
// bekommen, unter einem Dateinamen, der Gleichwertigkeit verspricht.
//
// ⚠️ EIN PORT IST KEIN GRUND FÜR EINE ZWEITE KONFIGURATION. Der Port ist
// inzwischen eine Stellschraube der einen Konfiguration:
//
//     E2E_PORT=3210 npx playwright test -c tests/e2e/playwright.config.mjs
//
// Diese Datei bleibt nur, damit vorhandene Aufrufe und die Notizen in der
// Chronik nicht ins Leere zeigen. Neue Aufrufe nehmen bitte E2E_PORT.
process.env.E2E_PORT ||= String(process.env.GATE_PORT || 3210);

const { default: projektKonfiguration } = await import(
  "./playwright.config.mjs"
);

export default {
  ...projektKonfiguration,
  // Eigener Ablageort, damit zwei parallele Läufe sich die Screenshots und
  // Fehlerberichte nicht gegenseitig überschreiben.
  outputDir: "./.artifacts/test-results-gate6",
};
