# Nutzungs- & Retention-Befund — Hoops Germany

**Ronja (retention-analystin) · 13.08.2026 · Branch `redesign`, lokaler Dev-Server + öffentliche Live-APIs**

**Patricks Auftrag, wörtlich:** „Das oberste Ziel ist es, so viele Kontaktpunkte und Wiederaufrufgründe
auf der Website zu kreieren, um den Sponsoren gute Zahlen nennen zu können." Dazu die Freigabe,
Design und Infrastruktur zu ändern, um Funktionen „harmonischer und sinnhafter miteinander zu
verbinden" — und die ausdrückliche Grenze: keine Dark Patterns, keine aufgeblasenen Zahlen.

**Nichts implementiert, nichts committet.** Dies ist ein Befund; die Reihenfolge entscheidet Patrick.

---

## 0. Spiegelung & Beleg-Status

**Pflicht-Startpunkte gelesen:** `docs/BEDARFSANALYSE-2026-08-09.md` (Mats, Bedarfe 1–5 + H1–H7 +
„wird NICHT gebraucht"), `docs/ZIELGRUPPEN.md` (Nele, Z1–Z5), `CLAUDE.md` Abschnitt 0,
`docs/RONJA-LANDING-2026-08-12.md` (mein eigener Vorbefund), `docs/CHRONIK.md` (Einträge 09.–12.08.).

**Kennzeichnung durchgehend:**
- **[BEOBACHTET]** — im laufenden Produkt oder im Code selbst nachvollzogen, mit Datei/Route.
- **[GEMESSEN]** — Zahl, die ich heute selbst über eine öffentliche API abgerufen habe.
- **[VERMUTET]** — Hypothese aus der Nutzerbrille, jeweils mit Validierungsvorschlag.

**Keine erfundenen Zahlen.** Wo eine Zahl steht, steht die Quelle daneben.

**Wichtige Sprachregelung:** Hoops Germany hat 9 externe Nutzer und 1 externes Team
(`docs/CHRONIK.md`, 12.08.2026). Bei dieser Fallzahl kann ich **keine Retention beobachten** —
nur Hürden dafür. Alles unten sind **Walkthrough-Befunde**, keine Verhaltensdaten.

### Personas + geprüfte Wege

Wie am 12.08. abgeleitet aus Mats' Gruppen (Hoops hat keine benannte Persona-Doku wie HGH):

- **„Max", Team-Admin** (Z2 / Mats 1b) — Dev-Account `max@test.de`, Team-Admin „Test Baskets".
- **„Sven", Spieler ohne Verein** (Z3 / Mats 1c) — Dev-Account `sven.adler@test.de`, `verfuegbar`.

**Tatsächlich gegangene Wege** (lokal, Dev-DB frisch mit `node scripts/seed-demo.mjs`, 375×812):
`/home` → `/player/newsfeed` (beide Personas) · `/spiele` → `/match/[id]` (Box-Score) ·
`/topscorer` · `/ligen/[id]` (Tabelle) · `/player/view-player/[slug]` · `/team/team-detail/[slug]` ·
`/team/admin` · `/transfermarkt` · `/tryouts` (Leerzustand).
Ergänzend Code-Nachvollzug an den Stellen, wo eine Verbindung fehlt (dort jeweils Datei + Zeile).

**Nicht auf der Live-Seite eingeloggt getestet** — nur lesende öffentliche Live-APIs abgefragt
(siehe Abschnitt 3). Begründung: keine Schreibrechte auf `hoops_prod` ohne Anweisung.

---

## 1. Die priorisierte Liste echter Wiederaufrufgründe

Sortiert nach **Hebelwirkung**, nicht nach Bauaufwand — wie beauftragt.

### R1 — Der Spieler erfährt nie, dass seine eigenen Zahlen gelandet sind ⭐ größter Hebel

**Nutzer-Moment:** Sonntagabend. Max hat als Team-Admin den Box-Score von Samstag eingetragen.
Sven — oder irgendein Spieler des Teams — hat 24 Punkte gemacht. Auf seinem Profil steht das jetzt.
**Er wird darüber nicht informiert. Von niemandem. Über keinen Kanal.**

**[BEOBACHTET]** `app/api/team/match-stats/save/route.js` (77 Zeilen) verschickt **keine einzige
Benachrichtigung** — die Datei enthält weder `notifications`, noch `Player.update*`, noch `autoPost`.
Der Spieler, dessen Karriere-Statistik sich gerade geändert hat, erfährt nichts.

Die zweite Hälfte desselben Lochs:
**[BEOBACHTET]** `app/api/team/submit-match-result/route.js` Zeile 104–112 verschickt die
`match_result`-Benachrichtigung ausschließlich an **Follower beider Teams**
(`for (const team of [tA, tB]) { for (const fid of team.followers || []) … }`).
Die **Spieler im Box-Score bekommen sie nicht** — es sei denn, sie folgen zufällig ihrem eigenen
Verein. Und ein Beitritt legt kein Follow an (in `app/api/team/join-team/route.js`,
`handlejoinrequest`, `roster/approve-claim` kommt `followers` nicht vor).
Der Text der Benachrichtigung ist außerdem nur die Ergebniszeile („Test Baskets 78:65 Munich Hoops"),
nie „deine 24 Punkte".

**Warum das der größte Hebel ist:** Mats' Bedarf 1 („eigene Stats, kostenlos, ohne Frust") und Neles
Hook („jeder will seine Stats", Z1) sind identisch — das ist das Kernmotiv der Kernzielgruppe.
Das Produkt erfüllt es als **Bringschuld des Nutzers**: er muss von selbst nachschauen kommen.
Das Ereignis, das er eindeutig will, existiert bereits in den Daten und wird nicht ausgeliefert.
Es ist der ehrlichste denkbare Wiederaufrufgrund: der Nutzer bekommt genau das, wofür er
sich registriert hat, in dem Moment, in dem es entsteht.

**Zweiter Effekt — direkt auf Mats' Bedarf 4:** Die Doppelerfassung durch den Team-Admin ist heute
eine Arbeit ohne sichtbaren Ertrag. Wenn die Eingabe fünf Spielern eine Nachricht auslöst, wird aus
„noch eine Pflicht" ein „mein Team freut sich". Das ist die Antwort auf die Ehrenamts-Müdigkeit,
die Mats' Analyse nicht hatte: nicht nur *kürzer* machen, sondern **sichtbar belohnen**.

**Aufwand grob:** klein bis mittel. Die Empfängerliste (`match.playerStats[].player`) und die
Benachrichtigungs-Infrastruktur (`Player.notifications`, `lib/notifications.js`, `NotificationBell`)
existieren beide. Ein neuer Typ `own_stats` mit Ziel `/match/[id]`, plus Mail-Vorlage in
`lib/emailTemplates.js` analog `pendingResultEmail` **inklusive Opt-out** (Muster
`emailPendingResult` ist da).

**Messung:** neues Ereignis `own_stats_notified` (Server, beim Versand) + `own_stats_opened`
(Klick). Erfolgsfrage: *Wie viele Spieler öffnen binnen 72 h nach Box-Score-Eintrag ihr Profil oder
die Spielseite — vorher gegen nachher?* Auswertbar mit der vorhandenen `playerId`-Zuordnung in
`AnalyticsEvent`. Ehrlichkeitsgrenze: bei 9 externen Nutzern ist das eine Beobachtung, keine Quote.

---

### R2 — Der Leerzustand von `/tryouts` ist eine geschlossene Tür

**Nutzer-Moment:** Sven sucht ein Team. Er geht auf Tryouts. Da steht:

> AKTUELL SIND KEINE TRYOUTS AUSGESCHRIEBEN.

**[BEOBACHTET]** `/tryouts`, 375×812, eingeloggt: der `<main>`-Bereich enthält **null Links**
(per DOM ausgelesen: `[...document.querySelectorAll('main a')]` → leeres Array). Kein Weg zum
Transfermarkt, kein „sag mir Bescheid", kein „Verein? Schreib eins aus". Ende der Reise.

Zum Vergleich: `/transfermarkt` macht es richtig — dort steht „Auf der Suche nach einem Team?
Schau auch bei offenen Probetrainings vorbei → Probetrainings ansehen" **[BEOBACHTET]**.
Die Verlinkung ist also nur **einseitig** gebaut.

**Warum das wehtut:** `docs/ZIELGRUPPEN.md` sagt über Z3 wörtlich: „Wer zweimal nichts findet, kommt
nicht wieder." Genau dieser Nutzer steht hier vor einer leeren Seite ohne Ausgang. Und Mats' H4 sagt
voraus, dass das Inventar noch lange klein bleibt — der Leerzustand ist also nicht die Ausnahme,
sondern für Monate der **Normalfall** dieser Seite.

**Der ehrliche Hebel:** Ein opt-in „Benachrichtige mich" am Leerzustand — Umkreis + Position, aus
dem Profil vorbelegt. Das ist kein Köder, sondern die wörtliche Erfüllung dessen, wofür der Nutzer
gerade gekommen ist: er hat aktiv gesucht und nichts gefunden. Dazu zwei Auswege im selben Kasten
(Transfermarkt; für Team-Admins „Tryout ausschreiben").
Nebeneffekt: Diese Anmeldungen sind das erste echte **Nachfrage-Signal** für Mats' H4 — heute
zählt die Plattform nur das Angebot (`transferAvailable`, `recruitingTeams` in
`lib/analyticsSummary.js`), nie die Nachfrage.

**Aufwand grob:** mittel (kleines Modell + Trigger beim Anlegen eines Tryouts + Mail-Vorlage).
Der reine Ausweg-Link ist trivial und sollte nicht darauf warten.

**Messung:** Anzahl Anmeldungen je Umkreis/Position (das ist selbst die Kennzahl), plus
*Anteil der Benachrichtigten, die das passende Tryout öffnen*.

---

### R3 — Der Team-Admin sieht beim Wiedereinstieg nicht, was zu tun ist

**Nutzer-Moment:** Max kommt nach einer Woche zurück. Er landet auf `/player/newsfeed`, oben steht
eine **Onboarding-Checkliste** („3 von 4 erledigt · Profilfoto hochladen") **[BEOBACHTET, Screenshot
375×812]** — also eine Aufgabe von seinem *ersten* Tag. Kein Wort über offene Beitrittsanfragen,
kein fehlendes Ergebnis, kein nächstes Spiel.

Geht er nach `/team/admin`, öffnet die Seite auf dem Kader-Tab. Die Tab-Leiste lautet
**[BEOBACHTET]**: „Kader · Anfragen · Spielplan · Ergebnisse · Tryouts · Einstellungen" —
**ohne eine einzige Zahl.** Ob unter „Anfragen" jemand wartet und ob unter „Ergebnisse" etwas fehlt,
erfährt er nur, indem er beide Tabs anklickt.

**Der ehrliche Hebel:** Zähler-Abzeichen an den Tabs (nur wenn >0) und eine einzeilige
„Zu erledigen"-Zeile über der Leiste. Kein Druck, keine Farbdramatik — nur die Wahrheit, die die
Seite ohnehin schon kennt. Dasselbe gehört an die Stelle, an der heute die Onboarding-Checkliste
steht: sobald sie erledigt ist, sollte dort **der Status des eigenen Teams** stehen, nicht nichts.
(Das ist meine Beobachtung O3 vom 12.08., hier am Team-Admin-Panel bestätigt.)

**Aufwand grob:** klein. Die Zahlen liegen bereits in den APIs, die die Tabs füttern.

**Messung:** *Anteil der Team-Admin-Besuche, die mit einer abgeschlossenen Handlung enden*
(Ergebnis eingereicht, Anfrage bearbeitet) — vorher gegen nachher. Braucht zwei neue Ereignisse
(`result_submitted`, `join_request_handled`), die heute fehlen (Abschnitt 3).

---

### R4 — Weder Topscorer noch Rangliste wissen, wer sie ansieht

**[BEOBACHTET]** `app/topscorer/page.js` (178 Zeilen) und `app/rangliste/page.js` (257 Zeilen)
enthalten **kein** `getStoredPlayer`, kein `viewerId`, keine Hervorhebung. Es sind reine anonyme
Tabellen. Max steht in der geseedeten Liste auf Platz 1 — die Seite sagt es ihm nicht.

**Der ehrliche Hebel:** eigene Zeile markieren, plus eine Zeile darüber: „Du bist Platz 9 —
4 Punkte hinter Platz 8." Das ist keine erfundene Verknappung, sondern eine Tatsache aus Daten, die
schon auf dem Bildschirm stehen. Es ist der klassische FuPa-Motor (Sichtbarkeit → Datenpflege), den
Mats als **belegte** Lektion führt.

**Aufwand grob:** klein.

**Messung:** *Wiederkehr-Rate auf `/topscorer` je eingeloggtem Nutzer* (Ereignisse mit `playerId`
liegen vor) — aber siehe die Sperre in R5, ohne die diese Messung schief steht.

---

### R5 — „Topscorer meiner Liga" gibt es nicht

**[BEOBACHTET]** `app/api/player/topscorer/route.js` akzeptiert genau einen Filter: `body.season`
(Zeile 11). **Keinen `leagueId`.** Es gibt also nur eine **globale** Bestenliste über alle Ligen.

Für einen Kreisliga-Spieler bedeutet das: er wird gegen Regionalliga-Spieler sortiert und steht
strukturell unten. Genau die Zahl, die ihn zurückholen soll, demotiviert ihn. Das ist keine
Verbindungs-, sondern eine echte **Funktionslücke** — und sie untergräbt Mats' Bedarf 1 und Neles
Z1-Motiv an der empfindlichsten Stelle.

**Der ehrliche Hebel:** Liga-Filter in API und Seite, und der Standard für eingeloggte Nutzer ist
**seine** Liga. „Platz 3 der 1. Kreisliga Niers" ist eine Aussage, die ein Mensch seinem Team
schickt. „Platz 214 von allen" ist keine.

**Aufwand grob:** klein bis mittel (Filter analog zur vorhandenen `season`-Logik).

**Messung:** *Anteil der Topscorer-Aufrufe mit gesetztem Liga-Filter* + Wiederkehr wie R4.
Zusätzlich der Vergleich, den Mats für H7 braucht: echte Liga gegen Demo-Region.

---

### R6 — Es gibt für Spieler überhaupt keinen Rückholkanal

**[BEOBACHTET]** Suche über `app/`, `components/`, `lib/` nach `serviceWorker`, `PushManager`,
`webpush`, `Notification.requestPermission` → **null Treffer**. Die PWA (`/installieren`) ist
reine Installation, kein Push. Es gibt keinen Service Worker.

Damit sind die einzigen ausgehenden Kanäle: **E-Mail** und die **Glocke in der App** (die man nur
sieht, wenn man ohnehin schon da ist). Und die einzige *geplante* Mail ist
`app/api/admin/notify-pending-results/route.js` — sie geht ausschließlich an **Team-Admins**.

**Folge:** Für Z1, die Kernzielgruppe, existiert **kein einziger** ausgehender Wiederaufrufgrund.
Alles ist Hol-, nichts ist Bringschuld. Das ist die strukturelle Ursache hinter R1.

Positiv und ausdrücklich zu erhalten **[BEOBACHTET]**: die Pending-Result-Mail ist sauber gebaut —
In-App-Benachrichtigung immer, Mail **nur** bei `a.emailPendingResult !== false`. Das Opt-out ist
schon da. Genau dieses Muster gehört auf R1 kopiert.

**Aufwand grob:** E-Mail-Weg für R1 klein (Infrastruktur steht). Web-Push eigenständig und deutlich
größer — meine Empfehlung ist, es **nicht** vorzuziehen: erst muss es überhaupt eine Nachricht
geben, die den Namen wert ist.

---

### R7 — `/rangliste` ist gebaut, aber praktisch unerreichbar

**[BEOBACHTET]** Die einzige Verlinkung auf `/rangliste` im gesamten Projekt steht in
`components/feed/TopTeamsWidget.js` Zeile 140 — also in der Seitenspalte des **eingeloggten**
Newsfeeds. Die Navigationslisten enthalten sie nicht:
`components/layout/Navbar.js` Zeilen 40–46 (Ligen, Spiele, Teams, Spieler, Transfermarkt, Tryouts,
Topscorer), `components/layout/PlayerNav.js` Zeilen 17–23, `components/layout/Footer.js` Zeilen 5–11.

Ein ausgeloggter Besucher kann die Rangliste **gar nicht finden**. 257 Zeilen fertiges Produkt.

**Nebenwirkung auf die Zahlen:** `lib/analyticsSummary.js` Zeile 32 hat bereits einen Bereichs-Eimer
„Rangliste". Der wird dauerhaft nahe null anzeigen — und diese Null würde als „interessiert
niemanden" gelesen, obwohl sie „man kommt da nicht hin" bedeutet. Genau die Sorte Fehlschluss, vor
der ich warne.

Gleiche Kategorie, kleiner: **`/installieren`** steht nur im Footer (Zeile 5) — nicht in der Navbar,
nicht in der PlayerNav — und hat **[BEOBACHTET]** in `sectionExpr` (`lib/analyticsSummary.js`
Zeilen 19–41) keinen eigenen Zweig, fällt also unter „Sonstiges". Die Seite, die am direktesten auf
Wiederkehr einzahlt (Symbol auf dem Startbildschirm), ist versteckt **und** unsichtbar in der Messung.

**Aufwand grob:** sehr klein.

**Messung:** Bereichs-Aufrufe „Rangliste" vorher/nachher; `/installieren` als eigener Zweig
im `$switch` (das ist ohnehin ein offener Punkt aus dem Skill-Review vom 09.08.).

---

### R8 — Die Suche kennt keine Ligen

**[BEOBACHTET]** `components/layout/Navbar.js` Zeile 57: `searchData` ist `{players, teams}`.
Gefiltert wird über beide (Zeilen 182–186). **Ligen, Spiele und Tryouts sind nicht suchbar.**

Der Weg „schnell etwas nachschlagen" — eine der drei Standard-Wiederkehr-Situationen — ist damit
für die wichtigste Frage überhaupt („was macht meine Liga?") nicht bedienbar. Und „meine echte Liga
ist drin" ist laut Mats Bedarf 2 und laut Nele das zentrale Werbeversprechen.

**Aufwand grob:** klein (Ligen zur Suchquelle ergänzen).

---

## 2. Die unverbundenen Kontaktpunkte — konkret

Alle **[BEOBACHTET]** im laufenden Dev-Server, mit Datei/Route. Das ist die Liste, die Patricks
Formulierung „harmonischer und sinnhafter miteinander verbinden" wörtlich beantwortet — und es sind
die billigsten Wiederaufrufgründe, die es gibt, weil das Ziel jeweils schon existiert.

| # | Wo endet es | Was direkt daneben läge | Datei / Route |
|---|---|---|---|
| **K1** | `/match/[id]`: nach dem Box-Score gibt es nur zwei Teamlinks und Spielerlinks. Die Liga-Zeile im Kopf („REGIONALLIGA SÜD · 2025/26") ist **reiner Text**. | Die Frage nach jedem Ergebnis ist „und wo stehen wir jetzt?". Ein Klick auf `/ligen/[leagueId]`. Dazu: nächstes Spiel dieser Teams. | `app/match/[id]/page.js` Zeile ~239 (Liga-Name ohne `<Link>`) |
| **K2** | `/ligen/[id]`: zeigt **nur** die Tabelle. Kein Spielplan, kein Topscorer, kein Rückweg zu `/ligen`. | Spielplan und Topscorer **dieser** Liga. Beide Datenquellen existieren. | `app/ligen/[id]/page.js` |
| **K3** | `/spiele` kann nach Liga filtern — aber nur als Client-Zustand. `useSearchParams` kommt in der Datei **nicht** vor, `/spiele?league=…` tut nichts. | Ohne diesen Parameter ist K2 technisch gar nicht verlinkbar. Das ist die Voraussetzung für K1 und K2. | `app/spiele/page.js` Zeile 155 (`useState("")`) |
| **K4** | `/topscorer`: Spielernamen sind Links, **Teamnamen sind Text**. Kein Liga-Filter, kein Weg zur Rangliste, keine eigene Zeile. | Team verlinken, Liga filtern (R5), eigene Position zeigen (R4). | `app/topscorer/page.js` Zeile 143 (nur Spieler-Link) |
| **K5** | `/tryouts` im Leerzustand: **null Links im `<main>`**. | Transfermarkt, „benachrichtige mich", „Tryout ausschreiben" (R2). | `app/tryouts/page.js` |
| **K6** | Spielerprofil-Historie: die Station verlinkt das **Team**, aber die Zeile „Regionalliga Süd · 2025/26" daneben verlinkt die Liga nicht. | Ein Klick von „da habe ich gespielt" zur Tabelle dieser Saison. | `app/player/view-player/[slug]/page.js` / `components/player/PlayerProfileView.js` |
| **K7** | Spielerprofil zeigt **kein nächstes Spiel**, obwohl das Team eins hat. | Der konkreteste Wiederkehr-Anker, den ein Spieler hat. | dito |
| **K8** | `/rangliste` aus der Navigation nicht erreichbar (R7). | Navbar/PlayerNav-Eintrag. | `components/layout/Navbar.js` 40–46, `PlayerNav.js` 17–23 |
| **K9** | `/transfermarkt` → `/tryouts` ist verlinkt, **`/tryouts` → `/transfermarkt` nicht**. | Rückrichtung. | `app/tryouts/page.js` |
| **K10** | Team-Beitritt legt kein Follow auf das eigene Team an → keine `match_result`-Nachricht (siehe R1). | Beim Beitritt automatisch dem eigenen Verein folgen (mit sichtbarer Abschaltmöglichkeit). | `app/api/team/join-team/route.js`, `handlejoinrequest`, `roster/approve-claim` |

### Ausdrücklich **nicht** kaputt — damit niemand dort aufräumt

- **Benachrichtigungen sind sauber verbunden.** `lib/notifications.js` bildet 15 Typen auf konkrete
  Ziele ab, inklusive Tab-Anker (`/team/admin?tab=ergebnisse`). Und
  `app/api/player/fetchsingleplayerinfo/route.js` Zeile 25 hat einen ObjectId-Fallback, so dass
  auch der Follow-Link (`/player/view-player/<ObjectId>`) trägt. **[BEOBACHTET]** Das ist gut gebaut.
  *Kleine Messfolge:* Profilaufrufe über diesen ID-Weg fallen aus der Auswertung „Beliebteste
  Inhalte" heraus, weil `lib/analyticsSummary.js` Zeile 253 nur über `slug` nachschlägt und
  unauflösbare Treffer wegfiltert.
- **Der Beleg-Satz steht sehr wohl im nutzersichtbaren Text.** `CLAUDE.md` Abschnitt 0 vermerkt als
  Lücke, das Argument stehe „nirgends im nutzersichtbaren Text". Das ist **überholt**
  **[BEOBACHTET, fünf Stellen]**: Landing-Szene 3 („Beide Teams tragen ihr Ergebnis unabhängig ein
  – erst wenn sie übereinstimmen, ist es bestätigt", `components/landing/LandingFeatures.js`
  Zeile 58), Landing-Szene 1 (Zeile 42), „So funktioniert's" (`LandingHowItWorks.js` Zeile 69,
  „bestätigt statt behauptet"), Spielerprofil-Karrierepanel („Zählt erst, wenn beide Teams das
  Ergebnis eintragen und es übereinstimmt"), `/topscorer` („bestätigte Spiele"), `/ligen/[id]`
  („Tabelle aus bestätigten Ergebnissen"), und auf `/match/[id]` das Abzeichen „Von beiden Teams
  bestätigt". Letzteres ist besonders sorgfältig gebaut: es hängt an
  `!!teamAResult.submittedBy && !!teamBResult.submittedBy`, **nicht** an `resultStatus`, damit ein
  vom Super-Admin nachgetragenes Ergebnis nicht fälschlich als doppelt bestätigt erscheint
  (`app/match/[id]/page.js` Zeilen 164–178, Befund Kai). Das ist die ehrlichste Stelle im ganzen
  Projekt — bitte so lassen. **→ Der Eintrag in `CLAUDE.md` sollte korrigiert werden.**

**Ist die Belegbarkeit ein Retentions-Hebel? Meine Antwort: als Regel nein, als Ereignis ja.**
Der Satz steht überall — er ist eine *Zusage*. Was fehlt, ist die *Einlösung* als erlebbarer Moment:
niemand sagt dem Spieler je „dein Ergebnis von Samstag ist jetzt von beiden Teams bestätigt".
Genau das ist R1. Die Positionierung ist also nicht als Text unterversorgt, sondern als **Erlebnis**.

---

## 3. Was man einem Sponsor heute ehrlich sagen kann

Geprüft: `app/api/analytics/summary/route.js` (nur Wrapper), die eigentliche Logik in
`lib/analyticsSummary.js`, `app/admin/analytics/page.js`, `components/admin/SponsorReportView.js`
(das ist das Blatt, das **aus dem Haus geht**) und `app/api/analytics/track/route.js`.

### 3a. Der eine Befund, der vor allen anderen kommt

**Der Sponsoren-Report zeigt die ungefilterten Gesamtzahlen — inklusive aller Beispieldaten.**

**[BEOBACHTET]** `components/admin/SponsorReportView.js` Zeilen 161–164, Abschnitt „Plattform-Stärke":

```
<Kpi label="Registrierte Nutzer" value={p.users.total} … />
<Kpi label="Teams / Vereine"     value={p.teams.total} … />
<Kpi label="Offizielle Ligen"    value={p.leagues.total} />
<Kpi label="Spiele"              value={p.matches.total} … />
```

`p.users.total` und `p.teams.total` stammen aus `entityStats(Player, …)` bzw. `entityStats(Team, …)`
**ohne Basisfilter** (`lib/analyticsSummary.js` Zeilen 134–136) — also `countDocuments({})`.
Die dafür eigens gebaute Datei **`lib/echteZahlen.js`** (`NUR_ECHT`, `NUR_ECHTE_TEAMS`) wird nur für
`externeUsers`/`externeTeams` benutzt (Zeilen 139–140), und **die stehen im Sponsoren-Report nicht**.
Sie stehen nur im internen Admin-Dashboard (`app/admin/analytics/page.js` Zeile 318).

**Was das konkret heißt — heute über die öffentlichen Live-APIs abgefragt [GEMESSEN, 13.08.2026]:**

| Kennzahl | Was der Report druckt | Was wahr ist |
|---|---|---|
| Teams / Vereine | **mindestens 70** (`POST /api/team/fetchteams` liefert 70 Teams, davon **68 mit `isDemo: true`**) | **1 externes Team** (`docs/CHRONIK.md`, 12.08.2026) |
| Registrierte Nutzer | **mindestens 410** (`POST /api/player/fetchall` liefert 410 Profile) | **9 externe Nutzer**, davon faktisch 5 aus der Community (`docs/CHRONIK.md`, 12.08.2026) |
| Spiele | alle Demo-Spiele mitgezählt — `entityStats(Match, …)` hat **gar keinen** Demo-Filter, und `scripts/backfill-demo-flags.mjs` deckt nur `teams`, `players`, `leagues` ab | unbekannt, aber sehr klein |

Das ist ein Faktor von rund **45** bei den Nutzern und **70** bei den Teams. Diese Zahlen halten der
Frage „wie zählen Sie das?" nicht eine Sekunde stand — und der Kandidat ist laut
`docs/ZIELGRUPPEN.md` Z5 der **Vater eines Spielers**, im **persönlichen Gespräch**. Der schaut sich
`/teams` an, sieht „Aachen Aces", „Bergisch Ballers", „Bielefeld Blazers" mit dem Abzeichen
„BEISPIELDATEN" — und hat die Antwort selbst.

**Der teure Teil ist nicht die Zahl, sondern was danach passiert.** Ein Gesprächspartner, der eine
aufgeblasene Zahl entdeckt, glaubt anschließend auch der kleinen, ehrlichen nicht mehr. Neles Notiz
in Z5 sagt dasselbe: „erfundene oder aufgeblasene Reichweite fällt in einem persönlichen Gespräch
sofort auf".

**Empfehlung:** `SponsorReportView` auf `externeUsers`/`externeTeams` umstellen, für Spiele einen
`isDemo`-Filter ergänzen (Backfill auf `matches` erweitern), und die Beschriftung präzisieren.
Solange die Zahlen einstellig sind, ist die ehrliche Antwort ohnehin nicht die Zahl, sondern der
Satz: *„Wir sind in der Testphase, Stand heute X Vereine. Was Sie kaufen, ist nicht heutige
Reichweite, sondern Founding-Partner-Position."* Das steht so bereits im Sponsoren-Deck.

### 3b. Kennzahl für Kennzahl: was trägt, was nicht

| Kennzahl | Hält „wie zählen Sie das?" stand? |
|---|---|
| **Seitenaufrufe** (`reach.views`) | **Teilweise.** Ehrlich gezählt (`AnalyticsTracker`, ein Ereignis je Routenwechsel, `/admin` und `/sponsor-report` ausgenommen). **Aber: eigener Traffic wird mitgezählt.** Es gibt keine Ausnahme für Patrick, Jonatan, Tester oder Entwicklungs-Sitzungen auf `/`, `/ligen`, `/teams`. Bei 9 externen Nutzern dominiert die interne Nutzung diese Zahl mit hoher Wahrscheinlichkeit — das ist **[VERMUTET]**, aber trivial prüfbar (siehe unten). |
| **Besucher** (`reach.visitors`) | **Nein, nicht unter diesem Wort.** `sessionId` ist eine **dauerhafte UUID im localStorage** (`components/AnalyticsTracker.js` Zeilen 7–17), die nie abläuft. „Besucher" heißt also **Browser-Profile**, nicht Menschen: derselbe Mensch auf Handy und Laptop = 2; wer den Speicher leert oder privat surft = jedes Mal neu. Das ist branchenüblich, aber das Wort „Besucher" verspricht mehr. Ehrlicher: „Geräte/Browser". |
| **Neue / Wiederkehrende Besucher** | **Definition ist sauber** (neu = erstes Ereignis fällt in den Zeitraum, `lib/analyticsSummary.js` Zeilen 102–107). Erbt aber beide Schwächen von oben — und „wiederkehrend" ist mit interner Nutzung besonders leicht selbst erzeugt. |
| **Aktive Nutzer (7T/30T)** | **Die belastbarste Zahl im ganzen Report** — echte `playerId`-Zuordnung aus dem Token, kein Ratespiel. **Ein Makel:** `NUR_ECHT` wird hier **nicht** angewandt (Zeilen 108–109), interne und Demo-Konten zählen also mit, sobald sie eingeloggt sind. Mit diesem Filter wäre es die Zahl, die ich einem Sponsoren-Gespräch zugrunde legen würde. |
| **Ø Sitzungsdauer** | **Nein — wird garantiert missverstanden.** Berechnet als Abstand vom ersten zum letzten Seitenaufruf einer Sitzung (Zeilen 237–243). Wer **eine** Seite drei Minuten liest und geht, zählt als **0 Sekunden**. Die Zahl ist also systematisch zu niedrig und misst nicht „Verweildauer", sondern „Zeit zwischen erstem und letztem Klick". Ein Sponsor liest „2 min 10 s" als Aufmerksamkeit. Zwei verschiedene Dinge. |
| **Sitzungen** vs. **Besucher** | Zwei unterschiedliche Definitionen mit ähnlich klingenden Namen im **selben Kasten** des Reports (Zeilen 102 und 106): „Sitzungen" wird über 30-Minuten-Lücken gebildet, „Besucher" über dauerhafte IDs. Erklärungsbedürftig. |
| **Offizielle Ligen: 57** | **Formal wahr, im Gespräch irreführend.** `League.countDocuments({official: true})` zählt den **Katalog**. Nele hat am 12.08. belegt: **3** davon haben echte Teams. „57 Ligen" klingt nach Abdeckung, ist aber eine Datei. |
| **Beliebteste Inhalte** (Top-Spieler / Teams / Ligen, namentlich) | **Nein.** Der Report druckt Namen. Bei heutiger Datenlage sind das ganz überwiegend Demo-Profile — ein Sponsor bekommt „Aachen Aces" als beliebtesten Verein präsentiert. Kein `isDemo`-Filter an dieser Stelle. |
| **Geräte / Regionen** | **Tragfähig als Struktur**, nicht als Menge. Gerätetyp kommt serverseitig aus dem User-Agent — sauber. Aber „Nutzer nach Bundesland" (`region.usersByState`) zieht aus **allen** Spielerprofilen, inklusive Demo. |
| **Werbemöglichkeiten** (6 Flächen) | **Werden angeboten, aber nicht gemessen.** `SponsorReportView` Zeilen 12–19 listet sechs Werbeflächen. Es gibt **keinerlei** Einblendungs- oder Klick-Erfassung (Roadmap #4, bewusst zurückgestellt). Auf die Frage „wie viele Einblendungen bekomme ich?" hat heute keine Zahl im Report eine Antwort. |

### 3c. Was gemessen wird — vollständig

**[BEOBACHTET]** Es gibt in der gesamten Anwendung genau **fünf** Ereignisarten:

- `pageview` — `components/AnalyticsTracker.js`
- `tour_completed` / `tour_skipped` — `components/onboarding/WelcomeTour.js` Zeile 91
- `checklist_step_done` / `checklist_dismissed` — `components/onboarding/OnboardingChecklist.js` Zeilen 97, 119
- `signup_src` — serverseitig, `app/api/player/playerregister/route.js` Zeile 64

Sonst nichts. (`grep -rn "trackEvent(" app/ components/ lib/` → drei Fundstellen, alle oben.)

**Es gibt kein Ereignis für:** Registrierung abgeschlossen, Login, Beitrag erstellt, Like,
Kommentar, Follow, Team beigetreten, **Ergebnis eingereicht**, **Ergebnis bestätigt**,
Tryout-Bewerbung, Transfer-Direktanfrage, Werbeeinblendung, Werbeklick.

Damit ist die Frage „was **tun** die Leute eigentlich?" heute nur über Seitenaufrufe beantwortbar —
und genau die sind die anfechtbarste Kennzahl.

### 3d. Was instrumentiert werden müsste — nach Nutzen sortiert

1. **Internen Verkehr ausschließen** (klein, größte Wirkung auf die Glaubwürdigkeit).
   Beim `pageview` mitschicken, ob der eingeloggte Nutzer `isInternal` ist, und im Dashboard
   „intern / extern" trennbar machen. Ohne das ist **jede** Reichweitenzahl heute vom eigenen Team
   dominiert. Zusatznutzen: die Vermutung wird sofort zur Messung.
2. **`NUR_ECHT` auf `activeUsers` und `region` anwenden**, `SponsorReportView` auf
   `externeUsers`/`externeTeams` umstellen, Demo-Filter für `matches` (Backfill erweitern).
3. **Handlungs-Ereignisse** statt nur Seitenaufrufe: `result_submitted`, `result_confirmed`,
   `join_request_handled`, `tryout_applied`, `transfer_inquiry`, `post_created`, `follow`.
   Das ist die Grundlage für die Aussage, die einen Sponsor wirklich interessiert:
   **nicht** „X Aufrufe", sondern *„Y Vereine pflegen ihre Ergebnisse regelmäßig"*.
4. **Ehrliche Verweildauer**: Sitzungen mit einem Aufruf entweder ausweisen oder ausschließen; die
   Kennzahl umbenennen in „Zeit zwischen erstem und letztem Aufruf".
5. **`/installieren` als eigener Bereich** im `$switch` (offener Punkt seit 09.08.) — und die
   Installationsrate als Kennzahl, denn sie sagt mehr über Wiederkehr aus als jede Aufrufzahl.
6. **Erst wenn Monetarisierung freigegeben ist**: Einblendungs-/Klick-Erfassung je Werbefläche
   (Roadmap #4). Solange die nicht existiert, sollte der Report die sechs Flächen als
   *geplant* kennzeichnen, nicht als Produkt.

**Zuständig:** Ben (Analytics). Ich liefere die Messfragen, er die Umsetzung.

---

## 4. Die Nicht-bauen-Liste

Patricks Satz „so viele Kontaktpunkte wie möglich" ist die Formulierung, aus der Dark Patterns
entstehen. Damit die Grenze dokumentiert ist und nicht nur gedacht — das sind die Varianten, die
mir bei diesem Produkt konkret einfallen würden und die wir **nicht** bauen:

| Nicht bauen | Warum | Die ehrliche Alternative |
|---|---|---|
| **Serien-/Streak-Mechanik** („Du warst 5 Tage nicht da", „Serie in Gefahr") | Erzeugt Rückkehr durch Verlustangst, ohne dem Nutzer etwas zu geben. Basketball hat einen echten Rhythmus — den kann man nicht durch einen Zähler ersetzen. | Der echte Rhythmus **ist** der Anlass: Spiel am Samstag, Ergebnis am Sonntag, Tabelle am Montag. R1 liefert genau das. |
| **Tägliche Zusammenfassungs-Mail ohne Ereignis** | Spam. Eine Mail, die schreibt „heute ist nichts passiert", verbrennt den Kanal für die eine Mail, die zählt. | Nur bei echtem Ereignis senden — und dieses Ereignis benennen. Muster: `notify-pending-results`. |
| **„7 Personen haben dein Profil angesehen"** (ohne Namen) | Reiner Neugier-Köder, klassisch aus dem Netzwerk-Playbook. Der Nutzer klickt und erfährt nichts. | Wenn es zählbar ist, dann **mit** Namen und nur bei echtem Interesse: „Der TV Musterstadt hat dein Profil geöffnet." Sonst gar nicht. |
| **Künstliche Verknappung** („nur noch 2 Kaderplätze", „Tryout füllt sich schnell") | Erfundener Zeitdruck bei einem Produkt, dessen Kaderplätze real und unspektakulär sind. | Echte Fristen zeigen, wenn es sie gibt (Tryout-Datum). Sonst nichts. |
| **Fremd-News-Strom ausbauen, um Sitzungsdauer zu strecken** | Der RSS-Block ist ein netter Zusatz. Als endloser Fluss macht er aus Hoops eine Nachrichtenseite ohne eigene Substanz — und Mats' Analyse führt „News-Redaktion / Content-Portal" ausdrücklich unter „wird NICHT gebraucht". | Auto-Beiträge aus echten Ereignissen (existieren, `lib/autoPost.js`). Die sind eigene Substanz. |
| **Öffentliche Beteiligungszahl auf der Startseite** („schon 410 Spieler dabei") | Wäre heute schlicht falsch (siehe 3a) und würde beim ersten Nachrechnen auffliegen. Neles Schwelle liegt bei 20–25 **externen** Vereinen. | Pionier-Rahmung: „trag dein Team als Erster ein" — die steht so bereits in `ZIELGRUPPEN.md` Z1. |
| **Anmeldezwang für Inhalte, die heute öffentlich sind** | Würde Aufrufzahlen in Registrierungen umlenken und wie Wachstum aussehen. Zerstört aber genau den Beleg-Nutzen („der Verein muss dir nicht glauben" — der Verein muss die Seite ohne Konto sehen können). | Öffentlich lassen. Das ist ein Verkaufsargument, kein Leck. |
| **Benachrichtigung an alle Follower bei jedem Mini-Ereignis** | Die Follower-Benachrichtigung ist heute knapp und richtig dosiert. Aufgeweitet wird sie zu Rauschen und die Glocke verliert ihre Bedeutung. | Pro Ereignisart entscheiden: wer hat davon konkret etwas? Bei R1 sind das die Spieler des Spiels — nicht „alle". |
| **Abmelde-Hürden bei den Mails** | Existieren heute **nicht** (`emailPendingResult`-Opt-out ist da). Das ist ein Zustand zum Verteidigen, nicht zum Optimieren. | So lassen. Jede neue Mail bekommt ihr eigenes Opt-out. |
| **Internen Verkehr in Reichweitenzahlen lassen** | Das ist die Dark-Pattern-Variante gegenüber dem **Sponsor** statt gegenüber dem Nutzer. Gleiche Kategorie. | Punkt 1 aus 3d. |

---

## 5. Rückmeldung an Mats — H1 bis H7 am gebauten Produkt

Pflicht-Rückkanal des Tandems. Meine Antworten sind **Prüfbarkeits-Urteile**, keine Ergebnisse —
bei 9 externen Nutzern gibt es zu keiner Hypothese eine belastbare Antwort, und ich behaupte auch
keine.

| | Hypothese | Status | Begründung am Produkt |
|---|---|---|---|
| **H1** | Checklist 4/4 → häufigere Rückkehr binnen 14 Tagen | **instrumentiert, nicht auswertbar** | `checklist_step_done` (mit `meta` = Schritt-Schlüssel) und `playerId` in `AnalyticsEvent` liegen vor — die Kohorte ist technisch bildbar. Es fehlt: ein Ereignis „Checkliste abgeschlossen" und eine Auswertung im Dashboard. Fallzahl trägt ohnehin nichts. **Nebenbefund für Lina:** die Anzeige sagt „3 von 4 erledigt", listet aber 5 Punkte (der PWA-Bonus zählt nicht in den Nenner) — verwirrend. |
| **H2** | Profile + Topscorer/Rangliste sind die meistbesuchten Bereiche eingeloggter Nutzer | **derzeit NICHT fair prüfbar — und das ist der wichtigste Punkt für dich** | Drei strukturelle Verzerrungen: (a) **`/rangliste` ist aus der Navigation nicht erreichbar** (R7) — der Eimer „Rangliste" muss nahe null bleiben, egal wie interessant sie wäre; (b) Profilaufrufe über ObjectId-Links fallen aus der Inhaltsauswertung (`lib/analyticsSummary.js` Zeile 253); (c) interner Verkehr ist nicht ausgeschlossen. **Ein „H2 widerlegt" auf dieser Datenbasis wäre ein Fehlschluss.** Erst Navigation und Filter reparieren, dann messen. |
| **H3** | Anteil Spiele mit Ergebnis binnen 7 Tagen sinkt über die Saison | **nicht instrumentiert, aber billig nachrüstbar** | Die Rohdaten liegen vollständig vor (`Match.date`, `resultStatus`, `teamXResult.submittedAt`), und `notify-pending-results` findet die betroffenen Spiele bereits. `lib/analyticsSummary.js` zählt Spiele aber nur als Bestand (`matchesStats`), nie als Quote. Eine Aggregation reicht. |
| **H4** | Transfermarkt/Tryouts werden angesehen, Anfragen bleiben einstellig | **halb instrumentiert: Angebot ja, Nachfrage nein** | `platform.transferAvailable` und `recruitingTeams` zählen das **Angebot**. Für die **Nachfrage** (Tryout-Bewerbungen `Tryout.applicants`, Direktanfragen) gibt es keinen Zähler und kein Ereignis. Ergänzung: Ich habe bei `/tryouts` den harten Leerzustand ohne jeden Ausweg gefunden (R2) — solange der so bleibt, misst H4 nicht die Nachfrage, sondern die Abschreckung. |
| **H5** | Registrierungs-Spitzen nach Turnieren | **instrumentiert, wartet auf Daten** | `signupSource` + `signup_src`-Ereignis sind produktiv (`playerregister/route.js` Zeile 64), `signupSources` steht in der Auswertung. Flyer sind laut `ZIELGRUPPEN.md` noch nicht verteilt. Unverändert offen — nichts zu tun. |
| **H6** | Einladungen laufen über Link/WhatsApp, kaum über E-Mail | **nicht instrumentiert** | Alle drei Einladungswege existieren (`generate-invite`, `invite-email`, `roster/send-invite-email`), aber **keiner** zählt mit — kein Ereignis, kein Feld. H6 ist heute nicht beantwortbar. Ein Ereignis je Weg beim Auslösen genügt. Ich bestätige aber die *Gestaltung*: Der Kader-Tab führt sichtbar mit „Bestehenden Spieler einladen — SCHNELLSTER WEG" **[BEOBACHTET]**, E-Mail ist zurückgestuft. Das Produkt handelt bereits nach H6, ohne sie belegt zu haben. |
| **H7** | Echte Kreisliga-Daten → mehr Profil-Vervollständigung und Wiederkehr | **offen, mit einer neuen Vorbedingung von mir** | Deine Priorität 1 (echte WBV-Daten vor neuen Funktionen) stütze ich ausdrücklich. **Aber:** selbst mit echten Daten fehlt der stärkste Liga-Anker, weil `app/api/player/topscorer/route.js` **keinen Liga-Filter kennt** (R5) und `/ligen/[id]` weder Spielplan noch Topscorer verlinkt (K2). Ein Kreisliga-Spieler bekäme also seine echte Liga — und würde in einer globalen Bestenliste gegen Regionalliga-Spieler einsortiert. **Empfehlung: R5 und K1–K3 gehören vor oder mit den echten Daten, sonst wird H7 unter Wert getestet.** |

### Was ich deiner Analyse hinzufügen würde

- **Bedarf 4 hat eine zweite Hälfte.** Du beschreibst die Doppelerfassung richtig als
  Ausschlusskriterium und leitest daraus „Eingabewege radikal kurz halten" ab. Am Produkt sehe ich:
  die Eingabe ist bereits kurz — was fehlt, ist der **sichtbare Ertrag**. Heute ist die Eingabe des
  Team-Admins eine Arbeit, die für niemanden sichtbar wird (R1). „Kürzer machen" und
  „sichtbar belohnen" sind zwei verschiedene Hebel, und der zweite ist unangetastet.
- **Deine „wird NICHT gebraucht"-Liste bestätige ich vollständig.** Ich habe im Walkthrough keinen
  Punkt gefunden, an dem mir Team-Chat, Trainingsverwaltung oder Live-Ticker gefehlt hätten. Was
  gefehlt hat, war jedes Mal eine **Verbindung zwischen bereits gebauten Teilen** — nicht ein
  neuer Teil. Das ist die wichtigste Gesamtaussage dieses Befunds.

---

## 6. Kollegen — einbezogen, und wen ich bewusst nicht beauftragt habe

- **Mats (Tandem, Pflicht):** Bedarfsanalyse war Startpunkt; Abschnitt 5 ist der Rückkanal.
  **Offener Punkt für ihn:** H2 ist am Produkt derzeit nicht fair prüfbar (R7) — er sollte sie
  nicht als „offen mangels Daten" führen, sondern als „durch die Navigation blockiert".
- **Lina (Onboarding & Entdeckbarkeit):** Zuarbeit — R3 (Checkliste bleibt beim Wiedereinstieg
  stehen, statt Team-Status zu zeigen), R2/K5 (Leerzustand `/tryouts` ohne Ausweg), R7/K8
  (`/rangliste` und `/installieren` nicht auffindbar), H1-Nebenbefund („3 von 4" bei 5 Punkten).
  Die Flächen baut sie, nicht ich.
- **Ben (Analytics):** Abschnitt 3d sind seine Messfragen. Vorrang: interner Verkehr,
  `SponsorReportView` auf `echteZahlen`, Handlungs-Ereignisse.
- **Nele (Marketing):** 3a berührt Z5 direkt — die Sponsoren-Kennzahlen-Frage ist ihr Feld, sobald
  die Zahlen korrigiert sind. Außerdem: der Beleg-Satz steht entgegen der Notiz in `CLAUDE.md` an
  fünf Stellen im Text; das ist ihr Verdienst und sollte nicht doppelt „gefixt" werden.
- **Tobias (QA):** **Kein Fehler zu übergeben.** Ich habe im Walkthrough keinen Absturz und keinen
  Funktionsfehler gefunden. Die Liga-Karte auf `/team/team-detail` rendert lokal nicht, weil
  `scripts/seed-demo.mjs` `Team.leagueId` nicht setzt — das ist ein **Seed-Artefakt**, kein Produktfehler
  (der Code dafür steht in `app/team/team-detail/[slug]/page.js` Zeile 239 und ist korrekt). Auf
  Prod habe ich das **nicht** geprüft.
- **Vivien / Ole:** bewusst **nicht** beauftragt. Es ist noch keine Design-Entscheidung und keine
  Prioritätsverschiebung zu treffen — beides hängt an Patricks Reihenfolge-Entscheidung zu diesem
  Befund. Ole wird relevant, sobald entschieden ist, ob R1/R5 vor die echten Kreisliga-Daten rücken.
- **Kai:** falls R1 gebaut wird, gehört der Versandpfad (wer bekommt was, Opt-out) in seine
  Testsuite — Benachrichtigungen an falsche Empfänger wären ein Datenschutz-, nicht nur ein UX-Fehler.

---

## 7. Was ich nicht prüfen konnte — ehrlich

- **Echtes Wiederkehr-Verhalten.** 9 externe Nutzer. Es gibt keine Retention zu beobachten, nur
  Hürden. Alles oben sind Walkthrough-Befunde.
- **Die eingeloggte Live-Seite.** Ich habe `hoopsgermany.de` nur über lesende, öffentliche APIs
  abgefragt (`/api/leagues`, `/api/team/fetchteams`, `/api/player/fetchall`). Ich habe mich nicht
  eingeloggt und `hoops_prod` nicht angefasst.
- **Die echten Zahlen im Sponsoren-Report.** Ich habe die **Berechnung** im Code nachvollzogen und
  die zugrunde liegenden Bestände über öffentliche APIs gemessen (70 Teams / 410 Profile). Den
  Report selbst habe ich nicht aufgerufen — er braucht Admin-Token bzw. Freigabe-Passwort. Die
  Zahlen in 3a sind daher **Untergrenzen** aus den öffentlichen Listen, keine Auslesung des Reports.
  `Team.countDocuments({})` kann höher liegen als 70, weil `fetchteams` möglicherweise nur
  freigegebene Vereine liefert.
- **Ob `p.matches.total` auf Prod Demo-Spiele enthält.** Sehr wahrscheinlich ja
  (`backfill-demo-flags.mjs` deckt nur `teams`, `players`, `leagues` ab und `entityStats(Match, …)`
  filtert gar nicht), aber ich habe die Prod-Spiele nicht gezählt.
- **Screenshots.** Die Browser-Vorschaufläche hat beim Aufnehmen abgebrochen. Ich habe stattdessen
  durchgehend den **DOM-Text und die Link-Listen** der jeweiligen Seite ausgelesen — das ist für
  die Frage „wohin kann man von hier klicken?" ohnehin das präzisere Beweismittel, und die Zitate
  oben sind wörtliche Ausgaben daraus.
- **Desktop.** Der Walkthrough lief auf 375×812, dem laut Nele maßgeblichen Fall. Die
  Verbindungs-Befunde (K1–K10) sind strukturell und breitenunabhängig; Desktop-spezifische
  Beobachtungen habe ich diesmal keine erhoben.
- **`prefers-reduced-motion` und Barrierefreiheit** — nicht Gegenstand dieses Auftrags.

---

*Ronja · 13.08.2026 · Keine Implementierung, kein Commit, kein Versand. Priorisierung: Patrick.*
