# Newsfeed — Inhalte und Funktionen. Nutzungs- & Retention-Befund

**Ronja (retention-analystin) · 15.08.2026 · Branch `redesign` (HEAD `074bcf1`), lokaler Dev-Server
+ lesende öffentliche Live-APIs von hoopsgermany.de**

**Patricks Auftrag, wörtlich:** „Ich möchte einen einzigartigen kreativen Newsfeed mit sinnvollen
Inhalten und Funktionen, welcher die User förmlich an die Seite fesselt." Der erste Teil
(Form/Gestaltung) läuft parallel bei Vivien. Dieser Befund beantwortet den zweiten: **welche
Inhalte und Funktionen** die Fläche tragen sollen.

**Nichts implementiert, nichts committet, nichts versendet.** Priorisierung entscheidet Patrick.

---

## 0. Spiegelung, Beleg-Status, Personas

**Pflicht-Startpunkte gelesen:** `docs/BEDARFSANALYSE-2026-08-09.md` (Mats — Bedarfe 1–5, H1–H7 und
die „wird NICHT gebraucht"-Liste), `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`,
`docs/RETENTION-BEFUND-2026-08-13.md` (mein eigener Vorbefund),
`docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md` (Lina), `CLAUDE.md` Abschnitt 0.

**Kennzeichnung durchgehend:**

- **[BELEGT]** — am laufenden Produkt nachvollzogen oder im Code an Datei/Zeile belegt.
- **[GEMESSEN]** — Zahl, die ich heute selbst erhoben habe (Browser-Messung oder öffentliche API).
- **[INDIZ]** — starkes, aber nicht abschließendes Anzeichen.
- **[HYPOTHESE]** — Vermutung aus der Nutzerbrille, jeweils mit Validierungsvorschlag.

**Keine erfundenen Zahlen.** Wo eine Zahl steht, steht daneben, woher sie kommt.

**Sprachregelung wie am 13.08.:** Hoops Germany hat einstellig bis niedrig zweistellig viele echte
Nutzer (`docs/CHRONIK.md`: externe Teams 1, externe Nutzer 10 nach der Bereinigung). Ich kann keine
**Retention beobachten**, nur Hürden dafür. Alles hier sind **Walkthrough-Befunde**.

### Personas und tatsächlich gegangene Wege

Wie am 12./13.08. abgeleitet aus Mats' Gruppen (Hoops hat keine benannte Persona-Doku wie HGH):

- **„Max", Team-Admin mit Verein** (Z2 / Mats 1b) — Dev-Konto `max@test.de`, Team-Admin „Test Baskets".
- **„Sven", Spieler ohne Verein** (Z3 / Mats 1c) — Dev-Konto `sven.adler@test.de`, `verfuegbar`.

**Gegangen, jeweils mobil 390×844 UND Desktop 1440×900, echtes Chromium über Playwright:**
Login → `/player/newsfeed` · Umschalter „Für dich" und „Folge ich" · Glocke (`getnotifications`) ·
alle fünf mobilen Akkordeons · Seitenspalten Desktop.
Belege: `tmp/ronja-feed/` (Screenshots `*-oben.png` / `*-ganz.png`, Volltexte `*-text.txt`),
Skripte `tmp/ronja-feed-inventur.mjs`, `tmp/ronja-feed-leerzustand.mjs`, `tmp/ronja-feed-hoehen*.mjs`.
Zusätzlich der **Live-Feed** über den öffentlichen Endpunkt `POST /api/posts/feed` (ohne Token —
der Feed funktioniert ausgeloggt). Auf `hoops_prod` habe ich **nichts geschrieben** und mich
**nicht eingeloggt**.

⚠️ **Umgebungs-Vorbehalt:** Auf Port 3000 lief ein Dev-Server aus einer parallelen Sitzung
(Vivien arbeitet zeitgleich an der Gestaltung); er ist während meines Durchgangs einmal neu
gestartet. Der Arbeitsbaum war dabei sauber auf `074bcf1`. Falls die Gestaltung inzwischen
umgebaut wurde, gelten meine Höhenmessungen für diesen Stand.

---

## 1. Die eine Frage zuerst: Wird das Beleg-Versprechen auf dem Feed eingelöst?

**Nein. Es liegt dort vollständig brach.** Das ist der wichtigste Satz dieses Befunds.

Vier Belege, alle heute erhoben:

**(a) Auf der Fläche steht nichts über den Menschen, der sie ansieht.** [BELEGT, beide Personas,
beide Bildschirmgrößen] Ich habe den kompletten Text von `<main>` ausgelesen. Er enthält für Max:
Begrüßung, Datum, nächstes Spiel, letztes Teamergebnis, Onboarding-Checkliste, fünf Widgets, acht
Beiträge fremder Leute. **Keine einzige eigene Zahl.** Nicht die Punkte aus dem letzten Spiel,
nicht die eigene Platzierung, nicht die Karrierewerte. Für Sven fehlt zusätzlich die Spieltag-Leiste
(sie erscheint ohne Team gar nicht) — er sieht auf seiner Startfläche **ausschließlich** Inhalte
über andere.

**(b) Der einzige Auto-Post, der Ergebnisse berührt, trägt den Beleg-Satz nicht.** [BELEGT]
`lib/autoPost.js` Zeile 59–61: `syncMatchResultPost` schreibt als Inhalt genau
`"${tA.teamName} ${aPts}:${bPts} ${tB.teamName}"` und als Notiz `"Endergebnis"` bzw.
`"Vorläufiges Ergebnis"`. Das Wort „bestätigt" kommt nicht vor, die Doppelbestätigung wird nicht
erwähnt. Auf `/match/[id]` steht das Abzeichen „Von beiden Teams bestätigt" — sauber an beidseitigem
`submittedBy` aufgehängt. Im Feed steht es nicht. Auf der Fläche mit der höchsten Reichweite
verschwindet das Alleinstellungsmerkmal also genau dort, wo es hingehörte.
Auf dem Live-Feed sind das **5 von 50 Beiträgen** [GEMESSEN, 15.08.2026].

**(c) „Deine Zahlen stehen" ist gebaut — und landet in einem Kanal, der als Ziffer erscheint.**
[BELEGT] `lib/statsNotify.js` ist sorgfältig gemacht: genau einmal je Spieler und Spiel, kein
Versand bei `mismatch`, und der Beleg-Satz hängt an beidseitigem `submittedBy`, nicht an
`resultStatus` — vier unterschiedene Fälle, Zeile 100–113. Das ist die ehrlichste Textstelle im
Projekt. **Sie erreicht den Nutzer aber nur über die Glocke.** In meinem Durchgang hatte Max
**zwei ungelesene Benachrichtigungen** [GEMESSEN, `getnotifications`, beide `join_request`]; die
Fläche darunter — sein Newsfeed — erwähnt sie mit **keinem Wort**. Sichtbar ist eine kleine „2".

**(d) Das Ereignis existiert, die Bühne wird nicht benutzt.** Ich habe am 13.08. geschrieben:
„Die Positionierung ist nicht als Text unterversorgt, sondern als **Erlebnis**." Das Erlebnis ist
seitdem gebaut worden. Es steht nur nicht auf der Bühne. Der Newsfeed **ist** die Bühne — er ist
die Seite, auf der jeder eingeloggte Nutzer landet.

**Meine Empfehlung in einem Satz:** Der oberste Platz des Feeds gehört dem, was der Nutzer
selbst getan hat und was davon belegt ist — und der Text dafür existiert bereits wörtlich in
`lib/statsNotify.js`. Das ist keine neue Funktion, das ist ein Umzug.

⚠️ **Grenze, die dabei gilt** (`MUSTER-ZAHLEN`, Fall 5): Doppelt bestätigt ist das **Ergebnis**,
nicht der Box-Score. Die Spielerwerte trägt **ein** Team-Admin ein. Wer diese Karte baut, muss die
**vier Fälle aus `statsNotify.js` übernehmen** und darf sie nicht auf „bestätigt" verkürzen.
Wortlaut gehört zu Nele.

---

## 2. Deine zwei Beobachtungen — geprüft

### 2a. „Die Transfers stehen doppelt" — **bestätigt, und schlimmer als gedacht**

**[BELEGT, Code]** `lib/recordTransfer.js` schreibt bei jedem Wechsel **zwei** Dinge: den
`TransferEvent` (Zeile 71) **und** — außer im stillen Modus, Zeile 80 — den Auto-Post über
`autoPostTransfer` (Zeile 97). Der `TransferEvent` speist das rechte Widget
(`/api/player/transfer-feed`), der Auto-Post speist die Mitte. Ein Wechsel erzeugt also
zwangsläufig zwei Einträge auf **derselben Seite**. Das ist kein Versehen, das ist die Architektur.

**Der eigentliche Befund steht im Widget selbst.** `app/api/player/transfer-feed/route.js`
Zeile 49–62, Kommentar wörtlich: *„Mit aktuellen Community-Transfers auffüllen, damit das Widget
nie leer ist."* Wenn zu wenige **persönlich relevante** Transfers da sind, wird mit fremden
aufgefüllt. Am Dev-Konto Max sichtbar [BELEGT]: „Leon Schneider ist Test Baskets beigetreten",
„Jonas Wagner ist Test Baskets beigetreten", „Max Mustermann wechselte von Rhein Ballers zu Test
Baskets" — der letzte Eintrag ist **26.07.2025**, über ein Jahr alt, und steht dort nur, damit der
Kasten nicht leer aussieht.

Eine Fläche, die mit Belanglosem aufgefüllt werden muss, um Präsenz zu behaupten, hat kein eigenes
Publikum. **Empfehlung: das Transfer-Widget entfällt, Transfers bleiben als Beiträge im Feed.**
Ein Transfer *ist* ein Ereignis — dort gehört er hin, dort kann man ihn kommentieren, und dort
sortiert ihn das Ranking nach Nähe (eigenes Team ×2, gefolgt ×1,8, gleiche Liga ×1,5 —
`lib/feedRanking.js`). Das Widget kann das alles nicht.

*Einschränkung, ehrlich:* Auf der **Dev-DB** konnte ich die Doppelung nicht im Bild zeigen —
`seed-demo.mjs` legt `TransferEvent`s an, aber keine zugehörigen Auto-Posts, deshalb stand der
Transfer dort nur im Widget. Der Code-Pfad ist eindeutig, und dein Screenshot von der Live-Seite
zeigt beides gleichzeitig.

### 2b. „Der Feed besteht überwiegend aus Auto-Posts" — **widerlegt. Die Wahrheit ist unbequemer**

**[GEMESSEN, 15.08.2026, `POST https://hoopsgermany.de/api/posts/feed`, limit 50]**

| | |
|---|---|
| Beiträge geliefert | 50 (`hasMore: true`) |
| davon Mensch-Beiträge | **33** |
| davon Auto-Posts | 17 (`transfer_available` 6, `recruiting` 5, `match_result` 5, `tryout` 1) |
| **jüngster Beitrag der gesamten Seite** | **5,4 Tage alt** |
| **Median-Alter** | **69 Tage** |
| Likes in diesen 50 Beiträgen | **1206** (Ø 24 je Beitrag) |

Der Feed ist **kein Ereignisprotokoll**. Er ist ein **Archiv**. Die zwei jüngsten Einträge sind vom
09.08. („Patrick Schemura ist auf Vereinssuche") und 06.08. (ein YouTube-Link); danach springt die
Zeitachse auf **24.06.** zurück und bleibt im Juni.

**Woher der Inhalt stammt** [INDIZ, stark]: Die Beitragstexte stehen **wörtlich** in
`scripts/seed-world.mjs` — „Wir suchen ehrenamtliche Helfer fürs Heimspiel-Catering." (Zeile 595),
„Sommerfest mit Streetball-Turnier – save the date!" (Zeile 594), „Willkommen im Team, @…! 🙌"
(Zeile 544). Auch die Vereinsnamen im Feed (Dortmund Drivers, Essen Eagles, Paderborn Panthers,
Siegen Saints) stehen ausschließlich dort (Zeilen 101–109). **[GEMESSEN]** `POST
/api/team/fetchteams` liefert heute **66 Teams, davon 64 mit `isDemo: true`**; **40 davon tragen
Namen aus `seed-world.mjs`**. Nur zwei Vereine sind ohne Demo-Kennzeichnung: „Mönchengladbach
Scorpions e.V." und „Viersen Hoops II".

⚠️ **Punkt für dich, außerhalb meines Auftrags, aber ich melde ihn:** `CLAUDE.md` führt
`seed-world.mjs` als **„Prod: nicht ausgeführt"**. Die Namen und Texte auf der Live-Seite passen
dazu nicht. Entweder ist die Zeile überholt, oder der Inhalt kam über einen anderen Weg. Ich habe
die Produktiv-DB nicht angefasst und kann es nicht auflösen — **prüfen, bevor sich jemand darauf
verlässt** (dasselbe Muster wie bei der Deploy-Zeile, die zweimal in zwei Tagen falsch war).

**Und die Zahl, die ein Leser falsch versteht** (`MUSTER-ZAHLEN`): **1206 Likes auf 50 Beiträgen.**
Ein Mensch liest „36" unter einem Beitrag als *36 Personen fanden das gut*. Die Plattform hat
laut Chronik zehn externe Nutzer. `scripts/seed-world.mjs` Zeile 607 verteilt Likes aus dem
Bestand der geseedeten Profile — **[INDIZ]**, dass genau diese Zahlen dort herkommen; die
öffentliche Profil-API gibt `isDemo` nicht heraus, deshalb konnte ich es nicht zu **[BELEGT]**
machen. Der Testphase-Banner („einige Inhalte sind Beispieldaten") ist die richtige und ehrliche
Abfederung und steht auf jeder Seite [BELEGT, Screenshot] — er sagt aber nicht, dass auch die
**Zustimmungszahlen** Beispieldaten sind. Das ist die eine Zahl im Feed, die nach außen wirkt.

**Was das für die Frage „was steht da an einem Tag, an dem nichts passiert" bedeutet:** Genau das,
was heute dasteht. Und weil `lib/feedRanking.js` **deterministisch** ist (fester Score, stabile
Sortierung, Zeile 69–78), sieht ein wiederkehrender Nutzer bei unverändertem Bestand **dieselben
Beiträge in derselben Reihenfolge** wie beim letzten Mal. Der Feed hat heute keinen Mechanismus,
der Wiederkehr belohnt — er hat nicht einmal einen, der Wiederkehr *bemerkt*.

---

## 3. Was auf dieser Fläche wirklich trägt — priorisiert

Ich habe alle Elemente an **einer** Frage gemessen, weil sie die Fesselungs-Frage operationalisiert:
**Weiß diese Fläche, wer sie gerade ansieht — und ändert sich, was sie zeigt, wenn dieser Mensch
etwas tut?**

| Rang | Element | Urteil | Grund |
|---|---|---|---|
| 1 | **Spieltag-Leiste** (`SpieltagStrip`) | **trägt** | [BELEGT] Zwei Karten, 190 px, beide auf `/match/[id]` verlinkt: nächstes Spiel, letztes Ergebnis mit Beleg-Status daneben. Sie beantwortet „was war, was kommt" in einem Blick und ist die einzige Stelle des Feeds, an der die Belegbarkeit sichtbar wird. Der Code ist bewusst ehrlich gebaut (kein Urteilswort bei strittigem Ergebnis, drei Ausgänge statt zwei). **Grenze:** sie ist **team**-bezogen, nicht personenbezogen, und ohne Team erscheint sie gar nicht. |
| 2 | **Composer + Mensch-Beiträge** | **trägt — als einziges echtes Sozialelement** | [BELEGT] Der Umschalter „Für dich"/„Folge ich" funktioniert, das Ranking ist nachvollziehbar und personalisiert (eigenes Team ×2, gefolgt ×1,8, Liga ×1,5, Bundesland ×1,3). **Grenze:** [GEMESSEN] auf der Live-Seite entstanden in sechs Wochen zwei Beiträge außerhalb der Beispieldaten. Der Motor ist gebaut, es fehlt der Kraftstoff. |
| 3 | **Vorschläge für dich** (`FollowSuggestions`) | **trägt, steht aber falsch** | [BELEGT] Sauber gebaut: Spieler und Vereine abwechselnd, ein Tipp zum Folgen, optimistisch mit Rücknahme bei Fehler, blendet sich aus, wenn nichts mehr da ist. Es ist das **Gegenmittel gegen den leeren Feed** — und liegt mobil in einem **zugeklappten** Akkordeon, während der Leerzustand daneben schreibt „Entdecke Spieler und folge ihnen!" **ohne Link**. |
| 4 | **Spiele** (`TeamMatchesWidget`) | **trägt halb** | [BELEGT] Für „Mein Team" wiederholt es, was die Spieltag-Leiste 800 px weiter oben bereits kompakter sagt. Eigenständigen Wert hat nur der Bereich **„Gefolgte"**. Vier Umschalt-Kombinationen (Mein Team/Gefolgte × Anstehend/Ergebnisse) für eine Liste, deren Kern oben schon steht. |
| 5 | **Top-Teams** (`TopTeamsWidget`) | **trägt derzeit nicht — reparierbar** | [BELEGT] Der Filter steht auf **„Alle Ligen"** (Voreinstellung `useState("all")`), und **das eigene Team ist nicht markiert**: Max sieht „Test Baskets 0-3" auf Platz 4 wie einen Fremdverein. Damit wiederholt der Feed genau den Fehler, den `/topscorer` seit R5 **nicht mehr** macht — dort ist die **eigene** Liga vorausgewählt und „Deine Platzierung" steht über der Tabelle. Eine ligenübergreifende Tabelle ist außerdem eine Rangfolge, die im Sinne des Codes stimmt und im Sinne des Lesers nichts bedeutet. |
| 6 | **Transfers** (`TransferFeedWidget`) | **trägt nicht** | Siehe 2a: doppelt zum Feed, und im Zweifel mit Fremdinhalt aufgefüllt. |
| 7 | **Basketball-News** (`NewsWidget`, RSS) | **trägt nicht** — Begründung schwächer, als ich zuerst schrieb | [BELEGT, heute im Widget] „Cleveland tradet Schröder nach Charlotte", „Satou Sabally macht Rückschritt im Genesungsprozess", „Basketball-WM der Frauen". Profi-Basketball, null Verbindung zur Kreisliga des Nutzers. ⚠️ Ich hatte hier zuerst Mats' Zeile „News-Redaktion / Content-Portal" als Beleg angeführt. **Er hat widersprochen und recht:** Diese Zeile zielt auf **eigene Redaktion**, nicht auf einen eingekauften Fremd-Strom (Abschnitt 10). Es bleibt: meine eigene Nicht-bauen-Liste vom 13.08. („Fremd-News-Strom ausbauen, um Sitzungsdauer zu strecken") und das Positionierungs-Argument — **kein Nutzerbeleg.** |
| 8 | **Onboarding-Checkliste** | **trägt einmal, blockiert danach** | [GEMESSEN] **524 px** auf 390 px Breite — der größte Einzelblock der Seite, oberhalb von allem. Sie blendet sich korrekt bei 4/4 aus (`allDone`), aber bis dahin steht bei **jedem** Besuch die Aufgabe vom ersten Tag über den Neuigkeiten. Max ist bei 3/4 — es fehlt ein Profilfoto. Dafür verliert er auf jedem Besuch die Hälfte des ersten Bildschirms. |

### Der strukturelle Befund, der über allen Einzelurteilen steht

**[GEMESSEN, 390×844, Konto Max, `tmp/ronja-feed-hoehen2.mjs`]**

| Element | Höhe / Position |
|---|---|
| Testphase-Banner + Navigation | bis y = 133 px |
| Seitenkopf (Hallo / NEWSFEED / Datum) | 51 px |
| Spieltag-Leiste (zwei Karten, mobil untereinander) | 190 px |
| Onboarding-Checkliste | **524 px** |
| fünf zugeklappte Akkordeons | ~315 px |
| **Composer** | beginnt bei **y = 1281 px** |
| **erster Beitrag** | beginnt bei **y = 1491 px** |
| Bildschirmhöhe | 844 px |

**Der erste Inhalt aus der Community erscheint auf dem zweiten bis dritten Bildschirm.** Auf dem
Desktop ist es nicht besser: Die Drei-Spalten-Fläche beginnt bei y ≈ 860 px, also unterhalb der
Falz von 900 px — der gesamte erste Bildschirm besteht aus Kopf, Spieltag-Leiste und
Checkliste [BELEGT, Screenshot `tmp/ronja-feed/max-desktop-oben.png`].

Das ist bemerkenswert, weil der Umbau vom 13.08. genau das verhindern sollte: Der Kommentar in
`app/player/newsfeed/page.js` Zeile 34–38 sagt „mobil steht der Feed deutlich weiter oben … damit
der erste Beitrag nah am Seitenanfang bleibt", und beruft sich auf *„Do not hide critical next
steps below large promotional modules"*. **Die Akkordeons wurden zugeklappt — die Checkliste
blieb.** Sie ist inzwischen das große Modul, das die nächsten Schritte verdeckt.

---

## 4. Was weg kann

Du hast recht: sieben Widgets sind auch eine Aussage über eine nicht getroffene Entscheidung.
Meine Vorschläge, sortiert nach Sicherheit:

| | Vorschlag | Begründung | Risiko |
|---|---|---|---|
| **W1** | **Basketball-News (RSS) vom Feed zurückbauen — sobald F1/F2 den Platz füllen** | Fremdinhalt über Profi-Basketball ohne Verbindung zur Liga des Nutzers; er füllt Fläche, statt Nutzen zu tragen. ⚠️ **Korrigierte Begründung, s. u.:** Mats' Nicht-gebraucht-Zeile trägt dieses Argument **nicht** — sie zielt auf eigene Redaktion, nicht auf einen fremden Strom. | Gering, **aber erst nach Messung** (Abschnitt 7) und **nicht ersatzlos vorab**. |
| **W2** | **Transfer-Widget entfernen, Transfers bleiben Beiträge** | Doppelung ab Werk (2a); das Widget muss mit Fremdtransfers aufgefüllt werden, um nicht leer zu wirken. Im Feed sortiert das Ranking sie nach Nähe, im Widget nicht. | Gering. **Aber:** Transfers des **eigenen** Vereins sollten im Feed dann sicher oben landen — der Boost dafür existiert bereits (×2). |
| **W3** | **Spiele-Widget auf „Gefolgte" reduzieren** — oder ganz entfernen und die Spieltag-Leiste um eine Zeile „auch von deinen gefolgten Teams" ergänzen | Der Teil „Mein Team" ist eine ausführlichere Wiederholung der Leiste, 800 px weiter unten. | Mittel — hier hängt eine echte Funktion dran (Gefolgte). Nicht ersatzlos streichen. |
| **W4** | **Onboarding-Checkliste nach dem ersten Besuch auf eine Zeile eindampfen** („Noch offen: Profilfoto →") und unter die ersten Beiträge schieben | 524 px Erstbesuchs-Inhalt auf einer Wiederkehr-Fläche. Sie ist nicht falsch, sie steht falsch. | Mittel — **das ist Linas Fläche**, nicht meine. Ich liefere die Messung, sie entscheidet die Form. |
| **W5** | **Top-Teams NICHT entfernen, sondern personalisieren** (eigene Liga vorausgewählt, eigenes Team markiert) | Als ligenübergreifende Tabelle bedeutungslos; mit dem Blick des Betrachters ist es einer der stärksten Anker überhaupt. `/topscorer` macht es bereits vor (`ownLeague`, `viewer`). | Gering, Aufwand klein — die Endpunkte können es schon. |

**Was ausdrücklich bleiben soll:** Spieltag-Leiste, Composer, Beitrags-Feed mit beiden Reitern,
Folge-Vorschläge, Footer mit Impressum/Datenschutz (rechtlich, Befund Tobias L4).

**Gegenposition zu W1, die ich ernst nehme:** Solange kaum echte Beiträge entstehen, ist der
RSS-Strom der **einzige** Inhalt der Seite, der sich täglich ändert. Wer ihn streicht, macht sichtbar,
wie still es ist. Meine Antwort darauf: Genau das ist das ehrliche Bild, und es wird durch
Abschnitt 5 beantwortet — dort entsteht Bewegung aus **eigenen** Daten statt aus fremden Nachrichten.

**Mats hat dagegengehalten und mich in einem Punkt korrigiert** (Abschnitt 10, Kern): Er hat
**keinen Beleg** dafür, dass Amateurspieler Profi-News auf ihrer Vereinsplattform ablehnen — und
auch keinen dafür, dass sie sie schätzen. Seine Nicht-gebraucht-Zeile deckt mein Argument nicht.
**Ich übernehme seine Fassung:** W1 wird zum **Zwischenschritt statt zur Löschung** — der RSS-Block
geht, **sobald** die personenbezogenen Inhalte aus Abschnitt 5 den Platz füllen, und die
Entscheidung stützt sich auf die Klickmessung aus Abschnitt 7, nicht auf Geschmack. Das ist die
teurere, aber die ehrliche Reihenfolge. In einem Dokument über Belegbarkeit hätte ich mit der
ursprünglichen Begründung die eigene Belegbasis überzogen.

---

## 5. Was fehlt — Inhalte, die aus BEREITS vorhandenen Daten entstehen

Reihenfolge nach Hebelwirkung, nicht nach Aufwand. Keiner dieser Punkte ist ein neues Feature;
jeder ist eine bereits berechnete Wahrheit, die auf der falschen Seite steht.

### F1 — „Deine Zahlen aus dem letzten Spiel" ⭐ der eigentliche Auftrag

**Nutzer-Moment:** Sonntagmorgen. Das Spiel war Samstag, der Team-Admin hat abends den Box-Score
eingetragen. Der Spieler öffnet die App. Heute liest er dort, dass Nico Schwarz vor zwei Stunden
„Defense wins championships" gepostet hat.

**Vorhandene Daten:** `Match.playerStats[]` (Punkte/Rebounds/Assists, `didNotPlay`), der komplette
Beleg-Status inklusive der **vier korrekt unterschiedenen Fälle** in `lib/statsNotify.js`, und die
Benachrichtigung, die den Satz bereits fertig formuliert: *„Deine Zahlen aus dem Spiel gegen X
stehen: 24 Punkte, 6 Rebounds, 3 Assists. Bestätigt – beide Teams haben das Ergebnis unabhängig
gemeldet."*

**Was fehlt technisch:** `POST /api/player/my-matches` wählt `playerStats` heute nicht mit
(`.select(...)`, Zeile 35) — ein Feld ergänzen. Sonst nichts.

**Warum das der größte Hebel ist:** Es ist gleichzeitig Mats' Bedarf 1 (eigene Stats), Neles Hook
(„jeder will seine Stats", Z1) und die **Einlösung der Kernpositionierung**. Und es ist der
einzige Feed-Inhalt, den ein Spieler seinem Team weiterschickt.

**Nebenwirkung auf Mats' Bedarf 4:** Die Ergebniseingabe des Team-Admins ist heute Doppelarbeit
ohne sichtbaren Ertrag. Wenn seine Eingabe am nächsten Morgen bei fünf Spielern oben im Feed steht,
wird aus „noch eine Pflicht" ein „mein Team sieht, was ich mache".

⚠️ **Wortlaut-Grenze:** vier Fälle, nicht einer. Nicht auf „bestätigt" verkürzen (Fall 5 der
Muster-Zahlen). Text gehört Nele.

### F2 — „Deine Platzierung" auf den Feed holen

**[BELEGT]** `app/api/player/topscorer/route.js` liefert bei gesetztem Token bereits ein
`viewer`-Objekt, und `app/topscorer/page.js` Zeile 56–111 zeigt daraus: *„Deine Platzierung ·
[Liga] — Platz 9 von 61 · 128 Punkte. 4 Punkte hinter Platz 8."* Mit `ownLeague: true` ist die
eigene Liga die Vorauswahl.

**Das ist fertig gebaut und steht auf einer Seite, die niemand von sich aus öffnet.** Auf dem
Feed wäre es eine Zeile. Es ist der FuPa-Motor, den Mats als **belegte** Lektion führt:
Sichtbarkeit erzeugt Datenpflege.

**Grenze 1 [BELEGT, im Code dokumentiert]:** Die Topscorer-Aggregation filtert auf
`status: "completed"`, **nicht** auf beidseitige Bestätigung — die Seite sagt deshalb bewusst
„gewertete Spiele", nicht „bestätigte Spiele" (Fund Kai). Wer die Zeile in den Feed holt, muss
dieses Wort mitnehmen.

**Grenze 2 (Einwand Mats, 15.08.):** Solange die Kreisligen Demo-Daten sind, zeigt „Platz 3 deiner
Liga" eine Position in einer **erfundenen** Liga. Für die heutigen Testnutzer in echten Ligen ist
das unkritisch; wer die Karte ausrollt, bevor Roadmap 5 erledigt ist, baut den nächsten Fall für
`MUSTER-ZAHLEN`. Demo-Ligen tragen bereits ein `isDemo`-Kennzeichen — die Karte muss es lesen.

### F3 — „Was auf dich wartet" für den Team-Admin

**Nutzer-Moment:** Max kommt nach einer Woche zurück. Zwei Leute warten auf eine Antwort.
[GEMESSEN] Seine Glocke trägt **2 ungelesene `join_request`**. Sein Feed zeigt: „Profilfoto
hochladen."

**Vorhandene Daten:** `getnotifications` (ungelesene, mit Typ), die Zähler der Team-Admin-Tabs, und
die Logik aus `notify-pending-results` für fehlende Ergebnisse. Eine Zeile über dem Feed —
*„2 Beitrittsanfragen · 1 Ergebnis fehlt"*, verlinkt auf die jeweiligen Tab-Anker, die
`lib/notifications.js` bereits kennt (`/team/admin?tab=ergebnisse`).

Das ist mein R3 vom 13.08., jetzt an der Newsfeed-Fläche gemessen statt am Admin-Panel: Die
Checkliste vom ersten Tag steht dort, wo der Stand des eigenen Vereins stehen müsste.
**Kein Druck, keine Farbdramatik, nur wenn > 0.**

**Bedingung von Mats (15.08.), die ich übernehme:** Diese Zeile zahlt nur dann auf Bedarf 4 ein,
wenn sie die Arbeit **verkürzt** — also direkt in die Eingabemaske springt, nicht bloß in den
Bereich. *„Ein Feed, der dem Ehrenamt bloß Aufgaben vorhält, arbeitet gegen Bedarf 4."* Die
Tab-Anker in `lib/notifications.js` (z. B. `/team/admin?tab=ergebnisse`) sind dafür der richtige
Ausgangspunkt; ein Sprung bis auf das konkrete offene Spiel wäre besser.

### F4 — Die Tabelle mit dem Blick des Betrachters (= W5)

Eigene Liga vorausgewählt, eigenes Team markiert, darunter eine Zeile: *„Platz 4 von 6 · 0-3."*
Beides liegt in `/api/teams/standings` bzw. der Liga des eigenen Teams vor. Aus einer
Fremdtabelle wird damit die einzige Tabelle, die den Nutzer betrifft.

### F5 — „Seit deinem letzten Besuch" — ohne neues Feld möglich

Ein `lastSeenAt` gibt es auf `models/Player.js` **nicht** [BELEGT, geprüft]. Es braucht ihn aber
auch nicht: **ungelesene Benachrichtigungen sind bereits die Antwort** auf „was ist passiert,
seit ich weg war" — sie tragen Typ, Text und Ziel. Eine Zeile *„3 neue Dinge seit deinem letzten
Besuch"* mit Auflösung darunter ist aus vorhandenen Daten baubar.
**Nicht** vorschlagen würde ich eine „X Personen haben dein Profil gesehen"-Zeile — das steht auf
meiner Dark-Pattern-Liste und wäre zusätzlich ein Fall für Nora.

### Was ich ausdrücklich NICHT vorschlage

Kein Team-Chat, keine Trainingsverwaltung, kein Live-Ticker (Mats' Nicht-gebraucht-Liste — ich
habe im Durchgang **keinen Moment** gefunden, an dem mir eines davon gefehlt hätte). Keine Serien-
oder Streak-Mechanik. Keine tägliche Zusammenfassungs-Mail ohne Ereignis. Kein endloser Fremd-Feed.
Keine öffentliche Beteiligungszahl. Begründungen stehen unverändert in
`docs/RETENTION-BEFUND-2026-08-13.md` Abschnitt 4.

---

## 6. Der Leerzustand — heute versteckt, morgen der Normalfall

**Was ich gefunden habe [BELEGT, beide Reiter, Konto Sven]:**

| Reiter | Text | Ausweg |
|---|---|---|
| „Folge ich" (leer) | „NOCH NICHTS IN DEINEM FEED — Du folgst noch niemandem – oder es gibt noch keine Beiträge. Entdecke Spieler und folge ihnen!" | **keiner.** `EmptyState` nimmt eine `action`-Eigenschaft entgegen (`components/ui/EmptyState.js`), `PostFeed.js` Zeile 117–125 übergibt sie **nicht**. Der Satz fordert zum Entdecken auf und verlinkt nichts. |
| „Für dich" (leer) | „NOCH KEINE BEITRÄGE — Sei der Erste und teile etwas mit der Community!" | keiner |

Das ist **exakt dasselbe Muster** wie mein R2 (`/tryouts`, „null Links im `<main>`") — eine
geschlossene Tür am Ende einer Suche. Und die Ironie: Das Mittel, das der Text verlangt, steht
zwei Zentimeter weiter oben — **zugeklappt** im Akkordeon „Vorschläge für dich".

**Der wichtigere Punkt:** Der Leerzustand von „Für dich" ist heute auf der Live-Seite **gar nicht
erreichbar**, weil Beispielbeiträge davorstehen — 48 der 50 von mir abgerufenen, und der Bestand
reicht darüber hinaus (`hasMore: true`). Er ist also **nie unter realen Bedingungen
gesehen worden** — und er tritt schlagartig ein, sobald Roadmap-Punkt 2 ausgeführt wird
(`seed-showcase-posts --purge` und die übrigen Demo-Bereinigungen zum Cutover). **[HYPOTHESE,
hohe Sicherheit]** An dem Tag hat die Startfläche jedes eingeloggten Nutzers plötzlich keinen
Inhalt mehr außer der Spieltag-Leiste.

**Der ehrliche Umgang damit** — und die Antwort auf „was steht da an einem Tag, an dem nichts
passiert":

1. **Der Feed darf leer sein.** Ein Amateur-Verein hat unter der Woche nichts zu melden, und eine
   Plattform, die das verschweigt, verkauft ihre eigene Stille als Betrieb. Was **nicht** leer sein
   darf, ist die **Seite** — und dafür sorgen F1 bis F4: eigene Zahlen, eigene Platzierung,
   nächstes Spiel, offene Aufgaben. Das sind Inhalte, die auch dann existieren, wenn niemand postet.
2. **Jeder Leerzustand braucht genau einen Ausweg** (`EmptyState action`): „Folge ich" leer →
   Folge-Vorschläge direkt darunter, nicht im zugeklappten Kasten. „Für dich" leer → der Composer
   steht ohnehin oben; der ehrliche Satz ist „In deiner Liga war diese Woche noch nichts los" mit
   dem Weg zum Spielplan.
3. **Was ein leerer Tag NICHT rechtfertigt:** Fremd-News zur Füllung, Wiedervorlage alter Beiträge
   als „nochmal ansehen", oder eine Benachrichtigung ohne Anlass. Wenn nichts passiert ist, ist
   „diese Woche war nichts los" die richtige Aussage.

**Zuarbeit an Lina:** Punkte 2 und die Checklisten-Höhe aus Abschnitt 3 sind ihre Flächen.

---

## 7. Messvorschlag je Empfehlung — ehrlich, ohne erfundene Zahlen

Grundlage: `AnalyticsEvent` mit `playerId` aus dem Token existiert; heute gibt es genau **fünf**
Ereignisarten (`pageview`, `tour_*`, `checklist_*`, `signup_src`) — Stand meines Befunds vom 13.08.,
Abschnitt 3c. Alles unten braucht neue Handlungs-Ereignisse. **Zuständig ist Ben.**

⚠️ **Ehrlichkeitsgrenze, die über allem steht:** Bei zehn externen Nutzern ist jede dieser
Messungen eine **Beobachtung**, keine Quote. Prozentangaben aus solchen Fallzahlen gehören nicht in
einen Sponsoren-Report. Und **solange interner Verkehr nicht ausgeschlossen ist** (offener Punkt 1
aus meinem 13.08.-Abschnitt 3d), misst jede Feed-Kennzahl zuerst uns selbst.

| Empfehlung | Messfrage | Wie |
|---|---|---|
| **F1** eigene Zahlen im Feed | Öffnen Spieler nach einem Box-Score-Eintrag ihre Spielseite — und über welchen Weg? | Ereignisse `own_stats_card_shown` / `own_stats_card_opened` im Feed, getrennt vom bestehenden Glocken-Weg. Vergleich: Weg über Glocke vs. Weg über Feed. Nebenfrage, die den Fall trägt: Wie viele Spieler erreicht die Nachricht überhaupt? `notifyOwnStats` gibt die Zahl bereits zurück — sie wird heute nirgends festgehalten. |
| **F2** eigene Platzierung | Führt die Zeile im Feed zu Aufrufen von `/topscorer`, die vorher nicht stattfanden? | `rank_card_opened` + Bereichs-Aufrufe „Topscorer" vorher/nachher. ⚠️ Der Vergleich ist erst fair, seit die eigene Liga vorausgewählt ist — vorher maß man Frust. |
| **F3** „Was auf dich wartet" | Enden Team-Admin-Besuche häufiger mit einer erledigten Handlung? | `result_submitted`, `join_request_handled` (beide fehlen bis heute) — Anteil der Sitzungen mit mindestens einer dieser Handlungen, vorher/nachher. |
| **F4/W5** Tabelle mit eigener Liga | Wird die Tabelle überhaupt benutzt, wenn sie die eigene Liga zeigt? | Filter-Wechsel-Ereignis + Klicks auf Vereinszeilen aus dem Widget, vorher/nachher. |
| **W1** RSS entfernen | Verliert die Seite dadurch etwas? | Vorher messen, nicht nachher raten: **Klicks auf RSS-Einträge über zwei Wochen zählen** (`news_item_clicked`). Sind es faktisch null, ist die Entscheidung datengestützt statt Geschmack. **Das ist die einzige Messung, die ich VOR der Umsetzung empfehle.** |
| **W2** Transfer-Widget entfernen | Gehen Transfer-Klicks verloren oder verlagern sie sich? | Getrennte Ereignisse für Widget-Klick und Feed-Post-Klick, zwei Wochen parallel, dann entscheiden. |
| **W4** Checkliste eindampfen | Erreicht der erste Beitrag den ersten Bildschirm — und ändert das die Verweildauer? | Die Höhenmessung aus Abschnitt 3 lässt sich als Test festschreiben (Position des ersten Beitrags < Bildschirmhöhe bei 390×844). Das ist **Kais** Werkzeug, kein Analytics-Fall. |
| **Leerzustand** | Wie oft tritt er ein, und was tun Leute danach? | `feed_empty_shown` (mit Reiter) + nächste Handlung. Wird ab dem Demo-Purge sprunghaft relevant. |

**Was ich NICHT messen würde:** „Verweildauer im Feed" als Erfolgsmaß. Die Kennzahl belohnt genau
das, was wir nicht bauen wollen (endloses Scrollen), und sie ist im heutigen Analytics ohnehin
falsch definiert (Ein-Seiten-Sitzung = 0 Sekunden, `MUSTER-ZAHLEN`, „Offen"). Das ehrliche
Erfolgsmaß eines Feeds ist **abgeschlossene Handlungen je Besuch**, nicht Zeit.

---

## 8. Rückkanal an Mats + Hypothesen-Abgleich

**Pflicht des Tandems.** Startpunkt war seine Bedarfsanalyse; das hier geht an ihn zurück.

**Meine eigene Vorannahme ist widerlegt.** Ich bin — wie im Auftrag formuliert — davon ausgegangen,
der Feed sei im Wesentlichen ein Ereignisprotokoll aus Auto-Posts. Gemessen ist er ein **Archiv
aus Beispieldaten** (Abschnitt 2b). Das ist eine andere Krankheit und braucht eine andere Therapie.

| | Hypothese | Status nach diesem Durchgang |
|---|---|---|
| **H1** | Checklist 4/4 → häufigere Rückkehr | **unverändert instrumentiert, nicht auswertbar.** Neuer Nebenbefund: Die Checkliste kostet mobil 524 px auf der Wiederkehr-Fläche — falls sie Rückkehr fördert, tut sie es zum Preis der Fläche, die Rückkehr belohnen soll. Ein Zielkonflikt, den H1 nicht kennt. |
| **H2** | Profile + Topscorer/Rangliste sind meistbesucht | **von Mats am 15.08. auf „blockiert bis echte Inhalte" hochgestuft.** Am 13.08. war es die Navigation (R7). Heute kommt hinzu: Der Feed konkurriert mit Beispielbeiträgen (48 der 50 abgerufenen), die im Schnitt 24 Likes tragen. Der Vergleich „Feed gegen Profile" misst damit die Anziehungskraft von **Seed-Inhalten**. Mats' Formulierung, schärfer als meine: H2 ist am aktuellen Bestand **gar nicht** prüfbar und gilt erst als messbar, wenn `seed-showcase-posts --purge` gelaufen ist. |
| **H3** | Ergebnis-Quote sinkt über die Saison | **unverändert nicht instrumentiert.** Neuer Beitrag von mir: F1 ist der direkteste Gegenhebel — wenn die Eingabe des Admins sichtbaren Ertrag erzeugt, verändert das die Größe, die H3 misst. Wer F1 baut, sollte H3 **vorher** instrumentieren, sonst ist der Vorher-Zustand verloren. |
| **H4** | Matching wird angesehen, Anfragen bleiben einstellig | **teilbestätigt als Angebotslage** [GEMESSEN]: 6 `transfer_available` und 5 `recruiting` unter 50 Feed-Beiträgen — das Angebot ist im Feed sichtbar. Die Nachfrageseite ist weiterhin nicht gezählt. **Mats ergänzt (15.08.):** Auch dieses Inventar ist teils Seed — dieselbe Verzerrung wie bei H2. |
| **H5** | Registrierungs-Spitzen nach Turnieren | **unberührt.** |
| **H6** | Einladungen laufen über Link/WhatsApp | **unberührt.** |
| **H7** | Echte Kreisliga-Daten → mehr Vervollständigung/Wiederkehr | **Vorbedingung teilweise erfüllt, eine neue kommt hinzu.** R5 ist gebaut (Liga-Filter + eigener Rang auf `/topscorer`) — sehr gut. **Aber:** Auf dem Feed ist die Tabelle weiterhin ligenübergreifend voreingestellt (W5/F4). Und neu: Solange der Feed mit Beispieldaten aus ganz NRW gefüllt ist, kann der „Echte-Liga-Effekt" gegen ein Rauschen aus Demo-Vereinen nicht sichtbar werden. **Die Demo-Bereinigung (Roadmap 2) ist damit nicht nur Kosmetik, sondern Voraussetzung für H7.** |

**Was ich seiner Analyse hinzufüge:** Seine „wird NICHT gebraucht"-Liste bestätige ich zum zweiten
Mal vollständig. Und ich bestätige meine Kernaussage vom 13.08. mit einer Ergänzung: Damals fehlten
**Verbindungen** zwischen Gebautem. Auf dieser einen Fläche fehlt etwas anderes — nicht die
Verbindung, sondern die **Entscheidung, wem die Fläche gehört**. Sieben Kästen zeigen jedem
dasselbe. Der Nutzer, der zurückkommt, will das eine sehen, was ihn betrifft.

**Offener Konflikt für dich, Patrick — nicht stillschweigend aufgelöst:** Mats' Empfehlung 1 lautet
„echte Liga-Daten vor neuen Features". Ich empfehle mit F1/F2 Inhalte, die vor den echten Daten
Wirkung entfalten können, weil sie nur bereits erfasste Zahlen umstellen. Das ist **kein**
Widerspruch in der Sache, aber eine Reihenfolgenfrage, die Ole beantworten sollte, wenn du sie
aufmachst.

---

## 9. Kollegen — wen ich einbezogen habe und warum

- **Mats (marktforscher, Tandem-Pflicht):** Bedarfsanalyse war Startpunkt, Abschnitt 8 ist der
  Rückkanal. **Zusätzlich beauftragt** mit einer Gegenprüfung zu W1 (RSS entfernen), zu F1–F3
  gegen seine Nicht-gebraucht-Liste und zur Verzerrung von H2 durch Seed-Inhalte. Seine Antwort
  ist in Abschnitt 10 nachgetragen.
- **Lina (onboarding-referentin):** **Zuarbeit, nicht beauftragt** — sie hat am 14.08. gerade
  geprüft, ein zweites Browser-Gate wäre Doppelarbeit. Für sie: die Checklisten-Höhe (524 px,
  Abschnitt 3), die beiden Leerzustände ohne `action` (Abschnitt 6) und der zugeklappte
  Vorschlags-Kasten, auf den der Leerzustands-Text ohne Link verweist.
- **Ben (Analytics):** Abschnitt 7 sind seine Messfragen. Vorrang: die RSS-Klickmessung **vor**
  einer Entscheidung, und `result_submitted` / `join_request_handled`, die seit dem 13.08. offen sind.
- **Vivien (Design):** läuft parallel an der Form. Übergabe von mir: **die Reihenfolge** ist eine
  Inhaltsentscheidung (Abschnitt 3/5), die **Anordnung** ihre. Zwei harte Randbedingungen aus der
  Messung: der erste Beitrag gehört mobil auf den ersten Bildschirm, und jede neue Karte mit Zahlen
  muss die vier Beleg-Fälle aus `statsNotify.js` tragen.
- **Nele (Marketing/Texte):** Wortlaute für F1–F4. Besonders F1 — dort entscheidet ein Wort über
  eine Belegaussage. **Zusätzlich auf Mats' Vorschlag:** Sie sollte W1 (RSS) aus Vermarktungssicht
  mitzeichnen — Fremd-News waren nie Teil des Versprechens. Nicht von mir beauftragt, weil die
  Entscheidung an deiner Reihenfolge hängt.
- **Ole (Einsatzplaner):** **relevant, wenn** du F1 vor die echten Kreisliga-Daten stellst
  (Abschnitt 8, offener Konflikt). Ich habe ihn nicht beauftragt, weil die Priorisierung dir gehört.
- **Tobias (QA):** **ein Punkt zur Übergabe, kein Befund von mir:** Max hatte im Dev-Durchgang
  **zweimal dieselbe** `join_request`-Benachrichtigung von Sven Adler [GEMESSEN,
  `getnotifications`]. Das kann ein Seed-Artefakt aus wiederholten Testläufen sein; ich habe es
  nicht weiterverfolgt, weil doppelt testen nicht mein Auftrag ist.
- **Nora (Recht):** **nicht** beauftragt, weil ich keinen Vorschlag mache, der personenbezogene
  Daten neu sichtbar macht. Falls jemand später „wer hat dein Profil angesehen" aufgreift: das
  geht **zuerst** zu ihr, und ich rate ohnehin ab.

---

## 10. Mats' Gegenprüfung (eingegangen 15.08.2026)

Ich gebe seine Antwort verdichtet wieder und kennzeichne, wo er mich korrigiert hat.

**Zu W1 (RSS entfernen) — er widerspricht meiner Begründung, nicht meinem Ziel.**

> „In meiner Recherche vom 09.08. gibt es **keine einzige Äußerung** eines Amateurspielers dazu, ob
> er Profi-News auf seiner Vereinsplattform erwartet, schätzt oder ablehnt. Ich habe danach auch
> nicht gesucht — die Frage stand 09.08. nicht im Auftrag."

Und zur Sache: Seine Nicht-gebraucht-Zeile ziele auf **eigene Redaktion** (Kapazitätsargument), ein
**eingekaufter Fremd-Strom** sei davon „nicht belegt mitabgedeckt". Ich hatte sie als Beleg geführt.
**Das war Überziehung, und ich habe es in Abschnitt 3 und 4 korrigiert.**

Zwei schwache **[INDIZ]en** liefert er ergänzend: FuPas App-Startseite dreht sich laut
Store-Beschreibung um eigenes Team, eigene Ligen, eigene Statistik und Transfers, nicht um
redaktionelles Profi-Beiwerk; handball.net trägt seine Startseite überwiegend mit Amateur- und
Vereinsthemen. Er schränkt selbst ein: Das sind öffentliche Portal-Startseiten, kein eingeloggter
persönlicher Feed — nur bedingt vergleichbar.

**Seine Fassung der Empfehlung, die ich übernehme:** nicht „raus, Punkt", sondern **raus, sobald
personenbezogene Inhalte den Platz füllen** — und die Debatte vorher „mit Daten statt Meinung"
beenden, über die RSS-Klickmessung.

**Zu F1–F3 — kein Konflikt, sondern Kern-Deckung.** Eigene Zahlen decken Bedarf 1 direkt, die
eigene Platzierung Bedarf 1 + 2, die Aufgabenzeile Bedarf 4. Zwei Auflagen, beide oben eingearbeitet:
die Platzierung darf nicht in einer Demo-Liga behauptet werden (F2, Grenze 2), und die Aufgabenzeile
muss Arbeit **verkürzen** statt vorhalten (F3).

**Zum Rückkanal — er bestätigt schärfer als ich formuliert hatte.** H2 stuft er auf „blockiert bis
echte Inhalte", H4 erbt dieselbe Verzerrung. Beides steht in Abschnitt 8.

**Sein Hinweis auf weitere Kollegen:** Nele sollte die RSS-Frage aus Vermarktungssicht mitzeichnen
(„Fremd-News waren nie Teil des Versprechens"), Ole, falls Abschnitt 5 Prioritäten verschiebt.
Beides ist in Abschnitt 9 vermerkt; beauftragt habe ich sie nicht — das gehört zu deiner
Reihenfolge-Entscheidung.

---

## 11. Was ich nicht prüfen konnte — ehrlich

- **Echtes Wiederkehr-Verhalten.** Zehn externe Nutzer. Es gibt keine Retention zu beobachten,
  nur Hürden. Alles hier sind Walkthrough-Befunde.
- **Die eingeloggte Live-Seite.** Nur lesende öffentliche Endpunkte (`/api/posts/feed`,
  `/api/team/fetchteams`, `/api/player/fetchall`). Kein Login, kein Schreibzugriff auf `hoops_prod`.
- **Demo gegen echt im Live-Feed.** Die öffentliche Profil-API gibt `isDemo` **nicht** heraus
  (geprüft: die Felderliste enthält es nicht). Meine Zuordnung der Beitragstexte zu
  `seed-world.mjs` ist deshalb [INDIZ] über Textgleichheit und Vereinsnamen, nicht [BELEGT] über
  die Datenbank. Wer es hart braucht, muss auf dem VPS zählen.
- **Die Doppelung der Transfers im Bild.** Auf der Dev-DB legt `seed-demo.mjs` keine
  Transfer-Auto-Posts an; belegt ist der Code-Pfad, gesehen hast du es auf Prod.
- **Ob `seed-world.mjs` je auf Prod lief.** Siehe die Warnung in Abschnitt 2b — offene Frage, kein
  Urteil.
- **Der Feed unter echter Last.** Das Kandidatenfenster des Rankings liegt bei 500 Beiträgen
  (`CANDIDATE_CAP`); bei einer aktiven Community fallen ältere Beiträge aus „Für dich" heraus.
  Heute unkritisch, später eine Frage.
- **Barrierefreiheit, `prefers-reduced-motion`, Konsolen-/Netzwerkfehler.** Nicht Gegenstand;
  in meinen vier Durchgängen sind keine Konsolenfehler aufgetreten [GEMESSEN], aber das ist
  Tobias' und Kais Feld, nicht meins.

---

*Ronja · 15.08.2026 · Keine Implementierung, kein Commit, kein Versand. Priorisierung: Patrick.*
