# Inspirations-Notiz — Hero-Neuansatz Startseite

**Auftrag:** Patrick nimmt den Hero der Startseite als Ganzes zurück
(„die Hero Animation sieht nicht gut aus … alles zusammen — neu ansetzen").
Richtung ausdrücklich offen, **einschließlich „gar keine Scroll-Animation"**.

**Stufe: L.** Begründet: Es ist ein Richtungsentscheid für die
Signature-Fläche mit ausdrücklichem Wow-Anspruch, und die Grundfrage
(Bewegung ja/nein) war offen. Nicht M — es ist keine Fläche „innerhalb einer
entschiedenen Formensprache", sondern die Rücknahme einer erst am Vortag
getroffenen Entscheidung.

**Suchschnitt:** Sport-Community, Amateur-Vereinsumfeld, **mobil zuerst
(360 px)**, Zielgruppe Liga-Spieler 16–30, kostenlos, **kein Bildbudget**
(die Startseite lädt null Byte Bilddaten, und das bleibt so).

---

## Register vor Suche — was übernommen und was NICHT neu gesucht wurde

Der L-Sweep vom **19.08.2026** (Hero-Motiv „Slam Dunk als Linienzeichnung")
liegt vollständig im `referenz-register.md` und wurde **nicht wiederholt**.
Übernommen ohne neue Suche:

- **Sorte A ist für diese Aufgabe wertlos** — dritter Beleg in Folge. Jede
  prämierte Sportseite setzt ein Foto-/3D-Budget voraus, das wir nicht haben.
- **Übertragbare Regel 1 (Kontrast):** Eine Linie ist kategorisch billiger als
  eine Fläche. Trägt hier unverändert — und ist der Grund, warum die neue
  Zeichnung ohne jede Abdunkelungsmechanik auskommt.
- **Übertragbare Regel 3 (Layout):** Der Umschalter zwischen zwei
  Kompositionen ist das **Seitenverhältnis**, nicht der Breakpoint.
- **Der Jumpman-Rechtsbefund** (stilisierte Dunk-Silhouette = eingetragene
  Marke) — mit dem Wegfall jeder Figur endgültig gegenstandslos.

⚠️ **Was der 19.08.-Sweep NICHT beantwortet hat, und genau das ist hier das
Delta:** Er hat sauber geklärt, **welches Motiv** gezeichnet wird. Er hat nie
gefragt, **wie ein Hero komponiert ist, der ohne Bildmaterial auskommen muss** —
also wo die Überschrift sitzt, wie hoch die Bühne ist, was die obere Bildhälfte
trägt. Genau dort ist er gescheitert. **Gesucht wurde deshalb ausschließlich
die Komposition, nicht das Motiv.**

---

## Referenzen

| Referenz | Sorte | Was daran stark ist | **Was ich übernehme** | **Was bewusst nicht** |
|---|---|---|---|---|
| Smashing Magazine — *„Sticky Headers And Full-Height Elements: A Tricky Combination"* (smashingmagazine.com, 09/2024) | B | Benennt die Fehlerklasse, die unser Loch erzeugt hat: Vollhöhen-Element unter klebender Kopfleiste. Verwirft `calc()` mit festem Abzug ausdrücklich als *„maintenance nightmare"* | **Die Diagnose, nicht den Fix.** Bestätigt unabhängig, dass `calc(100vh − 4rem)` keine Justierfrage ist, sondern eine Bauweise, die still falsch wird | **Die vorgeschlagene Grid-Lösung mit unsichtbarem Abstandhalter.** Sie hält den Hero weiterhin auf genau einem Bildschirm — das ist die Randbedingung, die das Loch überhaupt erzwungen hat. Wir lösen die Kopplung ganz auf, statt sie sauberer zu rechnen |
| Viewport-Einheiten `svh`/`dvh`/`lvh` (MDN · ishadeed.com · csstoolkit) | C | `100vh` ist auf Mobilgeräten per Definition zu hoch (rechnet gegen den großen Viewport); `svh` ist die richtige Einheit für einen Ersteindruck | **Die Erkenntnis, dass unsere Höhe zweifach falsch war** — falscher Abzug *und* falsche Einheit | **`svh` selbst.** Es hätte den Fehler halbiert und die Kopplung behalten. Der Hero trägt jetzt **gar keine** Viewport-Einheit mehr; damit ist die ganze Klasse weg statt genauer |
| *„Hero sections are becoming layout systems"* — Lexington Themes, Hero-Layouts 2026 | B | Der Hero ist keine Box mit Inhalt, sondern eine **Komposition mit Rhythmus**; Negativraum gehört als **Rand um den Block**, nicht als Loch darüber | **Die Umdeutung des Freiraums**: Der obere Bereich wird nicht verkleinert, sondern **besetzt**. Daraus folgt direkt das Prüfmaß „oben ist nicht nichts" | Die Bento-/Karten-Vorschläge derselben Quelle — Hoops hat im Hero **einen** Gedanken und **eine** Handlung |
| *„Tips for Using a Typographic Hero vs. Hero Imagery"* (telerik.com) + Editorial-Grid-Handwerk (affinity.studio, designmd.app) | B | *„type is the imagery"*; Größenkontrast erzeugt sein eigenes Raster; ein Textbild ist nicht mehrdeutig, ein Foto schon | **Die Erlaubnis, ohne Motiv zu tragen** — die Display-Überschrift ist der Hauptdarsteller, die Zeichnung ist Struktur. Das beantwortet Tobias' offene Frage „Hauptdarsteller oder Hintergrund?" | Die üblichen Begleiter des typografischen Heros: asymmetrischer Flattersatz, sichtbares Spaltenraster, Riesen-Laufweite. Hoops' Überschrift ist **mittig und wörtlich gesetzt** (Nele/Nora) — daran wird nicht gerührt |
| `weandthecolor.com`, Markentrends 2026 (aus dem 19.08.-Sweep) | B | *„design the motion behavior first and derive the static mark as a single frame of that sequence"* | **Umgedreht angewandt, und das ist der Kern dieser Runde:** Wenn das gewählte Einzelbild allein trägt, ist die Sequenz eine Zugabe — also gehört sie an den **Anfang** (Ankommen), nicht an den Scroll (Weggehen) | Die Lesart „Bewegung zuerst entwerfen". Genau das war der Vorgänger, und das Einzelbild ist dabei unbeaufsichtigt geblieben |

---

## Gegenprobe (Pflicht bei Stufe L)

**Was in dieser Branche alle gleich machen:** Hallenfoto oder Spielerfreisteller
als Hero, darüber eine Behauptung; oder eine Ergebniskachel-Wand. Beides setzt
Material voraus — Fotos, die wir nicht haben, oder Bestand, den wir noch nicht
haben (6 echte Vereine von 66, 3 bespielte Ligen von 57).

**Was wir bewusst anders machen:** Der Hero zeigt **weder Menschen noch
Bestand**, sondern die **Notation des Spiels** — die Zone, streng in
Draufsicht, aus echten FIBA-Maßen gerechnet. Das ist die einzige Bildsprache,
die (a) ohne Produktionsbudget auskommt, (b) für die Zielgruppe sofort lesbar
ist, weil sie in genau diesen Linien trainiert, und (c) **nichts behauptet**.
Ein Hallenfoto suggeriert Betrieb; eine Feldmarkierung suggeriert nichts — sie
ist einfach das Spiel.

⚠️ **Und wir brechen bewusst mit dem eigenen Vorgänger:** Der 19.08.-Sweep hat
Motion als tragendes Mittel gesetzt („ein Objekt reist durch die Seite",
belegt an `lastdanceforglory.world`). Das Prinzip bleibt richtig — **nur nicht
in einem Hero, der genau einen Bildschirm hoch ist.** Dort spielt jede
scroll-gebundene Bewegung, während der Leser bereits geht.

**Mode oder Handwerk?** Übernommen ist ausschließlich **Handwerk**: Rhythmus,
Höhenkopplung, Kontrast, Ladeverhalten. Kein einziger Fund dieser Runde ist
eine Stilmode. Gegen Viviens Ausschlussliste geprüft: keine Verläufe, kein
Glow, keine Glassmorphism-Karten, keine Deko-Partikel, kein 3D — die Zeichnung
besteht aus sieben Haarlinien und einem Kreis.

---

## Umsetzbarkeit

Getragen von vorhandenem Werkzeug, ohne Anschaffung: SVG im Markup, eine
CSS-Keyframe-Animation, Tailwind-Klassen. **Kein JavaScript**, keine
Bibliothek, keine Bilddatei.

---

## ⚠️ Nicht geprüft / nicht abrufbar

- **`land-book` und `godly`** bleiben laut `quellen-register.md` nicht
  abrufbar (403 seit 12.08.2026). Nicht erneut versucht.
- **Sorte A (Awwwards/siteinspire) nicht erneut abgefragt.** Bewusste
  Entscheidung nach dem dritten Negativbefund in Folge — die Kategorie liefert
  für eine Gebrauchsfläche ohne Bildbudget keine Argumente, nur Sehnsucht.
  **Das ist eine Auslassung, keine Vollständigkeit**, und sie steht hier,
  damit sie jemand widersprechen kann.
- **Sorte D (Video) nicht genutzt.** Es lag kein Referenzvideo von Patrick vor,
  und ich habe **keine** Bildschirmaufnahme des eigenen Ergebnisses gemacht.
  Die Einblendung ist deshalb nur in ihrem **Endzustand** beurteilt, nicht in
  ihrem Ablauf.
- **Keine fremde Referenz zur Frage „Standbild oder Motion im Hero"** im
  engeren Sinne gefunden. Die Entscheidung ist aus der eigenen Lage abgeleitet
  (Bühnenhöhe, Bewegungsbudget der Seite darunter, acht Roadmap-Punkte
  Vorgeschichte) — **begründet, aber nicht fremdbelegt.**

---

## ✅ Ein Werkzeug-Befund, der die Skill selbst betrifft

`design-trend-recherche` führt unter „Was hier wirklich geht" den Satz, eigene
Screenshots seien nicht möglich (`computer{action:"screenshot"}` kompositiert
nicht), und jede Aussage über visuelle Wirkung sei deshalb unbelegt.

**Das stimmt seit dieser Runde nicht mehr.** Ein Playwright-Skript gegen echtes
Chromium erzeugt PNG-Dateien, die anschließend mit `Read` **angesehen** werden.
In dieser Runde ist das viermal gelaufen und hat **vier Gestaltungsfehler
gefunden, die keine Messung ausgelöst hätte**.

⚠️ **Das ist der teuerste Eintrag dieser Notiz**, denn die veraltete Zeile ist
mitverantwortlich für das Scheitern des Vorgängers: Sie hat „nicht ansehen
können" als Normalzustand beschrieben, und daraus wurde „messen statt ansehen".
Der Registereintrag ist entsprechend korrigiert.
