# Leistungskarte — Konzept

**Nele (marketing-manager) · 13.08.2026 · Branch `redesign`**

**Auftrag:** Aus dem Moment der beidseitigen Ergebnis-Bestätigung eine teilbare Karte machen —
Zahl plus Beleg, die der Spieler in die Vereinsgruppe, in eine Story oder in ein
Verein-Gespräch stellt. Urteil zur Tragfähigkeit, Karteninhalt und Wortlaut, Auslöser,
Rückweg mit Messvorschlag.

**Status: Konzept. Nichts gebaut, nichts committet, keine Datei außerhalb von `docs/` angefasst.**

**Pflichtlektüre gelesen:** `docs/RETENTION-BEFUND-2026-08-13.md` (Ronja),
`docs/ZIELGRUPPEN.md` (Z1–Z5), `docs/VISUELLE-RICHTUNG-2026-08-12.md` (Vivien),
`MARKE.md` (Tonalität, Verbotsliste, nennbare Substanz), `CLAUDE.md` Abschnitt 0.

**Kennzeichnung wie in `ZIELGRUPPEN.md`:** **[BELEGT]** — Code, Datei/Zeile oder externe Quelle
mit Datum. **[INDIZ]** — echter, aber schwacher Hinweis. **[HYPOTHESE]** — plausibel, unvalidiert.

---

## 0. Der Befund, der alles andere sortiert

Bevor irgendetwas gestaltet wird, muss ein Sachverhalt auf dem Tisch liegen, den der Auftrag
so nicht enthält — und der die Kernbotschaft der Karte verändert:

> **Doppelt bestätigt ist das Ergebnis. Nicht der Box-Score.**

**[BELEGT]** `app/api/team/match-stats/save/route.js` Zeilen 38–56: Die Spielerwerte werden von
**einem** Team-Admin gesetzt (`team: team._id`), und der Aufruf ersetzt ausschließlich die Einträge
**dieses** Teams. Es gibt keinen Gegen-Eintrag, keine Gegenprüfung, kein `submittedBy` pro Zeile.
Die Doppelbestätigung sitzt woanders: **[BELEGT]** `app/match/[id]/page.js` Zeilen 175–178 —
`resultStatus === "confirmed" && !!teamAResult.submittedBy && !!teamBResult.submittedBy`. Das
bezieht sich auf `teamXResult.ownPoints/opponentPoints`, also auf **den Endstand**.

**Was das bedeutet:** Eine Karte, auf der „24 Punkte“ und darunter „von beiden Teams bestätigt“
steht, behauptet etwas Falsches. Die 24 hat genau ein Team eingetragen — das eigene.

Das ist keine Spitzfindigkeit, sondern der Kern des Geschäfts. Die gesamte Positionierung lautet
„wie LinkedIn, nur nachweisbar“. Eine Karte, die den Beleg über die falsche Zahl legt, ist die
**einzige** Sorte Fehler, die dieses Produkt sich nicht leisten kann: Ein Verein, der einmal
nachprüft und merkt, dass die Einzelwerte einseitig sind, glaubt danach auch dem bestätigten
Endstand nicht mehr. Ronja beschreibt denselben Mechanismus in Abschnitt 3a für die
Sponsoren-Zahlen — „wer eine aufgeblasene Zahl entdeckt, glaubt anschließend auch der kleinen,
ehrlichen nicht mehr“.

Erfreulich: Der bereits gebaute Benachrichtigungstext macht es **schon richtig**.
**[BELEGT]** `lib/statsNotify.js` Zeile 92: „Bestätigt – beide Teams haben **das Ergebnis**
unabhängig gemeldet.“ Nicht „deine Zahlen“. Diese Präzision muss die Karte erben, und sie ist
zugleich die Vorlage für den Ton.

**Die Auflösung ist kein Rückzug, sondern die stärkere Karte** (ausgearbeitet in Abschnitt 2):
Die persönliche Zahl ist die **Figur**, das beidseitig bestätigte Ergebnis ist der **Sockel**,
auf dem sie steht. Und es kommt eine dritte, echte Beleg-Ebene dazu, die heute niemand druckt —
die Summenprobe (Abschnitt 2.3).

---

## 1. Trägt die Idee? — Urteil

**Kurzfassung: Ja, aber nicht als ein Stück, sondern als zwei — und nicht mit dem Spieler als
Hauptverteiler.**

Die Idee ist richtig, die unterstellte Verbreitungsmechanik ist es nicht. Wenn sie so gebaut wird,
wie sie formuliert ist („der Spieler stellt seine Zahl auf Instagram“), wird sie an der
Sozialdynamik einer Amateurmannschaft scheitern, nicht an der Gestaltung.

### 1.1 Perspektiv-Check: Max, 24, Bezirksliga, Sonntag 19:40 Uhr

Er bekommt die Glocken-Nachricht (die es seit heute gibt): „Deine Zahlen aus dem Spiel gegen
Munich Hoops stehen: 24 Punkte, 6 Rebounds, 3 Assists.“ Er tippt drauf. Er sieht die Karte.

**Was er tut:** Er schaut sie an. Er freut sich. Wahrscheinlich schickt er sie **einer** Person —
Freundin, bester Kumpel, Vater. **[HYPOTHESE]**

**Was er mit hoher Wahrscheinlichkeit *nicht* tut:** einen Feed-Post auf Instagram mit seinen
eigenen 24 Punkten. Der Instagram-Feed ist ein kuratierter Raum; ein Kreisliga-Spieler, der dort
seine eigene Punktzahl postet, wird von seiner Mannschaft aufgezogen. „Eigenlob stinkt“ ist im
deutschen Vereinssport keine Floskel, sondern eine belastbare Umgangsregel. **[HYPOTHESE, aber
mit sehr hoher Vorhersagekraft]**

**Was er sehr wohl tut, sobald jemand anders die Vorlage liefert:** eine **Story** teilen, in der
sein Name vorkommt — insbesondere eine Story, die **der Verein** gepostet hat. Repost ist sozial
etwas völlig anderes als Post: Er behauptet nichts über sich, er reicht weiter, was ihm zugefallen
ist. Genau so funktioniert die Instagram-Praxis deutscher Amateurvereine (Handball, Volleyball,
Fußball) heute schon: **Der Verein postet die Ergebnisgrafik, die Spieler reposten sie.**
**[INDIZ — beobachtbare Praxis, aber von mir nicht systematisch erhoben]**

