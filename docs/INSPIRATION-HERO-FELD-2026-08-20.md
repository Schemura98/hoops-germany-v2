# Inspirations-Notiz — Hero-Feld echter machen (Nacharbeit)

**Auftrag Patrick, wörtlich:** „Ich finde den neuen Stil in der Hero schon gut,
aber ich finde man kann noch etwas optimieren. Es geht definitiv in die richtige
Richtung. Aber schau dir nochmal genau an wie ein Basketballfeld aussieht und
mach was richtig geiles draus, wo sich Basketballer direkt denken, wow cool."

**Keine Rücknahme.** Standbild, Draufsicht, kühle Linien, ein Orange für Ring
und Taste sind ausdrücklich bestätigt. Offen war **Echtheit** und **Wirkung**.

---

## Stufe: **M** — und das ist eine Entscheidung gegen L, nicht eine Auslassung

Schritt 0 der Skill deutet bei „Wow-Anspruch" auf **L**. Dagegen entschieden,
mit drei Gründen — und mit einer ehrlichen Einschränkung am Ende:

1. **Register vor Suche (Regel 2) trägt hier ungewöhnlich weit.** Für genau
   diesen Suchschnitt liegen **zwei L-Sweeps aus 48 Stunden** vor: 19.08. (das
   Motiv) und 20.08. (die Komposition). Beide sind vollständig im
   `referenz-register.md`. Die Fragen „was zeichnen wir" und „wo sitzt der
   Text" sind damit beantwortet und wurden **nicht wiederholt**.
2. **Die offene Frage war keine Trendfrage, sondern eine Tatsachenfrage.**
   „Wie sieht ein Basketballfeld aus" beantwortet keine Galerie, sondern das
   Regelwerk. Der tragende Fund dieser Runde ist deshalb **Sorte C** (FIBA
   Official Basketball Rules 2026), nicht Sorte A oder B.
3. **Sorte A ist für diesen Schnitt dreimal in Folge negativ** (protokolliert
   19./20.08.): Jede prämierte Sportseite setzt ein Foto- oder 3D-Budget
   voraus, das die Startseite nicht hat und nicht bekommen soll.

⚠️ **Was das kostet, offen benannt:** Ich habe in dieser Runde **keine neue
Sorte-A/B-Recherche zur Gestaltungsfrage** gefahren. Die Wirkung ist aus dem
Gegenstand und aus vier eigenen Bau-/Ansichts-Durchgängen entschieden, nicht
aus fremden Referenzen. Wer das für zu dünn hält, hat einen Punkt — dann ist
das hier ein L-Auftrag, der als M gelaufen ist.

**Suchschnitt:** unverändert — Sport-Community, Amateur-Vereinsumfeld, **mobil
zuerst (360 px)**, Zielgruppe Liga-Spieler 16–30, **kein Bildbudget**.

---

## Die tragende Quelle

| Referenz | Sorte | Was daran stark ist | **Was ich übernehme** | **Was bewusst nicht** |
|---|---|---|---|---|
| **FIBA, Official Basketball Rules 2026** (`assets.fiba.basketball`, gültig ab Juli 2026), Rule 2.1 / 2.5.1–2.5.7 **und Diagram 3** | C | Die einzige Quelle, die die Frage überhaupt beantwortet. Und **Diagram 3 ist als Bild angesehen worden**, nicht zitiert — die Maße der Freiwurf-Aufstellung stehen im Fließtext nur als „wie in Diagram 3" | **Jedes Maß der Zeichnung.** Vier Fehler der Vorfassung sind erst dadurch aufgefallen (siehe unten) | **Die Vollständigkeit des Schaubilds.** Ein Regelwerk-Diagramm zeigt alles gleich stark; ein Hero darf das nicht. Übernommen sind die Maße, nicht die Gewichtung |
| Dieselbe Quelle, **Ausgabe 2024** | C | Gegenlesen statt Vertrauen | **Die Bestätigung, dass sich nichts geändert hat** — alle geprüften Werte identisch | — |
| Register-Einträge 19./20.08. (Regel 1 Kontrast, Regel 3 Seitenverhältnis, Regel 5 Fläche, Regel 6 Maßstab) | B | Bereits bewertet, nicht neu gesucht | Regel 3 trägt die ganze Ausschnitt-Lösung: **ein** Bild, zwei Beschnitte | Regel 5 brauchte ich nicht — es gibt weiterhin keine Fläche, nur Linien |

