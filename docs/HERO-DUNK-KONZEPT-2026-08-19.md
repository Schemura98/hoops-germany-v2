# Hero-Konzept „Der Abschluss" — Slam Dunk als Linienzeichnung

**Auftrag Patrick, 19.08.2026.** Ersetzt den gerenderten Ball im Hero der Startseite
durch einen scroll-gesteuerten Dunk in der Strichsprache des vorhandenen
Spielfelds. Erstellt von Vivien (design-spezialistin).

> **Status: Konzept, kein Code.** In diesem Arbeitsbaum läuft ein Gate (Kai) —
> ich habe gelesen und gerechnet, aber keine einzige Datei im Projekt angefasst
> und den Entwicklungsserver nicht gestartet. **Jede Zahl unten ist entweder aus
> dem Quelltext gelesen, nach der WCAG-Formel gerechnet oder aus protokollierten
> früheren Messungen übernommen. Keine ist frisch im Browser gemessen.** Was
> nur ein Auge entscheiden kann, steht am Ende unter „Was ich nicht geprüft habe".

---

## 0. Die Kurzfassung für Patrick

**Was du bekommst:** Statt eines Balls, der durch den Hero fällt, zeichnet sich
beim Scrollen ein Spielzug, der im Korb endet — Feld, Ring, Netz, der Zug zum
Korb, die Hand über dem Ring, und zum Schluss geht der Ball durch. Alles aus
denselben feinen orangenen Linien, aus denen heute schon das Spielfeld besteht.
Kein Foto, kein gerendertes Bild, keine Bilddatei. Der Hero lädt danach
**null Bytes Bilddaten**.

**Der wichtigste Satz des ganzen Konzepts, und er ist überraschend:**

> Die Kontrastfrage, die den Ball vier Runden lang zerstört hat, existiert für
> eine Linie **fast nicht** — weil einer Linie die Fläche fehlt. Weißer Text
> über einer orangen Linie auf Navy hält den gesetzlichen Mindestkontrast bis
> zu einer Deckkraft von rund **0,71**. Gebaut ist die Taktiktafel heute bei
> **0,171**. Sie ist nicht zu laut. Sie ist **viermal zu leise**.

Das dreht das Problem um. Beim Ball musste jede Verstärkung mit Lesbarkeit
bezahlt werden — „Barrierefreiheit gewonnen, Wirkung verloren" (Tobias). Bei
einer Linie ist das Budget da und wird nicht genutzt.

**Der zweite Gewinn ist kein optischer, und er ist größer:** Der heutige Ball
muss zur Laufzeit wissen, wo jeder einzelne Textkasten steht — weil er eine
deckende Scheibe ist, die keinen Buchstaben berühren darf. Eine Linie darf jeden
Buchstaben kreuzen. Damit entfällt die gesamte Messmaschine dahinter:
Kästenbau, Beobachter auf den Anmelde-Wechsel, Warten auf das Ende der
Einblendungen, Lückensuche, Verankerung an der Eyebrow-Zeile, Konturkanal,
Abdunkelung, Einflug-Schiedsrichter, Übergabe an die Fortschritts-Leiste.

**Die Roadmap-Punkte 20, 20 b, 20 c, 20 d, 20 e, 20 f, 20 g und 20 h drehen
sich ausnahmslos um Fragen, die eine Linie nicht stellt.** Acht Punkte, jeder
davon mindestens eine Gate-Runde.

**Was du entscheiden musst:** Genau eine Sache, siehe Abschnitt 6 — ob der
Hero den Korb macht (dann muss die Landung am Ende der Seite weichen) oder ob
er kurz davor stehenbleibt. Ich empfehle: **der Hero macht den Korb.**
Begründung dort, sie ist hart.

---

## 1. Die Recherche (Pflicht-Sweep, Stufe L)

**Stufe L (Voll-Sweep), begründet:** Neue Gestaltungsrichtung für die
Signature-Fläche der Seite mit ausdrücklichem Wow-Anspruch — genau der Fall,
den die Skill für L vorsieht. Nicht S: Es geht nicht um die Korrektur eines
Werts innerhalb einer entschiedenen Formensprache, sondern um einen neuen
Bildgegenstand.

**Register vor Suche hat wieder gegriffen.** Der Sport-L-Sweep vom 12.08.2026
(vier Referenzvideos, Mechanik A1–A10) deckt Objektreise, Ebenen-Tempo,
Kapitelrhythmus bereits ab und wurde übernommen statt neu gesucht. Gesucht
wurde nur das Delta: **Linienzeichnung als tragendes Hero-Motiv** und
**scroll-gebundene Zeichenanimation**.

**Suchschnitt:** Amateur-Basketball-Community NRW, Vereinsumfeld, mobil zuerst,
Zielgruppen 1–4 (Spieler, Team-Admins, Vereinslose, Vereinsverantwortliche).
Konkurriert um Aufmerksamkeit mit Sport-Apps, Vereinsseiten und
Marken-Sportauftritten — nicht mit SaaS.

### Referenzen