**Und das, was heute real passiert und was die Idee eigentlich ablösen will:** In der
Team-WhatsApp-Gruppe kursiert nach dem Spiel der **Screenshot des Spielberichtsbogens**. Der
Bedarf ist also empirisch vorhanden — nur die Vorlage ist hässlich und stammt von TeamSL.
**[INDIZ]**

### 1.2 Der Perspektiv-Check, den niemand gern macht: der Spieler mit 2 Punkten

Ein Kader hat zwölf Leute. Zwei bis drei haben eine Zahl, die sich anzuschauen lohnt. Wenn das
System jeden Sonntag jemanden mit einer Zahl herausstellt, baut es innerhalb einer Mannschaft
eine Zweiklassen-Anzeige. Das ist nicht nur unfreundlich, es ist **geschäftsschädigend**: Die
Leute, die man verliert, sind die neun, die nicht auf der Karte stehen — und ausgerechnet die
sind die Masse der Zielgruppe Z1.

**Konsequenz für das Konzept:** Die wöchentliche, gleichbleibende, für alle identische Sache ist
die **Ergebniskarte des Teams** (jeder war dabei, keiner wird herausgehoben). Die persönliche
Leistungskarte ist ein **seltenes** Stück mit echtem Anlass. Die Auslöser-Liste in Abschnitt 3
ist genau danach gebaut.

### 1.3 Perspektiv-Check Z4: Der Abteilungsleiter sieht die Karte in einer WhatsApp-Gruppe

Er kennt den Namen nicht. Er braucht in drei Sekunden: **Welche Liga? Welche Saison? Und kann ich
das nachsehen?** Ohne die Liga ist „24 Punkte“ bedeutungslos — 24 in der 1. Kreisliga und 24 in
der Regionalliga sind zwei verschiedene Aussagen. Deshalb steht die Liga-Zeile auf der Karte
**oben**, nicht im Kleingedruckten, und deshalb ist die abgedruckte URL kein Deko-Element,
sondern der eigentliche Zweck der Karte für diese Zielgruppe.

Gute Nachricht dafür: **[BELEGT]** `/player/view-player/[slug]` und
`app/api/player/fetchsingleplayerinfo/route.js` haben **keinen** Auth-Check — der Verein kann
ohne Konto nachsehen. Das ist die Voraussetzung dafür, dass die Karte als Beleg überhaupt
funktioniert, und sie ist erfüllt.

### 1.4 Der harte Einwand: eine Karte ist ein Multiplikator, und die Basis ist heute null

**[BELEGT]** 9 externe Nutzer, 1 externes Team (`CLAUDE.md`, `docs/CHRONIK.md`, 12.08.2026).
**Ein Team allein kann kein bestätigtes Spiel erzeugen** — die Doppelbestätigung setzt zwei
meldende Vereine voraus. Es gibt heute also faktisch **keine** echte Karte, die erzeugt werden
könnte. Alles, was heute erzeugbar wäre, käme aus Demo-Daten (68 von 70 Teams tragen `isDemo`,
Ronja Abschnitt 3a).

Daraus folgt zweierlei, und beides gehört in die Priorisierungs-Entscheidung:

1. **Harte Sperre, nicht verhandelbar:** Für Spiele, an denen ein `isDemo`-Team beteiligt ist,
   wird **keine** Karte erzeugt — weder Bild noch Link noch Teilen-Angebot. Eine Karte mit
   „Aachen Aces 78:65“, die in einer echten WhatsApp-Gruppe landet, ist eine erfundene Tatsache,
   die unser Haus verlassen hat. Das ist die Sorte Fehler, die man nicht zurückholt.
2. **Die Karte ist kein Wachstums-Werkzeug für den aktuellen Stand.** Sie multipliziert echte
   bestätigte Spiele. Solange es keine gibt, multipliziert sie null. Was die Basis erzeugt, ist
   Johnnys Hallen-Verteilung (Z1) und echte Kreisliga-Daten — nicht die Karte.

**Warum ich trotzdem klar dafür bin, sie jetzt zu konzipieren und zu bauen:** Der Aufwand liegt
fast vollständig in Gestaltung und Erzeugung, nicht in Daten. Und der Moment, auf den sie wartet,
ist terminiert: Johnny verteilt bis ~05.09. Wenn im September die ersten zwei echten Vereine
gegeneinander spielen und das Ergebnis beidseitig bestätigen, ist das der wertvollste einzelne
Datenpunkt der Projektgeschichte. Diesen Moment ohne Karte verstreichen zu lassen, wäre die
teurere Entscheidung. **Auslöser D in Abschnitt 3 macht die dünne Datenlage sogar zum Inhalt:**
„Dein erstes bestätigtes Spiel“ ist mit einem Team im Bestand *ehrlicher* als mit tausend.

### 1.5 Das Urteil in einem Satz

**Die Idee trägt — als Zwei-Karten-System: die Ergebniskarte des Teams ist der Kanal, die
Leistungskarte des Spielers ist das Beweisstück.** Der Wachstumskreislauf läuft über die
Teamkarte (sozial unbedenklich, wöchentlich, vom Verein gepostet, vom Spieler repostet), die
Positionierung „nur nachweisbar“ läuft über die Spielerkarte (selten, aufbewahrenswert, ins
Verein-Gespräch geschickt). Wer beides in ein Stück presst, bekommt ein Stück, das keine der
beiden Aufgaben gut erfüllt.

**Was dagegen spricht (Gegenposition, ehrlich):** Zwei Kartentypen sind mehr Bau- und
Pflegeaufwand, und die Teamkarte zahlt auf keine der Kennzahlen ein, die Ronja als
Wiederaufrufgrund für Z1 identifiziert hat — sie zahlt auf Reichweite ein. Wer nur eine bauen
will, baut die **Spielerkarte**: Sie ist die, die die Positionierung trägt. Die Teamkarte ist die,
die Reichweite bringt. Meine Empfehlung ist beides, meine Reihenfolge ist Spielerkarte zuerst.

---

## 2. Karteninhalt und Wortlaut

### 2.1 Die eine Zahl

**Punkte.** Begründung, nicht Geschmack:

- **[BELEGT]** `models/Match.js` `playerStatSchema` und `components/team/tabs/ErgebnisseTab.js`
  kennen genau vier Felder: `points`, `assists`, `rebounds`, `didNotPlay`. Keine Minuten, keine
  Würfe, keine Dreier, keine Blocks, keine Steals, keine Fouls. Die Auswahl ist also klein — und
  Punkte sind darin die einzige Größe, die ohne Kontext verstanden wird. „6 Rebounds“ ordnet ein
  Vereinsmensch ein, ein WhatsApp-Publikum nicht.