**Verfahren, das sich gelohnt hat und wiederverwendbar ist:** Der Direktabruf
des PDF liefert Binärmüll. `pdftotext` (Regeltext) **plus `pdftoppm`**
(Diagramm als PNG, danach mit `Read` angesehen) macht ein Regelwerk
vollständig auswertbar. Ohne den zweiten Schritt wären die Maße der
Freiwurf-Aufstellung aus einer Sekundärquelle gekommen.

---

## Was falsch war — vier Vermessungsfehler, gegen die Regel geprüft

Die Vorfassung trug den Kommentar „aus echten FIBA-Massen gerechnet". Sie war
an vier Stellen falsch, und der erste Fehler bestimmte das ganze Bild:

1. **Die Dreipunktlinie stand auf der halben Breite.** Der Code las 6,60 m als
   Abstand der beiden Geraden **zueinander** (± 3,30 m). Die Regel meint 0,90 m
   innerhalb der Seitenlinie eines 15 m breiten Feldes, also **± 6,60 m je
   Seite**. Folge: Der Übergang in den Bogen lag bei **7,46 m statt 2,99 m** —
   aus der Ecken-Drei wurden zwei Geraden über die halbe Feldlänge, aus dem
   Bogen eine Kappe darunter. **Angesehen las sich das als Klammer um die
   Überschrift.** Fehlerklasse „Radius als Durchmesser", dritte Auflage im
   Projekt.
2. **Ladezone:** r = 1,25 m statt **1,30 m**, und ohne die zwei **0,375-m-
   Schenkel**, die 1,20 m vor der Grundlinie enden (Rule 2.5.7).
3. **Freiwurfkreis war ein Vollkreis.** Rule 2.5.2 sagt „free-throw
   **SEMI**-circles", Diagram 3 zeichnet nur die vom Korb abgewandte Hälfte.
   ⚠️ **Der halb gestrichelte Kreis, den Patrick genannt hat, ist NBA/NCAA** —
   im FIBA-Regelwerk gibt es ihn nicht. Für eine deutsche Liga-Plattform ist
   die FIBA-Notation die richtige.
4. **Die Zone fehlte ganz** — bewusst entfernt, weil ihre Linien den Text
   kreuzten. Damit fehlte die Form, an der man ein Feld **zuerst** erkennt.

---

## Wo die Wirkung herkommt

**(a) Näher heran.** Die Vorfassung zeigte ~16 m Breite; Details wie die
Aufstellungsmarken wären dort 2 px lang, also Rauschen. Jetzt sind es mobil
**~7,7 m** und auf dem Notebook **~20 m** — dasselbe Bild, zwei Beschnitte
(`slice`, oben verankert). Schmal/hoch füllt die Zone das Bild; breit/flach
kommt genau das dazu, was mobil fehlt: **die Ecken-Drei und die Seitenlinien.**

**(b) Drei Gewichte statt einem.** Korbbereich kräftig (1,9), fernes Feld dünn
(1,1), Ring als einziges Orange. Patricks „nicht alles gleich stark".

**(c) Ein Tiefengefälle statt gleichmäßiger Linien.** Der Korbbereich steht in
voller Stärke über der Überschrift und ist **verschwunden, bevor der Text
beginnt**; Dreipunktlinie und Seitenlinien laufen leise durch. Das ist kein
Effekt, sondern die Antwort auf eine Zwangslage (siehe unten).

