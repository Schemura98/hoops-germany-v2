# Wiederaufnahme – Stand beim Pausieren am 12.08.2026

Patrick pausiert das Projekt, weil er die Agenten im General Backoffice
parallel umprogrammiert und Konflikte vermeiden will. Diese Datei ist der
Einstiegspunkt für die nächste Sitzung.

---

## 1. Wo die Live-Seite steht

**Live auf hoopsgermany.de: `07a1a0e`** – vollständig durch beide Gates
gegangen, deployt und danach gegen die echte Seite abgenommen (Navigation
10/10, keine Konsolenfehler).

Enthalten: das visuelle Redesign „Anzeigetafel" auf Navy, die Wow-Ebene
Stufen A, B und C.

**Rollback-Punkt: `562c629`** – der Stand VOR dem gesamten Redesign.
Auf dem VPS auschecken, `npm run build`, `pm2 restart hoops-v2`.

## 2. Was lokal fertig ist, aber NICHT live

**Die Bildsequenz „Sprungball"** (`c2e5796`+, siehe Git-Log). Bewusst nicht
deployt: Sie ist noch durch kein Gate gegangen. Die Live-Seite steht damit auf
einem geprüften Stand, und die Sequenz wartet auf Kai und Tobias.

Was daran fertig ist:
- `scripts/generate-swish-sequence.js` – erzeugt die Bilder. Läuft nur auf dem
  Entwicklungsrechner, gehört zu keiner Abhängigkeit der Seite.
- `public/images/swish/` – 45 Bilder, **191 KB zusammen**, transparent.
- `components/landing/SwishSequence.js` – koppelt die Bilder an den Scroll.
- Eingebaut im Abschluss-Abschnitt (`components/landing/LandingCTA.js`).

Gemessen, nicht angenommen: **0 Anfragen beim Seitenaufruf**, 45 erst beim
Scrollen bis dorthin. 60 fps bei 4×-CPU-Drosselung. Kontrast 0 Befunde.
Playwright 18/18.

⚠️ **Zwei Dinge, die ich am Material korrigieren musste** – wichtig, falls
jemand die Sequenz neu erzeugt:
1. Milos ursprüngliche 90 Bilder hatten den **Hintergrund eingebrannt**, samt
   Verlauf. Auf der flachen navy-950-Fläche wäre das ein sichtbares Rechteck
   gewesen – genau der Verlauf, den die Designrichtung ausschließt. Jetzt
   transparent, der Grund kommt von der Seite.
2. Mit Alphakanal wiegt ein Bild rund 40 % mehr. Bei 1000 px waren es 313,9 KB
   und damit über Ronjas Grenze. Deshalb wird auf 700 px rastert – die
   **SVG-Geometrie bleibt bei 1000×625**, sonst würden die fest verdrahteten
   Bahnpunkte (P0/PC/P1/RIM) nicht mehr passen.

## 3. Die offene Entscheidung, die auf Patrick wartet

**Viviens Konzept „Spielfeld als bereiste Strecke" liegt vor:**
`docs/SPIELFELD-STRECKE-2026-08-12.md`.

Sie hat die naheliegende Lösung (eine einzige seitenlange Court-Illustration)
**verworfen** – aus demselben Maßstabs-Grund, an dem ich beim Hero dreimal
gescheitert bin, nur größer: Die Gesamthöhe von Hero plus Feature-Strecke hängt
vom Textumbruch ab und ist nicht vorhersagbar; `meet` füllt das nicht sauber,
`none` würde Kreise zu Ellipsen verzerren.

Ihr Vorschlag stattdessen: Die bereits gebaute `FeatureProgressRail.js` trägt
die Kamerafahrt, ergänzt um sechs kleine Feld-Fragmente (nur Desktop) und einen
Ball-Marker, der auf der Leiste mitwandert und bei Szene 6 im Korb landet.

**→ Ihre Frage an Patrick (Abschnitt 8 ihres Dokuments):**
Darf die heutige, mehrfach feinjustierte **Ball-Landung an der Hero-Schaltfläche
aufgegeben** werden zugunsten einer einzigen, späteren Landung am Ende von
Szene 6? Das ist eine echte Verhaltensänderung an einer live stehenden Stelle.

Zwei Befunde von Ronja hat sie dabei gleich mitgelöst: die visuelle Abkopplung
zwischen Szene 3 und 4, und die auf Mobil praktisch unsichtbare Ball-Landung.

## 4. Patricks eigener Punkt für die Wiederaufnahme

Er will **seine Vision aus den vier mp4-Videos noch einmal neu prüfen lassen**.
Grundlage dafür liegt bereit:
- `docs/INSPIRATION-SCROLL-2026-08-12.md` – die Auswertung mit Bildbelegen
- Kontaktbögen: `…/scratchpad/videos/bogen-eis.jpg`, `bogen-welt.jpg`,
  `kontaktbogen.jpg` (Zwischenspeicher – **nicht dauerhaft**, ggf. neu erzeugen)
- Das Video selbst: `…/scratchpad/videos/20260812-1049-07.5652214.mp4`
- Die Skill `watch` ist eingerichtet (`/watch <pfad> [frage]`)

⚠️ **Beim Neuauswerten unbedingt beachten:** Die `watch`-Skill ruft ffmpeg mit
`-vsync` auf, das in ffmpeg 9 entfernt wurde. Der Aufruf bricht dann ab und
liefert **null Bilder** – druckt aber trotzdem eine Bildliste. In
`~/.claude/skills/watch/scripts/frames.py` sind beide Stellen auf `-fps_mode`
geändert; **ein Update der Skill überschreibt das**. Nach jedem Lauf prüfen:
`ls <out-dir>/frames | wc -l`.

## 5. Beschaffung: Milos Empfehlung lautet „nichts kaufen"

Geprüft auf Patricks Frage nach einem Videogenerator-Abo als Ersatz für den
abgelehnten Dreh-Termin. K.-o.-Punkt ist nicht der Preis, sondern der Stil:
Die Modelle sind auf Fotorealismus trainiert, liefern nur Raster und keinen
Alphakanal. Details: `docs/WOW-MATERIAL-2026-08-12.md`, Abschnitt 8.

Sein Gegenvorschlag (Physik-Bibliothek für glaubwürdigere Ballbewegung) wäre
eine reine **Erzeugungs-Abhängigkeit** – sie läuft auf dem Entwicklungsrechner,
nicht im Browser, und kostet kein Byte Ladezeit. Noch nicht entschieden.

## 6. Offene Punkte aus den Gates

- **`components/ui/Card.js` hat 0 Importe**, `cardClass` 0 Verwendungen –
  126 Stellen bauen die Panel-Fläche von Hand. Eine Änderung an der
  Kartensprache wirkt deshalb nicht zentral. Größter offener Konsistenz-Posten;
  Umbau bewusst zurückgestellt (hohes Regressionsrisiko, kein sichtbarer Gewinn).
- **Tobias' Klick-Werkzeug fällt wiederholt aus.** In drei Sitzungen in Folge.
  Seine Desktop-Befunde sind belastbar, mobil musste ich zweimal selbst
  nachprüfen (`tmp/mobil-tastatur-check.mjs`). Wenn das so bleibt, ist sein
  Browser-Gate nur noch die halbe Zusicherung.
- **Nie zwei Agenten gleichzeitig in den Browser schicken.** Milos Demo hat
  Tobias' ersten Durchlauf unbrauchbar gemacht.