- Punkte sind die Zahl, die sich zum Ergebnis addieren lässt — das ist die Voraussetzung für die
  Summenprobe (2.3), die stärkste Beleg-Ebene, die wir haben.

**Rebounds und Assists stehen mit auf der Karte, aber klein und einzeilig**, und nur, wenn sie
> 0 sind (dieselbe Regel wie `statLine()` in `lib/statsNotify.js` Zeilen 39–45 — eine 0-Zeile
heißt dort ausdrücklich „noch nicht eingetragen“, nicht „hat nichts gemacht“; diese
Unterscheidung darf die Karte nicht kaputtmachen).

### 2.2 Der Beleg in drei Wörtern

**Empfehlung: Wir erfinden keine neue Formel. Es bleibt bei den vier Wörtern, die im Produkt
schon stehen — „Von beiden Teams bestätigt“.** **[BELEGT]** Exakt dieser Wortlaut steht auf
`app/match/[id]/page.js` Zeile 256, sinngleich in der Landing-Szene 3, in „So funktioniert's“, im
Karriere-Panel, auf `/topscorer` und auf `/ligen/[id]` (Ronja, Abschnitt 2). Eine fünfte Variante
schwächt alle vier vorhandenen. Wiederholung ist hier die Marke; drei Wörter sind es nicht wert,
dafür die Konsistenz aufzugeben.

**Eine Abweichung, mit Grund:** Auf der Karte lautet die Zeile
**`ERGEBNIS VON BEIDEN TEAMS BESTÄTIGT`** — mit dem Wort „Ergebnis“ davor. Auf der Spielseite
steht das Abzeichen *neben* dem Endstand, der Bezug ist räumlich eindeutig. Die Karte reist ohne
diesen Kontext und trägt eine große persönliche Zahl. Ohne das Wort „Ergebnis“ wandert der Beleg
optisch auf die 24 — und dann ist er falsch (Abschnitt 0). Ein Wort mehr, dafür eine wahre Aussage.

**Damit es nicht wie ein Wasserzeichen wirkt** (ausdrücklicher Punkt aus dem Auftrag): Der Beleg
darf nicht als graue Kleinschrift am unteren Rand stehen. Er sitzt direkt unter dem Endstand, auf
der **2px-`brand-500`-Anzeigetafel-Leiste** aus der Design-Sprache — also als Statusleiste der
Anzeigetafel, nicht als Fußnote. Die Leiste ist im Designsystem für genau drei Stellen reserviert
(`docs/VISUELLE-RICHTUNG-2026-08-12.md` 2.3); auf der Karte ist sie die eine hervorgehobene
Stelle. Das ist der Unterschied zwischen einem Siegel und einem Rechtshinweis.

### 2.3 Die dritte Beleg-Ebene: die Summenprobe

Das ist der Teil, der die Karte von jedem Screenshot der Welt unterscheidet — und er kostet
nichts außer einer Addition.

Wenn die Summe der eingetragenen Spielerpunkte eines Teams **exakt** dem beidseitig bestätigten
Endstand dieses Teams entspricht, dann ist der Box-Score **arithmetisch schlüssig mit einer Zahl,
die zwei unabhängige Parteien gemeldet haben**. Das ist genau die Prüfung, die ein
Abteilungsleiter von Hand machen würde. Sie ist rechenbar aus vorhandenen Feldern
(`playerStats[].points` gefiltert auf `team`, gegen `teamXResult.ownPoints`).

Kartenzeile, nur wenn sie zutrifft:

> `SUMME DER SPIELERWERTE = 78 · PASST ZUM ERGEBNIS`

**Regel: positiv oder gar nichts.** Stimmt die Summe nicht (weil der Admin nicht alle Spieler
eingetragen hat — der Normalfall zu Beginn), erscheint **keine** Zeile. Niemals ein rotes
„stimmt nicht“ auf einer Karte, die jemand teilen soll. Und niemals ein Vorwurf an den
Team-Admin, der ohnehin gegen Doppelerfassung kämpft (Z2, Ausschlusskriterium).

Nebeneffekt, der es wert ist, benannt zu werden: Diese Zeile ist ein **Anreiz zur
Datenvollständigkeit ohne Druck**. Der Admin, der einmal sieht, dass die Karten seines Teams
diese Zeile tragen, wenn er alle zwölf einträgt, trägt beim nächsten Mal alle zwölf ein. Das ist
Ronjas „sichtbar belohnen“ statt „kürzer machen“, in einer Zeile.

### 2.4 Karte A — Leistungskarte Spieler (Standard, Anlass „Spiel bestätigt“)

Wortlaut druckreif. Versalien bedeuten: Versalsatz auf der Karte, nicht Betonung.

```
1. KREISLIGA NIERS · 2025/26 · SA 12.10.2025          ← Mono, mist-400

              24                                       ← Big Shoulders 900, paper-50
              PUNKTE                                   ← Big Shoulders 700, brand-500
              6 REBOUNDS · 3 ASSISTS                   ← Mono, mist-300 (nur was > 0)

MAX MUSTERMANN                                         ← Big Shoulders 800, paper-50
TEST BASKETS · GUARD                                   ← Mono, mist-400

──────────────────────────────────────────  2px brand-500

TEST BASKETS  78 : 65  MUNICH HOOPS                    ← Mono, paper-50
ERGEBNIS VON BEIDEN TEAMS BESTÄTIGT                    ← Mono, brand-500
SUMME DER SPIELERWERTE = 78 · PASST ZUM ERGEBNIS       ← Mono, mist-300 (bedingt)

[Bildmarke]              HOOPSGERMANY.DE/P/MAX-MUSTERMANN   ← Mono, mist-400
```

**Was ausdrücklich NICHT drauf steht** — jede Zeile eine bewusste Streichung:

