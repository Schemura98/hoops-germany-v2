# Material-Eignungsprüfung: Tragen Fotos die Richtung „Anzeigetafel"?

**Einbauversuch mit Platzhalter-Fotos, 13.08.2026 · Vivien (design-spezialistin)**
`task-material-eignungspruefung` — Option 2 der freigegebenen Entscheidung
`dec-hoops-material-richtung`.

> ⚠️ **Das war ein Versuch, keine Richtungsänderung.** Die entschiedene Linie
> „kein Foto, Vektor" (Option 1) steht unverändert. Dieses Dokument ist das
> Urteil über das Material, nicht über die Entscheidung.

---

## 0. Kurzfassung — die Empfehlung in vier Sätzen

**Fotos brechen die Richtung, sie stärken sie nicht.** Der Befund ist nicht
Geschmack: An der Stelle, an der ein Foto am meisten wirken müsste (Hero),
muss es so stark abgedunkelt werden, dass es messbar nicht mehr von der
flachen Fläche zu unterscheiden ist — 90 % seiner Pixel liegen dann zwischen
Helligkeit 15 und 32, `navy-950` selbst liegt bei 20. Es kostet 48 KB und
liefert dafür eine Fläche, die die Seite heute für 0 Byte hat.

**Die Empfehlung lautet: bei Option 1 bleiben.** Mit einer Präzisierung, die
für Jonatan wichtiger ist als das Nein: Die Plattform trägt bereits Fotos —
Teamlogos, Banner, Beitragsbilder, Profilbilder. Die Frage ist nicht
„Fotos ja/nein", sondern **„Foto als Inhalt (ja, längst) oder Foto als
Dekoration auf der Marketing-Fläche (nein)"**. Details in Abschnitt 5.

---

## 1. Was gebaut wurde

Route **`/versuch-fotos`** — nicht verlinkt, `robots: noindex/nofollow`,
mit klebendem Hinweisstreifen unter der Navigation, der in **jedem**
Bildschirmzustand sichtbar ist. Zusätzlich trägt jedes Foto eine eigene
`PLATZHALTER`-Marke. Ohne das wird aus einer Anschauung stillschweigend eine
Entscheidung — besonders bei der Weitergabe.

Die Route verwendet die **echten** Landing-Bausteine (`LandingHero`,
`HeroScrollStage`, `ProfileMock` aus `FeatureMocks`, `Reveal`, Navbar,
Footer) und die vorhandenen Token/Primitive. Kein Ad-hoc-Baustein, keine
neue Farbe, keine neue Abhängigkeit.

**Drei Einbaustellen, bewusst unterschiedlich schwer:**

| Fall | Bild | Frage, die er beantwortet |
|---|---|---|
| 1 — Hero-Vollfläche | `hintergrund-02` (Halle, Lichtkegel) | Trägt ein Foto die Hauptfläche? Text/Kontrast? |
| 2 — Foto im Panel | `szene-03` (Training, Halle) | Foto vs. Vektor-Miniatur, direkt nebeneinander, gleiche Markenleiste |
| 3 — Akzentblock auf flacher Fläche | `hintergrund-01` (Korb von unten) | Liegt das Bild als Rechteck auf `navy-950`? Was macht es mit dem einen Akzent? |

### Rückbau — ein Commit, rückstandslos
- `app/versuch-fotos/` (Ordner löschen)
- `public/images/platzhalter/` (Ordner löschen — genau dafür der Unterordner)
- die Prop `foto` in `components/landing/LandingHero.js` und
  `components/landing/HeroScrollStage.js`

Beide Props sind **standardmäßig `null`**. `app/page.js` übergibt nichts und
wurde nicht angefasst. **Gegengeprüft, nicht behauptet:** Die Live-Landing
lädt nach dem Versuch weiterhin **genau ein Bild (`logo.svg`)** und enthält
**null `<picture>`-Elemente** — auf 390 px wie auf 1440 px.

---

