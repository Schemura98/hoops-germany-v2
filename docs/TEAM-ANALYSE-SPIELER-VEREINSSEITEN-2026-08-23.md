# Team-Analyse: Spieler- & Vereinsseiten (23.08.2026)

**Auftrag Patrick:** Design und Funktionalität der Spieler- und Vereinsseiten mit dem ganzen
Team analysieren; Verbesserungen im minimalistischen Stil der neuen Startseite vorschlagen
(inkl. dezenter Bewegung). **Reine Analyse — nichts wurde geändert, nichts committet,
nichts deployt.**

**Vorgehen:** Production-Build lokal gestartet (Port 3000, Dev-DB `hoopsgermany` mit beiden
Seeds), danach vier Prüfer parallel: **Vivien** (Design, Playwright headless + Screenshots
angesehen), **Tobias** (Funktions-Review im Browser, mobil zuerst, drei Konten), **Ronja**
(Nutzungs-/Retention-Sicht gegen Bedarfsanalyse, Zielgruppen und die Wiederkehr-Quote),
**Nele** (Texte/Tonalität gegen Zielgruppen und das Zahlen-lügen-Muster). Server nach der
Analyse beendet, Port frei.

**Geprüfte Seiten:** `/spieler`, `/player/view-player/[slug]`, `/player/player-detail`,
`/player/edit-profile`, `/teams`, `/team/team-detail/[slug]`, `/team/dashboard`,
`/team/admin` (alle 6 Tabs).

**Gesamtbild:** Die Seiten sind **nicht kaputt und nicht stillos** — Kernflüsse laufen
durchgängig (Tobias), die Retention-Liste vom 13.08. ist auf diesen Seiten überwiegend
eingelöst (Ronja, nachgeprüft), die Texte tragen vielfach schon Handschrift aus früheren
Runden (Nele), und das Spielerprofil ist der Startseiten-Sprache bereits am nächsten
(Vivien). Was fehlt: eine Handvoll **echter Fehler** (einer davon zeigt Admins ihre
Niederlagen als Siege), die **Disziplin und Dramaturgie** der Anzeigetafel-Sprache auf den
Vereinsseiten, drei kleine **Verbindungen** im Weg „Spiel → meine Zahlen → mein Rang", und
das Kernversprechen **Belegbarkeit wird auf diesen Seiten nirgends erzählt**.

---

## PAKET A — Fehler, die vor der Testphase (03.10.) behoben gehören

Alle klein bis mittel im Aufwand. Sortiert nach Schwere.

### A1 · Der Admin-Spielplan zeigt Niederlagen als Siege (Tobias H1) — SCHWERSTER BEFUND
`/team/admin`, Reiter Spielplan, alle Fenstergrößen, reproduzierbar. Der Reiter zeigt
„vs. Rhein Ballers · 82:78" für ein Spiel, das die Test Baskets **78:82 verloren** haben
(an der DB nachgeprüft: Sieger Rhein Ballers). Der Reiter druckt **Sieger zuerst**, ohne
das zu sagen — in einer „vs. Gegner"-Zeile liest jeder die erste Zahl als die eigene.
Betroffen: alle drei verlorenen Spiele der Dev-DB; bei Siegen unsichtbar, weil beide
Lesarten zusammenfallen. **Zwei Reiter desselben Panels widersprechen sich:** Der
Ergebnisse-Reiter zeigt dasselbe Spiel korrekt als „78 : 82 (dein Team : Gegner)", die
öffentliche Teamseite auch. Fall für `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`.
→ Fix: Punktreihenfolge im Spielplan-Reiter auf „dein Team : Gegner" drehen.
→ Kai-Wächter: Für ein **verlorenes** Spiel müssen Spielplan-Reiter, Ergebnisse-Reiter und
öffentliche Teamseite dieselbe Reihenfolge zeigen (die drei Juli-Spiele der Dev-DB sind die
Testfälle).