| Weggelassen | Warum |
|---|---|
| Sponsorenlogo | Auftragsgrenze. Zusätzlich: Der Spieler müsste den Repost als Werbung kennzeichnen — Frage an Nora, Abschnitt 6. |
| Profilfoto | Ein Bild einer Person, das die Plattform erzeugt und in Umlauf bringt, ist eine eigene Rechtsfrage. Ohne Foto ist die Karte typografisch ohnehin stärker. |
| Platzierung / „Topscorer der Liga“ | Bei 3 bespielten Ligen (**[BELEGT]** `ZIELGRUPPEN.md`, 12.08.2026) ist jede Rangaussage eine Aussage über fast leere Tabellen. Kommt frühestens, wenn eine Liga eine tragfähige Zahl bestätigter Spiele hat. |
| „Testphase“-Hinweis | Auf einem Flyer richtig (Skepsis vorwegnehmen), auf einer Leistungskarte falsch: Sie ist ein Beleg über ein Spiel, kein Produktversprechen. |
| Nutzer-/Vereinszahlen | Wären heute schlicht falsch (Ronja 3a). |
| Emoji, Ball-Clipart, Deko | `MARKE.md` §5 Verbotsliste. |
| Name eines gegnerischen **Spielers** | Die Karte nennt nur ihr eigenes Subjekt. Der gegnerische **Verein** und der Spielstand sind Tatsachen und dürfen drauf. |

### 2.5 Karte B — Ergebniskarte Team (der eigentliche Verteilungs-Kanal)

```
1. KREISLIGA NIERS · 2025/26 · SA 12.10.2025

TEST BASKETS            78
MUNICH HOOPS            65

──────────────────────────────────────────  2px brand-500
ERGEBNIS VON BEIDEN TEAMS BESTÄTIGT

MEISTE PUNKTE: M. MUSTERMANN (24)                      ← eine Zeile, wählbar

[Bildmarke]              HOOPSGERMANY.DE/T/TEST-BASKETS
```

Die hervorgehobene Zeile ist die **Repost-Angel** — sie nennt jemanden, und der teilt weiter.
**Ehrlich benanntes Risiko:** In einer Mannschaft mit einem dominanten Scorer steht dort jede
Woche derselbe Name (siehe 1.2). **Gegenmittel ohne erfundene Daten:** Der Team-Admin wählt beim
Erzeugen mit einem Tipp zwischen vier Zeilen, alle aus vorhandenen Feldern — *Meiste Punkte* /
*Meiste Rebounds* / *Meiste Assists* / *keine Zeile*. Das gibt ihm Gestaltungsraum, ohne dass
irgendetwas erfunden wird.

### 2.6 Karte C — Saisonkarte Spieler

Das ist die Karte, die ein Verein wirklich lesen will, und die einzige, die man aufhebt.

```
SAISON 2025/26 · 1. KREISLIGA NIERS

14,2  PUNKTE PRO SPIEL
18 SPIELE · 256 PUNKTE · 4,1 REB · 2,3 AST

MAX MUSTERMANN · TEST BASKETS · GUARD

──────────────────────────────────────────  2px brand-500
16 VON 18 SPIELEN VON BEIDEN TEAMS BESTÄTIGT

[Bildmarke]              HOOPSGERMANY.DE/P/MAX-MUSTERMANN
```

Die Zeile **„16 von 18 Spielen von beiden Teams bestätigt“** ist die stärkste einzelne Aussage
in diesem gesamten Konzept. Sie druckt eine **Qualitätsquote der eigenen Daten** — etwas, das
keine Vergleichsplattform tut, weil keine sie hat. Sie ist unangreifbar, weil sie den Rest offen
zugibt. Und sie kostet nichts: **[BELEGT]** `app/api/player/careerstats/route.js` aggregiert
bereits `games`, `points`, `assists`, `rebounds` sowie `ppg`/`apg`/`rpg`; die Quote ist ein
zusätzliches `$sum` über `resultStatus`.

Stehen alle Spiele bestätigt, lautet die Zeile `ALLE 18 SPIELE VON BEIDEN TEAMS BESTÄTIGT`.

### 2.7 Die Begleit-Texte (Glocke, Kartenseite, Knöpfe)

**Die bestehende Benachrichtigung bleibt wortgleich** (`lib/statsNotify.js` Zeilen 91–97) — sie
ist präzise und tonrichtig. Ergänzt wird nur ein Ziel: der Weg zur Karte.

Bei einem echten Anlass (Abschnitt 3) tritt eine zweite Fassung an ihre Stelle:

> **Bestwert.** 24 Punkte gegen Munich Hoops — dein höchster Wert bisher.
> Bestätigt: beide Teams haben das Ergebnis unabhängig gemeldet.

> **Dein erstes bestätigtes Spiel.** 12 Punkte gegen Munich Hoops.
> Ab jetzt steht das auf deinem Profil — nachprüfbar, nicht behauptet.

Knopf-Beschriftungen auf der Kartenseite: **`Bild speichern`** · **`Link kopieren`** ·
**`Teilen`** (letzterer nur, wo `navigator.share` vorhanden ist).

**Verboten in jeder dieser Flächen:** „Jetzt teilen!“, „Zeig es allen“, „Verpasse nicht…“,
Ausrufezeichen, Countdown, jede Formulierung, die das Nicht-Teilen zu einem Versäumnis macht.
Die Karte wird **angeboten**, nie eingefordert. (Ronjas Nicht-bauen-Liste, sinngemäß auf diesen
Fall angewandt.)

**Alternativtext des Bildes** — Pflicht, weil die Karte ein Bild ist und im Produkt auch als
solches auftaucht:

> „Leistungskarte von Hoops Germany: Max Mustermann, Test Baskets, 24 Punkte im Spiel gegen
> Munich Hoops am 12.10.2025. Endstand 78:65, von beiden Teams bestätigt.“

---

## 3. Auslöser — und die Nicht-Auslöser

**Die entscheidende Unterscheidung, ohne die die Liste nicht funktioniert:**
**Verfügbarkeit ist nicht Anlass.** Zu **jedem** bestätigten Spiel mit eigenen Werten existiert
eine Karte, abrufbar über die Spielseite und das eigene Profil. Aber nur bei den Anlässen unten
wird sie **aktiv angeboten**. Damit ist die Sorge aus dem Auftrag („zu viele Karten entwerten
jede einzelne“) gelöst, ohne dem Spieler etwas vorzuenthalten, das über ihn selbst existiert.

### 3.1 Anlässe, die ein aktives Angebot verdienen