**(d) Die Aufstellungsmarken sind der eigentliche Wow-Träger.** Zehn Striche
von 0,10 m plus die zwei ausgefüllten Blöcke der neutralen Zone. Das zeichnet
niemand, der das Feld aus der Erinnerung zeichnet.

---

## Die geometrische Zwangslage — gehört in MUSTER-ZAHLEN-DIE-LUEGEN

⚠️ **Es gibt keinen Zoom, bei dem die Zonenlinien auf Telefon UND Notebook
neben dem Text liegen.** Gerechnet, nicht geschätzt:

> Die Textspalte ist mobil ~87 % der Fensterbreite (312 von 360), auf dem
> Notebook ~53 % (768 von 1440, `max-w-3xl` deckelt sie). Die Zone ist dagegen
> auf jeder Breite derselbe Bruchteil der **Zeichnung**. Damit die Linien neben
> dem Text lägen, müsste die Zone mobil > 87 % und auf dem Notebook > 53 % des
> Bildes einnehmen — bei gleichem Maßstab. Das sind zwei Maßstäbe.

Wieder **eine gesetzte Größe gegen einen Restbetrag**. Gelöst nicht über die
Lage, sondern über die **Tiefe**.

---

## Gegenprobe

**Branchen-Einerlei:** Hallenfoto/Spielerfreisteller oder Ergebniskachel-Wand.
**Unsere Absetzung ist unverändert** — die Notation statt Menschen oder
Bestand. Neu ist nur, dass die Notation jetzt **stimmt**; vorher war es die
Behauptung einer Notation.

**Mode oder Handwerk?** Ausschließlich Handwerk: Maße, Liniengewicht,
Ausschnitt, Ladeverhalten. Gegen Viviens Ausschlussliste geprüft: keine
Verläufe auf Flächen der Oberfläche (das Tiefengefälle liegt auf einem
**dargestellten Gegenstand** — dieselbe Grenze wie beim Ball), kein Glow,
keine Partikel, kein 3D.

---

## Umsetzbarkeit

SVG im Markup, eine CSS-Keyframe-Animation, Tailwind. **Kein JavaScript, keine
Bibliothek, kein Byte Bilddaten.** Unverändert.

---

## ⚠️ Nicht geprüft / bewusst nicht getan

- **Keine neue Sorte-A/B-Recherche** (s. Stufenbegründung). Auslassung, keine
  Vollständigkeit.
- **`land-book` / `godly`** weiterhin nicht abrufbar (403 seit 12.08.), nicht
  erneut versucht.
- **Sorte D nicht genutzt** — kein Referenzvideo von Patrick. Die Einblendung
  ist über **vier Einzelbilder** (300/650/1000/1500 ms) beurteilt, nicht als
  Film. Das reichte, um einen echten Fehler zu finden (s. u.), ersetzt aber
  keine Bewegungsbeurteilung.
- **Nicht auf einem echten Mittelklasse-Android geprüft.** Die Zeichnung hat
  kein JavaScript und einen Pfad mehr als vorher; ein Risiko sehe ich nicht,
  gemessen habe ich es nicht.
- **Nicht angemeldet angesehen.** Der angemeldete Zweig ist gemessen (Anker
  27 px, Suite grün), aber kein Standbild davon beurteilt.

---

## Ein Fund, den nur das Ansehen geliefert hat

Die zwei Blöcke der neutralen Zone trugen die Klasse `hero-court-block` — und
es gab **keine CSS-Regel dazu**. Sie standen ab dem ersten Bild in voller
Stärke da, während die Zonenlinie, an der sie sitzen, noch gar nicht gezeichnet
war: zwei Farbklötze, die rund eine Sekunde im Leeren schwebten.

**Keine Messung hätte das gemeldet** — im Endzustand ist alles korrekt. Gefunden
wurde es auf einem Standbild bei t = 480 ms. Es ist die Fehlerklasse „Übergabe
an nichts" (Kai K4) in ihrer sichtbaren Form: ein Klassenname, der wie eine
Zusicherung aussieht und keine ist.