### A2 · „deine Werte" steht über den Zahlen eines FREMDEN Spielers (Nele P1) — live belegt
`components/player/PlayerProfileView.js:697–699`. Die Komponente rendert eigenes UND
fremdes Profil; beim Aufklappen einer Station steht auf fremden Profilen „Endstand · deine
Werte als PKT·AST·REB" — ein Scout liest fremde Zahlen als seine ausgewiesen. Ausgerechnet
die Beleg-Zeile nennt das falsche Subjekt. Live verifiziert (ausgeloggt, Max' Profil).
→ Fix: Text am vorhandenen `viewerId` unterscheiden. Fremdes Profil neutral:
„Endstand · Werte des Spielers als PKT·AST·REB" (Geschlechts-/Genitiv-Fallen vermeiden —
Artikel-Lehre vom 22.08.). → Kai-Wächter, weil die Zeile je Betrachter wechselt.

### A3 · Querlauf auf der Vereinsseite: 380 px Seite in 360-px-Fenster (Vivien + Tobias, unabhängig)
`/team/team-detail/[slug]`, 360 und 320 px. Die Reiterleiste (Kader/Spielplan/Saisons/News)
erzwingt 380 px Mindestbreite; „News" ragt 20 px über den Rand, die Seite lässt sich
seitlich wegschieben; auf 320 px wird die ganze Seite verkleinert dargestellt. Wurzel:
`components/ui/Tabs.js:15` hat `max-w-full`, aber **kein `overflow-x-auto`** — der
Kommentar dort behauptet, den Fall gelöst zu haben. Das Spielerprofil umgeht es mit einer
eigenen `overflow`-Hülle (`PlayerProfileView.js:469`).
→ Fix in der **Komponente**, nicht an der Aufrufstelle (ConfirmAction-B1-Lehre); die Hülle
im Spielerprofil kann danach weg. Alle 6 Tabs-Einsatzstellen einmal ansehen.
→ Kai-Wächter: auf 320–430 px ist scrollWidth = Fensterbreite und der letzte Tab per
Scroll erreichbar. Tobias: Die bestehenden Querlauf-Prüfungen decken diese Route nicht.

### A4 · Das 13. graue Eingabefeld: CityInput (Vivien + Tobias, unabhängig)
Das Stadt-Feld rendert Browser-Grau `rgb(59,59,59)` — dieselbe Familie wie die zwölf am
22.08. behobenen Felder. Wurzel: `components/CityInput.js:42–44` — der lokale
Fallback-String ist eine Kopie von `inputClass` **ohne** `bg-navy-700` und ohne
`placeholder:text-mist-400`. Die damalige Suche hat ihn verfehlt, weil CityInput eine
**lokale Variable namens `inputClass`** definiert — das design-audit zählt die Stelle
dadurch sogar als Token-Verwendung (Zählung war hier blind → Kai).
Betroffen sichtbar: `/player/edit-profile` (Heimatstadt), Einstellungen-Tab
(`EinstellungenTab.js:332`), `/team/create:181`. Der `/spieler`-Filter ist sauber
(CityRadiusFilter übergibt eine eigene Klasse).
→ Fix: echtes `inputClass` importieren, täuschende lokale Variable umbenennen.

### A5 · „Zum Beitreten anmelden" ist ein unsichtbarer Knopf (Vivien; Tobias N5 verwandt)
`app/team/team-detail/[slug]/page.js:212–217`: handgebauter Link mit `bg-navy-800/10` auf
navy-900 — gerechnet **1,01 : 1**, am Screenshot bestätigt: neben dem orangen „Folgen"
steht er als nackter Text. Die ausgeloggte Hälfte der Besucher sieht die
Beitritts-Handlung nicht als Handlung. Dazu (Tobias N5): Der Hinweis „Bitte zuerst als
Spieler anmelden" bei „Team beitreten" ist **kein Link** zum Login.
→ Fix: `Button`-Primitiv (secondary), Hinweis verlinken (Text-Wortlaut → Nele).