| # | Anlass | Kartentyp | Häufigkeit | Warum er es wert ist |
|---|---|---|---|---|
| **A** | **Erstes bestätigtes Spiel** — je Spieler genau einmal, für immer | A | 1× pro Leben | Der Moment, in dem das Versprechen der Registrierung eingelöst wird. Und der einzige Anlass, der bei dünner Datenlage **ehrlicher** wird, nicht schwächer. |
| **B** | **Persönlicher Bestwert in Punkten** — ab dem **3.** erfassten Spiel | A | selten, sinkende Frequenz | Ein echter, aus Daten berechneter Höchstwert. Die Sperre bis Spiel 3 verhindert, dass Spiel 1 automatisch ein „Bestwert“ ist — das wäre ein erfundener Meilenstein. **[BELEGT]** Ein Bestwert-Begriff existiert im Code heute nicht (Grep nach `Bestwert\|career.?high` = 0 Treffer); es braucht ein `$max` in der Aggregation. |
| **C** | **Runde Karrieremarke** an bestätigten Punkten: 100 · 250 · 500 · 1.000 | A (Variante) | sehr selten | Wächst natürlich mit dem Produkt mit, ist nicht manipulierbar, und die 100 kommt für einen Kreisliga-Spieler nach etwa einer halben Saison — also erreichbar, ohne wertlos zu sein. |
| **D** | **Saisonabschluss** — je Spieler und Saison genau einmal | C | 1× pro Jahr | Die Karte, die man aufhebt und die man einem Verein schickt. Trägt die Bestätigungsquote (2.6). Passt zum vorhandenen `rollover-season`-Rhythmus. |
| **E** | **Bestätigter Sieg** — Angebot an den Team-Admin, nicht an die Spieler | B | wöchentlich | Der Verteilungs-Kanal aus 1.5. Sozial unbedenklich, weil kollektiv. **Nur an den Admin, nur bei Sieg** — siehe 3.2. |

### 3.2 Ausdrückliche Nicht-Auslöser

| Kein Auslöser | Warum nicht |
|---|---|
| **Jedes bestätigte Spiel, an alle Spieler** | Ein wöchentliches Teilen-Angebot ist die klassische Entwertung. Der Spieler bekommt weiterhin seine Nachricht (die gibt es seit heute) — aber kein Angebot, sie zu verbreiten. |
| **Niederlage mit guten eigenen Zahlen** | Die Karte existiert, wird aber **nicht** angeboten. Einen Spieler zu ermuntern, nach einer Niederlage seine 22 Punkte zu verbreiten, stellt ihn gegen seine eigene Mannschaft. Der schlechteste denkbare Erstkontakt mit Z2. |
| **Ergebniskarte bei Niederlage** | Wird nicht angeboten. Erzeugbar bleibt sie — manche Vereine posten ihre Ergebnisse grundsätzlich, das ist ihre Entscheidung, nicht unsere Aufforderung. |
| **Bestwert in Rebounds oder Assists** | Bei drei erfassten Größen hätte fast jeder fast jede Woche irgendeinen „Bestwert“. Das ist die Entwertung durch die Hintertür. Punkte allein. |
| **0-Punkte-, Leerzeilen- und DNP-Spiele** | Gleiche Regel wie `lib/statsNotify.js` Zeilen 65–73: Summe ≤ 0 oder `didNotPlay` → nichts. |
| **Spiele mit `isDemo`-Beteiligung** | Harte Sperre, siehe 1.4. Eine Karte über ein erfundenes Spiel darf das Haus nicht verlassen. |
| **`resultStatus: "mismatch"`** | Gleiche Regel wie die Benachrichtigung (Zeile 59). Strittige Zahlen sind kein Erfolgserlebnis. Nach Auflösung greift der Anlass nach. |
| **Rang-/Vergleichsaussagen** („Platz 2 der Liga“, „bester Scorer des Spieltags“) | Bei 3 bespielten Ligen eine Aussage über fast leere Tabellen. Und vergleichende Werbeaussagen gehen ohnehin über Nora (§6 UWG, `ZIELGRUPPEN.md` Z5). |
| **Automatische Veröffentlichung im eigenen Newsfeed** | `lib/autoPost.js` erzeugt bereits Ergebnis-Beiträge — das ist ein Team-Ereignis und in Ordnung. Eine **persönliche** Karte automatisch im Namen des Spielers zu posten, wäre Angeberei per Voreinstellung. Veröffentlicht wird nur, was der Spieler selbst auslöst. |
| **Jubiläen ohne Substanz** („1 Jahr dabei“, „10. Login“, Serien/Streaks) | Ronjas Nicht-bauen-Liste, Zeile 1. Rückkehr durch Verlustangst, ohne Gegenwert. |

---

## 4. Der Rückweg auf die Seite — und wie man ihn misst

### 4.1 Empfehlung: eine lesbare Kurz-URL. Kein QR-Code.

**Auf der Karte steht `hoopsgermany.de/p/max-mustermann`** — ein neuer, kurzer öffentlicher
Alias, der auf die vorhandene Seite `/player/view-player/[slug]` weiterleitet
(Team-Pendant: `/t/<slug>`).

Begründung, gegen die naheliegende QR-Lösung:

1. **Ein QR auf einer Story ist unbenutzbar.** Der Betrachter hält das Gerät, auf dem der Code
   angezeigt wird. Er bräuchte ein zweites Telefon. Der Standardfall der Karte ist ein Bildschirm,
   nicht Papier.
2. **Ein QR sieht aus wie ein Flyer, nicht wie ein Beweisstück.** Er belegt auf 1080 × 1080 eine
   erhebliche Fläche und zieht die Karte optisch zurück in die Werbe-Ecke — genau weg von dem
   Charakter, der sie teilbar macht.
3. **Der Screenshot-Fall entscheidet.** Ein erheblicher Teil der Weitergabe wird **nicht** über
   den Teilen-Knopf laufen, sondern über einen Screenshot (Ronja würde sagen: unvermeidlich, und
   sie hätte recht). Was einen Screenshot überlebt, ist **abgedruckter Text**. Deshalb ist die
   lesbare URL nicht nur Deko, sondern der einzige Rückweg, der in jedem Fall funktioniert — und
   deshalb muss der Slug menschlich tippbar sein. **[BELEGT]** Ist er:
   `lib/slug.js` erzeugt aus Vor-/Nachname eine umlautfreie Kleinschreibung (ä→ae, ß→ss).

**Eine Ausnahme, bei der der QR seinen Platz verdient:** die **Saisonkarte im Druckformat** —
das ist die einzige Karte, die in einem Vereinsheim an einer Wand landen kann. Dort trägt sie
`?src=lk-saison-print`.

