# Der Hero der Startseite — Neuansatz

> **Vivien (design-spezialistin), 20.08.2026.** Auftrag Patrick: *„mir ist
> aufgefallen, dass die Hero Animation nicht gut aussieht. Fokussiere dich nur
> darauf bitte."* Auf die Rückfrage, ob Layout, Zeichnung oder Bewegung stört:
> **„Alles zusammen — neu ansetzen."**
>
> Dies ist eine **Rücknahme**, keine Überarbeitung. Der scroll-gesteuerte Dunk
> vom 19.08.2026 (`docs/HERO-DUNK-KONZEPT-2026-08-19.md`) ist vollständig
> entfallen. Was von Nele entschieden wurde, bleibt unangetastet
> (`docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`).

---

## 0. Kurzfassung für Patrick

| Frage | Vorher | Jetzt |
|---|---|---|
| Bewegung im Hero | scroll-gesteuerte Choreografie | **keine.** Ein Standbild. Die Zeichnung zeichnet sich **einmal beim Laden** (900 ms, reines CSS) |
| Motiv | Korb in Schrägansicht + Spielfeldlinien flach + „Zug" | **eine** Draufsicht: Grundlinie, Brett, Korb, Ladezone, Freiwurfkreis, Dreipunktlinie |
| Farbe der Zeichnung | Orange bei niedriger Deckkraft (wirkte bräunlich) | **kühle Haarlinie**; Orange nur noch für Korb und Taste |
| Bühnenhöhe | `calc(100vh - 4rem)` | **nicht mehr an den Bildschirm gekoppelt** |
| Codeumfang | 1.041 Zeilen (`HeroDunk.js` + `HeroScrollStage.js`) | **rund 250 Zeilen**, davon der größte Teil Kommentar |
| JavaScript im Hero | Scroll-Listener + rAF-Schleife | **null** |

**Der wichtigste Satz dieses Dokuments** steht nicht bei der Gestaltung,
sondern bei der Arbeitsweise — siehe Abschnitt 5.

---

## 1. Was ich an der Live-Seite gesehen habe

Standbilder aus echtem Chromium, 360 px. Drei Befunde, alle bestätigt:

**(1) Die obere Bildhälfte war leer.** Zwischen Navigationsleiste und
Überschrift lagen rund **215 px** nichts — bei 530 px sichtbarer Höhe sind das
**über 40 %**, und zwar das obere Drittel, wo der Blick eintritt. Überschrift
und Taste waren ins untere Drittel gedrückt.

**Das war kein Animationsfehler, sondern Arithmetik.** Die Bühne stand auf
`minHeight: calc(100vh - 4rem)` mit der Absicht „genau ein Bildschirm". Sie war
nie einer:

- abgezogen wurden **4 rem = 64 px** (die Navigationsleiste),
- über der Bühne stehen aber Navigationsleiste **und** Testphase-Band,
  zusammen **109 px**.

Die Bühne war also **45 px zu hoch** und ragte unten aus dem Bild. Weil ihr
Inhalt mit `items-center` in genau dieser zu hohen Box zentriert wurde,
rutschte er nach unten — und oben entstand das Loch. Die Zeichnung lag
zusätzlich im unteren Bereich, verstärkte die Kopflastigkeit also noch.

**(2) Der Korb war am rechten Rand abgeschnitten** und saß auf der Zeile
„Kostenlos · ab 16 Jahren". Dazu ein Perspektivbruch: Das Netz war
**Schrägansicht von oben**, die Spielfeldlinien kamen **flach von der Seite**.
Zwei Projektionen in einem Bild — deshalb las es sich als Lampenschirm.

