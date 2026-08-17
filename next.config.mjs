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

  async headers() {
    return [
      {
        // ══ CACHE-VORGABE FÜR /images/ (Roadmap 21, Befund Kai) ═════════════
        // `deploy/nginx-hoopsgermany.conf` setzt `expires 30d` nur für die
        // Upload-Verzeichnisse. `/images/` läuft über `location /` in den
        // Next-Prozess, und der lieferte diese Dateien ohne jede Vorgabe aus.
        // Mit dem Deploy vom 17.08.2026 wurde das teuer: Die Ball-Sequenz der
        // Startseite ist **107 KB (AVIF) / 164 KB (WebP)** und liegt auf der
        // Einstiegsseite jedes Erstbesuchers — ohne Vorgabe bei **jedem**
        // Aufruf neu, nicht einmalig.
        //
        // ⚠️ WARUM 30 TAGE UND NICHT EIN JAHR MIT `immutable`:
        // Die Dateinamen sind **nicht inhaltsadressiert**. `ball-basketball-
        // 32x200.webp` nennt Bildzahl und Kantenlänge, aber nichts über den
        // Inhalt — wird die Sequenz mit denselben Parametern neu erzeugt (etwa
        // mit anderem Nahtmuster), heißt die Datei gleich. `immutable` mit
        // einem Jahr würde Wiederkehrer dauerhaft auf dem alten Ball
        // festhalten, und niemand könnte es sehen, weil die Seite bei
        // Erstbesuchern korrekt aussieht. Genau die Fehlerklasse aus
        // docs/MUSTER-ZAHLEN-DIE-LUEGEN.
        // 30 Tage spiegeln bewusst die Konvention, die für die Uploads schon
        // gilt. `stale-while-revalidate` gibt danach eine schnelle Antwort und
        // erneuert im Hintergrund.
        //
        // ⚠️ WER DEN INHALT EINER DATEI UNTER GLEICHEM NAMEN ÄNDERT, MUSS DEN
        // NAMEN ÄNDERN. Für die Ball-Sequenz ist das an drei Stellen gekoppelt
        // und durch `tests/e2e/ball-sequenz.spec.mjs` abgesichert; für
        // `logo.svg` und die Auth-Motive gibt es diese Absicherung NICHT.
        source: "/images/:pfad*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Selbst gehostete Schriften (`lib/fonts.js` über `next/font/local`):
        // heute `geist-latin.woff2` und `geist-mono-latin.woff2`, nachladbar mit
        // `sh scripts/fetch-fonts.sh`. Next liefert sie im Seitenkontext bereits
        // unter gehashtem Pfad aus; diese Regel deckt den direkten Abruf unter
        // `/fonts/…` ab, damit dort keine Lücke bleibt.
        // ⚠️ Die Namen stehen hier, weil meine erste Prüfsonde `Geist-Regular
        // .woff2` geraten hat und 404 bekam — was aussah, als griffe die Regel
        // nicht. Sie griff; nur der Dateiname war erfunden. Ein geratener Pfad
        // in einer Prüfung ist eine Aussage über die Prüfung, nicht über den Code.
        source: "/fonts/:pfad*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