### 4.2 Was gebaut werden muss, damit der Rückweg messbar ist

**[BELEGT]** Der `?src=`-Mechanismus ist produktiv und sauber gebaut, hat aber **eine Lücke,
die genau diesen Anwendungsfall bricht:**

- `app/signup/page.js` Zeilen 41–46 liest `src` aus den Suchparametern — **nur auf `/signup`** —
  und legt ihn in `sessionStorage` unter `signupSource` ab (überlebt danach den Wechsel
  Login ↔ Signup, Zeile 65).
- `app/api/player/playerregister/route.js` Zeile 14 validiert serverseitig gegen
  `^[a-z0-9-_]{1,40}$`, speichert bei Treffer `Player.signupSource` (Zeile 55) und legt ein
  `signup_src`-Ereignis an (Zeilen 62–70).

**Die Lücke:** Die Karte führt **nicht** auf `/signup`, sondern auf ein Profil. Wer dort landet
und sich erst danach registriert, kommt ohne Quelle an — der Parameter ist beim ersten Klick
verloren.

**Erforderliche Änderung (klein, Ben):** Den `src`-Parameter **auf jeder Route** aufnehmen — der
naheliegende Ort ist `components/AnalyticsTracker.js`, der ohnehin bei jedem Routenwechsel läuft —
und in denselben `sessionStorage`-Schlüssel schreiben, den `/signup` bereits liest (nur setzen,
wenn noch keiner gesetzt ist: Erstkontakt gewinnt). Damit funktioniert schlagartig auch jeder
künftige Flyer-QR, der irgendwo anders hinführt als auf `/signup`.

### 4.3 Quellwerte (gültig unter der bestehenden Regex, geprüft)

| Wert | Wofür |
|---|---|
| `lk-spiel` | Leistungskarte zu einem einzelnen Spiel |
| `lk-bestwert` | Bestwert-Karte |
| `lk-marke` | Karrieremarke 100/250/500/1000 |
| `lk-saison` | Saisonkarte (digital) |
| `lk-saison-print` | Saisonkarte, gedruckt, mit QR |
| `lk-erstes` | erstes bestätigtes Spiel |
| `tk-ergebnis` | Ergebniskarte des Teams |

Getrennte Werte je Anlass, nicht ein Sammelwert — sonst lernt man nichts darüber, **welcher
Anlass tatsächlich reist**. Das ist die eigentliche Erkenntnis, die aus dieser Messung zu holen
ist. Die bestehenden Print-Werte (`flyer`, `karte`) bleiben unberührt.

### 4.4 Zu erhebende Ereignisse

Ergänzend zu den heute existierenden fünf Ereignisarten (Ronja 3c):

| Ereignis | Wann | `meta` |
|---|---|---|
| `card_offered` | serverseitig, wenn ein Anlass eine Karte anbietet | Anlass (`bestwert`, `erstes`, …) |
| `card_opened` | Kartenseite geöffnet | Anlass |
| `card_saved` | „Bild speichern“ ausgelöst | Anlass |
| `card_link_copied` | „Link kopieren“ ausgelöst | Anlass |
| `card_shared` | **nur**, wenn `navigator.share` tatsächlich erfolgreich zurückkehrt | Anlass |

**Ausdrücklich nicht:** aus einem Klick auf „Teilen“ auf einen erfolgten Teilvorgang schließen.
Das wäre eine geschönte Zahl der Sorte, vor der Ronja in Abschnitt 3a warnt — und sie fliegt in
einem Sponsorengespräch bei der ersten Nachfrage auf.

### 4.5 Die eine Zahl, die Patrick einem Sponsor nennen kann

> **„X Registrierungen kamen über geteilte Leistungskarten.“**
> Herkunft: `Player.signupSource` mit Präfix `lk-`/`tk-`. Nicht geschätzt, nicht hochgerechnet,
> je Registrierung einzeln nachweisbar.

Zwischenkennzahlen für die interne Steuerung (nicht für den Report): angebotene Karten,
geöffnete Karten, gespeicherte/geteilte Karten, Profilaufrufe mit `lk-`-Quelle.

**Ehrlichkeitsgrenzen, die mitgesagt gehören, wenn diese Zahl genannt wird:**

- **Der Screenshot-Weg ist unsichtbar.** Wer die Karte abfotografiert und in eine WhatsApp-Gruppe
  stellt, erzeugt Reichweite, die in keiner Zahl auftaucht. Die gemessene Zahl ist damit
  systematisch eine **Untergrenze** — was in einem Sponsorengespräch besser ist als das Gegenteil,
  aber gesagt werden muss.
- **WhatsApp und Instagram übertragen keinen Referrer.** Es zählt ausschließlich der Parameter im
  Link. Wer die URL abtippt, kommt ohne Quelle an.
- **Bei 9 externen Nutzern sind das Zählungen, keine Quoten.** Prozentangaben zu Karten wären
  aktuell Unsinn.
- **Ohne die Änderung aus 4.2 misst diese Kennzahl gar nichts.** Sie ist Voraussetzung, nicht Kür.

### 4.6 Auf welchen Meilenstein das einzahlt

Trichter aus meinem Auftrag: mehr Tester → aktive Community → Sponsoren → Einnahmen.

- **Karte B (Team)** zahlt auf **Stufe 1** ein: Reichweite in Hallen und WhatsApp-Gruppen, die
  Johnnys persönliche Verteilung fortsetzt, ohne dass er dabei sein muss.
- **Karte A (Spieler)** zahlt auf **Stufe 2** ein: Wiederaufrufgrund und Kontaktpunkt — die
  Einlösung von Ronjas R1 als erlebbares Ereignis statt als Regel im Text.
- **Karte C (Saison)** zahlt auf **Stufe 3** ein: Sie ist der Beleg, den ein Verein bekommt, und
  damit das erste Stück, das die Positionierung „nur nachweisbar“ außerhalb der Seite trägt.
- **Was sie ausdrücklich nicht leistet:** Sie erzeugt keine bestätigten Spiele. Der Engpass
  bleibt die Zahl echter Vereine (1.4).

---

## 5. Was Vivien für den Entwurf noch entscheiden muss

Übergabe an Vivien (design-spezialistin). Ich liefere Botschaft, Wortlaut, Hierarchie und
CI-Bindung — das Finish ist ihres. Offene Punkte, die ich bewusst nicht vorwegnehme:

