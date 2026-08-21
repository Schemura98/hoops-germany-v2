# Messskripte zur Startseite (Feldende und Hero)

Angelegt am 21.08.2026. ⚠️ **Sie liegen im Repo und nicht in `tmp/`, und das ist der
ganze Punkt:** `tmp/` ist gitignored. Genau so hat die falsche Zeile „Kanal nie schmaler
als 107 px" zwei Gate-Runden überlebt — die Zahl stand im Bericht, das Messwerkzeug nirgends,
und niemand konnte sie nachrechnen, ohne es neu zu bauen (Roadmap 32 e).

Jede Zahl, die in `CLAUDE.md`, `docs/CHRONIK.md` oder in den Kommentaren der
`components/landing/*`-Bauteile über das Feldende **oder den Hero-Schnitt** steht, stammt aus
einem dieser Skripte.

## Voraussetzung

Ein laufender Server. **Die ausgelieferte Fassung**, nicht `next dev`:

```bash
sh scripts/port-frei.sh && npm run build && npm start
```

Der Host ist **nicht fest verdrahtet** (Kais Befund M2 an `sicherer-pfad.spec.mjs`):

```bash
MESS_BASIS=http://localhost:3100 node scripts/messungen/messen.mjs
```

Die angemeldeten Fälle brauchen das Dev-Konto `max@test.de` / `test123` — also die
**Dev-DB** `hoopsgermany`. Gegen `hoops_prod` laufen sie nicht (dort sind die Testkonten
seit dem 15.08.2026 bewusst entwertet); sie melden dann „KEIN TOKEN" und prüfen nur den
ausgeloggten Zustand, statt still den falschen Zustand zu messen.

## Die Skripte

| Datei | Beantwortet |
|---|---|
| `shot.mjs <praefix> [breite] [hoehe]` | Standbilder: Hero, Seitenende, Oberkante des Abschluss-Blocks |
| `ausschnitt.mjs <breite> <hoehe> <textteil> <name>` | **Ein Ausschnitt in DREIFACHER Auflösung.** Das Werkzeug, das den Anker-Fehler gefunden hat — die Messung meldete eine Berührung, erst die Vergrößerung zeigte, dass sie durch Buchstaben läuft |
| `messen.mjs` | Die Leiter: Abstand Text → Ladezone, Ringgröße, Bogen-Überstand, Abschnittshöhe, Pass-Lücke, Querlauf. 12 Fenster × 2 Anmeldezustände |
| `tinte.mjs` | **Berührt eine SICHTBARE Linie die Tinte?** Gemessen an den Zeilenkästen der Textknoten (`Range.getClientRects`), nicht an der Elementbox — eine mittige Zeile in einem randfüllenden `<p>` hat eine drei- bis viermal zu breite Box. Rechnet die Deckkraft des Verlaufs an der Kreuzungstiefe mit; eine Berührung bei Deckkraft 0 ist keine |
| `ankunft.mjs` | **Der Moment der Ankunft** gegen die Unterkante der haftenden Leiste (Roadmap 20 d), dazu die Lage am untersten Punkt der Seite |
| `hero-kontrast.mjs` | **Ist die Dreipunktlinie dort, wo sie den Hero-Text kreuzt, ein Strich oder ein Tonwert?** An echten Bildpunkten, nicht gerechnet — eine ausgerechnete Komposition unterschlägt die Kantenglättung, und der Strich ist auf schmalen Fenstern schmaler als ein Bildpunkt |
| `hero-naht.mjs` | **Der Schnitt Hero ↔ Seite** (Roadmap 30 e): Lage der Naht in viewBox-Koordinaten UND Feldtiefe, was dort geschnitten wird, Versatz zur Außenlinie, und die mobile Schranke für das Ausblenden. 16 Fenster × 2 Anmeldezustände |

⚠️ **Zu `ankunft.mjs`, weil der Fehler lehrreich ist:** Die erste Fassung suchte die erste
Scrollposition, an der sich der Ball nicht mehr bewegt — und fand die **Ruhe VOR dem Flug**
(bei `f = 0` steht er ebenfalls still). Sie meldete „Ankunft 1335 px unter der Leiste" auf
einem 640-px-Fenster. Richtig ist: erst die Endlage bestimmen, dann die erste Position
suchen, an der sie erreicht ist.

⚠️ **Zu `hero-kontrast.mjs`, weil der Fehler dieselbe Familie ist wie der oben:** Die
erste Fassung griff den Vergleichsgrund **14 px neben** der Linie ab. Über einer Textzeile
steht dort oft ein **Buchstabe** — gemessen wurde dann „Linie gegen paper-50" statt „Linie
gegen Fläche", und aus 1,63 : 1 wurde 10,06 : 1. Die zweite Fassung nahm als Vergleichsstelle
die Linie „über freier Fläche" — und landete bei Tiefe 0, wo die Dreipunktlinie mit der
**Grundlinie zusammenfällt**: gemessen wurde die falsche Linie, gemeldet 6,69 : 1 statt 2,5.
Beide Male war die Messung korrekt und der Gegenstand falsch. Jetzt: dunkelster Punkt im Band
± 12 px quer zur Linie, Vergleichsstellen erst ab 1 m Feldtiefe.

⚠️ **Zu `hero-naht.mjs`: die Schranke ist bewusst nur mobil hart.** „Das Ausblenden berührt
den Bogenscheitel nie" wäre die naheliegende Formulierung und ist **unerfüllbar** — der Abstand
Scheitel → Naht fällt mit wachsender Breite monoton und wird ab rund 1700 px negativ. Dort war
der Scheitel vorher hart abgeschnitten; ein Auslaufen ist an der Stelle die Abhilfe, nicht der
Schaden. Hart geprüft wird deshalb, was wirklich trägt: Auf Telefonbreiten ist der Bogen das
einzige Feldelement der unteren Bildhälfte.
