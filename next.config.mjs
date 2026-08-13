/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build-Ausgabe per Umgebungsvariable umlenkbar (13.08.2026): `next dev`,
  // `next build` und `next start` teilen sich sonst dasselbe `.next` und
  // zerstören sich gegenseitig die Artefakte, wenn sie parallel laufen
  // (dokumentierte Fehlerklasse in CLAUDE.md Abschnitt 0). Ein Verifikations-
  // Dev-Server kann jetzt mit NEXT_DIST_DIR=.next-dev neben einer laufenden
  // Production-Runtime existieren. Ohne gesetzte Variable ändert sich nichts —
  // VPS-Deploy und lokale Standard-Läufe nutzen weiter `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