1. **Die eine typografische Idee.** Mein Vorschlag als Ausgangspunkt: *Die Karte ist ein
   herausgeschnittenes Stück der Anzeigetafel* — nicht ein Bild mit einer Zahl darauf. Das würde
   heißen: randlose Navy-Fläche, Zahl oben schwer, Mono-Sockel unten, genau **eine**
   2px-`brand-500`-Leiste. Ob das die stärkste Idee ist, entscheidet sie.
2. **Formate.** Vorschlag: `1080 × 1920` (Story, Hauptfall), `1080 × 1080` (WhatsApp/Feed),
   `1200 × 630` (Link-Vorschau). Welches der Master ist und ob die anderen Ableitungen oder
   eigene Entwürfe sind — ihre Entscheidung. Für die Saisonkarte zusätzlich A6 im Druckmaß nach
   `MARKE.md` §6 (105 × 148 mm + 3 mm Beschnitt), falls sie den Druckfall mitnimmt.
3. **Kantenverhalten auf Instagram.** Eine randlose Navy-Karte schwimmt auf einem dunklen
   Story-Hintergrund ohne sichtbare Begrenzung. Entweder eine definierte Kante oder eine
   `brand-500`-Trägerfläche unter der Navy-Karte — das ist eine echte Gestaltungsentscheidung,
   keine Kleinigkeit.
4. **Erzeugungsweg und dessen Folgen für die Schrift.** **[BELEGT]** Es gibt heute im Projekt
   **keinerlei** Bilderzeugung: Grep nach `satori`, `sharp`, `@vercel/og`, `og:image`,
   `navigator.share` → null Treffer. Das ist Neuland, und der gewählte Weg (Canvas im Browser
   vs. serverseitig) bestimmt, wie Big Shoulders Display und Geist Mono eingebettet werden. Aus
   `MARKE.md` §2 gilt die harte Lehre: **feste `font-weight`-Schnitte, keine Variable-Font-Spanne**
   — Chromium hat die Spanne beim PDF-Export lautlos nicht eingebettet. Wenn die Karte über einen
   Chromium-Pfad gerendert wird, gilt dieselbe Falle.
5. **Extremfälle, die den Entwurf brechen können** — bitte am Entwurf durchspielen:
   - dreistellige Punktzahl auf der Teamkarte (`112 : 108`)
   - einstellige persönliche Zahl (`4 PUNKTE`) — die Karte muss auch dann würdig aussehen
   - langer Vereinsname: `SG Sechtem/Bornheim/Alfter II`
   - langer Liganame: `1. Regionalliga West Herren · Gruppe A`
   - Team ohne Logo (**[BELEGT]** `components/Avatar.js` erzeugt Initialen mit deterministischer
     Namensfarbe — die Fallback-Logik ist da, muss aber auf der Karte anders sitzen als in einer
     Liste)
   - Spieler ohne Position
6. **Wie sich die Beleg-Zeile von einem Wasserzeichen unterscheidet.** Anforderung von mir:
   Sie muss wie eine Statusanzeige aussehen, nicht wie eine Fußnote — die Umsetzung ist ihre.
7. **Ob es einen sichtbaren Unterschied zwischen den Anlässen gibt** (Bestwert, Saison, erstes
   Spiel) oder ob nur die Kopfzeile wechselt. Meine Neigung: **nur die Kopfzeile** — ein
   Kartensystem, kein Karten-Zoo. Aber das ist eine Gestaltungsfrage.
8. **Vorschlag von mir, nicht Auftrag:** Sie könnte vorher die Skill `design-trend-recherche`
   laufen lassen. Zielgruppe für deren Schritt 1 liefere ich hiermit: **Z1 — aktive
   Amateur-Basketballer in NRW, 18–30, Kreisliga bis Regionalliga**, Referenzsituation ist der
   Story-Repost am Sonntagabend, nicht die Halle.

**Nach ihrem Finish gehört das Stück zurück zu mir** für den Zielgruppen-Check am fertigen
Entwurf — so ist die Zusammenarbeit definiert, und dieser Bericht ersetzt ihn nicht.

---

## 6. Offene Rechtsfragen für Nora (recht-vorpruefung)

Ich habe nichts davon entschieden. Alle Punkte sind Fragen, keine Bewertungen.

1. **Jugendliche. Der gewichtigste Punkt.** Der Liga-Katalog enthält Jugendligen (U18/U16 m/w,
   `CLAUDE.md` Abschnitt 0), und **[BELEGT]** `app/api/player/fetchsingleplayerinfo/route.js`
   gibt `age` und `birthdate` als öffentliche Felder aus. Eine Karte mit Klarnamen, Verein,
   Liga und Leistungsdaten einer minderjährigen Person, die zum Teilen erzeugt wird, ist eine
   eigene Kategorie. **Frage an Nora:** Welche Einwilligung braucht es, und reicht die des
   Nutzers selbst? **Mein Vorschlag bis zur Klärung: Karten für Jugendligen komplett gesperrt** —
   nicht nur „kein Angebot“, sondern gar nicht erzeugbar.
2. **Gegnerdaten auf der Karte.** Vereinsname und Spielstand des Gegners stehen drauf. Aus meiner
   Sicht Tatsachen aus einem öffentlichen Wettbewerb — aber die Karte wird von uns erzeugt und
   trägt unser Logo. **Frage:** Verändert das die Bewertung?
3. **Sponsorenlogo auf der Karte.** Wie beauftragt **nicht** gesetzt. Die Frage, die ich
   weitergebe: Wenn ein Spieler eine Karte mit Sponsorenlogo repostet, müsste **er** den Beitrag
   als Werbung kennzeichnen (Trennungsgebot / Kennzeichnungspflicht in sozialen Medien)? Wenn ja,
   ist das nicht nur ein rechtliches, sondern ein Produktproblem — wir würden dem Nutzer eine
   Pflicht anhängen, die er nicht bestellt hat. **Meine Neigung: dauerhaft kein Sponsorenlogo auf
   Leistungskarten**, Werbeflächen bleiben auf der Seite.
4. **Der Beleg-Satz als Werbeaussage.** „Von beiden Teams bestätigt“ ist eine Tatsachenbehauptung
   über das jeweilige Spiel — die Karte ist so gebaut, dass sie exakt das sagt und nicht mehr
   (Abschnitt 0/2.2). **Frage:** Ist die Formulierung in dieser Präzision unbedenklich? Und die
   Vorwarnung: Sobald irgendwo daraus **„die einzige Plattform mit bestätigten Zahlen“** wird,
   ist das §6 UWG und geht vorher an sie (`ZIELGRUPPEN.md` Z5).
