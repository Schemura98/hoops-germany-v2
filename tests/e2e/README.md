# E2E-Tests (Playwright) — Auth-Kernpfad

Automatisierte Tests für den Auth-Kernpfad von Hoops Germany:
Login (gültig/ungültig), Signup (neuer Account, Duplikat-Mail),
Dual-Auth-Grundfall (Spieler-Token → Team-Admin-Zugriff auf `/api/team/fetchinfo`).

## ⚠️ Harte Regel: nur Dev-DB

Die Suite läuft **ausschließlich gegen die Dev-DB `hoopsgermany`**.
`global-setup.mjs` prüft die `MONGODB_URI` aus der `.env` und **bricht den
kompletten Lauf ab**, wenn sie nicht auf `hoopsgermany` zeigt (niemals
`hoops_prod` oder `test` — das sind Produktiv-DBs, siehe CLAUDE.md).

## Voraussetzungen (einmalig)

```bash
# 1. Abhängigkeiten (enthält @playwright/test — seit `1a00846` regulär
#    in package.json und Lockfile, NICHT mehr --no-save)
npm install

# 2. Browser installieren
npx playwright install chromium

# 3. Dev-DB mit Demo-Daten befüllen (falls noch nicht geschehen)
node scripts/seed-demo.mjs
```

Benötigte Seed-Accounts (kommen aus `seed-demo.mjs`, PW `test123`):
- `max@test.de` — Team-Admin von „Test Baskets" (Dual-Auth-Positivfall)
- `sven.adler@test.de` — Free Agent ohne Team (Dual-Auth-Negativfall)

## Ausführen

```bash
npx playwright test -c tests/e2e/playwright.config.mjs
```

Das **baut** und startet dann `next start` — also die Fassung, die auch auf dem
Server läuft. Der Build kostet rund **12 Sekunden** (warm), der ganze Lauf rund
**3,5 Minuten**.

Einzelne Gruppe: `npx playwright test -c tests/e2e/playwright.config.mjs -g "Dual-Auth"`

### ⚠️ Warum gebaut wird (Befund H1, Roadmap 23)

Bis zum 20.08.2026 startete die Konfiguration fest `npm run dev`. Damit konnte
die Suite eine ganze Fehlerklasse **per Konstruktion nicht sehen**: alles, was
nur in der ausgelieferten Fassung auftritt — statische Vorab-Erzeugung,
Hydration, `NODE_ENV=production`. Die Projektregel „vor Deploy immer die
Production-Runtime testen" und das Werkzeug widersprachen sich.

Wie real das ist, zeigt `d841c4b`: Die Startseite kam mit der **fertigen**
Zeichnung beim Nutzer an und nahm sie beim Laden zurück. Jeder Browser-Test war
zu Recht grün — sie fragten alle die Seite *nach* dem Laden. Gefunden hat es
erst ein Test, der das **rohe Server-Blatt** liest.

### Stellschrauben

| Variable | Wirkung |
|---|---|
| `E2E_PORT=3210` | Eigener Port für isolierte Arbeitsbäume. Vorgabe 3000. |
| `E2E_MODUS=dev` | `next dev` statt der ausgelieferten Fassung. Schnell, aber **kein Gate-Beleg**. |
| `E2E_BUILD=auto` | Baut nur, wenn eine Quelldatei jünger ist als der Build. |
| `E2E_BUILD=aus` | Baut nie. Nutzt den vorhandenen Build, wie er ist. |

Jede dieser Entscheidungen wird beim Start **gedruckt**. `E2E_BUILD=aus` warnt
zusätzlich laut, wenn eine Quelldatei jünger ist als der Build — ein
übersprungener Build, der doch veraltet war, ist die Zombie-Falle.

