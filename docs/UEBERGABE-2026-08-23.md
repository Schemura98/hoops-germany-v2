# Übergabe 23.08.2026 (abends) — Stand vor Patricks /clear

**Zweck:** Patrick leert den Chat-Kontext. Diese Datei + CLAUDE.md Abschnitt 0 sind der
vollständige Einstieg für die nächste Sitzung. CLAUDE.md gilt bei Widerspruch.

## Wo die Plattform steht

- **Live ist `f8c67b4`** (Anzeigetafel-Runde: echte Hallentafel als Stilmittel,
  Linien-Sprache 2/4/6-px-Radien plattformweit, Ronjas M1–M3, Tryout-Dedup) — am Server
  verifiziert, 16 Routen 200, Fehlerlog leer. Details + Rollback-Kette in Abschnitt 0.
- Davor am selben Tag deployt: `248d5e3` (Spieler-/Vereinsseiten-Pakete A–D) und die
  komplette Analyse-/Gate-Kette. Suite-Stand: **369 grün / 0 rot / 1 übersprungen**
  (370 in 39 Dateien).

## Committet, NICHT deployt: `89f0de8`

1. **Signup-Feldmotiv (Desktop):** `components/layout/AuthCourt.js` (neu, dritte
   Zeichnung aus `feldmasse.js`), `AuthShell.js` mit optionalem `motiv`-Weg,
   `app/signup/page.js` nutzt ihn. /login bewusst unverändert (Wächter-Fall prüft das).
   Vorgeprüft: `signup-ohne-js.spec.mjs` 2/2 grün, design-audit ohne Abweichung, kein
   Querlauf 390–1440, /login bitgleich. **Nächster Schritt: beide Gates (Kai + Tobias),
   dann Deploy** — Patrick wollte das neue Motiv; Deploy-Freigabe für diesen Stand ist
   noch nicht ausgesprochen, also vor dem Deploy kurz bestätigen lassen oder mit der
   Tour zusammen ausliefern.
2. **Team-Admin-Tour: Konzept fertig, Bau offen.**
   `docs/TEAMADMIN-TOUR-KONZEPT-2026-08-23.md` (Nele) — 6 Schritte mit finalen
   Wortlauten, Auslöse-Logik (`Player.adminTourSeen`-Vorschlag, Vorrang-Regel gegen
   Doppel-Tour beim frischen Gründer), Mechanik-Empfehlung (Dialog-Folien, keine
   Spotlights), Negativliste (kein Live-Ticker-Versprechen!), Analytics
   (`admin_tour_step`). **Das ist der Hauptauftrag der nächsten Sitzung.** Danach:
   update-feedback-analytics + update-onboarding-surfaces Skills, Lina-Check, Gates.

## Offene Fragen an Patrick (gesammelt)

- **Tour (Nele §7):** (1) Bestands-Admins die Tour einmal zeigen? (Empfehlung ja)
  (2) Trägt „zehn Minuten" für einen vollen Box-Score? (3) Tryouts nur als Fußzeile?
  (Empfehlung ja)
- **Tester-Drucksachen:** Testerkarte + Visitenkarte teilen Kanal `?src=karte` —
  eigener Kanal `testerkarte` gewünscht? · vor Druck: QR echt mit dem Handy scannen,
  Proof bestellen (Navy-Vollflächen), „57 NRW-Ligen" live gegenprüfen ·
  Nele-Kleinigkeit: „zwei Minuten" (Flyer) vs. „5 Minuten" (Testerkarte).
- Ältere offene Entscheidungen: rounded-full-Pillen vs. kantige Sprache (Vivien) ·
  /login aufs Feldmotiv nachziehen? (billig, AuthCourt existiert; Wächter-Fall dann
  bewusst anpassen) · MARKE.md-Nachtrag Print-Tafel-Regeln (Vivien wartet auf Patrick).

## Heute außerhalb des Repos passiert

- **Tester-Drucksachen erneuert** (`~/Projekte/Hoops-Marketing/Tester-Akquise/`):
  Flyer A6, Testerkarte A6, Visitenkarte im Anzeigetafel-/Linien-Design; QR-Codes
  wörtlich übernommen (modulweise verglichen, Kanäle `flyer`/`karte` unverändert);
  DSEG7 + Lizenz liegen im Ordner. Alte Fassungen umkehrbar in
  `_archiv-2026-08-15/`. Zwei Alt-Fehler dabei behoben: Visitenkarten-Tagline lief in
  den Beschnitt (88 mm auf 85-mm-Format), Testerkarte behauptete „ab U16" statt
  „ab 16 Jahren". Details: EMPFEHLUNG.md §10 im selben Ordner.
- **Vereins-Paket (Kreis Niers) bewusst NICHT angefasst** — versandfertig geprüft,
  wartet auf Roadmap 40 (Anwaltstermin F7/F8, QR-Scan, Betreiber-Anschrift).

## Für die nächste Sitzung wichtig

- Auf den zwei Dev-Testkonten ist `welcomeSeen` gesetzt; die Dev-DB trägt
  `notifiedStatsPlayers` auf den Spielen vom 13.07. + 19.07. (Gate-Spuren, gewollt).
  Unbenachrichtigt: 25.07., 05.08., 17.08., 20.08.
- Ein Missverständnis von heute, damit es nicht wieder passiert: Patricks „einen clear
  vorbereiten" meinte das KONTEXTMENÜ (/clear), NICHT den Demo-Daten-Purge. Roadmap 2
  (Purge) ist unverändert vertagt; ein Purge-Runbook wurde NICHT erstellt.
- Konventionen wie immer: vor Deploy Build + volle Suite + beide Gates (Kai/Tobias,
  mobil zuerst), log-progress nach jedem Meilenstein, Patrick laienverständlich
  berichten (Regel in CLAUDE.md).