5. **Die Summenprobe (2.3).** Formulierung: „Summe der Spielerwerte = 78 · passt zum Ergebnis.“
   Das ist eine Rechenaussage, keine Bestätigungsaussage. **Frage:** Ist der Unterschied für einen
   durchschnittlichen Betrachter erkennbar genug, oder liest sich das als zusätzliche
   Verifizierung, die es nicht ist?
6. **Profilfoto.** Bewusst nicht auf der Karte (2.4). Falls Patrick es später will: eigene
   Bildrechte-Frage, dann erneut an Nora.

---

## 7. Kollegen — einbezogen und bewusst nicht

- **Ronja (retention-analystin):** Grundlage. Dieses Konzept ist die Ausarbeitung ihres Satzes
  „als Regel nein, als Ereignis ja“ (Befund Abschnitt 2). **Rückmeldung an sie:** Ihr R1 ist seit
  heute gebaut (`lib/statsNotify.js` existiert und wird aus
  `app/api/team/match-stats/save/route.js` Zeile 79 aufgerufen) — ihr Befund ist an dieser Stelle
  bereits überholt, im guten Sinn. Ihre Nicht-bauen-Liste habe ich als verbindlich behandelt und
  in 3.2 um die Fälle ergänzt, die speziell bei Karten entstehen.
- **Vivien (design-spezialistin):** Empfängerin. Abschnitt 5 ist ihre Übergabe. **Nicht
  parallel beauftragt**, weil sie laut Auftragslage gerade im Code arbeitet und ein zweiter
  Auftrag mitten hinein die schlechtere Idee wäre — die Übergabe sollte Patrick auslösen, wenn
  er das Konzept trägt.
- **Ben Adeyemi (Analytics):** Adressat von 4.2 (die `?src=`-Lücke — die trifft auch die
  Flyer-Kampagne) und 4.4 (fünf neue Ereignisse). Der Punkt aus 4.2 ist unabhängig vom
  Kartenkonzept nützlich und könnte sofort mit.
- **Nora (recht-vorpruefung):** Abschnitt 6, insbesondere Punkt 1 (Jugendliche) — der sollte vor
  dem Bau geklärt sein, nicht danach.
- **Lina (Onboarding & Plattform-Kommunikation):** Berührt, weil die Karte auf ein öffentliches
  Profil führt und der Ankommende dort in drei Sekunden verstehen muss, was Hoops ist. Ihre
  Fläche, nicht meine. **Konkrete Zuarbeit für sie:** Ein Besucher, der über `/p/<slug>` aus einer
  WhatsApp-Gruppe kommt, ist ein anderer Erstkontakt als jemand, der über `/signup` kommt — er
  kennt einen Namen, nicht das Produkt.
- **Kai (test-automatisierung):** Falls gebaut, gehören drei Regeln in seine Suite, weil ihr
  Bruch nach außen wirkt: keine Karte bei `isDemo`, keine bei `mismatch`, keine
  Beleg-Zeile ohne beide `submittedBy`.
- **Mats (marktforscher):** nicht beauftragt. Dies ist keine Bedarfsfrage — die Bedarfe 1 und 4
  seiner Analyse sind der Ausgangspunkt und unbestritten.
- **Milo (medien-produzent):** bewusst nicht. Die Karte ist typografisch und datengetrieben, sie
  braucht kein produziertes Bildmaterial. Wenn Vivien im Entwurf zu einem anderen Schluss kommt,
  ist er der richtige Nächste.
- **Jonatan:** berührt, sobald Sponsoren ins Spiel kommen (Abschnitt 6.3) — heute nicht,
  Monetarisierung ist bis zur Gewerbeanmeldung gesperrt.
- **hr-koordinator (Hanna):** kann diesen Beitrag im Backoffice-Roster als Nachweis nachtragen.

---

## 8. Was ich nicht prüfen konnte — ehrlich

- **Ob Z1 die Karte wirklich teilt.** Das ist der Kern meines eigenen Urteils, und er ist
  **[HYPOTHESE]**. Es gibt keine Umfrage, kein Interview, keine Tester-Aussage dazu. Meine
  Ableitung stützt sich auf beobachtbare Vereinspraxis (Repost statt Post) und auf die
  Beleglage in `ZIELGRUPPEN.md` — nicht auf Daten von Hoops. **Validierbar wird sie erst über
  die getrennten Quellwerte aus 4.3.** Wenn nach der ersten echten Saisonhälfte kein einziger
  `lk-`-Wert in `signupSource` steht, war meine Einschätzung falsch, und das sollte man dann
  auch so nennen.
- **Ob die Trennung Ergebnis/Box-Score in allen Pfaden gilt.** Ich habe
  `app/api/team/match-stats/save/route.js` vollständig gelesen und die Bestätigungslogik aus
  `app/match/[id]/page.js` Zeilen 175–178 übernommen. Den Super-Admin-Pfad
  (`/admin/update-match`) habe ich **nicht** selbst gelesen — der Kommentar im Code beschreibt
  ihn als denjenigen, bei dem `submittedBy` bewusst nicht gesetzt wird. Vor dem Bau gegenprüfen.
- **Die Live-Seite.** Nicht aufgerufen, nicht eingeloggt, `hoops_prod` nicht angefasst. Alle
  Bestandszahlen stammen aus `CLAUDE.md`, `docs/CHRONIK.md` und Ronjas Messungen vom 13.08.
- **Die tatsächliche Zahl bestätigter Spiele.** Nicht gezählt. Meine Aussage „faktisch keine
  echte Karte erzeugbar“ leitet sich aus „1 externes Team“ ab, nicht aus einer Abfrage.
- **Aufwandsschätzungen.** Ich habe bewusst keine gemacht. Die Bilderzeugung ist im Projekt
  Neuland (**[BELEGT]** null Treffer für `satori`/`sharp`/`@vercel/og`/`navigator.share`) — was
  das kostet, schätzt jemand, der es baut, nicht ich.
- **Kein Entwurf gezeichnet.** Abschnitt 2 ist Wortlaut und Hierarchie in Textform. Das
  Gestaltete kommt von Vivien; ich wollte ihr nichts vorwegnehmen, was ich schlechter kann.

---

*Nele · 13.08.2026 · Konzept, keine Implementierung, kein Commit. Entscheidung: Patrick.*
