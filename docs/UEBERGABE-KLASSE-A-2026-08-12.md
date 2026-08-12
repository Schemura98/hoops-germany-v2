# Übergabe an die Hoops-Session — Klasse-A-Mechaniken

Erstellt 12.08.2026 aus der **Backoffice-Session**. Patrick arbeitet ab
jetzt wieder in der Hoops-Session weiter; diese Datei ist der
Einstiegspunkt. Ergänzt `WIEDERAUFNAHME-2026-08-12.md`, ersetzt sie nicht.

## Was im Arbeitsbaum liegt (uncommittet)

**Eine Datei geändert:** `components/landing/LandingFeatures.js` —
Mechanik **A5 (Kapitelmarke)**.

Vorher trug jedes der sechs Kapitel nur eine Miniaturzeile
`1/6 · Aufstellung`. Jetzt: große Konturziffer `01` in Big Shoulders
(1,5 px Kontur in `#F68C3E`, Füllung transparent) + gepunktete Linie +
Etikett in einem Rahmen.

Geprüft: `npx next lint` sauber, `npm run build` erfolgreich.
**Nicht geprüft:** die Darstellung im Browser — die Aufnahme wäre aus der
Backoffice-Session gegen einen fremden Dev-Server gelaufen. Das ist der
erste Schritt in der Hoops-Session (`tmp/wow-shots.mjs` als Vorbild).

Drei bewusste Entscheidungen, im Code kommentiert:
1. Die Ziffer ist Dekoration (`aria-hidden`); die Zählung steht als
   `sr-only`-Text „Schritt x von 6" daneben — sonst verlöre ein
   Screenreader die Gliederung, die vorher im sichtbaren Text stand.
2. Kontur statt Fläche: `VISUELLE-RICHTUNG-2026-08-12.md` weist Big
   Shoulders ausdrücklich „große Zahlen" zu; gefüllt würde die Ziffer die
   Überschrift daneben erschlagen.
3. Die Linie wächst nur bis `w-12` und entfällt unter `sm` — sie soll
   gliedern, nicht die Textspalte teilen.

⚠️ **Für Viviens Gate:** Sie hatte Konturschrift „sparsam, an genau einer
Stelle" vorgesehen (`INSPIRATION-SCROLL-2026-08-12.md`, Bucks Sauce).
Sechs Kapitelziffern sind eine **Auslegung** dieser Vorgabe, keine
Umsetzung — strukturelle Marken statt einer Schauschrift. Wenn sie das
anders sieht, ist die Änderung eine Datei und in einer Minute zurückgedreht.

## Woher die Mechanik-Liste kommt

Patrick hat das Referenzvideo neu geliefert: `Scroll Flow.mp4`
(90,5 s, **1920×1080** statt vorher 502×868, ohne glänzenden Tisch),
abgelegt unter `Desktop\General Backoffice\_medien-eingang\`.

Neu ausgewertet mit `watch` (Frames auf die Bildschirmfläche zugeschnitten
per `crop=600:440:685:290`, dann Kontaktbögen). **Drei Mechaniken waren in
der ersten Auswertung unsichtbar** und fehlen deshalb in
`INSPIRATION-SCROLL-2026-08-12.md`:

- **A1 — Überschrift läuft über beide Bildränder hinaus.** „THE ULTIMATE
  ICE TEA" ist breiter als der Bildschirm und wird angeschnitten. Die
  billigste starke Wirkung im ganzen Material.
- **A2 — Das Objekt verdeckt die Schrift.** Der Tiefeneindruck entsteht
  durch Verdeckung (`z-index`), nicht durch unterschiedliche
  Scroll-Geschwindigkeit allein. Die erste Auswertung nannte nur die
  Geschwindigkeit.
- **A5 / A7 — Kapitelziffer und Etikettenkarten.** Bucks Sauce galt in der
  ersten Auswertung nur als „Konturschrift plus Zitat-Wand"; tatsächlich
  trägt die Seite ein Kapitelsystem aus riesiger Kontur-Ziffer, Etikett
  („SMALL BATCHES") und gepunkteter Linie, dazu schwebende beschriftete
  Plaketten zwischen freigestellten Motiven.

Der vollständige, nach **Kosten** sortierte Katalog liegt global und gilt
für alle Projekte: `~/.claude/skills/design-trend-recherche/mechanik-katalog.md`.

## Was von Klasse A noch offen ist — und warum ich es NICHT gebaut habe

| Mechanik | Stand | Warum nicht hier |
|---|---|---|
| A1 überbreite Überschrift | offen | Starker gestalterischer Eingriff an Hero/Sektionstitel — Viviens Entscheidung, nicht meine |
| A2 Verdeckung | teilweise vorhanden | Der Ball kreuzt den Hero bereits (`HeroScrollStage`); die bewusste Verdeckung der Headline wäre eine Verhaltensänderung an der live stehenden Stelle |
| A3 Kapitel = Farbwechsel | offen | Betrifft die ganze Seite; gehört in Viviens Konzept, nicht in einen Einzeleingriff |
| A4 Konturschrift (Schauschrift) | offen | Viviens „genau eine Stelle" ist noch nicht gewählt |
| A6 Punkte-Leiste | **vorhanden** | `FeatureProgressRail.js` |
| A7 Etikettenkarten | offen | Braucht Inhalt (welche Aussagen?) — das ist Neles Feld, nicht Gestaltung allein |
| A9 geteilte Überschrift ums Objekt | offen | Hängt an derselben Hero-Ball-Frage wie A10 |
| **A10 ein Motiv trägt alle Szenen** | **blockiert** | Das ist Viviens „Spielfeld als bereiste Strecke" — und ihre Frage aus `SPIELFELD-STRECKE-2026-08-12.md` Abschnitt 8 wartet auf Patrick |

**Das ist der eigentliche Engpass:** A10 ist die stärkste Mechanik von
allen (aus sechs Blöcken wird eine Erzählung), und sie hängt an genau
einer Antwort — darf die heutige Ball-Landung an der Hero-Schaltfläche
zugunsten einer einzigen späteren Landung am Ende von Szene 6 entfallen?
Solange die offen ist, sind A2, A9 und A10 nicht entscheidbar.

## Patricks Budget-Zusage vom 12.08.2026

Wörtlich: „ich wäre auch wie in Klasse B und C bereit Geld auszugeben oder
Material zur Verfügung zu stellen (falls mein Geschäftspartner mir Material
liefern kann). Das Projekt Hoops soll wirklich was besonderes werden."

**Wichtig für die Hoops-Session:** Das ist KEIN Auftrag zu kaufen. Milos
Prüfung (`WOW-MATERIAL-2026-08-12.md` §8) steht unverändert — der
K.-o.-Punkt bei KI-Videogeneratoren war nie der Preis, sondern Stil und
Format (Fotorealismus, nur Raster, kein Alphakanal). Neu und noch nicht
geprüft ist ausschließlich der Teil „**Material vom Geschäftspartner**":
echtes Hallenmaterial ist etwas anderes als generiertes.

Bevor irgendetwas beschafft wird, gehört die Grundsatzfrage beantwortet:
Die dokumentierte Richtung ist „kein Foto, Vektor" — als bewusste
Entscheidung, nicht als Notlösung. Echtes Material würde sie aufweichen.
Das ist eine Design-Richtungsfrage (Vivien + Patrick), keine
Einkaufsfrage. Sie liegt als `dec-hoops-material-richtung` in der
Backoffice-Inbox.