⚠️ **`E2E_MODUS=dev` zerstört den Production-Build.** `next dev` schreibt sein
eigenes `.next` und überschreibt dabei, was `next build` dort abgelegt hat
(dieselbe Ursache wie die Projektregel „`npm run build` nie parallel zu
`next dev`"). Der nächste Production-Lauf baut deshalb neu — die Vorgabe
`E2E_BUILD=immer` tut das ohnehin, und `auto` erkennt die fehlende `BUILD_ID`.
Nur `E2E_BUILD=aus` bricht danach ab, und zwar mit Ansage statt mit einem
irreführenden Testergebnis.

### ⚠️ `reuseExistingServer` übernimmt keinen fremden Server mehr

Früher stand hier `reuseExistingServer: true`: Die Suite übernahm **jeden**
Server, der auf dem Port antwortete. Ein verwaister Prozess hat so mehrfach
einen veralteten Build ausgeliefert — und die Suite war grün, weil sie nicht
wusste, was sie da prüft. (`preview_stop` beendet einen Dev-Server **nicht**,
es löst ihn nur aus der Verwaltung; der Node-Prozess hält den Port weiter.)

Jetzt wird die **Identität** geprüft: Ein `next start` beantwortet
`/_next/static/<BUILD_ID>/_buildManifest.js` nur für *seinen eigenen* Build mit
200. Nur dann wird wiederverwendet. Alles andere bricht den Lauf ab und nennt
beide Auswege (Port freimachen oder `E2E_PORT` setzen).

### ⚠️ Keine festen Hosts in Testdateien

`sicherer-pfad.spec.mjs` verglich bis zum 20.08.2026 fest gegen
`http://localhost:3000` und meldete auf jedem anderen Port „die Weiterleitung
hat die Seite verlassen" — ein **Sicherheitsalarm über einen Angriff, den es
nicht gab**, ausgelöst durch die eigene Testeinstellung. Der Vergleichswert
kommt jetzt aus der `baseURL`-Fixture. Wer einen Host braucht, nimmt sie.

## Wegwerf-Accounts & Aufräumen

Signup-Tests legen Accounts **nur** im Namensraum
`e2e-kai-<tag>-<timestamp>-<rand>@hoops-e2e.test` an. Jede angelegte Mail wird
**vor** der Anlage in `.artifacts/created-users.json` registriert;
`global-teardown.mjs` löscht nach dem Lauf **genau diese** Accounts aus der
Dev-DB (doppelt abgesichert: Registry-Eintrag UND Namensraum-Regex müssen
passen). Seed- und echte Accounts werden nie angefasst. Bleibt nach einem
harten Abbruch etwas liegen, räumt der nächste Lauf es über die Registry mit auf.

## Struktur

| Datei | Zweck |
|---|---|
| `playwright.config.mjs` | Runner-Config (1 Worker, **Build + `next start`**, BUILD_ID-Prüfung, Screenshots bei Fehlern) |
| `playwright.gate6.config.mjs` | Dünner Aufsatz: nur eigener Port + eigener Ablageort. Neue Aufrufe nehmen `E2E_PORT`. |
| `global-setup.mjs` | DB-Guard (Abbruch, wenn nicht Dev-DB `hoopsgermany`) |
| `global-teardown.mjs` | Löscht nur selbst angelegte Wegwerf-Accounts |
| `auth.spec.mjs` | 8 Tests: 3× Login, 2× Signup, 3× Dual-Auth |
| `sicherer-pfad.spec.mjs` | Offene Weiterleitung über `?next=` (Kai K4): das Modul, die echte Kette im Browser, und dass die Prüfung an **einer** Stelle steht |
| `dribbelweg.spec.mjs` | Der Dribbelweg und der Pass (seit 21.08.2026): Berührungsfreiheit des Balls auf 6 Breiten × **2 Höhen** × 15 Scrollpunkten, „mobil wird kein Weg gezeichnet", Ankunft des Passes auf **8 Fenstern** × 2 Anmeldezuständen, **Berührungsfreiheit des Passes über den ganzen Flug** (5 Fenster × 2 Zustände × 19 Punkte), Abschluss-Block für Angemeldete, Aussenlinie, **Standbild bei reduzierter Bewegung** |
| `ball-drehpunkt.spec.mjs` | Der Drehpunkt der **drei** rollenden Bälle (mobiler Streckenball, Desktop-Dribbelball, Pass-Ball) — im Browser gemessen, nicht im Quelltext gelesen |
| `helpers/landing.mjs` | Gemeinsame Werkzeuge der Startseiten-Wächter: **echte** Anmeldung mit Ehrlichkeitsschranke, Warten auf Layout-Stillstand, Kontur statt Hüllbox, Drehversatz |
| `endmarke-einpassung.spec.mjs` | ⚠️ **Gegenstand gewechselt, Zweck gleich** (21.08.2026): prüfte die Korb-Endmarke der alten Fortschritts-Leiste, prüft jetzt den haftenden Streifen selbst |
| `hero-standbild.spec.mjs` | Der Hero als Standbild: Anker, Kontrastfall, Rahmen, Server-Blatt — **und seit 20.08. auch angemeldet** (P5) |
| `hero-einblendung.spec.mjs` | Dass die Zeichnung sich wirklich zeichnet (E1), ihre Längen (E2), Vollständigkeit auf jedem Maßstab (E3), das Versteck (E4), `non-scaling-stroke` (E5) |
| `helpers/env.mjs` | .env-Parser + Dev-DB-Guard |
| `helpers/created-users.mjs` | Namensraum + Registry der Wegwerf-Accounts |
| `.artifacts/` | Laufzeit-Artefakte (Registry, Screenshots) — nicht einchecken |

Hinweis Versionierung: `tests/e2e/.artifacts/` und `node_modules`-Änderungen
nicht committen; ob die Suite selbst eingecheckt wird, entscheidet Patrick.

## Entfallene Tests (19.08.2026) — und warum keiner davon stumm gelöscht wurde

Mit dem Hero-Umbau „Der Abschluss" (`docs/HERO-DUNK-KONZEPT-2026-08-19.md`) ist
der gerenderte Hero-Ball entfallen und durch eine Linienzeichnung ersetzt
worden. Sieben Testdateien prüften Eigenschaften, die es danach nicht mehr gibt.

> ⚠️ **Ein stumm gelöschter Wächter ist die gefährlichste Änderung eines
> Umbaus.** Deshalb steht hier für jede Datei, WAS sie bewacht hat, WARUM der
> Gegenstand weg ist und WO die Frage — falls sie weiterlebt — jetzt gestellt
> wird. Wer eine dieser Eigenschaften zurückbaut, holt den Test aus dem
> Verlauf zurück; er ist nicht kaputt, er ist gegenstandslos.

| Gelöschte Datei | Was sie bewacht hat | Warum gegenstandslos | Nachfolger |
|---|---|---|---|
| `hero-ball-laufzeit.spec.mjs` | Ball am Ruhepunkt vollständig sichtbar; Balldeckkraft über Schaltflächen ≤ `TEXT_DIM_FLOOR` | Beide Zusicherungen beschreiben eine **deckende Scheibe**, die keinen Buchstaben berühren darf. Eine Linie darf jeden Buchstaben kreuzen; es gibt keine Ruhelage und keine Abdunkelung mehr | Der Kontrast wird jetzt als GEOMETRIE geprüft: `hero-standbild.spec.mjs` **P2** (der orange Ring darf keinen Buchstaben berühren; die kühlen Linien dürfen jeden kreuzen) |
| `hero-konturkanal.spec.mjs` | Kürzester Abstand der Konturen zwischen Ball und Eyebrow-Badge ≥ 10 px | Es gibt weder den Ball noch das Eyebrow (letzteres entfernt auf Entscheidung Nele, `docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`). Der Kanal war die Antwort auf eine gesuchte Ruhelage — die Zeichnung hat keine | keiner nötig |
| `hero-abstand.spec.mjs` | Ball teilt sich keine Kante mit einem Inhaltskasten | dito — eine Linie darf jede Kante kreuzen, das ist der Kern des neuen Konzepts | keiner nötig |
| `hero-einflug.spec.mjs` | Mobiler Ladeauftritt des Balls: findet statt, zeigt Bildwechsel, ist keine Standbild-Attrappe | Der mobile Einflug existiert nicht mehr. Er war nötig, weil mobil keine scroll-getriebene Lösung für eine deckende Scheibe existierte | keiner nötig |
| `hero-resize-im-flug.spec.mjs` | Größenänderung während des Einflugs friert die Ziellage nicht ein | Der Abschluss rechnet in viewBox-Einheiten und kennt keine eingefrorene Bildschirmkoordinate — eine Größenänderung ist per Konstruktion folgenlos | keiner nötig; die Eigenschaft steht als Kommentar an `abschlussSetzen()` |
| `hero-auth-tausch.spec.mjs` | Ball springt nicht, wenn die Anmeldung spät auflöst und den Hero-Zweig tauscht | Die Zeichnung hängt an **keinem** Inhaltselement. Der Zweigtausch ist ihr gleichgültig — damit sind auch Roadmap 20e und 20f gegenstandslos | keiner nötig |
| `ball-sequenz.spec.mjs` | **vier** Fälle: 3× Bildzahl der Rotationssequenz über Konstante, CSS-Dateinamen und Datei — **und 1× der Drehpunkt des Streckenballs** | Für die drei Sequenz-Fälle: Sequenz, Bilddateien und Erzeuger `scripts/generate-ball-rotation.mjs` sind gelöscht. **Für den vierten Fall galt das nicht** — s. Korrektur unten | **`ball-drehpunkt.spec.mjs`** (21.08.2026) — ⚠️ hier stand bis dahin `rail-ball-drehpunkt.spec.mjs`, und die Datei gab es zu diesem Zeitpunkt schon nicht mehr |

### ⚠️ Korrektur 20.08.2026: diese Löschung war unvollständig begründet

Die Zeile zu `ball-sequenz.spec.mjs` nannte einen Grund, der nur für **drei der
vier** Fälle jener Datei zutraf. Der vierte prüfte einen anderen Gegenstand, der
dort nur einquartiert war: **den Drehpunkt des Streckenballs** (ursprünglich
Befund Kai B1 vom 15.08.2026).

Dieser Gegenstand **lebte** — Stand 20.08.2026: `RailBallGlyph` in
`components/landing/HeroGlyphs.js`, eingesetzt an zwei Stellen in
`components/landing/FeatureProgressRail.js`, mit aktiver Rollbewegung bis 1965°.
(⚠️ Beide Dateien sind am 21.08.2026 entfallen; der rollende Ball steht jetzt in
`components/landing/Dribbelweg.js` und `DribbelBall.js`. Die Frage ist dieselbe
geblieben — siehe die Korrektur weiter unten.) Nach der Löschung fand
`grep -rn transformOrigin tests/` **null** Treffer — der Wächter war weg, sein
Gegenstand nicht.

> **Die Lehre ist nicht „sorgfältiger löschen".** Eine Testdatei mit vier Fällen
> kann vier verschiedene Gegenstände bewachen. Der Satz „der Gegenstand ist weg"
> muss für **jeden Fall einzeln** gelten, nicht für den Dateinamen. Diese Tabelle
> ist nach Dateien geordnet — das ist bequem und genau deshalb die Stelle, an der
> ein Fall unter dem Namen eines anderen verschwindet.

### ⚠️⚠️ Korrektur 21.08.2026: DIESELBE LÖSCHUNG ZUM DRITTEN MAL — und diesmal stand die Warnung schon da

`rail-ball-drehpunkt.spec.mjs` ist mit dem Dribbelweg-Umbau (`0da80c7`) **wieder
gelöscht** worden. Der genannte Grund war richtig für die Hälfte: `RailBallGlyph`
und `FeatureProgressRail.js` gibt es tatsächlich nicht mehr. Der **Gegenstand**
des Tests ist aber nicht das Glyph, sondern der **Drehpunkt eines rollenden
Balls** — und der lebt weiter: `components/landing/Dribbelweg.js` setzt für den
mobilen Ball `transformOrigin: "10px 10px"` und dreht ihn über
`rollwinkel()`. Nach der Löschung findet `grep -rn transformOrigin tests/`
wieder **null** Treffer.

Kai hat den Ausfall nachgemessen (Drehpunkt umgeklemmt): Versatz **6,9 → 14,5 →
27,4 → 24,3 px** über den Scrollweg — mehr als ein Balldurchmesser daneben, und
kein Test wird rot. Sein Satz dazu: *„beim dritten Mal ist ‚ist uns
durchgerutscht' keine Erklärung mehr."*

> **Was daran neu ist:** Die zwei Korrekturen darüber beschreiben genau diesen
> Vorgang, und der Abschnitt trägt seit dem 19.08. den Satz „ein stumm
> gelöschter Wächter ist die gefährlichste Änderung eines Umbaus". Es hat nicht
> gereicht, ihn aufzuschreiben. Was gefehlt hat, ist eine Prüfung, die **nicht
> in derselben Datei wohnt wie das Versprechen** — ein Wächter über den Wächter.

**Status: ERLEDIGT am 21.08.2026 — `tests/e2e/ball-drehpunkt.spec.mjs`.**

Und die Lehre ist diesmal in den **Dateinamen** gewandert. Alle drei Löschungen
waren nach demselben Muster begründet: Das **Bauteil** im Dateinamen war weg
(`ball-sequenz`, `rail-ball-drehpunkt`), die **Eigenschaft** nicht. Die neue
Datei heißt nach der Eigenschaft — „der Ball dreht sich um seine eigene Mitte" —
und überlebt damit jede weitere Umbenennung von Glyph, Leiste und Weg.

Sie liest keinen Quelltext. Geprüft wird eine Eigenschaft, die keinen
Mechanismus kennt: Dreht ein Körper um seine eigene Mitte, ist die Mitte
**drehinvariant**. Also einmal messen wie gezeichnet, einmal mit entferntem
`rotate(...)` derselben Transformation — beide Mitten müssen zusammenfallen.
Das deckt den mobilen Ball (CSS `transform-origin`) und die beiden SVG-Bälle
(`rotate(a cx cy)` im Attribut) mit **einem** Kriterium ab, obwohl sie den
Drehpunkt völlig verschieden festlegen.

⚠️ **Der Pass-Ball ist als dritter dazugekommen** — er benutzt dieselbe
`rollwinkel()`-Rechnung und stand in keiner Testdatei.

Gesund gemessen: Versatz **0,00 px** an allen Messpunkten, bei Drehwinkeln von
188° bis 8818°. Mit Ehrlichkeitsschranke auf den Winkel: Bei nahezu 0° fällt die
Mitte auch bei falschem Drehpunkt zusammen — ein Test ohne diese Schranke wäre
grün über null Messpunkte.

---

Historisch, zur Fassung vom 20.08.2026:
Wiederhergestellt und dabei verschärft in `rail-ball-drehpunkt.spec.mjs`: Der
alte Fall las nur Quelltext. Der neue **misst** zusätzlich den tatsächlichen
`transform-origin` im Browser, und zwar auf **beiden** Aufrufstellen (mobil und
Desktop) — der ursprüngliche Fehler trat nur auf der Desktop-Stelle auf, ein
Test auf einer Breite hätte ihn mit halber Wahrscheinlichkeit durchgelassen.

**Nicht gelöscht, aber inhaltlich verkleinert:** `rail-ankunft.spec.mjs`. Der
Farbblitz-Teil (Befund B-a) ist entfallen, weil es keinen Farbblitz mehr gibt —
die Landung am Ende der Fortschritts-Leiste ist zur **stehenden Endmarke**
geworden. Der Geometrie-Teil (Befund B-b, „der Ball ruht IM Netz, nicht
daneben") gilt unverändert und wird weiter geprüft.

### ⚠️ Korrektur 20.08.2026 (zweite): dieser Abschnitt nannte eine gelöschte Datei

Hier stand „Was NEU bewacht wird (`hero-dunk.spec.mjs`)“ mit vier Prüfungen
P1–P4. **`hero-dunk.spec.mjs` ist am 20.08.2026 gelöscht worden** — im selben
Umbau, den dieser Abschnitt beschreibt (Befund Kai M4). Damit stand die Regel
„ein stumm gelöschter Wächter ist die gefährlichste Änderung eines Umbaus“ in
einer Datei, die genau das für zwei eigene Löschungen nicht nachgezogen hatte.

**Was tatsächlich bewacht wird** (`hero-standbild.spec.mjs`, 7 Fenster mit
Höhenachse):

| | Zusicherung |
|---|---|
| **P1** | Der Inhalt beginnt höchstens **48 px** unter der Ringunterkante. Das ist Patricks Befund vom 20.08. als Regel |
| **P1b** | Über der obersten Linie der Zeichnung liegen höchstens 12 % der sichtbaren Höhe |
| **P2** | Mindestens 16 px zwischen Ring und erstem Inhalt. Der einzige Kontrastfall der Zeichnung: weiß auf `#F07A27` wäre 2,60 : 1 |
| **P3** | Der Ring ist vollständig im Bild (die Linien dürfen angeschnitten werden, der Ring nicht), kein Querscrollen |
| **P4** | Das rohe Server-Blatt trägt die fertige Zeichnung und **kein** Strichmuster; bei `prefers-reduced-motion` läuft keine Animation |
| **P5** | Alles davon noch einmal **angemeldet**, mit Ehrlichkeitsschranke auf den Zweigtausch |

### ⚠️ Korrektur 20.08.2026 (dritte): P1 hat seinen eigenen Gegenstand nicht gesehen

Hier stand für P1 „höchstens 12 % der sichtbaren Höhe liegen über der ersten
Tinte". In dieser „ersten Tinte" lagen die **Feldlinien** — und deren Lage ist
gesetzt (Grundlinie bei viewBox-y = 44). Gemessen lag der Wert auf allen sieben
Fenstern zwischen **4,0 und 6,6 %**, gegen eine Schwelle von 12 %.

**Folge: Eine Überschrift 260 px tiefer ergab 66 % leere Fläche — und P1 blieb
grün.** Die Prüfung, die ausdrücklich Patricks Befund festhalten sollte, war
für genau ihn blind (Befund Kai H2).

⚠️ **Und die naheliegende Korrektur wäre die falsche gewesen:** dieselbe
Rechnung, nur gegen den Inhalt. Diese Zahl ist am gebauten Stand gemessen
**30,4 % (360×640) · 22,0 % (390×844) · 19,6 % (430×932)** — dreimal dasselbe
Layout, dreimal ein anderer Wert. Der Zähler ist eine GESETZTE Größe
(Korblage × Maßstab + 1,5 rem), der Nenner die Fensterhöhe. Das ist die
Fehlerklasse „Stellschraube gegen Restbetrag" aus CLAUDE.md Roadmap 20b.
Gemessen wird deshalb **gegen den Ring**, in der Währung, in der der Abstand
gesetzt ist: konstant 24,1 px ausgeloggt, 27,0 px eingeloggt.

### ✅ Geschlossen am 20.08.2026 — und die Anleitung dazu war falsch

Hier standen drei offene Punkte für Kai. Alle drei sind gebaut
(`hero-einblendung.spec.mjs` E1–E5, `hero-standbild.spec.mjs` P5).

> ⚠️ **DER ERSTE PUNKT NANNTE EIN PRÜFMASS, DAS NICHTS MISST — und das ist der
> wichtigste Satz dieses Abschnitts.** Er lautete: „über rund 1,5 s **mehrere
> verschiedene** `strokeDashoffset`-Werte zählen", mit den Belegzahlen
> „Chromium 47, WebKit 33, Firefox 23 Wechsel — vorher jeweils 0".
>
> Genau diese Sonde hatte Vivien im selben Commit (`d4f9465`) **selbst
> verworfen und die Verwerfung protokolliert**: Der Versatz ändert sich **auch
> im Defekt**, weil die Animation läuft — sie hat nur nichts, woran sie ziehen
> kann. Nachgemessen am 20.08.2026 auf 390×844 in Chromium, Abhilfe gegen
> nachgestellten Defekt: **55 gegen 53 verschiedene Werte.** Ununterscheidbar.
>
> Die Anleitung stand also in der Datei, die als Prüfmaß-Quelle benannt war
> (`CLAUDE.md` und `docs/CHRONIK.md` verweisen beide hierher) — und sie hätte
> den nächsten Prüfer in eine Sonde geschickt, die im Defekt grün wird.
> **Eine widerlegte Messmethode, die als Sollvorgabe stehen bleibt, ist
> schlimmer als eine offene Lücke:** Die Lücke weiß man, die falsche Anleitung
> glaubt man.

**Gültig ist:** die **Animationszeit setzen** (`animation.currentTime`) statt
auf sie zu warten, und dann messen, was tatsächlich gezeichnet ist.
`hero-einblendung.spec.mjs` nutzt dafür `isPointInStroke()` — die browsereigene
Antwort auf „liegt dieser Punkt im Strich", die das Strichmuster einrechnet.
41 Proben je Pfad, 5 Pfade = 205 Proben:

| Zeit | Abhilfe | Defekt (`dasharray: none`) |
|---|---|---|
| t = 0 | 0 / 205 | 205 / 205 |
| t = 300 | 51 / 205 | 205 / 205 |
| t = 700 | 174 / 205 | 205 / 205 |
| t = 1400 | 205 / 205 | 205 / 205 |

In Chromium, WebKit und Firefox auf die Probe identisch — anders als eine
Bildpunkt-Zählung, deren Grundwert am Ausschnitt und an der Kantenglättung der
Engine hängt (gemessen 3.637 / 3.381 / 3.007 bei t = 0 im selben Ausschnitt).

**Was jetzt bewacht wird:**

| | Zusicherung | Gegenprobe |
|---|---|---|
| **E1** | Die Einblendung findet statt: bei t = 0 nichts, mittendrin ein Teil, am Ende alles | `--len` ohne Einheit → rot · `dasharray: none` → rot |
| **E2** | Jede Linie trägt ihre echte Länge als Strichmuster (die Längen in `HeroCourt.js` sind **gerechnet**, nicht gemessen) | `--len` ohne Einheit → rot auf allen drei Maßstäben |
| **E3** | Die fertige Zeichnung ist auf jedem Maßstab vollständig | `non-scaling-stroke` → rot **nur bei 1440×900** (s. u.) |
| **E4** | Kein Pfad ist länger als sein Versteck (der Punktlinien-Geist aus Roadmap 20a) | Lücke verkürzt → rot |
| **E5** | Nirgends `vector-effect: non-scaling-stroke`, auch nicht am Ring | Attribut zurückgeholt → rot auf allen drei Maßstäben |
| **P5** | Derselbe Hero **angemeldet**, mit Schranke auf den Zweigtausch | Tobias' B1 zurückgedreht → rot auf **6 von 7** Fenstern |

> ⚠️ **E3 HAT SEINEN MECHANISMUS EINMAL GEWECHSELT, und der Grund gehört
> gelesen, bevor jemand daran arbeitet.** Der erste Anlauf verglich das
> ANGEGEBENE Strichmuster mit der Pfadlänge und begründete das damit, die
> Währungen liefen auseinander. Nachgemessen mit je Pfad gesetztem
> `non-scaling-stroke` blieb das Verhältnis auf allen drei Maßstäben **exakt
> 1,0000**: `getComputedStyle` gibt den angegebenen px-Wert zurück, dass der
> Browser ihn danach im Gerätemaß auslegt, steht in keiner Zeichenkette.
> Der Test hätte den Rückfall nie gefangen und dabei behauptet, genau ihn zu
> bewachen. Gemessen wird jetzt, was der Browser **zeichnet**.
>
> ⚠️ **Und die Achse dazu:** Die Gegenprobe wird rot bei Maßstab 1,200
> (171/205), aber **grün bei 0,778 und 0,844**. Das ist die Physik, nicht die
> Messung: Unter Maßstab 1 wird das Muster im Gerätemaß länger als der Pfad,
> die Linie bleibt gedeckt. **Ein Prüffeld aus lauter Handy-Breiten wäre hier
> per Konstruktion blind** — der Eintrag über 1 in `MASSSTAEBE` ist kein „auch
> noch Desktop", er ist der einzige Fall, in dem der Defekt existiert.

> ⚠️ **Warum P5 überhaupt nötig war** (Tobias' Befund M1): Die drei neuen
> Testdateien vom 20.08. enthielten **null** `playerAuthToken`. Tobias' Blocker
> B1 trat ausschließlich angemeldet auf und wäre durch eine grüne Suite
> marschiert. Belegt: Mit zurückgedrehtem B1 wird der angemeldete Block auf
> **6 von 7** Fenstern rot, der ausgeloggte nur auf **2** — und die zwei sind
> ausgerechnet nicht die, auf denen der Defekt gemeldet wurde.