### A6 · „Folgen" ist für Ausgeloggte ein toter Knopf (Tobias H2)
Fremdes Spielerprofil, ausgeloggt: Klick → 401 → **keinerlei Reaktion der Oberfläche**.
Kein Hinweis, keine Weiterleitung, Knopf unverändert. Der Seitenkopf von `/spieler` wirbt
wörtlich mit „folge ihnen" — der Erstbesucher erlebt einen Knopf ohne Funktion.
→ Fix: bei fehlendem Token Hinweis + Login-Weg (Muster „Team beitreten", aber mit Link).

### A7 · Leerzustand der Spielersuche lügt bei aktivem Filter (Tobias M3; Text → Nele)
`/spieler` mit Filter ohne Treffer zeigt „Noch keine Spieler registriert." — es sind 20,
der Filter blendet sie aus. Kein „Filter zurücksetzen"-Weg.
→ Fix: Bei aktivem Filter „Keine Spieler für diese Filter" + Zurücksetzen-Knopf.

### A8 · Die Kader-Kopfzahl widerspricht der Liste darunter (Nele P2)
`app/team/team-detail/[slug]/page.js:198`: „{n} Spieler" zählt nur Konten; die Liste
darunter zeigt zusätzlich offene Plätze. 5 Konten + 4 Plätze = „5 Spieler" über 9 Namen.
→ Fix (Neles bessere Variante): „9 im Kader, davon 4 noch nicht bestätigt" — macht die
Bestätigungs-Logik (USP) nebenbei sichtbar.

### A9 · Kontrast unter AA an zwei Profil-Kleinschriften (Vivien)
`PlayerProfileView.js:140` und `:563`: `text-mist-600` auf navy-800-Panel = **3,98 : 1**
bei 11 px (Grenze 4,5). Auf dem 950er-Grund war der Token korrekt gerechnet; auf der
helleren Panelfläche kippt er. → Fix: `mist-400` (7,2 : 1). Zwei Klassen, Risiko null.

**Weitere Pflicht-Textfixes (Nele P3–P5, je ein Satz):**
- **P3:** „Du wirst automatisch Team-Admin" (`app/teams/page.js:100–103`,
  `app/team/create/page.js:102–103`) verschweigt die Freigabe-Prüfung (`approved: false`,
  `app/api/team/create/route.js:64`). → Halbsatz ergänzen: „Öffentlich sichtbar wird das
  Team nach einer kurzen Prüfung durch das Hoops-Team." „& mehr" streichen.
- **P4:** „Einladung an Max gesendet – sie wird per Glocke & Mail gefragt"
  (`KaderTab.js:236`) — Bezugsfehler. → „{Name} bekommt eine Benachrichtigung per Glocke
  und E-Mail und entscheidet selbst."
- **P5:** „Super-Admin" steht dreimal nutzersichtbar (`EinstellungenTab.js:240/452/466`),
  daneben sagt `/team/admin:128` „ein Administrator". → einheitlich „das Hoops-Team".

---

## PAKET B — Design-Angleichung an die Startseiten-Sprache (Vivien)

