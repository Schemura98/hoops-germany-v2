# Gate-Bericht Tobias: Anzeigetafel-Runde (23.08.2026)

Geprüft: der ungeprüfte Anzeigetafel-Stand (Tafel-Design, Mittelweg, Radien 2/4/6,
M1–M3, Tryout-Dedup) am Production-Build auf localhost:3000 (Zombie-Check über die
ausgelieferte BUILD_ID). Mobil 360/390 + Desktop 1280; da die Browser-Vorschaufläche
erneut keine echten Mausklicks durchließ, liefen klick-kritische Wege zusätzlich mit
Playwright gegen echtes Chromium (echte Klicks).

## Urteil: freigabefähig mit einer Auflage — Auflage UMGESETZT

**⚠️ Die Auflage (hoch):** Der /match-Kopf — die prominenteste Tafel der Plattform —
hatte Patricks Geist-Korrektur nicht bekommen: Der Geist stand dort als
zusammenhängender „88"-Schriftzug hinter dem mittigen Wert (gemessener Versatz
Ziffer↔Geist bis ±9,7 px, auf 1280 lugten Geist-Reste beidseitig hervor — exakt das
beauftragt korrigierte Bild). Ursache: ein dokumentierter Sonderpfad in
`SegmentZahl.js` (children/SplitFlap, „nicht in Zellen zerlegbar").
**Nacharbeit (nach dem Gate):** Der Sonderpfad ist ABGESCHAFFT — es gibt nur noch den
Zellen-Pfad; die Wertreihe ist eine eigene, zellengleich breite Ebene und klappt auf
/match als Ganzes um (`flap`/`flapDelay`/`gedimmt`-Props statt children). Am
gerenderten Bild nachgesehen: beide Match-Fenster jetzt zellengleich mit allen
anderen Fenstern.

## Bestanden (Auszug, alles am laufenden Produkt gemessen)

- **Geist-Gleichmäßigkeit** an Karriere-Bilanz (alle 7 Fenster, Versatz je Zelle
  exakt 0, auch nach Saison-Wechsel) und Liga-Karte ✓ — nur der /match-Kopf wich ab
  (s. Auflage).
- **Einschalt-Moment:** Werte vor dem Hereinscrollen unsichtbar, danach gestaffelte
  Blende + Hochzählen bis exakt auf die Sollwerte, einmalig; reduzierte Bewegung →
  alles sofort sichtbar ✓.
- **Beleg-Lampe auf drei Flächen deckungsgleich mit der DB** (2× gefüllt, 4× Umriss;
  /match belegt „Von beiden Teams bestätigt", admin-gesetzt „Ergebnis steht") ✓.
- **M1:** „Dein letztes Spiel" mit S 78:71 und „14·5·2 Deine PKT·AST·REB", echter
  Klick → /match; auf fremden Profilen und ausgeloggt NICHT vorhanden ✓.
- **Tryout-Dedup:** Transfermarkt-Kasten NUR im Steckbrief-Reiter; Felder auf
  navy-700 (Familie 14/15 behoben); Weiterweg-Links echt geklickt → /transfermarkt
  bzw. /tryouts ✓. **M2:** Liga-Zeile auf allen /teams-Karten ✓.
- **Scharfe Kanten:** Radien-Inventur 4 Seiten — ausschließlich 2/4 px, Avatare/Chips
  rund, nichts wirkt ungestylt; Querlauf 320/360/390 = 0 ✓.
- **Konsole/Netzwerk:** 0 unerklärte Fehler (der eine 404 war Tobias' eigener
  falscher Slug, sauber abgefangen) ✓.

## Niedrig / Notizen

- Beleg-Lampen-Zugänglichkeit: Die Mini-Lampe der Teamseiten-Zeilen trägt title +
  sr-only über das Primitiv (nachgeprüft im Code); die handgesetzte Lampe im
  Ergebnisse-Tab ist bewusste Kulisse (aria-hidden) neben tragendem Text. Kein
  Handlungsbedarf; Tobias' Sonde hatte die inneren aria-hidden-Kreise gemessen.
- Nicht geprüft: Einschalt-Moment an /match-Kopf und Liga-Karte einzeln, Ladezustände
  unter Drosselung, der TransferControl-Schalter selbst (Schreibgefahr — beide
  Zustände über zwei Konten gesehen), echte Screenreader/Geräte.
- Prüfspur: `mark-welcome-seen` für max ausgelöst (Sollzustand laut Auftrag).

## Kai-Gate derselben Runde

Siehe `docs/GATE-KAI-ANZEIGETAFEL-2026-08-23.md` — freigabefähig ohne Auflage; sein
Wächter ist als `tests/e2e/anzeigetafel.spec.mjs` übernommen (4 Fälle, Mutationsmatrix
4/4). Seine Empfehlung (a) — „Ergebnis steht" nicht mehr in Grün neben ungefüllter
Lampe — ist umgesetzt (`ErgebnisseTab.js`, Grün nur beim belegten Fall).
