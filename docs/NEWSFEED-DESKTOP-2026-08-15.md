# Newsfeed Desktop – Gestaltungsentwurf

**Vivien (design-spezialistin) · 15.08.2026**
**Status: Entwurf, kein Code.** Patrick baut. Grundlage: Patricks Urteil vom
15.08.2026 („keinen eigenen Charakter, wenig Kreativität, sieht KI-generiert
aus"). Sweep-Notiz separat: `docs/INSPIRATION-NEWSFEED-DESKTOP-2026-08-15.md`.

> **Kurzfassung in vier Sätzen.** Patrick hat recht, aber die Ursache ist nicht
> das Dreispalten-Raster – es ist, dass die meistbesuchte Seite als einzige
> **keines** der fünf Signatur-Mittel dieses Projekts benutzt (gemessen, Tabelle
> in §1.3). Die Seite zeigt Geschwätz in Maximalgröße und belegte Fakten in
> Minimalgröße – genau umgekehrt zur Kernpositionierung. Der Entwurf dreht das
> um: ein **Tafel-Band** oben trägt die Signaturleiste und die belegten Zahlen,
> der Feed bekommt **zwei Ränge** (Ereignis vs. Wort), und die Seitenleisten
> werden von sieben Karten zu **einer Schiene**. Kein zentraler Karten-Umbau –
> Begründung in §6.

---

## 1. Was ich gemessen habe

Nicht aus dem Quelltext geurteilt. Dev-Server auf `:3000`, Konto `max@test.de`,
Playwright/Chromium, Aufnahmen bei 390 / 1280 / 1600 / 1728 px.
Messskripte im Scratchpad (kein Produktcode), Aufnahmen unter
`…\scratchpad\shots\`.

### 1.1 Die Zahlen

| Messung | Wert | Bedeutung |
|---|---|---|
| Panels mit identischer Behandlung (navy-800 + 1px Rahmen) | **18** auf Desktop | – |
| davon mit identischem Radius `10px` | **16** | Keine Hierarchie: 16 Flächen sagen „ich bin gleich wichtig" |
| Höhe der Onboarding-Checkliste | **504 px**, Breite 1120 px | Größtes Element der Seite |
| Elemente mit Brand-Rahmen (= hervorgehobene Karte) | **genau 1** – die Checkliste | Die betonteste Fläche der Seite ist eine **Aufgabenliste**, kein Basketball |
| `main`-Breite bei 1280 px Fenster | 1152 px | ok |
| `main`-Breite bei **1728 px** Fenster | **1152 px** | Die „Desktop-Variante" ist die Tablet-Variante, mittig geparkt. 576 px (33 %) bleiben ungenutzt |
| Leerraum unter der linken Schiene beim Scrollen (1728) | **362 px** | Die Spalte hört nicht auf, ihr geht der Inhalt aus |
| Horizontaler Überlauf | keiner (390/1280/1600) | sauber |
| Konsolenfehler | keine | sauber |

### 1.2 Was auf dem Bild zu sehen ist

Über der Falz sieht ein wiederkehrender Spieler: Testphase-Banner, Navigation,
„NEWSFEED", zwei schmale Spielkarten – und dann einen 504 px hohen
Willkommens-Kasten bei 75 %. **Der Feed beginnt unterhalb der Falz.**

Beim Scrollen: acht nahezu identische Kästen mit je einem Satz
(„Neue Saison, neue Ziele. Lass uns angreifen!") in einer 510 px schmalen
Spalte, links daneben tote Fläche, rechts eine Liste mit **sieben orangen
„Folgen"-Knöpfen** – nach dem Fortschrittsbalken der farbigste Block der Seite.

### 1.3 Der eigentliche Befund

Das Projekt hat fünf Signatur-Mittel der Richtung „Anzeigetafel". Wo sie
eingesetzt werden (`grep`, 15.08.2026):

| Signatur-Mittel | Eingesetzt auf | Newsfeed |
|---|---|---|
| 2px-`brand-500`-Leiste (via `PageHeader`) | 13 Seiten | **nein** – die Seite baut einen eigenen Kopf |
| `SplitFlap` (Klapp-Anzeige) | `/match/[id]`, Landing, Tour | **nein** |
| `CountUp` | `/rangliste`, `/topscorer`, Landing, Profil, Tour | **nein** |
| `Reveal` | 12 Dateien | **nein** |
| `ScrollTable` | 3 Listenseiten | **nein** |

**Von fünf Mitteln benutzt der Newsfeed null.** Jede andere nennenswerte Seite
benutzt mindestens eins. Das ist der messbare Kern von „sieht KI-generiert aus":
Die Seite spricht die Sprache nicht, die dieses Projekt für sich entwickelt hat –
sie fällt zurück auf das, was jedes Framework von der Stange liefert.

Zwei Details, die das zuspitzen:

- **`/match/[id]` hat den Beweis-Moment bereits.** Dort klappt der Spielstand per
  `SplitFlap` um und trägt den Beleg-Status. Auf der Seite, die man **einmal**
  besucht. Auf der Seite, die man **täglich** besucht, steht derselbe Spielstand
  als 14-px-Text.
- **`TourProofBoard` existiert** – eine echte Anzeigetafel, die vorführt, warum
  die Zahlen belegbar sind. Sie läuft **einmal** in der Willkommens-Tour, mit
  **erfundenen Beispielzahlen**. Der tägliche Ort, an dem echte belegte Zahlen
  stünden, hat nichts davon.

### 1.4 Korrektur an CLAUDE.md (gemessen)

CLAUDE.md führt: „`Card` hat **0 Importe** und `cardClass` **0 Verwendungen**;
stattdessen bauen **126 Stellen** die Panel-Fläche von Hand."

Stand 15.08.2026 gemessen:

- `Card` hat **3 Importe** (`components/feed/SpieltagStrip.js`,
  `components/feed/FollowSuggestions.js`, `components/posts/PostComposer.js`)
- `cardClass` hat weiterhin **0 Verwendungen**
- Von Hand gebaute Panels: **141**, nicht 126

⚠️ Und ein Widerspruch in **einer** Datei: `FollowSuggestions.js` importiert
`Card`, benutzt es im **Leerzustand** (Z. 92) und baut die Fläche im
**Normalzustand** von Hand (Z. 99). Dieselbe Fläche, zwei Wege, eine Datei.

---

## 2. Leitidee

### 2.1 Die Frage, die Patrick gestellt hat

*Was ist der Newsfeed von Hoops Germany, was der von LinkedIn nicht ist?*

Der Delta-Sweep (Notiz separat) liefert dazu einen Befund, der die Richtung
umdreht. Bei **allen** einsehbaren Amateursport-Plattformen – FuPa, kicker,
ligaportal, MaxPreps – lautet die Rangfolge gleich: **Live-Ergebnis → Tabelle →
Statistik → erst dann News/Community.** Keine davon beschreibt einen
Social-Feed als beherrschendes Startseiten-Element.

Daraus folgt etwas Unangenehmes: **Hoops kopiert die falsche Branche.** Der
heutige Newsfeed ist der Aufbau von LinkedIn und Facebook – Beiträge in der
Mitte, Daten am Rand. Deshalb wirkt er austauschbar: Er ist austauschbar, nur
eben mit Social-Plattformen statt mit Sportportalen.

Die Antwort ist aber **nicht**, FuPa zu kopieren. Dann wäre die Seite ein
weiteres Ergebnisarchiv. Der Unterschied liegt dazwischen:

> **FuPa hat Ergebnisse. LinkedIn hat Menschen. Hoops ist die einzige Fläche,
> auf der eine Zahl an einen Menschen gebunden UND unabhängig belegt ist.**

Eine Zahl auf Hoops hat eine Herkunft: Sie stammt aus einem Spiel, das **beide**
Teams unabhängig gemeldet und bestätigt haben. Das kann LinkedIn nie zeigen und
FuPa nie brauchen.

### 2.2 Die Leitidee

> **„Die Anzeigetafel nach dem Spiel."**
> Der Feed zeigt nicht, was Leute **gesagt** haben, sondern was seit dem letzten
> Besuch **wahr geworden ist** – und woran man das erkennt.

Die Einheit des Feeds ist nicht der Beitrag. Sie ist der **Eintrag mit
Beleg-Stand**: Etwas ist passiert, hier ist die Zahl, und hier steht, ob sie
bestätigt ist.

**Das ist keine neue Funktion.** `lib/matchScore.js` rechnet
`matchVerification` bereits aus, `SpieltagStrip` und `TeamMatchesWidget`
benutzen es schon – nur als 11-px-Beiwerk in Grau. Und `models/Post.js` trennt
bereits `kind: "user" | "auto"` mit `autoType: match_result | transfer |
team_founded | tryout`. Die Unterscheidung liegt vor. Sie wird gestalterisch
nur nicht genutzt: Ein Ergebnis-Auto-Post rendert heute in **exakt derselben**
`bg-navy-800 rounded-md border border-navy-600 p-4`-Schachtel wie ein
Trainingsspruch, nur mit anderem Icon (`PostCard.js` Z. 312).

### 2.3 Trägt das eine eigene Bildsprache?

Ja, und zwar eine formale, nicht nur eine farbliche. Eine echte Anzeigetafel hat
eine Eigenschaft, die die heutige Seite ignoriert:

> **Eine Anzeigetafel besteht nicht aus Karten.** Sie ist **eine** durchgehende
> dunkle Fläche mit beleuchteten Registern, geteilt durch Linien – nicht durch
> Kästen.

Das ist der gestalterische Hebel. Die heutige Seite hat 18 Kästen. Die
Anzeigetafel hat null Kästen: einen Rahmen und waagerechte Register. Aus „sieben
gleich behandelte Widgets" wird damit **eine Schiene mit sieben Registern** –
ohne einen einzigen Inhalt zu löschen und ohne eine neue Farbe zu erfinden.
Das ist Subtraktion, nicht ein neuer Stil.

**Die Beleg-Marke** ist das zweite eigene Mittel und das einzige echte
Alleinstellungszeichen. Sie hängt an jeder Zahl, die eine Herkunft hat:

| Zustand (`matchVerification`) | Marke | Farbe | Zusatz |
|---|---|---|---|
| `confirmed` / `final` | `PiSealCheckBold` + „Bestätigt" | `signal-ok` | 2px-Unterstrich unter der Zahl (Signatur-Position 3) |
| `pending` / `unverified` | „Noch nicht bestätigt" | `signal-wait` | kein Unterstrich |
| `mismatch` | „Strittig" | `signal-error` | kein Unterstrich, **kein Urteilswort** |

⚠️ Die letzte Zeile ist eine bestehende Ehrlichkeitsregel und wird
**wörtlich übernommen**: Bei `mismatch` stammt der Punktestand aus der Sicht von
Team A – „Sieg" wäre dessen Meinung als Tatsache gesetzt (Fund von Kai, steht im
Kopf von `SpieltagStrip.js`). Die Marke darf den Zustand zeigen, nie ihn
überschreiben.

### 2.4 Was Form leisten kann – und was nicht

Patrick schreibt, der Feed solle die User „förmlich an die Seite fesseln".
Ehrlich dazu: **Gestaltung erzeugt keine Wiederkehr.** Ob jemand wiederkommt,
entscheidet, ob seit gestern etwas passiert ist, das ihn betrifft – das ist
Ronjas Feld, nicht meins. Was Gestaltung leisten kann, ist eng, aber echt:

> In der ersten Sekunde muss sichtbar sein, **ob** sich etwas geändert hat und
> **ob es zählt**. Heute braucht das Scrollen und Lesen.

Alles, was darüber hinaus als „fesselnd" verkauft würde, wäre entweder ein Dark
Pattern oder eine erfundene Kennzahl. Beides fällt aus.

---

## 3. Layout

### 3.1 Was heute steht

```
max-w-6xl (1152px)
└── header (eigener Seitenkopf, OHNE Signaturleiste)
└── SpieltagStrip           2 schmale Karten
└── OnboardingChecklist     504px hoch, einziges Element mit Brand-Rahmen
└── grid lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-6
    ├── aside   TeamMatches · TopTeams          → Inhalt endet, Spalte läuft leer
    ├── PostFeed                                 → 544px, alles gleich schwer
    └── aside   FollowSuggestions · Transfers · News
```

### 3.2 Vorschlag

Drei Zonen statt drei Spalten. Das Dreispalten-Schema fällt weg – nicht weil
drei Spalten per se schlecht sind, sondern weil **zwei davon Restrampen** sind.

```
max-w-[1200px]  (statt max-w-6xl/1152 – moderat, s. 3.6)

┌─ ZONE 1 · DIE TAFEL ────────────────────────── volle Breite ─┐
│ border-t-2 border-brand-500   ← die EINE Signaturleiste       │
│ bg-navy-900 · rounded-md · KEIN Schatten                      │
│ ┌─────────────┬─────────────────────┬─────────────────────┐  │
│ │ NÄCHSTES    │ LETZTES ERGEBNIS    │ DEINE SAISON        │  │
│ │ SPIEL       │ 80:94  [Beleg]      │ 12 Sp · 14,2 Pkt    │  │
│ └─────────────┴─────────────────────┴─────────────────────┘  │
│              divide-x divide-navy-600 – Linien, keine Kästen  │
└───────────────────────────────────────────────────────────────┘

┌─ ZONE 2 · FEED ──────────────────┐  ┌─ ZONE 3 · SCHIENE ──┐
│ zwei Ränge (§3.4)                │  │ EIN Panel           │
│ Text gekappt auf max-w-[68ch]    │  │ divide-y            │
│ Zahlen dürfen die volle Breite   │  │ sticky top-24       │
└──────────────────────────────────┘  └─────────────────────┘
   grid lg:grid-cols-[minmax(0,1fr)_340px] xl:[…_380px] gap-x-10
```

### 3.3 Zone 1 – Die Tafel

Ersetzt **den heutigen Seitenkopf und `SpieltagStrip` zusammen**. Beide sagen
heute Verwandtes an zwei Orten; `TeamMatchesWidget` sagt es ein drittes Mal.

| Eigenschaft | Wert | Begründung |
|---|---|---|
| Fläche | `bg-navy-900` | eine Stufe **unter** den Panels (`navy-800`) – die Tafel ist Grund, nicht Karte |
| Oberkante | `border-t-2 border-brand-500` | **die Signaturleiste dieser Seite**, Position 1 der Spezifikation |
| Radius | `rounded-md` (10px) | Standard-Panel-Radius, kein Sonderweg |
| Register-Trenner | `divide-x divide-navy-600` | 1px-Haarlinie statt Kastenrahmen |
| Zahlen | `font-display` (Big Shoulders), `text-5xl`–`text-6xl`, `tabular-nums` | Anzeigetafel-Proportion; heute `text-lg` |
| Labels | `font-mono text-[10px] uppercase tracking-[0.18em] text-mist-400` | bereits als `LABEL` in `SpieltagStrip.js` definiert – wiederverwenden |
| Schatten / Verlauf / Glow | **keine** | Vorgabe der Richtung |

**Register 3 („Deine Saison") ist neu und braucht Ronja** – siehe §5.
Ist es nicht zu füllen, hat die Tafel zwei Register. Sie darf **nicht** mit einem
leeren Kasten Präsenz behaupten; das ist die bestehende Regel aus
`SpieltagStrip.js` („Kein Team / keine Spiele → die Leiste erscheint gar nicht").

**Mobil:** Die Register stapeln auf **zwei** (nächstes Spiel, letztes Ergebnis) –
also faktisch die heutige `SpieltagStrip`-Höhe. Register 3 entfällt unter `sm`.
Die Zahlen fallen auf `text-3xl`. Damit wird mobil nichts länger.

### 3.4 Zone 2 – Der Feed bekommt zwei Ränge

Der zweitgrößte Beitrag zum „alles gleich"-Eindruck: Ein bestätigtes 80:94 und
„Game Day! Heute zählt's." haben heute exakt dieselbe Fläche, denselben Rahmen,
dasselbe Gewicht.

**Rang A – Ereignis-Einträge** (`kind === "auto"`): Das sind Tatsachen.

- Behandlung wie ein kleines Tafel-Segment: `bg-navy-800`, Zahl in
  `font-display tabular-nums text-3xl`, **Beleg-Marke** rechts daneben
- Kein Avatar-zentrierter Kopf – der Autor ist das Ereignis, nicht eine Person
- Klickziel bleibt `post.meta.href`

**Rang B – Wort-Einträge** (`kind === "user"`): Das ist Gespräch.

- **Kein Kasten.** Nur eine Zeile mit `border-b border-navy-600`, Avatar 32 px,
  Text in Lesegröße
- Gespräch soll wie Gespräch aussehen, nicht wie eine Meldung

Das ist ein **Gewichtsunterschied, keine Abwertung**: Rang B wird ruhiger,
nicht kleiner – der Text bleibt in voller Lesegröße. Was verschwindet, ist der
Kasten, der einem Halbsatz das Gewicht einer Meldung gibt.

**Zeilenlänge:** Der Feed-Text wird auf `max-w-[68ch]` gekappt (≈ 640 px,
innerhalb 45–75 Zeichen), **die Spalte selbst nicht**. So bleibt Fließtext
lesbar, während Ergebniszeilen die volle Spaltenbreite für Zahlen nutzen dürfen.
Heute ist die Spalte mit 544 px zu schmal für beides.

### 3.5 Zone 3 – Aus fünf Karten wird eine Schiene

Heute: fünf Panels in zwei Spalten, jedes mit `bg-navy-800 rounded-md border
border-navy-600 p-4` + Icon + Titel. Fünfmal dieselbe Geste.

Vorschlag: **ein** Panel, innen `divide-y divide-navy-600`, je Abschnitt eine
Mono-Eyebrow statt einer Icon-Überschrift.

```
┌──────────────────────────┐
│ SPIELE                   │   ← font-mono, uppercase, tracking, mist-400
│  Test Baskets  · 18.08.  │
├──────────────────────────┤   ← divide-y, keine neue Karte
│ TABELLE · DEINE LIGA     │
│  1 Munich Hoops    4-1   │
├──────────────────────────┤
│ WECHSEL                  │
│  …                       │
└──────────────────────────┘
```

Das löst zugleich das Problem der toten Spalte: Eine Schiene mit sichtbarer
Unterkante **endet**; zwei kurze Karten übereinander **hören auf**. Der Unterschied
ist rein visuell und genau der zwischen „bewusst" und „ausgegangen".

### 3.6 Zur Breite

Ich schlage `max-w-[1200px]` vor statt `max-w-6xl` (1152) – **nicht** mehr.
Das ist bewusst zurückhaltend, obwohl bei 1728 px heute 33 % ungenutzt sind.

Grund: Ein Feed ist eine **Lesefläche**. Ihn auf 1728 px aufzuziehen macht ihn
schlechter, nicht besser. Das gemessene Problem ist nicht, dass Rand existiert,
sondern dass **innerhalb** der 1152 px schlecht verteilt wird (544 px Feed
zwischen zwei Restrampen). Zwei Zonen statt drei lösen das, ohne die Lesefläche
zu opfern. Wer den echten Breitenausbau will, müsste Inhalt dafür haben – den
hat die Seite heute nicht.

---

## 4. Hierarchie

Patrick fragt: Welches **eine** Element trägt die Signaturleiste, was ist die
hervorgehobene Karte?

### 4.1 Die Signaturleiste

**Die Oberkante der Tafel (Zone 1). Genau dort, sonst nirgends auf dieser Seite.**

Damit erfüllt die Seite Position 1 der Spezifikation („untere Kante von
Navbar/PageHeader"), die sie heute komplett auslässt, weil sie `PageHeader` nicht
benutzt.

⚠️ **Ein Konflikt, den ich benennen muss:** `PlayerNav.js` benutzt
`border-b-2 border-brand-500` bereits als **Unterstreichung des aktiven
Navigationspunkts** (Z. 129–144). Das ist streng genommen eine vierte Verwendung
der 2px-Marke und verwässert die „genau drei Stellen"-Regel. Ich halte sie für
vertretbar (aktiver Zustand, nicht Dekoration), aber **es ist eine Abweichung von
meiner eigenen Spezifikation und sollte dort nachgetragen werden** – entweder als
zulässige vierte Position oder durch Umstellung der Nav auf eine 1px-Marke.
Das ist Patricks Entscheidung, nicht meine.

### 4.2 Die hervorgehobene Karte

**Heute: die Onboarding-Checkliste** – 504 px hoch, das einzige Element mit
Brand-Rahmen, bei 75 % erledigt und mit **einem** offenen Schritt
(„Profilfoto hochladen").

**Vorschlag: das jüngste Ereignis mit Beleg-Stand.** Also im Regelfall das
letzte bestätigte Ergebnis in der Tafel; liegt etwas an, das **Handlung**
verlangt (ein unbestätigtes eigenes Ergebnis, ein strittiges Spiel), tritt
dieses an die Stelle – das ist echte Dringlichkeit, keine erfundene.

**Die Checkliste wird bei ≥ 50 % Fortschritt zu einer Zeile**, nicht zu einem
Panel: eine Fortschrittslinie plus den einen offenen Schritt als Link. Unter
50 % darf sie ein Panel bleiben – da ist sie noch echte Hilfe. Der Auslösewert
gehört fachlich zu Ronja (§5), die Form ist meine.

### 4.3 Bewegung – und wo sie hier aufhört

Alle drei Bausteine existieren und werden **unverändert** wiederverwendet:

| Mittel | Wo | Warum genau dort |
|---|---|---|
| `SplitFlap` | **genau eine** Zahl: der Spielstand in der Tafel, und nur wenn er seit dem letzten Besuch neu ist | Die Regel steht in `SplitFlap.js`: „gehört an genau EINE Stelle je Seite" |
| `CountUp` | Register 3 der Tafel (Saisonzahl) | bereits auf `/rangliste`, `/topscorer`, Profil im Einsatz |
| `Reveal` + `staffel()` aus `lib/ui.js` | Feed-Einträge beim Nachladen | 70 ms, gedeckelt bei 6 – zentral vorhanden, keine neue Zahl |

**Ausdrücklich NICHT: scroll-gesteuerte Animation auf dieser Seite.**
Mein Auftrag nennt Scroll-Choreografie als Kernrepertoire, und für die Startseite
gilt das weiter. Hier gilt es nicht: Das ist eine **tägliche Gebrauchsfläche**.
Eine Bewegung, die beim ersten Besuch beeindruckt, ist beim dreißigsten eine
Bremse. Bewegung hier heißt **Ankunft** (etwas Neues meldet sich an), niemals
**Reise** (Inhalt an Scrollfortschritt gekoppelt).

`prefers-reduced-motion` tragen alle drei Bausteine bereits selbst.

---

## 5. Was ich streichen würde

Ausdrücklich erwünscht. Reihenfolge nach Wirkung.

| # | Streichung | Begründung | Entscheidet |
|---|---|---|---|
| **S1** | **Checklisten-Panel bei ≥ 50 %** → eine Zeile | Gemessen 504 px für **einen** offenen Schritt; verdrängt den Feed unter die Falz und ist die einzige hervorgehobene Fläche der Seite | Form: ich · Schwelle: Ronja |
| **S2** | **`NewsWidget` (Basketball-News) vom Newsfeed nehmen** | Fünf Meldungen über Bundesliga/WM – fremder Basketball. Größter Block der rechten Spalte, führt aus der Seite **heraus**. Steht in direktem Widerspruch zur Leitidee: Das ist genau **nicht** „was ist bei mir passiert" | **Ronja** – Inhaltsfrage, ich liefere nur den Formbefund |
| **S3** | **Die zwei Filter-Auswahlfelder in `TopTeamsWidget`** | Liga- **und** Bundesland-Filter in einer 340-px-Schiene ist eine Mini-App am Seitenrand. Genau hier hatte Patrick am 15.08. den Überlauf-Fehler. Vorschlag: **eigene Liga**, fertig; `/rangliste` trägt den Rest und ist verlinkt | ich (Form), unstrittig |
| **S4** | **`FollowSuggestions` von 7 auf 2–3 Zeilen** | Sieben orange Knöpfe sind nach dem Fortschrittsbalken der farbigste Block der Seite – eine Folge-Farm dominiert die Fläche, auf der es um belegte Leistung gehen soll | ich (Form) · Zahl: Ronja |
| **S5** | **Doppelte Spiel-Information auflösen** | `SpieltagStrip` (nächstes Spiel + letztes Ergebnis) und `TeamMatchesWidget` (anstehend + Ergebnisse **desselben** Teams) zeigen dasselbe zweimal auf einem Bildschirm. Die Tafel übernimmt; das Widget wird zum Schienen-Register „Spiele" mit **nur** den nächsten zwei Terminen | ich |
| **S6** | **Der eigene `<header>` der Seite** | Er ist der Grund, warum die Signaturleiste fehlt. Geht in der Tafel auf | ich |

**Nicht gestrichen, bewusst:** `TransferFeedWidget` (echte Ereignisse aus dem
eigenen Umfeld – das ist Leitidee-konform) und der Composer (die Seite braucht
einen Einstiegspunkt zum Schreiben; er wandert aber **unter** die Tafel und wird
einzeilig wie mobil).

---

## 6. Kartensprache: kein zentraler Umbau

Patrick fragt ausdrücklich, ob das ein zentraler Umbau wird. **Nein.**

Der Newsfeed bekommt eine **bewusst abweichende Fläche**, und zwar aus drei
Gründen:

1. **Die Karte ist nicht falsch – die Ausschließlichkeit ist es.** Mein Entwurf
   ersetzt keine Kartenoptik durch eine andere; er nimmt an drei Stellen die
   Karte **weg** (Tafel = Grundfläche, Schiene = ein Panel, Wort-Einträge =
   Zeilen). Das ist Subtraktion. Für einen globalen Umbau gibt es hier gar keinen
   Anlass.
2. **Das Risiko steht in keinem Verhältnis.** 141 Fundstellen anzufassen ist der
   riskanteste denkbare Eingriff bei kaum sichtbarem Gewinn – diese Abwägung
   steht bereits in CLAUDE.md und ich bestätige sie ausdrücklich.
3. **Der Newsfeed ist der richtige Ort für eine Ausnahme.** Er ist die einzige
   Seite, deren Aufgabe „Zustand aller Dinge auf einen Blick" lautet. Eine
   Anzeigetafel darf anders aussehen als eine Listenseite.

**Aber zwei Auflagen**, damit daraus kein Wildwuchs wird:

- Wo im Entwurf **doch** eine Karte steht (Ereignis-Einträge, Composer), wird
  `Card` bzw. `cardClass` benutzt – die Zahl der handgebauten Panels darf durch
  diesen Umbau **nicht steigen**.
- Der Widerspruch in `FollowSuggestions.js` (Card im Leerzustand, Handbau im
  Normalzustand) wird bei der Gelegenheit aufgelöst.

---

## 7. Was ich von anderen brauche

Ich entscheide die Form. Diese Punkte sind ausdrücklich **nicht** meine.

### An Ronja (Retention) – Inhalt & Funktion

| | Frage |
|---|---|
| **R-a** | **Register 3 der Tafel („Deine Saison").** Ich habe den Platz, nicht den Inhalt. Was ist die eine Zahl, die einen Spieler zurückholt – Spiele/Schnitt der Saison? Letzte Veränderung? Etwas anderes? Wenn keine trägt: Tafel mit zwei Registern, kein Platzhalter. |
| **R-b** | **`NewsWidget` streichen (S2)?** Mein Befund ist gestalterisch (größter Fremdblock, führt aus der Seite). Ob externe News für Wiederkehr trotzdem etwas leisten, entscheidest du. |
| **R-c** | **Ab welchem Fortschritt schrumpft die Checkliste (S1)?** Ich schlage 50 % vor – das ist geraten, nicht gemessen. |
| **R-d** | **Wichtig für die ganze Leitidee:** In den Aufnahmen vom 15.08. enthielt der Feed **ausschließlich** Wort-Beiträge – kein einziger Ereignis-Eintrag (`kind: "auto"`), obwohl die Schiene zeitgleich drei Transfers zeigte. Wenn Ereignis-Einträge im „Für dich"-Ranking faktisch nicht auftauchen, läuft mein Rang A ins Leere. **Bitte prüfen, ob das Dev-Daten sind oder eine Ranking-Eigenschaft.** |
| **R-e** | Wie viele Folge-Vorschläge sind sinnvoll (S4)? Ich sage 2–3 aus Formgründen. |

### An Nele (Text) – alle Beschriftungen sind Platzhalter

Ich habe **keine** Texte gesetzt. Als Platzhalter zu ersetzen:

- Register-Labels der Tafel: „NÄCHSTES SPIEL" · „LETZTES ERGEBNIS" · „DEINE SAISON"
- Schienen-Eyebrows: „SPIELE" · „TABELLE · DEINE LIGA" · „WECHSEL"
- **Die Beleg-Marke** – der wichtigste Text der Seite. „Bestätigt" /
  „Noch nicht bestätigt" / „Strittig" stammen aus dem Bestand
  (`matchVerification`). Ob das die stärksten Wörter für die Kernpositionierung
  sind, gehört dir. ⚠️ Grenze aus CLAUDE.md: vergleichende Aussagen
  („einzige Plattform, die…") gehen wegen § 6 UWG vorher an **Nora**.
- Der eine offene Checklisten-Schritt in Kurzform (S1)

### An Milo (Medien)

**Nichts.** Der Entwurf kommt ohne Foto und ohne Video aus – bewusst: Er baut auf
Typografie, Flächenstufen und vorhandene Vektorlogik. Der bekannte Foto-Engpass
(Milos Messung, `docs/HERO-ASSETS-2026-08-11.md`) wird damit gar nicht erst
berührt.

### Gates

Vor einer Freigabe wie üblich: **Kai** (Diff/Security) und **Tobias**
(Browser-Gate, mobil zuerst). Zusätzlich möchte ich den Stand nach dem Bau
**selbst** im Preview gegenprüfen (Playwright, 390/1280/1728) – der Entwurf ist
belegt, das Ergebnis noch nicht.

---

## 8. Technik, Grenzen, Risiken

### 8.1 Alles mit Bestand baubar

Keine neue npm-Abhängigkeit. Wiederverwendet: `SplitFlap`, `CountUp`, `Reveal`,
`staffel()`, `Card`, `Tabs`, `matchVerification`, `teamScores`, `Avatar`,
`CollapsibleWidget` (mobil), die `NOTIF_ICON`-/Token-Struktur.

### 8.2 Container Queries – Empfehlung mit Einschränkung

Der Sweep liefert dafür ein sauberes Argument (MDN): Eine Ergebnis-Karte, die
**ihren eigenen Container** misst statt des Viewports, funktioniert unverändert in
der Tafel, im Feed und in der Schiene. Das wäre die technisch richtige Antwort
auf „dieselbe Information in drei Breiten".

⚠️ **Aber:** Tailwind ist hier `3.4.1` **ohne Plugins**. Container-Query-Klassen
bräuchten `@tailwindcss/container-queries` – eine neue Abhängigkeit, und die
schließt die visuelle Richtung aus. **Weg stattdessen:** natives CSS in
`app/globals.css` unter `@layer utilities`. Dort steht bereits eigenes,
kommentiertes CSS (View Transitions, `rail-goal-flash`, `tour-step-in`) – das
ist die etablierte Stelle dafür.

Wenn das zu viel Handarbeit wird, ist der Verzicht unkritisch: Der Entwurf
funktioniert auch mit den zwei bestehenden Breakpoint-Zweigen. Container Queries
sind hier eine **Aufräum-Chance, keine Voraussetzung.**

### 8.3 Mobil

Gemessen (390 px): 16 Panels, Seitenhöhe 3311 px, **kein** horizontaler Überlauf,
keine Konsolenfehler. Die Akkordeon-Lösung über dem Feed ist in Ordnung und
**bleibt unangetastet** – der Entwurf betrifft den `isDesktop`-Zweig.

Die einzige Ausnahme ist die Tafel, weil sie den geteilten Seitenkopf ersetzt.
Ihre mobile Spezifikation steht in §3.3: zwei Register statt drei, `text-3xl`
statt `text-5xl`, damit sie **nicht höher** wird als der heutige
`SpieltagStrip`. Das ist beim Bau zu messen, nicht zu glauben.

### 8.4 Risiken, ehrlich

| Risiko | Einschätzung |
|---|---|
| **Rang A läuft leer** | Wenn Ereignis-Einträge im Feed faktisch nicht vorkommen (R-d), verliert der Entwurf sein stärkstes Mittel. **Vor dem Bau klären.** |
| Tafel wirkt leer bei neuen Nutzern | Ohne Team gibt es keinen Spieltag. Bestehende Regel greift: Die Leiste erscheint dann **gar nicht**. Für diesen Fall braucht der Seitenkopf einen Rückfall – das ist offen und gehört zu Linas Erstbesucher-Frage. |
| Zwei Ränge werden als Abwertung gelesen | Wer schreibt und dann eine Zeile statt eines Kastens bekommt, könnte sich zurückgesetzt fühlen. Deshalb Rang B **ruhiger, nicht kleiner** (§3.4). Am echten Bild zu prüfen, nicht theoretisch. |
| Schiene bleibt zu kurz | Wenn nach S2/S3/S4 zu wenig übrig ist, wirkt die Schiene dünn. Dann lieber **zwei** Register mit Substanz als vier dünne. |

### 8.5 Was ich nicht geprüft habe

- **Kein Blick auf die echte Prod-Fläche** (`hoops_prod`) – alle Aufnahmen aus
  der Dev-DB mit Demo-Daten. Wie sich die Seite mit echten, dünneren Beständen
  verhält, ist damit **nicht** belegt. Das ist bei S2/S4 relevant.
- **Kein Sport-Community-Vorbild gefunden**, das ich als IA-Referenz zeigen
  könnte – die Awwwards-Sportkategorie führt fast nur Marken-/Editorial-Seiten
  (F1, Ducati, Lacoste). Details in der Sweep-Notiz.
- **Die Beleg-Marke ist ungetestet.** Dass sie als Alleinstellung *gelesen* wird,
  ist meine Annahme; belegt ist nur, dass die Daten dafür vorliegen.

---

## 9. Selbsttest

*Würde ein gutes Designstudio das unterschreiben?*

Dafür spricht: Der Befund ist **gemessen**, nicht empfunden (18 Panels, 16
identische Radien, 504 px Checkliste, 1152 px bei 1728 px Fenster, null von fünf
Signatur-Mitteln). Die Leitidee kommt aus einem echten Fund – dass die Seite die
**falsche Branche** kopiert – und nicht aus einer Stimmung. Und sie ist mit
Bestand baubar, weil die Datenlage (`kind: "auto"`, `matchVerification`) längst
da ist; es fehlt nur die gestalterische Konsequenz.

Dagegen spricht, ehrlich: Der Entwurf steht und fällt mit R-d. Kommen
Ereignis-Einträge im Feed nicht vor, ist Rang A eine leere Geste, und dann ist
das hier ein halber Entwurf.

**Und der eine Punkt, an dem ich mir selbst widerspreche:** Ich habe am
12.08.2026 die Regel „2px-Marke an genau drei Stellen" aufgestellt und dann
zugesehen, wie `PlayerNav` eine vierte einführt – ohne die Regel nachzuziehen
oder zu widerrufen. Das gehört korrigiert (§4.1), egal wie dieser Entwurf
entschieden wird.

---

## 10. Kollegen einbezogen

- **Ronja (retention-analystin):** fünf benannte Anforderungen (§5, §7). Sie
  arbeitet laut Auftrag parallel an der Inhaltsfrage; ich habe bewusst **keinen**
  Inhalt gesetzt, wo er ihr gehört – insbesondere Register 3 der Tafel und die
  Streichung des `NewsWidget`.
- **Nele (marketing-manager):** alle Beschriftungen sind Platzhalter (§7).
  Kein Text von mir. Der Hinweis auf § 6 UWG → Nora ist mitgegeben.
- **Milo (medien-produzent):** bewusst **nicht** eingebunden – der Entwurf
  braucht kein Bild- und kein Videomaterial (§7).
- **Lina (onboarding-referentin):** ein Punkt fällt in ihr Feld – der
  Seitenkopf-Rückfall für Nutzer ohne Team (§8.4).
- **Kai / Tobias:** Gates wie üblich vor Freigabe, plus meine eigene
  Preview-Gegenprüfung nach dem Bau (§7).
- **Hanna (hr-koordinator):** Ergebnis dieses Auftrags gehört ins Roster.
