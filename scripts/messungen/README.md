# Messskripte zum gespiegelten Feldende der Startseite

Angelegt am 21.08.2026. ⚠️ **Sie liegen im Repo und nicht in `tmp/`, und das ist der
ganze Punkt:** `tmp/` ist gitignored. Genau so hat die falsche Zeile „Kanal nie schmaler
als 107 px" zwei Gate-Runden überlebt — die Zahl stand im Bericht, das Messwerkzeug nirgends,
und niemand konnte sie nachrechnen, ohne es neu zu bauen (Roadmap 32 e).

Jede Zahl, die in `CLAUDE.md` oder `docs/CHRONIK.md` über das Feldende steht, stammt aus
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

⚠️ **Zu `ankunft.mjs`, weil der Fehler lehrreich ist:** Die erste Fassung suchte die erste
Scrollposition, an der sich der Ball nicht mehr bewegt — und fand die **Ruhe VOR dem Flug**
(bei `f = 0` steht er ebenfalls still). Sie meldete „Ankunft 1335 px unter der Leiste" auf
einem 640-px-Fenster. Richtig ist: erst die Endlage bestimmen, dann die erste Position
suchen, an der sie erreicht ist.