Kern-Erkenntnis: Die Verwandtschaft zur Startseite trägt sich über **Typo, Mono-Ziffern,
Flächenstufen und die eine Signaturkante** — nicht über Spielfeldlinien (s. „Bewusst
nicht"). Bewegung auf Gebrauchsflächen heißt **Ankunft** (CountUp/Reveal), nie Reise
(Scroll-Choreografie).

1. **Mono-Ziffern auf die Vereinsseiten** — größter und billigster Einzelhebel. `grep
   font-mono` über team-detail + alle 6 Admin-Tabs: **0 Treffer**. Spielstände
   (`team-detail:461–466`), Saison-Tabelle (`:505–533`), Platzierung (`:256`),
   `SpielplanTab.js:407`, `ErgebnisseTab.js:306` auf `font-mono tabular-nums`. Die Spez
   ordnet das wörtlich an; das Spielerprofil macht es vor. ~8 Stellen; Mono läuft breiter,
   einmal auf 360 px nachsehen.
2. **Liga-Karte zur EINEN hervorgehobenen Karte der Vereinsseite:** „2. von 4" ist die
   Zahl, für die ein Verein die Seite besucht, und heute das leiseste Element.
   `border-t-2 border-t-brand-500` (Signaturstelle 2), Platzierung groß in Mono/Display
   mit `CountUp` bei Ankunft — Muster der „Nächstes Spiel"-Karte des Profils. Damit hat
   die Seite ihre Dramaturgie: eine Zahl führt, der Rest ist Tafel.
3. **Admin-Tab-Leiste auf das Tabs-Primitiv** (Unterstreichung statt selbstgebauter
   Pillen-Wanne, `app/team/admin/page.js:142–183` — widerspricht dem eigenen
   Tabs-Kopfkommentar). Tippziele dabei von 32 auf ≥ 40 px. Auto-Zentrierung, `?tab=`-
   Deeplink und Aufgaben-Zähler müssen erhalten bleiben (Tabs braucht Badge-Erweiterung).
   Aufwand mittel, Risiko mittel — vorher mit Kai abstimmen.
4. **Akzent-Disziplin im Admin:** `KaderTab.js:366` vom vollen 2px-Orange-Rahmen auf die
   border-t-2-Form (heute stehen zwei orange Rahmen direkt übereinander — „von zwei
   gleichfarbigen Zeichen betont keines mehr etwas"); „Statistiken speichern" nur im
   geänderten Zustand primär (heute sechsmal orange untereinander); Status-Abzeichen der
   Tabs von `rounded-full` auf `rounded-sm` (`SpielplanTab.js:409`, `KaderTab.js:830`,
   `TryoutsTab.js:277`, `EinstellungenTab.js:601` — die öffentliche Seite macht es vor).
5. **Verlauf von der Team-Logo-Kachel** (`app/teams/page.js:182`,
   `bg-gradient-to-br…` → flaches `bg-navy-900`): einziger Verlauf aller acht Seiten,
   wörtlicher Spez-Verstoß (§4.2 ordnete für genau diese Kachel „flach, kein Verlauf" an).
   Eine Klasse, Risiko null.
6. **Ladezustände mit stehendem Chrome:** view-player, player-detail, edit-profile und
   admin ersetzen beim Laden die ganze Seite durch einen Spinner (Navbar inklusive);
   team-detail macht es richtig (Skeleton, Navbar steht). Aufwand mittel.
7. **Ankunfts-Einblendung der Listenkarten** auf /spieler + /teams über `Reveal`/`staffel()`
   (wie /ligen, /topscorer) — vereinheitlicht die Listenfamilie. Niedrig.
8. **Kleinigkeiten:** `transition-all` auf der Liga-Karte (`:240`) →
   `transition-[background-color,border-color]` · Hero-Skeleton `bg-navy-800/10` =
   unsichtbarer Puls (`:55–58`) · Skeleton-Tabs als Pillen, echte Tabs als
   Unterstreichung (`:65`) · Duplikat-Suchfelder auf beiden Listen bauen `inputClassSm`
   von Hand nach (`spieler:116`, `teams:116`).

**Befunde ohne Vorschlag (Einordnung, kein Defekt):** Die Avatar-Rückfallkacheln machen
`/spieler` zum Farb-Patchwork (20 große Fremdfarben-Flächen; verschwindet mit echten
Fotos). Alpha-Flächen im Profil (`bg-navy-800/5` u. ä., `PlayerProfileView.js:406/498`,
`player-detail/page.js:49`) sind Off-System-Erfindungen (≈ 1,01 : 1 = Fläche, die es
faktisch nicht gibt) — funktioniert visuell, nicht kopieren. `SectionCard`
(`PlayerProfileView.js:186–198`) ist das vierte handgebaute Karten-Muster — nur nach
`components/ui/` heben, wenn B2 ohnehin daran baut.

---

## PAKET C — Drei kleine Verbindungen für die Wiederkehr-Quote (Ronja, vor 03.10.)

Kernaussage unverändert seit dem 13.08.: **Es fehlen Verbindungen, keine Funktionen.**
Alle drei zusammen kleiner als ein Tagesstapel; alle nutzen existierende Messpfade
(keine neuen Ereignistypen nötig).

1. **H1 · Spielplan-Zeilen der Vereinsseite auf `/match/[id]` verlinken**
   (`team-detail/[slug]/page.js:438–473` — jede Zeile ist ein `<div>`, gemessen 0
   `/match/`-Links im ganzen Tab). Der natürliche Wochenweg „Vereinsseite → Ergebnis →
   meine Zahlen → Beleg-Abzeichen" reißt heute beim nackten Score ab. Sehr klein; Muster
   steht auf dem Spielerprofil.
2. **H2 · Erfolgsmeldung der Box-Score-Eingabe nennt den Ertrag:** „Statistiken
   gespeichert — 8 Spieler wurden über ihre Zahlen benachrichtigt."
   (`app/api/team/match-stats/save/route.js:134–140` ruft `notifyOwnStats` auf, meldet dem
   Admin aber nichts.) Verwandelt die Ehrenamts-Pflicht in sichtbare Wirkung; hebt direkt
   die Vorbedingungs-Ampel M3 der Wiederkehr-Messung. Ehrlichkeitsregel: nur echte
   Erst-Benachrichtigungen zählen; bei 0 die alte Meldung.
3. **H3 · „Wo stehst du?"-Verweis vom Profil zum Topscorer der eigenen Liga** — eine
   Zeile unter der Karriere-Bilanz, Ziel `/topscorer` (ownLeague-Standard + eigene Zeile
   existieren dort; es fehlt nur der Weg hin). FuPa-Motor: „Platz 3 der Kreisliga Niers"
   ist die Zahl, die ein Spieler seinem Team schickt.

**Mittel (kann warten):** M1 „Letztes Spiel"-Karte mit eigenen Zahlen auf dem eigenen
Profil (Gegenstück zur Nächstes-Spiel-Karte; Aufwand mittel) · M2 Liga-Name auf die
Teamkarten von `/teams` (`fetchteams` liefert heute keine Liga — die 10 Niers-Vereine
erkennen einander nicht als Liga-Nachbarn) · M3 TransferControl-Sackgasse: nach dem
Umschalten auf „verfügbar" zwei Weiterwege anbieten (Transfermarkt / Tryouts in der Nähe).

**Niedrig/Notizen:** Zahlen auf den /spieler-Karten erst nach 2–3 echten Spielwochen (in
der Testphase wären fast alle 0.0 — demotiviert genau die Messkohorte) · „Team
beitreten"-Knopf erscheint auch Kadermitgliedern des eigenen Teams (auch Tobias N3; ob der
Server den Klick abfängt, ist UNGEPRÜFT — Schreibaktion bewusst nicht ausgelöst) ·
`/spieler` lädt alle Profile ohne Limit (`fetchall`) — bei Prod-Beständen eine Ladefrage,
→ Kai falls Seeds bleiben.

---

## PAKET D — Belegbarkeit erzählen + Text-Kür (Nele)

**Wichtigster struktureller Punkt (K1):** Das einzige Verkaufsargument — „wie LinkedIn,
nur nachweisbar" — wird auf diesen Seiten nirgends erzählt. Untertitel sind austauschbare
Social-Sätze; der korrekte Herkunftssatz an der Karriere-Bilanz liest sich als
Kleingedrucktes statt als Stärke; der Spielplan der Vereinsseite zeigt Ergebnisse ohne
Beleg-Abzeichen. Vorschläge:
- `/spieler`-Untertitel: „Spielerprofile mit echten Zahlen aus eingetragenen Liga-Spielen
  – finde Spieler aus deiner Region."
- `/teams`-Untertitel: „Vereine und Teams mit Kader, Spielplan und gemeldeten Ergebnissen
  – aus deiner Liga und deinem Kreis."
- Herkunftssatz umdrehen (Korrektheit bleibt wörtlich erhalten): „Diese Zahlen stammen aus
  eingetragenen Spielen – keine Selbstauskunft. Ob beide Teams das Ergebnis unabhängig
  bestätigt haben, siehst du am jeweiligen Spiel."

**Entscheidung nötig — P6 „Bestätigt"-Abzeichen im Ergebnisse-Tab** (`ErgebnisseTab.js:243–245`
und `:284–287`): Die Einleitung definiert „Bestätigt" als beidseitige Übereinstimmung; das
Abzeichen hängt aber an `resultStatus === "confirmed"`, den auch die Admin-Korrektur setzt
(eine Person tippt beide Punktzahlen — Muster-Fall 3). Zwei Wege: **(a)** Einleitung
entschärfen („…wird das Ergebnis festgeschrieben. Bei Widerspruch hilft das Hoops-Team."),
Abzeichen bleibt Prozessstatus. **(b)** Abzeichen an `beidseitigBelegt()`
(`lib/matchScore.js`) hängen; Admin-Auflösung zeigt „Ergebnis steht". (b) ist die
ehrlichere und passt zur Newsfeed-Logik vom 15.08., kostet einen kleinen Code-Eingriff.

**Kür (K2–K6):** Du/Ihr-Wechsel im Ergebnisse-Tab vereinheitlichen (durchgehend Du an den
Admin) · Kader-Tab spricht durchgehend männlich („Er…ihn", `KaderTab.js:375/491`) — über
zweite Person lösbar, 16 Damen-Ligen im Katalog · „Slot" vs. „Platz" gemischt
(`KaderTab.js:275/289/821/849`, `ErgebnisseTab.js:405` verweist zudem auf ein Wording,
das es im Kader-Tab nicht gibt) · roher Pfad „/tryouts" im Leerzustand
(`TryoutsTab.js:233`) · Kleinigkeiten: `AnfragenTab.js:74` („öffentliches Profil" →
„deine öffentliche Teamseite"), `/teams`-Leerzustand rhetorisch schief, roher DB-Status
kleingeschrieben in `EinstellungenTab.js:609`, holpriger Mismatch-Satz
`ErgebnisseTab.js:324`.

**Status der vier bekannten offenen Text-Punkte:** „So funktionierts" ohne Apostroph —
weiter offen (`LandingHowItWorks.js:133`) · Kaderplatz „—" — entschärft zu „Keine Angabe"
(`lib/constants.js:111`); Rest-Kür: „Position offen" wäre ehrlicher · /team/create-
Reihenfolge (15 d) — unverändert · Markenclaim als Text (33 d) — weiter 0 Treffer.

---

## Weitere Tobias-Befunde (nicht in A einsortiert)

- **M4 · Roadmap 31 präzisiert:** Leseposition geht beim Seiten-zu-Seiten-Wechsel verloren
  (/spieler → /teams → zurück: 1.510 px zu hoch, jetzt auch mobil belegt), aber der Weg
  **Liste → Detailseite → zurück stellt exakt wieder her**. Das grenzt die Behebung ein.
- **M5 · Roadmap 35 bestätigt:** /team/create → /team/admin weiterhin stumm; zusätzlich
  leitet auch /team/dashboard stumm (Admin → admin, Free Agent → create; Letzteres
  tragbar, gehört aber in dieselbe Entscheidungsrunde).
- **N1 · 401-Konsolenrauschen:** Jede öffentliche Seite ruft ausgeloggt `getmyinfo` +
  `getnotifications` auf → 2 Konsolenfehler pro Seitenladung. Funktional folgenlos,
  verrauscht aber jede Fehlersuche. Client sollte ohne Token nicht anrufen.
- **N2 · Tippziele präzisiert:** „Antworten" im Kommentarbereich nur **59×16 px** —
  kleiner als die dokumentierten 34–38 (Familie Roadmap 32 b, → Vivien).
- **N4 · Stadt-Typeahead-Datenqualität:** `de-cities.json` enthält Nicht-Städte („Alte
  Leipziger (Hessen)", „Mitteldeutscher Rundfunk…") und englische Bundeslandnamen
  („Saxony"). Wirkt wie ein Fehler, Suche funktioniert.
- **N6:** Gegnernamen im Admin-Spielplan mobil stark gekürzt, Datum/Ort voll · „210 cm"
  im Größe-Feld auf 360 px minimal angeschnitten.
- **Offene Validierungsfrage (nicht ausgelöst):** „Spiel hinzufügen" ist bei leeren
  Pflichtfeldern nicht gesperrt und liegt außerhalb eines Formulars — ob der Handler
  validiert oder ein leeres Spiel anlegt, ist UNGEPRÜFT. → Kai.

**Ehrliche Prüfgrenzen (Tobias):** Klicks liefen über ausgelöste Browser-Ereignisse (die
Vorschaufläche war ausgeblendet — echte Mausklicks kamen nicht durch); Produktlogik
identisch, Trefferflächen-Überlappungen könnte die Methode übersehen. Tastatur-Fokus in
dieser Umgebung nicht verlässlich messbar — nicht geprüft, nicht „bestanden". Alle
Schreibaktionen mit bleibender Wirkung bewusst nicht ausgeführt. Vivien hat das eigene
Profil nur teilweise GESEHEN (Tour lag über dem Screenshot) — Aussagen dazu aus Code +
Komponentengleichheit.

---

## Bewusst NICHT vorgeschlagen (vom Team einstimmig)

- **Spielfeldlinien/Feld-Echos auf den Datenseiten** (Vivien): Die Startseiten-Zeichnung
  ist an eine Erzählung gebunden (Anwurf → Pass → Abschluss); auf einer täglich besuchten
  Datenseite wäre dieselbe Linie Deko-Tapete. Verwandtschaft trägt sich über Typo,
  Mono-Ziffern, Flächenstufen, Signaturkante (Paket B).
- **Scroll-getriebene Animationen auf Gebrauchsflächen** (Vivien): Bewegung heißt dort
  Ankunft (CountUp/Reveal), nie Reise.
- **Der 140-Panels-Umbau auf Card/cardClass** (Vivien): Abwägung unverändert (hohes
  Regressionsrisiko, kein sichtbarer Gewinn) — alle Vorschläge sind Einzelkorrekturen.
- **Team-Chat, Trainingsverwaltung, Live-Ticker, Erinnerungs-Mails/Streaks/„X hat dein
  Profil angesehen"** (Ronja): Bedarfsanalyse-Nicht-Liste bzw. Dark-Pattern-Familie.
- **Keine neuen Messgrößen/Schwellen** (Ronja): WQ-Definition ist festgeschrieben; alle
  Messvorschläge nutzen existierende Ereignisse und Diagnosen.
- **Neue Fonts, Paletten, Effekte** (Vivien): Die Sprache ist entschieden; die Aufgabe ist
  Durchsetzung, nicht Neuerfindung.

## Entscheidungen, die bei Patrick liegen

1. **Freigabe der Pakete** (A sofort? B ganz oder teilweise? C vor 03.10.? D-Wortlaute?).
2. **P6:** „Bestätigt"-Abzeichen — Weg (a) Text entschärfen oder (b) an
   `beidseitigBelegt()` hängen (Empfehlung Nele: b).
3. **Positions-Chip auf /spieler:** Farbe von brand auf mist/navy? (Existenz ist
   entschieden, Farbe nicht — 20 Orange-Wiederholungen je Seite.)
4. **Avatar-Rückfallkacheln:** in der Listenansicht auf „navy-Fläche + farbiges
   Monogramm" drehen? (Eingriff ins plattformweite Avatar-System — Richtungsentscheidung.)
5. **M5-Familie:** Wortlaut/Verhalten der stummen Weiterleitungen (Roadmap 35).

## Prüf-/Absicherungsnotizen für die Umsetzung (→ Kai)

- Wächter A1 (Punktreihenfolge über drei Flächen), A2 (Betrachter-abhängige Beleg-Zeile),
  A3 (Tabs-Overflow auf 320–430), A4 (CityInput-Fläche; dazu: design-audit zählt
  gleichnamige lokale Variablen als Token-Nutzung — Zählung blind).
- Validierungsfrage „Spiel hinzufügen" (s. o.).
- `/spieler` ohne Limit (`fetchall`) bei Prod-Beständen.
- Bei B3 (Admin-Tab-Umbau): bestehende Playwright-Fälle klicken die Tab-Buttons — vorher
  abstimmen.

*Analyse-Skripte und Screenshots liegen im Session-Scratchpad (nicht eingecheckt). Am Repo
wurde durch diese Analyse nichts verändert; dieses Dokument ist die einzige neue Datei.*