## 2. Das Material — gemessen, nicht angenommen

Alle 14 Kandidaten sind **1880 × 1253 px**, `hintergrund-01` nur
**1733 × 1300 px**. Ursache: `stock-suche.mjs` filtert auf Original ≥ 2400 px,
lädt dann aber `src.large2x` — und das ist bei Pexels auf 1880 px gedeckelt.
Der Filter beschreibt das Original auf pexels.com, nicht die Datei im Ordner.

**Milos Zielgröße „≥ 2400 px lange Kante" ist mit diesem Material nicht
erreichbar.** Es wurde deshalb nirgends hochskaliert.

Erzeugt nach Bestands-Konvention `<basis>-<lange-Kante>.<format>`
(sharp, WebP Q 82, AVIF Q 60):

| Datei | Maße | WebP | AVIF |
|---|---|---|---|
| `ph-halle-lichtkegel-1600` | 1600×1066 | 60,6 KB | **48,1 KB** |
| `ph-training-halle-1000` | 1000×666 | 59,3 KB | **44,2 KB** |
| `ph-korb-von-unten-1000` | 1000×750 | 98,4 KB | **69,5 KB** |
| **Summe** | | 218,3 KB | **161,8 KB** |

Bewusste Abweichung von der 1000-px-Vorgabe beim Hero: Eine Vollfläche mit
1000 px zu prüfen hätte dem Foto ein Auflösungs-Handicap aufgeladen und das
Urteil verfälscht. 1600 px ist eine echte Verkleinerung aus 1880 px.

---

## 3. Die sechs Prüffragen

### 3.1 Fügt sich das Foto in die flache Fläche ein — oder liegt es als Rechteck darauf?

**Hero: Es fügt sich ein, indem es aufhört, ein Foto zu sein.**

Gemessen am gerenderten Bild (Canvas-Abtastung des tatsächlichen
`object-cover`-Ausschnitts, 390 × 780 CSS):

| Overlay | Mittleres RGB | 90 % der Pixel (Helligkeit) | Standardabw. |
|---|---|---|---|
| ohne | 25, 20, 17 | 2 … 61 | 34,5 |
| **0,72 (nötig, s. 3.4)** | **15, 18, 28** | **15 … 32** | **9,7** |
| `navy-950` zum Vergleich | 11, 18, 32 | — | 0 |