| # | Quelle | Sorte | Was daran stark ist | Was ich übernehme | Was bewusst nicht |
|---|---|---|---|---|---|
| 1 | [Awwwards, Kategorie Sport](https://www.awwwards.com/websites/sports/) (Stand 19.08.2026) | A | Site of the Day Jun–Aug 2026: Lacoste Ace Breaker (Merci Michel), Radian (UNCOMMON), Balmoral (MILL3), Podium (San Rita), Wolverine Worldwide (Locomotive) | **Nichts direkt.** Wert liegt im Negativbefund → Gegenprobe | Durchweg Marken-/Produktauftritte mit fotografischem oder 3D-Material. Keine einzige Community-Plattform. Der Materialweg ist für uns geschlossen |
| 2 | [The Last Dance For Glory](https://lastdanceforglory.world/) (Honorable Mention, 23.07.2026) | A/B | *„scroll the golden trophy through nine chapters"* — **ein goldenes Objekt reist durch neun Kapitel** | Bestätigung von **A10** („ein Motiv trägt alle Szenen") aus fremder, prämierter Quelle — die Mechanik, die Hoops seit 12.08. verfolgt, ist unabhängig bestätigt | Die mythologisch-pathetische Tonalität (römische Ziffern, Prophezeiung). Hoops verkauft Belegbarkeit, nicht Legende |
| 3 | [Logo-/Marken-Trends 2026, WeAndTheColor](https://weandthecolor.com/best-logo-design-trends-of-2026-whats-working-whats-tired-and-whats-next/209969) | B | *„design the motion behavior first and derive the static mark as a single frame of that sequence"* | **Direkt für `prefers-reduced-motion`:** Der Ruhezustand ist ein **gewähltes Einzelbild**, keine angehaltene Animation. Löst die Frage aus dem Auftrag („trägt ein unbewegter Dunk?") sauber | Bewegte Logos/Wortmarken — die Wortmarke bleibt unangetastet |
| 4 | [Illustrations-Trends 2026, Creative Bloq](https://www.creativebloq.com/art/illustration/messy-meaningful-and-made-by-humans-the-biggest-illustration-trends-for-2026) + [Envato](https://elements.envato.com/learn/line-art-design-trend) | B | Gegenbewegung zum KI-Look: sichtbar handgezogene, bewusst unperfekte Linie als Signal menschlicher Autorenschaft | Die **Diagnose** — genau Patricks Sorge („soll nicht nach KI aussehen") ist ein branchenweit erkanntes Problem | **Die Lösung übernehme ich ausdrücklich NICHT.** Begründung in der Gegenprobe |
| 5 | Interpolated Rotoscope ([Adobe](https://www.adobe.com/creativecloud/video/discover/rotoscoping-animation.html), [Domestika](https://www.domestika.org/en/blog/4354-how-to-make-a-rotoscope-animation-in-photoshop)) | B/C | Wenige gezeichnete Schlüsselbilder, dazwischen wird interpoliert — statt jedes Bild zu zeichnen | Das **Prinzip**: eine Bewegung braucht drei bis fünf definierte Zustände, nicht 32 | Die Technik selbst — für unser Motiv reicht `stroke-dashoffset`, es muss nichts ineinander verwandelt werden |
| 6 | [MDN Scroll-driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) · [caniuse](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) · [Josh W. Comeau](https://www.joshwcomeau.com/animation/scroll-driven-animations/) | C | Native scroll-gebundene Animation ohne JavaScript, läuft auf dem Compositor-Thread | Das Muster `@supports (animation-timeline: scroll())` als Vormerkung für **andere** Flächen | **Für dieses Motiv verworfen** — Begründung in Abschnitt 7 |
| 7 | [Apple-Stil Scroll-Bildsequenzen, CSS-Tricks / GSAP Vault](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/) | B | Die Mechanik hinter Patricks Maßstab, in Worten: vorgerenderte Einzelbilder, Scrollposition → Bildindex, alles vorgeladen | Die **Erkenntnis, was daran wirklich trägt** — siehe Abschnitt 8 | Der Weg selbst. Er hängt am Material, das wir nicht haben |

### Gegenprobe (bei Stufe L Pflicht)

**Was machen in dieser Branche alle gleich?**

1. **Hallen-Actionfoto oder Sport-Stock im Hero.** Bereits am 12.08. als Einerlei
   erkannt und verlassen.
2. **Ergebniskacheln und Tabellen sofort im Hero** (kicker, FuPa, ligaportal,
   MaxPreps — Befund aus dem 15.08.-Sweep).
3. **Prämierte Sportauftritte 2026 sind Markenauftritte mit Material.** Keine
   davon ist eine Plattform ohne Bildbudget. Für uns ist der ganze Zweig eine
   Sackgasse — und das ehrlich zu benennen ist wertvoller, als eine Referenz zu
   zitieren, deren Voraussetzung wir nicht erfüllen.
4. ⚠️ **Die stilisierte Silhouette eines dunkenden Spielers ist der Branchen-
   reflex schlechthin** — und ihr prominentester Vertreter, Nikes „Jumpman", ist
   **eingetragene Marke**. Das ist der einzige Punkt dieses Auftrags mit einem
   echten Rechtsrisiko. **Vor jeder gezeichneten Figur gehört das an Nora.**
   Ich sage nicht, dass jede Dunk-Silhouette eine Verletzung wäre — ich sage,
   dass es die einzige Gestaltungsfrage hier ist, die ich nicht allein
   entscheiden kann.

**Was machen wir bewusst anders?**

Wir zeichnen **keinen Körper**. Wir zeichnen die **Notation** — Bahn, Ring, Netz,
Ball. Der Körper entsteht aus der Bahn und wird nie gezeichnet. Das setzt uns
gleichzeitig von (1) ab und geht an (4) vorbei.

**Mode oder Handwerk?**

- *Handwerk, übernommen:* ein Motiv je Bildschirm · Chronologie der Zeichnung
  statt Gleichzeitigkeit · Bewegung erst als Ankunft, dann als Ereignis ·
  Ruhezustand als gewähltes Einzelbild.
- *Mode, bewusst NICHT übernommen:* **die wackelige, handgezogene Linie.** Sie
  löst zwar exakt das Problem, das Patrick benennt, aber sie widerspricht dem
  Gegenstand. **Eine Taktiktafel ist eine Notation, und eine zittrige Notation
  liest sich nicht als menschlich, sondern als schlampig.** Unsere Absetzung vom
  KI-Look läuft nicht über die unruhige Linie, sondern über **Präzision plus
  Auslassung** — dass wir den Körper *weglassen*, ist genau die Autorenent-
  scheidung, die keine Bildmaschine trifft.
- Gegen die Ausschlussliste geprüft: kein Verlauf auf einer Oberfläche, kein
  Glow, kein Glassmorphism, keine Deko-Partikel, kein 3D-Blob. Der einzige
  Farbwechsel ist ein einmaliges `signal-ok`-Blitzen am Ring, und dafür gibt es
  mit `rail-goal-flash-ring` bereits Präzedenz.

**Neu betriebsbereit, für den nächsten Sweep wichtig:** `ffmpeg`, `ffprobe` und
`yt-dlp` sind **installiert** (am 19.08. geprüft; am 12.08. fehlten sie noch).
Sorte D ist damit einsatzbereit — **wenn Patrick ein Video einer Dunk-Animation
schickt, die ihm gefällt, kann ich es tatsächlich ansehen**, statt daraus
Vermutungen abzuleiten. Bei einem Motiv, dessen Wirkung an der Bewegung hängt,
ist das der wertvollste denkbare Eingang.

---

## 2. Was der Auftrag verlangt — und der Widerspruch darin

Patricks zwei Sätze enthalten eine Spannung, die vor dem ersten Strich aufgelöst
sein muss:

- *„im **Hintergrund** der Hero Sektion"* + *„stilvoll und minimalistisch, wie
  das Spielfeld mit den feinen orangenen Linien"* → das ist das leise Register.
- *„**Apple Niveau**"* + *„ein Slam Dunk als sich bewegende Herosektion"* → das
  ist ein Hauptdarsteller.

Beides zugleich geht nicht. Die heutige Taktiktafel läuft bei einer wirksamen
Deckkraft von **0,171** — ein Dunk in dieser Lautstärke hinter einer Display-
Überschrift ist unsichtbar. Wer die Deckkraft anhebt, landet in dem Problem, das
den Ball gekostet hat.

**Die Auflösung ist nicht „lauter", sondern „größer und ruhig".** Ein kleines
helles Objekt muss gedimmt werden. Eine große, dünn gezeichnete Figur nicht —
sie besteht fast nur aus Zwischenraum. Das Motiv wird deshalb **groß genug, dass
die Schrift darin steht statt davor**, und bleibt dabei so leise, dass jeder
Buchstabe darüber die Kontrastvorgabe hält. Das ist rechnerisch belegt, siehe
Abschnitt 3.

**Ein Nebenbefund, den jemand wissen sollte:** Die Taktiktafel, die Patrick als
Stilvorbild nennt, ist beim Laden der Seite **gar nicht sichtbar**. Ihre
Deckkraft ist `t × ARC_MAX`, und `t` ist bei Scrollposition 0 exakt 0. Der erste
Bildschirm trägt heute **keine Zeichnung** — nur Schrift auf einer leeren
Navy-Fläche und (mobil) den einfliegenden Ball. Das neue Motiv ändert das:
**der Ring ist ab dem ersten Bild da.**

---

## 3. Der Kontrast-Nachweis — als Regel, nicht als Hoffnung

Das ist die zentrale Frage des Auftrags, deshalb steht sie vor der Gestaltung.

### Warum eine Linie kategorisch anders ist als der Ball

Der Ball ist eine **deckende, texturierte, helle Fläche**. Er kann hinter Text
nur existieren, indem er sich abdunkelt — und damit aufhört zu wirken. Eine
Linie hat praktisch keine Fläche: Ein 3 px breiter Strich, der einen 96 px hohen
Buchstaben kreuzt, berührt **rund 3 %** seiner Höhe.

Dazu kommt ein zweiter Unterschied, der in der Praxis noch mehr zählt:
**Vor einer gefüllten Schaltfläche ist die Linie einfach nicht da.** Der
Inhaltsblock liegt auf `z-10`, die Zeichnung auf `inset-0` darunter. Hinter der
orangen Primärtaste und hinter dem Eyebrow-Badge ist die Linie verdeckt — kein
Kontrastproblem, keine Regel nötig. Der Ball brauchte dafür die gesamte
`ballDeckkraftUeberKaesten`-Mechanik mit ihrer Unterscheidung „Fläche oder
Tinte", vier Gate-Befunden und einem Kastenbau bei jedem Scroll-Ereignis.

### Die Rechnung

Alle Werte nach der WCAG-Relativluminanz-Formel gerechnet, nicht geschätzt.
Grund ist `navy-950` **#0B1220**, Linie ist `brand-500` **#F07A27**, Text ist
`paper-50` **#F5F7FA**.

| Größe | Wert |
|---|---|
| Relativluminanz `navy-950` | 0,00608 |
| Relativluminanz `brand-500` | 0,32590 |
| Relativluminanz `paper-50` | 0,92834 |
| `paper-50` auf `navy-950` | **17,45 : 1** |
| `paper-50` auf **vollem** `brand-500` | **2,60 : 1** (unter AA — deckt sich mit den 2,61 in `VISUELLE-RICHTUNG`) |

Eine Linie liegt aber nie voll deckend vor. Bei wirksamer Deckkraft α mischt
sich ihre Farbe mit dem Grund:

| wirksame Deckkraft α | Linie gegen Grund | **Text über der Linie** |
|---|---|---|
| 0,171 *(heute: Feldlinien)* | 1,26 : 1 | 13,89 : 1 |
| 0,279 | 1,54 : 1 | 11,30 : 1 |
| 0,342 *(heute: Zug/Pass)* | 1,84 : 1 | 9,6 : 1 |
| 0,558 | 2,81 : 1 | 6,21 : 1 |
| **0,620** | **3,21 : 1** | **5,43 : 1** |
| 0,710 | 3,6 : 1 | **4,50 : 1 ← AA-Bruch** |

### Die Regel, die daraus folgt

> **Deckkraftfenster für Linien im Hero.**
> Die **Obergrenze** ist gerechnet und hart: Über einer `brand-500`-Linie auf
> `navy-950` hält `paper-50` die WCAG-AA-Schwelle von 4,5 : 1 bis zu einer
> wirksamen Deckkraft von **0,71**.
> Die **Untergrenze** ist gewählt, nicht gemessen: Unterhalb von rund 2 : 1
> gegen den Grund liest sich ein Strich als Tonwertänderung, nicht als
> Zeichnung. Das ist ein Urteil und gehört ins Browser-Gate, nicht in einen
> automatischen Test.

**Vorschlag: `ARC_MAX` von 0,38 auf 0,62.** Damit landen die drei Ebenen bei
0,279 / 0,558 / 0,620 — die tragende Linie erreicht **3,21 : 1** gegen den
Grund (also sogar über der 3 : 1, die WCAG für *bedeutungstragende* Grafik
verlangt, obwohl unsere rein dekorativ und `aria-hidden` ist), und der Text
darüber hält **5,43 : 1**.

**Reserve bis zum AA-Bruch: 0,09 wirksame Deckkraft, rund 15 %.**

⚠️ Diese Reserve hängt an **zwei Farbwerten und sonst nichts**. Sie bricht
nicht bei einer Textänderung, nicht bei einer Breite, nicht bei einer
Fensterhöhe — das ist der ganze Punkt. Wer aber `brand-500` aufhellt oder den
Grund ändert, muss sie neu rechnen.

### Was ich damit ausdrücklich NICHT behaupte

Ein Kontrastverhältnis sagt, ob ein Buchstabe seinen Grund gewinnt. Es sagt
**nicht**, ob eine Linie zwischen den Buchstaben ruhig aussieht. Dazu gibt es
einen protokollierten Vorbefund: Das „scharfkantige Aufblitzen zwischen den
Buchstaben" war der Grund für `TEXT_DIM_FLOOR`. Meine Einordnung — und sie ist
ein Urteil, keine Messung: Das war eine **große, bewegte, deckende Scheibe**,
deren sichtbarer Anteil von Bild zu Bild sprang. Ein dünner Strich hinter Text
ist etwas anderes; jede Unterstreichung und jede Trennlinie tut es. **Aber
verifizieren muss das ein Auge, nicht ich.** Steht in Abschnitt 11.

---

## 4. Die Bewegung: „Der Abschluss"

Der Name folgt der Familie („Sprungball", „Spielfeld-Strecke") und ist zugleich
die Sache selbst: Der Spielzug, den die Taktiktafel heute *anfängt*, bekommt
sein Ende.

### 4.1 Die entscheidende Regel: was gezeichnet wird und was fällt

Das ist die wichtigste Einsicht dieses Konzepts, und sie beantwortet die Frage
nach „Apple-Niveau" technisch:

> **Was gezeichnet wird, hängt am Scroll. Was fällt, hängt an der Zeit.**

Apple scrubbt niemals eine **menschliche Handlung** — immer nur Gegenstände, die
sich drehen, aufklappen, auseinanderfahren. Der Grund ist einfach: Solche
Transformationen haben keine Physik, die man verletzen kann. Ein Dunk hat
welche. Wer ihn an die Scrollposition hängt, bekommt bei langsamem Scrollen
einen Menschen, der in der Luft hängt und mit der Maus gezogen wird. Das ist
nicht Apple-Niveau, das ist unheimlich.

Deshalb:

- **Zeichnen (Feld, Ring, Netz, Zug, Hand) ist scrollgebunden.** Eine Zeichnung,
  die langsam entsteht, ist normal — eine Zeichnung hat keine Physik.
  Vollständig umkehrbar, in jeder Geschwindigkeit richtig.
- **Der Abschluss (Ball durch den Ring, Netz) hängt an der Zeit.** Er wird
  **einmal ausgelöst** und läuft dann in **420 ms** mit eigener Kurve ab,
  unabhängig davon, ob und wie weiter gescrollt wird.
- **Einmal ausgelöst, bleibt es stehen.** Wer nach oben zurückscrollt, sieht die
  fertige Zeichnung mit dem Ball im Netz — nicht das Rückwärtsabspielen. Ein
  Spielzug, der stattgefunden hat, hat stattgefunden. Das erspart uns den
  unheimlichsten aller Zustände: den rückwärts laufenden Dunk.

### 4.2 Die Elemente (13 Pfade)

Alle in `brand-500`, alle mit `vector-effect: non-scaling-stroke` (sonst wird
die Linie beim Skalieren auf dem Handy haardünn und am Desktop fett), alle mit
`pathLength="1"` (dadurch zeichnet `stroke-dashoffset` von 1 auf 0 exakt von
Anfang bis Ende, ohne einen Layout-Zugriff pro Bild).

| # | Element | Pfade | Strich | Ebene | Deckkraft in der Ebene |
|---|---|---|---|---|---|
| 1 | **Der Ring** — Ellipse, perspektivisch verkürzt | 1 | 3,0 px | Abschluss | 1,00 |
| 2 | **Das Netz** — fünf Bögen, nach unten verjüngt. Geometrie aus `HoopEmblem` übernommen und skaliert — **dasselbe Netz wie am Ende der Fortschritts-Leiste** | 5 | 2,0 px | Abschluss | 0,55 |
| 3 | **Der Zug** — eine durchgehende Linie vom Boden aufsteigend, endend **oberhalb** des Rings | 1 | 2,5 → 3,5 px, **verjüngt sich umgekehrt**: dünn am Boden, dick am Ring | Zug → Abschluss | 0,90 → 1,00 |
| 4 | **Die Hand** — zwei kurze Striche am oberen Ende des Zugs (Unterarm als Fortsetzung, zweite Hand als Ast). Zusammen ≤ 10 % der Bühnenbreite | 2 | 3,0 px | Abschluss | 1,00 |
| 5 | **Der Ball** — Kreis, **ohne Nähte** | 1 | 3,0 px | Abschluss | 1,00 |
| 6 | **Das Feld** — Zone, Drei-Punkte-Bogen, Grundlinie (die vorhandenen `PlayDiagram`-Pfade, umkomponiert) | 3 | 1,5 px | Grund | 0,45 |

**Warum der Ball keine Nähte bekommt:** Ein Kreis in dieser Strichsprache *ist*
ein Ball, sobald ein Ring danebensteht. Nähte machen daraus ein Icon — und ein
Icon in einer Notation ist ein Genrebruch, genau wie ein Foto in einem Diagramm.

**Warum kein Brett:** In der Notation gibt es kein Brett. Ein gezeichnetes
Rechteck über dem Ring wäre der erste Schritt zur Clipart. Ellipse plus Netz
sind unmissverständlich ein Korb.

**Warum die Hand nur zwei Striche hat:** Das ist die einzige Stelle, an der eine
Figur überhaupt vorkommt — und sie ist auf Unterarm und Hand beschränkt, so wie
das bekannteste Dunk-Foto der Welt: von unten aufgenommen, Körper außerhalb des
Bildes. Kein Torso, kein Kopf, keine Beine → **keine Silhouette, keine
Clipart, kein Abstand zu einer geschützten Marke.**

### 4.3 Die Choreografie

`td = clamp(t / 0,75; 0; 1)`, wobei `t` der vorhandene Hero-Fortschritt ist
(läuft über 45 % der Bühnenhöhe). Die 0,75 ist **nicht neu erfunden** — es ist
exakt die vorhandene `BALL_SPAN` und aus demselben Grund: Die Ankunft muss
stattfinden, solange die Bühne noch im Bild ist.

| td | Was geschieht | Ebene |
|---|---|---|
| **vor dem Scrollen** | **Der Ring steht schon da**, allein, leise (Grund-Ebene). Das ist das erste Bild. | Grund |
| 0,00–0,30 | Das Feld zeichnet sich: Grundlinie → Zone → Drei-Punkte-Bogen | Grund |
| 0,10–0,25 | Der Ring hebt sich auf die Abschluss-Ebene | Grund → Abschluss |
| 0,25–0,40 | Das Netz fällt — fünf Bögen, gestaffelt, von oben nach unten | Abschluss |
| **0,30–0,80** | **Der Zug zeichnet sich vom Boden zum Ring. Das ist die Hauptbewegung** — die Hälfte der ganzen Strecke gehört ihr allein | Zug → Abschluss |
| 0,80–1,00 | Hand und Ball erscheinen am oberen Ende des Zugs, **über** dem Ring | Abschluss |
| **Auslösung bei td = 1** | **420 ms, zeitgebunden:** Ball fährt senkrecht durch die Ellipse (beschleunigend) · Netz beult aus und schnappt zurück · Ring blitzt einmal `signal-ok` · Ball kommt unter dem Ring im Netz zur Ruhe | Abschluss |

**Warum der Ring so früh kommt:** Eine aufsteigende Linie ohne sichtbares Ziel
ist ein beliebiger Schwung. Erst wenn der Korb schon dasteht, wird aus der Linie
ein *Zug zum Korb*. Das ist elementare Dramaturgie und kostet nichts.

**Warum der Zug von unten links nach oben rechts läuft:** Er läuft damit
**gegen** die Scrollrichtung, und das ist hier richtig — anders als beim
fallenden Ball, der bewusst mitlief. Ein Sprung ist eine Bewegung gegen die
Schwerkraft; das Auge liest den Widerstand.

**Die Zeitkurven:** Die Zeichenphasen sind **linear in `td`** — ein Stift folgt
der Hand, alles andere fühlt sich nach Verzögerung an. Nur der Abschluss hat
Kurven: der Fall beschleunigt (`easeInQuad`), das Netz reagiert in drei Stufen
(ausbeulen 140 ms · zurückschnappen 180 ms · nachschwingen 100 ms).

### 4.4 Die Randfälle, die ein Gate abfragen wird

- **Schneller Fling über die Schwelle hinweg:** Die Zeichnung ist eine reine
  Funktion von `td` — sie steht im selben Bild vollständig, der Abschluss löst
  aus. Ein Dunk, der schnell passiert, wenn man schnell scrollt, ist richtig.
  **Kein Sonderfall nötig.**
- **Seite lädt bereits gescrollt** (Zurück-Navigation, Sprungmarke): Endzustand
  direkt, keine Animation. Präzedenz: `if (window.scrollY > 0) return` im
  heutigen mobilen Einflug.
- **Fenstergrößenänderung während des Abschlusses:** Der Abschluss ist eine
  Zustandsmaschine ohne eingefrorene Zielkoordinate — er rechnet seine Lage in
  Bühnenanteilen. **Das ist der Unterschied zum heutigen Einflug**, der `zielY`
  beim Start einfriert und deshalb einen nachgeholten Aufruf brauchte.
- **Anmeldung löst spät auf und tauscht den Inhalt:** Die Zeichnung hängt an
  **keinem** Inhaltselement. Der Tausch ist ihr gleichgültig. Roadmap 20 e und
  20 f werden damit gegenstandslos.

---

## 5. Wo die Zeichnung steht — und warum der Umschalter das Seitenverhältnis ist

Hier steckt die Falle, die dieses Projekt schon zweimal teuer bezahlt hat.

### 5.1 Die Sichtbarkeitsregel der Bühne (hergeleitet, nicht geraten)

Aus dem vorhandenen Controller: Bei Scrollstand `S` ist `rect.top = 64 − S`,
also `t = S / (0,45·H)` mit `H` = Bühnenhöhe = Fensterhöhe − 64.

Daraus folgt: **Zum Zeitpunkt `t` ist nur das Bühnenband `[0,45·t·H ; H]`
sichtbar.**

- Bei `t = 0,75` (Auslösung des Abschlusses) beginnt das sichtbare Band bei
  **0,3375 · H**.
- Alles, was zu diesem Zeitpunkt gesehen werden soll, muss **darunter** liegen.

⚠️ **Das ist Roadmap 20 (d) als Bedingung vorher statt als Befund nachher.**
Dort steht: *„Die Landung ist auf KEINEM Viewport sichtbar — Ball und
Korb-Emblem stehen bei der Ankunft hinter der stickyen Navbar. Die Pointe der
einen Reise durch die Seite hat noch nie jemand gesehen."* Genau diese Rechnung
hat gefehlt.

**Daraus die Platzierung: der Ring sitzt auf halber Bühnenhöhe (0,50 · H).**
Reserve zur Sichtbarkeitsgrenze: 0,1625 · H — auf der kürzesten geprüften Bühne
(320 × 568, H = 504) sind das **82 px**, abzüglich der halben Ringhöhe immer
noch über 60 px.

### 5.2 Der Umschalter ist das Seitenverhältnis, nicht der Breakpoint

Eine einzige Komposition kann 360 × 800 und 1440 × 900 nicht bedienen — die
Bühnen-Seitenverhältnisse liegen um den **Faktor 3,5** auseinander. Also zwei
Anordnungen derselben Zeichnung (gleiche Elemente, gleiche Reihenfolge, gleiche
Strichstärken). Das ist responsive Art Direction, kein Widerspruch — die
Warnung aus `HeroScrollStage` galt zwei **gegenläufigen** Choreografien, nicht
zwei Anordnungen mit identischem Ablauf.

Gerechnet aus den neun Viewports von `hero-ball-laufzeit.spec.mjs` (Bühnenhöhe
= Fensterhöhe − 64):

| Viewport | Bühne | Seitenverhältnis |
|---|---|---|
| 375 × 812 | 375 × 748 | 0,501 |
| 430 × 932 | 430 × 868 | 0,495 |
| *360 × 800 (verbreitetste Android-Breite)* | 360 × 736 | *0,489* |
| 375 × 667 | 375 × 603 | 0,622 |
| 320 × 568 | 320 × 504 | 0,635 |
| **768 × 1024 (iPad hochkant)** | 768 × 960 | **0,800** |
| 1440 × 1200 | 1440 × 1136 | 1,268 |
| 1024 × 768 | 1024 × 704 | 1,455 |
| 1440 × 900 | 1440 × 836 | 1,722 |
| 1280 × 800 | 1280 × 736 | 1,739 |

**Zwischen 0,80 und 1,27 liegt kein einziges geprüftes Gerät.** Eine Schwelle
bei **1 : 1** hat also auf beiden Seiten Luft. In CSS:
`@media (min-aspect-ratio: 1/1)`.

⚠️ **Und warum ein Breiten-Breakpoint falsch wäre — mit Zahl:** Ein Umschalter
bei 768 px schickt das iPad hochkant (768 × 1024, Bühnenverhältnis **0,800**)
in die Querformat-Fassung. Dort blieben davon **54 %** übrig, **46 % der
Zeichnung wären weggeschnitten**. Das ist exakt der Fehler aus Roadmap 20 b und
20 f: *Breiten geprüft, Höhe entschieden.*

### 5.3 Die zwei viewBoxen (Werte hergeleitet, nicht gegriffen)

Beide mit `preserveAspectRatio="xMidYMid slice"`. Das viewBox-Seitenverhältnis
ist jeweils das **geometrische Mittel** der Gruppe — dadurch ist der maximale
Beschnitt auf beiden Seiten gleich groß:

| Fassung | viewBox | Verhältnis | Gruppe | max. Beschnitt |
|---|---|---|---|---|
| **Hochformat** (< 1 : 1) | `0 0 500 800` | 0,625 | 0,489 – 0,800 | **21,9 %** |
| **Querformat** (≥ 1 : 1) | `0 0 1040 700` | 1,486 | 1,268 – 1,739 | **14,7 %** |

**Sicherheitsrand:** Alle tragenden Elemente liegen innerhalb der **inneren
76 %** (Hochformat) bzw. **84 %** (Querformat) der viewBox. Damit kann kein
geprüftes Gerät etwas Tragendes abschneiden.

**Nebeneffekt, der beabsichtigt ist:** Bei `slice` bleibt der Mittelpunkt der
viewBox immer der Mittelpunkt der Bühne. Ein Element auf **halber viewBox-Höhe
liegt auf jeder Bühne auf halber Bühnenhöhe** — genau die Eigenschaft, die der
Ring braucht.

### 5.4 Die Größe: groß und leise schlägt klein und laut

**Der Ring ist rund 34 % der Bühnenbreite breit.** Auf 360 px sind das 122 px,
auf 1280 px sind es 435 px. Die Zeichnung ist damit größer als der Textblock
breit ist — die Schrift steht **in** der Zeichnung, nicht davor.

Das ist die eigentliche Antwort auf „Apple-Niveau" in der Komposition: eine
einzige, sehr große, sehr ruhige Grafik. Und es ist das exakte Gegenteil der
Lehre aus dem Ball, in der richtigen Richtung: **Ein kleines dichtes helles
Objekt muss gedimmt werden. Eine große dünne Zeichnung nicht.**

Das Netz hängt vom Ring nach unten in den Bereich der Schaltflächen. Hinter der
orangen Primärtaste ist es verdeckt — ein Netz, das teilweise hinter etwas
verschwindet, liest sich als Netz hinter etwas. Kein Problem, keine Regel.

---

## 6. Die eine Entscheidung für Patrick: Wer macht den Korb?

Heute gibt es auf der Startseite **drei** Momente, in denen ein Ball in einen
Korb geht:

1. der Hero-Ball, der an der Taste zur Ruhe kommt (kein Korb, aber der Ansatz),
2. die Landung am Korb-Emblem am Ende der Fortschritts-Leiste,
3. die `SwishSequence` im Abschluss-Block — 45 Einzelbilder, 191 KB, bei
   Deckkraft 0,28.

Ein Dunk im Hero macht daraus vier. **Das ist kein Motiv mehr, das ist ein Tick.**

### Möglichkeit A — der Hero setzt an, die Seite schließt ab

Der Hero zeigt Zug, Absprung, Hand über dem Ring — und hält **im Scheitelpunkt
an**. Die Frage „geht er rein?" wird am Ende der Seite beantwortet.
*Vorteil:* Es gibt gar nichts Fallendes zu scrubben, das Konzept wird noch
einfacher. *Nachteil:* Es ist **nicht, was Patrick bestellt hat** — er hat
ausdrücklich gesagt „der durch scrollen … in den Korb gedunked wird".

### Möglichkeit B — der Hero macht den Korb ⭐ **meine Empfehlung**

Der Hero vollendet den Dunk. Dafür weicht die Landung am Ende der Leiste (das
Korb-Emblem bleibt als **stehende** Endmarke, die Ankunftschoreografie
entfällt), und die `SwishSequence` im Abschluss-Block wird durch dieselbe
Vektor-Zeichnung ersetzt.

**Warum B, und das Argument ist hart:**

Der Einwand gegen B wäre, dass die Seite ihre Schlusspointe verliert. Aber
**Roadmap 20 (d) hält fest, dass diese Pointe auf keinem Viewport sichtbar ist
— sie ist bei der Ankunft hinter der stickyen Navbar.** Wir würden also ein
Finale schützen, das nach der eigenen Messung des Projekts **noch nie jemand
gesehen hat**.

Dazu die Produktlogik: Den Hero sehen 100 % der Besucher. Das Ende der
Feature-Strecke sehen wenige. Den stärksten Moment dorthin zu legen, wo alle
ihn sehen, ist keine Geschmacksfrage.

**Was Möglichkeit B konkret bedeutet:**

| Element | heute | danach |
|---|---|---|
| Hero-Ball (`BallSprite`, 32-Bild-Sequenz) | 104 KB AVIF / 160 KB WebP | **entfällt** — mit ihm `.hero-ball-sprite`, `BALL_SPRITE_FRAMES`, `ball-sequenz.spec.mjs` |
| Ball der Fortschritts-Leiste (`RailBallGlyph`, 20 px flach) | Fortschrittsmarke | **bleibt** — sie ist der rote Faden der Seite, und sie ist bereits flach gezeichnet, also in der richtigen Sprache |
| Landung am Korb-Emblem | Ankunftsanimation + Farbblitz | **Emblem bleibt stehend** als Endmarke, Animation entfällt |
| `SwishSequence` (Abschluss-Block) | 45 Rasterbilder, 191 KB, Deckkraft 0,28 | **entfällt**, ersetzt durch Ring + Netz als Vektor (~1 KB) |
| Bilddaten im Hero | 104 KB | **0 Bytes** |
| Bilddaten der Startseite | ~295 KB | **~0 KB** (+ ca. 5 KB Pfaddaten inline, gezippt ~2 KB) |

Der Hero lädt damit wieder **ohne ein einziges Byte Bilddaten** — der Zustand,
auf den das Redesign vom 12.08. stolz war und den die Bildsequenz am 15.08.
bewusst aufgegeben hat.

⚠️ **Roadmap 21 (Cache-Vorgabe für `/images/`) verliert dadurch den größten
Teil ihres Gegenstands**, aber nicht den ganzen: Schriften und `logo.svg`
bleiben. Die Regel „wer den Inhalt einer Datei unter gleichem Namen ändert, muss
den Namen ändern" bleibt gültig.

⚠️ **Was wir verlieren, und ich sage es klar:** Die Bildsequenz ist gutes
Handwerk. Echte Kugelrotation ist mit Vektoren nicht erreichbar, und das ist
kein Detail — es war der ganze Grund, warum sie gebaut wurde. **Aber sie gehört
nicht in dieses Bild.** Ein fotografisch modellierter Körper in einem Diagramm
ist ein Genrebruch, und Genrebrüche sind genau das, was Seiten billig aussehen
lässt. Der Verlust ist real; das Verlorene passt nicht ins neue Bild.

---

## 7. Technik: was der Entwickler bauen muss

### 7.1 Ein Controller, keine zwei Zeitquellen

**Empfehlung: der vorhandene rAF-Controller in `HeroScrollStage.js` bleibt und
wird ausgedünnt. Native CSS-Scrollanimationen (`animation-timeline: scroll()`)
werden für dieses Motiv NICHT eingesetzt.** Drei Gründe:

1. **Unterstützung ~85 %** (caniuse, 19.08.2026: Chrome/Edge 115+, Firefox
   156+, Safari 26+). Es bräuchte ohnehin einen Rückfall — also zwei Wege für
   eine Frage.
2. **Der Abschluss darf gerade NICHT am Scroll hängen.** Eine Scroll-Zeitlinie
   kann ihn per Definition nicht fahren.
3. **Zwei Schreiber auf einem Element** sind die Fehlerklasse, die dieser Datei
   schon zwei Gate-Runden gekostet hat (Kai, fünfte Runde: „gemessen zwei
   verschiedene y-Werte in einem Frame").

Für andere Flächen (die `Reveal`-Einblendungen) bleibt es eine gute Option, mit
`@supports (animation-timeline: scroll())` als Fortschrittserweiterung. Das ist
ein eigener Vorgang, nicht dieser.

### 7.2 Was wegfällt

Aus `HeroScrollStage.js` entfallen ersatzlos:

- `kaestenBauen()` samt `TreeWalker`, `Range.getClientRects()` und der
  Unterscheidung „Fläche oder Tinte"
- `ballDeckkraftUeberKaesten()`, `TEXT_FADE_MARGIN`, `TEXT_DIM_FLOOR`
- die Lückensuche (`belegt`, `tauglich`, `gewaehlt`, `sichtMitte`, `sichtUnten`)
- die mobile Verankerung: `[data-hero-eyebrow]`, `konturKanal()`,
  `MIN_KONTURKANAL`, `MOBIL_D_MIN/MAX`, `MIN_SENKRECHT`, die Auffangregel
- der `MutationObserver` auf den Anmelde-Wechsel, `kaestenFinalisieren()`,
  `stehtStill()`, `AUFGEBEN_MS`, `korrekturLaeuftRef`, `KORREKTUR_MS`
- der mobile Einflug samt `einflugAktivRef`, `eingeflogenRef`, `EINFLUG_MS`
- die Übergabe an die Leiste: `HANDOFF_START`, `gibtLeiste`, `auszug`, `tu`,
  `abrollweg`, `RAIL_BREAKPOINT`
- beide `console.error`-Diagnosen (Streifen, Auffangregel)

Grobe Schätzung: von rund 1.350 Zeilen bleiben **250 bis 350**.

`PlayDiagram.js` wird durch `HeroDunk.js` **ersetzt**, nicht ergänzt — die
Feldpfade wandern hinüber. Zwei Komponenten, die auf derselben Bühne zeichnen
und zwei Deckkraften steuern, wären genau die Doppelschreiber-Klasse von oben.

### 7.3 Der Vertrag des Controllers

```
je Frame, aus einem einzigen rAF-Tick:
  rect  = stage.getBoundingClientRect()        // EIN Layout-Zugriff
  t     = clamp((64 − rect.top) / (rect.height × 0.45), 0, 1)
  td    = clamp(t / 0.75, 0, 1)

  svg.style.opacity = (t × ARC_MAX)            // 1 Schreibvorgang
  für jeden Pfad p:
      p.style.strokeDashoffset = 1 − fenster(td, p.von, p.bis)   // 13

  wenn td === 1 und noch nicht ausgelöst:
      abschlussStarten()                       // eigener rAF, 420 ms
```

**Kosten je Frame: ein Layout-Zugriff, 14 Stilschreibvorgänge, keine
`getClientRects()`.** Heute sind es ein Layout-Zugriff, rund 10
Schreibvorgänge **und** ein vollständiger Kastenbau bei jedem Scroll-Ereignis
(gemessen 0,024 ms, 1,6 % eines Kerns bei sechsfacher Drosselung). Das neue
Motiv ist auf jeder Achse billiger.

`will-change: transform` nur auf der Gruppe, die sich bewegt (Ball im
Abschluss) — nicht auf 13 Pfaden.

### 7.4 `prefers-reduced-motion`

**Nicht die angehaltene Animation, sondern ein gewähltes Einzelbild** — nach dem
Prinzip aus Referenz 3: *die Bewegung zuerst entwerfen, das stehende Bild als
eines ihrer Bilder ableiten.*

**Das gewählte Bild ist der Scheitelpunkt:** vollständige Zeichnung, Ball und
Hand über dem Ring, der Abschluss findet nicht statt. Begründung: Ein Körper im
höchsten Punkt seines Sprungs ist das lesbarste Standbild, das der Sport kennt
— es *ist* seiner Natur nach ein Standbild, niemand erwartet, dass es sich
bewegt. Der Endzustand („Ball im Netz") wäre dagegen ein Logo und würde die
Pointe verschenken.

Nebenbei ist das auch das Bild für die Vorschau in sozialen Netzen und für den
Moment vor der Hydration.

⚠️ Ehrlich benannt: Wer reduzierte Bewegung eingestellt hat, sieht den Ball nie
durchgehen. Das ist vertretbar — die Zeichnung ist `aria-hidden` und trägt keine
Information.

---

## 8. „Apple-Niveau" — meine ehrliche Einschätzung

Patrick hat den Maßstab ausdrücklich gesetzt, also antworte ich ausdrücklich.

**Apples Qualität hängt an drei Dingen, und nur eines davon ist das Material:**

1. **Material.** Gerenderte 3D-Aufnahmen eines Gegenstands, den sie besitzen,
   ausgeleuchtet von Leuten, die beruflich ausleuchten. **Das haben wir nicht
   und bekommen wir nicht** — der Dreh wurde am 12.08. abgelehnt, und Milos
   prozedurale Sequenz zeigt die Decke unseres Werkzeugs (ich habe mir Bild 30
   der `SwishSequence` angesehen: ein kleiner texturierter Kreis und ein graues
   Rechteck).
2. **Zurückhaltung.** Eine Idee je Bildschirm, sehr viel Leere, nichts, was
   konkurriert. **Das können wir haben, kostenlos, heute.**
3. **Timing.** Kurven, die nach Masse aussehen; nichts Lineares; kein
   Überschwingen ohne Grund. **Das können wir haben** — das Projekt kann es
   schon nachweislich (`easeOutQuint`, der Aufsetzer, die 320-ms-Korrektur).

**Zwei von drei sind erreichbar. Also lautet die Antwort:**

> Eine Linienzeichnung bringt uns nicht auf Apple-Niveau, indem sie wie Apple
> aussieht. Sie bringt uns dorthin, indem sie eine Disziplin wählt, in der wir
> erstklassig sein **können**, statt eine Nachahmung, in der wir zwangsläufig
> drittklassig sind. Eine 3 px starke Vektorlinie, mit richtigen Kurven, auf
> einer schwarzblauen Fläche, ist bei sorgfältiger Ausführung
> **uneingeschränkt weltklasse-fähig** — sie kostet kein Material, nur Urteil.
> Ein gerenderter dunkender Mensch ist es mit unseren Mitteln nicht, und ein
> mittelmäßiger ist schlechter als keiner.

**Und jetzt der unangenehme Teil, den ich lieber jetzt sage als nach drei
Runden:**

**Was den Apple-Eindruck heute am meisten beschädigt, ist nicht der Ball — es
ist die Dichte des Heros.** Ein Apple-Hero ist typischerweise: eine Zeile
Schrift, ein Gegenstand, ein Link. Unserer ist: ein oranges Badge, eine
vierzeilige Display-Überschrift in 8xl, ein Absatz, **drei gleich gewichtete
Schaltflächen**, eine Taktiktafel und ein Ball. **Sechs Dinge.**

Wenn wir den Ball durch einen Dunk ersetzen, tauschen wir den Hauptdarsteller
aus. Wir ändern nichts an der Enge. Es besteht ein realistisches Risiko, dass
Patrick nach dem Umbau sagt: „schöner, aber immer noch nicht Apple."

**Meine Empfehlung, die aber nicht meine Entscheidung ist:** Der Hero sollte auf
**Überschrift + eine primäre Handlung + die Zeichnung** reduziert werden;
„Team gründen" und „Teams entdecken" rücken eine Ebene tiefer.
**Welche Handlung die primäre ist, ist eine Strategiefrage und gehört Nele** —
ich erfinde sie nicht, ich lege sie ihr vor.

**Und die letzte harte Aussage, zu Patricks „Möglichkeit 3":**

Eine **stilisierte menschliche Silhouette** auf Apple-Niveau ist das eine, was
ich nicht zusagen kann. Eine Linienfigur eines Menschen ist entweder generisch
(Clipart) oder verlangt zeichnerisches Können und Iteration, die in der
Illustration wohnen und nicht im Code. Wenn Patrick die **Figur** will, sollte
er mit mehreren Runden rechnen, und ich würde **Milo** für die Zeichnung
hinzuziehen. Die **Notationsfassung**, die ich empfehle, kann ich vollständig
spezifizieren — sie wird beim ersten Anlauf richtig.

---

## 9. Prüfmaße

Vier, jedes mit benannter Einheit. Nach der Schule aus Roadmap 20 b / 20 d:
lieber wenige belastbare als viele, die beim ersten Textwechsel brechen.

### P1 — Kontrastfenster
**Einheit: WCAG-Kontrastverhältnis**, gemessen an der *gerenderten* Pixelfarbe,
nicht aus CSS-Werten geschlossen.

- `paper-50` über **jeder** der drei Ebenen ≥ **4,5 : 1**.
  Sollwerte bei `ARC_MAX` 0,62: Grund **11,30** · Zug **6,21** · Abschluss **5,43**.
- Abschluss-Ebene gegen den Grund ≥ **3,0 : 1**. Sollwert **3,21**.

*Warum das hält:* Es hängt an **zwei Farbwerten und sonst nichts** — nicht am
Wortlaut, nicht an der Breite, nicht an der Fensterhöhe. Genau die Eigenschaft,
die dem Ball-Prüfmaß gefehlt hat.
⚠️ Reserve bis zum AA-Bruch: wirksame Deckkraft **0,71** gegen gebaute **0,62**.

### P2 — Der Ring ist im Bild, wenn der Abschluss stattfindet
**Einheit: Pixel unterhalb der Navbar-Unterkante.**

Bei `td = 1` (also `t = 0,75`) muss die **Oberkante der Ringellipse** mindestens
**24 px** unterhalb der Navbar-Unterkante liegen — auf **allen neun Viewports**
aus `hero-ball-laufzeit.spec.mjs` (die Höhenachse ist dort schon drin).

*Herleitung, keine Bauchzahl:* Sichtbar ist zum Zeitpunkt `t` nur das
Bühnenband `[0,45·t·H ; H]`. Bei `t = 0,75` beginnt es bei `0,3375·H`. Der Ring
sitzt bei `0,50·H`. Rechnerische Reserve auf der kürzesten geprüften Bühne
(320 × 568, H = 504): **82 px** minus halbe Ringhöhe.

⚠️ Das ist Roadmap 20 (d) als **Bedingung vorher** statt als Befund nachher.

### P3 — Der Abschluss hängt an der Zeit, nicht am Scroll
**Einheit: Millisekunden und Frames.**

- **(a)** Scrollposition an der Schwelle in 4-px-Schritten vor und zurück: Die
  Ballposition darf sich **nicht** ändern. **Toleranz 0 px** — es ist eine
  Zustandsmaschine, kein Interpolationswert.
- **(b)** Nach Auslösung: Dauer **380–460 ms**, gemessen zwischen erstem und
  letztem Positionswechsel des Balls.

⚠️ **Ehrlichkeitsschranke** (Muster aus Roadmap 20 f): Der Test meldet zuerst
die **Zahl der beobachteten Positionswechsel**. Unter **8** gilt er als **nicht
gemessen**, nicht als grün. Ohne diese Schranke wäre „nicht scrubbar" ein
grünes Ergebnis mit null Messframes — genau der Fall, den Kai in der neunten
Runde gefangen hat.

### P4 — Die Zeichnung ist auf beiden Fassungen vollständig
**Einheit: Prozent der viewBox-Fläche, die nach `slice` sichtbar bleibt.**

Auf den neun Viewports: sichtbare Fraktion ≥ **78 %** (Hochformat) bzw.
**≥ 85 %** (Querformat). Das sind die aus den geprüften Seitenverhältnissen
**gerechneten** Extremwerte, keine gegriffenen Zahlen. Alle tragenden Elemente
liegen innerhalb der inneren **76 %** bzw. **84 %**.

⚠️ **Der Umschalter ist `min-aspect-ratio: 1/1`, nicht ein Breitenwert.**
Der Test muss das prüfen: Ein Breiten-Breakpoint bei 768 schickt das iPad
hochkant in die falsche Fassung und schneidet dort **46 %** der Zeichnung weg.

### Was ausdrücklich KEIN Prüfmaß mehr ist

`wirksame Sichtbarkeit ≥ 55 %` · `Konturkanal ≥ 10 px` · `Zielbereich ab 360` ·
`Bildstillstand ≤ 80 ms` — alle vier beschreiben Eigenschaften eines deckenden
Balls mit gesuchter Ruhelage. Sie werden mit ihm gegenstandslos. **Die
zugehörigen Testdateien gehören gelöscht, nicht angepasst** — ein Test, der eine
nicht mehr existierende Mechanik prüft, ist schlimmer als keiner.

---

## 10. Umsetzbarkeit mit vorhandenen Mitteln

| Was | Trägt | Neue Abhängigkeit |
|---|---|---|
| 13 SVG-Pfade, `pathLength="1"`, `stroke-dashoffset` | vorhandenes Muster aus `PlayDiagram.js` | **keine** |
| Zwei viewBox-Fassungen, Umschalter per `@media (min-aspect-ratio)` | reines CSS | **keine** |
| Scroll-gebundenes Zeichnen | vorhandener rAF-Controller, stark ausgedünnt | **keine** |
| 420-ms-Abschluss | eigener rAF-Lauf, Muster wie der heutige mobile Einflug | **keine** |
| Ring- und Netzgeometrie | aus `HoopEmblem` skaliert | **keine** |
| `signal-ok`-Blitz | Präzedenz `rail-goal-flash-ring` | **keine** |
| Farben, Schriften, Token | unverändert | **keine** |

**Kein neues npm-Paket, kein Bildmaterial, kein Zulieferer, keine Kosten.**
Milo wird **nicht** gebraucht — außer, Patrick entscheidet sich für die
Figuren-Fassung (Abschnitt 8).

**Zur Schriftfrage aus dem Auftrag:** Es gibt hier nichts zu entscheiden.
Big Shoulders Display, Geist und Geist Mono sind gesetzt, begründet und selbst
gehostet, und dieser Auftrag fügt keinen Text hinzu. Eine Typo-Frage zu
erfinden, wo keine ist, wäre ein Verstoß gegen „Vorhandenes zuerst, Neues nur
als Delta". *(Eine typografische Folge gibt es allerdings, falls der Hero nach
Abschnitt 8 reduziert wird: Eine kürzere Überschrift hat ein kleineres R und
damit ein breiteres nutzbares vw-Fenster für die A1-Mechanik — heute ist es
mit 9,42–10,19 vw nur 8 % breit.)*

---

## 11. Was ich NICHT geprüft habe

Ehrlich benannt, weil ein Konzept, das seine Grenzen verschweigt, teurer ist als
eines, das sie nennt:

1. **Nichts ist im Browser gemessen.** In diesem Arbeitsbaum läuft ein Gate;
   ich habe weder gebaut noch den Entwicklungsserver gestartet. Alle Zahlen sind
   aus dem Quelltext gelesen, nach WCAG gerechnet oder aus protokollierten
   Messungen übernommen.
2. **Die eine Frage, die nur ein Auge beantworten kann:** Liest sich ein
   3-px-Strich, der zwischen den Buchstaben von Big Shoulders Black bei 48–96 px
   hindurchläuft, als **ruhig** oder als **Unruhe**? Die Kontrastrechnung sagt
   „zulässig", sie sagt nichts über „schön". Es gibt einen Vorbefund in die
   ungünstige Richtung („scharfkantiges Aufblitzen zwischen den Buchstaben") —
   der galt einer großen bewegten Scheibe, aber **verifizieren muss das Tobias,
   mobil zuerst, bevor irgendetwas als fertig gilt.**
3. **Die Seitenverhältnisse** stammen aus den Nennwerten der neun Test-Viewports.
   Echte Geräte haben Browserleisten, die die Fensterhöhe verändern — auf dem
   Handy sogar **während** des Scrollens. Die Rechnung in 5.3 hat dafür Rand,
   aber gemessen ist sie nicht.
4. **Ob der Zug von unten links im Hochformat-Beschnitt überlebt**, ist gerechnet
   (innerhalb der inneren 76 %) und nicht gesehen.
5. **Die Bildschirmaufnahme als Gegenprobe** ist seit heute möglich (`ffmpeg`
   ist installiert) und wäre der richtige Weg, das Ergebnis zu beurteilen,
   solange `screenshot` nicht kompositiert. Genutzt habe ich sie nicht — es gibt
   noch nichts aufzunehmen.

---

## 12. Wen ich einbezogen habe

- **Nele (marketing-manager)** — **erforderlich**, zwei Fragen: (a) Kann der
  Hero auf eine primäre Handlung reduziert werden, und welche ist es? (b) Trägt
  „Der Zug zum Korb" als Bild zur Positionierung *belegbare Fakten*? Ich habe
  **keine** Strategie erfunden: Überschrift, Unterzeile und
  Schaltflächenbeschriftungen bleiben unangetastet, die Reduktion ist ein
  Vorschlag an sie, keine Entscheidung von mir.
- **Nora (recht-vorpruefung)** — **erforderlich, bevor eine Figur gezeichnet
  wird.** Nikes „Jumpman" ist eine eingetragene Marke, und eine stilisierte
  Dunk-Silhouette ist der Branchenreflex. In meiner empfohlenen Fassung wird
  kein Körper gezeichnet, damit entfällt die Frage — aber sie muss beantwortet
  sein, falls Patrick die Figur will.
- **Tobias (qa-reviewer)** — bekommt ausdrücklich die eine Frage, die ich nicht
  rechnen kann (Punkt 2 oben), plus P1–P4.
- **Kai (test-automatisierung)** — die vier Prüfmaße samt der Ehrlichkeits-
  schranke in P3, und die Löschliste der gegenstandslos gewordenen Tests.
- **Ronja (retention-analystin)** — zur Kenntnis: Möglichkeit B verschiebt den
  stärksten Moment der Seite vom Ende an den Anfang. Nach Roadmap 20 (d) ist das
  kein Verlust, aber es ist ihre Domäne.
- **Milo (medien-produzent)** — **bewusst nicht einbezogen.** In der empfohlenen
  Fassung wird kein produziertes Material gebraucht. Das ist ein Ergebnis, kein
  Versäumnis.

---

## Anhang: Die drei Sätze, die dieses Konzept tragen

> **1.** Die Kontrastfrage, die den Ball zerstört hat, existiert für eine Linie
> fast nicht — weil ihr die Fläche fehlt. Das Budget liegt bei 0,71 wirksamer
> Deckkraft; genutzt werden heute 0,171.

> **2.** Was gezeichnet wird, hängt am Scroll. Was fällt, hängt an der Zeit.
> Apple scrubbt nie eine menschliche Handlung, sondern immer nur Gegenstände
> ohne Physik. Ein gescrubbter Dunk ist kein Wow, er ist unheimlich.

> **3.** Der Umschalter ist das Seitenverhältnis, nicht der Breakpoint. Jeder
> bisherige Platzierungsfehler in diesem Hero kam daher, dass über die Breite
> entschieden wurde, während die Höhe die Sache bestimmte.