**(3) Der „Zug" las sich nicht als Spielzug.** Eine geschwungene Linie von
unten links, eine senkrechte, eine waagerechte. Zusammen zufällige Geometrie.
Tobias hatte das gemeldet („lose Einzelstriche statt Spielzug"); an den
Standbildern ist es deutlicher als seine Beschreibung klang.

**Dazu die Farbe:** Orange auf Navy heruntergedimmt ergibt kein zurückhaltendes
Orange, sondern ein **schmutziges Braun**. Die niedrige Deckkraft las sich
nicht als zurückhaltend, sondern als verwaschen.

---

## 2. Die Entscheidung: der Hero ist ein Standbild

**Ausdrücklich freigegeben von Patrick** („auch: gar keine Scroll-Animation").
Ich nehme das an, und zwar aus vier Gründen in dieser Reihenfolge:

**(1) Die Bewegung fand statt, während der Leser ging.** Die Bühne ist einen
Bildschirm hoch. Alles, was an den Scrollfortschritt gekoppelt ist, spielt
genau dann, wenn der Hero das Bild verlässt. Wer den Hero **ansieht**, sieht
per Konstruktion das **erste** Bild — und das erste Bild war der halb leere
Bildschirm. Eine Choreografie, deren Publikum schon weitergescrollt ist, ist
kein Wow, sondern Aufwand.

**(2) Das Bewegungsbudget ist unten besser angelegt.** Direkt unter dem Hero
liegen sechs choreografierte Szenen („Eine Saison, sechs Spielzüge"). Zwei
bewegte Erzählungen hintereinander konkurrieren; die untere ist die stärkere,
weil sie etwas **erklärt**.

**(3) Der Preis war belegt hoch.** `CLAUDE.md` führt allein für die
Ball-/Dunk-Choreografie die Roadmap-Punkte **20 bis 20h** — acht Einträge,
jeder mindestens eine Gate-Runde, und am Ende **zwei Rücknahmen durch Patrick**.
Das ist kein Argument gegen Bewegung an sich. Es ist eines gegen Bewegung **an
dieser Stelle**.

**(4) Mittelklasse-Android.** Null JavaScript, null Scroll-Listener, null rAF
auf der Einstiegsfläche.

### Es gibt trotzdem eine Bewegung — und der Unterschied ist das *Wann*

Die Zeichnung **zeichnet sich einmal beim Laden**, gestaffelt in der
Reihenfolge, in der ein Mensch ein Feld aufzeichnen würde: Grundlinie → Zone →
Bögen → Kleinzeug am Korb, zuletzt blendet der orange Korb auf. Rund 900 ms,
**reines CSS**, kein JavaScript.

> Der Unterschied zum Vorgänger ist nicht „mit oder ohne Bewegung", sondern
> **wann sie stattfindet: beim Ankommen statt beim Weggehen.**

Bei `prefers-reduced-motion: reduce` entfällt sie ersatzlos — die gesamte
Animation steht in einer `no-preference`-Klammer, der **Grundzustand ist die
fertige Zeichnung**. Das ist zugleich die Lehre aus `d841c4b` (Befund Kai K1):
Wer kein CSS oder kein JavaScript bekommt, sieht die vollständige Zeichnung,
nicht ein Versteck.

---

## 3. Das Motiv: die Zone, streng in Draufsicht

**Eine** Projektion, orthogonal, wie ein Regelwerk-Schaubild: Grundlinie,
Brett, Korb, Ladezone, Freiwurfkreis, Dreipunktlinie. Keine Ellipse, kein
Fluchtpunkt, kein Netz. **Von oben ist ein Korb ein Kreis** — und genau das ist
er hier.

**Die Geometrie ist aus echten FIBA-Maßen gerechnet, nicht gezeichnet:**
Zone 4,90 × 5,80 m · Freiwurfkreis r = 1,80 m · Dreipunktlinie r = 6,75 m um
die Korbmitte mit Parallelen bei 6,60 m · Korbmitte 1,575 m von der Grundlinie ·
Ring Ø 0,45 m · Brett 1,80 m breit, 1,20 m von der Grundlinie · Ladezone
r = 1,25 m. Auch der Übergangspunkt Parallele → Bogen ist **gerechnet**; von
Hand gesetzt gäbe er einen Knick, und ein Knick in einer Dreipunktlinie fällt
genau der Zielgruppe auf und dem Zeichner nicht.

### Drei Entscheidungen, die am gebauten Stück gefallen sind

**(a) Kein Anschnitt-Problem mehr — weil das Motiv keine Sache mehr ist.**
Der Dunk-Korb war ein **Gegenstand**, der irgendwo in der Bühne stand; also
konnte er falsch abgeschnitten werden und tat es. Eine **Spielfeld-Markierung**
kann das nicht: Ein Feld hört am Bildrand nicht auf, es geht weiter. Der
Anschnitt ist die Absicht (`preserveAspectRatio="xMidYMin slice"`).

⚠️ Damit entfällt auch die Weiche zwischen Hoch- und Querformat
(`hero-dunk-hoch`/`-quer`, `min-aspect-ratio`). **Nicht, weil das
Seitenverhältnis-Argument falsch wäre** — es war richtig und bleibt es
(Roadmap 20b). Sondern weil eine Fläche ihren Anschnitt aushält. **Wer je
wieder einen Gegenstand in diese Bühne setzt, braucht die Weiche zurück.**

**(b) Die Zonenfläche ist gescheitert und wieder entfallen.** Ich hatte sie
als Flächenstufe gebaut (navy-900 auf navy-950) — das Mittel, das
`docs/VISUELLE-RICHTUNG-2026-08-12.md` ausdrücklich vorsieht. Am Bild gesehen:
Die Zone ist 4,90 m breit, ein Display-Textblock ist im selben Maßstab
**breiter**. Die Überschrift ragte über die Fläche hinaus, und was man sah, war
nicht „Text steht in der Zone", sondern **ein Kasten, aus dem der Text
herausläuft** (Kanten auf 360 px bei x = 48 und x = 312).

> **Eine Flächenstufe trägt nur, wenn sie den Inhalt umschließt. Tut sie das
> nicht, wird aus Tiefe ein Rahmen, den niemand gezogen hat.**

Dasselbe galt für die Zonen-Zargen **als Linie**: Sie schnitten senkrecht durch
„BASKETBALL-". Das war keine Justierfrage — bei 4,90 m Zonenbreite **müssen**
sie den Text kreuzen, auf jeder Größe. Verschieben hätte nur die Breite
gewechselt, auf der es auffällt (dieselbe Fehlerform wie Roadmap 20d: *nie
behoben, nur auf eine Breite gewandert, wo es unsichtbar blieb*).

**(c) Die Farbe trägt die Bedeutung, nicht die Struktur.** Die Linien sind
**kühl** (`#3A4E7A`, dieselbe Haarlinien-Sprache wie jede Panel-Kante der
Plattform). Das eine Orange gehört genau zwei Dingen: dem **Korb** (dem
Gegenstand) und der **Taste** (der Handlung) — oben und unten, dazwischen die
Überschrift. Das ist die Blickführung.

**Der Nebeneffekt ist der eigentliche Gewinn und er ist gerechnet:**

| Text über … | Kontrast |
|---|---|
| weißer Text `#F5F7FA` über einer Feldlinie `#3A4E7A` | **7,52 : 1** |
| Kleinzeile `#E6EAF2` über einer Feldlinie | **6,72 : 1** |
| weißer Text über der Korb-Farbe `#F07A27` | **2,59 : 1** ← der einzige Fall |

Die kühlen Linien dürfen also **jede** Zeile kreuzen. Nur der Korb darf keinen
Buchstaben berühren — und das ist eine **Geometriefrage, kein Abdunkeln**.
Damit entfällt die gesamte Kontrastmechanik des Vorgängers (`TEXT_DIM_FLOOR`,
`TEXT_FADE_MARGIN`, Lückensuche, Kästenbau) ersatzlos.

---

## 4. Die Höhe — und warum die naheliegende Korrektur falsch gewesen wäre

Die naheliegende Reparatur lautet: **4 rem auf 6,8 rem korrigieren.** Genau das
wäre die Wartungsfalle. Die Zahl setzt stillschweigend voraus, dass über der
Bühne immer exakt diese zwei Leisten stehen. Verschwindet das Testphase-Band
nach der Testphase, ist sie **wieder falsch** — und zwar wieder **unsichtbar**
falsch, weil nichts kaputtgeht; es sieht nur schlechter aus.

*(Fremdbeleg für die Fehlerklasse: Smashing Magazine, „Sticky Headers And
Full-Height Elements", zur Wartbarkeit fixer `calc()`-Höhen.)*

**Deshalb ist die Bühne nicht mehr an den Bildschirm gekoppelt.** Sie ist so
hoch, wie ihr Inhalt plus ein gesetzter Rhythmus sie macht. **Es gibt keine
einzige Viewport-Einheit mehr in der Bühnendatei** — also auch keine Zahl, die
beim nächsten Umbau der Leisten still falsch wird.

Gewollte Nebenwirkung: Auf üblichen Telefonhöhen endet der Hero knapp über der
Falz, die Kante des nächsten Abschnitts ragt eben noch ins Bild. Das ist das
ehrlichste „hier geht es weiter"-Signal — es braucht keinen Pfeil.

### ⚠️ Der Fehler, den erst die Messung gefunden hat (vierte Auflage derselben Klasse)

`pt` in `rem` ist eine **gesetzte Zahl**. Die Korblage ist ein **Restbetrag**
aus Fenstermaßen: Bei `slice` ist der Maßstab das *Maximum* aus zwei
Verhältnissen — Bühnenhöhe/720 (schmal/hoch) oder **Fensterbreite/1200**
(breit/flach). Beide Größen in derselben Einheit zu vergleichen geht schief,
sobald das Fenster das Regime wechselt.

Mit festem `pt` gemessen:

| Fenster | Abstand Korb → Überschrift |
|---|---|
| 360–430 px | 23 px |
| 768 × 1024 | 9 px |
| **1440 × 900** | **−20 px → der Korb lag auf der Überschrift** |

Dort ist es kein Schönheitsfehler, sondern die einzige Stelle der Zeichnung,
die AA reißen kann (2,59 : 1). **Mein Auge hatte „eng" gesagt; die Messung sagte
„überlappt".**

Behoben durch `padding-top: max(10rem, calc(14.7vw + 1.5rem))` — der vw-Term
bildet das breitengetriebene Regime ab (176,3/1200 = 0,1469), die feste
Untergrenze das höhengetriebene. **Nachgemessen liegt der Abstand jetzt auf
allen sieben geprüften Fenstern zwischen 23 und 27 px.**

Das ist die vierte protokollierte Auflage von *„eine Stellschraube und ein
Restbetrag als dieselbe Größe behandelt"* (Roadmap 20b) — diesmal meine.

---

## 5. Die Arbeitsweise — der eigentliche Befund dieser Runde

> **Ich hatte diesen Hero gemessen und nicht angesehen.**

Kontrastwerte auf zwei Nachkommastellen, Ballpositionen, Deckkräfte, neun
Viewports, ein Konturkanal-Test — alles korrekt. Aber die halb leere obere
Bildhälfte stand in **keinem** meiner Berichte, und sie ist das **Erste**, was
ein Mensch sieht. **Keiner der damals grünen Tests konnte sie sehen**, weil
keiner gefragt hat, ob das erste Bild oben etwas *zeigt*.

Die Bilder waren die ganze Zeit verfügbar: ein Playwright-Screenshot aus echtem
Chromium, danach `Read`. Die kaputte Vorschaufläche war **kein** Grund, nicht
hinzusehen — nur einer, den anderen Weg zu nehmen.

**Für diesen Umbau war „jeder Zwischenstand wird angesehen" eine Auflage.** Sie
hat sich unmittelbar bezahlt gemacht. Vier der sieben Entscheidungen dieses
Dokuments stammen aus dem Ansehen eines Zwischenstands, nicht aus dem Konzept:

1. die Zonen-Zargen, die durch „BASKETBALL-" schnitten,
2. die Zonenfläche als Kasten hinter dem Text,
3. das leere untere Viertel der Kamera (die viewBox war 180 Einheiten zu hoch),
4. die Grundlinie 17 px unter der Navigationsleiste — **zwei parallele Striche,
   die niemand als „hier beginnt das Feld" liest, sondern als doppelt gezogenen
   Rahmen.**

Keiner dieser vier Punkte hätte eine Messung ausgelöst. Alle vier waren beim
Hinsehen sofort da.

**Ergänzend, und ebenso wichtig:** Der 1440-px-Überlapp aus Abschnitt 4 wäre
umgekehrt beim reinen Hinsehen **durchgegangen** — mein Auge hat ihn als „eng"
eingestuft. Ansehen und Messen ersetzen einander nicht; sie fangen
**verschiedene** Fehlerklassen.

---

## 6. Was geprüft ist — und was nicht

**Geprüft (lokal, ausgelieferte Fassung, `npm run build` + `next start`):**

- Sieben Fenster mit **Höhenachse** (360×640, 360×740, 390×844, 430×932,
  768×1024, 1024×768, 1440×900): leerer Rand oben **6–7 %** der sichtbaren
  Höhe (Schwelle 12 %, beanstandeter Zustand 40 %), Abstand Korb → Überschrift
  **23–27 px**, Korb auf jedem Fenster vollständig im Bild, **kein
  Querscrollen**.
- `tests/e2e/hero-standbild.spec.mjs`, **23 Fälle**, ersetzt
  `hero-dunk.spec.mjs` und `hero-erstes-bild.spec.mjs`.
- **Beide Gegenproben gefahren:** Zeichnung ausgeblendet → P1 auf **allen
  sieben** Fenstern rot (30,2 % gemeldet). `pt` auf feste 12 rem
  zurückgedreht → P2 rot **nur auf 1440** mit −19 px, grün auf den anderen
  sechs — genau die Regime-Abhängigkeit, an der ein Ein-Fenster-Test
  vorbeiliefe.
- Standbilder auf 360, 390, 768 und 1440 angesehen, nicht nur vermessen.

**Nicht geprüft, ehrlich benannt:**

- **Nicht live.** Kein Push, kein Deploy — beides war nicht beauftragt.
- **Kein Gate.** Weder Kai noch Tobias haben diesen Stand gesehen.
- **Der eingeloggte Hero** ist nur mittelbar geprüft: Er nutzt dieselbe Bühne,
  trägt aber acht Elemente und fünf Tasten. Ob die Komposition dort ebenfalls
  trägt, ist **ungemessen** — der Umfang des eingeloggten Heros liegt ohnehin
  bei Nele (offen seit 19.08.).
- **Kein echtes Low-End-Android.** Der Hero hat jetzt zwar null JavaScript, die
  Aussage „ruckelfrei" stützt sich aber auf die Bauweise, nicht auf eine
  Messung am Gerät.
- **Die Einblendung ist nicht als Bewegung beurteilt**, sondern nur ihr
  Endzustand. Für den Ablauf bräuchte es eine Bildschirmaufnahme
  (Skill `watch`, Sorte D) — das habe ich nicht gemacht.

---

## 7. Offen — Entscheidungen, keine Mängel

**(a) Der Abschluss-Block trägt weiter die Schrägansicht.** `KorbRuhe` (Ring +
Netz in 3/4-Ansicht) ist bei der Löschung von `HeroDunk.js` **unverändert** nach
`components/landing/KorbRuhe.js` herausgelöst worden — nicht neu gestaltet.

⚠️ **Damit stehen auf einer Seite jetzt beide Projektionen**: der Hero streng
in Draufsicht, der Abschluss-Block in Schrägansicht. Das ist genau der
Perspektivbruch aus Befund (2), eine Etage tiefer. **Ich habe es bewusst nicht
angefasst**, weil der Auftrag „fokussiere dich nur darauf [den Hero]" lautete.
Die Angleichung ist ein eigener, kleiner Auftrag — und aus meiner Sicht der
nächste, den dieser Bereich braucht.

**(b) `/signup` liefert ohne JavaScript eine leere Seite** (Roadmap 22). Der
Hero hat genau **einen** Ausgang, und das ist dieser. Unverändert dringlich,
liegt bei Nora und mir.

**(c) Acht Roadmap-Punkte sind gegenstandslos geworden.** 20, 20b, 20c, 20d,
20e, 20f, 20g, 20h drehen sich ausnahmslos um Fragen, die eine ruhende
Linienzeichnung nicht stellt (Ballsprung beim Anmelde-Wechsel, Abdunkelung über
Schaltflächen, Bildstillstand der Rotation, Sichtbarkeit des Balls, das
Scrollfenster). Sie sollten als erledigt-durch-Wegfall geführt werden, **nicht
als gelöst** — der Unterschied ist wichtig, falls jemand die Mechanik je
zurückholt.

**(d) `data-spur="desktop"` in der Feature-Strecke liefert `d=""`** — ein
leerer Pfad mit `pathLength="1"` im ausgelieferten Blatt. Beiläufig gefunden,
als mein erster Testentwurf darüber stolperte. **Nicht mein Auftrag, nicht
geprüft**, aber jemand sollte hinsehen.

---

## 8. Wen ich einbezogen habe

- **Nele (marketing-manager)** — ihre Entscheidung vom 19.08.
  (`HERO-AKTION-ENTSCHEIDUNG`) ist die Grundlage und **unangetastet**:
  Überschrift wörtlich, eine Taste, eine Kleinzeile, `?src=home-hero`. Ich habe
  keinen einzigen Text geändert. Sie sieht sich das gefinishte Stück aus
  Zielgruppensicht an — das steht noch aus.
- **Tobias (qa-reviewer)** — sein Befund „lose Einzelstriche statt Spielzug,
  gut gemachte Hintergrundzeichnung, kein Hauptdarsteller" war der genaueste
  Vorbote dieser Rücknahme. Seine offene Frage „Hauptdarsteller oder
  Hintergrund?" ist jetzt beantwortet: **Hintergrund** — aber mit **einem**
  Hauptdarsteller darin, dem orangen Korb.
- **Kai (test-automatisierung)** — nicht beauftragt; die neue Testdatei ist
  meine und gehört von ihm gegengelesen, besonders die Ehrlichkeitsschranken.
- **Nora (recht-vorpruefung)** — **bewusst nicht.** Es gibt keine neue Aussage,
  keine Zahl, keinen Anspruch. Die gestrichene Dunk-Silhouetten-Frage
  (Jumpman-Markenrecht, Register 19.08.) ist mit dem Wegfall der Figur endgültig
  gegenstandslos.
- **Milo (medien-produzent)** — **bewusst nicht.** Der Hero lädt weiterhin
  **null Byte Bilddaten**; es gibt nichts zu produzieren. Das war Patricks
  ausdrückliche Randbedingung und ist eingehalten.
- **Malik / Hanna** — Werkzeugbefund und Roster: siehe Bericht.