Bei der Abdunklung, die der Text zwingend braucht, liegt das Foto bei
RGB 15/18/28 — die flache Fläche liegt bei 11/18/32. Der Unterschied ist
4 Stufen in Rot, 0 in Grün, 4 in Blau. **Das ist kein Bild mehr, das ist
`navy-950` mit Rauschen.** Genau der Befund, der schon das alte Hero-Foto
erledigt hat („ein teures Bild, das am Ende fast nur als graue Fläche
wirkte", `HeroScrollStage.js`) — diesmal mit einem besseren Motiv, besserem
Format und trotzdem demselben Ergebnis.

**Fall 3: Es liegt als Rechteck darauf, und es gibt kein Mittel dagegen.**
Die Richtung kennt keinen Verlauf, keinen Schatten, keine Vignette — die
einzigen erlaubten Werkzeuge sind Flächenstufe und 1px-Haarlinie. Eine
Haarlinie um ein Foto unterstreicht die Kante, sie löst sie nicht auf.

Verschärfend, gemessen: Die dunkle Masse von `hintergrund-01` (79 % aller
Pixel) hat den Farbwert **`#0F1413`, Farbton 167°** — ein Grün-Schwarz.
`navy-950` steht bei **220°**. 53° Abstand. Das Bild „fügt sich in Navy ein"
nicht; es sitzt als grünlicher Fleck darauf. Auf dem Bildschirmfoto
`mobil-390-4-flaeche.png` ist die Kante an der Oberseite direkt sichtbar.

### 3.2 Was passiert mit dem einen Akzent?

**Der Marken-Akzent verliert — nicht gegen eine fremde Farbe, sondern gegen
ein knapp danebenliegendes Orange.** Das ist der schlechtestmögliche Fall.

| | Hex | H | S | V |
|---|---|---|---|---|
| `brand-500` (Logo-Orange) | `#F07A27` | 25° | 84 | 94 |
| Ring in `hintergrund-01` | `#D74806` | **19°** | **97** | 84 |
| Trikot in `szene-03` | `#EF8A01` | **35°** | **100** | 94 |

Die AUSWAHL führt den Ring als „zufällig fast die Markenfarbe". Gemessen ist
er 6° röter, 13 Punkte gesättigter und 10 Punkte dunkler. Nah genug, um als
Markenfarbe gelesen zu werden — falsch genug, um als **misslungene**
Markenfarbe gelesen zu werden.

Das Trikot-Orange in Fall 2 ist noch heikler: gleiche Helligkeit, 10° gelber,
**voll gesättigt** — und es belegt in der Karte ein Vielfaches der Fläche,
die der Marken-Akzent dort hat. Der eine erlaubte Akzent wird damit zum
schwächeren von zwei Orangetönen in derselben Karte.

Dazu die Fremdfarben, die keine Debatte brauchen: Das Netz in
`hintergrund-01` ist **rot-weiß-blau**. Das Blau ist `#002667` — Farbton
**218°**, praktisch derselbe Farbton wie `navy-950` (220°), aber dreifach so
hell und 34 Punkte gesättigter. Es liest sich, als sei die Grundfarbe der
Marke ausgelaufen und aufgedreht worden. In Fall 2 kommen Türkis (Trikot),
Dunkelrot (Sitzreihen) und Holzbraun dazu — fünf Fremdfarben in einer Karte,
in einem System mit genau einem erlaubten Akzent.

### 3.3 Was passiert mit der Signatur (2px-Markenleiste)?

**Sie überlebt technisch und verliert inhaltlich.** Die Leiste sitzt in
Fall 2 bei beiden Karten identisch an der Oberkante und ist neben dem Foto
weiterhin sichtbar (`desktop-1440-3-panel.png`). Aber ihre Aufgabe ist,
**Auszeichnung** zu sein — „genau diese eine Karte". Neben einem Foto, das
mit voller Sättigung um Aufmerksamkeit ruft, ist ein 2px-Strich kein
Auszeichnungsmittel mehr, sondern eine Zierleiste. Die Signatur wird nicht
zerstört, sie wird bedeutungslos.

Zweiter Verlust im Hero: Die Taktiktafel (`PlayDiagram`, die scroll-gezeichnete
Vektor-Ebene bei 38 % Deckkraft) ist hinter dem Foto **nicht mehr wahrnehmbar**.
Sie war der Grund, warum die Fläche ohne Foto nicht leer wirkt. Das Foto
ersetzt sie nicht — es löscht sie und liefert selbst nichts Sichtbares.

### 3.4 Textlesbarkeit und Kontrast — gemessen

Hellste 8×8-Fläche im Textbereich des tatsächlich gerenderten Hero-Ausschnitts,
gegen `paper-50` (`#F5F7FA`):

| Zustand | Kontrast | Urteil |
|---|---|---|
| Foto ohne Overlay | **0,93 : 1** | Text praktisch unsichtbar |
| Overlay 0,55 | **3,87 : 1** | unter WCAG AA (4,5) |
| Overlay 0,72 | **7,05 : 1** | AA erfüllt |
| flaches `navy-950` (heute) | **17,45 : 1** | AAA, konstant |

Der Hero kostet also **10,4 Kontrastpunkte Reserve** — und zwar dauerhaft
und für jeden künftigen Text an dieser Stelle. Der Wert 0,72 ist kein
Sicherheitspuffer, sondern die Untergrenze: Bei 0,55 fällt der Lichtkegel
auf dem Hallenboden unter AA. Genau das Risiko, das die Richtung mit dem
Foto-Verzicht bewusst abgeschafft hatte (`VISUELLE-RICHTUNG` §5).

### 3.5 Glaubwürdigkeit für die Zielgruppe

**Kein einziges der drei eingebauten Fotos zeigt die Zielgruppe.**
(Zielgruppe 1 laut `ZIELGRUPPEN.md`: Bezirks- bis Kreisliga NRW, Anfang 20
bis Mitte 30, Halle, Verein.)

- **Hero (`hintergrund-02`):** italienische Halle. Auf den Bandenwerbungen
  sind **fremde Firmennamen lesbar** („Autocarrozzeria", „Calderone s.a.s.",
  „Peppino Cocuzza — San Filippo del Mela", „Studio Grillo"), auf einer davon
  ein Gesicht. Der Spieler ist oberkörperfrei. Auf 1440 px ist all das
  deutlich zu sehen (`desktop-1440-1-hero.png`) — es ist erkennbar *nicht*
  eine Vereinshalle in NRW.
- **Fall 2 (`szene-03`):** Erwachsene, echtes Training, tonal die beste
  Annäherung an Navy im ganzen Satz. Aber Tribünensitze und Ausstattung
  lesen als südamerikanische/südeuropäische Sporthalle, nicht als
  Kreisliga-Turnhalle.
- **Fall 3 (`hintergrund-01`):** ohne Menschen und deshalb neutral — der
  einzige der drei, der nicht aktiv gegen die Zielgruppe arbeitet.

Nele war nicht einzubeziehen (kein neuer Text, keine Kampagne), aber der
Befund gehört ihr zur Kenntnis: **Der Vertrauensvorsprung der Plattform ist
Belegbarkeit.** Eine Seite, die Belegbarkeit verspricht und dafür eine
italienische Halle mit fremder Bandenwerbung zeigt, untergräbt genau das
Argument, das sie führt. Das ist kein Stilproblem, das ist ein
Glaubwürdigkeitsproblem.

### 3.6 Gewicht

| | Bilddaten (AVIF, 390 px, DPR 2) |
|---|---|
| Hero heute (ohne Foto) | **0 Byte** |
| Hero mit Foto | **48,1 KB** |
| alle drei Platzhalter zusammen | **161,8 KB** |

Zum Vergleich: `public/images` ist heute insgesamt ~1,3 MB. Drei Platzhalter
wären 12 % davon.

**Zusätzlicher Auflösungsbefund, der gegen die Erwartung ausfällt:** Bei
390 × 780 CSS zeigt `object-cover` von einem Querformat-Foto nur **33 % der
Bildbreite** — zwei Drittel werden weggeschnitten, darunter genau die ruhige
freie Fläche, derentwegen `hintergrund-02` ausgewählt wurde. Bindend ist
außerdem nicht die Breite, sondern die **Höhe**: 780 CSS-px × DPR 2 = 1560
Gerätepixel nötig, vorhanden sind 1066. **Auch mobil ist das Material für
eine Vollfläche unterauflösend (68 % des Nötigen)** — die Annahme
„mobil reicht 1880 px reichlich" gilt für Querformate in Hochformat-Flächen
nicht.

---

## 4. Urteil

**Fotos brechen die Richtung.** Nicht überall gleich stark:

| Einbaustelle | Urteil | Grund (belegt) |
|---|---|---|
| **Hero-Vollfläche** | **Nein, kategorisch** | Wird bei nötiger Abdunklung messbar zu `navy-950` mit Rauschen (RGB 15/18/28 vs. 11/18/32); kostet 10,4 Kontrastpunkte; löscht die Taktiktafel; mobil 68 % unterauflösend; 48 KB für nichts |
| **Foto statt Produkt-Miniatur im Panel** | **Nein** | Ersetzt Information durch Dekoration: Die Vektor-Karte zeigt 18,4 PTS / 6,1 AST / 4,2 REB — also das Produktversprechen selbst. Die Foto-Karte zeigt allgemeinen Basketball und bringt ein konkurrierendes Fast-Orange mit |
| **Begrenzter Akzentblock auf flacher Fläche** | **Nur unter drei Bedingungen — von keinem der 14 Bilder erfüllt** | s. u. |

**Die „kommt darauf an"-Antwort, so genau ich sie geben kann.** Ein Foto als
begrenzter Akzentblock wäre denkbar, wenn es **alle drei** Bedingungen
erfüllt:

1. **Nahezu einfarbig oder echt freistellbar** — sonst ist der Bildrand ein
   Fremdkörper, und die Richtung hat kein Werkzeug, ihn aufzulösen.
2. **Keine zweite gesättigte Farbe** — insbesondere kein zweites Orange und
   kein gesättigtes Blau, weil beides den Marken-Akzent bzw. den Grundton
   nachahmt statt zu kontrastieren.
3. **Echt** — eine reale NRW-Halle, ein reales Team. Ein Stock-Foto
   widerspricht dem Kernversprechen der Plattform.

Von den 14 Kandidaten erfüllt **keiner** alle drei. `detail-04` wäre am
ehesten freistellbar, ist aber draußen aufgenommen, hell, und trägt die
lesbare Fremdmarke „TARMAK".

### Die Präzisierung, die für Jonatan zählt

Die Plattform **zeigt längst Fotos** und soll das auch: Teamlogos, Banner,
Beitragsbilder im Newsfeed, Profilbilder. Die richtige Trennlinie ist nicht
„Fotos ja/nein", sondern:

- **Foto als Inhalt** (von Nutzern hochgeladen, zeigt echte Teams) — ist
  bereits gebaut, gehört dorthin, ist nicht Gegenstand dieser Entscheidung.
- **Foto als Dekoration auf der Marketing-Fläche** (Hero, Feature-Strecke,
  CTA) — nein. Dort trägt die Typografie, die Bewegung und die Darstellung
  echter Produktdaten.

Wenn später einmal echte Fotos entstehen sollen, ist der Ort dafür nicht der
Hero, sondern die Stelle, an der ein Foto etwas **belegt** — ein reales Spiel,
ein reales Team, eine reale Halle. Zielmaß dann laut Milo ≥ 2400 px, für eine
Hochformat-Vollfläche eher ≥ 3600 px lange Kante (die Höhe ist bindend, s. 3.6).

---

## 5. Rückmeldung an Milo — was ich an der Auswahl gelernt habe

Die Arbeit an der Beschaffung war gut: die Korrektur der Suchbegriffe auf
`gym`/`indoor` war richtig und hat den Trefferanteil messbar verbessert, und
die Ehrlichkeit über gescheiterte Themen in `AUSWAHL.md` ist genau die
Haltung, die ich mir wünsche. Der Fehler liegt woanders — **die Begründungen
je Bild sind teilweise nicht am Bild überprüft.** Ich habe alle 14 selbst
angesehen. Fünf Aussagen halten nicht:

1. **`hintergrund-01`** — „der orange Ring ist zufällig fast die Markenfarbe":
   gemessen `#D74806` (19°/97/84) gegen `#F07A27` (25°/84/94), also spürbar
   röter und schmutziger. **Und das Netz ist rot-weiß-blau** — in der
   Begründung nicht erwähnt, obwohl es drei Fremdfarben in ein System mit
   einem erlaubten Akzent bringt. Die dunkle Fläche ist außerdem Grün-Schwarz
   (167°), nicht blaustichig, „fügt sich in Navy ein" trifft nicht zu.
2. **`szene-04`** — „das glaubwürdigste Bild der ganzen Auswahl für Verein in
   Deutschland": Das Bild zeigt **Cheerleading-Stunts vor einem Fußballtor**,
   keinen Basketball. Durchgehend warmer Sepia-Ton, der gegen Navy arbeitet.
3. **`menschen-02`** — „dunkel, Gesichter kaum lesbar": Die Szene ist hell
   ausgeleuchtet (weiße Spinde), **alle fünf Gesichter sind voll erkennbar**.
   Das ist genau die Eigenschaft, wegen der die Auswahl auf anonyme Bilder
   verengt wurde — hier ist sie nicht erfüllt.
4. **`detail-04`** — „dunkler Grund, taktil, am ehesten freistellbar": Das
   Bild ist **draußen, in praller Sonne, auf blauem Asphalt** — kein dunkler
   Grund. Zudem ist die Fremdmarke „TARMAK" auf dem Ball lesbar.
5. **`detail-03`** — als minimaler Akzent geführt, ist aber ebenfalls
   **draußen auf Asphalt**. „Streetball im Freien" steht in derselben Datei
   als Ausschlussgrund; hier ist es unbemerkt in die Auswahl gerutscht.

**Zwei systematische Ursachen, die mehr wert sind als die Einzelfehler:**

- **Die Beschreibung entstand offenbar am Kontaktbogen, nicht am Vollbild.**
  Bei Briefmarkengröße sieht `szene-04` wie eine Trainingsgruppe aus und
  `menschen-02` wie eine dunkle Szene. Erst im Vollbild kippen beide.
  Vorschlag: Bilder, die es in die engere Auswahl schaffen, einzeln im
  Vollbild ansehen, bevor eine Begründung geschrieben wird.
- **Farbaussagen gehören gemessen, nicht geschätzt.** „fast die Markenfarbe"
  ist in Sekunden prüfbar (sharp kann den dominanten Farbwert liefern) und
  war hier falsch. Bei einem System mit genau einem erlaubten Akzent ist das
  die wichtigste Einzelangabe überhaupt.

**Dritter Punkt, technisch:** `stock-suche.mjs` filtert auf Original ≥ 2400 px,
lädt aber `src.large2x` (Pexels-Deckel 1880 px). Der Filter beschreibt damit
nicht die Datei, die im Ordner landet. Das gehört korrigiert, bevor der
nächste Lauf startet — sonst ist jede künftige Auswahl wieder auf 1880 px
gedeckelt, ohne dass es jemandem auffällt. (Die in `AUSWAHL.md` bereits
notierte fehlende Entdopplung über die Pexels-ID steht weiter offen.)

**Rechtlich zur Kenntnis, nicht als Bewertung** — falls solche Bilder je
echte Assets werden sollen, wäre das Noras Frage, nicht meine: lesbare
Firmennamen Dritter auf Bandenwerbung (`hintergrund-02`), erkennbare
Minderjährige (`szene-01`), lesbarer Personenname auf einem Trikot
(`menschen-03`), lesbare Fremdmarke auf dem Ball (`detail-04`). Die
Pexels-Lizenz deckt die Nutzung des Fotos ab — sie sagt nichts über
abgebildete Marken und Personen.

---

## 6. Kollegen

- **Milo (medien-produzent):** Abschnitt 5 geht an ihn. Seine Messung der
  Zielgrößen (`HERO-ASSETS-2026-08-11.md`) war die Grundlage für 3.6 und hat
  sich erneut bestätigt.
- **Nele (marketing-manager):** bewusst nicht beauftragt — kein neuer Text,
  keine Kampagne. Abschnitt 3.5 geht ihr zur Kenntnis, weil der Befund die
  Kernpositionierung berührt.
- **Nora (recht-vorprüfung):** noch **nicht** eingeschaltet, weil nichts
  veröffentlicht wird. Der Absatz am Ende von Abschnitt 5 ist der Auslöser,
  falls Patrick die Richtung je umdreht.
- **Tobias / Kai:** bewusst **nicht** angefordert. Es wird nichts deployt und
  nichts committet; ein Gate-Urteil wäre hier Aufwand ohne Empfänger.
- **Trend-Sweep (`design-trend-recherche`): bewusst nicht durchgeführt.** Die
  Skill lässt „kein Sweep" als begründetes Ergebnis zu. Begründung: Hier wird
  keine neue Richtung gesucht, sondern vorhandenes Material gegen eine
  bereits entschiedene, dokumentierte Richtung geprüft — und die Antworten
  kamen aus Messungen am echten Produkt, nicht aus Referenzen. Ein Sweep
  hätte das Urteil nicht verbessert.

---

## 7. Was ich **nicht** geprüft habe — ehrlich

- **Kein echtes Endgerät.** Alles lief in Chromium (Playwright) auf 390 px
  (DPR 2) und 1440 px (DPR 1). Kein echtes Android, kein iPhone, keine
  gedrosselte CPU, keine gedrosselte Verbindung. Die 161,8 KB sind
  Dateigrößen und gemessene Übertragung im lokalen Netz — **kein**
  Ladezeit-Wert unter Mobilfunk.
- **Kein Scroll-/Bewegungsurteil unter Last.** Die scroll-gebundene
  Ballreise läuft auf der Versuchsroute mit, aber ich habe **keine
  Bildratenmessung** gemacht. Ob ein Vollflächen-Foto die rAF-Schleife auf
  einem Mittelklasse-Gerät beeinträchtigt, ist offen.
- **Kein `prefers-reduced-motion`-Durchgang** auf der Versuchsroute. Der
  Foto-Einbau ist von der Bewegungslogik unabhängig (das Bild ist statisch),
  aber geprüft habe ich es nicht.
- **Kein Dark/Light-Vergleich** — die Seite kennt nur die dunkle Fassung.
- **Nur drei der 14 Bilder tatsächlich eingebaut.** Die übrigen 11 habe ich
  einzeln im Vollbild angesehen und beurteilt, aber nicht im Code getestet.
- **Kein Sehtest mit echten Nutzern.** Das Glaubwürdigkeitsurteil in 3.5 ist
  mein Fachurteil gegen `ZIELGRUPPEN.md`, keine Nutzerforschung. Wenn Patrick
  das härter braucht, gehört es zu Ronja.
- **Keine Prüfung der Rechtsfragen** aus Abschnitt 5 — das ist ausdrücklich
  nicht meine Rolle.

---

## 8. Belege

Bildschirmfotos (Chromium, echte Frames — die Vorschaufläche skalierte die
Komposition falsch und war als Beleg unbrauchbar):

```
tmp/versuch-shots/mobil-390-1-hero.png          Hero mit Foto, 390 px
tmp/versuch-shots/mobil-390-2-hero-scroll.png   Hero in der Scroll-Bewegung
tmp/versuch-shots/mobil-390-3-panel.png         Fall 2 – Vektor über Foto
tmp/versuch-shots/mobil-390-4-flaeche.png       Fall 3 – Rechteck auf navy-950
tmp/versuch-shots/desktop-1440-1-hero.png       Hero, Desktop (Bandenwerbung sichtbar)
tmp/versuch-shots/desktop-1440-2-hero-scroll.png
tmp/versuch-shots/desktop-1440-3-panel.png      Fall 2 nebeneinander
tmp/versuch-shots/desktop-1440-4-flaeche.png    Fall 3, Desktop
tmp/versuch-shots/LIVE-landing-mobil.png        Kontrolle: Live-Landing unverändert
tmp/versuch-shots/LIVE-landing-desktop.png
```

Skripte: `tmp/versuch-fotos-shots.mjs`, `tmp/versuch-landing-check.mjs`,
`tmp/versuch-gewicht.mjs`.

Weitere Gegenproben: kein horizontaler Überlauf (390 → `scrollWidth` 390;
1440 → 1440). `npm run build` läuft durch, `/versuch-fotos` prerendert
statisch (223 B Seiten-JS). Der Build lief **nach** dem Stoppen des
Dev-Servers, Port 3000 vorher per `curl` als frei bestätigt.

**Nicht committet** — Stand liegt zur Entscheidung bei Patrick.
