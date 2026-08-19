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
        // Anlass war die Ball-Sequenz der Startseite (107 KB AVIF / 164 KB
        // WebP) auf der Einstiegsseite jedes Erstbesuchers.
        //
        // ⚠️ DER ANLASS IST AM 19.08.2026 ENTFALLEN, DIE VORGABE BLEIBT.
        // Der Hero zeichnet seit dem Umbau „Der Abschluss" reine Vektoren
        // (components/landing/HeroDunk.js); Ball-Sequenz und Swish-Sequenz sind
        // gelöscht, die Startseite lädt wieder **null Bytes Bilddaten**. Unter
        // `/images/` liegen weiterhin `logo.svg` und die Motive der
        // Anmeldeseiten — für die gilt dieselbe Rechnung, nur in kleiner.
        //
        // ⚠️ WARUM 30 TAGE UND NICHT EIN JAHR MIT `immutable`:
        // Die Dateinamen sind **nicht inhaltsadressiert**. Ein Name wie
        // `login-image-1000.avif` nennt Motiv und Kantenlänge, aber nichts über
        // den Inhalt — wird die Datei mit denselben Parametern neu erzeugt,
        // heißt sie gleich. `immutable` mit einem Jahr würde Wiederkehrer
        // dauerhaft auf dem alten Stand festhalten, und niemand könnte es
        // sehen, weil die Seite bei Erstbesuchern korrekt aussieht. Genau die
        // Fehlerklasse aus docs/MUSTER-ZAHLEN-DIE-LUEGEN.
        // 30 Tage spiegeln bewusst die Konvention, die für die Uploads schon
        // gilt. `stale-while-revalidate` gibt danach eine schnelle Antwort und
        // erneuert im Hintergrund.
        //
        // ⚠️ WER DEN INHALT EINER DATEI UNTER GLEICHEM NAMEN ÄNDERT, MUSS DEN
        // NAMEN ÄNDERN. Für die Ball-Sequenz war das über drei Stellen
        // gekoppelt und durch einen Test abgesichert; **seit deren Löschung
        // gibt es diese Absicherung für KEINE Datei unter `/images/` mehr** —
        // weder für `logo.svg` noch für die Auth-Motive. Das ist keine
        // Verschlechterung durch den Umbau (sie fehlte dort schon vorher),
        // aber es ist jetzt der Normalfall statt der Ausnahme.
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
