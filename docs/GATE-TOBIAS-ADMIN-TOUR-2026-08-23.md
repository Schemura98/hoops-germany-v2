# Tobias-Gate · Team-Admin-Tour + Signup-Feldmotiv (HEAD `1110fdf`, Production-Build, 23.08.2026)

**Gate-Urteil: freigabefähig** — beide Prüfgegenstände zeigen am laufenden Produkt keinen
Fehler; die einzige Auflage richtet sich nicht an den Code, sondern an den Prüfbetrieb:
Ein einziger echter Klick-Durchlauf (Kais E2E mit echten Eingabe-Events oder Patrick am
Handy) sollte die programmatisch belegten Klickpfade bestätigen, bevor deployt wird.
*(Nachtrag der Sitzung: Kais Wächter `admin-tour.spec.mjs` fährt echte Playwright-Klicks
auf 360×800 und 1280×800 — die Auflage ist damit erfüllt.)*

## Wichtige Einschränkung dieser Sitzung (Umgebung, nicht Produkt)

Das Klick-, Tasten-Aktivierungs- und Scroll-Werkzeug der Browser-Vorschau war in dieser
Sitzung **funktionslos** (Klicks: 30-s-Timeout ohne Wirkung; Radscroll: nachweislich keine
Bewegung auf einer scrollbaren Seite; Enter/Space aktivierten fokussierte Knöpfe nicht,
obwohl das Tastenereignis ankam — der Escape-JS-Handler reagierte). **Alle Knopf-Wege
wurden deshalb per programmatischem `click()` ausgelöst — kein echter Mausklick.** Die
Treffbarkeit wurde stattdessen gemessen: je Knopf `elementFromPoint` in der Knopfmitte
plus „liegt vollständig im Fenster".

## Prüfgegenstand 1: Team-Admin-Tour — geprüft ✓ (mit Messwerten)

- **Auto-Start nicht über Skeleton** ✓ — Seite jeweils fertig gerendert; im Code
  abgesichert (Tour erst im „ready"-Zweig gemountet).
- **Alle 6 Schritte, Wortlaute** ✓ — auf 360×800 jeden Schritt als Screenshot gelesen:
  Texte decken sich mit dem Konzept, inkl. „mit eigenem Konto" in Schritt 3. Zitat-Karten
  tragen das „Beispiel"-Band. Schritt 4 ohne Karte ✓, Schritt 5 mit Tryouts-Fußzeile ✓,
  Schritt 6 mit „Nochmal von vorn" + „Zum Panel" ✓.
- **Erreichbarkeit auf allen Breiten** ✓ — 360×800, 390×844, 1280×800, 1440×900 (je alle
  6 Schritte): jeder Knopf vollständig im Fenster, `elementFromPoint` in der Mitte trifft
  ihn. Beispiel 360: „Weiter" bei x 246–337 / y 745–785. Kein Querlauf.
- **Fenster bei offener Tour von 1280 auf 360 verkleinert** ✓ — Knöpfe weiterhin
  vollständig im Fenster und treffbar.
- **„Zeig mir das" (Schritt 2)** ✓ — schließt die Tour und landet im aktiven
  Ergebnisse-Reiter.
- **Escape schließt** ✓ — mit einer **echten** Escape-Taste (zweimal, 360 und 1440);
  danach `body.overflow` wieder `visible`.
- **Scroll-Sperre** teilbelegt — bei offener Tour `overflow: hidden` am body (derselbe
  Mechanismus wie die abgenommene Spieler-Tour); eine echte Radgeste war wegen des
  Werkzeugdefekts nicht messbar.
- **Kein zweiter Auto-Start** ✓ bei `adminTourSeen: true` (in der DB verifiziert).
- **Wiederaufruf-Link** ✓ — öffnet die Tour bei Schritt 1 (auf 360 und 1440 ausgelöst).
- **Speichern beim Schließen** ✓ — setzt `adminTourSeen: true` in der Dev-DB (nur lesend
  nachgesehen).
- **Konsole/Netzwerk/Server** ✓ — 0 Konsolenfehler, 0 Serverfehler, alle Requests 200.

## Prüfgegenstand 2: Signup-Feldmotiv (`89f0de8`)

- **Desktop 1280/1440/1920** ✓ — `/signup` zeigt rechts die FIBA-Feldzeichnung als SVG
  (18 Linienelemente; 1280: 639×960 ab x 641 · 1440: 719×960 ab x 721 · 1920: 959×1080
  ab x 961), **kein Foto geladen**. Kein Querlauf. Auf 1920 im Bild kontrolliert: Zone
  mit Aufstellungsmarken, Ring als einziges Orange, Dreipunktbogen — keine Überlappung
  mit dem Formular, Text lesbar.
- **Mobil 360/390** ✓ — einspaltig, 6 Felder, kein großes SVG, kein Foto, kein Querlauf.
- **/login unverändert** ✓ — lädt weiterhin das Foto (`login-image-1000.avif`), keine
  Feldzeichnung. „Bitgleich" auf HTML-Ebene nicht gemessen — Kais Wächter-Fall.
- **Formular bedienbar** ✓ — alle 6 Felder: `elementFromPoint` an der Feldmitte trifft
  das Feld, `focus()` wird angenommen. Kein Konto angelegt.

## Befunde (priorisiert)

1. **Mittel (Koordination, kein Produktfehler):** Kais parallele Suite und dieses Gate
   teilten sich die Dev-DB — `adminTourSeen` auf `max@test.de` flippte während der
   Messungen mehrfach von außen. Dadurch wurde zunächst ein Produktfehler vermutet, der
   keiner war; bei stabiler Datenlage ist das Verhalten in beide Richtungen korrekt.
   **Übergabe an Ole/Kai:** Browser-Gate und Suite-Läufe auf dieser DB zeitlich oder per
   DB trennen.
2. **Niedrig (ungeklärt, für Kai):** Das Netzwerk-Log zeigte 5 `mark-admin-tour-seen`-
   POSTs (alle 200) bei nur einem ausgelösten Schließen. Der `schliessendRef`-Riegel
   sieht korrekt aus, ein kontrollierter Einzelaufruf erzeugte genau einen Request —
   möglicherweise ein Artefakt der defekten Werkzeug-Sitzung. Testvorschlag: ein Wächter,
   der je Schließweg genau **einen** POST zählt.

## Nicht geprüft

Echte Maus-/Touch-Klicks und Scroll-Gesten (Werkzeugdefekt) · Enter/Space-Aktivierung
und Tab-Fokusfalle · Vorrang-Fall frischer Gründer (hätte ein neues Konto gebraucht) ·
Co-Admin-Kurzfassung (nur Voll-Admin geprüft; deckt Kais Fall 6) · /login-Bitgleichheit
auf HTML-Ebene · Analytics-Ereignisnamen.

## Zustandsänderungen durch dieses Gate (Dev-DB `hoopsgermany`, ausgewiesen)

- `adminTourSeen` auf `max@test.de` steht nach dem Gate auf **`true`**.
- Die Browser-Pane meldet `navigator.webdriver: false` — die Sitzung hat **echte
  Analytics-Ereignisse** in der Dev-DB hinterlassen (pageviews,
  `admin_tour_step/skipped/completed`, mehrere Durchläufe). Wer die Abbruchkurve der
  Admin-Tour auf der Dev-DB liest, soll das wissen.
