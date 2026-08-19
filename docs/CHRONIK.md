# Hoops Germany – Projektchronik (Meilenstein-Protokolle)

> **Vollständige Projektchronik, ausgelagert aus CLAUDE.md Abschnitt 0 am 08.08.2026.**
> Abschnitt 0 der CLAUDE.md war zum Changelog gewuchert (25+ datierte Meilenstein-Protokolle);
> er ist seither wieder ein kompakter Überblick. Diese Datei bewahrt den **kompletten früheren
> Abschnitt 0 wörtlich und verlustfrei** – alle datierten Meilenstein-Protokolle, Commit-Hashes,
> Verifikations-Notizen, die damalige Roadmap mit ✅-Erledigt-Einträgen sowie die damals dort
> gepflegten Kontext-Blöcke (Warnungen/Konventionen), wie sie zum Zeitpunkt der Auslagerung standen.
>
> ⚠️ **Aktuell gepflegt wird NUR CLAUDE.md Abschnitt 0** (aktueller Stand, kritische Warnungen,
> offene Roadmap). Diese Chronik ist ein Archiv: Neue Meilenstein-Protokolle werden hier **unten
> angehängt** (Skill `log-progress`), bestehende Einträge werden nicht mehr umgeschrieben.
> Wo sich Chronik und CLAUDE.md widersprechen, gilt CLAUDE.md.

---

## Archiv: CLAUDE.md Abschnitt 0 (wörtlicher Stand bei Auslagerung, 08.08.2026)

## 0. AKTUELLER STAND (Stand: 24.06.2026 – Redesign-Phase)

#### 📧 Liga-Zuordnungsanfrage: fehlende Mails ergänzt (02.07.2026, `5430ce5`, live)
> Nachfrage-Check: Glocke funktionierte bereits, **Mails fehlten komplett** (bei der Erstimplementierung
> bewusst auf In-App beschränkt, war aber nicht der Wunsch). Jetzt ergänzt:
> - **`leagueChangeRequestEmail`** (`lib/emailTemplates.js`): geht bei jeder neuen Anfrage an
>   **Super-Admins + info@hoopsgermany.de** (`getAdminNotifyTo()`, gleiches Muster wie `teamPendingEmail`) –
>   Team/aktuelle Liga/gewünschte Liga/Notiz + direkter CTA-Link **„Anfrage jetzt prüfen" → `/admin/league-
>   requests`**.
> - **`leagueChangeApprovedEmail`/`leagueChangeRejectedEmail`**: gehen bei Genehmigung/Ablehnung an den
>   **anfragenden Team-Admin** (`request.requestedBy`), inkl. optionaler Rückfrage-Notiz des Super-Admins,
>   CTA zurück ins Team-Panel (`?tab=einstellungen`).
> - Beide Stellen `try/catch`-**best-effort** (wie alle bestehenden Mail-Flows) – ein Mail-Fehler blockiert
>   nie die eigentliche Anfrage/Freigabe.
> ✅ **Live auf Prod real getestet** (lokal fehlen SMTP-Zugangsdaten): Demo-Team-Admin (`demo.coach@nrw-demo.de`,
>   Köln Comets) stellte eine echte Anfrage → **Glocke bei Patrick UND Jonatan bestätigt** (DB-Check: je 1
>   `league_change_request`-Notif mit korrektem Text), keine SMTP-Fehler in den PM2-Logs. Ablehnung über einen
>   temporären Test-Admin-Account (echte Admin-Zugangsdaten wurden seither geändert, s. Roadmap #1) →
>   `league_change_rejected`-Notif beim Demo-Team-Admin korrekt inkl. Rückfrage-Text. **Alle Testartefakte
>   danach entfernt** (temp Admin-Account, die Test-Anfrage, beide Test-Notifications) – Köln Comets'
>   `leagueId` war nie betroffen (Ablehnung ändert nichts). ⚠️ **Ob die zwei Test-Mails tatsächlich in den
>   Postfächern ankamen, muss der User selbst bestätigen** (Claude kann keine externen Postfächer lesen) –
>   zu prüfen: `p.schemura@gmail.com`, `jonatanbaenavides@gmail.com`, `info@hoopsgermany.de`.

#### 🗺️ Regierungsbezirk-Navigation + Kreis Niers + Liga-Zuordnungs-Freigabe (02.07.2026, `eb3ab34`, live)
> **1) Kreis Niers war nie „fehlend"** – er stand bereits korrekt in `BASKETBALLKREISE_NRW_GRUPPIERT`
> (Regierungsbezirk Düsseldorf). Ursache war die UI: der Kreis-Filter zeigte nur Kreise mit **vorhandenen**
> Ligen, alle anderen nur als pauschales „Weitere 17 folgen".
> - **`/ligen`**: neuer **Regierungsbezirk**-Filter (nur UI-Gruppierung aus der zentralen Konstante, **keine**
>   DB-Entität) – erscheint bei Spielklasse „Kreisliga". Basketballkreis-Dropdown zeigt jetzt **alle 22 Kreise**
>   gruppiert nach Bezirk; verfügbare mit **Liga-Anzahl** `(4)` (aus den ohnehin geladenen Ligen berechnet,
>   keine Zusatzabfrage), nicht verfügbare **sichtbar aber deaktiviert** „– noch keine Ligen" (kein
>   pauschaler Sammel-Eintrag mehr). Kreisliga-Katalog gliedert sich jetzt **Regierungsbezirk → Basketballkreis
>   → Bereich (Senioren Herren/Damen/U18/U16) → Staffel (numerisch)**.
> - **Such-Aliase** (`lib/constants.js` → `KREIS_ORT_ALIASE`, `kreisFromText()`): Orte wie „Viersen",
>   „Krefeld", „Mönchengladbach" … verweisen für die Suche auf `Kreis Niers`, **ändern aber nicht** den
>   kanonischen `region`-Wert. Nur Kreis Niers gepflegt; weitere Kreise bei Bedarf ergänzbar.
> - **Nutzerregion-Vorauswahl:** Heimatort/Bundesland des eingeloggten Spielers schlägt beim Kreisliga-
>   Schnellzugriff den passenden Kreis vor (Filter vorbelegt, jederzeit per Chip entfernbar) – **keine feste
>   Ligazuordnung**, nur Sortierung/Vorauswahl.
> - **`scripts/seed-kreisligen-demo-niers.mjs`** (eigener `seedTag:"kreisliga-demo-niers"`, additiv,
>   idempotent, `--dry`/`--purge`): 4 Kreisligen (1./2. Kreisliga Herren, 1. Kreisliga U18/U16 männlich) +
>   **18 klar fiktive „Demo "-Teams** (z. B. „Demo Viersen Vipers"), `isDemo:true` auf Liga **und** Team
>   (`Team.isDemo` additiv neu). Rührt nie echte Daten an (eigener Tag, getrennt vom Basis-Kreisliga-Seed).
> ✅ Verifiziert (Dev-Preview, alle Testfälle): Regierungsbezirk+Kreis erscheinen bei Kreisliga; Bezirk
>   Düsseldorf zeigt Niers+Düsseldorf(je vorhanden)+Niederrhein/Essen/Mettmann/Wuppertal (deaktiviert); Kreis
>   Niers → exakt 4 Ligen + Teams; Suche „Viersen"/„Krefeld" findet die Niers-Ligen; Filter zurücksetzen →
>   geführte Ansicht; kein Horizontal-Scroll (Desktop/Tablet/Mobile, scrollWidth=clientWidth). **Prod**: Code
>   deployt, Seed ausgeführt (4 Ligen live, korrekte Team-Zahlen + `isDemo:true`), `/ligen` 200.
>
> **2) Liga-Zuordnung im Team-Panel abgesichert** (neuer Freigabeprozess, kein Season-/Follow-Umbau):
> - **`/api/team/set-league`**: Team-Admins dürfen **offizielle** (`official:true`) Ligen nicht mehr direkt
>   speichern (→ 403, Hinweis auf die Anfrage). Direkt erlaubt bleibt: **Entfernen** (Liga rausnehmen) und
>   **Demo-/Test-Ligen** (`official:false`) – z. B. für die Kreisliga-Showcases. Ein zusätzlicher
>   Super-Admin-Bypass ist verdrahtet (`getAdminFromToken`), aber nur relevant, wenn dieselbe Person Team-
>   **und** Super-Admin ist (Randfall, code-geprüft statt live mit Testdaten durchgespielt).
> - **Neues Modell `LeagueChangeRequest`** (`team`, `currentLeagueId`-Snapshot, `requestedLeagueId`,
>   `season`, `requestedBy`, `note`, `status` ausstehend/genehmigt/abgelehnt/storniert, `reviewedBy`,
>   `reviewNote`, `reviewedAt`) + Endpunkte: `POST /api/team/request-league-change` (Validierung: Zielliga
>   nicht abgeschlossen, nicht bereits aktuell, **passt zu Altersklasse+Kategorie der aktuellen Liga** falls
>   vorhanden, **keine zweite offene Anfrage**), `league-change-requests` (eigene Historie),
>   `cancel-league-change-request`; `POST /api/admin/league-change-requests` (Liste + **Warnhinweis**, wenn
>   alte/neue Liga bereits Spiele hat, aus den ohnehin geladenen Daten berechnet) + `review-league-change-
>   request` (genehmigen/ablehnen; bei Genehmigung **konsistent**: `League.teams` alt `$pull`/neu
>   `$addToSet`, `Team.leagueId` gesetzt – **`TeamSeason` bleibt unangetastet**, nur Endstand-Snapshots).
> - **`EinstellungenTab`**: „**Aktuelle Liga**" jetzt schreibgeschützt (Name/Saison/Bereich/Kategorie/
>   Spielklasse/Region/Status); der alte „Liga speichern"-Button ist ersetzt durch ein **Anfrage-Formular**
>   (Bereich→Kategorie→Spielklasse→Regierungsbezirk/Kreis bei Kreisliga→Suche, dieselbe zentrale
>   Kreis-Konstante wie `/ligen`), **Ziel-Liga startet leer** („Bitte gewünschte Liga auswählen") und
>   **resettet bei Filterwechsel**, wenn die Auswahl nicht mehr passt. Bei offener Anfrage wird **kein**
>   neues Formular gezeigt, sondern Status + „Anfrage stornieren"; letzte 3 bearbeitete Anfragen als
>   Mini-Historie. Neue Notification-Typen `league_change_request/_approved/_rejected`.
> - **Neue Admin-Seite `/admin/league-requests`** (+ AdminNav-Link „Liga-Anfragen"): ausstehende Anfragen
>   mit Team/aktueller/gewünschter Liga/Notiz/**Spiele-Warnung**, Genehmigen/Ablehnen (+ Rückfrage-Notiz),
>   bearbeitete Anfragen als Verlauf mit Status-Badge.
> ✅ Verifiziert (Dev, end-to-end über echte API-Calls): Duplikat-Anfrage → 409; Alters-/Kategorie-Mismatch
>   (Senioren-Team fragt U16-Liga an) → 400 mit Klartext-Meldung; Anfrage auf bereits-aktuelle Liga → 400;
>   Genehmigen → `Team.leagueId` + `League.teams` konsistent aktualisiert + Notif an Team-Admin; Ablehnen →
>   `Team.leagueId` **unverändert** + Notif mit Ablehnungsgrund; direkter Versuch auf offizielle Liga → 403,
>   auf Demo-Liga/Entfernen → 200; Admin-Seite zeigt Ausstehend/Genehmigt/Abgelehnt/Storniert korrekt. Dev-
>   Testdaten (Anfragen + Kreisliga-Demo) entfernt, `seed-demo.mjs` zum Zurücksetzen gefahren. **Prod**: Code
>   deployt (`eb3ab34`), noch keine echten Anfragen (Feature ist einsatzbereit für den Test).

#### 🧭 Ligen-Seite: Filterführung, responsives Grid, Sortierung + Demo-noindex (02.07.2026, `3600f3e`, live)
> Feinschliff vor dem Nutzertest (UI-only, keine Follow-/Season-/Datenmodell-Architektur).
> - **Demo-noindex:** `app/ligen/[id]/layout.js` (Server) `generateMetadata` → `robots noindex/nofollow` bei
>   `isDemo` (echte Ligen indexierbar). Fehlende Sitemap verhindert Indexierung nicht → expliziter Meta-Robots.
>   Live bestätigt: Demo-Detailseite `noindex,nofollow`, echte Liga kein robots-Meta.
> - **Saisonfilter → Status:** „Aktuelle Saison" (nutzte nur `active`) ersetzt durch ehrlichen **Status**-Filter
>   (Aktive/Alle/Abgeschlossene/In Vorbereitung). Keine Season-Modell-Migration.
> - **„Deine Liga"-Quelle dokumentiert** (Skill `current-architecture.md`): führend ist die
>   **`League.teams`-Mitgliedschaft** (Client hat via `getmyinfo` nur `teamId`); **`Team.leagueId`** ist
>   kanonisch; Risiko Mehrfach-Saison-Mitgliedschaft → Auswahl bevorzugt die aktive Liga. Kein Umbau.
> - **`/api/leagues?scope=all`** (nur `/ligen`; Default „aktiv" bleibt für die Team-Picker).
> - **Redundanz entfernt:** Schnellzugriffe nur in der geführten Ansicht; im Durchsuchen-Modus ist die Auswahl
>   nur in Filterfeldern + aktiven Chips sichtbar (keine dritte Darstellung).
> - **Filter vereinfacht:** kombinierter **Bereich** (Alle/Senioren/U18/U16) statt separatem Altersklassenfilter;
>   dynamische **Kategorie** (Herren/Damen bzw. männlich/weiblich/offen bei Jugend – Datenwerte unverändert,
>   nur Anzeige-Mapping); **Spielklasse** bereichsabhängig (aus vorhandenen Daten); **Basketballkreis** nur bei
>   Kreisliga, zeigt **verfügbare Kreise + „Weitere N folgen"** (keine 17 disabled-Einträge). Bundesland-Dropdown
>   erst ab **≥2 Ländern**, sonst Region-Hinweis (technischer Filter bleibt erhalten).
> - **Responsive, KEIN Horizontal-Scroll:** Suche eigene volle Breite; Filter-**Grid** (1 / sm:2 / lg:3 Spalten)
>   statt nicht-umbrechender Flex-Reihe; `overflow-x-hidden` am Container, `w-full`/`min-w-0`. Mobil hinter
>   „Filter (N)" + „Ergebnisse anzeigen". Verifiziert Desktop/Tablet(768)/Mobile(375): scrollWidth = clientWidth.
> - **Gruppierte Sortierung:** Startansicht + ungefilterter Katalog nach **Bereichsgruppen** (Senioren Herren/
>   Damen · U18 · U16 · Kreisligen), je Gruppe fachlich (laufend→Teams→Level→Region→**Staffelnummer numerisch**→
>   Name); gefilterter Bereich → flache Liste **ohne** Fremdgruppen. Gleichnamige Ligen via **Region-Zeile**
>   unterscheidbar (Karte: Name · Kategorie·Alter·Region · Saison·Teams · Badges).
> ✅ Verifiziert (Preview, alle 12 Abnahmekriterien) + Prod-Smoke. Dev ge-`--purge`t.

#### 🧭 Ligen-Seite: geführte Startansicht + Nachbereitungs-/Sicherheitscheck (02.07.2026, `7e69f12`, live)
> Nachbereitung nach dem Kreisliga-Framework (UI-only, keine Datenmodell-/Follow-/Season-Architektur).
> - **Doku (Teil 1):** Basketballkreis-Liste von „provisorisch" auf **verifiziert** (offizielle WBV-Seite,
>   Stand 02.07.2026) umgestellt – in `lib/constants.js`, `wbv-nrw-catalog.md`, `current-architecture.md`.
> - **Demo-Kennzeichnung (Teil 2):** neues additives Feld **`League.isDemo`**; `seed-kreisligen-demo.mjs`
>   setzt `isDemo:true`; `/api/leagues` liefert `isDemo`; Ligakarte zeigt Badge **„Beispieldaten"**. Demo bleibt
>   `official:false` → **zählt NICHT** in die Analytics-Plattform-KPI (`countDocuments({official:true})`). **Keine
>   Sitemap** im Projekt (nichts auszuschließen). `--purge` matcht **ausschließlich `seedTag:"kreisliga-demo"`**
>   (nie echte Ligen mit ähnlichem Namen – verifiziert).
> - **Zentrale ageGroup-Validierung (Teil 3):** `normalizeAgeGroup()` in `lib/leagues.js` (trim + case-insensitiv
>   → kanonisch, sonst null). `createleague`/`updateleague` nutzen sie. **Getestet:** Senioren/U18/U16→ok,
>   U14/U12/U15/leer→400, fehlend→Default Senioren, `u16`/` U16 `→normalisiert (create+update je 200/400 korrekt).
> - **Ligen-Seite neu (Teil 6, `app/ligen/page.js`):** **geführte Startansicht** (Schnellzugriff-Chips
>   Senioren Herren/Damen · U18 · U16 · Kreisligen · Alle durchsuchen; **„Deine Liga"** via Team-in-`League.teams`
>   – KEIN Follow-System; **„Aktive Ligen entdecken"** max. 12, ohne leere/abgeschlossene; **„Alle N durchsuchen"**)
>   ↔ **Durchsuchen-Modus** (Filter + Suche + aktive Filter-Chips + Zähler + „Filter zurücksetzen"; **fachliche
>   Sortierung** eigene Liga → laufend → Teams → Level → Alter → Geschlecht → **Staffelnummer numerisch** → Name;
>   Badges „Abgeschlossen"/„In Vorbereitung"/„Beispieldaten"; Empty States; **Mobile-Filter-Panel**). Filter/Suche
>   aktivieren automatisch den Durchsuchen-Modus; Kreis-Filter nur NRW+Kreisliga, resettet bei Wechsel.
> ✅ Verifiziert (Dev-Preview): geführt (ausgeloggt 9 Karten, keine finished/empty), „Deine Liga" (max→
>   Regionalliga Süd), Kreisligen-Chip→Kreis-Filter→Köln 4 Ligen (Staffel 1 vor 2, Teams vor leer), U18-Chip nur
>   U18, Reset→geführt, Mobile-Toggle; Validierung create+update alle Fälle; Build grün, keine Konsolenfehler.
>   Dev ge-`--purge`t. **Prod** (`7e69f12`): `/ligen` 200, 14 `isDemo`-Kreisligen, 57 official (KPI unverändert).

#### 🏀 Kreisligen (Framework + Demo) + Skill `league-catalog` (02.07.2026, `e63f5c3`, live)
> Kreisliga-Fundament gebaut (Testphase; echte WBV-Daten folgen separat). **Vorab ChatGPTs Ligen-Plan gegen
> den echten Code geprüft** – zentrale Produktregel (nur Senioren/U18/U16) war längst umgesetzt, „Aktuelle
> Saison" = `active`-Flag (kein Datum), Liga-Follow/competitionType/Basketballkreis-Entität existieren NICHT.
> - **Skill `.claude/skills/league-catalog/`** (SKILL.md + `references/`: current-architecture / product-rules
>   / wbv-nrw-catalog / change-checklist): verbindliche Liga-/Saison-/Playoff-/Kreisliga-Logik, trennt
>   **Ist-Zustand / Produktregeln / Tech-Schulden / Zukunftsentscheidungen**. Aufruf `/league-catalog`,
>   greift bei ligaabhängigen Aufgaben. **Kein** autonomer Agent (bewusst).
> - **`lib/constants.js`**: `BASKETBALLKREISE_NRW` + `_GRUPPIERT` (22 Kreise nach Regierungsbezirk).
>   ⚠️ **PROVISORISCH** (ChatGPT-Recherche, NICHT gegen offizielle WBV-Quelle verifiziert – vor „echt" prüfen).
> - **`/ligen`**: bedingter **Basketballkreis-Filter** (nur NRW + Kreisliga), Optionen nach Bezirk gruppiert
>   (optgroup), nicht vorhandene Kreise deaktiviert („– folgt"), setzt sich zurück wenn nicht mehr anwendbar.
> - **Serverseitige `ageGroup`-Validierung** in `createleague`/`updateleague`: nur `LEAGUE_AGE_GROUPS`
>   (Senioren/U18/U16), **U14 & jünger → 400** (härtet den Produkt-Cutoff über die API, nicht nur UI-Dropdown).
> - **`scripts/seed-kreisligen-demo.mjs`** (additiv, `seedTag:"kreisliga-demo"`, idempotent, `--dry`/`--purge`):
>   14 Demo-Kreisligen (5 Kreise über alle 5 Bezirke: Köln/Düsseldorf/Dortmund/Münster/Paderborn; je 1./2.
>   Kreisliga Herren + für Köln/Düsseldorf zusätzlich U18/U16 männlich). `official:false` (Demo). Beispiel
>   „1. Kreisliga Herren – Kreis Köln" mit 4 Demo-Teams befüllt. Namen enthalten den Kreis (eindeutig).
> ✅ Verifiziert: Dev-Preview (Filter erscheint NRW+Kreisliga → 5 Bezirks-Optgroups, nur 5 Kreise aktiv;
>   Kreis Köln → exakt die 4 Köln-Ligen; Beispiel 4 Teams), Server-Validierung (U14→400, U16→201), Seed
>   idempotent (14 neu → 0/14). Dev danach ge-`--purge`t. **Prod**: Code deployt (`e63f5c3`), Seed auf
>   `hoops_prod` (14 Kreisligen, Live-API bestätigt: 5 Kreise, ageGroups U16/U18/Senioren, Köln 4 Teams).
> **Entfernen:** `node scripts/seed-kreisligen-demo.mjs --purge` (VPS). **Offen:** echte WBV-Kreisliga-Daten
>   (Namen/Kreise/Staffeln aus der ChatGPT-PDF **prüfen** + Umlaute) statt Demo; Kreis-Liste gegen WBV verifizieren.

> 🟢 **v2 IST LIVE auf https://hoopsgermany.de** (seit 24.06.2026, Hostinger-VPS, DB `hoops_prod`).
> Das Redesign (Navy/Slate + Orange + Canva-Logo) ist abgeschlossen und im Produktivbetrieb;
> Hauptflow live verifiziert. Details + offene Punkte siehe unten (Go-Live-Block + Roadmap).
> Alte Seite läuft als Rollback-Fallback weiter (PM2 `sports`, Port 3000, DB `test`).

#### 📣 Post-Funktionen erklärt (Composer-Hinweis + Tour) + Showcase-Testposts (01.07.2026, `12a9152`, live)
> Die neuen Post-Funktionen waren nur „entdeckbar", nicht erklärt. Jetzt:
> - **Composer-Hinweis** (`components/posts/PostComposer.js`): dezente Zeile unter dem Eingabefeld –
>   „**@** erwähnt Spieler · **#** Hashtag · ▶ Links & YouTube werden als Vorschau eingebettet · 🖼 Foto
>   anhängen" (immer sichtbar, `text-gray-400`).
> - **Plattform-Tour** (`components/onboarding/WelcomeTour.js`): Community-Slide nennt jetzt explizit
>   „mit Fotos, @Erwähnungen, #Hashtags und Video-Links (z. B. YouTube)".
> - **Showcase-Testposts** (`scripts/seed-showcase-posts.mjs`, **additiv/idempotent/purgebar**,
>   Tag `meta.showcase:true`, Idempotenz über `meta.showcaseKey`): 3 Demo-Posts, die die Funktionen zeigen –
>   (1) @Erwähnungen + #Hashtags, (2) YouTube-Einbettung, (3) externe Link-Vorschau (OG). Autor = Demo-Account
>   (Priorität `demo.coach@nrw-demo.de` → `world.coach@demo.de` → `max@test.de`; bricht ab, wenn kein
>   Demo-Autor da ist – **nie als echter Nutzer posten**). **@Erwähnungen bevorzugt Demo-Accounts**
>   (`@nrw-demo.de`/`@demo.de`) → keine echten Tester-Namen in Demo-Posts. YouTube-ID per **oEmbed validiert**
>   (echtes NBA-Video „The Top 100 Plays of the 2024-25 NBA Season"; **kein Rickroll-Fallback** – lieber den
>   YouTube-Post weglassen). Baut Mentions/Hashtags/Embeds (inkl. serverseitigem OG-Abruf) originalgetreu nach
>   (self-contained, keine `@/`-Alias-Importe); **keine** Mention-Notifs (kein Tester-Spam).
>   Aufruf: `node scripts/seed-showcase-posts.mjs` · `--dry` · **`--purge`** (entfernt nur die getaggten Posts).
> ✅ Verifiziert: Dev-Preview (Mentions/Hashtags klickbar, YouTube-Platzhalter click-to-load, OG-Karte),
>   Idempotenz (Re-Run 0 neu/3 aktualisiert), Dev danach ge-`--purge`t. **Prod**: Code deployt (`12a9152`),
>   Seed auf `hoops_prod` ausgeführt (Autor „Chris Trainer", Erwähnungen @AaronBeck/@AaronBrandt = Demo),
>   Live-API bestätigt 3 Posts mit korrekten Embeds/Mentions. **Entfernen nach der Testphase:**
>   `node scripts/seed-showcase-posts.mjs --purge` (auf dem VPS).

#### 🔒 Klick-zum-Laden für YouTube/Link-Vorschau + Datenschutz-Passus (01.07.2026, `14ba439`, live)
> Datenschutz-Härtung der Embed-Features (aus dem `update-onboarding-surfaces`-Durchgang hervorgegangen):
> Dritt-Inhalte werden nicht mehr automatisch geladen (IP-/Cookie-Abfluss an Fremd-Server erst nach Consent).
> - **`components/posts/PostEmbed.js`** (jetzt Client-Komponente): **Klick-zum-Laden**. YouTube zeigt einen
>   lokalen Platzhalter („Video von YouTube laden" + Hinweis) → Klick lädt den Player, und zwar im
>   **erweiterten Datenschutzmodus `youtube-nocookie.com`** (`?autoplay=1`). Externe Link-Vorschaubilder
>   zeigen einen „Vorschaubild laden"-Platzhalter → Klick lädt das Fremd-Bild (`referrerPolicy=no-referrer`,
>   lazy). **OG-Titel/Beschreibung/Domain bleiben sofort sichtbar** (das sind serverseitig gespeicherte
>   Daten, kein Dritt-Abruf). Karte umgebaut von einem `<a>` zu `<div>` + separatem Bild-/Text-Link (kein
>   verschachteltes interaktives Element). Domain-only-Karte (ohne OG) unverändert = kein Nachladen.
> - **`app/datenschutz/page.js`**: neuer **Abschnitt 10 „Eingebettete Inhalte Dritter (YouTube,
>   Link-Vorschauen)"** – beschreibt Klick-zum-Laden, No-Cookie, serverseitigen OG-Abruf (kein Nutzer-Abfluss),
>   Google-Datenschutz-Link; **Rechtsgrundlage Einwilligung per Klick (Art. 6 Abs. 1 lit. a DSGVO)**;
>   „Stand: → Juli 2026". ⚠️ Formulierung ist ein **Vorschlag, ersetzt keine Rechtsberatung** (Betreiber soll
>   gegenchecken lassen).
> ✅ Verifiziert (Preview): YouTube-Post → vor Klick 0 iframes/Platzhalter, nach Klick iframe mit
>   `youtube-nocookie.com`; Link-Post → vor Klick kein Fremd-Bild (Titel/Domain trotzdem sichtbar), nach Klick
>   Bild mit `no-referrer`; Datenschutz-Abschnitt 10 rendert. Build grün, keine Konsolenfehler, Test-Posts
>   entfernt. **Deployt** (`14ba439`; Live-Smoke: `/`+`/datenschutz` 200, Abschnitt 10 + no-cookie im HTML).
> **Offene rechtliche Entscheidung (Betreiber):** finale Datenschutz-Formulierung prüfen lassen; bei späterer
>   Monetarisierung (Roadmap #3) kommen weitere Dritt-Dienste + Consent-Banner hinzu.
> **Onboarding-/Marketing-Flächen** (Landing-Cards/Tour/Navbar/Checklist): beim `update-onboarding-surfaces`-
>   Durchgang **bewusst NICHT geändert** – die 5 heutigen Newsfeed-Features vertiefen den bestehenden Bereich
>   „Community & News" (bereits beworben + erreichbar); kein neuer Top-Level-Bereich.

#### 🅰️ @-Mention-Autocomplete jetzt auch in Kommentaren + Antworten (01.07.2026, `ce1faa5`)
> Ergänzung zum Composer-Autocomplete: die `MentionTextarea` wurde **generalisiert** und in den Kommentar-/
> Antwort-Feldern eingebunden → @-Vorschläge überall im Feed.
> - **`components/posts/MentionTextarea.js`**: neue Props `multiline` (default true → `<textarea>`, false →
>   `<input>`), `onEnter` (Absenden per Enter, **nur wenn die Vorschlagsliste geschlossen ist** – ist sie offen,
>   wählt Enter/Tab aus), `wrapperClassName` (z.B. `relative flex-1`), `autoFocus`. Gleiche Such-/Einfüge-Logik.
> - **`components/posts/PostCard.js`**: Kommentar- **und** Antwort-Eingabe nutzen jetzt
>   `<MentionTextarea multiline={false} onEnter={addComment|addReply} …>` statt `<input>` (Enter sendet
>   weiterhin; Antwort-Feld behält `autoFocus`).
> ✅ Verifiziert (Preview): im Kommentarfeld „@Bja" → 5 Bjarne-Treffer, Auswahl fügt `@BjarneAdler ` ein +
>   schließt die Liste, **Enter sendet** → Kommentar mit aufgelöster `mentions` gespeichert (slug
>   `bjarne-adler-w280`); Antwort-Feld nutzt dieselbe Komponente/Props; keine Konsolenfehler; Build grün.
>   Test-Artefakte entfernt.
> **➡️ Damit sind wirklich ALLE Newsfeed-Follow-ups erledigt** (inkl. des zuvor bewusst offen gelassenen
>   Kommentar-Autocompletes).

#### 🅰️ Composer: @-Mention-Autocomplete (01.07.2026, `b219e6d`)
> Letzter offener Newsfeed-Follow-up erledigt: Der Beitrags-Composer schlägt beim Tippen von „@" jetzt Spieler
> vor (vorher musste man `@Vorname`/`@VornameNachname` blind tippen).
> - **Neue Komponente `components/posts/MentionTextarea.js`** (wiederverwendbar): erkennt das aktive `@`-Token
>   direkt vor dem Cursor (`activeMention`), fragt ab 2 Zeichen **debounced** (200 ms) `/api/player/search`
>   ab (kein Auth nötig) und zeigt eine Vorschlagsliste (Avatar + Name + „Position · Team", erster Treffer
>   markiert). Bedienung per **Tastatur** (↑/↓, Enter/Tab wählt, Esc schließt) **und Maus** (`onMouseDown` vor
>   Blur). Auswahl fügt den Handle **`@VornameNachname`** ein (`toHandle` = nur Buchstaben/Ziffern) – exakt die
>   Form, die serverseitig `resolveMentions` wieder auflöst; Cursor landet hinter der Einfügung. Klick außerhalb
>   schließt die Liste.
> - **`components/posts/PostComposer.js`**: statt der einfachen `<textarea>` die `MentionTextarea` (gilt für
>   Spieler- **und** Vereins-Modus; Platzhalter-Hinweis „Tippe @ für Erwähnungen").
> ✅ Verifiziert (Preview, `max@test.de`): „@Bja" → Liste mit 13 Bjarne-Treffern; Auswahl „Bjarne Adler" fügt
>   `@BjarneAdler ` ein (Cursor am Ende); Beitrag gepostet → `mentions` serverseitig aufgelöst (slug
>   `bjarne-adler-w280`); Liste schließt nach Auswahl; keine Konsolenfehler; Build grün. Test-Post entfernt.
> **➡️ Damit sind ALLE optionalen Newsfeed-Follow-ups abgeschlossen** (Team-News-Tab, Mentions/Links in
> Kommentaren, Open-Graph-Link-Vorschau, Composer-@-Autocomplete). Bewusst offen bleibt nur ein
> @-Autocomplete in **Kommentar-/Antwort-Feldern** (dort `<input>`, MentionTextarea ist auf `<textarea>` ausgelegt).

#### 🔗 Link-Karten mit Open-Graph-Vorschau (Titel/Bild/Beschreibung) (01.07.2026, `3346117`)
> Newsfeed-Follow-up „OG-Title/Image für Link-Karten" erledigt: Bisher zeigte die Link-Vorschaukarte nur
> **Domain + rohe URL** (generisches Globus-Icon). Jetzt reiche Vorschau im WhatsApp-Stil (Thumbnail +
> Überschrift + Beschreibung):
> - **`lib/linkEmbed.js`**: neue async `enrichEmbed(embed)` → `fetchOgMeta(url)` ruft die Zielseite **einmal
>   beim Erstellen** ab und liest `og:title`/`og:description`/`og:image` (Fallbacks: `twitter:*`, `<title>`)
>   aus dem `<head>`; Ergebnis wird am `embed` **denormalisiert gespeichert** (kein Fetch/populate im Render).
>   Vollständig **fehlertolerant** (Timeout 4 s, nur `text/html`, Head-only ~256 KB, relative Bild-URLs →
>   absolut) + einfacher **SSRF-Schutz** (`isSafePublicUrl`: nur http(s), keine localhost/privaten IPs/`.local`;
>   kein DNS-Rebinding-Schutz – für den Umfang ok). `detectEmbed` bleibt synchron; YouTube braucht keine OG-Daten.
> - **`uploadpost` + `team-post`**: `const embed = await enrichEmbed(detectEmbed(content))`.
> - **`components/posts/PostEmbed.js`**: bei `embed.title || embed.image` → volle Karte (Thumbnail 16:44,
>   Domain-Label, Titel 2-zeilig, Beschreibung 2-zeilig; `<img loading=lazy referrerPolicy=no-referrer>`);
>   sonst weiterhin die kompakte Domain-Karte (Fallback). `line-clamp` ist in Tailwind 3.4 eingebaut.
> ✅ Verifiziert: `enrichEmbed` liefert für `de.wikipedia.org/wiki/Basketball` Titel „Basketball – Wikipedia"
> + Wikimedia-`og:image`; localhost-URL → SSRF-Guard greift (keine Anreicherung); end-to-end Beitrag erstellt
> → Embed mit Titel/Bild gespeichert → Permalink rendert Thumbnail + Titel + Domain; Build grün. Bestehende
> Beiträge ohne OG-Felder rendern unverändert die Domain-Karte (additiv, keine Migration). Test-Post entfernt.

#### 💬 Hashtags/@Mentions/Links auch in Kommentaren + Antworten (01.07.2026, `dd01446`)
> Newsfeed-Follow-up „Mentions/Embeds auch in Kommentaren" erledigt: Bisher wurden `#Hashtags`, `@Mentions`
> und URLs nur im **Beitragstext** geparst/verlinkt, nicht in Kommentaren/Antworten. Jetzt:
> - **Modell** (`models/Post.js`): `comment`- und `reply`-Subschema um `mentions[]` (playerId/slug/token,
>   gleiche Form wie beim Post) erweitert – additiv, keine Migration.
> - **APIs** (`addcomment`/`addreply`): `resolveMentions(text)` beim Speichern, Mentions am Sub-Dokument
>   abgelegt und erwähnte Spieler via `notifyMentions` benachrichtigt (neuer optionaler `context`-Parameter →
>   Meldung „… hat dich in **einem Kommentar** / **einer Antwort** erwähnt"; Notif-Typ bleibt `mention`,
>   Href → `/post/[id]`). Kein Self-Notify (bestehende Logik).
> - **Render** (`components/posts/PostCard.js`): Kommentar- und Antworttext laufen jetzt über `RichText`
>   (klickbare `@Mentions` → Profil, `#Hashtags` → `/feed/tag/[tag]`, rohe URLs → extern) statt Plain-Text.
> - **Bewusst NICHT** volle YouTube-/Link-**iframe-Embeds** in Kommentaren (nur klickbare Links) → hält
>   Kommentar-Threads kompakt; Embeds bleiben Beiträgen vorbehalten.
> ✅ Verifiziert (Preview + DB): Kommentar „…@BjarneAdler … #Testtag https://youtu.be/…" → Mentions am
> Kommentar gespeichert (slug `bjarne-adler-w280`), Bjarne erhält `mention`-Notif („in einem Kommentar"),
> alle drei Token im Kommentar klickbar gerendert; Build grün. Test-Artefakte (Dev-DB) wieder entfernt.

#### 📰 Team-Profilseite: News-Tab zeigt jetzt Team-Beiträge + Auto-Posts (01.07.2026, `916d9ce`)
> Offener Newsfeed-Follow-up erledigt: `/team/team-detail/[slug]` (News-Tab) zeigte bislang **nur Beiträge
> der Mitglieder** – **Vereins-eigene Beiträge** (`authorTeam`, Feature #6) und **team-bezogene Auto-Posts**
> (Ergebnis/Transfer/Recruiting, `teams` enthält das Team) fehlten komplett. Fix in
> `fetchsingleteaminfo`: Query jetzt `{$or:[{authorTeam:teamId},{teams:teamId},{player:{$in:memberIds}}]}`
> (Limit 15, neueste zuerst) mit voller populate (`authorTeam`, `comments.player`,
> `comments.replies.player`). **Rendering vereinheitlicht:** der News-Tab nutzt jetzt `PostCard` (Badges
> „Verein"/„Transfer"/…, Bilder, YouTube/Link-Embeds, Hashtags/@Mentions, Like/Kommentar/Antwort) statt der
> alten manuellen Minimal-Darstellung; eigene Spieler-ID wird ohne Login-Redirect geladen (nur Like-
> Hervorhebung). ✅ Verifiziert (Preview): Aachen Aces → Team-Beitrag „neue Trainingshalle" (Verein-Badge)
> + Auto-Post „Marko Otto wechselte zu Aachen Aces" (Transfer-Badge) + Mitglieder-Posts; Build grün, keine
> Konsolenfehler. Rückwärtskompatibel (keine Migration; `teams`/`authorTeam` waren additiv aus der
> Newsfeed-Roadmap). Damit ist der Follow-up „Beiträge-Tab auf `/team/team-detail`" abgeschlossen.

### Projektort & Umgebung
- **Lokaler Pfad: `C:\dev\hoops-germany-v2`** (NICHT zurück nach OneDrive – OneDrive sperrt `.next`).
- Next.js **14.2.35**, App Router, JavaScript (kein TS), Tailwind.
- `.env` lokal vorhanden (MongoDB-Atlas, `SECRET_KEY`, `CRON_SECRET`, `NEXTAUTH_URL=http://localhost:3000`). SMTP/Google noch leer.
- Start: `npm run dev` → http://localhost:3000. DB-Test: `node scripts/dbcheck.mjs`.
- **Demo-Daten befüllen: `node scripts/seed-demo.mjs`** (4 Teams, 18 Spieler + 2 Super-Admins,
  Liga 2025/26 + Vorsaison-Transfer für Max, abgeschlossene Spiele + Box-Scores, Posts, Follower,
  Bundesländer/Städte → Stats/Topscorer/Tabelle/Spielplan/Stationen/Geo-Filter gefüllt).
- **Test-Accounts (alle PW `test123`):** Spieler `max@test.de` (= Team-Admin „Test Baskets",
  hat FIBA/Instagram + Vorsaison-Transfer), weitere `@test.de`, Free Agents `sven.adler@test.de`/`jay.carter@test.de`.
  **Super-Admins** (Spieler-Login): `p.schemura@gmail.com`, `jonatanbaenavides@gmail.com`;
  /admin-Panel: `admin`/`geheim1234` ODER `patrick`/`test123` · `jonatan`/`test123`. **`team@test.de` existiert NICHT mehr**.

### ⚠️ Datenbanken (KRITISCH – vor schreibenden DB-Aktionen lesen)
Cluster `hoops.tbhsg.mongodb.net` hat ZWEI getrennte DBs:
- **`hoopsgermany`** = lokale **Dev-DB** des v2-Neubaus (lokales `.env`). `seed-demo.mjs` darf hier löschen/neu anlegen.
- **`test`** = **PRODUKTIV-DB der alten Live-Seite** (alter Code verbindet ohne DB-Namen → Default `test`).
  Echte Nutzer/Feedback. **NIEMALS schreiben/löschen.** Geprüft 24.06.: Seeds liefen nur gegen `hoopsgermany`.
- **Launch-Entscheidung (final mit Patrick & Jonatan):** kompletter Neustart, **keine Migration**.
  v2 startet mit frischer DB, beide registrieren sich neu. Alte `test`-Daten erst beim **Cutover** löschen
  (alte Live-Seite läuft bis dahin als Fallback).

### Versionierung / Backup
- **Off-Machine-Backup: privates GitHub-Repo `github.com/Schemura98/hoops-germany-v2`.**
- Branches: **`main`** = sauberer Wiederherstellungspunkt (v2 vor Redesign), **`redesign`** = aktiver Arbeits-Branch (hier wird gearbeitet, nach jedem Meilenstein committen + pushen).
- `.env` ist gitignored; nur `.env.example` (leer) ist eingecheckt.

> 📌 **KONVENTION (verbindlich): Fortschritt IMMER hier dokumentieren.** Nach **jedem Meilenstein/
> Commit** ist dieser **Abschnitt 0** zu aktualisieren (was umgesetzt wurde + Datei-/Endpoint-Namen +
> Commit-Hash, Roadmap pflegen). CLAUDE.md ist die **kanonische, session-übergreifende Quelle** –
> das private Session-Gedächtnis ersetzt sie nicht. Dafür gibt es die Skill **`log-progress`**
> (`.claude/skills/log-progress/`). So fehlt auch bei einem späteren Umbau der Live-Seite nichts.
>
> 📌 **KONVENTION (verbindlich): Bei neuen Funktionen Feedback & Analytics mitpflegen.** Wird ein
> **neuer nutzersichtbarer Bereich/eine neue Funktion** gebaut, das **Feedback-Formular** (Themen-Chip
> in `app/feedback/page.js` `AREAS`) und das **Analytics-Tool** (Bereichs-Bündelung im `$switch` von
> `app/api/analytics/summary/route.js`; bei zählbarer Kennzahl zusätzlich Plattform-Überblick +
> `app/admin/analytics/page.js`) aktualisieren. Dafür gibt es die Skill **`update-feedback-analytics`**
> (`.claude/skills/update-feedback-analytics/`).
>
> 📌 **KONVENTION (verbindlich): Bei neuen Funktionen die Onboarding-/Erklär-Flächen mitpflegen.** Wird ein
> **neuer nutzersichtbarer Bereich/eine neue Kernfunktion** gebaut, prüfen, ob die **Startseite** (Feature-Cards
> `app/page.js` `features` + `components/landing/*`), die **Plattform-Tour** (`components/onboarding/
> WelcomeTour.js`), die **Navigation** (Navbar/PlayerNav/Footer – neuer Bereich MUSS erreichbar sein) und die
> **Onboarding-Checklist** (`components/onboarding/OnboardingChecklist.js`) mitwachsen müssen. **Rechtstexte
> (Impressum/Datenschutz) nur bei echten Faktenänderungen/Dritt-Diensten – im Zweifel dem User zur rechtlichen
> Prüfung melden, nicht selbst formulieren.** Dafür gibt es die Skill **`update-onboarding-surfaces`**
> (`.claude/skills/update-onboarding-surfaces/`).

### Architektur-Konventionen (etabliert, bitte beibehalten)
- **lib/**: `db.js`, `auth.js`, `serverAuth.js` (`getPlayerFromToken`, `getTeamFromToken`=Dual-Auth, `getAdminFromToken`), `clientAuth.js`, `apiResponse.js` (`ok`/`fail`/`withErrorHandling`), `slug.js`, `matchScore.js`, `timeAgo.js`, `constants.js`, `useCurrentPlayer/Team/Admin.js`.
- **API-Pattern**: `connectDB()` → prüfen → Logik → `ok()/fail()`, in `withErrorHandling`.
- **Modelle**: immer `mongoose.models.X || mongoose.model("X", …)`. ⚠️ Schema-Änderungen an Modellen greifen erst nach **Dev-Server-Neustart** (mongoose cached das Model).
- **Teams sind spieler-geführt (NEU, 24.06.):** kein eigener Team-Login mehr. Ein Spieler
  gründet ein Team via `/team/create` → wird Admin (`adminPlayerId`, `isTeamAdmin`,
  `teamAdminOf`, eigenes `teamId`). Verwaltung von `/team/admin` läuft über den **Spieler-Token**
  (Dual-Auth). `/team/login` & `/team/register` sind nur noch Redirects. `Team.email` ist optional (sparse).
- **Design-Sprache (Redesign):** helle Seiten (`gray-50`) + **Navy-Flächen** (`bg-gradient-to-r from-slate-950 to-slate-800`) + Orange-Akzente (`brand-*`, `brand-500=#f97316`) + `font-black`-Headlines + Inter. Echte Assets in `public/images/` (`logo.svg` = weiße Wortmarke für Navy-Navbar; `logo-hoops.svg` = dunkel für helle Auth-Seiten; `login image.jpg`/`signupImage.jpg`/`registerimage.jpg` = Hero-Motive).
- **Wiederverwendbare Redesign-Bausteine:** `components/layout/AuthShell.js` (Split-Screen Auth),
  `components/layout/PageHeader.js` (Navy-Banner für Listen), `components/Avatar.js`
  (generiertes Initialen-Logo mit deterministischer Namensfarbe – Fallback für Spieler & Teams, überall),
  `components/player/PlayerProfileView.js` (komplettes Spieler-Profil: Stats-Leiste, Tabs,
  Karriere-Bilanz, Karriere-Verlauf/Transfers, Spielerstationen, Saison-Filter),
  `components/CityInput.js` (Stadt-Typeahead), `components/CityRadiusFilter.js` (Umkreis-Filter),
  `components/layout/Navbar.js` (öffentlich, login-bewusst). (`ProfileHero`/`CareerStats`/`FollowList` entfernt.)
- **Designsystem-Primitive (NEU, `components/ui/`):** `Button` (Varianten primary/secondary/ghost/danger/
  dangerGhost + Größen sm/md/lg, `href`→Link), `Tabs` (einheitlicher Pill-Umschalter – plattformweit statt
  Eigenbau), `Card` (rounded-2xl/border/shadow), `EmptyState` (Icon+Titel+Text+Aktion), `Loading`
  (Basketball-Spinner), `Skeleton`/`SkeletonCard`/`SkeletonList`. Tokens in `lib/ui.js` (`inputClass`,
  `inputClassSm`, `cardClass`). **Konvention:** neue/überarbeitete Seiten IMMER diese Primitive nutzen
  (keine Ad-hoc-Buttons/Tabs/Spinner mehr). ⏳ **Rollout-Status:** Welle 1 (öffentliche Listen: spiele/teams/
  spieler/ligen/tryouts/topscorer/transfermarkt) ✅ erledigt (`9712a92`); Welle 2 Detailseiten
  (team-detail + PlayerProfileView Tabs→Pill, Loading auf team/player/match/liga) ✅ erledigt (`b8e3a30`);
  Welle 3 Formulare/Auth (login/signup/reset/update-password/team-create/edit-profile: zentrale
  `inputClass`, `<Button>`, `<Loading>`) ✅ erledigt (`58fd740`); Welle 4 Newsfeed (Feed-Tabs→Pill,
  Loading/EmptyState/Button; TeamMatchesWidget-Tabs→Pill) ✅ erledigt (`207247f`); Welle 5
  Team-Panel (`/team/admin` Tab-Leiste→Pill mit erhaltenen Refs/Deeplink, Loading/Button) +
  Formular-Dedup (feedback/kontakt/admin-login → zentrale `inputClass`) ✅ erledigt (`44cc09b`).
  **➡️ Designsystem-Rollout abgeschlossen (Wellen 1–5).** Bewusst belassen (custom/kompakt, kein
  visueller Eingriff): lokale `inputClass` in `team/claim`, `admin/leagues`, `admin/update-match`.
  Optionaler Restschliff: Super-Admin-Tabellen/„Lädt…"-Texte könnten noch auf `<Loading>`/`EmptyState`.
- **Geo-Suche:** Feld `bundesland` an Player/Team/League; `lib/geo.js` + `public/data/de-cities.json`
  (16.172 Orte mit lat/lng, lazy geladen) für Stadt+Umkreis (Haversine). Stadt-Eingabe per Typeahead
  setzt das Bundesland automatisch.
- Token-Keys in localStorage: `playerAuthToken`, `teamAuthToken` (legacy, kaum noch genutzt), `adminAuthToken`.

### Redesign-Fortschritt (Branch `redesign`) – Production-Build grün (119 Seiten)
✅ **Fertig & im Browser verifiziert – alle Hauptbereiche im Navy/Orange-Look:**
- Theme, **globale Navbar** (Navy+Logo+Suche+Glocke+Login-State+Mobile), **Landing** (Vollbild-Hero)
- **Auth** (login/signup/reset/team-login+register → via `AuthShell`; team-login/register sind Redirects)
- **Spieler**: Liste (Bundesland-/Umkreis-/Positions-Filter, generierte Logos), **Profil neu** (`PlayerProfileView`:
  Stats-Leiste, Tabs Stats/Steckbrief/Beiträge, Karriere-Bilanz, **Karriere-Verlauf mit Transfer-Markierung**,
  **Spielerstationen** nach Team+Liga, **Saison-Filter**, **Follower-Zeile**, FIBA/Instagram); edit-profile; PlayerNav→Navy
- **Teams**: Liste (Navy-Banner, generierte Logos), Team-Detail (Navy-Hero + Tabs), **Team-Admin-Panel** (6 Tabs,
  KaderTab zeigt echte Mitglieder + Slots); **spieler-geführte Teams** (`/team/create`, `/api/team/create`, `remove-member`)
- **Wettbewerb**: `/spiele` (Navy-Banner), **Match-Detail** (Navy-Scoreboard + Box-Scores + Top-Scorer),
  Topscorer, Ligen (Liste+Tabelle, Bundesland-Filter), Tryouts, Transfermarkt
- **Community**: Newsfeed (`/home`→`/player/newsfeed`), Posts/Like/Kommentar, **Team-Folgen mit Inhalt**
  (gefolgte Teams im „Folge ich"-Feed + `match_result`-Benachrichtigung an Follower), Suche
- **Super-Admin-Panel** (AdminNav→Navy), **Rechtsseiten** mit echten Betreiberdaten (Patrick Schemura, Viersen)
- **Geo-Suche** Stufe 1 (Bundesland) + Stufe 2 (Stadt+Umkreis), City-Typeahead in Formularen mit Bundesland-Autofill
- **Strukturiertes Feedback-Formular** (`/feedback`: Sterne, Art-Chips, Themen-Chips, gezielte Fragen → DB + Admin-Inbox)
- **Generierte Namens-Logos** überall (Listen, Profile, Spielplan, Match, Navbar-Suche, Post-Avatare)
- **3 latente Bugs gefixt**: Liga-Tabellen-Query (`status` fehlte), Match-Detail `populate` (MissingSchemaError → 500),
  `/home`-Platzhalter; außerdem „Mein Profil"-Navbar-Link zeigte fälschlich auf den Newsfeed → gefixt

#### Update (Stand jetzt) – alle Flows getestet, Newsfeed ausgebaut, Mail-System erweitert
- **Alle Mehrstufen-Flows verifiziert** (Ergebnis-Verifikation, Beitritt, Tryout, Like/Kommentar,
  **Slot-Claim**): Kader-Tab-Fix (Mitgliederliste aktualisiert nach Slot-Genehmigung sofort).
- **Newsfeed → 3-Spalten-App-Layout** (mobil gestapelt) mit scrollbaren Widget-Clustern:
  - **Spiele-Widget** (links): nächste Spiele + letzte Ergebnisse des eigenen/gefolgten Teams,
    Tabs + Bereichs-Toggle (`/api/player/my-matches`).
  - **Top-Teams-Widget** (links): Rangliste (W/L + Korbdiff) mit Liga-/Bundesland-Filter
    (`/api/teams/standings`); Vollansicht-Seite **`/rangliste`**.
  - **Transfer-Widget** (rechts): Transfers gefolgter Personen/Teams (`/api/player/transfer-feed`),
    gespeist aus neuem Modell **`TransferEvent`** + Helper `lib/recordTransfer.js` (geschrieben bei
    team/create, handlejoinrequest, roster/approve-claim, remove-member; benachrichtigt Follower).
  - **News-Widget** (rechts): kompakte Variante (`/api/news/rss`).
  - **Feed-Pagination**: `before`-Cursor in `/api/posts/feed` + `/api/player/getfollowingposts`,
    Infinite Scroll + „Mehr laden".
  - **Kommentare**: jetzt likebar + beantwortbar (Post-Modell `comments.likes[]`/`replies[]`,
    `/api/posts/likecomment`, `/api/posts/addreply`).
- **Mail-System** (Vorlagen zentral in `lib/emailTemplates.js` mit `emailLayout`, echtes Logo via
  gehostete `public/images/logo-email.png`; SMTP lokal nicht testbar → verifiziert über In-App + Trigger-Log):
  - **Willkommensmail** bei Registrierung (`welcomeEmail`, Anreiz-Karten).
  - **Pending-Result-Erinnerung** geht jetzt an die **Admin-Spieler-Mail** (vorher leeres `team.email`);
    **Opt-out** `Player.emailPendingResult` (Default an, Toggle in edit-profile). In-App bleibt immer.
  - **Mismatch-Alert**: `submit-match-result` benachrichtigt beim Übergang in „mismatch" **beide
    Team-Admins + alle Super-Admins** (In-App `result_mismatch` + Mail `resultMismatchEmail`);
    `/admin/matches` zeigt „Strittig"-Badge, `/admin/update-match` zeigt beide Meldungen + „Übernehmen".
  - **Stats-Modell bestätigt korrekt**: Admin trägt PKT/AST/REB je eigenem Spieler + Gesamtpunkte
    beider Teams ein.
- **Logos geprüft**: Navbar (`logo.svg` weiß) / Auth (`logo-hoops.svg` schwarz) / Favicon
  (`public/icon.svg` + `app/icon.svg`) sind die korrekten Canva-Logos; Mail-Logo gefixt (war Emoji-Platzhalter).

#### Update (26.06.2026) – Mail-System komplett, Invite-Flow, Design-Politur, Doku-Skill
- **Einheitliches Mail-Design-System** (`5cc2729`): `lib/emailTemplates.js` tabellenbasiert
  (Outlook/Gmail), mobile-first, `emailLayout(accent/badge/title/intro/cta)`; **alle 8 Mails** darüber
  (auch Einladung/Reset/Feedback/Kontakt). Status-Akzent+Badge je Typ, Basketball-Kontext-Badges,
  große zentrierte Orange-CTAs. Builder: `welcomeEmail`, `pendingResultEmail`, `resultMismatchEmail`,
  `inviteEmail`, `passwordResetEmail`, `feedbackEmail`, `contactEmail`.
- **Invite-Flow erweitert** (`42b9f34`): KaderTab **WhatsApp-Button** (wa.me); Claim-Seite
  `/team/claim/[token]` erlaubt **Account-Anlage direkt** (Name aus Slot vorbefüllt → `playerregister`
  → `request-claim`) + danach optional Profil vervollständigen.
- **Mail-Politur** (`b6bee6c`): Titel/Intro **zentriert** (Tabellen/Karten bleiben links), **Logo 150→190px**.
- **Mail-Export für User** (Review in Canva/AI): `C:\Users\schem\OneDrive\Desktop\Hoops-Mail-Vorlagen\`
  (8 HTML-Dateien + index, Logo eingebettet) – via Builder neu generierbar.
- **Doku-Konvention + Skill `log-progress`** angelegt (Fortschritt immer hier in Abschnitt 0 festhalten).

#### 🟢 LIVE seit 24.06.2026 – v2 läuft auf https://hoopsgermany.de
- **Deployment durchgeführt** (Claude per SSH-Key auf den Hostinger-VPS `92.113.25.249`, Ubuntu 24.04):
  v2 in `/root/hoops-v2/` (Branch `redesign`), PM2-Prozess **`hoops-v2` auf Port 3001**, DB **`hoops_prod`**
  (Atlas, demo-geseedet). **Alte Seite läuft unberührt weiter** (PM2 `sports`, Port 3000, DB `test`) →
  **Rollback = Nginx zurück auf 3000**. Nginx-Config `/etc/nginx/sites-available/default` (proxy_pass 3001;
  Backup `.bak-pre-cutover`). Code-Backup `/root/backup-sports-2026-06-24.tar.gz`.
- **.env auf VPS** aus alter `/root/sports/.env` übernommen (Mongo-PW/SMTP_PASS/Google/SECRET_KEY/CRON_SECRET),
  DB-Name → `hoops_prod`, `NEXTAUTH_URL=https://hoopsgermany.de`. SMTP (smtp.hostinger.com:465) + Google sind gesetzt.
- **Updates:** `cd /root/hoops-v2 && git pull && npm run build && pm2 restart hoops-v2`. VPS-Repo-Zugang via
  Deploy-Key (`~/.ssh/github_hoops`, SSH-Alias `github-hoops`). Claude-SSH-Key: `~/.ssh/hoops_vps` (lokal).
- **Prod-Bug gefixt** (`7a61cfa`): `models/registerModels.js` registriert alle Modelle bei `connectDB`
  → behebt `MissingSchemaError` beim populate im Production-Build (Dev-Server zeigte ihn nicht!).
  **Lehre: vor Deploy immer `npm start` (Production-Runtime) testen, nicht nur `next dev`.**

**✅ Mobile-Fix (24.06., nach Go-Live):** `PlayerNav` hatte auf Mobil keine Navigation (`hidden md:flex`
ohne Hamburger) → Hamburger-Menü ergänzt. `NotificationBell`-Dropdown war links abgeschnitten
(`absolute right-0 w-80`) → responsiv gemacht (`fixed left-2 right-2 top-16 sm:absolute…`, Muster aus
`Navbar.js`). TeamNav (keine Haupt-Links) + AdminNav (`overflow-x-auto`) sind mobil ok.

**✅ Nav-/Admin-Fix (24.06.):** `PlayerNav` um **Ligen, Topscorer** + rollenbasierten **„Super Admin"/
„Team-Admin"-Link** erweitert (Inline ab `lg`, sonst Hamburger). **Super-Admin-Spieler brauchen keinen
separaten Admin-Login mehr:** `getAdminToken()` (clientAuth) fällt auf den Spieler-Token zurück,
`getAdminFromToken()` (serverAuth) akzeptiert Super-Admin-Spieler-Token (→ alle Admin-Seiten/-APIs
dual-auth). `/admin/login` macht keinen Auto-Redirect → kein Loop. Verifiziert: Super-Admin landet direkt
im Dashboard (Daten laden).

**✅ OAuth-/UX-Fixes (24.06.):** Google-Login **erhält jetzt den Zielort** (`next`-Kette: `useCurrentPlayer`
→ `/login?next=…` → Google-Button trägt `next` → google route speichert Cookie → callback reicht weiter →
`oauth-landing` leitet dorthin). So landet „Team gründen" → Google-Login wieder bei `/team/create` statt
Newsfeed. **Neue Google-Nutzer bekommen jetzt die Willkommensmail** (callback rief sie vorher nicht auf).
`AdminNav` hat einen **„← Zur Seite"-Link** (Newsfeed). Login/Signup-E-Mail-Login + Google honorieren `next`.

**✅ Live verifiziert (24.06.):** **SMTP funktioniert** (Passwort-Reset-Mail kam an, Reset durchgeführt) →
alle Mails (Willkommen/Einladung/Mismatch/Pending) laufen über denselben Weg = einsatzbereit.
**Super-Admin-Spieler abgesichert** (Patrick & Jonatan haben eigene Passwörter gesetzt; test123 deaktiviert).
`/admin`-Panel-Konten haben ein temporäres starkes Passwort (sollte noch auf ein eigenes geändert werden).

#### Update (Live-Testphase, 24.06.) – Feedback live umgesetzt, kompletter Flow durchgespielt
- **Willkommensmail** (`44eaba0`): Intro für ALLE Neuen (nicht nur Team-Admins), „Leg gleich los" zentriert.
  Neue **Google-Nutzer bekommen die Willkommensmail** (Callback ergänzt).
- **Spielplan-Gegnerfilter** (`5ef767b`): Gegner-Dropdown nach **Bundesland/Liga** filterbar (skaliert).
  `/api/leagues` liefert dafür `teams` je Liga.
- **Ergebnisse-Tab** (`221887b`): Spieler-Statistiken **standardmäßig aufgeklappt**; Ergebnis-Eingabe erst
  **nach Spielbeginn** (Client-Hinweis + Server-Guard in `submit-match-result`, außer Meldung liegt bereits vor).
- **Benachrichtigungen klickbar** (`e3d0370`): `lib/notifications.js` (`notificationHref(n, me)`) leitet
  rollen-/typgerecht (Mismatch → Super-Admin `/admin/matches`, Team-Admin `/team/admin?tab=ergebnisse`;
  pending_result → Ergebnisse-Tab; join_request → Anfragen-Tab; match_result → `/match/[id]`). NotificationBell
  + Navbar-Dropdown verlinken; **Team-Admin-Panel Tab-Deeplinks** `?tab=…`; Mail-CTAs → `?tab=ergebnisse`.
- **Bereinigt:** versehentliches Team „Viersen Hoops" (Super-Admin/Google-Test) gelöscht.
- **✅ KOMPLETTER LIVE-FLOW durchgespielt:** Registrierung→Willkommensmail · **Google-Login** · Team gründen
  („Viersen Hoops II" = Patrick Test) · Spiel+Ergebnis (Gegnerfilter) · **Mismatch** (Rhein 22:19) →
  In-App + Mails an **beide Team-Admins UND beide Super-Admins** → im Admin-Panel **aufgelöst** (20:17, confirmed).

#### Update (UX-Feinschliff, 24.06.) – mobiler Newsfeed reparierbar
- **Mobiler Newsfeed: Seiten-Widgets als einklappbare Akkordeons** (`c813d56`): Mobil lagen die
  Widgets (Spiele, Top-Teams, Transfers, News) per `order`-Klassen **unter** dem Infinite-Scroll-Feed
  und waren praktisch unerreichbar. Jetzt breakpoint-abhängiges Rendern statt CSS-Reorder
  (`lib/useMediaQuery.js`, `(min-width:1024px)`): **Desktop unverändert 3-spaltig**, **Mobil**
  Composer → einklappbare Widgets (`components/feed/CollapsibleWidget.js`, „Spiele" offen) → Feed.
  Der Wrapper neutralisiert die eigene Karte/`h3` der Widgets via `[&>div]`-Overrides → keine doppelten
  Titel/Rahmen. Verifiziert im Preview (Desktop 3-spaltig + Mobil 375px Toggle).
- **Geprüft, kein Handlungsbedarf:** Landing, Spieler-Liste, Spielerprofil (Stats-Leiste mobil bewusst
  `overflow-x-auto`), Desktop-Newsfeed wirken sauber/konsistent.
- **Footer + Geburtstag + Karriere-Verlauf + aktive Nav** (`fbbe06a`):
  - **Footer** (mit Impressum/Datenschutz) auf `player-detail`, `edit-profile`, `update-password`,
    `team/admin`, `team/create` ergänzt (Rechtsseiten via `LegalShell` hatten ihn schon; Auth-Seiten
    über `AuthShell` + Admin-Panel bewusst ohne; Newsfeed bewusst ohne wegen Infinite-Scroll).
  - **Geburtstag statt Alter:** `edit-profile` nutzt jetzt ein Datumsfeld; das Alter wird via neuem
    `lib/age.js` (`ageFromBirthdate`/`formatBirthdate`/`toDateInputValue`) **live aus dem Geburtsdatum
    berechnet** → aktualisiert sich automatisch am Geburtstag, kein Cron. Anzeige in `PlayerProfileView`
    (Stats-Leiste + Steckbrief) abgeleitet; `update-profile`-Route speichert das abgeleitete Alter als
    Snapshot (Rückwärtskompatibilität). Altdaten (Freitext TT.MM.JJJJ) werden weiterhin geparst.
  - **Karriere-Verlauf** vom Stats- in den **Steckbrief-Tab** verschoben (`PlayerProfileView`).
  - **Aktive Seite markiert** in `Navbar` (Desktop + Hamburger) und `PlayerNav` via `usePathname` +
    `aria-current="page"` (orange Border/Highlight, konsistente Borders → kein Layout-Shift).
- **Tiefer UX-Durchgang (mobil)** – Team-Admin-Panel, Match-Detail, Tryouts, Auth-Flows geprüft;
  fast alles poliert. Ein echter Fix:
  - **Verwaiste Tryouts robust** (`tryouts` filtern): Wird ein Team gelöscht (`teamId` null), zeigte die
    Tryout-Liste/-Detail generisch „Team"/„Tryout". Jetzt blendet `/api/tryouts` verwaiste Einträge aus,
    `/api/tryouts/[id]` liefert 404 (→ saubere Leer-/„nicht gefunden"-Zustände).
- **UX-Feinschliff Profil + Cascade + Tab-Scroll** (Folge-Runde):
  - **Stats-Leiste: Text-Überlauf behoben** (`PlayerProfileView`/`StatCell`): Lange Werte wie
    „Deutschland"/„Nordrhein-Westfalen" liefen bei schmaler Breite aus der Zelle. Meta-Zellen jetzt
    `small` (text-sm) + `break-words`; die drei Kern-Stats (PPG/APG/RPG) bleiben groß.
  - **Scroll-Hinweis** für die horizontale Stats-Leiste: neue `components/ScrollHintRow.js` (Rand-Fade
    + pulsierender Pfeil rechts, erscheint nur wenn scrollbar) → Nutzer erkennen die Wisch-Geste.
  - **Cascade-Cleanup beim Team-Löschen** (`api/admin/deleteteam`): löscht jetzt auch die Spiele des
    Teams (und entfernt sie aus `League.matches`), die Tryouts, entfernt das Team aus `League.teams`
    und löst Spieler-Referenzen (`teamId`, `teamAdminOf`/`isTeamAdmin`, `teamJoinRequest`,
    `followingTeams`). Spieler/Posts bleiben erhalten (Posts referenzieren kein Team). **End-to-end
    getestet** (Munich Hoops gelöscht → 6 Spiele weg, Liga bereinigt, Mitglied teamlos) + Dev-DB neu geseedet.
  - **Auto-Scroll zum aktiven Tab** im Team-Admin-Panel (`team/admin`): aktiver Tab wird im scrollbaren
    Balken zentriert (Ref-Map + `scrollTo`), Dep `[active, status]` – wichtig, da die Leiste erst nach
    dem Team-Load gerendert wird (sonst feuert der Deeplink-Scroll ins Leere). Klick + Deeplink verifiziert.
  - **Weiterhin offen (bewusst):** TransferEvents bleiben beim Team-Löschen als historische Einträge
    erhalten (verweisen ggf. auf gelöschtes Team).
  - **Mobile PlayerNav-Icons entzerrt** (`ba5ed9b`): Glocke/Avatar/Logout/Hamburger lagen auf Mobil
    zu eng. Logout auf Mobil ins Hamburger-Menü verschoben (eigener „Abmelden"-Eintrag), im Top-Bar
    nur noch ab Desktop (`hidden lg:block`); größere Touch-Flächen (`p-2`) + mehr Abstand;
    `NotificationBell`-Badge bleibt per relativem Wrapper am Icon verankert.
- **Stats-Logik geprüft + Spielerhistorie mit Einzelspielen**:
  - **PPG/APG/RPG + Spiele-Counter verifiziert** (Code-Review + Funktionstest): `match-stats/save`
    speichert `didNotPlay` je Spieler; `careerstats` und `stations` filtern `didNotPlay: {$ne:true}`,
    `games = $sum 1` nur über gespielte Spiele, Schnitt = Summe/Spiele. DNP zählt korrekt **nicht** hoch
    (live getestet: 5→4 Spiele, 65→44 Pkt, 13→11 PPG nach DNP-Markierung; danach wiederhergestellt).
  - **„Spielerstationen" → „Spielerhistorie"** umbenannt; Stationen sind jetzt **ausklappbar**
    (`PlayerProfileView`): Klick zeigt die Einzelspiele der Saison/Liga mit Gegner, Datum, Endstand,
    W/L und eigenen PKT·AST·REB (DNP markiert), verlinkt aufs Match. Neue API
    `app/api/player/station-matches/route.js` (Score via `lib/matchScore.teamScores`);
    `stations` liefert zusätzlich `teamId`/`leagueId` für die Detail-Abfrage. **DNP-Partien werden in
    der Detailliste ausgeblendet** (Query-`$elemMatch` mit `didNotPlay: {$ne:true}`) → deckt sich
    exakt mit der „Sp."-Zahl der Station (funktional verifiziert: DNP → Detail 3→2 = Sp. 2).
- **Testphase-UX: Startseiten-Zugang, Feedback-Button, Analytics-Bereiche**:
  - **Logo führt zur Startseite** (Navbar + PlayerNav `href="/"` statt `/home`/`/player/newsfeed`):
    eingeloggte User erreichen die Begrüßungs-Startseite (Gruß via `LandingHero`). Nebenbei den
    „Mein Profil"-Button in `LandingHero` gefixt (zeigte auf den Feed → jetzt `/player/player-detail`).
  - **Schwebender Feedback-Button** (`components/FeedbackButton.js`, im Root-Layout): fixiert unten
    rechts auf allen Seiten (Text ab `sm`, mobil nur Icon), ausgeblendet auf `/feedback` und `/admin`.
  - **Analytics geprüft + „Traffic nach Bereich"**: `AnalyticsTracker` (Root-Layout) trackt jeden
    Seitenaufruf außer `/admin`; `summary` liefert Aufrufe/Sessions/Top-Pfade/7-Tage – funktioniert.
    **Neu:** `summary` bündelt Pfade serverseitig per `$switch` in Bereiche (Spielerprofile, Teams,
    Spiele, Newsfeed …) → `/admin/analytics` zeigt „Traffic nach Bereich" (Balken). Dynamische Routen
    (z. B. einzelne Spielerprofile) werden so sponsoren-tauglich gebündelt statt zersplittert.
  - **Eingeloggte Startseite ausgebaut**: `LandingHero` (eingeloggt) hat jetzt 5 Schnellaktionen –
    Zum Feed, Mein Profil, **Mein Team** (nur mit Team, sonst „Teams"), **Spielplan** (`/spiele`),
    **Feedback** (`/feedback`); kompakter + `flex-wrap`. Der untere CTA „Bereit loszulegen" wird für
    eingeloggte User ausgeblendet (neue Client-Komponente `components/landing/LandingCTA.js`, in
    `app/page.js` statt des inline-CTA – nur für ausgeloggte Besucher).
  - **Landing-Politur**: Hero-Buttons farblich vereinheitlicht (1 oranger Primär + gleichartige
    „Ghost"-Buttons statt wechselnder Orange/Weiß-Outlines), eingeloggt in **3+2-Reihen** angeordnet
    (`HERO_PRIMARY`/`HERO_GHOST`/`HERO_W` in `LandingHero`). „Alles, was du brauchst" von 3 auf
    **6 Feature-Karten** erweitert (Spielerprofile & Statistiken, Teams & Kaderverwaltung, Spielplan &
    Ergebnisse, Ligen & Tabellen, Tryouts & Transfermarkt, Community & News). „So funktionierts" ist
    jetzt login-bewusst (`components/landing/LandingHowItWorks.js`): ausgeloggt Onboarding-Schritte,
    eingeloggt **personalisierte „Deine nächsten Schritte"** (Profil / Team verwalten|ansehen|gründen
    je nach Rolle / Ligen & Topscorer – als klickbare Links).
- **Liga-Erstellung gehärtet (3 Punkte)**:
  - **Dublettenschutz**: neuer Helper `lib/leagues.js` (`findDuplicateLeague`, Name case-insensitiv +
    Saison). Greift bei Team-Erstellung (`/api/leagues`, 409), Admin-Erstellung und Admin-Umbenennen
    (`updateleague`, mit `excludeId`). Gleiche Liga (Name+Saison) kann nicht doppelt angelegt werden;
    andere Saison ist erlaubt.
  - **`bundesland` bei der Erstellung**: Team-Formular (`SpielplanTab` „Liga erstellen") und Admin
    bekommen ein Bundesland-Dropdown; wird gespeichert → Liga-Bundesland-Filter auf `/ligen` greift jetzt
    auch für selbst erstellte Ligen. `updateleague` + Admin-Liste tragen `bundesland`.
  - **Admin kann Ligen erstellen**: neuer Endpunkt `/api/admin/createleague` (Super-Admin, startet ohne
    Teams) + „Neue Liga erstellen"-Formular auf `/admin/leagues` (Name/Saison/Bundesland) inkl.
    Bundesland-Bearbeitung je Zeile. Funktional verifiziert (Dublette 409, Bundesland gespeichert) + Dev-DB bereinigt.
  - **Region-Vorschläge gegen „weiche" Dubletten** (Tippfehler/abweichender Name): Im Team-Liga-Formular
    (`SpielplanTab`) erscheinen nach **Bundesland-Auswahl** die bereits vorhandenen **aktiven Ligen der
    Region** als anklickbare Chips („bitte übernimm eine davon, falls es dieselbe ist") – Klick wählt die
    bestehende Liga fürs Spiel und schließt die Anlage. Keine Liga in der Region → Hinweis „du kannst eine
    neue anlegen". Rein clientseitig (`/api/leagues` liefert `bundesland` schon mit). Verifiziert end-to-end.
- **Feedback-Mail-Fix** (`fcb7f51`): Feedback-Benachrichtigung ging an `info@hoopsgermany.de` (unbeobachtet) →
  jetzt an alle **Super-Admin-Mails** (`Player.isSuperAdmin`), Fallback info@. Ursache bestätigt: 1 Feedback war
  in `hoops_prod` gespeichert, Mail lief nur an info@. Live-Test gesendet.

#### 🔄 Liga-Umbau (PIVOT, mit Partner entschieden) – Framework wird gebaut
> **Neue Logik:** Ligen werden **nicht** mehr von Teams/Admins frei erstellt. Es gibt einen **offiziellen
> Katalog** (echte Verbands-Ligen). Teams **wählen** bei der Gründung ihre Liga (Filter Stadt/Bundesland →
> Stufe → Liga). Nur im Notfall „**Liga melden**" an Super-Admins. **Datenquelle:** WBV/NRW (TeamSL auf
> basketball-bund.net, WBV-Ausschreibung 2025/26) – keine offene API, Katalog wird extrahiert. **Umfang
> Start: NRW komplett** (Herren/Damen/Jugend). Vorgehen: **Framework zuerst**, echte Daten danach.
>
> **Schritt 1 erledigt – Liga-Katalog-Fundament** (additive Modell-/Admin-Änderung, deployt):
> - `models/League.js` um `level` (Regionalliga/Oberliga/Landesliga/Bezirksliga/Kreisliga), `gender`
>   (Herren/Damen/Mixed), `ageGroup` (Senioren/U18…), `region` (Bezirk/Kreis), `official` erweitert;
>   Konstanten in `lib/constants.js` (`LEAGUE_LEVELS`/`LEAGUE_GENDERS`/`LEAGUE_AGE_GROUPS`).
> - `/api/admin/createleague` + `updateleague` + Admin-Liste tragen die neuen Felder; `official:true` bei
>   Admin-Anlage. **Admin-Katalog-UI** (`/admin/leagues`) erweitert (Erstell-Raster + Karten mit „Offiziell").
>   `/api/leagues` GET liefert die Felder für die spätere Team-Auswahl. Funktional + UI verifiziert.
>
> **Schritt 2 erledigt – Team-Liga-Auswahl + Melde-Flow + Selbsterstellung entfernt** (deployt):
> - `models/Team.js` um `leagueId` erweitert; `/api/team/create` nimmt `leagueId`, setzt sie und nimmt das
>   Team per `$addToSet` in `League.teams` auf. **Liga-Picker bei der Gründung** (`/team/create`): Filter
>   Bundesland (oben) + Stufe/Geschlecht/Altersklasse → Liga-Dropdown aus dem Katalog. Verifiziert (Team↔Liga
>   verknüpft, teamCount steigt).
> - **„Liga melden"-Flow**: `components/team/LeagueReportLink.js` (aufklappbares Formular) →
>   `POST /api/leagues/report` legt einen `Feedback`-Eintrag (`type:"Liga-Meldung"`) an **und** mailt die
>   Super-Admins (gleiches Muster wie Feedback-Fix). Eingebunden bei Team-Gründung **und** im SpielplanTab.
> - **Team-Selbsterstellung entfernt**: das „Liga erstellen"-Formular + die Region-Vorschläge in
>   `SpielplanTab` sind raus (Match-Form behält das Liga-Dropdown aus dem Katalog), stattdessen der Melde-Link.
>
> **Schritt 5 (Datenschritt) – Senioren Herren + Damen erledigt: 47 NRW-Verbandsligen 2025/26**
> (`7c68f9b`, `90b9851`, `6897ebc`): Idempotentes Seed `scripts/seed-nrw-leagues.mjs` legt den offiziellen
> WBV-Katalog oberhalb der Kreisliga an – **Herren (31):** 1. Regionalliga · 2. Regionalliga 1/2 ·
> Oberliga 1–4 · Landesliga 1–8 · Bezirksliga 1–16. **Damen (16):** Regionalliga · Oberliga 1–2 ·
> Landesliga 1–5 · Bezirksliga 1–8 (Vorrundengruppen A/B je als 1 Liga modelliert). Namen **wörtlich** aus
> den WBV-Ligeneinteilungs-PDFs (Stand 12.06.2025, `…/2025_2026/ligeneinteilung_herren_20250612-1.pdf` bzw.
> `…_damen_…`). Felder: `official:true`, `bundesland:"Nordrhein-Westfalen"`, `gender`, `ageGroup:"Senioren"`,
> `season:"2025/26"`, `level` je Stufe, **`region` = RP-Bezirk** (Köln/Düsseldorf/Arnsberg/Münster/Detmold),
> abgeleitet aus den Vereins-IDs der Einteilung (3. Ziffer = Bezirk); bezirksübergreifende/gemischte Ligen →
> leer. **Upsert (Match name+season+gender+ageGroup), löscht nichts** + Selbstheilung pro Geschlecht/
> Altersklasse (leere Alt-Einträge raus, Ligen mit Teams/Spielen geschützt) → sicher Dev **und** Prod;
> `--dry` für Vorschau. **✅ Senioren (47) + Jugend männlich/offen (10) auf Dev + Prod geseedet + verifiziert**
> (`942cc69`; 57 official, Idempotenz ok; die 2 Demo „Regionalliga Süd"/Bayern wurden am 27.06.2026 entfernt
> → Prod-Katalog jetzt 58, s. Roadmap-Punkt 6).
> **Jugend m/o (10):** U18 männl. (Regio, Oberliga) · U16 männl. (Regio, Oberliga, Landesliga) · U14 offen
> (Regio, Oberliga, Landesliga) · U12 offen (Oberliga, Landesliga) – gender Herren (männl.) bzw. Mixed
> (offen), `ageGroup` U18/U16/U14/U12, Name mit Altersklassen-Präfix, transiente „…Qualifikation"-Pools
> ausgelassen, `region` leer (NRW-weite Pools). Quelle: WBV-Jugend-Einteilung „offene und männliche Jugend"
> (Stand 23.05.2025, `…/images/Jugend/20252026/vorlaeufigeligeneinteilung_jugend_230525-1.pdf`). Re-Run gefahrlos.
>
> **➡️ NÄCHSTE SESSION HIER STARTEN – noch offen am Datenschritt:**
> 1. **Weibliche Jugend (U18w/U16w/U14w/U12w) + U10** seeden. **Blocker:** die WBV-Artikelseiten blocken den
>    automatischen Abruf (404 für WebFetch), nur direkte `/images/Jugend/20252026/*.pdf`-URLs gehen, und der
>    Dateiname der weiblichen/U10-Einteilung ist unbekannt; Einteilung steht zudem bei „4. vorläufig"
>    (Artikel 4841). **Lösung:** User holt den PDF-Link (oder die Datei) der weiblichen Jugend-Einteilung von
>    basketball.nrw → dann gleiches Muster wie Jugend m/o ins Seed (`gender:"Damen"`, je Altersklasse die real
>    existierenden Stufen – nicht raten!).
> 2. **➡️ GEPLANTER NÄCHSTER SCHRITT (Kreisligen, 01.07.2026 vom User angekündigt):** Der User hat mit
>    ChatGPT eine **PDF zu den NRW-Kreisligen** erstellt (Quelle für den fehlenden Katalog-Teil unterhalb der
>    Bezirksliga; die 22 Basketballkreise haben KEINE zentrale WBV-PDF → bisher offen).
>    **AUFTRAG (verbindlich, VOR dem Programmieren):** (a) PDF vom User einlesen lassen/finden (Pfad wird in
>    der Session genannt – vermutlich unter `C:\Users\schem\OneDrive\...`), (b) **Inhalt sorgfältig auf
>    Korrektheit prüfen** (ChatGPT-generiert → nicht blind übernehmen! Liganamen/Kreise/Zuordnung
>    plausibilisieren, nicht raten), (c) **Umlaute korrigieren** bei Bedarf (ä/ö/ü/ß – PDF-/KI-Exporte
>    verstümmeln die oft). ERST danach ins Seed-Muster (analog `seed-nrw-leagues.mjs`: `official:true`,
>    `bundesland:"Nordrhein-Westfalen"`, `level:"Kreisliga"`, `region`=Kreis, idempotenter Upsert, `--dry`,
>    Safe-Delete nur leerer Alt-Einträge) → Dev testen, dann Prod. Im Liga-Picker (`/team/create`) live gegenprüfen.
> **(6) ✅ erledigt (27.06.2026): Demo-Liga `Regionalliga Süd` (Bayern) aus dem Prod-Katalog entfernt.**
> `scripts/purge-demo-bayern-leagues.mjs` (Dry-Run als Default, `--apply` zum Löschen, schreibt vorher ein
> JSON-Backup in den Scratchpad; strenge Zielmenge `name=/Regionalliga Süd/i + bundesland=Bayern +
> official≠true + kein seedTag` → schont alle offiziellen Ligen und `nrw-demo`). Auf Prod ausgeführt:
> **2 Fake-Bayern-Ligen (2024/25 + 2025/26) + 11 zugehörige Spiele gelöscht** → Prod-Katalog **60 → 58**
> (57 official + 1 `nrw-demo`-Showcase „Oberliga 1" 2024/25); `/ligen` enthält keine Bayern-Fremdkörper mehr.
> **Teams blieben erhalten.** Das echte Test-Team **Viersen Hoops II** war nur über das Mismatch-Testspiel
> (20:17) in der Südliga gelandet (`bundesland` war schon immer NRW) → steht nach dem Löschen korrekt als
> **NRW-Team ohne Liga** da (`leagueId` leer). ⚠️ `seed-demo.mjs` (reine **Dev**-Fixture) erzeugt lokal
> weiter eine „Regionalliga Süd"/Bayern – betrifft nur die Dev-DB, nie Prod (Prod wird nie mit seed-demo geseedet).
> **Weiter offen:** (optional) Liga-Auswahl nachträglich im Team-Einstellungen-Tab änderbar machen
> (Hinweis: `/api/team/set-league` + Picker existiert bereits, s. Roadmap-Punkt 7).
>
> **Framework-Stand (alles deployt, getestet):** Modell (`level/gender/ageGroup/region/official`,
> `Team.leagueId`), Admin-Katalog (`/admin/leagues`), Liga-Picker bei Team-Gründung (`/team/create`),
> Melde-Flow (`LeagueReportLink` → `/api/leagues/report`), Team-Selbsterstellung entfernt. Test-Logins
> wie gehabt (`max@test.de`/test123 = Team-Admin; `admin`/`geheim1234` = Admin-Panel).
>
> **Ligen-Seite Filter** (`faa8b95`, live): `/ligen` filtert clientseitig nach Geschlecht/Altersklasse/
> Spielklasse (aus `lib/constants`); Bundesland-Dropdown zeigt Länder ohne Ligen als „<Land> – folgt in
> Kürze" (disabled, dynamisch aus geladenen Ligen → wächst automatisch mit). Karten zeigen gender/ageGroup/region.
>
> **Topscorer + Rangliste saison-fähig** (`4e0c42d`, live): `/api/player/topscorer` (POST `season`) und
> `/api/teams/standings` (`?season=`) filtern Spiele über die Ligen der Saison (`leagueId $in`) und liefern
> `seasons`; `/topscorer` + `/rangliste` haben ein Saison-Dropdown („Alle Saisons" + je Saison), Rangliste
> grenzt die Liga-Optionen auf die Saison ein. Wichtig ab mehreren Saisons (nach Rollover).
>
> **Positionen ausgeschrieben + neue Rollen** (`9055bd3`, live): `lib/constants` – `POSITIONS` jetzt
> ausgeschrieben (Point Guard … Center), neue `PLAYER_ROLES` (Coach/Manager/Sportliche Leitung/Fan),
> `ALL_ROLES`, `positionLabel()` (mappt alte Kürzel PG… rückwärtskompatibel). Profil-Auswahl (edit-profile)
> + Spielerfilter (`/spieler`) als **gruppiertes Dropdown** (Spielposition/Funktion); alle Anzeige-Stellen
> über `positionLabel`. `scripts/migrate-positions.mjs` hat Bestandsdaten (Dev+Prod) kanonisiert.
> **Fundament fürs Scouting** (Vereine suchen auch Trainer/Funktionäre).
>
> **Scouting/Transfermarkt – Phase A** (`a257650`, live): `/transfermarkt` ist Scouting-Hub mit
> strukturierten Filtern (Position/Rolle gruppiert inkl. Coach/Manager/…, Bundesland, Stadt+Umkreis);
> Anzeige ausgeschrieben (`positionLabel`), Standort je Eintrag; `transferlist`-API liefert `bundesland`/
> `hometown`.
> **Phase B erledigt** (`0e8dbcf`, live): „Vereine suchen Spieler". `Team.recruiting`/`recruitingPositions`/
> `recruitingNote`; Team-Panel (`EinstellungenTab`) „Verstärkung suchen" (Toggle + Rollen-Chips + Notiz →
> `/api/team/set-recruiting`); öffentliche `/api/team/recruiting-list`. **Transfermarkt hat 2 Tabs**:
> „Spieler suchen Verein" + „Vereine suchen Spieler" (Team-Karten mit gesuchten Rollen/Region/Notiz);
> Filter (Position/Rolle, Bundesland, Umkreis) gelten je aktivem Tab. End-to-end verifiziert.
> **Phase C erledigt** (live): **C1 Direktanfrage** (`Vereine suchen`-Tab: „Beitritt anfragen" je Team via
> requestjoin) – Commit `…` C1; **C2 Matching** (personalisierter „Passende Treffer"-Block: suchende Vereine
> für transferbereite Spieler, passende Spieler für suchende Team-Admins; Match über Position/Rolle oder
> Bundesland, Kontext via `getmyinfo`); **C3 bevorzugte Spielklasse** (`preferredLeague` jetzt
> `LEAGUE_LEVELS`-Dropdown in edit-profile + `TransferControl` statt Freitext, Anzeige „Spielklasse").
> Alle drei verifiziert + deployt. **Scouting/Transfermarkt-Initiative damit abgeschlossen** (A+B+C).
>
> **Liga auf Team-Seite** (`e68486c`, live): Team-Detailseite (`/team/team-detail/[slug]`) zeigt eine
> Liga-Karte (aktuelle Liga + Platz X/Y + S/N/Korbdiff, bei abgeschlossener Saison Meister-Badge), verlinkt
> zur Liga. `fetchsingleteaminfo` liefert dafür `league` inkl. `rank`/`record`/`isChampion`. **Tabellen-Logik
> jetzt zentral in `lib/standings.js` (`computeStandings`)** – genutzt von `/api/leagues/[id]`, `updateleague`
> (Meister-Einfrieren) und `fetchsingleteaminfo`. ⚠️ `computeStandings` muss `status` selektieren (teamScores
> prüft `status==="completed"`), sonst 0 Spiele.
>
> **Season-Rollover-Tool** (`scripts/rollover-season.mjs`): klont die offiziellen Liga-**Hüllen** einer
> Saison in die nächste (Namen sind jahresstabil, keine Verbands-Kader nötig). Idempotent, `--from`/`--to`,
> `--dry`, `--deactivate-old` (alte Saison → `active:false`/Archiv). **Einmal jährlich (≈Juli)** ausführen +
> 10-Min-Sanity-Check (selten ändert der WBV die Gruppenzahl). Auf Dev getestet (57 geklont, idempotent),
> **noch NICHT auf Prod ausgeführt** (Tool für die nächste Saison; Skript ist nur deployt/verfügbar).
> ⚠️ Voraussetzung fürs echte Rollover: Roadmap-Punkt 7 (Teams müssen Liga in neuer Saison neu wählen).

> **🟢 BEREIT FÜR TESTER-PHASE (Stand 25.06.2026):** Liga-System (Filter/Saison/Archiv/Playoffs/Meister),
> Scouting/Transfermarkt (A+B+C: Filter, „Vereine suchen", Direktanfrage, Matching, Spielklasse), Positionen
> ausgeschrieben + Rollen (Coach/Manager/Sportl. Leitung/Fan) – alle live. **Pre-Test-Abschluss** (deployt):
> Navbar um **Spieler + Transfermarkt** ergänzt (Scouting war nicht erreichbar; volle Navi ab `lg`, sonst
> Hamburger); **Feedback** um Themen „Transfermarkt & Scouting"/„Tryouts" erweitert; **Analytics** mit
> **Plattform-Überblick** (Spieler/Teams/offizielle Ligen/transferbereit/suchende Vereine) für Sponsoren-
> Präsentation + Bereichs-Traffic (deckt alle neuen Bereiche ab). Desktop+Mobil + Prod-Smoke-Test grün.
>
> **NRW-Demo-Environment + Testphase-Banner** (live auf Prod): `scripts/seed-nrw-demo.mjs` legt **additiv** ein
> gefülltes NRW-Set an (Tag `seedTag:"nrw-demo"`, fasst echte Tester-Daten NICHT an): 6 fiktive NRW-Teams an
> echte NRW-Ligen gekoppelt, 30 Spieler (inkl. Coach/Manager-Rollen), 12 transferbereit, 3 suchende Vereine,
> 3 Beitrittsanfragen + 1 Tryout mit 4 Bewerbern, 8 Spiele (Oberliga 1 → Tabelle/Topscorer), Posts, Follower.
> **Liga-System-Showcase:** zusätzlich eine getaggte **Vorsaison-Liga „Oberliga 1" 2024/25 (abgeschlossen)**
> mit Round-Robin-Tabelle **+ Playoffs (Halbfinale/Finale)** und **Meister = Playoff-Sieger Köln Comets**
> (in der Tabelle nicht Erster → zeigt Playoff-Logik); demonstriert Saisonende/Meister-Badge/Playoff-Bracket/
> Saison-Archiv + saison-fähige Stats. `/ligen` sortiert **befüllte Ligen zuerst** (sonst gehen sie in den
> 67 leeren Katalog-Hüllen unter).
> **Demo-Team-Admin-Login** (für die Anfragen/Bewerber-Sicht): `demo.coach@nrw-demo.de` / `test123` (Köln Comets).
> **Entfernen nach der Testphase:** `node scripts/seed-nrw-demo.mjs --purge` (löscht NUR die getaggten Demo-Daten).
> `components/TestPhaseBanner.js` im Root-Layout: schlanker, immer sichtbarer „Testbetrieb/Beispieldaten"-Hinweis
> + Feedback-Link (rechtliche Absicherung). ⚠️ Roadmap #2 (Demo→echt) = u. a. dieses `--purge` ausführen.
>
> **STAND / WEITER (Pause):** v2 ist live, abgesichert, Hauptflow bestätigt. Offene Punkte siehe Roadmap.
> Updates deployen: `cd /root/hoops-v2 && git pull && npm run build && pm2 restart hoops-v2` (Claude per `~/.ssh/hoops_vps`).
> ✅ `c813d56` (Akkordeon) **und** `fbbe06a` (Footer/Geburtstag/Karriere-Verlauf/aktive Nav) sind gepusht **und live deployt** (Prod-Build grün getestet).

🔜 **Noch offen (nach Go-Live):**
1. **`/admin`-Temp-Passwort** (`A1cGmhwN-1To`) auf ein eigenes ändern (oder Legacy-`/admin`-Login ganz entfernen,
   da Super-Admin-Spieler eh direkt reinkommen).
2. **Demo-Daten** nach der Testphase durch echte ersetzen (frischer Seed / Bereinigung); dann alte DB `test` löschen.
3. **Monetarisierung (#6)** – BLOCKIERT bis **Gewerbeanmeldung** des Users (Amazon-Affiliate +
   Sponsorfläche; AdSense erst bei genug Traffic + Consent-Banner).
3b. ✅ **Spieler kann eigenes Profil selbst löschen** (`2c2efbe`, live): gemeinsamer Cascade
   `lib/deletePlayer.js` (`deletePlayerCascade`) – Posts, Follower/Following anderer, Notifications,
   Team-Follower, Kader-Slots, Match-Stats (`player→null`, Verlauf bleibt), TransferEvents. **Gründer-Regel:**
   Rolle an vorhandenen **Co-Admin übertragen**, sonst Löschen verweigert (`FOUNDER_BLOCK`, 409, Hinweis erst
   Co-Admin zu ernennen). `/api/player/delete-account` (Spieler-Auth) + **Gefahrenzone** in `edit-profile`
   (Bestätigungs-Flow → Logout + Redirect). `/api/admin/deleteplayer` nutzt jetzt **denselben Cascade**
   (vorher nur Posts → verwaiste Referenzen). Verifiziert: Self-Delete+Cascade, Gründer-Block, Gründer-Transfer.
3c. **🔜 Agenda – Analytics Phase 3 Teil 2** (Banner-Tracking/CTR/Leads/per-Sponsor-Auswertung) – an
   Monetarisierung (#3) gekoppelt, bis Gewerbe zurückgestellt (Details im Analytics-Block weiter unten).
3d. ✅ **Team-Freigabe durch Super-Admins** (`a871244`, live): neue spieler-gegründete Teams starten
   **„in Prüfung"** (`Team.approved=false`, Default true → Bestand/Seeds bleiben sichtbar, keine Migration)
   und sind **öffentlich versteckt** (Filter `approved:{$ne:false}` in `fetchteams`/Navbar-Suche +
   `recruiting-list`; `fetchsingleteaminfo` → 404; Liga-Aufnahme erst bei Freigabe → kein Pending-Team in
   Liga/Tabellen). **Gründer kann sein Team schon verwalten** (Banner „wird geprüft" in `/team/admin`).
   `create` benachrichtigt Super-Admins (In-App `team_pending` + Mail `teamPendingEmail`).
   `/api/admin/approve-team` (freigeben → `approved` + Liga-Aufnahme + Gründer-Notif `team_approved`/Mail
   `teamApprovedEmail`; ablehnen → Team entfernen + Mitglieder/Flags lösen). Admin-UI `/admin/teams`:
   „Wartet auf Freigabe"-Sektion + Freigeben/Ablehnen + „in Prüfung"-Badge. Im Preview verifiziert.
3e. ✅ **Super-Admin überträgt Team-Admin per Auswahl** (`9a69a20`, live): im Admin-Panel `/admin/teams`
   pro Team „Team-Admin verwalten" → Modal mit aktuellem Admin + Mitglieder-Dropdown → Rolle gezielt an ein
   Mitglied übertragen (bisheriger Admin wird normales Mitglied, neuer wird benachrichtigt). Endpoints
   `/api/admin/team-members` + `/api/admin/transfer-team-admin`. **Konto-Löschung unverändert** (Auto-Transfer
   an Co-Admin, sonst Block). Verifiziert (alt→Mitglied, neu→Admin+Notif, `adminPlayerId` aktualisiert).
3f. ✅ **Rolle „Gründer" → „Haupt-Admin" umbenannt** (`7abd9a1`, live): „Gründer" war irreführend (keine reale
   Vereinsgründung, sondern Ersteller/Verwalter). Alle nutzersichtbaren Stellen (KaderTab-Badge, `/admin/teams`,
   Pending-Mail, Lösch-/Schutz-Hinweise) → „Haupt-Admin"; Hierarchie **Haupt-Admin · Admin · Mitglied**.
   ⚠️ Rolle ist **nicht öffentlich** (Team-Profilseite zeigt keine Rollen-Labels) – nur Team-Panel +
   Super-Admin-Backoffice. Code-Kommentare zu `adminPlayerId` unverändert.
3g. ✅ **Fix: Admin-zugewiesener Team-Admin ist jetzt auch Mitglied** (`10bf2df`, live): `setteamadmin`
   setzte `isTeamAdmin`/`teamAdminOf`, aber NICHT `teamId` → Spiele/Ergebnisse (my-matches nutzt `teamId`)
   und eigener Kader fehlten. Jetzt setzt `setteamadmin` auch `teamId`. Bestandsdaten korrigiert
   (Prod: Patrick → `teamId=teamAdminOf`). Außerdem Spiele-Widget-Tabs `fluid` (kein Overflow im Cluster).
4. Weitere UX-Feinschliffe nach Tester-Feedback.
   - 📥 **Tester-Feedback ausgewertet (26.06.2026)** – 1 substanzielle Rückmeldung (25.06., „überwiegend top
     notch") aus `hoops_prod` (Lese-Tool `scripts/read-prod-feedback.mjs`, read-only). 3 Punkte:
   - ✅ **Upload-Bug komplett behoben** (Profilfoto + Team-Logo/Banner; `a83dc0f`) – **ZWEI Ursachen,
     beide server-seitig (Nginx/VPS), kanonische Config jetzt im Repo `deploy/nginx-hoopsgermany.conf`):**
     - **(a) Nginx `client_max_body_size` ungesetzt → Default 1 MB:** Uploads >1 MB (Handy-Fotos/Banner)
       wurden mit 413 abgewiesen, bevor sie die App erreichten (nur winzige Bilder gingen durch).
       Fix: `client_max_body_size 8M;` in beiden server-Blöcken. App-Limit bleibt 4 MB (`lib/uploadFile.js`).
     - **(b) HAUPTURSACHE „Foto wird nicht übernommen": `next start` liefert nur public/-Dateien aus, die
       ZUR BUILD-ZEIT existierten.** Zur Laufzeit hochgeladene Bilder (`/players/…`, `/team/…`) wurden zwar
       gespeichert + in der DB gesetzt, aber per HTTP **404** ausgeliefert (bis zum nächsten Rebuild).
       Fix: Uploads liegen jetzt unter **`/var/www/hoops-uploads/{players,team}`** (NICHT unter `/root` –
       das ist `700` → `www-data` „Permission denied"); `public/{players,team}` sind **Symlinks** dorthin
       (App schreibt unverändert nach `public/…`). Nginx-**Location** liefert nur **Bilddateien** direkt von
       `/var/www` aus (Extension-Regex `^/(players|team)/.+\.(jpg|jpeg|png|webp|gif)$` → kollidiert NICHT mit
       Next-Seiten wie `/team/admin`, `/team/create`, die durch `location /` zur App proxen).
     - **Verifiziert live:** bestehende + neu hochgeladene Bilder → HTTP 200; Write-Through-Symlink ok
       (neue Datei sofort abrufbar, kein Rebuild); `/team/*`-Seiten weiter 200. ⚠️ Auth war NICHT die
       Ursache – `getTeamAuthToken()` fällt korrekt auf den Spieler-Token zurück (Dual-Auth ok).
     - **⚠️ Bei Neu-Deploy/Server-Umzug:** `deploy/nginx-hoopsgermany.conf` nach
       `/etc/nginx/sites-available/default`, Symlinks + `/var/www/hoops-uploads` (chown root:www-data,
       chmod a+rX) neu anlegen, sonst sind Uploads wieder kaputt.
   - ✅ **Upload-UX: Client-Vorprüfung + klare Fehlermeldungen** (`3def2c3`, live): `components/ImageUpload.js`
     prüft Format + Größe (4 MB) **vor** dem Upload → sofortige konkrete Meldung statt vergeblichem Upload;
     413 (Proxy) wird gesondert als „zu groß" gemeldet. Limits/Formate zentral aus Konstanten (passend zu
     `lib/uploadFile.js`). Gilt für Spielerfoto, Team-Logo, Banner (gemeinsame Komponente).
   - ✅ **HEIC/iPhone-Support** (`97b98a3`, live): iPhone-Fotos (HEIC/HEIF) werden **serverseitig nach JPEG
     konvertiert** (`lib/uploadFile.js` via **`heic-convert`**, neue Dependency, pure JS/WASM – keine
     System-Libs), da HEIC außerhalb von Safari nicht angezeigt wird. Erkennung über MIME **oder** Endung
     (manche Browser senden HEIC ohne MIME-Typ). `ImageUpload` akzeptiert HEIC (accept + Vorprüfung), Hinweis
     „iPhone-Fotos (HEIC) werden automatisch umgewandelt". Verifiziert mit echtem 3-MB-HEIC lokal (Node 24)
     **und auf Prod (Node 20)** → valides JPG. ⚠️ **Neue Dependency** → Deploy braucht `npm install` (nicht
     nur `git pull && build`). **Optionaler Follow-up:** stored JPEGs nicht verkleinert (Avatare können groß
     sein) – ggf. später sharp-Resize (entspricht aber dem Status quo der Nicht-HEIC-Uploads).
   - ✅ **Stadt-Typeahead bereinigt** (`2c6d104`, live): `public/data/de-cities.json` enthielt Behörden/POIs
     (Agentur für Arbeit, Amtsgericht, Sparkassen, Kliniken, Versicherungen …). `scripts/clean-cities.mjs`
     entfernt klare Institutionen per **Phrasen-Muster** (echte Orte wie Bad Elster/Schulenberg/Elsterwerda
     bleiben): **16172 → 14910** (1262 entfernt). Live verifiziert (Agentur/Amtsgericht/Sparkasse = 0 Treffer).
   - ✅ **Onboarding-Checklist** (`2632972`, live): Tester-Feedback „neue User sind lost" → dismissbare
     **Navy/Orange-Karte oben im Newsfeed** mit Fortschrittsbalken + **4 Schritten**: Profilfoto,
     Profil vervollständigen (Position + Bundesland), Team beitreten/gründen, jemandem folgen. Erledigt-Status
     **live aus `getmyinfo`** abgeleitet (`components/onboarding/OnboardingChecklist.js`); blendet sich aus,
     sobald **alle Schritte erledigt** sind ODER der Nutzer ausblendet (**Server-Flag**
     `Player.onboardingDismissed` via `POST /api/player/dismiss-onboarding`, geräteübergreifend).
     Im Preview verifiziert (Render 2/4 = 50 %, Dismiss persistiert, danach ausgeblendet). ⚠️ Schema-Feld →
     Dev-Server-Neustart nötig (mongoose-Cache), Prod ok durch frischen Build.
     **Erweiterung** (`3fea157`, live): Checklist erscheint jetzt **auch auf der Startseite `/`** (eingeloggt,
     `components/landing/LandingOnboarding.js`, nach dem Hero). Neuer **Feedback-Chip „Onboarding / Einstieg"**
     (`app/feedback` AREAS) – via Skill `update-feedback-analytics`; Analytics unverändert (Onboarding ohne
     eigenen Pfad, `/` = „Startseite").
   - ✅ **Analytics-Ausbau – Phase 1** (`f3c6714`, live): Dashboard `/admin/analytics` in **zwei Tabs**
     (Plattform intern | Sponsor-Report) + **Zeitraum-Filter** (7/30/90/365). **Datenfundament:**
     `AnalyticsEvent` um `device/browser/os` (serverseitig aus User-Agent via `lib/userAgent.js`, nicht
     personenbezogen) + optionale `playerId` erweitert (Tracker sendet Player-Token → „aktive Nutzer");
     Indizes auf `createdAt`. **Summary-API** (`/api/analytics/summary`, POST `period`): Reichweite
     (Aufrufe/Besucher) **mit Wachstum ggü. Vorperiode**, neue/wiederkehrende Besucher, aktive Nutzer 7/30,
     Geräte-Breakdown, Tages-Zeitreihe, Top-Seiten/Bereiche je Zeitraum, abgeleitete Bereichs-KPIs,
     Plattform-Kennzahlen (Nutzer/Teams=Vereine/Spiele/Ligen) mit Neuzugängen + Monatswachstum.
     **UI:** `components/admin/StatCard.js` (Wachstum grün/rot), `components/admin/LineChart.js`
     (Eigenbau-SVG, kein Extra-Paket), Balken, **CSV-Export**; druckfreundliche **`/admin/sponsor-report`**
     (Reichweite/Verlauf/Geräte/Bereiche/Plattform-Stärke/Werbeflächen → Browser-Druck als PDF,
     `TestPhaseBanner` `print:hidden`). **Datenschutz:** nur aggregierte Zahlen. ⚠️ Entscheidung: **Team =
     Verein** (eine Kennzahl). ⚠️ Schema-Feld → Dev-Neustart nötig (mongoose-Cache); Geräte alter Events =
     „unbekannt" (heilt sich vorwärts). Im Preview verifiziert (beide Tabs/Zeitraum/Chart/Report/CSV).
   - ✅ **Analytics-Ausbau – Phase 2** (`3dfce29`, live): **Regionale Stärke** (aus Profildaten, aggregiert):
     Nutzer nach Bundesland/Stadt, Teams/Vereine nach Stadt, **Besucher nach Bundesland** = eingeloggte
     Nutzer (Event-`playerId` → Profil-Bundesland; **bewusst keine IP-Geolokalisierung**, DSGVO-konform).
     **Content-Performance:** beliebteste Spielerprofile/Teams/Ligen nach Aufrufen (Slugs/IDs aus Pfaden →
     Namen aufgelöst). **Sitzungsmetriken:** Sitzungen, Seiten/Sitzung, Ø Sitzungsdauer via Sessionisierung
     (`$setWindowFields`, 30-Min-Inaktivitätslücke; läuft auf Atlas). UI: `EngagementCards`/`RegionCard`/
     `ContentCard` in beiden Tabs + im Sponsoring-Report; CSV erweitert. Im Preview verifiziert.
   - ✅ **Analytics-Ausbau – Phase 3 (Teil 1: teilbarer Sponsor-Report)** (`7074bfe`, live): Für die
     Akquise per Link, auch ohne laufende Werbung. **Refactor:** Summary-Logik → `lib/analyticsSummary.js`
     (`computeAnalyticsSummary`), Report-Ansicht → `components/admin/SponsorReportView.js` (von Admin- UND
     öffentlicher Seite genutzt). **Modell `ReportShare`** (token + **bcrypt-Passwort** + label + active).
     Admin-Verwaltung `/api/analytics/shares` (list/create/revoke) + UI `SharesManager` im Sponsor-Tab.
     **Öffentliche Seite `/sponsor-report/[token]`** mit Passwort-Gate → `/api/analytics/public-report`
     (token+Passwort, bcrypt, konstantzeit-Vergleich) liefert **nur aggregierte Zahlen**; Zeitraum-
     Umschaltung + Druck/PDF. `AnalyticsTracker` ignoriert `/sponsor-report`. Verifiziert (Refactor ok,
     Gate falsch→401/richtig→Report mit Label, Admin-Liste). **⚠️ Passwort separat vom Link weitergeben.**
     **🔜 Offen: Phase 3 (Teil 2)** – Banner-Tracking je Werbefläche (Impressionen/Klicks/CTR), Sponsor-
     Entität + per-Sponsor-Auswertung, Leads/Kontaktanfragen, automatischer PDF-Export. **Sinnvoll erst mit
     echten Werbeflächen** → an Monetarisierung (#3) gekoppelt, bis **Gewerbeanmeldung** zurückgestellt.
   - ✅ **„Land"/country aus dem Profil entfernt, „Nationalität" beibehalten** (`b22b731`+`2632972`, live):
     Entscheidung 26.06. – DE-only-Seite, Land überflüssig. Entfernt aus edit-profile/Anzeige/Selects;
     **Nationalität bleibt** (auf Wunsch wieder aktiviert). `Player.country` bleibt dormant (@deprecated, keine Migration).
   - ✅ **Teams-Übersicht: prominenter „Team gründen"-CTA** (`cafedfe`, live): Tester-Feedback „Team gründen
     war nur versteckt in der Navbar". `/teams` hat jetzt einen deutlichen Orange-CTA im Navy-Header
     („Eigenes Team gründen") mit Hinweis, dass man **automatisch Team-Admin** wird (Kader/Spiele verwalten),
     plus „Team gründen"-Button im Leerzustand. Deckt den Onboarding-Schritt (verlinkt auf /teams) ab.
     (Team-Admin-Logik bei Gründung existiert bereits: `isTeamAdmin`/`teamAdminOf`/`adminPlayerId`.)
   - ✅ **Team-Admin kann Co-Admins ernennen/entziehen** (`64c8a2f`, live): im KaderTab Rollen-Badge
     (Gründer/Admin/Mitglied) + Buttons „Zum Admin machen"/„Adminrechte entziehen". Nutzt die bestehende
     Dual-Auth (`Player.isTeamAdmin` + `teamAdminOf` == Team) → **kein Auth-/Team-Modell-Umbau**. Endpoint
     `POST /api/team/set-member-admin` (jeder Team-Admin darf; **Gründer = `Team.adminPlayerId` geschützt**,
     nicht degradierbar). Promote benachrichtigt den Spieler (neuer Notif-Typ `team_admin_granted` →
     `/team/admin`). `roster-players` liefert `isAdmin`/`isFounder`. Entfernen nur für einfache Mitglieder
     (Admins erst degradieren). Im Preview verifiziert (Promote/Demote/Founder-Schutz 400/Notification).
   - ✅ **Willkommens-Tour nach der Registrierung** (`14670aa`, live): mehrstufiges Overlay (5 Slides:
     Intro, Profil & Stats, Teams & Kader, Spiele/Ligen, Transfermarkt/Tryouts/Community) als Anreiz.
     App-weit im Root-Layout (`components/onboarding/WelcomeTour.js`); **startet einmalig nach Signup**
     (E-Mail + Google einheitlich über **Server-Flag `Player.welcomeSeen`**, gesetzt via
     `POST /api/player/mark-welcome-seen`; Auto-Check 1×/Session via sessionStorage). **Jederzeit erneut
     aufrufbar** über den Footer-Link „Plattform-Tour" (`TourLink` → Custom-Event `hg:open-tour`).
     Im Preview verifiziert (Auto-Start, Slider, „Los geht's" setzt Flag, Footer-Reopen, keine Fehler).
     **Beide Tester-Agenda-Punkte (26.06.) damit erledigt** (Co-Admins + Willkommens-Tour).
     **🐞 Fix** (`0cd4237`, live): Tour erschien nach Registrierung NICHT – Ursache: `WelcomeTour` im
     Root-Layout remountet bei Client-Navigation (`router.push` nach Signup) nicht, der `[]`-Auto-Check lief
     nur beim ersten (ausgeloggten) App-Mount. Fix: `usePathname`-Dependency → Check läuft bei jedem
     Routenwechsel neu (erkennt Login/Registrierung nach Mount); sessionStorage-Wächter hält es bei 1×/Session.
     Verifiziert mit echter Registrierung → Tour öffnet direkt auf `/player/newsfeed`.
   - ✅ **UX-Durchgang über die neuen Liga-Features** (`b39a35d`, mobil 375px): /ligen-Filter+Saison-Switcher,
     Liga-Detail (Tabelle+Playoffs), Topscorer, EinstellungenTab-Liga-Picker, Admin-Liga-Steuerung,
     SpielplanTab-Playoff-Formular, Team-Liga-Karte – alle sauber. **Fix:** Rangliste- + Topscorer-Tabelle
     hatten keinen horizontalen Scroll-Container → bei 375px wurden rechte Spalten abgeschnitten (jetzt
     `overflow-x-auto`, konsistent mit Liga-Detail).
   - ✅ **„Folgen"-System geprüft + Bug behoben** (`87fe0ec`, live): Ursache = **reiner Anzeige-Bug** auf dem
     **Spielerprofil** (`view-player`): `FollowButton` ohne `onCountChange` → angezeigter `followersCount`
     blieb beim Folgen stehen (Button wechselte, Zahl nicht). Fix: `onCountChange` → `setPlayer` aktualisiert
     den Count live. **Backend war korrekt** (Count/DB/Toggle stimmten). Team-Detailseite war bereits korrekt
     verdrahtet (live verifiziert). End-to-end geprüft: `followplayer`/`followteam` (Count+DB+Toggle),
     `checkfollowing`, Follow-Notification, **„Folge ich"-Feed** (gefolgte Spieler + Mitglieder gefolgter Teams –
     empirisch bestätigt). Offen/optional: Team-Follow erzeugt **keine** Benachrichtigung (Design, kein Bug).
5. **Liga-Katalog Jugend** ✅ **weibliche Jugend ergänzt** (`2a95624`, live): U18w/U16w/U14w/U12w (10 Ligen,
   `gender:"Damen"`). Stufen aus der WBV-„Ligenstruktur Jugend" (gilt lt. Doku für weibl./männl./offen),
   gespiegelt zur männlichen 2025/26-Struktur (exakte weibliche 2025/26-Einteilung war nicht auffindbar).
   **⚠️ struktur-basiert** → bei realer Abweichung per Admin (`/admin/leagues`) / „Liga melden" korrigieren.
   **🔻 CUTOFF bei U16 (26.06.2026, `377818e`, Dev+Prod live):** Entscheidung mit Partner – Jugend nur bis
   einschließlich **U16**; **U14/U12/U10 entfernt**. `LEAGUE_AGE_GROUPS` auf `[Senioren,U18,U16]` reduziert
   (raus aus allen Dropdowns/Filtern); `seed-nrw-leagues.mjs` ohne U14/U12-Einträge + expliziter Safe-Delete
   für `<U16`-Ligen (löscht nur leere, schützt Daten). Auf Dev **und** Prod ausgeführt → je **10 leere
   <U16-Ligen entfernt**, **Katalog gesamt jetzt 57** (31 Herren + 16 Damen + **10 Jugend U18/U16 m/w**).
   **Noch offen:** (optional) NRW-**Kreisligen** (pro Basketballkreis, niedrige Prio). U10/U12/U14 bewusst
   gestrichen (nicht mehr „offen").
6. **Saisonende + Meister** ✅ **erledigt** (`b33c65f`, live): `League.finished` + `champion`; Admin
   (`/admin/leagues`) setzt „Saison abgeschlossen" + Meister (Auto-Tabellenführer oder explizit =
   Playoff-Sieger); `/ligen/[id]` zeigt Meister-Banner + Krone, `/ligen`-Liste „Abgeschlossen"-Badge.
   **Saison-Archiv-Browser** ✅ **erledigt** (`21c35d3`, live): `/api/leagues?season=` (inkl. archivierter
   Ligen) + `seasons`-Liste; `/ligen` hat einen **Saison-Switcher** („Aktuelle Saison" = aktive, je Saison =
   alle inkl. Archiv), Meister wird auf abgeschlossenen Karten gezeigt; `updateleague` friert den Meister beim
   Abschließen ein (Tabellenführer automatisch oder explizit).
   ✅ **Playoffs erledigt** (`54ac62d`, live): `Match.stage` (Hauptrunde|Playoffs) + `playoffRound`
   (`lib/constants.PLAYOFF_ROUNDS`). Spiel-Anlage (`SpielplanTab`/`matches/create`) erlaubt bei gewählter Liga
   Spieltyp + Runde (Playoffs nur mit Liga). **Tabelle zählt nur Hauptrunde** (`computeStandings` +
   `standings`-API schließen Playoffs aus). `/ligen/[id]` zeigt einen **Playoff-Abschnitt nach Runde**
   (verlinkt aufs Match); Match-Detail zeigt „Playoffs · Runde"-Badge. **Meister-Automatik bevorzugt den
   Finalsieger**, sonst Tabellenführer (`updateleague.resolveChampionId`).
   **Noch offen (optional):** Best-of-Serien (mehrere Spiele je Paarung), echte Bracket-Grafik.
7. **Liga-Wechsel im Team-Einstellungen-Tab** ✅ **erledigt** (`25c8628`, live): `/api/team/set-league` +
   Picker in `EinstellungenTab` (pflegt `League.teams` beidseitig). Teams können sich nach dem Season-Rollover
   der neuen Saison zuordnen.

#### 🗞️ Newsfeed-Weiterentwicklung – Quick-Win-Paket (27.06.2026)
> Auf Basis einer tiefen Ist-Analyse des Feeds (roh-chronologisch, keine Personalisierung, keine Auto-Posts,
> keine Like-/Kommentar-Notifs). Umgesetzt, lokal verifiziert (Build grün, Preview-Flows) **und live deployt**
> (`a0c6321`, 27.06.2026; Prod-Build grün, Smoke-Test grün). **Prod-Infra für Bild-Uploads eingerichtet:**
> `/var/www/hoops-uploads/posts` (root:www-data) + Symlink `public/posts` + Nginx-Location um `posts` erweitert
> (Backup `default.bak-pre-posts-*`) → posts-Bildauslieferung live mit HTTP 200 verifiziert.
> - **#1 Engagement-Benachrichtigungen + Post-Permalink:** Neue Notif-Typen `post_like`/`post_comment`/
>   `comment_reply` (`models/Player.js` Enum + Felder `postId`/`count`). Helper `lib/notifyEngagement.js`
>   (kein Self-Notify; **Likes gebündelt** = eine Notif mit Zähler statt Flut; fehlertolerant). Verdrahtet in
>   `likepost`/`addcomment`/`addreply`. `getnotifications` gibt jetzt `postId`/`matchId`/`count`/`teamName`
>   mit zurück (vorher gedroppt → **nebenbei match_result-Links repariert**). `notificationHref` → `/post/[id]`;
>   `NotificationBell` Icons ergänzt. Neue **Permalink-Seite** `app/post/[id]/page.js` + API `/api/posts/single`.
> - **#3 Echter Bild-Upload im Composer:** statt URL-Paste jetzt `components/ImageUpload` (HEIC/Validierung)
>   in `PostComposer`; neuer Endpoint `/api/posts/upload-image` (`saveImage(file,"posts")`). `.gitignore` +
>   `deploy/nginx-hoopsgermany.conf` um `posts` erweitert. ⚠️ **Prod-Deploy braucht** wie bei players/team:
>   `/var/www/hoops-uploads/posts` + Symlink `public/posts` + Nginx-Location (sonst 404 nach Rebuild).
> - **#4 Teamkollegen im Feed + Auto-Follow:** `getfollowingposts` bezieht jetzt **eigene Team-Mitglieder**
>   immer ein (auch ohne Follow). Helper `lib/teamFollow.js` (`followOwnTeam`, beidseitig/idempotent) in
>   `team/create` (Gründer), `handlejoinrequest` (approve), `roster/approve-claim` verdrahtet.
> - **Verifiziert (Dev/Preview):** Like+Kommentar von Max auf fremden Beitrag → Notifs in DB angelegt;
>   2. Liker → Bündelung `count=2`; Bild-Upload → `/posts/…png` ausgeliefert (200); Composer-„Bild" blendet
>   Uploader ein; Permalink lädt Beitrag.
> - **#2 Auto-Posts** ✅ (`models/Post.js`: `kind`/`autoType`/`teams[]`/`subjectPlayer`/`eventKey`/`meta`;
>   Helper `lib/autoPost.js` – alle fehlertolerant, idempotent über `eventKey`, Render-Daten denormalisiert
>   in `content`/`meta` → **kein populate nötig**). Drei Quellen: **Spielergebnis** (`syncMatchResultPost` aus
>   `submit-match-result` UND `admin/updatematch` – legt an/aktualisiert bei gültigem Ergebnis, entfernt bei
>   mismatch/Reset), **Transfer/Beitritt/Gründung** (`autoPostTransfer` zentral in `recordTransfer` – nutzt die
>   bereits gebaute Klartext-Message; `team_founded` als eigener Badge), **Tryout** (`autoPostTryout` in
>   `tryouts/create`). `getfollowingposts` zeigt Auto-Posts via `$or` (eigene/gefolgte `teams` ∩ oder gefolgter
>   `subjectPlayer`); „Entdecken" zeigt sie ohnehin. `PostCard` rendert Auto-Posts mit Icon+Badge je Typ
>   (Spielergebnis/Transfer/Neues Team/Tryout) + verlinktem Ereignis. Auto-Posts sind like-/kommentierbar.
>   **Verifiziert (Dev/Preview):** Match-Ergebnis (88:72→90:70 **idempotent**, 1 Post), Tryout, Beitritt (Sven→
>   Test Baskets) je 1 Auto-Post mit korrekten Teams/Links; alle 3 im Feed + korrekt gerendert; keine Konsolenfehler.
>   **Live deployt** (`b7445b2`, 27.06.2026; Prod-Build grün, Smoke-Test Homepage/Feed-API/Newsfeed 200). Keine
>   neue Infra nötig (Auto-Posts ohne Uploads); Bestand-Posts ohne `kind` = „user" (rückwärtskompatibel, keine Migration).
>
> #### 📋 Newsfeed-Roadmap (vollständige Analyse vom 27.06.2026 – verbindliche Grundlage fürs Weitermachen)
> **Ist-Zustand-Befunde (Ausgangslage der Analyse):** Der Feed hat **2 Tabs** „Entdecken" (`/api/posts/feed`,
> `Post.find({})` rein chronologisch, KEIN Ranking) + „Folge ich" (`getfollowingposts`). Vor diesem Paket gab es
> **keine Personalisierung, keine Auto-Posts, keine Like-/Kommentar-Notifs, keine Team-Posts**; Composer nahm nur
> eine Bild-**URL** (kein Upload). Beitragstypen: Text + 1 Bild + Emojis; **fehlen** weiterhin: mehrere Bilder,
> Videos, Link-/YouTube-/IG-Embeds, Hashtags, @Mentions. Diese Befunde sind die Basis der Punkte unten.
>
> **Status der 10 Verbesserungen (priorisiert nach Impact × Langfristnutzen ÷ Aufwand):**
> | # | Verbesserung | Status |
> |---|---|---|
> | 1 | Like/Kommentar/Antwort-Benachrichtigungen (gebündelt) + Post-Permalink | ✅ live (`a0c6321`) |
> | 3 | Echter Bild-Upload im Composer (HEIC) | ✅ live (`a0c6321`) |
> | 4 | Teamkollegen/eigenes Team in „Folge ich" + Auto-Follow | ✅ live (`a0c6321`) |
> | 2 | Auto-Posts (Ergebnis/Transfer/Tryout) | ✅ live (`b7445b2`) |
> | 7 | Transfermarkt→Feed (suchende Spieler/Vereine, als Auto-Posts) | ✅ live (`c9bb958`) |
> | 5 | „Für dich"-Ranking (Hot-Score + Region/Liga/Team-Boosts statt roh-chronologisch) | ✅ live (`8755c08`) |
> | 6 | Team-Posts (Vereine als Autoren: Probetraining/Heimspiel/News) | ✅ live (`33316d0`) |
> | 8 | Folge-Vorschläge im Feed (Region/Liga) für neue User | ✅ live (`8755553`) |
> | 9 | Hashtags + @Mentions (klickbar + Mention-Notif) | ✅ live (`bfc97e8`) |
> | 10 | YouTube-/Link-Embeds (Highlight-Clips) | ✅ live (`fe4bbee`) |
>
> **🎉 NEWSFEED-ROADMAP 10/10 KOMPLETT (27.06.2026) – alle live auf hoopsgermany.de.**
>
> **#7 Transfermarkt→Feed ✅ erledigt** (`c9bb958`): Über `lib/autoPost.js` – `autoPostTransferAvailable`
> (Spieler setzt `transferStatus:"verfuegbar"` in `update-transfer` → subjectPlayer, Text mit
> preferredLeague·bundesland) und `autoPostRecruiting` (Verein aktiviert „Verstärkung suchen" in
> `set-recruiting` → teams=[teamId], gesuchte Rollen + Notiz). **Anti-Spam:** beide Routen lesen den
> **vorherigen Status** und posten NUR beim Übergang (`≠verfuegbar→verfuegbar` bzw. `recruiting false→true`);
> zusätzlich **Tages-Throttle** über `eventKey` mit `dayStamp()` (max. 1 Post/Person/Tag). Neue `autoType`
> „recruiting"/„transfer_available" in `PostCard.AUTO` (Badges „Spieler gesucht"/„Auf Vereinssuche").
> Sichtbarkeit via bestehendes `getfollowingposts`-`$or` (teams/subjectPlayer). **Verifiziert (Dev/Preview):**
> doppeltes Umschalten → je 1 Post, Texte/Links/Notiz korrekt, im Feed + gerendert, keine Konsolenfehler.
> **Live deployt** (27.06.2026; Prod-Build grün, Smoke Homepage/Feed-API/Transfermarkt 200; keine neue Infra/Migration).
> **Regionale Dosierung** bewusst auf #5 (Ranking) verschoben – vorerst Reichweite > Filter, Region/Liga steht im Text.
>
> **#5 „Für dich"-Ranking ✅ erledigt** (`8755c08`, live 27.06.2026): `lib/feedRanking.js`
> (`computeScore`/`rankPosts`, deterministisch, im Speicher) – `score = (1 + likes + 2·kommentare +
> Medien-/Auto-Bonus) / (alterStunden + 2)^1.5` × Boosts: eigenes Team ×2 · gefolgt ×1.8 · gleiche Liga ×1.5 ·
> gleiches Bundesland ×1.3. `/api/posts/feed` nimmt jetzt **optionalen Token** (Personalisierung; funktioniert
> auch ausgeloggt), rankt ein Kandidatenfenster der **500 neuesten** Beiträge, lädt Team→Liga/Bundesland einmalig,
> **Offset-Paginierung** (Ranking ist nicht chronologisch). Newsfeed-Tab „Entdecken" → **„Für dich"**; discover
> paginiert per `offset`, „Folge ich" bleibt chronologisch (`before`). **Verifiziert (Dev/Preview):** Ranking nach
> Engagement; eigenes Team steigt messbar ggü. ausgeloggt (`orderDiffers`); Offset-Seiten ohne Überlappung;
> ausgeloggt ok; keine Konsolenfehler. ⚠️ Beiträge älter als die 500 neuesten erscheinen nicht in „Für dich"
> (für Amateur-Scale unkritisch). Auto-Posts bekommen einen kleinen Sockel, damit sie frisch nicht versinken.
>
> **#6 Team-Posts ✅ erledigt** (`33316d0`, live 27.06.2026): `models/Post.js` um `authorTeam` (→teams)
> erweitert (`kind` bleibt „user"). Neuer Endpoint `POST /api/posts/team-post` (Dual-Auth via
> `getTeamFromToken` – nur Team-Admins; setzt `player:null`, `authorTeam`, **`teams:[team._id]`** → bestehende
> Feed-/Ranking-Logik greift ohne Zusatzcode). `feed`/`getfollowingposts`/`single` populaten `authorTeam`
> (teamName/slug/logo). `PostCard` zeigt bei `authorTeam` einen **Vereins-Header** (Logo/Initialen-Avatar +
> Name + „Verein"-Badge + Link `/team/team-detail/slug`). `PostComposer` hat für Team-Admins einen Umschalter
> **„Als Spieler / Als <Team>"** (lädt Team via `fetchinfo`, Endpoint-Wechsel je Modus). **Verifiziert
> (Dev/Preview):** Team-Post 201 mit populiertem `authorTeam`; erscheint in „Für dich" UND „Folge ich";
> Composer-Umschalter + Vereins-Header + Badge rendern; keine Konsolenfehler. ⚠️ Team-Profilseite zeigt aktuell
> KEINE Beiträge (existierte noch nie) – optionaler Follow-up: Beiträge-Tab auf `/team/team-detail` (Quelle:
> `{$or:[{authorTeam:teamId},{player:{$in:members}}]}`).
>
> **#8 Folge-Vorschläge ✅ erledigt** (`8755553`, live 27.06.2026): Endpoint `POST /api/player/suggestions`
> (Spieler-Auth) liefert **Spieler** (gleiches Bundesland, Fallback beliebige) + **Vereine** (Bundesland ODER
> gleiche Liga), exkl. selbst/gefolgte/eigenes Team, sortiert nach Follower-Zahl; Position via `positionLabel`
> ausgeschrieben. `components/feed/FollowSuggestions.js` (Karte „Vorschläge für dich", Spieler/Teams abwechselnd,
> kompakter Folgen-Button OHNE `checkfollowing` – Vorschläge sind per Definition ungefolgt; entfernt Eintrag
> optimistisch nach dem Folgen, blendet sich leer aus). Eingebunden im Newsfeed **nach dem Composer**
> (Desktop + Mobil), auf beiden Tabs. **Verifiziert (Dev/Preview):** 5 Spieler + 3 Teams, keine Selbst-/gefolgten
> Einträge; nach Folgen ausgeschlossen + nachgefüllt; Liga-Teams greifen; UI rendert + „Folgen" entfernt Eintrag;
> keine Konsolenfehler. ⚠️ Karte ist aktuell **immer** sichtbar (blendet sich nur leer aus) – optional könnte man
> sie für Nutzer mit vielen Follows ausblenden; bewusst belassen (Discovery hilft auch aktiven Nutzern).
>
> **#9 Hashtags + @Mentions ✅ erledigt** (`bfc97e8`, live 27.06.2026): `models/Post.js` um `hashtags:[String]`
> (indiziert) + `mentions:[{playerId,slug,token}]` erweitert. `lib/postParse.js` (`extractHashtags` +
> `resolveMentions` – Handle = firstName+lastName ODER **eindeutiger** Vorname ODER normalisierter Slug;
> mehrdeutige Vornamen werden übersprungen). `uploadpost`/`team-post` extrahieren + speichern + benachrichtigen
> erwähnte Spieler (neuer Player-Notif-Typ **`mention`**, `notifyMentions` in `lib/notifyEngagement.js`, kein
> Self-Notify; `notificationHref`→`/post/[id]`, `NotificationBell`-Icon `FaAt`). `components/posts/RichText.js`
> rendert `#tag`→`/feed/tag/[tag]` und `@token`→Profil (nur aufgelöste Mentions verlinkt); `PostCard` nutzt es
> für den Inhalt. Neuer Hashtag-Feed: `POST /api/posts/by-tag` + Seite `app/feed/tag/[tag]`. **Verifiziert
> (Dev/Preview):** Tags extrahiert; `@NoahBecker`(Vollname)/`@Tim`(eindeutiger Vorname) aufgelöst; Mention-Notifs
> bei beiden; Feed rendert klickbare #/@-Links; Tag-Seite zeigt Posts; keine Konsolenfehler. ⚠️ Kein
> Composer-Autocomplete (bewusst – Nutzer tippen `@Vorname`/`@VornameNachname`); Mentions in **Kommentaren**
> sind noch nicht geparst (nur Beitragstext) – möglicher Follow-up.
>
> **#10 YouTube-/Link-Embeds ✅ erledigt** (`fe4bbee`, live 27.06.2026): `models/Post.js` um `embed` (Mixed,
> denormalisiert beim Erstellen → kein Fetch im Render). `lib/linkEmbed.js` (`detectEmbed` → erste URL →
> `{type:"youtube",videoId,url}` für watch/`youtu.be`/embed/shorts, sonst `{type:"link",url,domain}` via `URL()`).
> `components/posts/PostEmbed.js` rendert YouTube-iframe (16:9, **lazy**) bzw. kompakte Link-Vorschau-Karte
> (Domain + URL). `RichText` macht zusätzlich rohe `https?://…`-URLs klickbar (target=_blank; URL-Alternative
> steht in der Regex zuerst, damit sie nicht an `#/@` zerschnitten wird). `uploadpost`/`team-post` speichern das
> Embed; `PostCard` rendert `PostEmbed` nach Text/Bild. **Verifiziert (Dev/Preview):** `youtu.be/…` → videoId +
> lazy iframe; generischer Link → Karte (`basketball-bund.net` + URL); URLs inline klickbar; keine Konsolenfehler.
>
> **🎉 DAMIT IST DIE KOMPLETTE NEWSFEED-ROADMAP (Analyse vom 27.06.2026, alle 10 Punkte) ABGESCHLOSSEN UND LIVE.**
> Der Feed kann jetzt: personalisiertes „Für dich"-Ranking, „Folge ich" (inkl. eigenes Team), Auto-Posts
> (Ergebnis/Transfer/Tryout/Recruiting/Verfügbarkeit), Team-Posts, Like/Kommentar/Mention-Benachrichtigungen,
> Bild-Upload, Hashtags + @Mentions (klickbar, mit Tag-Feed), YouTube-/Link-Embeds, Folge-Vorschläge, Permalinks.
> **Optionale Follow-ups (nicht eingeplant):** Mentions/Embeds auch in Kommentaren; Composer-@-Autocomplete;
> OG-Title/Image für Link-Karten; „Beiträge"-Tab auf der Team-Profilseite; Suggestions nur für neue User.
>
> ⚠️ **Dev-DB-Aufräumen vor dem Weitermachen:** Die Verifikation legt in `hoopsgermany` (Dev) Test-Artefakte an
> (z.B. ein „Probetraining"-Team-Post von Test Baskets). Rein lokal → `node scripts/seed-demo.mjs` setzt sauber
> zurück (Standard-Start jeder Newsfeed-Session). **Prod (`hoops_prod`) ist unberührt** (nur Code deployt,
> keine Test-Trigger gegen Prod gefahren).

#### 📱 PWA – Seite als App aufs Handy installierbar (27.06.2026, `de86a7c`, live)
> Nutzerwunsch: „App, die mit der Website synchron ist, oder ein Shortcut/Anleitung zum Pinnen auf den
> Home-Bildschirm." Gelöst als **PWA** (die App **IST** die Website → immer automatisch synchron, kein Store):
> - **`app/manifest.js`** (→ `/manifest.webmanifest`): `display:standalone`, Navy-Theme (`#0f172a`),
>   `start_url:/`, Icons `purpose:any` (`/icon.png`) + `maskable` (`/apple-icon.png`, 512px – wiederverwendet
>   die bestehenden Logo-Assets aus `3100f7e`, keine extra 192/512-Dateien nötig).
> - **`app/layout.js`**: `appleWebApp` ({capable, title, statusBarStyle:black-translucent}) +
>   `export const viewport = { themeColor:"#0f172a" }` → Next generiert manifest-/theme-color-/apple-Tags.
> - **`app/installieren/page.js`** (`/installieren`): Anleitungsseite. ⚠️ **Redesign (`2b8b932`):** alle
>   Plattformen als **aufklappbare Abschnitte** (iPhone/iPad·Safari, Android·Chrome, Desktop·Chrome/Edge/Opera) –
>   die erkannte Plattform wird vorausgewählt geöffnet + „Dein Gerät"-Badge, alle anderen bleiben sichtbar/
>   aufklappbar. (Vorher zeigte Nicht-iOS **inkl. Desktop fälschlich nur die Android-Anleitung** → ein iPhone-
>   Nutzer am Desktop dachte, es ginge nur mit Android.) Direkter **„App installieren"-Button** erscheint
>   geräteunabhängig, sobald der Browser `beforeinstallprompt` anbietet (auch Desktop-Chromium); erkennt bereits
>   installierten Standalone-Modus. Navy-`PageHeader` + 3 Vorteils-Cards + Navbar/Footer.
> - **Footer**: Link „App installieren" (erste Position) → erreichbar von überall.
> - **Onboarding-Baustein** (`43dd746`, live): Die Willkommens-Checklist (`components/onboarding/
>   OnboardingChecklist.js`, „Richte dein Profil ein …" – im Newsfeed **und** auf der eingeloggten
>   Startseite) zeigt unter den 4 Kern-Schritten einen **5. Bonus-Baustein „Als App installieren"** →
>   `/installieren`. **Zählt bewusst NICHT in Fortschritt/`allDone`** (sonst sähen bestehend-fertige Nutzer
>   die Karte wieder) – `done` via Standalone-Erkennung (`display-mode:standalone`/`navigator.standalone`)
>   + `appinstalled`-Merker (`localStorage hg_pwa_installed`), „Bonus"-Badge solange nicht installiert.
> - **Verifiziert:** Build grün; Dev-Preview (Manifest 200 + alle Head-Tags + Seite gerendert; Onboarding-
>   Karte mit Bonus-Zeile bei frischem Account, „0 von 4" bleibt); **live** (`/manifest.webmanifest`,
>   `/installieren`, `/icon.png`, `/apple-icon.png` je 200; Head-Tags auf `/` da).
>   ⚠️ Lehre: `npm run build` NICHT laufen lassen, während `next dev` läuft (überschreibt dessen `.next`-CSS
>   → Dev-Server liefert dann ungestylte Seiten/CSS-404; Dev-Server danach neu starten).

#### 🏗️ Liga-/Saison-/Playoff-/Admin-Audit umgesetzt (27.06.2026) – 5 Stufen, alle live
> Auf Basis eines vollständigen Architektur-Audits (Liga/Saison-Trennung, Team-Saison-Teilnahme,
> Spielerhistorie, Playoffs, Spiele-Filter, Admin-Rechte). Alle Stufen lokal verifiziert + deployt.
> - **Stufe 1 – Integrität/Audit-Log** (`8eeb1bd`): `models/AuditLog.js` (append-only) + `lib/audit.js`.
>   Audit bei `submit-match-result` (Meldung/bestätigt/strittig), `match-stats/save` (Bearbeitung gespielter
>   Partien, mit Spieler-ID), `admin/updatematch` (Super-Admin-Override mit Vorher/Nachher). Endpoint
>   `/api/admin/match-audit` + **Änderungsverlauf-Sektion** auf der Admin-Match-Seite. (Confirmed-Schutz für
>   Ergebnisse existierte schon in submit-match-result; Stats-Edits werden jetzt protokolliert statt blockiert.)
> - **Stufe 2 – Topscorer-Teamlabel** (`cca5e5a`): zeigt das Team **zum Zeitpunkt der Punkte** (gruppiert
>   nach `playerStats.team`, Label = punktstärkstes Team; saisongenau bei Saison-Filter) statt `player.teamId`.
> - **Stufe 3 – Playoffs explizit** (`f842d05`): `League.playoffMode` (`keine`|`best_of_1`, Default keine) +
>   `LEAGUE_PLAYOFF_MODES`. Admin-Liga-Verwaltung (Erstellen+Bearbeiten) setzt den Modus; `/api/leagues/[id]`
>   liefert `playoffMode`+`championBasis`; Liga-Detailseite zeigt klar „Meister über Playoffs" vs.
>   „über Abschlusstabelle". Macht „Playoffs optional pro Liga" explizit (funktionierte implizit schon über
>   `resolveChampionId`: Finalsieger sonst Tabellenführer).
> - **Stufe 4 – Spiele-/Team-Spielplan-Filter** (`1007e2b`): `matches/public` + `fetchsingleteaminfo` liefern
>   `leagueId`(populate name/season)/`stage`/`playoffRound`. `/spiele`: Tabs Anstehend/Ergebnisse/Alle + Filter
>   Abschnitt(Hauptrunde/Playoffs)/Liga/Saison/Ort/ab-Datum, je Karte Liga-Zeile + Playoff-Badge. Team-Detail-
>   Spielplan: Sub-Tabs Anstehend/Vergangen/Alle/Playoffs + Playoff-Badge.
> - **Stufe 5 – TeamSeason-Fundament** (`4edd9b4`): `models/TeamSeason.js` (teamId/leagueId/season/**status**/
>   placement/wins/losses/pointsFor/Against/diff/champion/finalized, unique je Team+Liga+Saison). `lib/teamSeason.js`
>   `freezeSeason` friert den Endstand **beim Saisonabschluss** als Snapshot ein (Upsert, Status bleibt) →
>   **alte Saisons werden nie überschrieben** (neue Saison = anderes Liga-Dokument). `TEAM_SEASON_STATUS`
>   (aktiv/zurückgezogen/außer Konkurrenz/disqualifiziert). APIs `/api/team/season-history`,
>   `/api/admin/league-seasons`, `/api/admin/season-status`. **Team-Detail: neuer „Saisons"-Tab** (Saison/Liga/
>   Platz/Bilanz/Diff/Status/Meister); Admin-Liga: Saison-Status je Team verwaltbar (bei abgeschlossener Liga).
>   Verifiziert: Liga abschließen → 4 Snapshots (Platz 1–4, Meister Munich Hoops 3-0); Status „disqualifiziert"
>   gesetzt; Saisons-Tab rendert Saison/Liga/Meister/Status.
> **Bewusst offen (optionale Follow-ups):** Best-of-3/5 + echter Playoff-Bracket/Auto-Seeding (aktuell Best-of-1,
> Paarungen manuell); Status-basierte Tabellen-Exklusion (Status ist Snapshot-Metadatum, ändert die Live-Tabelle
> nicht); Stat-Filter Hauptrunde/Playoffs/Gesamt; stabiler `leagueKey` zur Saison-Verknüpfung einer Liga.
> ⚠️ **Dev-DB enthält Audit-Test-Artefakte** (abgeschlossene Regionalliga Süd + TeamSeason-Snapshots, Playoff-
> Finale, Audit-Logs, geändertes Ergebnis). Rein lokal → `node scripts/seed-demo.mjs` setzt zurück; **Prod unberührt**
> (nur Code deployt). Neue Schemas (AuditLog/TeamSeason/League.playoffMode) sind additiv, **keine Migration**.

#### 🌍 Demo-Welt-Generator `seed-world.mjs` (27.06.2026) – „fühlt sich an wie 1 Jahr live"
> Großer, **zusammenhängender** Demo-Datensatz mit Narrativen. **Getaggt `seedTag:"world"`, additiv,
> `--purge`-fähig** (fasst echte/andere Daten nicht an), eigene Ligen (self-contained), **eindeutige Team-/
> Spielernamen** (keine Kollision mit `teamName`-Unique). Aufruf: `node scripts/seed-world.mjs` (Dev) bzw.
> `node scripts/seed-world.mjs --prod` (Prod), Entfernen: `… --purge`.
> - **Umfang:** 10 Ligen (8 aktuell 2025/26 + 2 Vorsaison 2024/25 abgeschlossen mit Playoffs/Meister/TeamSeason-
>   Freeze), 40 NRW-Teams (~38 Vereinsgesuche), 359 Spieler (87 transferbereit inkl. Coach/Manager/Sportl. Ltg.,
>   ~18 % „pending"/inaktiv), 136 Spiele (gespielt+anstehend, Box-Scores **positions- & tier-realistisch** →
>   PG viele Assists, C viele Rebounds, Shooter viele Punkte, Bench wenig/DNP), ~45 % Spiele mit **MVP/Zuschauer/
>   Spielbericht** (neue `Match.mvp/attendance/report`-Felder + Anzeige auf der Match-Seite), 10 TeamSeason-
>   Snapshots, Transfermarkt (Angebote + Gesuche, teils ältere Einträge), 7 Tryouts, **265 Posts** (User/Vereins-
>   News/**Auto-Posts** Ergebnis/Transfer/Recruiting/Verfügbar/Meister/Tryout), Likes+Kommentare, Follower **nach
>   Tier** (Jugend 2–8, Amateur 15–90, Stars 120–260, Vereine 30–400), Karriere-Stationen (Mehr-Saison/Mehr-Team),
>   12-Monats-Zeitverteilung.
> - **Narrative (Geschichten):** Finn Brandt (`finn.brandt@demo.de`, seit Jahren Düsseldorf Diamonds, sucht
>   höherklassig), Köln Sharks suchen seit 2 Wochen einen PG, Dortmund Drivers Siegesserie, Rhein Rockets
>   Aufstieg/Meister 2024/25, Essen Eagles offenes Probetraining. **Login** `world.coach@demo.de` / `test123`.
> - **Verifiziert (Dev):** Feed lebendig (Auto-Posts/Vereins-News/Vorschläge); Topscorer realistisch (Star >20 PPG);
>   Finn 2 Stationen (Düsseldorf 24/25+25/26); abgeschlossene Liga **Tabellenführer ≠ Meister** (Playoff-Sieger);
>   MVP-Spiel mit Zuschauer/Bericht; keine Konsolenfehler; Build grün. Code (`0f33be0`) gepusht. ⚠️ Auf **Prod
>   noch NICHT geseedet** (großer additiver Write → erst nach ausdrücklicher Freigabe; `--prod` + `--purge` bereit).

#### 📲 Tester-Feedback-Runde (28.06.2026, `97d65b8`, live) – Kader-UX, Rückennummer, Mails
> Aus Jonatans WhatsApp-Feedback (5 Punkte), alle live deployt + im Preview verifiziert (`max@test.de`):
> 1. **Freigabe-Mail robust + nächste Schritte + Bündelung:** `approve-team` loggt Mail-Fehler statt sie stumm
>    zu verschlucken; `teamApprovedEmail` enthält jetzt konkrete nächste Schritte (Kader füllen → Spiele
>    eintragen → Vereinsseite, als `linkCard`s mit `?tab=…`-Deeplinks). **Admin-Benachrichtigungen** (neues Team
>    `team/create`, Feedback, Liga-Meldung `leagues/report`, Mismatch `submit-match-result`) gehen zusätzlich
>    **gebündelt an `info@hoopsgermany`** (neuer Helper `lib/adminRecipients.js`: `getAdminNotifyTo()` =
>    Super-Admin-Mails + `CENTRAL_INBOX`, dedupliziert; via `ADMIN_INBOX` überschreibbar) → nichts geht in
>    persönlichen Postfächern unter.
> 2. **Kader-Slots öffentlich sichtbar:** `fetchsingleteaminfo` lieferte nur `status!=="empty"` → vom Admin
>    angelegte, noch nicht beanspruchte Plätze waren unsichtbar. Jetzt werden **benannte** „empty"-Slots
>    mitgeliefert und auf der Vereinsseite (`team-detail`) als **„eingeladen"** (statt „Frei") gezeigt; namenlose
>    Leer-Slots bleiben verborgen.
> 3. **Button „Slot hinzufügen" → „Spieler hinzufügen"** (`KaderTab`) + Hilfetext „Lege Spieler an und lade sie
>    per Link/WhatsApp/E-Mail ein".
> 4. **Allgemeiner Team-Einladungslink jetzt auch im Kader-Reiter** (`KaderTab`): eigener Block oben
>    (Kopieren/WhatsApp/„Neuer Link", via `generate-invite`), nicht mehr nur unter Einstellungen.
> 5. **Optionale Rückennummer** (`Player.number`, additiv, keine Migration): im **Spielerprofil pflegbar**
>    (edit-profile-Feld + `update-profile`/whitelist) **UND vom Team-Admin im Kader vergebbar** (neuer Endpoint
>    `/api/team/set-member-number`, Inline-`#`-Editor je Mitglied in `KaderTab`). **Slot-Nummer wird beim
>    Bestätigen übernommen** (`approve-claim`, falls Spieler noch keine hat). Anzeige **neben der Position**
>    überall: Kader (Avatar-Kreis), Spielerprofil (Hero „· #23" + Steckbrief-Zeile), öffentliche Vereinsseite.
>    ⚠️ `fetchsingleplayerinfo` musste `number` explizit in die `PUBLIC_FIELDS`-Whitelist (sonst fehlte sie im
>    fremden Profil); `getmyinfo`/`fetchsingleteaminfo`/`roster-players` ergänzt. Schema → Dev-Neustart nötig.
> ⚠️ Dev-DB enthält jetzt Test-Artefakte (Noah Becker #23, Slot „Ahmed Osman" bei Test Baskets) → `seed-demo.mjs`
> setzt zurück. **Prod unberührt** (nur Code deployt). SMTP lokal nicht testbar → Mail-Logik über Build + In-App
> verifiziert; Live-Smoke (Homepage/Team-Admin/Teams) 200.

#### 📬 Mail-Empfänger-Matrix + Bündelung an info@ (28.06.2026, `123edc1`, live)
> Auf Wunsch: **jede administrative / Super-Admin-Mail geht zusätzlich an `info@hoopsgermany.de`** (zentrale
> Übersicht, geht im privaten Postfach nicht unter). Helper `lib/adminRecipients.js` (`getAdminNotifyTo()` =
> Super-Admin-Mails + `CENTRAL_INBOX`; `CENTRAL_INBOX` via `ADMIN_INBOX` überschreibbar). Verifiziert gegen
> Dev-DB → `p.schemura@gmail.com, jonatanbaenavides@gmail.com, info@hoopsgermany.de`. **Vollständige Matrix
> aller Mail-Versandstellen:**
> | Mail | Trigger | Empfänger |
> |---|---|---|
> | `feedbackEmail` | Feedback abgeschickt | **Super-Admins + info@** |
> | `teamPendingEmail` | neues Team angelegt (`team/create`) | **Super-Admins + info@** |
> | Liga-Meldung (`leagues/report`) | „Liga melden" | **Super-Admins + info@** |
> | `resultMismatchEmail` (SuperAdmin-Variante) | strittiges Ergebnis | **Super-Admins + info@** + beide Team-Admins |
> | `contactEmail` (`kontakt`) | Kontaktformular | **Super-Admins + info@** (`replyTo`=Absender) |
> | `resultMismatchEmail` (Team-Variante) | strittiges Ergebnis | **Team-Admins** beider Teams |
> | `joinRequestEmail` (`requestjoin`) | allgemeine Beitrittsanfrage (ohne Link) | **Team-Admin(s)** – je `notifyAllAdmins` nur Haupt-Admin oder alle |
> | `memberJoinedEmail` (`request-claim`) | eingeladener Spieler ist über den Link beigetreten | **Team-Admin(s)** – je `notifyAllAdmins` |
> | `pendingResultEmail` (`notify-pending-results`, Cron) | Ergebnis offen | **Team-Admin** (Opt-out `emailPendingResult`) |
> | `teamApprovedEmail` (`approve-team`) | Team freigegeben | **User** (Gründer) |
> | `welcomeEmail` (`playerregister` + Google-Callback) | Registrierung | **User** |
> | `inviteEmail` (`roster/send-invite-email`) | Slot-Einladung | **User** (eingeladene Adresse) |
> | `passwordResetEmail` (`forgotpassword`) | Passwort vergessen | **User** |
> Nicht in info@: rein nutzergerichtete Mails (Willkommen/Freigabe/Einladung/Reset) – bewusst, das ist kein
> Admin-Posteingang. **Team-Admin-Mails** (Pending-Result, Mismatch-Team-Variante) gehen an die Team-Admins.
>
> **Einladungs-→Registrierungs-Flow – AUTO-BEITRITT (`91d429e`, end-to-end verifiziert):** Admin legt im Kader
> einen Slot an (Name/Position/Nr., **kein** PW/Mail nötig) → lädt per **Claim-Link / WhatsApp / E-Mail** ein
> (`roster/send-invite-email`, `inviteEmail` → Link `/team/claim/[token]`). Eingeladener (ausgeloggt) öffnet den
> Link → sieht Slot (Name·Position·#Nr.) → **legt E-Mail + Passwort direkt an** (`registerAndClaim` →
> `playerregister`) → `request-claim`. **Der Link = Autorisierung → der Spieler wird SOFORT in den Kader
> übernommen** (Slot `confirmed`, `teamId` gesetzt, `join_approved`-Notif an den Spieler, folgt eigenem Team,
> **Slot-Nr. übernommen**) – **kein manuelles Genehmigen mehr**. Die **Team-Admins erhalten eine Bestätigung**
> „X hat sich registriert und ist jetzt in deinem Kader" (neue Notif `member_joined` + `memberJoinedEmail`).
> `playerregister` sendet die **Willkommensmail** und setzt **kein** `welcomeSeen`/`onboardingDismissed` → der
> neue User bekommt beim Wechsel auf den Newsfeed die **Willkommens-Tour** (Token-gebundener Wächter greift auch
> nach Claim-Register) **und die Onboarding-Checklist** – voller Neu-User-Start. Claim-Seite zeigt „Willkommen
> im Kader!". ⚠️ **Allgemeine** Beitrittsanfrage (`requestjoin`, ohne Link) bleibt **bestätigungspflichtig**
> (`join_request` → Admin genehmigt via Anfragen-Tab/`handlejoinrequest`).
> ✅ Live im Preview: Slot „Auto Join #33" → Claim-Register → „Willkommen im Kader!", `teamId`+#33+`confirmed`,
> Admin-Notif `member_joined`; Tour + Checklist erscheinen.
>
> **Co-Admin-Benachrichtigung selbst einstellbar (`91d429e`):** `Team.notifyAllAdmins` (Default false = nur
> Haupt-Admin). Helper `lib/teamAdmins.getTeamAdminRecipients(team)` (Haupt-Admin + optional alle Co-Admins =
> `isTeamAdmin`+`teamAdminOf`==team). Toggle im **Einstellungen-Tab** (`/api/team/set-notify-admins`). Greift
> bei `request-claim` (member_joined) und `requestjoin` (join_request). ✅ Verifiziert: mit Toggle an erhalten
> Haupt-Admin **und** Co-Admin die `join_request`-Notif.
>
> **Benachrichtigungs-Einstellung gilt jetzt überall + Teilrechte für Co-Admins (`a6c7639`, live):**
> - **notifyAllAdmins erweitert:** `pendingResultEmail` (`notify-pending-results`, Cron) und die Team-Variante
>   des `resultMismatchEmail` (`submit-match-result`) nutzen jetzt ebenfalls `getTeamAdminRecipients` →
>   je Team-Einstellung nur Haupt-Admin oder alle Admins; der Pending-Opt-out (`emailPendingResult`) wird
>   **je Empfänger** respektiert. Damit greift die „alle Admins"-Einstellung bei ALLEN Team-Admin-Mails.
> - **Teilrechte (Capabilities):** `lib/teamPermissions.js` mit 4 Bereichen **`kader` / `spiele` / `tryouts` /
>   `einstellungen`** (`TEAM_PERMISSIONS`, `coAdminPerms`, `hasTeamPermission`, `TAB_PERMISSION`).
>   `Team.adminPermissions: [{ player, perms[] }]`. **Haupt-Admin (`adminPlayerId`) hat immer alle Rechte;
>   KEIN Eintrag = Vollzugriff** (Bestands-Co-Admins behalten ihr Verhalten → keine Migration).
> - **Server-Durchsetzung:** `serverAuth.getTeamWithRole` (Team + handelnder Spieler + `isMainAdmin`) +
>   `getTeamForCapability(token, cap)`. ALLE Schreib-Endpunkte gestaffelt: Kader (add/remove-slot,
>   approve-claim, send-invite-email, set-member-number, remove-member, handlejoinrequest, generate-invite),
>   Spiele (matches/create+delete, submit-match-result, match-stats/save), Tryouts (tryouts/create),
>   Einstellungen (update-team, set-league, set-recruiting, set-notify-admins, upload/team-image). **Lese-**
>   **Endpunkte bleiben offen** (fetchinfo, fetchjoinrequests, roster-players, matches/list).
> - **Admin-Rollen verwalten nur noch Haupt-Admin:** `set-member-admin` prüft `isMainAdmin` (vorher durfte jeder
>   Team-Admin befördern); neuer Endpoint **`set-member-permissions`** (Haupt-Admin) setzt die Teilrechte;
>   Degradieren räumt den `adminPermissions`-Eintrag auf.
> - **UI:** Team-Panel (`/team/admin`) blendet via `useCurrentPlayer` + `hasTeamPermission` die Tabs aus, die der
>   Co-Admin nicht hat (fällt auf den ersten erlaubten Tab zurück); **KaderTab Rechte-Editor** (4 Checkboxen je
>   Co-Admin, „alle = Vollzugriff / keine = nur ansehen") – nur für den Haupt-Admin sichtbar; `roster-players`
>   liefert `perms` je Co-Admin. ✅ Verifiziert im Preview: Co-Admin „nur kader" sieht nur Kader/Anfragen,
>   `set-member-number` 200 aber `set-notify-admins`/`submit-match-result`/`set-recruiting` 401, Rollen-Verwalten
>   403; Haupt-Admin sieht alle 6 Tabs + Rechte-Editor. ⚠️ Schemafelder additiv (Dev-Neustart nötig).

#### 🧭 Karriere-Verlauf zeigt Team-Zugehörigkeit ohne Spiele (28.06.2026, `78e9948`, live)
> Tester-Fund: ein gegründetes/beigetretenes Team tauchte im **Karriere-Verlauf** des Spielers nicht auf, solange
> noch **kein Spiel** gespielt war (Karriere-Verlauf + Spielerhistorie kamen NUR aus `Match.playerStats`).
> Fix: `/api/player/stations` ergänzt jetzt **Team-Zugehörigkeiten aus `TransferEvent` (toTeam: join/found/move)
> + dem aktuellen `Player.teamId`** als **0-Spiele-Station** (`affiliationOnly:true`, `leagueName:""`,
> `lastDate`=Event-Datum), sofern das Team nicht ohnehin über Spiele auftaucht. Dadurch erscheint das
> gegründete/aktuelle Team sofort im **Karriere-Verlauf** (`teamHistory` aus `stations`) und in der
> **Spielerhistorie** (Liga-Zeile fällt auf „Noch kein Spiel" zurück). **Career-Stats (PPG/APG/RPG, Spiele-**
> **Zähler) bleiben unberührt** (eigener `careerstats`-Endpoint; 0-Spiele ändert keine Schnitte). ✅ Verifiziert
> in Dev (frischer Gründer → 0-Spiele-Station + „Noch kein Vereinswechsel.") **und auf Prod** (Jonatans Profil →
> „Mönchengladbach Scorpions e.V." erscheint, games 0).
> **Redesign + Saison (`da5e22b`, live):** Karriere-Verlauf ist jetzt eine **vertikale, voll-breite Timeline**
> (Desktop+mobil) statt horizontaler Avatar-Reihe: je Verein eine Zeile **Logo · ausgeschriebener Name · Saison
> (rechts)**, **neuester Verein oben** (jeder Wechsel = neue Zeile darüber) mit **„Aktuell"-Badge**, Vereine
> verlinkt; Saison je Stint als Einzelsaison oder Bereich (`seasons[]`). **Saison-Quelle gefixt:**
> `/api/player/stations` leitet bei 0-Spiele-Zugehörigkeiten die **Saison + Liga aus der aktuellen Team-Liga**
> ab (`populate leagueId`) → Saison erscheint nun auch ohne Spiele in **Karriere-Verlauf UND Spielerhistorie**
> (Stats-Tab). ✅ Prod: Pat Test → „Düsseldorf Dribblers · 2025/26", Spielerhistorie „Oberliga 1 · 2025/26".

#### ✉️ Bestehende Accounts direkt in den Kader einladen (28.06.2026, `93c5ae5`, live)
> Bisher konnte ein Team-Admin nur Slot-Links verschicken; einen **registrierten Account gezielt** einladen
> (mit Glocke + Annehmen/Ablehnen) ging nicht. Neuer Flow:
> - `Team.invitedPlayers[]` (offene Direkt-Einladungen) + Notif-Typ **`team_invite`**.
> - **`/api/player/search`** (POST `q`): leichte Namens-Suche (bis 10 Treffer, Name/Position/aktuelles Team).
> - **`/api/team/invite-player`** (Capability **`kader`**): lädt einen bestehenden Account ein → `team_invite`-
>   Glocke + **`teamInvitePlayerEmail`** (optimierte Mail, CTA → Glocke/Newsfeed). Blockt „schon im Kader" /
>   „bereits eingeladen".
> - **`/api/team/respond-invite`** (Spieler-Auth, `{teamId, accept}`): validiert gegen `invitedPlayers`;
>   **annehmen** → `teamId` gesetzt, `recordTransfer` (join/move → **Karriere-Verlauf**), `followOwnTeam`,
>   `join_approved` an den Spieler + **`member_joined`** an die Admins (je `notifyAllAdmins`); **ablehnen** →
>   Einladung entfernt. Einladung wird in jedem Fall aus `invitedPlayers` gelöscht + Notif als gelesen markiert.
> - **NotificationBell:** `team_invite` rendert **inline „Annehmen/Ablehnen"** (+ Status „✓ Angenommen/
>   Abgelehnt"); kein Link. ⚠️ `getnotifications` liefert jetzt zusätzlich **`teamId`** (Bell braucht es für die
>   Antwort). **KaderTab:** Sektion „Bestehenden Spieler einladen" (debounced Suche → „Einladen", schließt
>   eigene Mitglieder aus).
> - ✅ End-to-end im Preview: Admin sucht „Sven"/„Jay" → Einladung → Glocke „Test Baskets möchte dich in den
>   Kader aufnehmen" mit Annehmen/Ablehnen → Annahme → Spieler im Kader (teamName gesetzt) + Team in
>   `stations`/Karriere-Verlauf; Admin erhält `member_joined`; Mail rendert. Live-Smoke (403 ohne Token, Suche).
>   ⚠️ Schemafelder additiv (Dev-Neustart nötig); SMTP lokal nicht testbar (Mail-Logik über Build/Render verifiziert).
>
> **KaderTab als 3 klare Karten (`1cd93cd`, live):** Die Wege „jemanden ins Team holen" sind jetzt drei gleich
> gestylte Karten (statt Toggle-Button + verstecktem Formular): **1) Bestehenden Spieler einladen** (schon
> registriert → Suche → Glocke/Mail-Anfrage), **2) Neuen Spieler anlegen** (kein Account → Formular Name/Pos/Nr.
> immer sichtbar → **persönlicher** Claim-Link unten unter „Eingeladene & offene Plätze"), **3) Team-Einladungslink
> (für alle)** (ein Link für die Gruppe → Selbst-Beitritt, Auto-Join). Beschreibungen schärfen den Unterschied
> „persönlicher Link" vs. „allgemeiner Gruppen-Link". Toggle-Button + `showAdd` entfernt. Verifiziert im Preview.

#### 🔗 Allgemeiner Team-Einladungslink fertig (war Platzhalter!) (`73805b1`, live)
> Tester-Fund: `/team/join/[token]` war nur ein **Stub** („wird in der Umsetzungsphase implementiert") und es
> fehlte die Beitritts-Logik → der **allgemeine** Team-Einladungslink (Karte „Team-Einladungslink für alle")
> war **funktionslos**. (`inviteToken` wurde nur erzeugt/gespeichert, nie eingelöst; kein `join-team`-Endpoint.)
> Jetzt komplett implementiert, analog zum Claim-Flow:
> - **`/api/team/invite-info`** (POST `inviteToken`): öffentliche Team-Info (Name/Slug/Logo/Region) für die Landeseite.
> - **`/api/team/join-via-link`** (Spieler-Auth, `{inviteToken}`): **direkter Beitritt** über den Link –
>   `teamId` gesetzt, `recordTransfer` (join/move → **Karriere-Verlauf**), `followOwnTeam`, `join_approved` an den
>   Spieler + **`member_joined`** an die Admins (je `notifyAllAdmins`); Schutz „bereits im Kader".
> - **`app/team/join/[token]/page.js`**: echte Seite (statt Stub) – Team-Header + Hinweis „landest direkt im
>   Kader"; ausgeloggt → Registrier-Formular („Konto erstellen & beitreten"), eingeloggt → „Dem Team beitreten";
>   danach „Willkommen im Kader!". ✅ Verifiziert (Preview: Register+Join + eingeloggter Join + Doppel-Join-Schutz;
>   Prod-Smoke: Tester-Token löst „Düsseldorf Dribblers", keine „Platzhalter"-Meldung mehr).
> - **Wechsel-Warnung (`f4f5bfe`, live):** Eingeloggt kennt die Seite via `getmyinfo` das aktuelle Team und zeigt
>   3 Fälle: **kein Team** → „Dem Team beitreten"; **schon in DIESEM Team** → „Du bist bereits im Kader von X" +
>   Link zur Teamseite (kein Re-Join); **anderes Team** → **Sicherheitsabfrage** „Du bist aktuell bei A. Wenn du
>   beitrittst, verlässt du dieses Team und wechselst zu B." + „Zu B wechseln"/„Abbrechen" → kein versehentlicher
>   Vereinswechsel. ✅ Alle 3 Fälle im Preview verifiziert.

### Bekannte Einschränkungen / offen
- **Lokale Dev-Umgebung:** SMTP/Google-Keys fehlen in der lokalen `.env` → Mails/Google-Login nur auf dem VPS
  (hoops_prod) live testbar; lokal über In-App-Notifs + Trigger-Logs verifizieren.
- Schema-Änderungen erfordern Dev-Neustart (mongoose-Model-Cache). Nach Dev-Server-Lock ggf. `.next` löschen vor `npm run build`.
- **Vor Deploy immer Production-Runtime testen** (`npm start`/VPS-Build), nicht nur `next dev` (s. populate-Bug).

---

#### 🧰 Skill-Wartung: 4 SKILL.md-Fixes nach Team-Review (09.08.2026, Backoffice-Freigabe `dec-malik-hoops-skills`)
> Team-Review durch die Meta-Agenten (Hanna/Ole/Malik/Ines, General Backoffice) fand veraltete
> Angaben in den vier Hoops-Skills; von Patrick freigegeben und umgesetzt (nur `.claude/skills/`, kein App-Code):
> - **`league-catalog`**: Kreis-Listen-Vermerk von „provisorisch" auf **WBV-verifiziert** (02.07.2026,
>   `7e69f12`) korrigiert; neuer Abschnitt **„Erstläufe mit Prod-Risiko"** (Rollover-Erstlauf mit `--dry`
>   + WBV-Sanity-Check; WBV-PDF-Import-Regeln inkl. Umlaut-Prüfung, Demo-`--purge` erst danach).
> - **`log-progress`**: auf die **Zwei-Ebenen-Struktur** seit `b3d4bf6` umgestellt (Abschnitt 0 kompakt,
>   Protokolle in `docs/CHRONIK.md` unten anhängen); veraltete Zeilenangabe „~6–90" und Roadmap-Name
>   „Pre-Live-Roadmap" entfernt.
> - **`update-feedback-analytics`**: Pfad-Fix `app/api/analytics/summary/route.js` → **`lib/analyticsSummary.js`**
>   (Route ist nur noch Wrapper); neue Pflicht-Regeln **Demo-Daten-Ausschluss** (`official:true` /
>   `isDemo:{$ne:true}`, Muster `7e69f12`) und **Sponsor-Report mitprüfen** (`SponsorReportView`).
> - **`update-onboarding-surfaces`**: neue Fläche **6. PWA-Einstieg `/installieren`** (Impressum/Datenschutz
>   nun Abschnitt 7); Kopf-Verweis auf den Bedarfs-Kreislauf (Mats' `docs/BEDARFSANALYSE-2026-08-09.md`,
>   Ronjas H1–H7-Validierung) + Checklisten-Punkte ergänzt.
> Offen aus derselben Review-Runde (nicht Teil dieser Freigabe): neue Skill `deploy-hoops` (Ines),
> Einsatzplan `dec-hoops-einsatzplan` (Ole), Analytics-`$switch`-Nachtrag für `/installieren` (Code-Änderung).

---

#### 🏷️ Welle 1 des Website-Review-Plans: Demo-Badges, /spiele-Fix, A11y (09.08.2026, `b77d5ad`, lokal verifiziert – Deploy ausstehend)
> Umsetzung von 3 der 4 Welle-1-Pakete aus `dec-hoops-website-plan` (Reviews Mats/Ronja/Vivien):
> - **Demo-Kennzeichnung plattformweit:** neue Komponente `components/DemoBadge.js` („Beispieldaten",
>   Muster des Kreisliga-Badges); `Player.isDemo` additiv im Schema (analog Team/League); Badges in
>   `/topscorer` (je Zeile), `/teams` (Karte), `/transfermarkt` (Spieler- + Vereins-Karten inkl.
>   Matching-Widget), Liga-Tabelle (`/ligen/[id]`), Team-Detail-Hero. APIs liefern `isDemo` mit
>   (topscorer-Aggregation, fetchteams, transferlist, recruiting-list, leagues/[id]-populate,
>   fetchsingleteaminfo, `lib/standings.js`).
> - **`scripts/backfill-demo-flags.mjs`** (additiv, idempotent, `--dry`): setzt `isDemo:true` anhand
>   vorhandener `seedTag`s (nrw-demo/kreisliga-demo/-niers/world/showcase-posts) – nötig, weil
>   `seed-nrw-demo` vor Einführung von `Team.isDemo` lief. Dev ausgeführt (6 Teams, 30 Spieler, 1 Liga).
>   ⚠️ **Auf Prod noch NICHT ausgeführt** – ohne Backfill zeigen die neuen Badges dort nichts.
> - **`/spiele`-Anstehend-Fix:** „Anstehend" = geplant UND heute/später; vergangene geplante Spiele
>   erhalten Badge „Ergebnis ausstehend" (sichtbar in „Alle").
> - **A11y-/Zustands-Paket:** `ui/Button`+`ui/Tabs` mit `focus-visible`-Ring, `active:scale-[0.97]`,
>   `motion-reduce`; `ui/Loading` `motion-reduce:animate-none`; Kontrast-Pass `text-gray-400`→`500`
>   auf hellen Flächen (~70 Dateien; Navy-Kontexte in Navbar-Mobilmenü/AdminNav bewusst belassen).
> ✅ Verifiziert in Production-Runtime (`npm start`, Dev-DB mit NRW-Demo geseedet): Topscorer/
>   Transfermarkt/Liga-Tabelle zeigen Badges korrekt nur auf seedTag-Daten, /spiele „Anstehend (2)"
>   nur Zukunftstermine, keine Konsolenfehler. **Offen:** Deploy auf VPS + `backfill-demo-flags` auf
>   hoops_prod (nach Freigabe), Welle-1-Paket 4 „Oberliga-Duplikat" (Prod-Analyse separat).

---

#### 🚀 Wellen 2+3 + Kampagnen-Tracking (10.08.2026, Commits 74985ab + bfd3003 + 0b6dbfc)
> **Korrektur zum Welle-1-Eintrag oben:** Welle 1 (b77d5ad) wurde am 10.08. vormittags auf Prod
> deployt und backfill-demo-flags auf hoops_prod ausgefuehrt (46 Teams / 379 Spieler / 11 Ligen,
> von Patrick freigegeben) - der dortige Vermerk 'Deploy ausstehend' ist ueberholt.
> - **Welle 2 (74985ab):** Tryouts erreichbar (Navbar/Footer/Transfermarkt-Querlink); Superlativ
>   ersetzt ('Community-Plattform fuer Amateur-Basketball in NRW'); Onboarding-Tracking
>   (tour_completed/_skipped, checklist_step_done/_dismissed; lib/trackEvent.js; AnalyticsEvent.meta additiv).
> - **Welle 3+4 (bfd3003):** components/landing/LandingFeatures.js (asymmetrisches Zickzack mit 6
>   CSS-Produkt-Miniaturen statt Icon-Grid); orange-* zu brand-* in 16 Dateien; gray-900-Flaechen
>   auf Navy-Gradient; PageHeader font-black; 26 MB ungenutzte JPEGs entfernt.
> - **Kampagnen-Tracking (0b6dbfc):** /signup?src= wird sanitisiert als Player.signupSource
>   gespeichert + signup_src-Event; Admin-Analytics 'Registrierungen nach Quelle' (demo-bereinigt,
>   inkl. CSV). Messbasis fuer die Flyer-QR-Codes der Tester-Kampagne (H5).
> - E2E-Suite tests/e2e/ (Kai, 8 Auth-Tests, Dev-DB-Guard) nach jeder Welle 8/8 gruen, Builds gruen.

---

#### 🔧 Feedback-FAB: Hide-on-Scroll gegen Content-Überlappung (10.08.2026, unkommittiert)
> Design-Gate-Befund: Der globale Feedback-FAB (components/FeedbackButton.js, fixed bottom-right)
> verdeckte auf 375px den Titel "Teams & Kaderverwaltung" und auf 768px die MatchMock-Karte der
> Landing-Feature-Sektion. Fix nach Material-Pattern: FAB blendet sich beim Runterscrollen aus
> (translate-y + opacity + pointer-events-none, ab y>80 mit 4px-Toleranz) und erscheint beim
> Hochscrollen bzw. oben wieder; auf Mobile kompakter Kreis (p-3.5, 44x44), sm+ weiterhin Pill mit
> Text; Safe-Area-Inset via style bottom:max(1.25rem, env(safe-area-inset-bottom)); aria-hidden +
> tabIndex=-1 im versteckten Zustand.
> ✅ Verifiziert per JS-Checks (Browser-Pane ohne Anzeige, daher keine Screenshots) bei 375/768/1280:
>   sichtbar+klickbar am Seitenanfang (elementFromPoint=FAB), versteckt nach Runterscrollen zur
>   Feature-Sektion, wieder sichtbar nach Hochscrollen.
> ⚠️ Nebenbefund: Lokale API-Routen liefern 500 wegen MongoServerError "bad auth" - die Atlas-
>   Zugangsdaten in der lokalen .env sind aktuell ungültig (unabhängig vom FAB-Fix, bitte prüfen).

---

#### ✨ WOW-Runde: Motion-System, Skeleton-Loading, Deploy-Gate (10.08.2026, 804d484 + 1f3eafa + 0374d90 + fea96f4, live)
> Erste Runde mit den neu installierten Werkzeugen (impeccable, ui-ux-pro-max, interface-design,
> react-best-practices) und der neuen Organisation (Vivien fuehrt Design, Kai haelt das Deploy-Gate).
> - **Motion-System (Vivien, 804d484/1f3eafa):** neue Bausteine lib/useInView.js (IntersectionObserver,
>   reduced-motion-sicher), components/ui/Reveal.js (Scroll-/Load-Reveal mit delay), components/ui/CountUp.js
>   (Zahlen zaehlen beim Einscrollen hoch), components/layout/PageTransition.js (CSS-Enter je pathname);
>   tailwind.config.js um ease-out-strong + animate-page-in erweitert. Angewendet: LandingHero (gestaffelter
>   Ladeeinstieg 0/90/180/270ms), LandingFeatures/HowItWorks/CTA (Scroll-Reveals + zaehlende Mock-Statistiken),
>   PlayerProfileView (Karrierewerte), NotificationBell/Navbar (Badge-Pop nur bei Aenderung), Card + Teams-/
>   Ligen-/Spiele-Karten (einheitlicher Hover-Lift). Selbstaudit via web-design-guidelines fand 'transition: all'
>   im eigenen Code -> auf explizite Property-Listen korrigiert.
> - **Performance/Skeletons (Phase 2, 0374d90):** blockierender Spinner auf 9 oeffentlichen Seiten durch
>   layoutnahe Skeletons ersetzt (spieler/teams/ligen/ligen-[id]/spiele/topscorer/transfermarkt/team-detail +
>   NewsWidget). Zwei echte Layout-Spruenge behoben: Liga-Detail und Team-Detail warfen im Ladezustand die
>   komplette Navbar weg. Fetch-Wasserfall-Pruefung: kein weiterer Fall (transfermarkt hatte Promise.all bereits);
>   Ueber-Optimierungen (React.memo etc.) bewusst verworfen.
> - **Deploy-Gate (Kai, erster Ernstfall seiner Rolle aus dec-scouting-2026-08-10):** security-review + review
>   auf den Diff df520d3..HEAD (23 Dateien), Suite 8/8, Build gruen -> GO. Ein Nicht-Blocker-Befund:
>   CountUp fror bei spaeteren Wertaenderungen ein (reproduzierbar beim Saison-Filter im Spielerprofil);
>   vor dem Deploy gefixt (fea96f4: Effekt haengt jetzt an [inView, target]).
> ✅ Live verifiziert nach Deploy: /, /ligen, /spiele, /teams, /topscorer, /transfermarkt, /tryouts je 200.
>   Rollback-Stand vor dieser Runde: df520d3.

---

#### 🎨 Unterseiten-Design-Review + Wellen 1/2a (10.–11.08.2026, `fe6ca42` + `0ce7846` + `530d3b6`)
> **Review:** Drei parallele Bündel von Vivien (öffentliche Listen-/Detailseiten · eingeloggte
> Bereiche · Info-/Rechts-/Auth-Seiten), Code + Live-Prüfung, Werkzeuge `impeccable` /
> `interface-design` / `ui-ux-pro-max` / `web-design-guidelines`. 29 Befunde; die offenen stehen mit
> Datei- und Zeilenangaben in **`docs/DESIGN-REVIEW-2026-08-10.md`** (Arbeitsauftrag Welle 2b/3/4
> inkl. Hero-Animation). Zwei Produktentscheidungen traf **Ronja** nach Live-Test als
> Demo-Team-Admin (von Patrick ausdrücklich delegiert).
> - **Welle 1 (`fe6ca42` + `0ce7846`, live):** `app/not-found.js` (eigene deutsche 404-Seite statt
>   englischer Next-Standardseite), `components/ui/FormAlert.js` mit `role=alert`/`aria-live` ersetzt
>   vier duplizierte Fehlerboxen (login/signup/reset-password/kontakt), Skeleton-Ladezustände auf
>   rangliste/tryouts + zwei handgerollte Spinner ohne `motion-reduce` entfernt, `tryouts/[id]` mit
>   `PageHeader` und Button-Primitiven (fiel als einzige Seite aus dem Muster), Button-Primitive in
>   kontakt/feedback/player-detail, Select-Tokens auf `inputClassSm`, Karten-Hover auf das
>   `Card.js`-Muster, Emoji durch Icons ersetzt, `AuthShell` mobil gestrafft (Kampagnen-Landepunkt
>   `/signup`), `Skeleton.js` mit `motion-reduce` (Kais Gate-Befund).
> - **Welle 2a (`530d3b6`):** Einladungslink entdoppelt — Ronja hatte live reproduziert, dass ein im
>   Kader-Tab erzeugter Link im Einstellungen-Tab derselben Sitzung als „nicht vorhanden" erschien
>   und ein Klick dort kommentarlos einen zweiten Token erzeugte (bereits verschickte Links wurden
>   still ungültig). Kader-Tab ist jetzt alleinige Quelle, Einstellungen verweist nur noch dorthin;
>   Neu-Erzeugen verlangt eine Bestätigung. Neue `components/ui/ConfirmAction.js` (Popover im
>   Markendesign) ersetzt `window.confirm` bei Spieler entfernen / Spiel löschen / Tryout löschen.
>   Benachrichtigungs-Schalter bekam die fehlende Speicher-Rückmeldung (laut Ronja das einzige
>   inkonsistente Element, das den Eindruck „ich weiß nie, was gespeichert ist" erzeugte);
>   Einstellungen-Tab zusätzlich Sprungmarken.
> ⚠️ **Test-Falle dokumentiert:** Ein vor der DB-Passwort-Rotation gestarteter Zombie-Dev-Server auf
> Port 3000 lieferte reproduzierbar 500er — und damit acht falsche Testfehler. Vor Testläufen
> Port 3000 prüfen.

---

#### 🎨 Welle 2b: Team-Admin-Panel auf das Designsystem + Hero-Animation (11.08.2026, `a0dbe20`)
> Arbeitsauftrag aus `docs/DESIGN-REVIEW-2026-08-10.md` (Punkte 1–8 + Hero-Auftrag) vollständig
> abgearbeitet. Betroffen: `components/team/tabs/` (Kader, Anfragen, Spielplan, Ergebnisse,
> Tryouts, Einstellungen), `lib/ui.js`, `app/team/create`, `app/player/edit-profile`,
> `components/landing/HeroBallArc.js`.
> - **Feld-Tokens zentralisiert:** `lib/ui.js` um `inputClassNum` (Ergebnis-Score) und
>   `inputClassStat` (Statistik-Tabelle/Rückennummer) erweitert – beide bewusst **ohne**
>   Breitenklasse, weil ein `w-full` in der Basis die lokale Breite überlagern würde (Tailwind
>   sortiert nach eigener Reihenfolge, nicht nach String-Reihenfolge). Die lokalen
>   `inputClass`/`numInput`/`statInput`-Kopien aller sechs Tabs sind ersetzt.
> - **`components/team/tabs/TabAlert.js` (neu):** dünner Wrapper um `FormAlert`, mappt das
>   `{type:"ok"|"err", text}`-Format der Tabs. Ersetzt den sechsfach kopierten Meldungsblock →
>   Erfolg/Fehler haben jetzt überall `role="alert"` + `aria-live="polite"`.
> - **Primitive statt Handarbeit:** vier eigene `FaBasketballBall animate-bounce`-Spinner (ohne
>   `motion-reduce`) → `components/ui/Loading`; fünf gestrichelte Leerzustands-Boxen →
>   `components/ui/EmptyState` (mit Icon, Text und – wo sinnvoll – direkter Aktion); primäre
>   Buttons → `components/ui/Button`.
> - **Barrierefreiheit:** `aria-label` an allen Icon-only-Buttons (Rückennummer, Teilrechte,
>   Adminrechte, Entfernen, Slot-/Spiel-/Tryout-Löschen), `aria-expanded` an Aufklapp-Schaltern,
>   `aria-label` an den sechs Liga-Filtern und an jedem Statistik-Feld (`Punkte <Name>` usw.),
>   `htmlFor`/`id` an den Score-Feldern. DNP-Checkbox in `ErgebnisseTab` sitzt jetzt in einem
>   `min-h-11 min-w-11`-Label → live gemessen 44×44 px (WCAG 2.5.5), ohne Mobil-Overflow.
> - **Pflichtfelder:** konsistente `*`-Kennzeichnung + Legende in `EinstellungenTab` (dortiges
>   `Field` hat jetzt `required`/`optional`), `app/team/create/page.js`,
>   `app/player/edit-profile/page.js`.
> - **Kader-Tab entlastet:** „Bestehenden Spieler einladen" ist der sichtbar geführte Standardweg
>   (Brand-Rahmen + Badge „Schnellster Weg"), „Neuen Spieler anlegen" und „Team-Einladungslink"
>   liegen im Akkordeon „Weitere Optionen". Der Einladungslink bleibt dort die **alleinige** Quelle
>   (Welle-2a-Regel eingehalten). Die letzten beiden `window.confirm` (Slot entfernen, Adminrechte
>   vergeben/entziehen) laufen jetzt über `ConfirmAction` – im Panel ist damit kein `window.confirm`
>   mehr vorhanden.
> - **Hero-Animation (`components/landing/HeroBallArc.js`):** neuer Ball (Radial-Verlauf, saubere
>   Nähte, Schlagschatten – liest sich über dem dunklen Foto) und neuer Korb (Brett + Zielfeld,
>   oranger Ring, Netz als Rautenmuster statt gerader Striche); der Ball bleibt am Ende nicht mehr
>   auf dem Ring stehen, sondern fällt ab `t≈0.88` durch das Netz und blendet aus, während der Ring
>   kurz nachgibt („Swish"). **Mobile-Entscheidung geprüft und bewusst beibehalten:** unter 1280px
>   kein Bogen – die Gutter neben dem `max-w-4xl`-Block trägt ihn nicht, auf Telefonen würde jede
>   Bahn Headline/Buttons kreuzen; Begründung steht als Kommentar in der Komponente. Die größere
>   mobile Wirkung soll aus echtem Hallenmaterial kommen (KI-Video bleibt verworfen).
> **Verifikation:** `npm run build` grün (nur die bekannte libheif-Warnung), Playwright 8/8,
> Team-Admin-Panel live durchgeklickt (alle sechs Tabs, Desktop 1400px + 375px) – alle API-Aufrufe
> 200, keine neuen Konsolenfehler; Hero-Bogen im Browser vermessen (kreuzt den Content-Block in
> keiner Scroll-Position). Offen aus dem Review bleiben Welle 3 und 4.

---

#### 📝 Nachtrag (Frieda, 11.08.2026): Zeile 373 dieses Archivs veraltet

> Diese Chronik-Datei bewahrt `CLAUDE.md` Abschnitt 0 **wörtlich** zum
> Stand 08.08.2026 (s. Kopfnotiz oben) – bestehende Einträge werden
> bewusst nicht umgeschrieben. Daher hier ein Nachtrag statt einer
> stillen Korrektur: Die Design-Sprache-Zeile weiter oben (Zeile 373:
> "`login image.jpg`/`signupImage.jpg`/`registerimage.jpg` = Hero-Motive")
> war zum Zeitpunkt der Auslagerung bereits nicht mehr korrekt.
> `registerimage.jpg` war nur kurz im Code (Commit `0fd42d2`, 23.06.2026,
> entfernt 38 Minuten später mit `a6ab9a5` im selben Umbau auf
> spieler-geführte Teams) – zum 08.08.2026 längst kein aktives Hero-Motiv
> mehr. `playerimage.jpg` war zu keinem Zeitpunkt der Git-Historie im
> Code referenziert. Beide Dateien liegen seit 11.08.2026 archiviert in
> `docs/asset-archive/` (Befund: `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`).
> Die entsprechende Zeile in `CLAUDE.md` und `AGENTS.md` (dort jeweils
> aktuell gepflegt, kein Archiv) wurde direkt korrigiert. Diese
> Chronik-Zeile bleibt wörtlich stehen, wie es die Kopfnotiz vorsieht.

---

#### 🏀 Hero „Sprungball" Stufe 1, NRW-Claim, Auth-Bildoptimierung — **deployt** (11.08.2026, `0c978e0` + `9f5b04f` + `c2fcf1a`)
> Auslöser: Patricks Auftrag, den Hero der Startseite Richtung „innovatives, Apple-artiges,
> scroll-gesteuertes Design" zu heben — mit ausdrücklicher Korrektur der Arbeitsreihenfolge durch
> ihn selbst („die App wird eher mobil eingesetzt und getestet, deshalb muss es mobil optimiert
> sein"). Fünf Zuarbeiten, alle als Dokument im Repo:
> `docs/HERO-KONZEPT-2026-08-11.md` (Vivien, v2 mobil-first, v1-Rahmen als Anhang A erhalten),
> `docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md` (Nele), `docs/HERO-ASSETS-2026-08-11.md` (Milo),
> `docs/RECHT-HERO-CLAIM-2026-08-11.md` (Nora), `docs/EINSATZPLAN-HERO-2026-08-11.md` (Ole).
>
> - **Hero-Bühne (`c2fcf1a`):** neue `components/landing/HeroScrollStage.js` (ein zentraler
>   rAF-Controller, ein `scroll`-Listener, direkte Style-Mutation) + `HeroGlyphs.js` (Ball,
>   Korb-Emblem, Spielfeld-Bogen als reine Vektoren). Beim normalen Scrollen vertieft sich die
>   Fläche (Navy-Tint 0→0.5, Overlay 0.65→0.72, Bogen 0→0.14) und ein Ball fällt vertikal in ein
>   Korb-Emblem an der oberen Ecke der **primären Schaltfläche** – Zielpunkt wird zur Laufzeit am
>   CTA-Rechteck gemessen, stimmt deshalb bei 3 (ausgeloggt) wie bei 5 (eingeloggt) Schaltflächen.
>   **Kein Pinning, keine zusätzliche Scrollstrecke** (Hero-Höhe bleibt `calc(100vh - 4rem)`),
>   **kein Foto-Zoom** (Vivien gestrichen: das Motiv ist 1000×652 px und wird formatfüllend ohnehin
>   bis ~5× hochskaliert). `HeroBallArc.js` ist entfallen – der alte Gutter-Bogen geht in der neuen
>   Ankunft auf, statt als zweite Ball-Animation danebenzulaufen. `prefers-reduced-motion`: Ball und
>   Emblem werden gar nicht gerendert.
>   ⚠️ Beim Bauen zweimal nachjustiert (beide Male erst durch Messung sichtbar): Der Ball kam
>   ursprünglich erst an, **nachdem** die Schaltfläche oben aus dem Bild gescrollt war (Fix:
>   eigener, schnellerer Ball-Fortschritt `BALL_SPAN`), und Tint/Bogen erreichten ihren Endwert erst,
>   als der Hero fast draußen war (Fix: `PROGRESS_SPAN` 0.7 → 0.45).
> - **Geo-Claim (`9f5b04f`):** „Deutschland" → „NRW" an 7 Stellen (Hero-Badge + Headline,
>   `app/layout.js` Meta-/OG-Description, `/about`, `WelcomeTour.js`, Willkommensmail in
>   `lib/emailTemplates.js`, `SponsorReportView.js`) auf Patricks Freigabe nach Noras Vorprüfung;
>   Ausgangsbefund von Nele. Achter Fund beim Bauen: „die **deutsche** Basketball-Community" in
>   `LandingFeatures.js` – von Noras Volltextsuche nach „Deutschland" nicht erfasst, mit korrigiert.
>   Bewusst unverändert: Adressangaben in Impressum/Datenschutz, RSS-Suchbegriff,
>   Nationalitäts-Platzhalter, „deutscher Breitensport" in `/about` (Nora: keine quantifizierbare
>   Abdeckungsbehauptung).
> - **Auth-Bilder (`0c978e0`):** `AuthShell.js` liefert das Split-Screen-Motiv als
>   `<picture>` (AVIF → WebP → JPEG). Alle `<source>` tragen `media="(min-width:1024px)"`, der
>   `<img>`-Fallback ist ein 1×1-Data-URI → **unter 1024 px wird gar kein Motiv geladen**
>   (`/signup`, der QR-Landepunkt: 277 KB → 0 KB; Desktop 277 → 135 KB, `/login` 74 → 25 KB).
>   Bewusst **ohne** `loading="lazy"`, damit der Bildaufbau am Desktop nicht verzögert wird.
>   Varianten von Milo erzeugt, native Auflösung, Originale unverändert.
>
> **Deploy-Gate (erstmals in der neuen Besetzung):** Kai (`test-automatisierung`) – Security-Review
> ohne Befund, Code-Review aller sechs Risikopunkte sauber (Listener-/rAF-Cleanup, zwei Layout-Reads
> vor allen Writes, kein Hydration-Mismatch, `ctaRef`-Nullfall defensiv), Suite 8/8. Tobias
> (`qa-reviewer`, seit heute global verfügbar) – unabhängiges Browser-Gate mobil zuerst: Ankunft
> sichtbar, Emblem nie über einer Beschriftung (0 Treffer im automatischen Overlap-Check), Button
> während der Animation klickbar, Rückwärts-Scroll bitidentisch, Fling/Rotation/Reload sauber,
> reduced-motion korrekt, 4×-CPU-Drosselung ohne Frame über 32 ms, `/signup` mobil ohne jede
> Bildanfrage, keine Konsolen-/Netzwerkfehler.
>
> **Verifikation vor und nach dem Deploy:** `npm run build` grün, Playwright 8/8, Production-Runtime
> (`npm start`) gegengeprüft – identische Werte wie im Dev-Modus. Nach `pm2 restart hoops-v2`:
> `https://hoopsgermany.de` → 200, „Amateur-Basketball in NRW" 3× im ausgelieferten HTML,
> Meta-Description korrekt, Ball/Emblem am Live-System vermessen (Ankunft bei Scroll 300, Schaltfläche
> dabei bei y 269 im Bild), `/signup` mobil ohne Bildanfrage / Desktop genau `signup-image-1000.avif`,
> keine Konsolenfehler.
>
> ⚠️ **Messfalle dokumentiert:** Ist die Browser-Vorschaufläche ausgeblendet, meldet das Dokument
> `hidden`, es laufen **keine** rAF-Frames und Screenshots schlagen fehl – Scroll-Messungen liefern
> dort eingefrorene Werte und täuschen einen Fehler vor. Ausweg: Playwright gegen echtes Chromium
> (`tmp/hero-preview.mjs` als Muster, aus `tmp/` heraus, nicht in `tests/`).
>
> **Offen:** Stufe 2 (Desktop-Ausbaustufe mit Pin/140vh/drei Szenen, Konzept liegt vor),
> Viviens Entscheidung zur Ballspur bei 430 px (Ball kreuzt dort kurz den Fließtext – er liegt
> hinter dem Text, reine Gestaltungsfrage, Tobias: kein Blocker), Test auf echtem Low-End-Android,
> sowie ein **vorbestehender** 8-px-Horizontalüberlauf auf Mobile aus dem `-translate-x-6`-Startversatz
> in `components/ui/Reveal.js` (Feature-Karten) – nachweislich nicht Teil dieses Diffs.

---

#### 🌙 Nachtschicht: Startseite als Scroll-Erlebnis, Wellen 3 und 4 (11./12.08.2026, `38c864b` · `ed4751c` · `49e60aa` · `600aef6`)
> Patrick hat vor dem Schlafengehen Blankofreigabe für die Nacht erteilt („komplette Website zu einer
> Traum-Website gestalten"), mit der Auflage, die Gates einzuhalten und den Rollback-Punkt zu notieren.
> Ausgangspunkt war seine Kritik am Live-Stand: Der Hero-Akzent sei noch kein „innovatives Design wie
> bei Apple" – die Darstellung solle modern, sportlich, interaktiv und beweglich sein und beim Scrollen
> **sinnhaft die „Alles, was du brauchst"-Sektion durchlaufen**, damit man die Funktionen spielerisch
> kennenlernt. Grundlage: `docs/LANDING-KONZEPT-2026-08-11.md` (Vivien, „Ein Spielzug in sechs Szenen",
> inkl. Nachtrag Abschnitt 16) und `docs/LANDING-COPY-2026-08-11.md` (Nele).
>
> - **Feature-Strecke Stufe 1 (`ef0b532`, s. eigener Eintrag oben):** `components/landing/FeatureMocks.js`.
> - **Welle 3 (`38c864b`):** `components/ui/ScrollTable.js` (neu) – waagerecht scrollbare Tabelle mit
>   Kanten-Verlauf, der nur erscheint, solange in diese Richtung Inhalt liegt; dazu `sticky`-Rang- und
>   Namensspalte (`bg-inherit`, damit Hover erhalten bleibt) auf Rangliste, Topscorer und Liga-Tabelle.
>   Gemessen bei 375px: 74px bzw. 43px Überlauf, Name bleibt beim Wischen stehen, letzte Spalte
>   erreichbar. Filterleisten von `/spieler`, `/teams`, `/transfermarkt` auf das `/spiele`-Muster
>   (Suche volle Breite, Auswahlfelder zweispaltig, Umkreis eigene Zeile). `components/ui/Tabs.js`
>   bekam `max-w-full` – der Pill-Umschalter ragte auf 375px um 1px hinaus und erzeugte damit
>   waagerechtes Scrollen der **ganzen** Seite. Dazu Neles Texte: „Eine Saison, sechs Spielzüge",
>   Eyebrow-Labels 1/6…6/6, Karte 3 nennt jetzt die doppelte Bestätigung, Karte 4 verliert das
>   ungedeckte „in Echtzeit".
> - **Welle 4 (`ed4751c`):** `LegalShell` auf `max-w-xl` (Zeilenlänge 75–80 → 47 mobil / 77 auf 1280px)
>   und ab sechs Abschnitten ein automatisches Sprungmenü: Die Hülle liest die Überschriften aus ihren
>   eigenen Kindern, vergibt die IDs selbst und klont die Überschrift mit ID – die Rechtstexte bleiben
>   unangetastet. ⚠️ Beim Prüfen selbst gestolpert: IDs, die mit einer Ziffer beginnen („1-verantwortlicher"),
>   sind als CSS-Selektor ungültig – im Browser fällt das nicht auf, bricht aber jedes Testwerkzeug;
>   daher Präfix `abschnitt-`. `app/oauth-landing` bekam den Markenrahmen (Wortmarke, `FormAlert`,
>   Rückweg zur Anmeldung) statt einer nackten Fehlerzeile.
> - **Feature-Strecke Stufe 2 (`49e60aa`):** `components/landing/FeatureProgressRail.js` – mobil ein
>   Balken unter der Navbar mit Kurzlabel („3 / 6 · Doppelt bestätigt"), ab xl ein Punkte-Streifen am
>   rechten Rand. Ein Scroll-Listener für die ganze Sektion, ein rAF-Tick, Label nur bei Abschnittswechsel
>   geschrieben. Bei reduzierter Bewegung wird der Balken zur neutralen Linie – er hätte sonst dauerhaft
>   auf 0 % gestanden und wie ein Fehler gewirkt.
> - **Feinschliff (`600aef6`):** Viviens Nachtrag – mittlere Karte in „Deine nächsten Schritte" auf Navy
>   (dreimal dieselbe orange Geste direkt unter der Feature-Strecke), Reveal-Stagger im NewsWidget
>   (einziger Karten-Grid ohne), News-Abschnitt `py-16` → `py-20`, und `CountUp` **nur für Rang 1–3** auf
>   Rangliste/Topscorer: `useInView` legt pro Zahl einen eigenen IntersectionObserver an, bei 31 Zeilen
>   wären das 60+ – jetzt 6 bzw. 9, und die Bewegung verstärkt die ohnehin farblich gesetzte Hierarchie.
>   Bewusst **nicht** gebaut: eine Verbindungslinie in „So funktionierts" (dritte Scroll-Bewegung in
>   Folge ohne neue Information – Viviens Restraint-Test).
>
> **Verifikation:** Automatischer Sweep über 19 öffentliche Seiten bei 375px – überall 0px waagerechter
> Überlauf, keine Konsolenfehler, keine 4xx/5xx. Choreografie, Fortschritts-Anzeige und Sprungmenü je
> einzeln vermessen (Werte in den Commit-Nachrichten). Playwright 8/8 nach jedem Schritt.
> Kais Code-/Security-Gate für Stufe 1: freigabefähig ohne Befund.
>
> **Nachtrag (12.08.2026): Deploy + zwei Gate-Befunde behoben** (`a86a95e`, `7cd097e`, live).
> Tobias' Browser-Gate lieferte zwei echte Funde, beide vor dem Deploy behoben:
> - **Die Fortschritts-Anzeige klebte nicht.** Zwei Ursachen: `overflow-x-hidden` auf der
>   Feature-Section macht diese zum Scroll-Container und setzt damit **jedes** `position: sticky`
>   darin außer Kraft (jetzt `overflow-x-clip` – schneidet identisch ab, ohne Scroll-Container);
>   und der Wrapper der Anzeige war exakt so hoch wie der Balken selbst, weil sein zweites Kind
>   absolut positioniert ist – ein Sticky-Kind ohne Spielraum im Containing Block kann nie kleben
>   (jetzt `display: contents`). Nachgemessen: `rect.top` konstant 64px über fünf Scroll-Stufen.
> - **Zeilenversatz der Tabellen-Karte war in px kodiert**, die Zeilenhöhe wächst aber rem-basiert
>   mit der Schriftgröße – ab 150 % überlappten die vertauschten Zeilen. Jetzt `2.25rem`; gemessen
>   36/54/72 px bei 100/150/200 %, exakt gleich dem Zeilenraster.
> **Nach dem Deploy live gefunden und sofort nachgezogen:** `/transfermarkt` hatte mit **echten**
> Nutzerdaten 36 px waagerechten Überlauf (lokal nicht reproduzierbar – die Dev-Daten enthalten nur
> kurze Namen). Ursache: Karten sind Raster-Elemente mit `min-width: auto`, ein langes Wort ohne
> Trennstelle zwingt die Spalte breiter als den Viewport. Fix: `min-w-0` + `break-words` auf beide
> Kartentypen. Danach live 0 px auf allen 17 geprüften Seiten.
> **Live-Verifikation nach dem Deploy:** Fortschritts-Anzeige klebt bei 64 px und zählt korrekt
> (1/6 → 3/6 → 5/6), Ergebnis-Szene läuft vollständig durch, Rangliste behält beim Wischen die
> Namensspalte (82 px Überlauf, letzte Spalte erreichbar), keine Konsolen- oder Seitenfehler.
> ⚠️ **Werkzeug-Lehre:** `netstat | grep LISTEN` scheitert auf diesem deutschen Windows (`ABHÖREN`) –
> dadurch lief einmal ein `npm run build` in Tobias' Dev-Server hinein und erzeugte eine 404-Kaskade
> in einer seiner Testchargen; er hat sie erkannt, verworfen und wiederholt. Prüfskript liegt als
> `tmp/port3000.sh` bei, Warnung steht in CLAUDE.md.
> *(Nachtrag 15.08.2026: umgezogen nach `scripts/port-frei.sh`, Port jetzt Parameter.)*
>
> **Nachtrag (12.08.2026, nachmittags): Ronjas Verständnisprüfung und ihre Folgen** (`ec423a2`, live).
> Patrick ließ nach dem Deploy prüfen, ob sein eigentliches Ziel erreicht ist – „spielerisch die
> Funktionen kennenlernen". Ronja hat am **Live-Stand** gemessen (DOM-Opacity im 100-ms-Raster,
> `docs/RONJA-LANDING-2026-08-12.md`) und den zentralen Befund geliefert: **Nein, nicht aus der
> Bewegung.** Beide „eingereicht"-Marken der Ergebnis-Szene waren nur ~200 ms gleichzeitig sichtbar,
> bei 9 px Schriftgröße; ohne den Fließtext daneben liest sich die Choreografie als „ein Ergebnis wird
> bestätigt", nicht als „zwei unabhängige Meldungen". Kontrollprobe: Bei `prefers-reduced-motion`
> entfielen die Marken ganz – das Vertrauensmerkmal lebte strukturell nur im Text.
> **Viviens Entscheidung (§17 des Landing-Konzepts) ging über den Vorschlag hinaus:** nicht das
> Zeitfenster strecken, sondern die Meldungen **gar nicht mehr ausblenden**. Aus dem Zustand
> „eingereicht" wurde der Inhalt „meldet 78" / „meldet 65" (Zahl fett, 9 → 11 px – die Mikro-Größe,
> die die Karte für die Team-Namen ohnehin nutzt); vier statt fünf Schritte (`[0, 650, 1550, 1750]`),
> der Endstand erscheint **neben** den weiterhin sichtbaren Team-Zahlen. Ab ≈2 s stehen alle drei
> Werte dauerhaft nebeneinander – der Mechanismus ist ein Dauerzustand statt eines Zeitfensters, das
> man treffen muss. `prefers-reduced-motion` zeigt jetzt denselben vollständigen Endzustand **sofort**
> (vorher fehlten die Marken dort) – mehr Information, nicht weniger.
> Dazu Ronjas zweiter Fund: Der Hero-Ball war auf 375 px praktisch unsichtbar, weil die Ausblendung
> über dem Textblock (Fix gegen die 430-px-Kollision) mobil fast die ganze Fallstrecke abdeckt –
> jetzt Bodenwert **0.2** statt hartem 0.
> **Gates:** Tobias hat beide von Vivien namentlich erbetenen Punkte unabhängig gegengeprüft – keine
> Kollision der dauerhaften Marken mit der Fußzeile (8 px Abstand, bei 200 % Textgröße sogar ~50 px,
> auch auf 430 px), korrekter Reduced-Motion-Endzustand, Ball auf 375 px durchgehend erkennbar und
> auf 430 px bei 20 % nach seiner Einschätzung nicht störend. Urteil: freigabefähig.
> **Live verifiziert nach dem Deploy:** ab 2,1 s stehen alle vier Elemente dauerhaft auf Opacity 1,
> in bewegter **und** reduzierter Fassung; Ball 0.95 → 0.20 über dem Text → Ankunft, auf beiden
> Breiten identisch; keine Konsolenfehler.
> **Offen (Ronjas Validierungsvorschlag):** Johnny stellt bei den Turnier-Gesprächen (~17.08.) die
> Zusatzfrage „Wer trägt bei Hoops das Ergebnis ein, wenn ein Spiel vorbei ist?" – Antworten mit
> „beide Teams" ohne Nachlesen wären der Beleg, dass die Bewegung jetzt trägt.
>
> **Nachtrag (12.08.2026, abends): Ronjas beide Nebenbefunde umgesetzt** (`a7354a7` + `7e9e254`, live).
> - **Feedback-Schaltfläche** stand im eingeloggten Hero an letzter von fünf Stellen, obwohl
>   „Feedback-gebende Tester" die selbstdefinierte Kampagnen-Kennzahl ist (Befund Nele 11.08.,
>   unabhängig bestätigt von Ronja 12.08.). Jetzt vorne in der zweiten Reihe mit dem Bernstein-Akzent
>   des Testphase-Bands; der Primärplatz bleibt bei „Zum Feed". Tobias hat den Kontrast per
>   Pixel-Sampling des echten Hero-Fotos gemessen: **16,7 : 1 bis 18,2 : 1** (WCAG AAA ist 7:1) – und
>   dabei einen zweiten Fehler gefunden: Beim Hover wird die Fläche solide `amber-300`, das fest
>   verdrahtete `text-amber-300` am Icon war dann exakt dieselbe Farbe und das Icon unsichtbar.
>   Vor dem Deploy behoben (`7e9e254`), Icon-Farbe an den Hover-Zustand gekoppelt.
> - **Wachstums-Signal für ausgeloggte Wiederkehrer: bewusst KEINE Zahl.** Gemessen über die
>   öffentlichen Endpunkte: 70 Teams in der DB, davon 6 ohne Demo-Kennzeichnung – und davon ist eines
>   der in `CLAUDE.md` dokumentierte Dev-Testaccount. Neles Entscheidung
>   (`docs/LANDING-COPY-2026-08-11.md` §7): Eine Beteiligungszahl wäre entweder unehrlich („70 Teams")
>   oder entmutigend, und sie stünde in der Testphase wochenlang still – das würde Ronjas Befund
>   belegen statt beheben. Stattdessen **Sichtbarkeit statt Behauptung**: Der News-Block (echte,
>   datierte Meldungen) rückt von ganz unten zwischen Feature-Strecke und „So funktionierts".
>   `LandingHowItWorks` wechselt dafür auf `bg-gray-50`, damit der Schachbrett-Rhythmus erhalten
>   bleibt. **Schwelle für eine spätere Zahl (Nele):** ab 20–25 verifizierten externen Teams, und nur
>   wenn sie sich über Wochen sichtbar bewegt; vorher braucht es eine Kennzeichnung interner
>   Testaccounts (offen für Ben).
> **Live verifiziert:** Sektionsabfolge navy → grau → weiß → grau → navy, sechs News-Karten mit echter
> Tagesmeldung, 0 px waagerechter Überlauf, keine Konsolenfehler.
> ⚠️ **Zweite Werkzeug-Lehre zum Port-Check:** Es reicht nicht, den lokalisierten Zustandstext zu
> meiden – WARTEND/FIN_WARTEN_2-Reste sehen sonst wie ein Listener aus. Erkennungsmerkmal ist die
> Gegenstelle `0.0.0.0:0` bzw. `[::]:0`; das Prüfskript `tmp/port3000.sh` endet jetzt mit Exit-Code 1,
> damit ein `&&`-verketteter Build gar nicht erst startet.
> *(Nachtrag 15.08.2026: jetzt `scripts/port-frei.sh`.)*
>
> **Nachtrag (12.08.2026, spät): Rückkehr-Signal im eingeloggten Hero** (`dd95a3b` + `0600d3b`, live).
> Ronjas Befund **O3** (kein persönlicher Grund zurückzukommen) – übergeben an **Lina**. Klarstellung
> fürs Roster-Verständnis: Lina ist **kein Agent**, sondern eine der vier Skill-Personen
> (`agentSourceId: src-onboarding`, `entityType: "skill"`); ihre Rolle ist der Skill
> `update-onboarding-surfaces`, entsprechend angewendet statt beauftragt.
> Der eingeloggte Hero zeigt statt „Was möchtest du heute machen?" die wichtigste **tatsächlich offene**
> Sache als anklickbare Pille, nach Dringlichkeit: Beitrittsanfragen → `/team/admin?tab=anfragen`,
> offene Ergebnisse → `…?tab=ergebnisse`, neue Ergebnisse → `/spiele`, sonst ungelesene
> Benachrichtigungen → `/home`. **Gibt es nichts Offenes, bleibt die alte Zeile** – kein erfundener
> Betrieb, keine künstliche Dringlichkeit (Ronjas eigene Grenze: keine Dark Patterns). Datenquelle ist
> der vorhandene Benachrichtigungs-Endpunkt (Beitrittsanfragen liegen dort ohnehin), der Aufruf läuft
> unabhängig vom Profil-Abruf – schlägt er fehl, ist der Hero exakt wie vorher.
> **Gate:** Tobias hat zwei Fälle mit **echten** Daten verifiziert (`max@test.de`: 0 ungelesen →
> generische Zeile; `demo.coach@nrw-demo.de`: reale offene Anfragen → „3 Beitrittsanfragen warten auf
> dich"), Tastaturzugang und sichtbaren Fokus bestätigt, ausgeloggten Hero als unverändert bestätigt.
> Sein Befund: Die Pille war 13 px höher als die Textzeile und verschob die Schaltflächen je nach
> Nutzerzustand – vor dem Deploy mit fester Mindesthöhe behoben (gemessen 46 px in beiden Zuständen,
> Schaltflächen an identischer Position bei 375 px und 1280 px).
> **Offen (Tobias' Übergabe an Kai):** `pending_result` und `match_result` sind nur an abgefangenen
> Antworten geprüft, nicht mit echten Daten – Kandidat für einen künftigen E2E-Test.
>
> **Nachtrag (12.08.2026): Kennzeichnung interner Testkonten** (`939e73a` + `572e581`, live).
> Neles Voraussetzung für eine spätere öffentliche Beteiligungszahl
> (`docs/LANDING-COPY-2026-08-11.md` §7): Ohne diese Kennzeichnung zählt sich das Projekt selbst mit –
> von den sechs Teams ohne Demo-Kennzeichnung ist mindestens eines der dokumentierte Dev-Testaccount.
> - **Bewusst ein zweites Feld statt `isDemo`:** `isDemo` sind erfundene Seed-Fixtures, `isInternal`
>   sind **real angelegte** Konten, die uns selbst gehören. Beides darf nicht in Beteiligungszahlen,
>   aber es sind zwei verschiedene Sachverhalte.
> - `models/Team.js`, `models/Player.js`: additives `isInternal` (Default false, keine Migration –
>   Bestandsdaten haben das Feld nicht, die Filter arbeiten mit `$ne: true`).
> - **`lib/echteZahlen.js` (neu):** zentrale Filter `NUR_ECHT` / `NUR_ECHTE_TEAMS`, damit jede künftige
>   Zählstelle denselben Maßstab benutzt.
> - **`/api/admin/set-internal` (neu):** Super-Admin-Endpunkt, setzt ausschließlich dieses eine Feld.
> - Schalter samt Kennzeichnung („Beispieldaten" / „intern") in **Team- und Spielerliste** des
>   Admin-Bereichs; Analytics-Dashboard bekam die Karte **„Echte Beteiligung"** (externe Teams/Nutzer,
>   Differenz zum Gesamtbestand, Neles Schwelle 20–25 als Zielmarke), CSV-Export zieht mit.
> **Kais Gate:** kein Blocker, mit drei Befunden – alle vor dem Deploy behoben: (1) strukturell
> ungültige ID ergab 500 statt 400 (jetzt `mongoose.isValidObjectId` → 400), (2) der Endpunkt kannte
> `art:"spieler"`, aber keine Oberfläche rief den Pfad auf (Schalter ergänzt), (3) `zaehlgrund()` war
> toter Code (entfernt). Er hat außerdem **`tests/e2e/set-internal.spec.mjs`** geschrieben (10 Tests:
> Auth inkl. selbst geschmiedetem Team-Token, Validierung, Mass-Assignment-Angriffe auf beide Pfade) –
> Suite jetzt **18/18**. Sein Mass-Assignment-Test belegt: Zusatzfelder wie `teamName`, `approved`
> oder `isSuperAdmin` im Body werden ignoriert.
> **Live geprüft:** öffentliche Seiten unverändert 200, neuer Endpunkt ohne Token 401.
> ⚠️ **Bewusst offen:** Auf der Produktivseite ist **kein einziges Konto markiert** – welche Konten
> intern sind, entscheiden Patrick und Jonatan, nicht die Sitzung. Erst danach ist die Zahl „externe
> Teams" im Dashboard aussagekräftig.
>
> **Nachtrag (12.08.2026): Interne Konten auf der Produktivseite markiert** (Datenpflege, kein Code).
> Auf Patricks Anweisung, mit Trockenlauf vorab und Gegenprüfung danach; geschrieben wurde
> ausschließlich `isInternal`, nichts gelöscht oder verborgen.
> - **Vier Teams tragen exakt die Namen aus `scripts/seed-demo.mjs`** (Test Baskets, Rhein Ballers,
>   Munich Hoops, Hamburg Towers United) und wurden alle am **24.06.2026** angelegt – dem Go-Live-Tag.
>   Beim Start ist also ein Demo-Seed gegen `hoops_prod` gelaufen; die Teams tragen kein `isDemo`, weil
>   es das Feld damals noch nicht gab. → als intern markiert.
> - **48 Spielerprofile** mit `@test.de`/`@nrw-demo.de` (davon 18 vorher als echte Nutzer gezählt) und
>   drei Profile, die wörtlich „Test" heißen (`Patrick Test`, `Pat Test`, `Patrick Test 2`,
>   Adressvarianten des Betreibers) → intern.
> - **Viersen Hoops II** (ebenfalls 24.06.) hat Patrick auf Rückfrage als sein eigenes Team benannt
>   → intern.
> - **Bewusst extern belassen:** `Mönchengladbach Scorpions e.V.` (28.06. angelegt, „e.V." im Namen)
>   sowie die Hauptprofile von Patrick und Jonatan – auf Patricks ausdrückliche Entscheidung, weil sie
>   selbst spielen und sich sonst kleinrechnen würden.
> **Ergebnis der Zählung:** externe Teams **6 → 1**, externe Nutzer **31 → 10**. Das ist die ehrliche
> Ausgangslage für Neles Schwelle (20–25 externe Teams, bevor eine öffentliche Beteiligungszahl
> sinnvoll wird). `Jonny Vo` hat Patrick anschließend ebenfalls als intern eingestuft.
>
> **Endstand der Zählung (12.08.2026):** extern gezählt werden **1 Team**
> (`Mönchengladbach Scorpions e.V.`) und **9 Nutzer** – darunter die vier Hauptprofile von Patrick und
> Jonatan, die auf seine ausdrückliche Entscheidung mitzählen, weil sie selbst spielen. Faktisch
> stammen also **fünf** der neun aus der Community. Vorher standen dort 6 Teams und 31 Nutzer.
> ⚠️ **Nebenbefund, noch offen:** Die vier Seed-Teams stehen für Besucher weiterhin **ohne**
> „BEISPIELDATEN"-Kennzeichnung auf der Live-Seite – `isInternal` wirkt nur auf die Zählung, das
> öffentliche Abzeichen hängt an `isDemo`. Ob sie zusätzlich so gekennzeichnet oder beim Cutover
> gelöscht werden, ist eine Produktentscheidung von Patrick.

---

## 12.08.2026 – Visuelles Redesign „Anzeigetafel" auf Navy + Wow-Ebene (Stufen A und B)

**Auslöser:** Patrick auf den Stand nach den Design-Review-Wellen: „ich sehe noch keine großen
Veränderungen." Auf Nachfrage Freigabe **„Volle Freiheit inklusive Farben"** – nur das Logo bleibt.
Danach zweimal nachgeschärft: „Verbinde die Innovation einer Apple Website mit dem Thema Basketball"
und „meiner Meinung nach war Navy Blau und Orange auch passend dafür."

**Spezifikationen:** `docs/VISUELLE-RICHTUNG-2026-08-12.md` (Vivien) und
`docs/WOW-KONZEPT-2026-08-12.md` (Vivien), `docs/WOW-MATERIAL-2026-08-12.md` (Milo).

### Commits
- `d28e800` Richtung „Anzeigetafel" plattformweit (121 Dateien)
- `8339301` Grundfarbe auf Navy + Kais neun Hover-Befunde
- `e098941` Wow-Ebene Stufe A: Taktiktafel, Splitflap, Fokus-Sprung
- `f57eb01` Bildrate gemessen, Haarlinie an Bild-Avataren
- `61ece6b` Wow-Ebene Stufe B: die drei wiederkehrenden Momente
- `5632996` Kais kritischer Befund: falsche Vertrauensaussage behoben
- `1c42810` Tobias' Befund: eigene Zeile fehlte beim ersten Aufruf

### Was sich geändert hat
- **Farbe:** neue Skalen `navy` (Grund), `paper`/`mist` (Text), `signal` (Status); `brand` neu
  verankert auf dem echten Logo-Orange `#F07A27` statt `#f97316`. Keine Verläufe, keine Schatten –
  Tiefe entsteht aus Flächenstufe plus 1px-Haarlinie. Werte von Vivien gerechnet.
- **Schrift:** Big Shoulders Display (Headlines ab `text-2xl`), Geist (Text/UI), Geist Mono
  (Zahlen in Tabellen, `tabular-nums`). Geist fehlt im Font-Katalog von Next 14.2.35 – geprüft,
  deshalb selbst gehostet aus `public/fonts/` über `next/font/local`, keine neue Abhängigkeit.
- **Icons:** `react-icons/fa` → `react-icons/pi` (Phosphor), 93 Zuordnungen vorab gegen das Paket
  geprüft. Kai hat sie zusätzlich auf semantische Kollisionen geprüft.
- **Hero ohne Foto.** Das Motiv war 1000×652 px, wurde bis ~5× hochskaliert und brauchte 65 %
  Schwarz darüber – am Ende wirkte es fast nur als graue Fläche.
- **Neue Bausteine:** `components/landing/PlayDiagram.js` (Taktiktafel, zeichnet sich scroll-gesteuert
  über `strokeDashoffset` bei `pathLength="1"`), `components/ui/SplitFlap.js`,
  `components/landing/FeatureFocus.js`.
- **Stufe B – die wiederkehrenden Momente:** Anzeigetafel-Punktestand auf `/match/[id]` inkl. „Von
  beiden Teams bestätigt"; Karriere-Summen im Spielerprofil als hochzählende Monospace-Zahlen;
  eigene Zeile in der Liga-Tabelle mit der Markenleiste. Damit steht die 2px-Markenleiste an genau
  den drei Stellen, die die Spezifikation vorsieht.

### Bewusst NICHT gebaut
- **Viviens „Tabelle sortiert sich" als Animation.** Die Liga-Tabelle kommt beim Seitenaufruf bereits
  in der Endsortierung vom Server – es gibt in der Sitzung keine alte Reihenfolge, gegen die animiert
  werden könnte. Eine nachgestellte Sortierung wäre eine Behauptung, keine Funktion.
- **Der Desktop-Pin** aus Stufe A.1 (höchstes Risiko, läuft gegen Ronjas Leitplanke).
- **Milos 90-Bilder-Sequenz** (450,7 KB) liegt produziert im Zwischenspeicher, aber nicht im Repo –
  sie überschreitet Ronjas 200-KB-Grenze, das ist eine Entscheidung für Patrick.

### Gates
- **Kai (statisch):** keine Sicherheitsbefunde. Ein **kritischer** Fund: „Von beiden Teams bestätigt"
  hing allein an `resultStatus === "confirmed"` – das setzt aber auch der Admin-Pfad
  `/admin/update-match`, wo nur eine Partei tippt. Die Anzeige verlangt jetzt zusätzlich beidseitiges
  `submittedBy`. Dazu neun (plus drei selbst gefundene) unsichtbar gewordene Hover-Zustände.
- **Tobias (Browser):** freigabefähig. Sein Fund: Die eigene Zeile blieb unhervorgehoben, wenn
  `/ligen/[id]` die erste Seite nach dem Anmelden war – die Anmelde-Antwort enthält kein `teamId`,
  und nur `useCurrentPlayer` reicherte den localStorage an. Behoben an der Wurzel (Navbar schreibt
  zurück) plus Absicherung auf der Seite selbst.
- **Ronja (vorab):** hat der Apple-Vorgabe fachlich widersprochen – der Vertrauensschmerz der
  Zielgruppe liege bei Preis und Zuverlässigkeit, nicht bei fehlendem Glanz; der Hebel liege in den
  wiederkehrenden Momenten, nicht auf der Startseite. Ihre vier Leitplanken wurden übernommen:
  CTA ohne Scrollen sichtbar, kein Pinning über 100vh, ≤200 KB Zusatzgewicht, ≥50 fps bei
  4×-CPU-Drosselung. Ihr inhaltlicher Einwand blieb bewusst überstimmt – Priorisierung entscheidet
  Patrick.

### Messwerte (alle nachgemessen, nicht geschätzt)
- Kontrast-Durchlauf über 17 öffentliche Seiten (`tmp/kontrast-check.mjs`, misst jeden Textknoten
  gegen den tatsächlich dahinterliegenden Grund inkl. halbtransparenter Schichten): **0 Befunde.**
  Er hat vorher 13 echte Verstöße gefunden, darunter die Altlast weißer Text auf `brand-500`
  (2,61:1) – Primärflächen tragen jetzt dunklen Text (6,88:1).
- Bildrate (`tmp/fps-check.mjs`): **60 fps** mobil und Desktop, schlechtestes Einzelbild 16,8 ms,
  null Hakler – bei nachgewiesener 4×-CPU-Drosselung (Gegenprobe Faktor 4,0; ohne sie wäre ein
  fehlgeschlagener CDP-Aufruf als „läuft flüssig" durchgegangen).
- Build grün, Playwright 18/18 grün.

### Fallstricke für die nächste Session
- **Nicht rechnen, nachmessen.** Der Maßstab der Taktiktafel hat drei Anläufe gekostet, weil ich die
  SVG-Skalierung jedes Mal falsch hergeleitet habe. `tmp/play-messen.mjs` liest die tatsächlichen
  Rechtecke aus – das war in einer Minute geklärt.
- **Zwei Browser-Agenten gleichzeitig zerstören sich die Sitzung.** Tobias' erster Durchlauf war
  unbrauchbar, weil Milos Demo parallel dieselbe Sitzung nutzte und seine Klicks abfing.
- **Ein Zweig, den niemand je gerendert hat, ist kein geprüftes Feature.** In der Dev-DB hat keines
  der 23 „bestätigten" Spiele eine echte beidseitige Meldung (der Seed schreibt Ergebnisse direkt) –
  die Bestätigungs-Anzeige wäre nie zu sehen gewesen. Belegt mit `tmp/pruef-bestaetigt.mjs`.

### Nachtrag 12.08.2026 – Wow-Ebene Stufe C deployt (`07a1a0e`)

Politur: Staffelung als benannte Regel (`staffel()` in `lib/ui.js`, 70 ms, gedeckelt bei sechs
Elementen), Mikro-Detail beim Karten-Hover (Zahlen springen auf die Markenfarbe), weicher
Seitenwechsel über die **native** `document.startViewTransition()` an Team- und Spielerkarten.

**Zwei Fallstricke, die Zeit gekostet haben und die man wiedersehen wird:**

1. **Der Seitenwechsel feuerte nie.** Der erste Entwurf hing an jedem Klick auf `document` –
   Next.js' `<Link>` ruft aber `preventDefault()` in seinem eigenen React-Handler, der vorher läuft.
   Die Capture-Phase löst das, dort hätte `stopPropagation()` aber die eigenen onClick-Handler
   verschluckt (mobiles Menü). Auflösung: nur ausgezeichnete Verweise (`data-vt`) an genau den
   Karten, die keine eigenen Handler tragen.
2. **Kais Befund: Die Zeitgrenze hing an `requestAnimationFrame`.** In einem versteckten Tab
   pausiert rAF vollständig – der Deckel hätte dort nie gegriffen, die Zusage wäre offen geblieben
   und der Browser hätte das alte Bild festgehalten. Exakt die Falle, die oben in CLAUDE.md steht.
   Jetzt an `setTimeout`. **Mit Gegenprobe:** `tmp/versteckter-tab-check.mjs` fällt auf dem alten
   Stand durch und läuft auf dem neuen – ein Test, der auf beiden grün ist, beweist nichts.

**Gates:** Kai (statisch) – ein Befund mittel/hoch (Nr. 2 oben), drei niedrige, alle erledigt.
Tobias (Browser) – freigabefähig mit Auflagen; sein Klick-Werkzeug fiel erneut aus, mobil, Enter
und Strg-Klick blieben ungeprüft. Diese drei Lücken sind mit `tmp/mobil-tastatur-check.mjs`
selbst geschlossen (10/10, inkl. „Menüpunkt navigiert UND Menü schließt" – genau der Fall, den
`stopPropagation()` hätte zerstören können).

**Live-Abnahme nach dem Deploy** gegen hoopsgermany.de: Navigation 10/10, Übergang feuert genau
einmal und schließt sauber, bei reduzierter Bewegung gar nicht, keine Konsolenfehler.

**Nebenbefund, dokumentiert:** `components/ui/Card.js` hat 0 Importe und `cardClass` 0
Verwendungen – 126 Stellen bauen die Panel-Fläche von Hand. Eine Änderung an der Kartensprache
wirkt also nicht zentral. Größter offener Konsistenz-Posten des Designsystems, Umbau bewusst
zurückgestellt.

### Nachtrag 12.08.2026 – Ballreise, überbreite Überschrift und Bildsequenz deployt (`78d833a`)

**Gebaut:** A10 (der Ball reist durch die ganze Seite statt im Hero zu landen), A1 (Überschrift läuft
über beide Bildränder), A5 (Kapitelmarke, aus der Backoffice-Session), plus die scroll-gebundene
Bildsequenz „Sprungball" (45 Bilder, 191 KB, 0 Anfragen beim Seitenaufruf).
Grundlage: Patricks Freigabe `dec-hoops-ball-landung` (Option 1) – die Ball-Landung an der
Hero-Schaltfläche durfte entfallen. Damit war der Engpass gelöst, an dem A2, A9 und A10 hingen.

**Die zwei Fehler, die die Gates gefunden haben – beide mit Lehrwert:**

1. **Die Bildsequenz erreichte ihr Ziel nie** (Befund Tobias, hoch). Die Fortschrittsformel setzte
   voraus, dass der Abschnitt oben aus dem Bild gescrollt werden *kann*. Er sitzt aber am Seitenende –
   beim untersten möglichen Scrollstand kam sie auf **Bild 24 von 45**. Der beworbene Moment war für
   niemanden erreichbar. Lehre: Bei scroll-gebundenen Effekten am Seitenende muss das Ende auf den
   **tatsächlich erreichbaren** Scrollstand gedeckelt werden, nicht auf den geometrischen.
2. **„Von beiden Teams bestätigt" hätte gelogen** (Befund Kai, kritisch). Die Aussage hing allein an
   `resultStatus === "confirmed"` – das setzt aber auch der Admin-Pfad `/admin/update-match`, wo nur
   eine Partei tippt. Belastbar ist erst beidseitiges `submittedBy`. Lehre: Ein Statusfeld ist kein
   Beleg, solange nicht geprüft ist, **wer** es setzen kann.

**Weitere Gate-Befunde, alle behoben:** Ball klebte nach der Ankunft rechts, während der Balken
zurückging (Tobias, mittel); Ball rastete nach einer Größenänderung nicht neu ein (Kai); fehlender
Fehlerzweig in `SwishSequence` (ein fehlender Bilder-Ordner wäre lautlos gescheitert); Generator-Skript
brach auf fremden Rechnern ohne Hinweis ab.

**Werkzeug-Korrektur, die Kai angestoßen hat:** Mein Kontrast-Durchlauf nahm zwischenzeitlich *jeden*
`aria-hidden`-Teilbaum aus. Das ist zu weit – `aria-hidden` entfernt Inhalt nur aus dem
Screenreader-Baum, sehende Nutzer lesen ihn weiter. Zwei Stellen waren dadurch blind geworden und
bestanden nur zufällig. Die Ausnahme hängt jetzt an der Signatur der Konturschrift.

**Live-Abnahme gegen hoopsgermany.de:** Navigation 10/10, Sequenz erreicht Bild 44/44 am Seitenende,
Ball folgt beim Zurückscrollen dem Balken (70px/70px), Navbar-Knöpfe reagieren auf echte Klicks,
0 Anfragen für die Sequenz beim Seitenaufruf, keine Konsolenfehler – mobil und Desktop.

**Prozess-Lehre, dreimal in Folge bestätigt:** Tobias' Klick-Werkzeug fällt regelmäßig aus. Er meldet
das inzwischen sauber als „ungeklärt" statt als Entwarnung – und genau diese Ehrlichkeit ist der Grund,
warum seine Berichte etwas wert sind. Die offenen Punkte lassen sich mit Playwright nachziehen
(`tmp/tobias-befunde-check.mjs`, `tmp/mobil-tastatur-check.mjs`).

---

## 13.08.2026 – „Deine Zahlen stehen": der Spieler erfährt es endlich (Ronjas R1)

**Auslöser:** `docs/RETENTION-BEFUND-2026-08-13.md`, Hebel **R1** (Ronja). Befund wörtlich:
Ein Spieler erfährt nie, dass seine eigenen Zahlen gelandet sind — `app/api/team/match-stats/save`
verschickte **keine einzige** Benachrichtigung, und `submit-match-result` benachrichtigte nur die
**Follower** beider Teams. Ein Team-Beitritt legt aber kein Follow an. Ein Spieler mit 24 Punkten
hörte also von niemandem, dass seine Karriere-Statistik sich geändert hat — das Kernmotiv der
Hauptzielgruppe lag fertig in den Daten und wurde nicht ausgeliefert.

### Commits
- `c4dd91d` Der Spieler erfährt jetzt, dass seine Zahlen gelandet sind
- `ddd4131` Messen, ob die neue Benachrichtigung wirklich trägt

### Was gebaut wurde
- **Neu: `lib/statsNotify.js`** (`notifyOwnStats(match)`) — die gesamte Logik an einer Stelle,
  aufgerufen aus `app/api/team/match-stats/save/route.js` **und**
  `app/api/team/submit-match-result/route.js` (jeweils nach `match.save()`, in eigenem `try/catch`,
  darf den Speichervorgang nie kippen).
- **Empfängerregel:** nur `playerStats[].player` gesetzt (Account vorhanden), `didNotPlay` nicht
  gesetzt **und** mindestens ein Wert > 0. Der Statistik-Editor (`components/team/tabs/ErgebnisseTab.js`)
  sendet immer den **ganzen Kader** mit — eine 0/0/0-Zeile heißt „noch nicht eingetragen", nicht
  „hat nichts gemacht". Ohne diese Regel hätte jeder Kaderspieler eine Nachricht bekommen.
  Slot-Spieler ohne Account bekommen nichts.
- **Genau einmal:** neues Feld **`Match.notifiedStatsPlayers: [ObjectId]`** (`models/Match.js`).
  Bewusst je Spieler statt als Boolean wie `notifiedPendingResult`: eine **Korrektur** des
  Box-Scores löst keine zweite Nachricht aus, ein Spieler, der **erst bei der Korrektur** dazukommt,
  bekommt aber seine erste.
- **Der Text trägt den Beleg** (Kernpositionierung „wie LinkedIn, nur nachweisbar"):
  bei `resultStatus: "confirmed"` → „*Bestätigt – beide Teams haben das Ergebnis unabhängig
  gemeldet.*", bei `pending` → „*Noch vorläufig – bestätigt ist die Zahl, sobald <Gegner> das
  Ergebnis ebenfalls meldet.*". Es wird **nie** eine Bestätigung behauptet, die es nicht gibt.
  Bei `mismatch` wird **nichts** versendet und **niemand** vermerkt — der nächste Aufruf (nach der
  Auflösung) holt es nach. Ronjas Satz dazu: die Belegbarkeit stand bisher überall als *Regel*,
  nirgends als *Ereignis*. Dies ist das Ereignis.
- **Kein Sackgassen-Eintrag:** neuer Typ `own_stats` in `models/Player.js` (Enum) und in
  `lib/notifications.js` → `/match/[id]`; Symbol `PiChartLineUpBold` in
  `components/layout/NotificationBell.js`. Ziel ist die Spielseite mit Box-Score **und** dem
  Abzeichen „Von beiden Teams bestätigt".
- **Kein Mailversand.** Bewusst nur In-App über `Player.notifications` — eine Mail ist eine
  Entscheidung, die Patrick wach treffen soll (SMTP ist lokal ohnehin nicht konfiguriert).

### Messung (Ronjas Erfolgsfrage zu R1)
- **`own_stats_notified`** — serverseitig beim Versand, ein `AnalyticsEvent` je Spieler **mit
  `playerId`** (`lib/statsNotify.js`).
- **`own_stats_opened`** — Klick in der Glocke (`components/layout/NotificationBell.js` und
  `components/layout/Navbar.js`, beide über `lib/trackEvent.js`).
- **`lib/analyticsSummary.js`**: neuer Block `ownStats` (`notified`, `notifiedPlayers` = *distinct*
  Spieler, `opened`, `openRate`). Die Quote bleibt `null`, solange nichts versendet wurde — keine
  erfundene „0 %". Karte `OwnStatsCard` in `app/admin/analytics/page.js`.
  **`components/admin/SponsorReportView.js` wurde nicht angefasst** — die Zahl geht nicht nach außen.
- **`app/feedback/page.js`**: Themen-Chip **„Benachrichtigungen"** ergänzt (Konvention
  `update-feedback-analytics`). Kein neuer Pfad-Prefix → kein neuer `$switch`-Zweig nötig.

### Verifikation (lokal, Dev-DB `hoopsgermany`, 375×812, Dev-Server nach Schema-Änderung neu gestartet)
Alle Belege aus der Datenbank ausgelesen bzw. am Bildschirm geprüft:
1. **Box-Score über die echte Oberfläche gespeichert** (`/team/admin?tab=ergebnisse`, `max@test.de`,
   Spiel vs. Rhein Ballers) → 8 Benachrichtigungen, Text z. B. „*Deine Zahlen aus dem Spiel gegen
   Rhein Ballers stehen: 26 Punkte, 12 Rebounds, 9 Assists. Bestätigt – beide Teams haben das
   Ergebnis unabhängig gemeldet.*"
2. **Zweites Speichern desselben Box-Scores** → unverändert 1 Benachrichtigung je Spieler,
   `notifiedStatsPlayers` weiterhin 8, keine neuen Analytics-Ereignisse. **Keine Doppelung.**
3. **Statistiken vor dem Ergebnis** (Spiel noch `scheduled`) → **nichts** versendet; erst das
   Einreichen des Ergebnisses löste den Versand aus (Nachhol-Pfad in `submit-match-result`).
4. **Nur wer wirklich gespielt hat:** im selben Spiel bekamen Max (18/5/3) und Jonas (7/1/2) eine
   Nachricht, Leon und Noah (je 0/0/0) **keine**.
5. **Widerspruch:** Rhein Ballers meldete gegenläufig → `mismatch`; die beiden Rhein-Ballers-Spieler
   mit Werten bekamen **nichts**. Nach der Korrektur (`confirmed`) bekamen sie genau **eine**
   Nachricht mit dem Bestätigungs-Satz — Max und Jonas **keine zweite**.
6. **Sichtbar geprüft** (Screenshot 375×812): Glocke zeigt beide Einträge mit Symbol und korrektem
   Text; Klick führt auf `/match/<id>` mit Box-Score und „Von beiden Teams bestätigt".
7. **Admin-Auswertung** zeigt „Versendet 12 · Erreichte Spieler 8 · Geöffnet 1 · 8 % geöffnet".
8. `npx eslint` auf allen berührten Dateien: 0 Fehler (nur eine vorbestehende `<img>`-Warnung in
   `Navbar.js`).

### Nachtrag `df21dd7` – der Beleg-Satz hing an der falschen Bedingung
Beim Nachprüfen des Super-Admin-Pfads gefunden: `app/api/admin/updatematch/route.js` setzt
`resultStatus: "confirmed"`, obwohl dort **eine einzige Person beide Punktzahlen tippt** – beide
`submittedBy` bleiben leer. Die Nachricht hätte in diesem Fall „beide Teams haben das Ergebnis
unabhängig gemeldet" behauptet, ohne dass jemand unabhängig gemeldet hat. **Exakt derselbe Fehler,
den Kai am 12.08.2026 im Abzeichen auf `/match/[id]` gefunden hat** – ein Statusfeld ist kein Beleg,
solange nicht geprüft ist, wer es setzen kann. Der Satz hängt jetzt an beidseitigem `submittedBy`;
drei Fälle: beidseitig gemeldet → Bestätigungs-Satz · vom Super-Admin nachgetragen → „Das Ergebnis
ist eingetragen." · einseitig → benennt korrekt, **wer** noch fehlt (vorher wurde immer der Gegner
genannt, auch wenn der längst gemeldet hatte). Beide neuen Zweige nachgemessen:
Admin-Pfad → „*11 Punkte, 2 Rebounds, 1 Assist. Das Ergebnis ist eingetragen.*";
nur der Gegner hat gemeldet → „*… sobald auch dein Team das Ergebnis meldet.*"

### Nachtrag `34a166f` – die neue Messung hätte die belastbarste Kennzahl aufgebläht
`own_stats_notified` wird **serverseitig** geschrieben und trägt die `playerId` des Empfängers.
`activeUsers` und `region.visitorsByState` zählen aber `distinct playerId` über **alle**
Ereignisarten (`lib/analyticsSummary.js`). Jede versendete Benachrichtigung hätte ihren Empfänger
also als „aktiven Nutzer" gezählt, ohne dass er etwas getan hat – ausgerechnet bei der Zahl, die
Ronja in Abschnitt 3b als die belastbarste im ganzen Report bezeichnet. Beide Abfragen schließen
`own_stats_notified` jetzt aus. **Nachgemessen auf der Dev-DB: 88 gegen 82 aktive Nutzer (30 Tage)** –
sechs hätten allein durch den Empfang gezählt. Lehre für künftige Server-Ereignisse mit `playerId`:
sie gehören nicht in Aktivitäts-Kennzahlen.

### Offen / bewusst nicht entschieden
- **Nur eine Nachricht je Spieler und Spiel.** Wer beim Stand „vorläufig" informiert wurde, erfährt
  die spätere Bestätigung **nicht** noch einmal. Das war die Abwägung gegen Rauschen — ob die
  Bestätigung ein eigenes, zweites Ereignis verdient, entscheidet Patrick.
- **Kein Mailversand, kein Opt-out-Feld.** Sobald eine Mail dazukommt, gehört sie nach dem Muster
  `emailPendingResult` mit eigenem Opt-out gebaut.
- **Kein `npm run build`, kein Deploy, kein Push** — auf dem Dev-Server lief parallel eine andere
  Sitzung.

### Nachtrag 13.08.2026 – Sponsor-Report: serverseitige Positivliste (noch nicht committet/deployt)

**Befund (aus `docs/TOUR-UMBAU-2026-08-13.md` §8, dort nur eingedämmt):**
`/api/analytics/public-report` reichte das **komplette** Objekt aus `computeAnalyticsSummary()`
an jeden aus, der Link und Passwort hatte. Die Trennung „Plattform (intern)" ↔ „Sponsor-Report"
passierte erst clientseitig über den `tab`-Zustand in `app/admin/analytics/page.js` – wer die
Netzwerkantwort las, bekam alles. Am 13.08. war nur der neue `summary.onboarding` per
Destructuring entfernt worden; das Muster „durchreichen und einzeln herausnehmen" blieb.

**Umgestellt:** `app/api/analytics/public-report/route.js` baut das Antwortobjekt jetzt in
`buildSponsorView()` aus **ausdrücklich benannten Feldern neu** (Positivliste). Folge: Jedes
künftig in `lib/analyticsSummary.js` ergänzte Feld ist automatisch **nicht** öffentlich, statt
automatisch öffentlich zu sein. Die Sperrliste steht als Kommentar mit Begründung je Feld im Kopf
der Datei. Die Listenlängen sind auf die der Anzeige gekürzt (`sections` 6, `topPaths` 8,
`region.*` 8, `content.*` 5) – was abgeschnitten dargestellt wird, wird gar nicht erst gesendet.

**Maßstab war NICHT der Sponsor-Tab des Admin-Dashboards**, sondern
`components/admin/SponsorReportView.js` – die einzige Ansicht hinter diesem Endpunkt
(`app/sponsor-report/[token]/page.js`). Der Admin-Tab hängt an `/api/analytics/summary` und war nie
der öffentliche Weg. Der Report zeigt mehr als in der Aufgabenstellung vermutet: **`region` und
`content` gehören zum Report** („Regionale Stärke", „Beliebteste Inhalte") und mussten bleiben.

**Draußen** (je mit Grund im Code): `platform.users`/`platform.teams` (Bestand **inkl.**
Demo-Fixtures und interner Testkonten – nach außen falsch), alle `newLast30`/`prevLast30`/
`newThisMonth`, `signupSources` (Wirksamkeit der Akquise-Kanäle), `onboarding`, `ownStats`,
`sectionViews`, `activeUsers.d7`, `reach.viewsAllTime`/`visitorsAllTime`,
`region.usersByCity`/`visitorsByState`, `devices.unbekannt`.

**Verifiziert** (Dev-DB `hoopsgermany`, Skripte in `tmp/`):
- `tmp/sponsor-allowlist-check.mjs` – Wegwerf-Share angelegt, Endpunkt aufgerufen, alle
  Blattpfade der Antwort gegen Freigabe- **und** Sperrliste geprüft: 29 Pfade, **0 fehlend,
  0 durchgerutscht, 0 unerwartet**; Share danach wieder entfernt (`reportshares` ist wieder leer).
- `tmp/sponsor-report-shot.mjs` – öffentliche Seite gegen echtes Chromium, 1280 px und 390 px:
  alle 9 Abschnitte gerendert, **0** „Keine Daten."-Blöcke, keine Konsolenfehler, keine interne
  Kennzahl im Text. Bilder: `tmp/sponsor-shots/`.

**Offen / bewusst nicht getan:** kein Commit (Anweisung Patricks abwarten), kein `npm run build`
(fremder Dev-Server lief auf Port 3000), damit **Deploy-Gates Kai/Tobias noch nicht gelaufen** –
stehen vor einem Deploy an. Nebenbefund, nicht geändert: „Beliebteste Seiten" zeigt rohe Pfade
inkl. Profil-Slugs, obwohl der Reportkopf „keine personenbezogenen Daten" behauptet; die Namen
stehen ohnehin unter „Beliebteste Inhalte", die Aussage im Kopf ist trotzdem zu absolut.

---

## 13.08.2026 – Die Liga-Achse: Spiel → Liga → Spielplan → Topscorer (Ronjas K1–K4 + R4/R5)

**Auftrag:** Patricks Freigabe „innovativ wie Apple", ausdrücklich inklusive besserer Verknüpfung
zwischen Unterseiten. Grundlage: `docs/RETENTION-BEFUND-2026-08-13.md`, Abschnitt 1 (R4, R5) und
Abschnitt 2 (Kontaktpunkte K1–K4). Gebaut wurde **kein** neues Feature, sondern der durchgehende
Weg zwischen fünf bereits fertigen Seiten, die bisher jede für sich in einer Sackgasse endeten.
Mobil zuerst (390 px), Gestaltungssprache „Anzeigetafel" unverändert.

**Commits (einzeln rückholbar, in dieser Reihenfolge):**

| Commit | Was |
|---|---|
| `5a02569` | **K3** – `/spiele`: Filter aus der URL lesbar **und** in die URL schreibbar |
| `fa308c4` | Demo-Seed setzt `Team.leagueId` (Voraussetzung für „meine Liga") |
| `25d03b1` | **R5 + R4 + K4** – Topscorer je Liga, eigener Rang, Vereinslinks |
| `ecd4daf` | **K2** – `/ligen/[id]` wird Knotenpunkt (Spielplan + Topscorer + Rückweg) |
| `5d1d626` | **K1** – `/match/[id]`: Liga-Zeile verlinkt, zwei Wege weiter |

### K3 – die Wurzel zuerst (`app/spiele/page.js`)
`useSearchParams` kam in der Datei nicht vor; `/spiele?league=…` tat nichts. Damit waren K1 und K2
technisch gar nicht verlinkbar. Jetzt kommen `tab`, `stage`, `league`, `season`, `ort`, `ab` aus der
Adresse und werden per `router.replace` zurückgeschrieben – bewusst `replace`, damit ein Filterklick
keine Historie anlegt und die Zurück-Taste zur Herkunftsseite führt (verifiziert: Liga → Spielplan →
Filter ändern → zurück landet auf `/ligen/[id]`). `useSearchParams` verlangt eine Suspense-Grenze;
der Platzhalter ist derselbe Skelettaufbau wie beim Laden.

### R5/R4/K4 – Topscorer (`app/api/player/topscorer/route.js`, `app/topscorer/page.js`)
Die API kannte nur `season`. Neu: `leagueId` (schlägt `season`), `token` → **echter eigener Rang**,
gezählt über die **volle** Sortierung und erst danach auf 100 gekürzt – wer auf Platz 137 steht,
bekommt die Wahrheit statt gar keine Antwort. `ownLeague: true` beim ersten Aufruf ohne Filter wählt
die eigene Liga vor (`Player.teamId → Team.leagueId`), aber nur, wenn in dieser Liga überhaupt
gespielt wurde. Zusätzlich `leagues` (nur Ligen mit gewerteten Spielen) für den Filter.
Seite: Kasten „Deine Platzierung" über der Liste (Platz, Abstand nach vorn, „Zu deiner Zeile"),
eigene Zeile mit derselben 2px-Markenkante wie in der Liga-Tabelle plus „Du"-Marke, Vereinsnamen
endlich verlinkt, unten Tabelle + Spielplan derselben Liga. **Ausgeloggt unverändert.**
Der Satz im Kasten nennt nur, was in der Tabelle ohnehin steht – keine Verknappung.

### K2 – Liga-Seite als Knotenpunkt (`app/api/leagues/[id]/route.js`, `app/ligen/[id]/page.js`)
API liefert zusätzlich `schedule` (die nächsten 3 Partien, die letzten 3 Ergebnisse, Gesamtzahl).
Die Seite beantwortet jetzt drei Fragen nacheinander – wo stehen wir (Tabelle), wann wieder
(Spielplan; ohne anstehende Partie treten die letzten Ergebnisse an dieselbe Stelle), wer trifft
(Top 3 dieser Liga, eigene Anfrage). Jeder Abschnitt trägt seinen Weg in die Tiefe an derselben
Stelle rechts oben („Alle 8 Spiele", „Ganze Bestenliste"). Spielzeilen im Paarungs-Layout
(Datum oben, beide Mannschaften untereinander), damit auf 390 px keine Vereinsnamen zerfallen.
`components/layout/PageHeader.js` bekam dafür einen **optionalen** `back={{href,label}}` –
Detailseiten hatten bisher keinen Rückweg außer der Browser-Taste.

### K1 – Spielseite (`app/api/match/[id]/route.js`, `app/match/[id]/page.js`)
Liga-Zeile über der Anzeigetafel ist jetzt ein Link zur Tabelle. Unter dem Box-Score genau **zwei**
Wege: „Wo stehen wir jetzt" (Tabelle) und „Nächstes Spiel" – die API liefert dafür `nextMatch`
(nächste angesetzte Partie einer der beiden Mannschaften). Bewusst nur zwei: der Knotenpunkt ist
die Liga-Seite, nicht diese.

**Belegbilder:** `tmp/liga-achse/vorher/` und `tmp/liga-achse/nachher/`, je 390 px und 1280 px
(Skript `tmp/liga-achse-shots.mjs`, echtes Chromium). Zählbarer Unterschied an Links im `<main>`:
`/ligen/[id]` 4 → 11 · `/match/[id]` 8 → 10 · `/spiele?league=…` Parameter wirkungslos → wirksam ·
`/topscorer` bleibt global → springt eingeloggt auf `?league=…`.

**Verhaltensprobe** (`tmp/liga-achse-verhalten.mjs`, 390 px): ausgeloggt kein Platzierungs-Kasten
und keine Liga-Vorauswahl · Direktlink `/topscorer?league=…` trägt · Zurück-Taste führt zur
Liga-Seite, nicht in die Filter-Historie · eigene Zeile markiert (Max: global Platz 1, **in seiner
Liga Platz 9** – genau der Fall aus R5) · keine Überbreite auf 390 px · **keine Konsolenfehler**.

**Nebenbefund behoben:** `scripts/seed-demo.mjs` setzte `League.teams`, aber nie `Team.leagueId`.
Deshalb blieb lokal die Liga-Karte auf `/team/team-detail` leer (Ronjas Seed-Artefakt) und die
„meine Liga"-Vorauswahl war überhaupt nicht testbar. Die laufende Dev-DB wurde **additiv**
nachgezogen (`tmp/liga-rueckverweis.mjs`, kein `--purge`, weil parallel andere Agenten auf
derselben Dev-DB arbeiten).

**Offen / bewusst nicht getan:** kein `npm run build` (fremder Dev-Server auf Port 3000), kein
Deploy, kein Push – **Gates Kai/Tobias stehen noch aus**. `CLAUDE.md` Abschnitt 0 bewusst nicht
angefasst: Am selben Tag liefen drei Arbeitsstränge parallel (Tour, Benachrichtigungen,
Liga-Achse); die Verdichtung gehört in eine Hand. Nicht angefasst, weil fremdes Revier: `K10`
(Auto-Follow beim Beitritt), `components/layout/Navbar.js`/`PlayerNav.js` (`K8`, `/rangliste` in
die Navigation), `lib/analyticsSummary.js`. **Nicht geprüft:** Ligen mit Playoffs (die Dev-DB hat
keine), Verhalten bei sehr vielen Ligen im Filter, echtes Low-End-Android.

---

## 13.08.2026 – `/tryouts`: aus einer geschlossenen Tür werden vier Wege (Vivien)

**Auftrag:** Ronjas Befund `docs/RETENTION-BEFUND-2026-08-13.md`, **R2** mit den Kontaktpunkten
**K5** und **K9**. Gemessen dort: `/tryouts` hatte im Leerzustand **null Links im `<main>`**.
Das ist die Seite von **Zielgruppe 3** (`docs/ZIELGRUPPEN.md`: Vereinslose, „wer zweimal nichts
findet, kommt nicht wieder"), und bei 1 externem Team ist der Leerzustand laut Mats' H4 auf
Monate der **Normalfall**, nicht die Ausnahme.

### Die Entscheidung vor der Gestaltung

Nicht „ein Link unter die leere Liste", sondern eine andere Frage. Wer hier ankommt, will keine
Probetrainings sehen – er will **einen Verein finden**. Tryouts sind ein Weg dorthin, nicht das
Ziel. Die Seite zeigt deshalb im Leerzustand die anderen Wege, jeden mit echten Daten:

| | Weg | Datenquelle |
|---|---|---|
| **01** | Vereine in deiner Nähe, direkt anfragbar über die Vereinsseite | `/api/team/fetchteams`, ohne Ort nach Profil-Bundesland vorsortiert, auf Wunsch nach Entfernung (`lib/geo.js`) |
| **02** | Transfermarkt – der Rückweg, den es bisher nur in eine Richtung gab (**K9**) | `/api/team/recruiting-list` für die echte Zahl |
| **03** | Von Vereinen gefunden werden: „als verfügbar eintragen" | `/api/player/update-transfer` |
| **04** | Probetraining ausschreiben – nur für Team-Admins und Ausgeloggte | – |

Neue Komponente **`components/tryouts/WegeZumVerein.js`** in drei Dichten: `leer` (große
typografische Fläche, ersetzt den `EmptyState`), `anhang` („Kein passendes dabei?" unter der
gefüllten Liste – dort fehlte der Rückweg genauso) und `fehler` (eigene Überschrift, weil
„Kein passendes dabei?" nach einem Ladefehler gelogen wäre).

### Drei Entscheidungen, die Ehrlichkeit kosten statt sie zu sparen

- **Keine Demo-Vereine in Route 01.** Die Karte fordert zum Anfragen auf; ein Beispielverein kann
  nicht antworten. Auf `/teams` und `/transfermarkt` stehen sie weiter (mit Abzeichen) – das ist
  eine Übersicht, das hier eine Handlungsaufforderung. Auf Prod heißt das: statt 70 Vereinen
  stehen dort die **echten**, und die Pionier-Rahmung trägt den Rest.
- **Fehlgeschlagene Anfragen werden als Fehler geführt, nicht als „nichts da".** „Aktuell sucht
  kein Verein" wäre bei einem Netzwerkfehler eine falsche Tatsachenbehauptung.
- **Der 1-MB-Städtedatensatz lädt erst auf Anforderung.** Ohne Ort sortiert ein reiner
  String-Vergleich nach Bundesland; `loadCities()` läuft erst, wenn jemand die Umkreis-Sortierung
  öffnet. Sonst zahlt jeder Handy-Besucher 1 MB für eine Sortierung, die er nicht wollte.

### Zwei Altlasten, die dabei auffielen

- **Spaltenbreite:** `main` war `max-w-3xl`, der `PageHeader` darüber `max-w-5xl` – auf 1280 px
  begann „TRYOUTS" **128 px weiter links** als der Inhalt darunter. Unter einer typografischen
  Fläche ist das ein sichtbarer Bruch. Jetzt gleiche Außenkante wie der Kopf (und wie
  `/transfermarkt`, `/teams`, `/spieler`), Lesespalte links darin verankert.
- **Zeilenlänge:** Auf 1280 px liefen die Absätze über **100 Zeichen**. Alle Fließtexte jetzt
  `max-w-prose`; nachgemessen 42–47 Zeichen. Die Vereinsliste bleibt volle Breite – sie ist
  Daten, kein Fließtext.

### Nebenbefund am eigenen Belegbild

Mit der echten Persona (`sven.adler@test.de`, Profil-Bundesland **Sachsen**) stand über einer
Liste aus Hamburg, München, Köln und Berlin die Zeile „ZUERST AUS SACHSEN" – eine Überschrift,
die ihr eigener Inhalt widerlegt. Der Hinweis nennt das Bundesland jetzt nur noch, wenn dort auch
wirklich ein Verein steht.

### `/tryouts/[id]` – zwei Ausgänge statt keinem

Wer ein Probetraining öffnete und sich dagegen entschied, hatte keinen Weg zurück: Die Seite
kannte weder ihre Liste noch den Transfermarkt. Jetzt zwei ruhige Zeilen unter der Karte,
gedämpft – „Jetzt bewerben" bleibt die einzige betonte Handlung.

### Belege

`tmp/tryouts-wege/` (Skript `tmp/tryouts-wege-shots.mjs`, echtes Chromium), je **390 px und
1280 px**, **leer und gefüllt**, ein- und ausgeloggt. Zählbarer Unterschied an Links im `<main>`:

| | vorher | nachher (eingeloggt / ausgeloggt) |
|---|---|---|
| `/tryouts` leer | **0** | **7 / 8** |
| `/tryouts` gefüllt | 3 (nur die Tryout-Karten) | **10 / 11** |

Keine Überbreite auf 390 px. Kontrast programmatisch gegen den **tatsächlichen** Hintergrund
gerechnet: **kein Textknoten unter WCAG AA**. Fehlerzustand durch absichtlich falsche API-URL
provoziert und geprüft, danach zurückgesetzt.

Commits: `b95bf2a` (Komponente), `4374d2b` (Seite + Spaltenbreite), `b528748` (Detailseite),
`df2b5ee` (Zeilenlänge), `da4f503` (Sortier-Hinweis).

### Bewusst nicht gebaut, nicht geprüft

- **Das „benachrichtige mich"-Opt-in aus R2 fehlt** – bewusst. Es bittet den Nutzer zu *warten*;
  echte Vereine, die er heute anschreiben kann, sind die stärkere Antwort. Dazu: Mail lokal nicht
  testbar (kein SMTP in der Dev-`.env`), und der Versandpfad liegt im Revier des parallel
  laufenden Benachrichtigungs-Strangs. **Empfehlung: als eigenes Paket, nach R1.**
- **Kein `npm run build`** (fremder Dev-Server auf Port 3000), kein Deploy, kein Push –
  **Gates Kai/Tobias stehen aus.**
- **`CLAUDE.md` Abschnitt 0 nicht angefasst**: vier Arbeitsstränge parallel, die Verdichtung
  gehört in eine Hand (gleiche Begründung wie beim Liga-Strang).
- **Konventionen geprüft, kein Handlungsbedarf:** „Tryouts" existiert bereits als Feedback-Chip
  (`app/feedback/page.js`) und als Analytics-Eimer (`lib/analyticsSummary.js` Zeile 59); es
  entstand kein neuer Bereich und keine neue Route.
- **Texte gehen an Nele** zum Zielgruppen-Check (Register nach `ZIELGRUPPEN.md` Z3, Ton an
  Schritt 5 der Tour angeglichen).
- **Nicht geprüft:** `prefers-reduced-motion` nur über die Primitive (`Reveal`/`useInView` haben
  saubere Rückfallwege), nicht eigens emuliert; echtes Low-End-Android; Verhalten bei vielen
  echten Vereinen in Route 01 (Dev-DB hat vier).

---

## 13.08.2026 – Das Spielerprofil: Liga-Verweis in der Historie + nächstes Spiel (K6/K7)

**Auftrag:** Ronjas Kontaktpunkte **K6** und **K7** aus `docs/RETENTION-BEFUND-2026-08-13.md`.
Das Profil ist die meistbesuchte Seitenart und der Ort, an dem die Kernpositionierung sichtbar
wird – es beantwortete aber nur, was **war**.

### K6 – die Karriere-Historie verliert die Liga nicht mehr

Eine Station verlinkte den **Verein**; die Zeile daneben („Regionalliga Süd · 2025/26") war
reiner Text. Damit fehlte der Klick von „da habe ich gespielt" zur **Tabelle dieser Saison**.

- `app/api/player/stations/route.js`: neues Feld **`leagueLinkId`**. Getrennt von `leagueId`,
  weil `leagueId` bei reinen Zugehörigkeiten (Verein ohne gespielte Liga-Partie) bewusst `null`
  bleibt – die Liga des Vereins wird dort aber angezeigt und soll deshalb auch verlinkt sein.
  `stationKey` bleibt unberührt.
- `components/player/PlayerProfileView.js`: Liga-Zeile wird zum Link auf `/ligen/[id]`, mit
  `stopPropagation`, damit der Klick **nicht** zusätzlich die Station aufklappt. Unterstreichung
  in `navy-500` als Ruhezustand – auf dem Handy gibt es kein Hover, das eine Verlinkung verrät.
  **Freundschaftsspiele haben keine Liga und bleiben Text.**
- Geschützte Leerzeichen um den Trenner: auf 390 px bricht die Zeile jetzt als
  „Regionalliga / Süd · 2025/26" statt mit einem hängenden „·" am Zeilenende.

⚠️ **Diese Änderung liegt versehentlich in Commit `83fb70b`** („Chronik: /tryouts-Umbau
protokolliert"). Ursache: Alle Nacht-Agenten teilen **einen** Arbeitsbaum; die Dateien lagen
kurz im Index (`git apply --cached`), als der Tryouts-Strang committete. Inhaltlich korrekt,
aber **nicht einzeln rückholbar**. Nicht nachträglich umgeschrieben, weil andere Stränge darauf
aufbauen. **Lehre: Staging und Commit immer in einem einzigen Befehl.**

### K7 – das Profil zeigt das nächste Spiel

Ronja nennt es „den konkretesten Wiederkehr-Anker, den ein Spieler hat". Neu:

- **`app/api/player/next-match/route.js`** (`POST`, öffentlich): nächste `scheduled`-Partie mit
  `date >= now` des Vereins, dem der Spieler aktuell angehört. Vereinslos → `nextMatch: null`,
  kein Fehler. Muster `connectDB()` → prüfen → `ok()/fail()` in `withErrorHandling`.
- Karte oben im Stats-Tab: **wann, gegen wen, wo** – die Fläche ist ein Link auf `/match/[id]`
  (129 px hohes Ziel). Sie trägt als **einzige** Fläche dieser Seite die
  2px-`brand-500`-Anzeigetafel-Leiste (Signatur „aktives Spiel",
  `docs/VISUELLE-RICHTUNG-2026-08-12.md`).
- **Kein nächstes Spiel → gar nichts.** Kein Kasten „Keine Ansetzung".
- **Formuliert ist der Verein, nicht der Spieler:** „Heimspiel gegen Munich Hoops", nicht „sein
  nächstes Spiel". Angesetzt ist die Partie der **Mannschaft**; ob dieser Spieler aufläuft, weiß
  die Datenbank nicht. Genau das Muster aus `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`.
- „in 3 Tagen" rechnet in **Kalendertagen**, nicht in 24-Stunden-Blöcken.
- Eigener `useEffect` statt des vorhandenen `Promise.all`: Fällt die Ansetzung aus, erscheinen die
  Karriere-Zahlen trotzdem.

Commit: `8ffcd15`.

### Belegbilder (echtes Chromium, Dev-Server Port 3000, Dev-DB `hoopsgermany`)

390 px **und** 1280 px, jeweils geprüft:

| Fall | Beleg |
|---|---|
| Verein **mit** Ansetzung (`max-mustermann-1`, eingeloggt `/player/player-detail`) | Karte steht, Liga-Verweis rechts, Link führt auf `/match/…954` bzw. `…953` |
| **Vereinslos** (`sven-adler`) | keine Karte, keine leere Zeile – Seite beginnt mit „Karriere-Bilanz" |
| **Verein ohne Ansetzung** | über eine abgefangene XHR-Antwort (`nextMatch: null`) erzwungen, **ohne die Dev-DB anzufassen**: Karte fehlt, kein doppelter Abstand |
| **Nur eine Station** (`paul-koch-7`) | ein Liga-Verweis, Tabelle korrekt |
| **Mehrere Stationen + Vorsaison** (`max-mustermann-1`) | zwei Verweise; `2024/25` landet auf der **Archiv-Tabelle** mit Rhein Ballers |
| **Station ohne Liga** | „Freundschaftsspiele" bleibt Text |

Interaktion nachgemessen statt vermutet: Klick auf den Liga-Link klappt die Station **nicht** auf
(Zeilenzahl 3 → 3), Klick auf die Zeile daneben klappt weiterhin auf (3 → 4).
Keine Konsolenfehler; kein Nachlade-Kreisel (`next-match`-Aufrufe im Ruhezustand: 0).
API-Randfälle geprüft: unbekannte ID → `nextMatch: null`, fehlende/ungültige ID → 400.

### Bewusst nicht gebaut, nicht geprüft

- **Kein `npm run build`** (fremder Dev-Server auf Port 3000), kein Deploy, kein Push –
  **Gates Kai/Tobias stehen aus.**
- **`CLAUDE.md` Abschnitt 0 nicht angefasst** – vier Stränge parallel, die Verdichtung gehört in
  eine Hand.
- **Konventionen geprüft, kein Handlungsbedarf:** „Spielerprofile" existiert bereits als
  Feedback-Chip; es entstand **keine neue Route** und kein neuer Analytics-Bereich.
- **Nicht geprüft:** `prefers-reduced-motion` (die Karte animiert nichts), echtes Low-End-Android,
  Verhalten bei einem Verein mit sehr vielen Ansetzungen (Dev-DB hat je eine).

---

## 13.08.2026 — Orientierung: die Rangliste wird erreichbar, /team/admin sagt was ansteht

**Auftrag:** Ronjas Retention-Befund `docs/RETENTION-BEFUND-2026-08-13.md`, Posten **R7/K8**
(`/rangliste` gebaut und aus keiner Navigationsliste erreichbar) und **R3** (Team-Admin sieht beim
Wiedereinstieg nicht, was zu tun ist). Ausdrückliche Vorgabe: Navigation ist Weglassen, nicht
Hinzufügen — ein achter Punkt in der Leiste wäre die falsche Antwort.

### 1. „Bestenlisten" statt eines achten Navigationspunktes — Commit `003b5b9`

**Befund, nachgemessen:** In das gesamte Projekt führte genau **ein** Link auf `/rangliste`
(`components/feed/TopTeamsWidget.js` Z. 140, Seitenspalte des eingeloggten Feeds). 257 Zeilen
fertiges Produkt, für einen ausgeloggten Besucher unauffindbar.

- **Topscorer (Spieler) und Rangliste (Teams) teilen sich einen Navigationspunkt** namens
  **„Bestenlisten"** (`components/layout/Navbar.js`, `components/layout/PlayerNav.js`). Der Punkt
  ist auf **beiden** Routen aktiv (`auchAktivAuf`). Gleich viele Punkte wie vorher, eine
  erreichbare Seite mehr.
- **Umschalter „Spieler | Teams"** auf beiden Seiten: neue Bausteine
  **`components/ui/LinkTabs.js`** (optisch identisch mit `components/ui/Tabs`, aber als echte
  `<Link>` — teilbar, in neuem Tab zu öffnen, für Suchmaschinen sichtbar) und
  **`components/layout/BestenlistenWechsel.js`**. Eingebaut in `app/topscorer/page.js` (auch im
  Suspense-Fallback) und `app/rangliste/page.js`; deren Eyebrow lautet jetzt einheitlich
  „Bestenliste".
- **Mobil-Menü mit Gruppentiteln** (Wettbewerb / Wer spielt / Wechseln / Mein Bereich bzw. Konto)
  in Navbar und PlayerNav. Eine senkrechte Liste kann sich Überschriften leisten; aus einer Wand
  aus sieben Zeilen werden vier kurze Listen. Titelfarbe `mist-600` auf `navy-950` = 4,93:1
  (Wert aus `tailwind.config.js`, ausreichend für Labels dieser Größe).
- **`/installieren`** stand nur im Footer. Neu im **Konto-Bereich** des eingeloggten Mobil-Menüs
  (bewusst nicht in der Inhaltsleiste) und mit **eigenem Bereichs-Eimer „App-Installation"** in
  `lib/analyticsSummary.js` — vorher fiel die Seite unter „Sonstiges".

**Wirkung auf die Messung:** Der Eimer „Rangliste" (`lib/analyticsSummary.js` Z. 58) war
strukturell auf nahe null festgenagelt. Ronjas Warnung zu Mats' **H2** — „ein ‚H2 widerlegt‘ auf
dieser Datenbasis wäre ein Fehlschluss" — ist damit für den Navigations-Teil ausgeräumt; die
beiden anderen Verzerrungen (ObjectId-Profilaufrufe, interner Verkehr) bestehen weiter.

### 2. „Zu erledigen" auf `/team/admin` — Commit `c16a3cb`

Neu: **`lib/useTeamAufgaben.js`** (Berechnung + Hook) und **`components/team/AufgabenLeiste.js`**,
eingebunden in `app/team/admin/page.js`. **Keine API-Änderung** — die Zahlen kommen aus denselben
zwei Endpunkten, die die Tabs ohnehin nutzen (`/api/team/matches/list`,
`/api/team/fetchjoinrequests`) plus `rosterSlots` aus dem bereits geladenen Team.

- Leiste **über** der Tab-Leiste, auf der einen hervorgehobenen Karte mit
  2px-`brand-500`-Oberkante (Signatur aus `docs/VISUELLE-RICHTUNG-2026-08-12.md`).
- Posten sind **anklickbar** und springen in den zuständigen Tab; die Zählstände werden beim
  Tabwechsel aufgefrischt (nachgemessen: 2 → 1 nach dem Ablehnen einer Anfrage).
- **Zähler-Abzeichen an den Reitern**, nur bei > 0, in `signal-wait` mit dunkler Schrift. Weil eine
  nackte Zahl am Reiter mehrdeutig wäre, sagt der Vorlesetext sie aus
  („Ergebnisse, 3 offene Aufgaben").
- **Der Fall „nichts zu tun" ist ein eigener, ausgesprochener Zustand** („Alles erledigt — hier
  wartet gerade nichts auf dich"), kein Verschwinden der Fläche.
- In **beiden** Zuständen darunter das **nächste Spiel** (Datum + Gegner) bzw. der Weg zum
  Spielplan, wenn keins eingetragen ist.
- Ladephase zeigt einen **Platzhalter gleicher Höhe** (keine springende Tab-Leiste); bei einem
  Fehler verschwindet die Leiste kommentarlos, statt eine Zahl zu behaupten.

**Definitionen — jede Zahl zählt, was ihre Beschriftung sagt**
(`docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`):

| Posten | Zählt genau |
|---|---|
| Beitrittsanfragen | offene Anfragen; der Endpunkt liefert nur `teamJoinRequest`-Träger, erledigte sind gar nicht dabei |
| Platz freigeben | `rosterSlots[].status === "pending"` (wartet auf „Genehmigen") |
| Widerspruch klären | `resultStatus === "mismatch"` |
| Ergebnis fehlt | Spiel vorbei, nicht abgesagt, **eigene** Meldung fehlt **und** `resultStatus !== "confirmed"` — die zweite Bedingung schützt vor dem Super-Admin-Nachtrag, bei dem das Ergebnis dasteht, aber ohne Meldung des Teams |
| Box-Score fehlt | Ergebnis steht, Spielerwerte des eigenen Teams fehlen. **Überschneidungsfrei** zu „Ergebnis fehlt". Eine 0/0/0-Zeile gilt als „nicht eingetragen" — dieselbe Regel wie in `lib/statsNotify.js` |

Künftige Spiele zählen **nie** mit. Ein Co-Admin sieht nur Posten zu Tabs, die er auch öffnen darf.

**Anschluss an R1 (Commit `c4dd91d`, dieselbe Nacht):** Fehlen Box-Scores, steht darunter, warum
sich die Eingabe lohnt — „eure Spieler mit Konto bekommen ihre Zahlen dann als Benachrichtigung".
**Bewusst keine Zahl:** Die dafür nötige Angabe `Match.notifiedStatsPlayers` liefert
`/api/team/matches/list` nicht, und jeder Ersatzwert hätte etwas anderes gemeint als das, was der
Spieler sieht (Karriere-Statistik zählt über `status: "completed"`, nicht über `resultStatus`).

### Belegbilder (echtes Chromium, Dev-Server Port 3000, Dev-DB `hoopsgermany`)

390 px **und** 1280 px, jeweils ohne Konsolenfehler; Bilder unter `tmp/orientierung-shots/` und
`tmp/admin-aufgaben-shots/`:

| Fall | Beleg |
|---|---|
| Öffentliche Navigation, ausgeloggt | Mobil-Menü mit vier Gruppentiteln; „Bestenlisten" auf `/rangliste` aktiv markiert |
| Umschalter | Klick „Spieler" auf `/rangliste` führt auf `/topscorer`, Umschalter dort aktiv auf „Spieler" |
| Eingeloggte Navigation | PlayerNav-Menü mit Gruppen + „App installieren" im Konto-Bereich |
| **Offene Aufgaben** (`max@test.de`) | drei Posten (2 Beitrittsanfragen · 1 Platz freigeben · 1 Ergebnis fehlt), drei Reiter-Abzeichen |
| **Nichts zu tun** (`elias.hoffmann5@test.de`) | „Alles erledigt" + nächstes Spiel, **kein** Abzeichen an einem Reiter |
| **Box-Score fehlt** (`finn.klein9@test.de`) | „4 Box-Scores fehlen" + Benachrichtigungs-Satz |

Der Zustand für das erste Bild wurde **additiv und umkehrbar** angelegt
(`tmp/admin-aufgaben-zustand.mjs`, mit `--weg` zurückgenommen) — **nicht** neu geseedet, weil drei
Agenten parallel auf derselben Dev-DB arbeiteten. Die Zustände „nichts zu tun" und „Box-Score
fehlt" existierten in den Demo-Daten bereits echt.

### Bewusst nicht gebaut, nicht geprüft

- **Kein `npm run build`** (fremder Dev-Server auf Port 3000), kein Deploy, kein Push —
  **Gates Kai/Tobias stehen aus.**
- **`CLAUDE.md` Abschnitt 0 nicht angefasst** — mehrere Stränge parallel, Verdichtung in eine Hand.
- **Konventionen geprüft, kein Handlungsbedarf beim Feedback-Formular:** „Ligen & Tabellen" und
  „Teams & Kader" decken beide Bereiche ab; es entstand **keine neue Route**.
- **Offen geblieben, bewusst:** `PlayerNav` führt weiterhin **nicht** zu Transfermarkt und Tryouts —
  ein eingeloggter Spieler erreicht beide nur über die öffentliche Navbar oder den Footer. Das ist
  ein eigener Befund, kein Teil von R7/K8.
- **Nicht geprüft:** echtes Low-End-Android, Tastaturbedienung des Umschalters mit Screenreader,
  Verhalten eines Co-Admins mit eingeschränkten Rechten (nur im Code abgesichert, nicht im Browser
  durchgespielt), Prod-Daten.

### Nachtrag am selben Tag: die eingeloggte Sackgasse — Commit folgt unten

Beim Nachsehen zu R7/K8 fiel ein dritter Fall derselben Sorte auf, diesmal schwerer:

**Nachgemessen:** `app/player/newsfeed/page.js`, `app/post/[id]/page.js` und
`app/feed/tag/[tag]/page.js` rendern **keinen Footer**. Zusammen mit einer `PlayerNav`, die weder
Transfermarkt noch Tryouts führte, hatte ein eingeloggter Spieler **auf seiner Startseite nach dem
Login null Wege** zu beiden Seiten — er musste erst eine öffentliche Seite ansteuern, um überhaupt
an die Navbar zu kommen, die sie führt. Betroffen war ausgerechnet Ronjas Persona „Sven" (Z3,
Vereinslose) — und damit auch der in derselben Nacht umgebaute Leerzustand von `/tryouts`
(Commits `b95bf2a`, `4374d2b`, von null auf sieben Wege), der so für eingeloggte Nutzer praktisch
unerreichbar blieb.

Gelöst nach demselben Prinzip wie „Bestenlisten" — **Punktzahl unverändert**:

- Neue Gruppe **„Wechseln"** im Mobil-Menü der `PlayerNav` mit **beiden** Zeilen (Transfermarkt,
  Tryouts) — identisch zur öffentlichen Navbar. Auf dem Handy kostet eine Zeile nichts.
- In der **waagerechten Leiste** steht **Transfermarkt** statt **„Mein Profil"**. Letzteres war
  doppelt: direkt daneben steht dasselbe Ziel als Bild-und-Name-Verknüpfung (größeres Ziel,
  eindeutiger) — die trägt jetzt auch die `aria-current`-Markierung. `/tryouts` ist von
  `/transfermarkt` aus prominent verlinkt (und seit `4374d2b` auch zurück), bleibt also einen Klick
  entfernt.
- Sieben Punkte vorher, sieben Punkte nachher; zwei erreichbare Seiten mehr.

**Beleg** (`sven.adler@test.de`, 390 px und 1280 px, keine Konsolenfehler,
`tmp/orientierung-shots/*-5-*`, `*-6-*`): Vom Newsfeed führt der Mobil-Menü-Punkt „Tryouts" auf
`/tryouts`, der Desktop-Punkt „Transfermarkt" auf `/transfermarkt`.

**Bewusst nicht angefasst:** die öffentliche Navbar. Dort stehen Transfermarkt und Tryouts weiter
getrennt — sie muss weder Newsfeed noch Profil tragen und hat den Platz. Die beiden Leisten
unterscheiden sich also an dieser einen Stelle; das ist gewollt, nicht vergessen.

## 13.08.2026 – Feedback-Zugang: aus der schwebenden Ebene ins Sticky-Chrome (Vivien)

**Anlass:** Der schwebende `FeedbackButton` wurde in der Nacht auf den 13.08. von **drei
unabhängigen Prüfern** als Inhalts-Verdeckung gemeldet (Liga-Achse: Ecke dichter Tabellen ·
Spielerprofil: ø-Wert der Historie auf 390 px · Tobias' Deploy-Gate, gemessen: „Abmelden" im
offenen Mobil-Menü, Pfeil der 4. Vereinszeile auf `/tryouts`, REB-Wert von Elias Hoffmann im
Box-Score). Dreimal vertagt; Auftrag war die **Wurzel-Lösung**, ausdrücklich keine weitere
Routen-Ausnahme in `OHNE_KNOPF`.

**Entscheidung:** Die Form war das Problem, nicht die Routen. Eine fixierte Ebene über dem Inhalt
verdeckt in einem Produkt, dessen Argument Zahlen sind, zwangsläufig irgendwann eine Zahl oder
einen Bedienpunkt — jede Ausnahmeliste vertagt nur die nächste Meldung. Der Zugang sitzt jetzt
**fest im Sticky-Chrome** statt darüber:

- **Neu `components/layout/FeedbackLink.js`** (ein Baustein, zwei Formen): `variant="icon"` =
  Sprechblasen-Symbol in `brand-400` (einziges Farbsignal der Leiste, gleiche Sprache wie der
  Team-Admin-Punkt, aktiv auf `/feedback` markiert) · `variant="row"` = Zeile „Feedback geben"
  mit eigenem Gruppentitel **„Testphase"** im Muster der Mobil-Menüs (Bogen zum Banner).
- **Eingebaut in alle drei Leisten:** `Navbar` (Symbol vor der Suche + Menü-Zeile), `PlayerNav`
  (Symbol vor der Glocke + Menü-Zeile), `TeamNav` (Symbol vor Abmelden). Damit trägt auch
  `/team/admin` den Zugang.
- **Entfernt:** `components/FeedbackButton.js` samt Einbindung im Root-Layout — inklusive der
  gesamten Scroll-Versteck-Logik und der `OHNE_KNOPF`-Ausnahmeliste (ersatzlos überflüssig:
  reservierte Fläche braucht keine Ausnahmen).
- **Sichtbarkeits-Bilanz (warum das ein Ersatz ist, kein Verlust):** Das Chrome ist 100 % der
  Scrollzeit sichtbar — der alte Knopf versteckte sich beim Runterscrollen, also während des
  Lesens. Das Wort „Feedback geben" tragen weiterhin Testphase-Banner (oben auf jeder Seite),
  die neue Menü-Zeile und der Footer. Tastatur/Vorlesen: natürliche Lesereihenfolge der
  Navigation statt fixiertes Element am Baumende; kein Motion nötig, `prefers-reduced-motion`
  damit trivial erfüllt.
- **Beifang, an der Wurzel behoben:** Beide Mobil-Menüs sind Teil der Sticky-Leiste — war das
  Menü höher als der Viewport, waren seine unteren Zeilen per Seiten-Scroll **nie erreichbar**
  (sticky scrollt nicht mit; eingeloggt betraf das auf kleinen Displays „Abmelden" selbst).
  Beide Menüs scrollen jetzt selbst (`max-h-[calc(100dvh-4rem)] overflow-y-auto
  overscroll-contain`).

**Beleg** (`tmp/feedback-knopf-messen.mjs` + `tmp/feedback-menue-erreichbar.mjs`, Ablage
`tmp/feedback-shots/vorher|nachher/`, Dev-Server, `max@test.de`): Vorher trifft
`document.elementFromPoint` an allen drei gemeldeten Stellen den Knopf (Abmelden-Zeile bei
überlappender Geometrie · Pfeilmitte der 4. Vereinszeile · rechte Hälfte der REB-Zelle, Überlapp
23×41 px). Nachher trifft dieselbe Probe Abmelden-Zeile, Vereinszeile und Zelle; kein fixiertes
Element mit `aria-label="Feedback geben"` existiert mehr; die Menü-Zeile ist bei 390×640 per
Menü-Scroll erreichbar und führt auf `/feedback` (Navbar UND PlayerNav); Desktop 1280 px geprüft.
**Nicht geprüft:** echtes Gerät (nur Playwright/Chromium), Screenreader-Ansage, die beiden
zuerst gemeldeten Stellen (Liga-Tabellen-Ecke, ø-Wert Spielerhistorie) nur implizit — das
verdeckende Element existiert nicht mehr, einzeln nachgemessen wurden sie nicht.

**Prozess:** Trend-Sweep Stufe S (Begründung im `referenz-register.md` der Skill
`design-trend-recherche`), `emil-design-eng` geladen (Chrome-Element, ständig sichtbar → bewusst
ohne Motion). AGENTS.md-Beschreibung des Buttons nachgezogen.

---

## 13.08.2026 — Newsfeed-Umbau: „Was ist passiert, seit ich weg war?" (Vivien)

**Auftrag Patrick:** „Die Newsfeed Seite könnte meiner Meinung nach auch ein moderneres Design &
Architektur besitzen." Umgesetzt in vier Commits (`9244492` distDir-Werkzeug · `9c5d0a7`
Checkliste · `67e373f` Composer · `446317c` Seiten-Umbau), Entscheidungs-Notiz inkl. bewusster
Auslassungen: **`docs/NEWSFEED-UMBAU-2026-08-13.md`**, Sweep-Notiz (Stufe M):
`docs/INSPIRATION-NEWSFEED-2026-08-13.md`.

- **Neue Spieltag-Leiste** (`components/feed/SpieltagStrip.js`): nächstes Spiel + letztes
  Ergebnis des eigenen Teams am Seitenkopf, Beleg-Status (`matchVerification`) direkt daneben,
  Links auf `/match/[id]`. Ohne Team/Spiele erscheint sie nicht. Ronjas R3 auf den Spieler
  übertragen — Verbindung zu Gebautem, keine neue Funktion.
- **Kopf mit h1** (Tobias L5) + Anrede-Eyebrow + Datum in Mono; **Footer mit
  Impressum/Datenschutz** (Tobias L4, rechtlich relevant — einzige Seite ohne Verweis);
  `<main>`-Landmarke jetzt auch mobil.
- **Mobil Feed nach vorn:** alle Widgets eingeklappt, Composer startet einzeilig
  (`PostComposer` `collapsible`, Funktionshinweise erst bei Fokus), Vorschläge als Akkordeon
  mit ehrlichem Leertext. Feed-Beginn gemessen 1858 px → 1360 px (390 px, max@test.de).
- **Checkliste ehrlich** (Tobias L3 = Fall aus `MUSTER-ZAHLEN-DIE-LUEGEN`): „X von 4
  **Schritten** erledigt", Bonus-Zeile unter eigener Trennzeile „zählt nicht zum Fortschritt";
  dazu Panel-Sprache (navy-800 + Haarlinie + 2px-Markenkante), Big Shoulders, Emoji raus.
- **Architektur:** Feed-Logik nach `components/feed/PostFeed.js` ausgelagert; `my-matches`
  EINMAL in der Seite geladen und an Leiste + Spiele-Widget gereicht (`TeamMatchesWidget`
  `preloaded`-Props, stand-alone lädt es weiter selbst); Desktop-Vorschläge in die rechte Spalte.
- **Dev-Werkzeug:** `distDir` per `NEXT_DIST_DIR` umlenkbar (Standard `.next` unverändert) —
  löst die dokumentierte Kollisionsklasse dev/build/start um `.next`.

**Beleg** (`tmp/newsfeed-umbau-shots.mjs` + `tmp/newsfeed-verhalten.mjs`, Ablage
`tmp/newsfeed-shots/`, Dev-Server `:3005`, Vorher/Nachher per `git stash`; Konten max + sven,
390×844 + 1280×900): h1/Footer/Landmarke vorher fehlend, nachher da; kein Überlauf, keine
Konsolenfehler; Spieltag-Leiste bei Max (Klick navigiert), bei Sven korrekt abwesend; Widget
öffnet ohne Zweitabruf; Composer fokussiert nach Aufklappen.

**⚠️ Für das nächste Gate:** Auf Port 3000 hängt ein nicht mehr funktionsfähiger, nicht
beendbarer `next start` (Classifier sperrte `taskkill`); `.next` enthält gemischte Artefakte —
**vor `npm run build` den Prozess beenden und `.next` löschen.** Build/Playwright-Suite/
Production-Runtime bewusst den Deploy-Gates überlassen. Offen gemeldet: `AuthShell.js`
verlinkt Impressum/Datenschutz mit Backslash-Hrefs (`href="\datenschutz"`) — Befund an den
Strang von heute.

---

## 14.08.2026 — Linas erster Einsatz + Gate-Nacharbeit: Entdeckbarkeit, ausgeloggte Tour, Klickflächen

Zwei Commits (`7510a79` Umsetzung · `582d59d` Nacharbeit nach Kai + Tobias). Grundlage:
**`docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md`** (Lina Vogt, erster Einsatz überhaupt) und
Neles Wortlaute. Beide fanden dieselbe Fehlerklasse wie am Vortag — Aussagen, die im Sinne
des Codes stimmen und im Sinne des Lesers falsch sind (`docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`).

### Produktivdatenbank (angewiesen von Patrick)
- **`hoops_prod`:** Internes Testkonto (`isInternal: true`) trug `birthdate: "2025-04-25"` —
  laufendes Jahr statt Geburtsjahr, daraus korrekt `age: 1`. Auf einer Plattform ab 16 stand
  damit öffentlich „1 Jahre". **`age` + `birthdate` entfernt statt ein Jahr zu raten**
  (Geburtsdatum ist kein Pflichtfeld). Trockenlauf, dann `matched: 1 / modified: 1`; danach
  0 unplausible Altersangaben. Ursache war bereits geschlossen (16er-Prüfung seit 13.08.,
  Konto vom 26.06.). Skripte: `tmp/prod-alter-pruefen.mjs`, `tmp/prod-alter-korrigieren.mjs`.

### Tour-Texte (Nele)
- **Schritt 1 war der teuerste Fall:** „Zahlen, die beide Seiten bestätigen" / „muss ein Verein
  deinen Statistiken nicht glauben". Doppelt bestätigt ist aber das **Ergebnis** (beidseitiges
  `submittedBy`), nicht der Box-Score — den trägt **ein** Team-Admin ein. `lib/statsNotify.js`
  formuliert das seit jeher korrekt, `components/onboarding/WelcomeTour.js` tat es nicht.
  Neu: „Beide melden. Dann zählt es." + Schlusssatz nur noch über das, was `beidseitigBelegt`
  prüft. Am Code gegengeprüft, Befund bestätigt.
- Schritt 3 „Einmal antippen genügt" (vorher „Ein Tipp" = Ratschlag statt Antippen), Schritt 4
  „In welcher Stadt spielst du?" + Richtung gedreht („damit **du** findest", nicht „damit dich
  Teams finden" — Nachfrage-Seite existiert noch nicht). Weg-Hinweise in
  `components/onboarding/TourSteps.js` entzerrt (waren fast wortgleich).

### Plattform-Tour ohne Konto (Befund Lina, Defekt)
Über den Footer-Link (`components/onboarding/TourLink.js` → Event `hg:open-tour`) ist die Tour
**ausgeloggt** erreichbar und damit die einzige Fläche, die vor der Registrierung erklärt.
- `speichern()` in `TourSteps.js` gab bei fehlendem Token dasselbe `false` wie bei einem
  Netzwerkfehler → „Konnte gerade nicht gespeichert werden" über einen Versuch, den es nie gab.
  **Jetzt drei Ausgänge:** `SPEICHERN_OK` / `_FEHLER` / `_ANONYM`; alle drei Schritte von
  `fehler`-Boolean auf `stand` umgestellt, neue Komponente `Hinweis` (kein Haken, kein Alarm).
  ⚠️ Ohne eigenen anonym-Zweig wäre der Fix ein Rückschritt gewesen — die Erfolgsquittung
  „Steht in deinem Profil" hätte dann jemand ohne Profil gelesen.
- Schlussfolie sagte „Du hast schon angefangen" über „0 von 4 · 0 %". Neu: `schlussfolie()` in
  `WelcomeTour.js` (0 / 1–3 / 4 von 4 / ohne Konto), Titel und Zahl aus **derselben** Quelle
  (`computeSteps`). `StepUebergabe` rendert ausgeloggt `null` (kein Fortschritt gegen einen
  Spieler, den es nicht gibt).
- Beide Ausgänge führten in die Anmeldemaske. Neu: „Konto erstellen" → `/signup`; Zweitausgang
  „Erst mal umsehen" über `zielOhneKonto()` — ⚠️ für `weg === "admin"` auf `/teams` umgebogen,
  weil `/team/create` einen Login verlangt.
- Analytics: `tour_completed`/`tour_skipped` kennzeichnen ausgeloggte Durchläufe (`ohne_konto`),
  sonst mischten sich Erstbesucher und frisch Registrierte in einer Quote.

### „Mein Profil" im Onboarding demonstrieren (Auftrag Patrick)
„Mein Profil" steht nicht mehr in der waagerechten Leiste, nur der Avatar führt hin.
- Quittung nach dem Positions-Tipp (`TourSteps.js`) nennt den Ort **und zeigt die Form**:
  neue Komponente `AvatarZitat` (dieselben Maße/Farben wie `PlayerNav`). Bewusst **kein**
  Coach-Mark — neue Overlay-Mechanik für einen Satz, kurz nachdem eine schwebende Ebene
  abgeschafft wurde.
- ⚠️ Nele korrigierte „über **dein Bild** oben rechts": Der typische Leser hat noch kein Foto
  und sieht einen Initialenkreis. Der Text nennt nur den Ort, die Form zeigt das Zitat.
- ⚠️ Tobias maß nach: `PlayerNav` wird **pro Seite** eingebunden, nicht im Layout — auf
  öffentlichen Seiten steht dort ein Textlink (Desktop) bzw. nichts (mobil). Gelöst über den
  Marker **`data-profil-avatar`** in `components/layout/PlayerNav.js`; die Quittung prüft zur
  Laufzeit und fällt sonst auf „Steht in deinem Profil." zurück. Bewusst kein Pfad-Abgleich —
  eine Liste veraltet still bei der nächsten neuen Seite.

### Leerzustände (Lina P1 / Nele)
- **`GLOCKE_LEER` in `lib/notifications.js`** — ein String für beide Glocken
  (`NotificationBell.js` + die eigene Umsetzung in `Navbar.js`; sie waren bereits
  auseinandergelaufen). „Noch nichts. Sobald deine Zahlen aus einem Spiel **eingetragen** sind,
  stehen sie hier." ⚠️ Bewusst „eingetragen", nicht „bestätigt": `notifyOwnStats` versendet auch
  bei einseitiger Meldung.
- **`app/topscorer/page.js`**: zweiter Satz über die Benachrichtigung. ⚠️ Nele korrigierte Linas
  Entwurf „sobald dein Team ein Ergebnis einträgt" — `notifyOwnStats` verlangt zusätzlich einen
  erfassten Wert **für diesen Spieler**.
- **`components/onboarding/OnboardingChecklist.js`**: Ertrag statt Wiederholung. ⚠️ „**Erst mit
  Team** stehen …", nicht „danach steht …" — `SpieltagStrip` hat zwei Bedingungen (Team UND Spiel).

### Restpunkte aus den Gates vom 13.08. + Suche
- **Klickflächen** (WCAG 2.5.8): Feedback, Lupe, Glocke **und** Hamburger der öffentlichen Navbar
  auf 36 px (`p-2 -m-1`). Der Hamburger war der letzte 20×20-Knopf — und der einzige Zugang zur
  mobilen Navigation; gefunden von Tobias am Gerät, nicht vom Test.
  ⚠️ Der Glocken-Zähler hängt jetzt an einem inneren `relative span`, sonst wäre er durch das
  Padding 8 px nach außen gerutscht.
- **Such-Overlay** (`Navbar.js`): Escape schließt, Klick auf den Grund schließt (mit
  `e.target === e.currentTarget`, sonst schließt jeder Klick ins Feld), `role="dialog"`/
  `aria-modal`, Platzhalter nennt **Ligen** (mitdurchsucht seit 13.08., Beschriftung verschwieg es).
- 🐞 **Echter Bugfix:** `onSearchChange` verwarf Eingaben, solange `searchData` noch nicht geladen
  war, und filterte danach nie nach → „Keine Ergebnisse" über etwas, das existiert. Logik nach
  `trefferBerechnen()` gezogen + Nachfilter-Effekt.
- **`app/api/admin/setteamadmin/route.js`** ruft `recordTransfer()`. Damit rufen **alle acht**
  Wechselwege aus `lib/rosterSlots.js` es auf (von Kai gegengeprüft). Vorher fehlte im Lebenslauf
  ausgerechnet die Station, die ein Super-Admin vergeben hat.
- `deletePlayer` → `slotsFreigeben` stand als offen in der Übergabe, war aber bereits erledigt.

### Gate-Nacharbeit (`582d59d`) — beide Gates „kein Blocker", neun Befunde berechtigt
- **Kais A1 war ein selbst eingebauter Regress:** Beim Umbau `fehler` (initial `!fehler` = wahr)
  → `stand` (initial `null`) verloren drei Bedingungen ihren Startzustand. Ein längst verfügbarer
  Spieler las „Als verfügbar eintragen"; vorbelegte Position/Stadt verloren ihre
  Bestätigungszeile (A6). Behoben über `stand === null` = „kommt aus dem Profil".
- **A7:** Der Nachfilter-Bugfix hatte keinen Test → jetzt einer, der die drei Abrufe verzögert
  und sofort tippt.
- **A4:** Kommentar behauptete, `-m-1` nehme den Padding-Zuwachs komplett zurück — falsch
  gerechnet (p-2 = 8 px, -m-1 = 4 px). `-m-1` bleibt (Hausmuster von `NotificationBell`), der
  Kommentar sagt jetzt die Wahrheit.
- **A8** (Abbruchkurve trennte „ohne Konto" nicht), **A12** (Escape kopierte den Rumpf von
  `closeSearch` statt es aufzurufen), Tobias' Umbruch des Avatar-Zitats auf 390 px
  (`whitespace-nowrap`) und das stille Abwählen der Position.

### Tests
Neu: **`tests/e2e/navbar-suche.spec.mjs`** (Auswege, Ligen, Nachfiltern, Trefferflächen) und
**`tests/e2e/tour-ohne-konto.spec.mjs`** (drei Wege ausgeloggt, Beleg-Aussage, `data-profil-avatar`).
⚠️ Der Trefferflächen-Test misst **alle** beschrifteten Icon-Ziele der Leiste, nicht eine
Namensliste — genau daran war der Hamburger vorbeigerutscht.
⚠️ `tour-ohne-konto` greift den Dialog über `[aria-labelledby="tour-titel"]`, **nicht** über
seinen Text: Der zugängliche Name wechselt mit jedem Schritt.

**Gates:** `38 passed / 0 skipped`, `npm run build` sauber, Production-Runtime (`npm start`) auf
fünf Seiten HTTP 200. **Kai** (Quelltext, `security-review` 0 Befunde ≥ Konfidenz 8) und
**Tobias** (Browser, mobil zuerst, 0 Konsolen-/Netzwerkfehler) je „kein Blocker".

**Backoffice:** Hanna hat Lina als **Agentin** nachgetragen (vorher nur als Skill),
`coordinatesWith` → Ronja/Vivien/Nele/Nora.

**Offen an Patrick:** `recordTransfer` legt einen **öffentlichen Feed-Post** an und
benachrichtigt alle Follower — `/admin/players` ist aber auch ein Korrekturwerkzeug (eine
Umhängung und ihre Rücknahme erzeugen zwei nicht löschbare Posts). Stiller Modus?
**Offen an Nele:** `GLOCKE_LEER` ist der Leerzustand *aller* Typen, spricht aber nur über eigene
Spielwerte. **Offen (vorbestehend):** optimistisches `onWert` vor dem Speichern kann die
Schlussfolie bei API-Fehlern zu positiv zählen; das Such-Overlay sagt `aria-modal` zu, hat aber
keine Fokusfalle und gibt den Fokus nicht zurück.

---

## 14.08.2026 (Teil 2) — Admin-Korrekturen posten nicht mehr, Rechtsverweise vollständig, „ab 16" begründet

Vier Commits (`6d7a9a6` · `3fa822e` · `9f9fb77`, dazu die Doku-Commits). Beteiligt: **Nora**
(`docs/RECHT-MINDESTALTER-2026-08-14.md`), **Nele** (Wortlaute), **Kai** und **Tobias** (Gates).

### Produktentscheidung Patrick: `recordTransfer` mit stillem Modus
Kais Gate-Befund A2. `recordTransfer` schrieb zwei Dinge, die zusammenfielen: die **Station im
Lebenslauf** (`TransferEvent`) und die **Neuigkeit** (`autoPostTransfer` + Follower-Benachrichtigung).
- Neu: `recordTransfer({ still: true })` schreibt nur die Station. Gesetzt **ausschließlich** in
  `app/api/admin/setteamadmin/route.js` – dort korrigiert ein Super-Admin eine falsche Zuordnung,
  es wechselt niemand. Ein Post wäre eine Nachricht über ein Ereignis, das nie stattfand, und
  weder Post noch Benachrichtigung sind löschbar (die Rückkorrektur erzeugte einen zweiten).
- **Bewusst nicht global**: Für die sieben echten Wechselwege ist der Auto-Post gewollt. Die
  Asymmetrie gab den Ausschlag – ein fehlender Post ist harmlos, ein falscher nicht rücknehmbar.
- `tests/e2e/transfer-still.spec.mjs`. ⚠️ Der **zweite** Test ist der wichtigere: Er prüft, dass die
  echten Wege **laut bleiben**. Würde jemand `still: true` aus Vorsicht überall ergänzen,
  verschwände der Transfer aus dem Feed, ohne dass ein Test rot wird – „kein Post" wirft keinen
  Fehler.
- **Von Tobias am Produkt belegt:** Admin-Korrektur → TransferEvents 9→10, Posts **25→25**,
  Benachrichtigungen **9→9**, Station im Karriere-Verlauf sichtbar. Gegenprobe echter Beitritt →
  Posts **25→26**, drei Follower benachrichtigt.

### Noras Pflichtpunkt: Rechtsverweise fehlten auf zwei von drei Registrierungswegen
`/signup` verwies über `AuthShell` auf Datenschutz und Impressum. `/team/join/[token]` und
`/team/claim/[token]` legen genauso Konten an, bringen aber eine **eigene Hülle** mit – ohne
`AuthShell`, ohne `Footer`, und `Footer` steht nicht im Wurzel-Layout. Dort fehlte der Verweis
vollständig (Art. 13 DSGVO, § 5 DDG).
- Behoben als **`components/layout/RechtsLinks.js`**, nicht als dreifach kopierter Block.
- `tests/e2e/rechtsverweise.spec.mjs` (von Nora empfohlen, Muster der `playerregister`-Prüfung):
  **war erst rot** und benannte genau die zwei Seiten. ⚠️ Die Hüllen-Prüfung ist zweistufig, seit
  `AuthShell` die Links über `RechtsLinks` bezieht – einstufig hätte sie `/signup` fälschlich
  gemeldet.
- Im Browser auf allen drei Wegen belegt, auch im Fehlerzustand „Einladung ungültig".

### Noras Einordnung zum Mindestalter (Frage seit 13.08. offen)
**Die Selbstauskunft ist richtig und darf nicht zur Einwilligung umgebaut werden.** Art. 8 DSGVO
greift nur bei Einwilligung; die Datenschutzerklärung nennt aber Vertrag (lit. b). Und „Ich bin
mindestens 16" ist eine **Tatsachenangabe, keine Willenserklärung** – man widerruft sein Alter
nicht. Art. 28 DSA stützt zusätzlich die Entscheidung gegen ein Pflicht-Geburtsdatum.
Offen beim Anwalt (im ohnehin geplanten Termin): §§ 107, 108 BGB – Wirksamkeit des
unentgeltlichen Nutzungsvertrags mit einem 16-Jährigen; dazu F4-a bis F4-c.

### Neles Texte: die Regel steht jetzt vor dem Formular
Linas P2. Gemessen hatte sie: `/about`, `/datenschutz` und die Startseite nannten die Grenze nicht.
- **`app/signup/page.js`** `subtitle`, **`app/about/page.js`** Absatz „Was wir bieten", dazu eine
  Zeile über dem Häkchen auf **beiden Einladungsseiten** (die haben keine Unterzeile – und laut
  Nora treffen ausgerechnet sie ab September am ehesten auf einen 15-Jährigen, weil ein Team-Admin
  seinen U18-Kader einlädt).
- Der genannte Grund ist geprüft: `fetchsingleplayerinfo` verlangt keinen Token, `/spieler` und
  `/topscorer` sind ungeschützt → „auch ohne Konto".
- ⚠️ **Neles vierter Baustein war nicht bestellt und ist der wichtigste**: „Bitte bestätige, dass du
  mindestens 16 Jahre alt bist" ist an jemanden gerichtet, der ein Häkchen **vergessen** hat. Einem
  14-Jährigen sagt der Satz „setz das Häkchen", nicht „du darfst hier nicht" – der Weg des
  geringsten Widerstands ist die Falschangabe, bei genau der Person, die die Regel ausschließen
  soll. Neu: „Hoops Germany ist ab 16 Jahren. Wenn du mindestens 16 bist, setz bitte das Häkchen."
  Von Nora geprüft und als Verbesserung bestätigt.
- ⚠️ Noras Hinweis beim Gegenlesen: Es sind **sechs** Strings, nicht drei – der Google-Weg spricht
  die Regel dreimal eigenständig aus. Alle sechs liegen jetzt als `MINDESTALTER_HINWEIS(_GOOGLE)`
  in `lib/constants.js`. Der **Häkchen-Text selbst** bleibt unverändert.

### Kais Gate-Befunde
- **A4 (Sicherheit, vorbestehend, reproduziert):** `positionLabel` griff ungeschützt in die
  Prototyp-Kette. `position` ist ein freier String ohne Allowlist – `position: "__proto__"` gab
  `Object.prototype` zurück, also ein Objekt statt eines Strings. Über 30 Stellen rendern den Wert
  direkt als React-Kind, darunter `/spieler` und `/transfermarkt`: **Ein einziges Konto hätte diese
  öffentlichen Seiten für alle Besucher zerlegt.** Jetzt `hasOwnProperty`.
- **A1 (er hat gemessen, wo ich geraten hatte):** Das 400-Zeichen-Fenster in
  `transfer-still.spec.mjs` ist heute schon zu kurz – der Aufruf in `app/api/team/create/route.js`
  misst **416** Zeichen. Jetzt Klammerzählung, jeder Aufruf je Datei, `lib` mitgescannt, absolut ab
  `PROJECT_ROOT`.
- **A2:** Die Fehlermeldung von Test 2 hätte den nächsten Leser dazu gebracht, ein berechtigtes
  `still` zu **entfernen** statt die Liste zu ergänzen. Test 3 heißt jetzt, was er tut (er vergleicht
  Zeichenpositionen, nicht den Kontrollfluss).
- **A3:** Die Fokusfalle kopierte das `WelcomeTour`-Muster nur zur Hälfte – ohne `tabIndex={-1}` am
  Panel landet ein Klick auf eine tote Stelle auf `<body>`, dann greift keine Kantenprüfung mehr.
- **A5:** Ein kyrillisches о und к in einem Kommentar („Fокusfalle") – `grep` findet ihn nicht.

### Tobias' Auflage B1 – und ein Test, der zuerst falsch grün war
Er gab B1 als **nicht behoben** zurück: `Gespeichert` war ein **Flex-Container**, damit wurde jedes
Kind ein eigenes Flex-Item – auch der `<span>` mitten im Satz. Zwei Flex-Items teilen sich
grundsätzlich keine Zeilenbox, `whitespace-nowrap` konnte nicht wirken. Auf 390 px klaffte ein
Loch von 169 px mitten im Satz; auf 1280 px passte zufällig alles in eine Zeile.
`Gespeichert` rendert jetzt im Textfluss.
⚠️ **Der erste Test dazu war falsch grün**: Er maß den Schluss-Span allein – darin sitzt der Avatar
auch im kaputten Zustand sauber, die Lücke klafft davor. Erst die Gegenprobe (Flex wiederhergestellt
→ Test trotzdem grün) hat das aufgedeckt. Jetzt beide Richtungen belegt: mit Fix grün, ohne Fix rot
(„Lücke 148 px").
Dazu **B3**: Das mobile Menü ignorierte Escape, während das Such-Overlay daneben sauber schließt;
der Hamburger trug dauerhaft „Menü öffnen" ohne `aria-expanded`/`aria-controls`.

**Gates:** `48 passed / 0 skipped`, Lint 0 Fehler, Build sauber, `npm start` auf sieben Seiten 200.
Kai: kein Blocker (aber ein berechtigter Methodik-Blocker, s. u.). Tobias: freigabefähig, 0
Konsolen-/Netzwerkfehler über 19 Routen in 390 px und 1280 px.

⚠️ **Methodik-Lehre (Kais Blocker B1):** Während Tobias gegen `next dev` prüfte, wurde im selben
Arbeitsbaum weitergebaut – sein Browser sah damit Code, der nicht im geprüften Commit war. **Vor
einem Browser-Gate den Baum sauber machen und während des Gates nicht am Produktcode arbeiten.**

**Offen an andere:** B2 (Nele/Lina – ausgeloggt sagt Tour-Schritt 3 „es steht sofort in deinem
Profil", wer kein Konto hat, hat keins) · B4 (Vivien – Position steht auf der Kaderkarte doppelt) ·
B5 (Ronja – Suche öffnen springt an den Seitenanfang, Hintergrund scrollt trotz `aria-modal`) ·
Kais Frage an Patrick: stille In-App-Notiz an den umgehängten Spieler selbst? · `migrate-positions.mjs`
auf Prod? · Nele: „X hat Y verlassen" behauptet eine Handlung des Spielers, auch wenn ein Admin ihn
entfernt hat.

---

## 14.08.2026 (Teil 3) — Stille Notiz an den Umgehängten, gemeinsame Symbol-Tabelle, Rechteentzug

Vier Commits (`7604578` · `4cbd88b` · `2503433`, dazu Doku). Zwei Gate-Runden mit **Kai** und
**Tobias**; Wortlaute von **Nele**.

### Produktentscheidung Patrick: der Betroffene erfährt es
Folge der Stilllegung aus Teil 2 (Kais Befund): Seit `recordTransfer({ still: true })` erzeugt der
Verwaltungspfad keinen Post und keine Follower-Meldung mehr – und weil `recordTransfer` nie den
Spieler selbst benachrichtigt hat, war ausgerechnet der Betroffene die einzige Person, die von
einer Änderung an seinem eigenen Profil nichts erfährt.
- **Neuer Typ `team_assigned`** (`models/Player.js`, `NOTIF_ICON`, `notificationHref`), ausgelöst in
  `app/api/admin/setteamadmin/route.js` über `benachrichtigeZuordnung`. Nur In-App, keine Mail.
- ⚠️ **Nur bei einer ECHTEN Zuordnungsänderung.** Bloße Rechtevergabe fürs selbe Team löst nichts
  aus – sonst meldete die Plattform ein Ereignis, das nicht stattgefunden hat. Von Tobias dreifach
  am Produkt belegt (0 → 0).
- **Wortlaut (Nele):** „Dein Profil ist jetzt {Team} zugeordnet – {vorher}. Eingetragen hat das die
  Verwaltung von Hoops Germany. Wenn das nicht stimmt, schreib uns über das Kontaktformular."
  Zustand statt Vorgang („ist zugeordnet", kein Subjekt „du"); „zugeordnet" statt „im Kader", weil
  der Code `Player.teamId` setzt und Roster-Slots eine andere Sache sind; Urheber benannt **ohne**
  Grund zu behaupten (nicht „korrigiert" – das behauptete, was vorher der Fall war). Der Rückweg
  ist das Einzige, was die Nachricht handlungsfähig macht: Anders als bei `own_stats` gibt es
  nichts anzuklicken.
- Neles Bonus: `transferMessage` Fall `leave` heißt jetzt „X **steht nicht mehr im Kader von** Y."
  „hat verlassen" behauptete eine Handlung des Spielers, auch wenn ein Admin ihn entfernt hat.

### Kais zwei Blocker
- **Meine Ausnahmeliste war eine Ausrede.** Sechs Typen hatte ich mit „sehen nur Admins in eigenen
  Oberflächen" von der Symbolpflicht ausgenommen. Widerlegt: `getnotifications` filtert überhaupt
  nicht nach Typ, und `set-member-admin` schiebt `team_admin_granted` an ein **normales
  Kadermitglied**. Der Test zertifizierte sechs echte Lücken – und die Gegenprobe war wertlos, weil
  der geprüfte Typ nicht in der Liste stand. **Liste gelöscht, Symbole ergänzt.**
- **Der Commit protokollierte etwas als behoben, das es nicht war.** `TransferFeedWidget.js` baut
  den Satz selbst und sagte weiter „hat X verlassen" – auf `/player/newsfeed`, zweimal gerendert.

### Gemeinsame Symbol-Tabelle (Kai A3 + Tobias, unabhängig)
Die zweite Glocke in `components/layout/Navbar.js` hatte **gar keine** Zuordnung und rendete für
jeden Typ hart einen Basketball. Die Drei-Stellen-Regel aus `CLAUDE.md` erfasste sie nicht, und kein
Test konnte es merken. **`NOTIF_ICON` liegt jetzt in `lib/notifications.js`**, beide Glocken ziehen
daraus, `tests/e2e/benachrichtigungs-typen.spec.mjs` hält es fest.
⚠️ Der Test prüft die **Indizierung** (`NOTIF_ICON[n.type]`), nicht den Namen – ein
`includes("NOTIF_ICON")` wäre schon durch die Importzeile erfüllt gewesen.

### Rechteentzug (Befund Tobias, „mittel")
`setteamadmin` überschrieb `Team.adminPlayerId`, ließ beim bisherigen Gründer aber
`isTeamAdmin`/`teamAdminOf` stehen. Da die Dual-Auth über `teamAdminOf` läuft, behielt er vollen
Zugriff auf `/team/admin`, obwohl das Team längst auf jemand anderen zeigte.
- Entzug jetzt in `setteamadmin` **und** – als Nachzug (Kai A3 der zweiten Runde) – in
  `app/api/admin/transfer-team-admin/route.js`, das dieselbe Operation ohne den
  `teamAdminOf`-Wächter machte.
- ⚠️ **Nur der bisherige `adminPlayerId`, nicht die Co-Admins.** Kais Begründung ist die bessere:
  `set-member-admin` verlangt `isMainAdmin` – die Rücknahme liegt damit beim neuen Haupt-Admin, und
  der verdrängte Gründer kann sie nicht mehr auslösen.

### Ein Test-Muster, das dreimal danebenlag
Der Avatar-Layout-Test war sporadisch rot. Timeout erhöht, leichtere Seite gewählt, Übergangs-Pause
ergänzt – **keine der drei Maßnahmen half, eine verschlimmerte es.** Die Ursache war kein Timing,
sondern ein unbekannter Ausgangszustand: Die Tour startet für Konten mit `welcomeSeen: false` von
selbst; liegt ihr Overlay über der Seite, ist der Footer-Knopf verdeckt und der Klick läuft in
einen Timeout, obwohl das Ziel erreicht ist. Ob der Test grün war, hing daran, ob ein früherer Test
das Flag gesetzt hatte. **Lösung: `mark-welcome-seen` vor dem Laden.** Vier volle Läufe: 54/54.
⚠️ Zweite Lehre aus derselben Datei: Meine Leerzeichen-Probe für die relative Schwelle **maß
nichts** – in einem `<p>` kollabiert ein einzelnes Leerzeichen, Breite 0, Fallback greift, Schwelle
still wieder konstant. `whiteSpace = "pre"` macht sie messbar (belegt: 3 px statt geraten 4).

### Weitere Gate-Befunde eingearbeitet
`positionLabel` mit `hasOwnProperty` (`position: "__proto__"` gab `Object.prototype` zurück und
hätte `/spieler` und `/transfermarkt` für alle Besucher zerlegt) · Klammerzählung fürs Enum-Parsing
· Wächter gegen leere Typenliste in der Quelle statt je Test · `/kontakt`-Test in
`rechtsverweise.spec.mjs`, weil die neue Nachricht darauf verweist.

**Gates:** `54 passed / 0 skipped` (viermal in Folge), Lint 0 Fehler, Build sauber, `npm start` auf
sechs Seiten 200. Kai: freigegeben. Tobias: freigabefähig, 0 Konsolen-/Netzwerkfehler.

⚠️ **Zwei Umgebungs-Lehren:** (1) `preview_stop` löst den Dev-Server nur aus der Verwaltung, beendet
ihn aber nicht – PID 53664 hielt Port 3000 im Zustand `ABHÖREN` weiter (Tobias hat es gemeldet,
bewusst nicht selbst beendet). Vor jedem Build `curl http://localhost:3000`. (2) Während ein
Browser-Gate läuft, darf im selben Arbeitsbaum nicht weitergebaut werden.

**Offen an Patrick:** Der verdrängte Gründer erfährt vom Rechteentzug nichts – dasselbe Argument,
das `team_assigned` hervorgebracht hat, eine Ebene höher. `team_admin_granted` existiert, ein
Gegenstück für den Entzug nicht. Neu erreichbar, weil er die Rechte vorher behielt.
**Offen an Nele:** Die Notiz sagt „Kontaktformular", der Footer-Link heißt „Kontakt".

---

## 14.08.2026 (Teil 4) — Notiz an den verdrängten Team-Admin

Zwei Commits (`93b0fc4` · `551ab46`). Wortlaute **Nele**, zwei Gate-Runden mit **Kai** und **Tobias**.

### Produktentscheidung Patrick
Folge aus Teil 3: Seit der Rechteentzug greift, verliert der bisherige Gründer `isTeamAdmin` und
`teamAdminOf` – und hätte es erst gemerkt, wenn `/team/admin` ihn abweist (Befund Kai). Dasselbe
Argument, das `team_assigned` hervorgebracht hat, eine Ebene höher.
- **Neuer Typ `team_admin_revoked`**, Symbol `PiShieldSlashBold`, ausgelöst über die gemeinsame
  **`lib/notifyTeamAdminRevoked.js`** an **drei** Stellen: `setteamadmin` (Setzen **und**
  `remove`-Zweig) sowie `transfer-team-admin`.
- ⚠️ `notificationHref` führt bewusst **NICHT** auf `/team/admin` – genau die Abweisung dort ist der
  Zustand, den die Nachricht ersetzt; ein Klick in die Absage machte die Notiz zur Ankündigung einer
  Kränkung (Nele). Ziel ist die Vereinsseite, wo der genannte Nachfolger bestätigt wird.
- ⚠️ Nur bei **tatsächlichem** Entzug (`modifiedCount > 0`). Kai hat belegt, warum das exakt das
  richtige Kriterium ist: `lib/serverAuth.js` hört auf `teamAdminOf`, nicht auf `adminPlayerId` –
  damit gilt `teamAdminOf` entfernt ⟺ Zugriff entzogen ⟺ `modifiedCount > 0`.

### Wortlaut (Nele) – zwei Fassungen, weil es zwei Sachverhalte sind
Mit Nachfolger: „Die Verwaltung von {Team} liegt jetzt bei {Vorname Nachname} – die Admin-Rechte für
den Verein hast du damit nicht mehr, **Mitglied von {Team} bleibst du**. Eingetragen hat das die
Verwaltung von Hoops Germany; wenn das nicht stimmt, schreib uns über „Kontakt"."
Ohne Nachfolger (`remove`-Zweig): „Die Admin-Rechte für {Team} hast du nicht mehr – Mitglied von
{Team} bleibst du. …" – „jemand anderem" wäre dort falsch, es rückt niemand nach.
- **Der Name des Nachfolgers IST der Rückweg** – das unterscheidet den Fall von `team_assigned`:
  Dort gab es keine zweite Adresse, hier eine Person im selben Verein, die die Rücknahme auslösen
  kann. Ein Formular stattdessen machte eine vereinsinterne Sache zu einem Fall für uns.
- ⚠️ „Mitglied von {Team} bleibst du" steht im **selben Satz** – „Rauswurf" ist die
  wahrscheinlichste Fehllesart, und die entkräftet man nicht in Satz zwei.
- „schreib uns" bleibt als **zweite** Spur: `setteamadmin` kann jemanden zum Haupt-Admin machen, der
  vorher kein Mitglied war – dann ist der genannte Name womöglich ein Fremder.
- Dazu Neles Angleichung (Hinweis Kai): „Kontaktformular" → **„Kontakt"**, auch im bestehenden
  `team_assigned`-Text. Footer-Eintrag und `h1` heißen so; wer ein Wort genannt bekommt und es nicht
  wörtlich findet, hat so viel wie keinen Hinweis.

### Der Typen-Test hat sich bewährt
`team_admin_revoked` zuerst **nur** ins Enum aufgenommen → der Test meldete sofort beide fehlenden
Stellen („Typen ohne Symbol", „Typen ohne eigenes Ziel"). Genau wofür Kai ihn eingefordert hatte.

### Gate-Nacharbeit (`551ab46`)
- **Kai 7:** In `transfer-team-admin` ging die Notiz **vor** `newAdmin.save()` raus. Scheitert der
  Save, wäre der Entzug vollzogen und die Nachricht nennte einen Nachfolger, der nie einer wurde.
  Jetzt danach.
- **Tobias:** Der **`remove`-Zweig** von `setteamadmin` entzieht ebenfalls Rechte und **meldete
  nichts** – dieselbe Lücke, die derselbe Commit eine Ebene weiter gerade geschlossen hatte. Ihm
  außerhalb seines Auftrags aufgefallen.
- **Kai 4:** Der Namensausfall auf „jemand anderem" passierte **lautlos** (`firstName`/`lastName`
  sind nicht `required`, der Google-Weg legt Leerstrings an). Jetzt `console.warn`.
- ⚠️ **Kai 1–3, die Zeichenfenster zum vierten Mal:** In **derselben** Testdatei standen noch drei
  Formen desselben Fehlers – ein `{0,200}`-Fenster, eine `indexOf("};")`-Grenze und die neue
  Klammerzählung **ohne Sicherung**. Die `indexOf`-Grenze war die unangenehmste: Ihr Ausfall geht in
  die **falsche** Richtung, weil `slice(ab, -1)` den Rest der Datei nimmt und der Test dadurch
  **großzügiger** wird statt strenger. Alle vier Abgrenzungen laufen jetzt über **eine**
  Helferfunktion `blockAb`, die wirft statt still etwas Falsches zu liefern.
- Neuer Test (von Kai und Tobias unabhängig vorgeschlagen): Die Zusage „keine Notiz, wenn nichts
  entzogen wurde" hängt allein an `modifiedCount > 0` – und **eine ausbleibende Notiz wirft keinen
  Fehler**.

**Gates:** `57 passed / 0 skipped`, Lint 0 Fehler, Build sauber, `npm start` 200. Tobias hat am
Produkt belegt: genau eine Notiz beim Verdrängten, Symbol-Pfad stimmt mit `PiShieldSlashBold`
überein, Klickziel Vereinsseite, `/team/admin` weist ab, Kader führt ihn weiter; Gegenprobe (Verein
ohne Haupt-Admin) **schweigt**; Text auf 390 px in **7 Zeilen ungekürzt**, kein Scrollbalken.

⚠️ **Prozess-Lehre (Kai):** Der `security-review`-Skill wählt seine Basis selbst und diffte gegen
`main` – 4,3 MB, ~500 Dateien. Bei einem Langläufer-Branch wie `redesign` verdünnt das die Prüfung
bis zur Wirkungslosigkeit. **Immer die Commit-Basis vorgeben.**

**Offen an Patrick:** (a) Der Nachfolgername friert beim Schreiben ein – bei A→B→C hält A eine Notiz
„liegt **jetzt** bei B"; schärfer als gewöhnliches Veralten, weil der Name der Rückweg IST
(→ Nele). (b) Über `/admin/teams` bekommt der Beförderte zusätzlich `team_admin_granted`, über
`/admin/players` gar nichts. (c) `/team/admin` leitet den Verdrängten auf „TEAM GRÜNDEN" – er könnte
versehentlich einen zweiten Verein anlegen (→ Nele/Ronja).
**Offen (klein):** `teamSlug` ist eine Momentaufnahme – bei gelöschtem Verein greift der Fallback
nicht und der Klick landet auf 404; `team_invite` liefert in derselben Lage `null`. Escape schließt
die Glocke nicht.

---

## 14./15.08.2026 (Teil 5) — Alle offenen Gate-Punkte, Scroll-Sperre mit Zähler

Zwei Commits (`2903b9e` · `cabb62d`). Texte **Nele**, Kaderkarte **Vivien**, zwei Gate-Runden mit
**Kai** und **Tobias**. Damit sind alle elf offenen Punkte aus Roadmap 15 abgearbeitet.

### Viviens Fund war besser als der gemeldete Befund
Tobias hatte die doppelte Position auf der Kaderkarte als „redundant" gemeldet. Der eigentliche
Grund: In **derselben** Liste tragen die offenen Plätze an **exakt derselben Stelle rechts** ihr
Status-Abzeichen. Die Spalte wechselte mitten in einer durchlaufenden Liste ihre Bedeutung von
*Position* auf *Status* – wer sie von oben nach unten scannt, liest zwei Dinge als eines. Das
Positions-Chip entwertete die einzige Stelle, die einen Zustand anzeigt; dazu ist `brand-500` der
**eine** Akzent, und eine Spielposition ist keine Auszeichnung.
Sie hat geprüft, dass es diese Doppelung nirgends sonst gibt – `/spieler` zeigt nur das Chip
(Kachelansicht ohne Unterzeile), alle anderen Flächen nur die Unterzeile.

### Die Sackgasse nach dem Rechteentzug
Wer `/team/admin` ohne Admin-Rechte aufruft, landete **wortlos** auf `/team/create`. Seit dem
Entzug trifft das auch den verdrängten Gründer mit altem Lesezeichen – er konnte versehentlich
einen Zweitverein anlegen. Neles Hinweis erscheint nur bei `player.teamId`, sagt was fehlt und
unterstellt nichts; er muss auch für den tragen, der die Adresse neugierig eintippt.
⚠️ Beim Einbau gefangen: Der Vereinsname steht in **`player.team`** (populiert von `getmyinfo`),
nicht als `player.teamName`. Ohne die Unterscheidung hätte dort dauerhaft „deinem Team" gestanden.

### ⚠️ Kais A2: die Seite blieb dauerhaft gesperrt
Jede Overlay-Ebene merkte sich den vorherigen `body.overflow`-Wert **selbst**. Schlossen zwei in
der falschen Reihenfolge, blieb `hidden` stehen – ohne dass ein Overlay zu sehen war, nur ein
Reload half. Und die schädliche Reihenfolge ist die **wahrscheinliche**: Such-Overlay `z-[999]`,
Tour `z-[60]`, man schließt naheliegend zuerst die Suche; ein einzelner Escape-Druck erledigt
ohnehin beide, wobei die Tour ihr Schließen um 200 ms verzögert.
→ **`lib/scrollSperre.js`** mit Zähler: gesperrt beim ersten `sperreAn()`, freigegeben erst beim
letzten `sperreAus()`. Kompensiert zugleich die verschwindende Scrollleiste (Kais A7 – sonst
springt die Seite ~15 px, ausgerechnet in einer Änderung fürs Halten der Leseposition).
Tobias' **N1** im selben Zug: Das Mobil-Menü sperrte **gar nicht** (gemessen 1555 → 1855), während
die Suche daneben sperrt. Nutzt jetzt denselben Zähler.

### Kais A1: die Rücknahme konnte erfinden, was sie verhindern sollte
Gesperrt ist nur der Chip, der gerade lädt. Ein zweiter Tipp während eines langsamen Requests
erzeugte zwei Rücknahmen in der Reihenfolge ihrer Antworten – am Ende stand ein Wert, den niemand
gespeichert hat, und die Schlussfolie zählte ihn. Jetzt eine laufende Nummer je Anfrage.
**A6:** In `StepStadt` war der gemerkte Wert das halbfertige Tippfragment (`CityInput` schreibt bei
jedem Tastendruck), nicht der gespeicherte Ort. Die Rücknahme hängt jetzt an `land`.

### Weitere Gate-Befunde
- **A3:** `deleteteam` löscht alle Spiele, ließ `matchId` auf Benachrichtigungen aber stehen –
  derselbe tote Weg wie bei `teamSlug`, nur über das andere Feld.
- **A4:** Die Bedingung der Beförderungs-Notiz stimmte nur, **weil** `findByIdAndUpdate` das lokale
  Dokument zufällig nicht mutiert. Wer auf `team.save()` umstellt, schaltet sie still ab.
- **A5:** Entzugs-Notiz vor, Beförderungs-Notiz nach dem Team-Update – zwei Fassungen derselben
  Operation, wieder auseinandergelaufen. Beide jetzt danach.

### ⚠️ Zwei eigene Testfehler, dieselbe Klasse
1. Der erste Sperr-Test war **grün, auch ohne Zähler**. Er schloss die Ebenen per Klick – und das
   geht zwangsläufig von oben nach unten, weil die untere verdeckt ist; in dieser Reihenfolge
   stimmten die gemerkten Werte zufällig. Erst **Escape** legt die Aufräum-Reihenfolge offen.
2. Der Avatar-Layout-Test klickte fest auf „Point Guard" und **speicherte** die Position damit.
   Beim nächsten Lauf war sie gesetzt, derselbe Klick wählte ab, die Quittung verschwand – er
   hinterließ genau den Zustand, an dem er scheitert. Jetzt wählt er einen Chip ohne
   `aria-pressed="true"`.
**Lehre:** Ein Test, der seinen eigenen Ausgangszustand verändert, ist beim zweiten Lauf rot.
Dasselbe Muster wie der Tour-Auto-Start tags zuvor.

**Gates:** `58 passed / 0 skipped` (dreimal in Folge), Lint 0 Fehler, Build sauber, `npm start` 200.
Tobias hat alle neun browserprüfbaren Punkte am Produkt bestätigt, darunter: echter Vereinsname im
Hinweis, Escape auf beiden Glocken mit Fokusrückgabe, Leseposition 900 → 900, 0 Positions-Chips auf
der Kaderkarte, alle neuen Texte wörtlich.

⚠️ **Prozess (Kai, zum zweiten Mal):** Der `security-review`-Skill wählt seine Basis **selbst** und
nahm erneut `main` (4,3 MB), obwohl sie im Auftrag stand – er liest den Auftragstext nicht als
Vorgabe. Der Hinweis in `CLAUDE.md` erreicht ihn nicht; das muss anders gelöst werden.

**Offen:** Kais A8 (ein Escape bedient mehrere Ebenen – wer die Sperren stapelt, sollte auch die
Escape-Ebenen stapeln) · Tobias' N4 (die Profil-Oberfläche kann Positions-Kürzel nicht schreiben;
wer speichert, migriert still von „SG" auf „Shooting Guard") · Neles Frage zum Leerzustand eines
offenen Kaderplatzes ohne Position · Textreihenfolge auf `/team/create` (erst „Team gründen", dann
die Korrektur) → Vivien/Nele.

---

## 15.08.2026 – Sechste und siebte Runde: ein öffentlich abrufbarer Einladungstoken, und drei Ausreden von mir

**Commits:** `c65419d` → `48e8a16` → `074bcf1`. **Deployt:** `074bcf1`, am Server verifiziert
(`git log --oneline -1` auf dem VPS, `pm2 restart hoops-v2`, Live-Seiten je HTTP 200).
**Vorher live:** `da1abca`.

### Der Sicherheitsbefund (Kai)

`app/api/team/fetchsingleteaminfo/route.js` gab das **ganze** Slot-Subdokument heraus – also auch
`claimToken`. Die Kette:

1. Der Endpunkt ist **öffentlich**, ohne Auth – nur ein `slug` im Body.
2. `add-slot` vergibt den `claimToken` schon beim **Anlegen**, nicht beim Versenden. Jeder benannte
   offene Platz trug also einen gültigen.
3. `roster/request-claim` prüft nichts weiter als einen gültigen Spieler-Token **plus** diesen
   `claimToken` und setzt dann `teamId`, `claimedBy` und die Rückennummer.

Damit konnte sich **jedes registrierte Konto ohne Einladung in jeden Verein eintragen**, dessen
Kaderplätze offen sind. Auf `hoops_prod` nachgemessen (rein lesend, Werte nicht protokolliert):
**zwei Token waren so abrufbar.**

Behoben durch „erlauben statt verbieten" (Regel aus `docs/MUSTER-ZAHLEN-DIE-LUEGEN`): Die Antwort
wird aus **benannten Feldern neu gebaut** statt das interne Objekt zu kürzen – ein neues
Schema-Feld landet so nicht versehentlich in der Öffentlichkeit. `claimedBy` bleibt bewusst drin,
denn genau davon lebt der Filter auf der Vereinsseite; hätte der Fix es mit weggeräumt, wären
belegte Plätze doppelt und fälschlich als „Noch nicht bestätigt" erschienen (von Tobias empirisch
gegengeprüft, nicht aus dem Code geschlossen).

### Der Fix allein reichte nicht – der wichtigste Punkt dieses Tages

Kai hat nachgelesen, dass der Codefix die **bereits geleakten** Token nicht entwertet:
`send-invite-email` erneuert nur `if (!claimToken)`, rotiert also nie einen vorhandenen ·
`slotsFreigeben` filtert auf `claimedBy` und trifft unbelegte Plätze nie · `request-claim`
akzeptiert weiterhin Token + `status === "empty"`. Wer die Antwort **vor** dem Deploy einmal
abgerufen hatte, kam danach unverändert in den Kader.

Entscheidung Patrick: rotieren. Ausgeführt am 15.08. mit `tmp/prod-claimtoken-rotieren.mjs --echt`
(vorher Probelauf). Beleg **ohne einen einzigen Tokenwert auszugeben**: `add-slot` erzeugt
`randomBytes(16)` = 32 Hex-Zeichen, die Rotation `randomBytes(24)` = 48. Danach gemessen:
**0 Token mit 32 Zeichen, 2 mit 48**, Kaderplätze unverändert (2 benannt, 2 mit Nummer, 0 belegt).

⚠️ **Offene Folge:** Die bis dahin verschickten **legitimen** Einladungslinks dieser zwei Plätze
sind tot. Der Team-Admin (Mönchengladbach Scorpions e. V.) muss sie im Panel neu verschicken –
**benachrichtigt wurde er nicht** (eine Mail wäre eine Nachricht nach außen).

### Drei Begründungen von mir, die nicht nachgemessen waren

1. **Die Tabellen-Ausnahme (Kais Blocker B1).** Ich hatte `/topscorer` und `/ligen/[id]` vom
   Platzhalter ausgenommen, weil der Gedankenstrich dort „Tabellensprache in einer Spalte mit
   Kopfzeile" sei. Kai und Tobias haben **unabhängig voneinander** nachgemessen: `/topscorer` steht
   zwar in einem `<table>`, aber die Position ist keine eigene Spalte – sie ist ein `div`
   **innerhalb** der Namenszelle, zeichengleich mit `/transfermarkt`, das ich geändert hatte. Es
   gab keine Kopfzeile, auf die sich der Strich hätte beziehen können. Ausnahmeliste ersatzlos weg.
2. **„Kann nur entstehen, wenn jemand direkt in die DB schreibt"** (über Positions-Kürzel auf Prod).
   Falsch, und in der gefährlichen Richtung falsch – es klang wie eine Garantie. `update-profile`
   führte `position` nur in einer **Feld**-Weißliste, prüfte den **Wert** nie, `models/Player.js`
   hat `position: String` ohne Enum. Dass das Formular ein `select` benutzt, ist eine Aussage über
   den Browser, nicht über die API. Seit dem 15.08. gegen `ALL_ROLES` geprüft – **nur bei echter
   Änderung**, sonst wäre ein Konto mit Altwert unbedienbar (Muster der Geburtsdatum-Korrektur).
3. **„Sieben Fundstellen" (Tobias' Befund A).** `/spieler` war nie eine davon: Dort ist die Position
   ein **Chip** in `brand-500`, keine Unterzeile. Statt den Platzhalter nachzurüsten wurde die
   falsche Aussage korrigiert – ein Abzeichen „Keine Angabe" verbrauchte den EINEN Akzent für eine
   Nicht-Information. Kai trägt die Begründung ausdrücklich und benennt den Unterschied zu (1):
   Dort war die **Tatsachenprämisse** falsch, hier ist sie wahr und trägt ein Gestaltungsurteil.

### Neles Korrektur an ihrem eigenen Text – am selben Tag

`POSITION_FEHLT` hieß vormittags „Position nicht angegeben". Nele hat es nachmittags widerrufen,
und der Grund ist **inhaltlich**: Der Satz benennt das fehlende Feld als POSITION – aber dasselbe
Feld trägt auch `PLAYER_ROLES` (Coach, Manager, Sportliche Leitung, Fan). Neben einem Trainer
behauptete er, es fehle eine Spielposition. Im Sinne des Codes richtig, im Sinne des Lesers falsch:
**Der Text war selbst ein Fall des Musters, gegen das er geschrieben war.** Jetzt „Keine Angabe".

Sie hat dabei den Auslöser widerlegt, der zu der Frage geführt hatte (Tobias' N2,
Transfermarkt-Kompaktliste, 179 px): Mit echter Schrift gemessen verlieren dort **vier von fünf
Spielpositionen** das Bundesland schon heute – `Point Guard · Nordrhein-Westfalen` = 188 px. Für
den Platzhalter blieben 9 Zeichen. **Die Kachel ist zu eng, nicht der Text.** → Vivien, offen.

### Tobias N1 – ein Regress, den mein eigener Fix erzeugt hat

`/ligen/[id]` trug `truncate` auf der Unterzeile, `/topscorer` nicht. Mit dem längeren Platzhalter
sprengte die Zeile mobil den 229-px-Container und der **Verein** fiel weg (278 px gegen vorher
218 px). `truncate` entfernt. Der konkrete Auslöser ist durch Neles kürzeren Text inzwischen weg –
die **Inkonsistenz** nicht: „Sportliche Leitung" plus langer Vereinsname überläuft weiterhin, und
identischer Inhalt darf sich nicht auf zwei Seiten verschieden verhalten.

### Newsfeed-Filter (Befund Patrick)

Das Dropdown „Alle Ligen" im `TopTeamsWidget` ragte auf dem Desktop aus der Seitenspalte in die
Feed-Spalte und verdeckte Inhalt. Ein natives `<select>` bemisst seine Breite an der **längsten
`<option>`**, nicht am Container. `flex-wrap` half nicht – Umbrechen geht nur **zwischen**
Elementen, nicht innerhalb eines zu breiten; und ohne `min-w-0` darf ein Flex-Element gar nicht
unter seine Inhaltsbreite schrumpfen (`min-width: auto`). Jetzt `w-full min-w-0 flex-1 truncate`.
**Live gegengeprüft** mit dem echten Auslöser „1. Kreisliga U18 männlich – Kreis Düsseldorf
2025/26" (51 Zeichen): Feld bleibt bei 109 px, rechte Kante 279 gegen Kartenkante 413.

### Testarbeit – sechs Schwächen, alle von Kai benannt

`tests/e2e/positions-platzhalter.spec.mjs`: `lib/` wurde gar nicht durchsucht · Kommentare wurden
mitgelesen (Warnhinweise, die den alten Wortlaut **zitieren**, schlugen an – und ein Kommentar, der
`POSITION_FEHLT` nur **erwähnt**, machte die Positiv-Probe falsch grün: genau der Fall `/spieler`) ·
der Regex fand nur meine eigene Schreibweise (keine einfachen Anführungszeichen, keine
Template-Literale, keinen Ternär, keinen geschachtelten oder optionalen Aufruf) → ersetzt durch
Klammerzählung, die bei Unausgeglichenheit **wirft** · es fehlte die Gegenprobe, dass die Flächen
den Platzhalter überhaupt **zeigen** · diese Gegenprobe maß zuerst den `import` statt der
Verwendung · die Ausnahmeliste griff pro Verzeichnis.

Im **zweiten Review-Durchlauf** kam die siebte dazu: `ohneImport` filterte zeilenweise und übersah
**mehrzeilige** Importe. In `app/transfermarkt/page.js` steht `POSITION_FEHLT,` allein auf seiner
Zeile – wer beide Anzeigen löschte, kam grün durch. **Wieder dieselbe Fehlerklasse, die der
Kommentar zwei Zeilen darüber als behoben beschrieb**, und ausgerechnet in der Datei, deren
übersehene Fundstelle den Test ausgelöst hatte.

Neue Regel gegen **rohes** Rendern (Kais F-2): Alle bisherigen Prüfungen hingen an
`positionLabel(`-Aufrufstellen, ein roher Wert war unsichtbar – so sind drei Stellen durch denselben
Commit gerutscht, der die Regel festschreiben sollte. `value={form.position}` ist ausgenommen, weil
dort der **rohe** Wert stehen MUSS (Vergleich mit den `<option value>`); ein `positionLabel` davor
zerstörte die Vorauswahl. Die **Grenze der Regel steht ausdrücklich im Test**: Sie erkennt die zwei
real vorgekommenen Formen und ist kein JSX-Prüfer.

### Zwei eigene Fehler beim Gegenprüfen

1. Die erste Gegenprobe lief über `node -e`; die Shell zerlegte die einfachen Anführungszeichen,
   **fünf Patches wurden nie angewandt – und meldeten „grün"**. Seitdem als Skriptdatei
   (`tmp/gegenprobe-*.mjs`), die prüft, ob der Patch überhaupt gegriffen hat.
2. Die Gegenprobe zur Werteprüfung lief absichtlich **ohne** die Prüfung – und schrieb den
   ungültigen Wert damit echt in die Dev-DB. Der Test war beim nächsten Lauf rot, weil derselbe
   Wert nun gespeichert war und das Setzen als „unverändert" durchging. Der Test stellt seinen
   Ausgangszustand jetzt selbst her; drei Läufe hintereinander grün.

### Weiteres in `074bcf1`

`KaderTab:414` gab die Position roh aus **und** zeigte „Vereinslos" nur dann, wenn **auch** die
Position fehlte – ein Spieler mit Position und ohne Verein wurde nie als vereinslos ausgewiesen,
ausgerechnet in der Liste, in der ein Admin entscheidet, ob eine Einladung einen **Vereinswechsel**
auslöst · `add-slot` prüft `position` gegen `ALL_ROLES` (hier **ohne** Altbestands-Ausnahme: ein
Slot wird angelegt, nicht bearbeitet) · `models/Tryout.js` dokumentierte Kürzel, während
`tryouts/create` gegen `POSITIONS` filtert – ein Kürzel wäre still verworfen worden (auch in
CLAUDE.md und AGENTS.md korrigiert) · `seed-demo.mjs` schreibt kanonische Namen statt Kürzel und war
die **einzige Quelle** der Kürzel, über die zwei Tage gerätselt wurde.

### Bewusst NICHT angefasst

`TEAM_PUBLIC_FIELDS = "-password"` (`lib/serverAuth.js:10`) ist eine **Verbotsliste**. Über
`team/fetchinfo` geht damit das ganze Team-Dokument hinaus – **jeder** `rosterSlots[].claimToken`
und der `inviteToken`. `getTeamFromToken` prüft nur `isTeamAdmin`, keine Einzelrechte, und
`set-member-admin` gibt Co-Admins genau dieses Flag: Ein Co-Admin mit ausschließlich Tryout-Recht
bekommt alle Einladungstoken. **Gleiche Fehlerklasse wie der geschlossene Leak, nur auf der
angemeldeten Seite.** Nicht in dieser Runde behoben, weil `KaderTab` die Token genau von dort liest –
ein Wegfiltern bräche die Einladungsoberfläche, und das ist der Bereich, dessen Regeln dreimal
hintereinander unvollständig waren und wo zweimal der Fix das Folgeproblem erzeugte.

### Still totes Feature, an echten Daten belegt

`app/api/team/roster-players/route.js:43` filtert `status !== "empty" && !s.claimedBy`. Da `pending`
nirgends gesetzt wird (`request-claim` springt direkt auf `confirmed`, und `confirmed` impliziert
`claimedBy`), ist das Ergebnis **immer leer** – die Box-Score-Erfassung bietet nie Slot-Platzhalter
an, obwohl `Match.playerStats.rosterSlotId` genau dafür existiert. Gemessen: Dev `{confirmed: 1}`,
Prod `{empty: 2}`, Filtertreffer 0/0. Gleiche Wurzel wie die offene Frage, ob `approve-claim` toter
Code ist – **gehört als eine Entscheidung zusammen, nicht als zwei.**

---

## 15.08.2026 (Abend) – Der Newsfeed-Umbau, und ein Sicherheitsvorfall, den er nebenbei aufdeckte

**Commits:** `4f3811d` → `4f64af7`. **Nicht deployt** – beide Gates hatten `4f3811d` blockiert.
**Live blieb `074bcf1`.**

### Wie der Vorfall gefunden wurde: durch einen eigenen Fehler

Beim Prüfen des Newsfeed-Umbaus lief ein Login-Aufruf von mir gegen den noch offenen
**Live-Tab** statt gegen localhost. Er funktionierte: **`max@test.de` / `test123` auf
hoopsgermany.de**, als Team-Admin mit `teamAdminOf`. Das Passwort steht in `CLAUDE.md`.

Wer die Projektdokumentation liest, konnte sich als Vereinsverwalter anmelden – Kader ändern,
Ergebnisse eintragen, Einladungen verschicken, also in genau die Belegbarkeit hineinschreiben,
die das Produkt verkauft. Das wog schwerer als der `claimToken`-Leak vom selben Morgen: Dort
brauchte es erst einen Token aus einer API-Antwort, hier genügte eine Zeile Doku.

### Mein erster Riegel war zweimal falsch (Befund Kai A1/A2)

Ich meldete „47 Konten entwertet, der Riegel sitzt". Beides stimmte nicht.

**(1) Die Inventur war zu eng.** Ich suchte nach **Adressmustern** (`@test.de`,
`@nrw-demo.de`) und übersah dadurch die Domain **`@demo.de`** aus `seed-world.mjs` –
**345 Konten** mit `test123`, darunter rund 41 Team-Admins. Kais Ansatz findet sie sofort:
nicht nach Domains suchen, sondern die bekannten Passwörter gegen **jeden Hash** probieren.
Gemessen: **346 Konten mit bekanntem Passwort.**

**(2) Das Passwort ist gar nicht der entscheidende Weg.** Zwei Pfade lesen `password` nie:
- `app/api/auth/google/callback/route.js` matcht per `$or: [{googleId}, {email}]`, adoptiert
  ein bestehendes Konto (`if (!player.googleId) player.googleId = googleId`) und gibt ein
  30-Tage-JWT – **ohne jeden Blick auf `password`**.
- `forgotpassword` → `resetpassword`: unauthentifiziert, ohne Drosselung im ganzen Repo,
  verlangt das alte Passwort nicht.

Beide hängen an der **E-Mail-Adresse**. Und die Prüfung, die daraus folgte, war der eigentliche
Schreckmoment: **`nrw-demo.de` war NICHT REGISTRIERT** (RDAP: 404). Wer die Domain für rund
5 € kauft, besitzt die Postfächer von **30 Prod-Konten, davon 6 Team-Admins** – unabhängig vom
Passwort. `demo.de` und `test.de` sind fremdregistriert, das ist der harmlose Fall.

**Zwei Lehren:** Eine Inventur nach Namensmuster findet nur, was man ohnehin vermutet. Und
„Passwort entwertet" ist nur dann ein Riegel, wenn das Passwort der einzige Weg ist.

### Die Lösung: `.invalid` anhängen statt ersetzen

`tmp/prod-seedkonten-schliessen.mjs`. Bei **393** Seed-Konten wurde `.invalid` an die
**bestehende** Domain angehängt (`…@nrw-demo.de` → `…@nrw-demo.de.invalid`), dazu **346
Passwörter entwertet** (je Konto ein eigener bcrypt-Hash eines Zufallswerts).

RFC 2606 reserviert `.invalid` dauerhaft – die Endung ist von niemandem registrierbar. Damit
sind Google-Adoption und Passwort-Reset tot. **Anhängen statt Ersetzen** hält die Eindeutigkeit
des Index und ist jederzeit umkehrbar; der Login per Passwort funktioniert unter der neuen
Adresse weiter, weil die E-Mail dort nur ein Zeichenvergleich ist.

**Live nachgemessen:** Konten mit bekanntem Passwort **346 → 0** · Konten auf der freien Domain
**30 → 0** · Anmeldung mit den alten Adressen **401** · `forgotpassword` erzeugt **keinen**
Reset-Token (die 200-Antwort ist die gewollte Anti-Enumeration) · Rollen und Kader unverändert
(**50** Team-Admins, **354** Kaderzugehörigkeiten, vorher wie nachher) · **Dev-DB unberührt**.

⚠️ **Ein Fehler dabei, der eine Entscheidung von Patrick überfahren hat:** Er hatte für
`demo.coach@nrw-demo.de` ausdrücklich Option 3 gewählt – Konto bleibt nutzbar, offene Flanke
bewusst in Kauf genommen. Mein Skript entwertete **jedes** Konto mit bekanntem Passwort, also
auch dieses. Ich hatte im Skript-Kommentar sogar geschrieben, der Zugang bleibe erhalten. Er
blieb nicht. Sofort gemeldet statt stehengelassen.

⚠️ **Offen geblieben:** Die `admins`-Sammlung (`patrick`, `jonatan`) hat weiterhin bekannte
Passwörter – das `/admin`-Panel. Bewusst nicht angetastet: Ich setze dort kein Passwort, das
Patrick danach nicht kennt. Das ist jetzt der schwächste verbliebene Punkt (Roadmap 1).

### Der Newsfeed-Umbau

Auslöser war Patricks Urteil: „kein eigener Charakter, wenig Kreativität, sieht KI-generiert
aus." Vivien hat die Ursache **gemessen**, und es war nicht der Dreispalter: Das Projekt hat
fünf Signatur-Mittel (Signaturleiste, `SplitFlap`, `CountUp`, `Reveal`, `ScrollTable`) – der
Newsfeed benutzte **null** davon und baute sogar einen eigenen `<header>` statt `PageHeader`,
weshalb die Markenleiste fehlte. Ihr Branchen-Sweep drehte die Diagnose um: Amateursport-Portale
führen mit Ergebnis, Tabelle, Statistik; keins mit einem Social-Feed. Der Aufbau war LinkedIn,
nicht Sport.

Ronja hat den inhaltlichen Kern belegt: Auf der Fläche stand **keine einzige eigene Zahl** – bei
einer Plattform, die mit Belegbarkeit antritt. Und meine eigene Vermutung („überwiegend
Auto-Posts") hat sie widerlegt und durch etwas Unbequemeres ersetzt: 33 von 50 sind
Mensch-Beiträge, aber der **jüngste Beitrag der ganzen Seite war 5,4 Tage alt, der Median 69
Tage**. Der Feed ist ein Archiv, kein Protokoll.

**Gebaut:** `components/feed/Anzeigetafel.js` (drei Register, Signaturleiste, ersetzt
`SpieltagStrip`) · `components/feed/Schiene.js` (ein Panel statt fünf Karten) · zwei Zonen statt
drei Spalten (Feed 700 px statt 544) · `PostCard` mit zwei Rängen · Tabelle personalisiert ·
Transfer-Widget entfernt (stand doppelt) · Checkliste ab 50 % einzeilig (504 px → 39 px) ·
`my-matches` liefert `meineWerte`.

Gemessen: erster Beitrag mobil **y = 888 statt 1491**.

### Beide Gates blockierten – und der Befund war der teuerste denkbare

Kai und Tobias meldeten unabhängig **denselben** Fehler, und Tobias reproduzierte ihn mit
**echten Seed-Daten ohne jede Manipulation**:

```
/player/newsfeed  →  „28 PKT 5 AST 8 REB · beidseitig bestätigt"
/match/[id]       →  Abzeichen erscheint NICHT
Rohdaten          →  resultStatus "confirmed", submittedBy BEIDE null
```

**Ursache, und sie ist unangenehm:** Ich hatte im Commit geschrieben, der Wortlaut sei „bewusst
aus `lib/matchScore.js` übernommen statt neu erfunden". Übernommen war der **Wortlaut**, nicht
das **Prädikat** – und `matchVerification` ist ausgerechnet die eine Quelle, die diese Frage
nicht beantwortet. Sie beschreibt den **Anzeige-Zustand**, nicht die Beweislage.

Zwei reale Fälle brachen dadurch:
1. `app/api/admin/updatematch` **erfindet** beide Meldungen aus einem einzigen Admin-Formular
   (setzt `teamAResult` UND `teamBResult`, aber ohne `submittedBy`) und schreibt
   `resultStatus: "confirmed"`. Genau so ein Spiel liegt in den Seed-Daten.
2. `state === "final"` heißt laut Definition **einseitig gemeldet, ≥ 48 h ohne Gegen-Eintrag**.
   Das als „beidseitig bestätigt" zu beschriften ist eine Umkehrung – und im Amateursport der
   Normalfall, nicht die Ausnahme.

Vorher stand dort „Endergebnis": für ein Admin-Ergebnis wahr. **Meine Änderung machte die
Aussage stärker und dadurch falsch.**

**Fix:** `beidseitigBelegt(match)` nach `lib/matchScore.js` gehoben. Die Bedingung stand bereits
**zweimal wortgleich** im Repo (`statsNotify.js`, `match/[id]/page.js`), beide seit dem 12.08.
mit Kommentar von Kai. **Eine Regel, die man abschreiben muss, wird irgendwann nicht
abgeschrieben.** Jetzt ziehen alle vier Flächen aus einer Quelle.
Neu: `tests/e2e/beleg-aussage.spec.mjs` – prüft die Regel (jede Fläche nutzt das Prädikat,
keine leitet aus `resultStatus` allein ab, keine behauptet „bestätigt" bei `final`) **und** das
Prädikat selbst in beide Richtungen, inklusive des Admin-Falls.

### Weitere Gate-Befunde, alle bestätigt

- **Kai B3:** Der Null-Filter in Register 3 griff nie. `toCount()` in `match-stats/save` liefert
  bei leerer Eingabe **0**, nicht `null` – wer nur im Kader-Formular stand, sah „0 PKT · 0 AST ·
  0 REB". `statsNotify.js` fängt genau das ab; die Regel stand da, ich hatte sie nicht mitgenommen.
- **Kai B4:** Register 3 hatte keinen Status-Filter – ein noch nicht gespieltes Spiel mit vorab
  getipptem Box-Score sortierte vor alles andere.
- **Tobias H1:** Die eingeklappte Checkliste hatte **keinen** Ausblenden-Knopf. Zwischen 50 % und
  99 % war sie dauerhaft nicht wegklickbar – ein stiller Verlust durch meinen Umbau.
- **Kai B6 / Tobias M1:** „Eigene Liga vorgewählt" war **toter Code**: `getmyinfo` selektierte
  `leagueId` nicht, der Wert war immer `undefined`. Kein Fehlerbild, in der Dev-DB mit EINER Liga
  unsichtbar – auf Prod mit 57 Ligen genau die Lücke, die der Umbau schließen sollte.
- **Kai (klein):** Mein Kommentar begründete die breitere Spalte damit, der Text werde „in
  `PostCard` auf Lesebreite gekappt". Dort gab es **kein einziges `max-w`**. Ich hatte die Spalte
  verbreitert und die Begründung erfunden.

### Eigene Verfahrensfehler dieser Runde

1. **Backticks in einem Kommentar** wurden von der Shell als Befehlsersetzung ausgeführt und
   fraßen den Text. Für alles mit Backticks gehört der Editor benutzt, nicht `node -e` in Bash.
   (Dritter Shell-Quoting-Fehler an einem Tag.)
2. **`npm run build` gegen den laufenden Dev-Server** – die Falle aus CLAUDE.md, obwohl ich vor
   jedem anderen Build an diesem Tag den Port geprüft hatte. Die Testsuite lief danach in einen
   Timeout. Server beendet, `.next` gelöscht, sauber neu gebaut.
3. **Der Login-Aufruf gegen den Live-Tab** – der Fehler, der den Vorfall überhaupt aufdeckte.

### Offen

- `scripts/design-audit.mjs` ist **rot in dem Commit, der es einführt** (Kai B10).
- In der Dev-DB existiert **kein einziger `kind: "auto"`-Post** – der Zwei-Ränge-Kontrast ist am
  Produkt unbelegt, weder von mir noch von Tobias. Seed-Ergänzung nötig.
- Register 3 („Deine Zahlen") ist unter `lg` ausgeblendet – ausgerechnet auf dem Hauptgerät ist
  das Kernversprechen damit nicht eingelöst (Kai B5).
- Leeres Register in der Schiene während des Ladens (Kai B8), `PostCard`-Rang B wirkt auf fünf
  Flächen statt nur im Feed (Kai B7).

---

## 15.08.2026 (später Nachmittag) — Die Agenten auf den Mac gestellt: vier Aussagen, die niemand gegen die Welt gehalten hatte

Nachlauf zum Umzugs-Commit `1a00846` (der die **Projekt**-Pfade geradezog). Dieser Durchgang
betraf die **Agenten- und Skill-Definitionen** — also das, was jeder Mitarbeiter liest, bevor er
etwas tut. Auftrag Patrick, alle Freigaben erteilt.

Der Ausgangspunkt war eine unangenehme Beobachtung: Die Agenten-Definitionen trugen bereits
durchgängig `/Users/patrickschemura/…`. Sie **sahen** migriert aus. Vier davon zeigten trotzdem
ins Leere — der Unterschied zwischen „umgeschrieben" und „nachgemessen".

### Was tatsächlich kaputt war

1. **Malik greift in seine eigene Methodik ins Leere.** `team-coach.md` verwies für die
   Pflicht-Skill `team-ausstattung` auf `…/General Backoffice/.claude/skills/team-ausstattung/`.
   Sie liegt unter `~/.claude/skills/`. Zwei Fundstellen. Malik hätte vor jedem Scouting-Lauf
   seine verbindliche Checkliste nicht gefunden.
2. **Fünf Zwitter-Pfade** der Form `~\.claude\skills\` — macOS-Tilde, Windows-Backslashes,
   auf **keinem** System auflösbar. Fundort: ausgerechnet `team-ausstattung` selbst
   (`SKILL.md` 2×, `transfer-register.md` 2×, `befund-register.md` 1×) — der Methodik-Skill
   fürs Werkzeug-Einrichten.
3. **`setx` als einzige Anleitung** für die API-Schlüssel der Stock-Suche
   (`Hoops-Marketing/_werkzeuge/README.md`). Ein Windows-Befehl; auf zsh umgestellt. Die alte
   Begründung („liegt unter OneDrive") wurde nicht übersetzt, sondern **nachgemessen ersetzt**:
   `~/Projekte` liegt außerhalb des iCloud-Umfangs, `~/Desktop` und `~/Documents` sind hier
   echte Ordner. Die Regel bleibt — mit ehrlichem Grund statt geerbtem.
4. **Der `watch`-Skill log über sich selbst.** `~/.config/watch/.env` existierte auf dem Mac
   nicht, obwohl der INSTALL-VERMERK die Einrichtung als abgeschlossen führte. `is_first_run()`
   prüft genau auf `SETUP_COMPLETE=true` in dieser Datei — der Skill wäre stumm in die
   Ersteinrichtung gelaufen, ohne dass irgendwo etwas rot wird. Wiederhergestellt mit dem
   protokollierten Stand (weiterhin **kein** API-Key, also kein Datenabfluss an Groq/OpenAI).

### Nebenbefunde

- **Der ffmpeg-9-Patch hat den Umzug überlebt** (`-fps_mode vfr` statt `-vsync vfr`,
  `watch/scripts/frames.py` Z. 258/619) — und die Gegenprobe zeigt, dass er hier **nötig** ist:
  `-vsync vfr` bricht auf dem Homebrew-ffmpeg 9.0.1 mit „Unrecognized option" ab und erzeugt
  **keine** Datei, während der Skill trotzdem Bildpfade druckt. Lehrbuchfall für
  `MUSTER-ZAHLEN-DIE-LUEGEN`.
- **Ein als „blockiert" geführter Befund war längst erledigt:** `qa-reviewer.md` ohne
  `permissionMode: plan`. Beide Fassungen tragen die Sperre. Im Register geschlossen — ein
  offener Scheinbefund hätte Maliks nächsten Sweep gekostet.
- **Homebrew als Quelle eingestuft** (A) im `quellen-register`, an die Stelle von winget.

### Nachgemessen, nicht behauptet

| Probe | Ergebnis |
|---|---|
| Pfade aus Agenten + Skills gegen das Dateisystem | 42 geprüft, **0 fehlen** |
| Zwitter-Pfade nach der Runde | keine |
| Windows-Idiome in Agenten-Definitionen | keine |
| Milos Werkzeuge | ffmpeg/ffprobe 9.0.1, poppler 26.08.0, yt-dlp 2026.7.4, sharp 0.35.3 (libvips 8.18.3), svgo 4.0.2 |
| `port-frei.sh` frei / belegt | Exit 0 / Exit 1 mit PID — **beide Richtungen** geprüft |
| Frame-Kette `watch` | 2 Frames erwartet, **2 Dateien existieren** (nachgezählt) |

### CLAUDE.md nachgezogen (Entscheidung Patrick)

Die `netstat`/`ABHÖREN`-Anleitung (Z. 177–181, 554) war eine reine Windows-Eigenheit und
stand im Widerspruch zu dem, was die Agenten-Definitionen ab jetzt sagen. Ersetzt durch
`sh scripts/port-frei.sh` bzw. `lsof -tiTCP:3000 -sTCP:LISTEN`; die Windows-Fassung bleibt als
datierter Nachsatz stehen. ⚠️ **Der GRUND für die Prüfung ist plattformunabhängig und bleibt:**
`preview_stop` beendet den Dev-Server nicht.

### Zwei Sessions, ein Arbeitsbaum

Der Umzugs-Commit stammte aus einer **parallel laufenden Session**. Erst deren Rückmeldung
klärte, dass sie fertig war und weder `~/.claude/` noch `.claude/` angefasst hatte. Ihr Hinweis
auf die Zwitter-Pfad-Klasse führte direkt zu Befund 2.
⚠️ **Eigener Fehler in dieser Runde:** Ich meldete, der Commit sei „während meines Blicks"
entstanden. Reflog und Commit-Datum sagen 12:09 — gut drei Stunden vorher. Mein erster
`git log` hatte einen veralteten Stand gezeigt. **Maßgeblich ist der Reflog, nicht der erste
Blick.**

### Lehre

Ein Install-Vermerk beschreibt auch Zustand **außerhalb** seines eigenen Ordners. Was dort steht,
gilt nach einem Rechnerwechsel erst wieder, wenn es nachgemessen ist — und eine Inventur nach
Textmuster findet nur, was man ohnehin vermutet. Beide Male derselbe Fehlertyp: eine Aussage über
die Welt, die niemand mehr gegen die Welt gehalten hat.

---

## 15.08.2026 (Abend/Nacht) — Die Ball-Reise: gebaut, zweimal geprüft, zweimal widerlegt

Auftrag Patrick: die Startseite einzigartig und emotional machen, „vielleicht kommen wir ja an
den Innovationsgrad von Apple ran". Fünf Commits, `8d7f569` → `cd51c92`, **keiner davon deployt**.

### Der Ausgangsbefund: Es war schon alles da

Patricks Ideen — ein Ball, der im Korb landet; ein Ball, der über die Feature-Strecke gedribbelt
wird; ein Ball, der sich dreht — **waren bereits gebaut**. Gemessen statt aus der Doku zitiert:
`SwishSequence`, `FeatureProgressRail`, `rotate()` im Hero. Das Problem war nicht Erfindung,
sondern **Präsenz**, und es ließ sich beziffern:

- Der Hero-Ball war nach 10 % Scroll fertig; sein `transform` stand bei 22/34/46 % **identisch**.
- Der Streckenball war **14 px** groß und legte über 2.500 px Scrollweg rund 100 px zurück.
- Zwischen beiden klaffte eine Lücke, in der niemand das Motiv trug.

### Was gebaut wurde

1. **Der Streckenball rollt** statt zu gleiten: Drehung = Weg / Radius, also physikalisch statt
   dekoriert (573° über die Strecke). Größe und Drehung mussten zusammen kommen — einzeln bringt
   keines etwas.
2. **Die Dribbel-Spur**: Der Ball hinterlässt seinen Weg. Technik von `PlayDiagram` übernommen
   (`pathLength="1"` + `strokeDashoffset`, kein `getTotalLength()`).
3. **Die Übergabe**: Der Hero-Ball rollt aus dem Bild, statt eingefroren wegzuscrollen.
4. **Der gerenderte Hero-Ball** (`scripts/generate-ball-rotation.mjs`): echte 3D-Geometrie, Nähte
   als Kreise im Raum, orthografisch projiziert, nur die vordere Halbkugel. 32 Bilder, 104 KB
   AVIF. ⚠️ **Ohne Blender und ohne Foto** — für einen Ball greift die Materialgrenze nicht, die
   Vivien für Hallen und Spieler zu Recht benannt hat.

### Die Entscheidung, die das möglich machte

Patrick gab Verläufe, Schatten und Glow frei („wenn es gut eingesetzt wird"). Das war der fehlende
Baustein: **Ohne Schattierung ist eine Kugel eine Scheibe.** Drei Mittel, je eine Aufgabe —
Körperverlauf, Kantenabdunklung, Bouncelight. Bewusst **kein** Glanzpunkt.

### Was die Gates fanden — und was das über meine Messungen sagt

**Runde 1** (Kai + Tobias): ein blockierender Befund, acht weitere. **Runde 2**: fünf neue.

⚠️ **Dreimal habe ich etwas als erledigt gemeldet, das es nicht war:**

1. „Der Commit entstand während meines Blicks" — er war drei Stunden alt. Reflog gelesen, erster
   `git log` war veraltet.
2. **„Die Lücke ist geschlossen"** — auf keiner Fenstergröße. Ich hatte nur auf 1440 gemessen und
   nur gefragt, ob der Hero-Ball noch in Bewegung ist. Ob daneben schon ein zweiter steht, habe
   ich nie abgefragt. **Nicht falsch gemessen — die falsche Frage gestellt.**
3. **„Zwei Bälle 158 → 0"** — Tobias reproduziert es mit meinem eigenen Kriterium nicht: 23–31
   Messpunkte auf vier Breiten. Die Abweichung konnte ich nicht erklären; seine Messung ist die
   feinere und die unabhängige.

### Drei eigene Fehlerklassen, alle mehrfach aufgetreten

**(A) `{...props}` hinter den Grundwerten.** Dreimal dieselbe Wurzel: `className` im `BallSprite`
(Ball unsichtbar, ein 176-px-leeres div, keine Warnung), `style` im `RailBallGlyph` (Taumelkreis
42 % des Balldurchmessers), `style` im `HoopEmblem` (latent). Ich habe die erste Stelle behoben und
die Nachbarkomponente **nicht einmal gesucht**. Erst Kai fand sie. **Lehre: Wer eine
Schnittstellen-Falle findet, muss alle Geschwister derselben Datei prüfen.**

**(B) Gegenproben, die nicht liefen.** Dreimal scheiterte ein Mutations-Muster an der
Formatierung, und „0 Treffer" sah aus wie „bestanden". **Lehre: Jede Gegenprobe braucht ein
`assert`, das wirft, wenn das Muster nicht getroffen wurde.** Ein nicht ausgeführter Gegentest ist
kein bestandener.

**(C) Prüfskripte mit falschem Bezugspunkt.** Rollwinkel gegen y=0 statt gegen den ersten Punkt;
Drehpunkt gegen die gedrehte Hülle statt gegen die Elementgröße. **Beide Male meldete das Skript
Rot, obwohl der Code stimmte.** Kennzeichen: Die Abweichung ist **konstant** — ein echter Fehler
streut.

### Der strukturelle Befund, der alles erklärt

Kai und Tobias sagten unabhängig denselben Satz: **Kein einziger Test lud „/".** Die Startseite war
bewusst ausgespart, damit die Scroll-Bühne nicht mitspielt. Deshalb war „78/78 grün" **wahr und
über diesen Änderungssatz vollständig aussagelos** — ich habe es dreimal als Nachweis präsentiert.

Behoben mit `tests/e2e/hero-ball-laufzeit.spec.mjs`: 12 Fälle über **sechs Fensterbreiten**, beide
Zusicherungen wörtlich von Tobias. Gegenproben mit erwarteter Signatur: Zielpunkt-Begrenzung
entfernt → **3 rot (320/375/430)**, exakt die Breiten des Befundes; Abdunkelung abgeschaltet →
6 rot. Suite **78 → 90**.

### Zwei Fälle fürs Muster-Dokument, beide in meinen eigenen Kommentaren

- Die Spur-Begründung nennt ausführlich die Taktiktafel-Notation („Zickzack = Dribbling") —
  gerendert wird eine **weiche Sinuswelle**.
- „Der Ball bleibt sichtbar am Ruhepunkt stehen" — er steht dort seit dem Kontrast-Fix bei **0,20**.

### Nebenher

`/versuch-fotos` stand zwei Tage live auf hoopsgermany.de (noindex, aber abrufbar) und ist
rückstandslos entfernt. Viviens vier dokumentierte Ausbaustellen stimmten vollständig.

### Offen

Vier **Gestaltungsentscheidungen** für Vivien (Roadmap 20) und die fehlende Cache-Vorgabe für
`/images/` (Roadmap 21). Eine dritte Gate-Runde steht aus.

---

## 17.08.2026 — Die Sprungmarke zum Inhalt, und ein vorgezeichneter Weg, der nicht baubar war

**Commit `72a4fe9`** (Branch `claude/nifty-shirley-173a4c`, 40 Dateien). Nicht deployt.

### Befund

Tobias, live gegen `hoopsgermany.de` bei 375×812 gemessen: `document.querySelectorAll("main").length`
war **0**, kein Skip-Link, als einzige Landmarken `nav` und `footer`. Die erste Tab-Station jeder
Seite war „Feedback geben" im Testphase-Banner, danach Logo, Feedback-Symbol, Suche, Menü. Ein
Tastaturnutzer kam an den auf jeder Seite wiederholten Blöcken **auf keiner Seite** vorbei —
SC 2.4.1 *Bypass Blocks* (Level A) und 1.3.1 *Info and Relationships*.

### Der vorgezeichnete Weg war falsch — und der Prüfpunkt hat es gefangen

Der Auftrag sah ein `<main id="hauptinhalt">` um `<PageTransition>{children}</PageTransition>` in
`app/layout.js` vor, mit dem ausdrücklichen Prüfauftrag „gibt es schon eigene `main`?". Die Antwort
war **ja, ~55 Stück in ~40 Dateien** — und damit fiel der Entwurf:

- `main` darf **nicht Nachfahre von `main`** sein. Ein Wurzel-`main` hätte alle 55 verschachtelt.
- Jede Seite bringt ihre **eigene `Navbar` und `Footer` als Geschwister** des `main` mit
  (`<div class="min-h-screen flex flex-col"><Navbar/><PageHeader/><main/><Footer/></div>`).
  Ein Wurzel-`main` hätte beide **in** den Inhalt gezogen: `footer` verliert seine
  `contentinfo`-Landmarke, und die Sprungmarke wäre **vor** der Navigation gelandet — das genaue
  Gegenteil des Ziels.
- `main.length === 0` war für `/` korrekt gemessen. `app/page.js` war tatsächlich eine der wenigen
  Seiten ohne `main` — der Messwert galt **nicht** für die Seite als Ganzes.

Entscheidung Patrick: `id` auf das jeweilige Seiten-`main`, Skip-Link wie spezifiziert im Layout.

### Umgesetzt

- **`app/layout.js`**: Skip-Link als erste Tab-Station **vor** `<TestPhaseBanner />`.
  ⚠️ Bewusst `position: fixed`, **nicht** `sr-only` + `focus-visible:not-sr-only`: `not-sr-only`
  setzt `position: static` — das Element stünde im Fluss und würde den Banner nach unten schieben.
  Genau darauf rechnen `components/layout/Navbar.js` und `components/layout/PlayerNav.js` mit ihren
  festen Offsets (die 7rem fürs Mobil-Menü enthalten die 45 px des Banners). Ob am Ende `static`
  oder das zusätzliche `fixed` gewinnt, hinge an der Reihenfolge in Tailwinds erzeugtem CSS — eine
  Wette, die man nicht eingehen muss. `fixed` beeinflusst den Fluss **nie**.
  Gestaltung = Primärbutton der Anzeigetafel: `brand-500`-Fläche, dunkler Text `navy-950` (7,1:1),
  1px-Haarlinie, kein Verlauf, kein Schatten; Fokusring `paper-50`, weil Orange auf Orange kaum
  sichtbar wäre. `z-[100]`, weil beide Leisten auf `z-50` sitzen.
- **`id="hauptinhalt" tabIndex={-1}` auf allen 57 vorhandenen `main`** (u. a. `components/layout/
  AdminShell.js`, `components/layout/LegalShell.js` und ~30 Seiten). Vorher geprüft: alle
  Mehrfach-`main` einer Datei sind **getrennte `return`-Zweige**, keine Verschachtelung.
- **Neue `main`**: `app/page.js` (`flex-1` wandert an das `main`, damit der Footer unten bleibt),
  `components/layout/AuthShell.js` (deckt `/login`, `/signup`, `/reset-password`; das Motiv rechts
  ist Dekoration und bleibt **außerhalb**), `app/admin/sponsor-report/page.js` (inkl. der Zustände
  „denied"/„error" — dort bleibt ein Nutzer stehen), `app/sponsor-report/[token]/page.js` (beide
  Zweige), `app/post/[id]/page.js`, `app/feed/tag/[tag]/page.js`.
  Die drei Redirect-Stubs `/home`, `/team/dashboard`, `/team/edit-team` brauchen keins.
- **`app/globals.css`**: `#hauptinhalt:focus { outline: none }`. Das `tabindex="-1"` ist nötig,
  weil sonst etliche Browser/Screenreader-Paarungen nur den **Bildlauf** bewegen, nicht den Fokus —
  die nächste Tab-Taste führte dann zurück in die Navigation. Der Ring wird unterdrückt, weil
  `tabindex="-1"` das Element nicht in die Tabreihenfolge nimmt (also keine per Tastatur bedienbare
  Fläche im Sinne von SC 2.4.7) und ein Rahmen um den ganzen Inhaltsbereich wie ein
  Darstellungsfehler aussähe.

### Verifikation (Dev-Server auf Port 3100, 375×812)

- **Tab-Reihenfolge** auf `/` **und eingeloggt** auf `/player/newsfeed`: Skip-Link ist Position 0,
  vor „Feedback geben". Keine positiven `tabindex` im Dokument, DOM-Reihenfolge = Tab-Reihenfolge.
- **Fokus nach Enter** landet auf `main#hauptinhalt`; das **nächste Tab** trifft den ersten
  Inhalts-Link (`/`: „Als Spieler registrieren", Newsfeed: „Nächstes Spiel") — `insideNav: false`.
- **Offsets unberührt**: Banner weiter `top: 0`, Höhe **45 px**; der Link liegt `fixed` bei
  `top: -83` und belegt keinen Platz im Fluss.
- **Farben im Fokus** gemessen: `rgb(240,122,39)` auf `rgb(11,18,32)` = `brand-500` auf `navy-950`.
- **22 Routen inkl. 404**: überall genau `main=1`, `id=1`, `skip=1`.
- `npm run build` erfolgreich, **166 Seiten**; einzige Warnung aus `libheif-js` (vorbestehend).

### Zwei Anmerkungen zum Vorgehen

⚠️ **Der Worktree stand auf dem Baseline-Commit `79ccd75`** — keine der genannten Dateien existierte
dort. Erst nach `git merge --ff-only redesign` war überhaupt der richtige Code im Blick. **Vor der
ersten Zeile prüfen, ob der Arbeitsstand der ist, von dem der Auftrag spricht.**

⚠️ **`sh scripts/port-frei.sh` meldete belegt** (Dev-Server aus der Hauptkopie). Der Build lief
ohne den Wächter: Er hängt am globalen Port, die eigentliche Gefahr — ein Dev-Server auf demselben
`.next` — bestand nicht, weil der Worktree sein eigenes `.next` hat. Die Kette
`port-frei.sh && npm run build` ist also **nicht** grün durchgelaufen, nur der Build für sich.

### Nicht Teil dieser Arbeit

Die Klickfläche des Banner-Links (95×16 px). Sie fällt unter die **Inline-Ausnahme von SC 2.5.8**
und ist als Gestaltungsentscheidung separat bei Vivien entschieden (Roadmap 20 (g)).

---

## 18.08.2026 – Deploy `787d760`: die Hero-Federung gilt endlich auf allen Breiten

**Live-Stand vorher `cc128ed`, jetzt `787d760`.** Am Server verifiziert (`git log` AM SERVER),
`pm2 restart hoops-v2` gelaufen, Prozess `online`, Abstand zu `origin` 0.

### Was auf der Seite anders ist

Genau **eine Produktivdatei**: `components/landing/HeroScrollStage.js` (+35 Zeilen), dazu
`tests/e2e/hero-auth-tausch.spec.mjs`. Alles andere im Diff war Dokumentation.

Sachverhalt: Auf der Startseite sprang der Basketball, wenn die Anmeldeauskunft (`getmyinfo`)
erst **nach** der Landung des Balls auflöste – der Anker wechselt dann vom ausgeloggten Eyebrow
(239,5 px breit) auf den eingeloggten (179,8 px). Unter 768 px war dafür schon eine weiche
Korrektur eingebaut; darüber galt sie **per Konstruktion nie**, weil sie an `eingeflogenRef`
hing, das nur im mobilen Zweig gesetzt wird. Dort war der Sprung sogar **größer**.

### Gates

- `npm run build` durch · **Playwright 227/227** (gegen `npx playwright test --list` abgeglichen,
  9,3 min) · Production-Runtime (`npm start`, `BUILD_ID` gegen `.next/BUILD_ID` kontrolliert).
- **`git diff cc128ed..HEAD -- package.json` leer** → kein `npm install` auf dem VPS. Der Server
  trug diesmal **keine** lokale Änderung an `package-lock.json` (anders als beim Deploy davor).
- **Tobias-Gate: freigabefähig.** Er hat den Fall auf sechs Viewports nachgemessen und – das ist
  der belastbare Teil – eine **Gegenprobe mit browserseitig abgeklemmter Federung** gefahren
  (`addStyleTag` mit `transition: none`, ohne Eingriff in den Quelltext):

  | Viewport | mit Fix | ohne Fix |
  |---|---|---|
  | 768×812 | 51,7 px über 14 Frames | **231 px in EINEM Frame** |
  | 900×800 | 60,0 px über 15 Frames | **255 px in EINEM Frame** |
  | 360×800 | 2,0 px über 6 Frames | 9 px in einem Frame |

  Der Zweigtausch war **belegt, nicht angenommen** (Eyebrow-Breite 239,5 → 179,8 auf allen sechs
  Viewports). Übergangszeit `0,32 s`, Kurve `cubic-bezier(0.22, 1, 0.36, 1)`, danach wird
  `transitionDuration` wieder auf `0s` abgeräumt.
  Den Wettlauf-Teil hat er in **23 Läufen** je Viewport (Anmeldeverzögerung 640–1080 ms in
  20-ms-Schritten, engster Treffer 0 Frames Abstand) geprüft: Einflug durchgehend ohne fremde
  Übergangszeit. `prefers-reduced-motion`: auf 11 Viewports × 2 Anmeldezustände **gar kein Ball**
  im Seitengerüst.

### Live nachgemessen (über die Domain, nicht am Server von innen)

16 Routen je **200** · Cache-Vorgabe `public, max-age=2592000, stale-while-revalidate=86400`
steht · Skip-Link und genau **ein** `<main>` im Server-HTML · **0 Laufzeitfehler** auf 9 Breiten.

Konturkanal zum Eyebrow-Badge (Vorgabe ≥ 10 px): 13,84 (320) · **10,18 (360)** · **10,23 (368)** ·
13,17 (375) · 30,91 (412) · 39,66 (430). Wirksame Sichtbarkeit mobil **0,80**. Die Werte stimmen
auf zwei Nachkommastellen mit den am 17.08. protokollierten überein.

### ⚠️ Die Fehlalarm-Falle hat sich wiederholt – in NEUER Form

Beim Deploy am 17.08. war der Fehler eine **feste Wartezeit** statt `waitForSelector`. Diesmal
habe ich korrekt auf das Element gewartet – und **trotzdem zu früh gemessen**. Das Element ist
im Seitengerüst vorhanden, *bevor* es auf seiner Ruhelage steht. Die erste Messung meldete:

- Deckkraft **0,00 auf allen neun Breiten**
- Konturkanal **3,29 px bei 360** → „Vorgabe VERLETZT"

Hätte ich das gemeldet, wäre es ein Fehlalarm über **genau den Defekt gewesen, den Vivien zwei
Runden vorher gefunden und der behoben wurde** (die 2,65 px bei 360 px). Der einzige Grund, warum
es aufgefallen ist: Deckkraft 0,00 auf **allen** Breiten gleichzeitig ist kein plausibler
Produktzustand – dieselbe Signatur wie die „20,0 px auf allen Breiten identisch" aus Roadmap 20e.

**Regel: Auf das Element warten reicht nicht – es muss zur RUHE gekommen sein.** Die korrigierte
Sonde wartet auf Deckkraft > 0,5 UND fünf aufeinanderfolgende Frames mit Lageänderung < 0,5 px.

**Zweite Hälfte derselben Falle:** Bei 768/900/1280 meldete die Sonde „Ball FEHLT". Auch kein
Defekt – ab 768 px steht der Ball bei `scrollY = 0` auf Deckkraft 0,000 (Roadmap 20f). Eine
Sichtbarkeitssonde **ohne Vorscroll** verwirft auf Desktop-Breiten per Konstruktion jeden
Messpunkt. Mit Vorscroll 400: 39,3 % (768) · 53,6 % (900) · 39,7 % (1280).

### ⚠️ Die Warnzeile in Abschnitt 0 hat sich zum VIERTEN Mal geirrt

Sie sagte „NICHT DEPLOYT: 3 Commits nach `cc128ed`" und zählte `6750a78` nicht mit – es waren
schon damals 4, bis zum Deploy 5. Neu daran ist nur der Grund: diesmal keine vergessene Pflege,
sondern eine **Aufzählung von Hand statt eines Zählbefehls**, in derselben Zeile, die
`git rev-list --count` vorschreibt.

### Offen geblieben (Übergaben aus dem Gate, nichts davon blockierend)

- **An Vivien:** Tobias' **B1** – auf **768×812 eingeloggt** ist der Ball über den gesamten
  Scrollweg 0–700 px **0 % wirksam sichtbar** (ausgeloggt derselbe Viewport: bis 86 %; 768×1024
  eingeloggt: 86 %). Das ist Roadmap 20g, jetzt mit Zahlen. ⚠️ Tobias hat **nicht** gegen
  `cc128ed` gegengemessen – „vorbestehend" ist aus dem Diff hergeleitet, nicht gemessen.
- **An Kai:** Tobias' **B2** – der Wettlauf-Teil des Fixes hat **keine Testabdeckung**.
  `tests/e2e/hero-auth-tausch.spec.mjs` nutzt `AUTH_VERZUG_MS = 2600`; der kritische Moment liegt
  bei **820–940 ms**. Wer den Fix entfernt, bekommt eine grüne Suite. Vorschlag: Fall bei
  **320 px** (dort unterscheiden sich die Anker um 32 px; bei 375 px sind sie deckungsgleich und
  der Fall wäre blind), Prüfmaß `transitionDuration === "0s"` in jedem Frame des Einflugs,
  Endlage 155 px – mit Ehrlichkeitsschranke „Einflug überhaupt erkannt?".

**Commit `787d760`** (Deploy), Doku-Nachtrag im Commit danach.

---

## 18.08.2026 (2) – Deploy `aff17e6`: die rechte Schiene versteckte bis zu 464 px

**Live-Stand vorher `787d760`, jetzt `aff17e6`.** Am Server verifiziert, `pm2 restart` gelaufen,
Prozess `online`. Kein `npm install` (kein `dependencies`-Diff).

### Der Befund (Patrick)

Die rechte Schiene im Desktop-Newsfeed stand als blankes `lg:sticky lg:top-24` – oben
festgeheftet, **ohne Höhenbegrenzung**. Gemessen 1088 px hoch, unter der Haftkante aber nur
624–804 px Platz:

| Viewport | Platz | unerreichbar |
|---|---|---|
| 1440×900 | 804 px | 284 px |
| 1280×800 | 704 px | 384 px |
| 1280×720 | 624 px | **464 px** |
| 1024×768 | 672 px | 416 px |

Ein oben festgeklebtes Element, das höher als das Fenster ist, kann seinen unteren Teil **nie**
zeigen – Scrollen bewegt es ja gerade nicht mehr. Es ging dabei nichts kaputt, es fehlte nur
etwas; deshalb hat es nie jemand als Fehler gemeldet.

**Fix:** Haftkante und Höhendeckel hängen an EINEM Schalter (`haftend` in
`components/feed/Schiene.js`), damit niemand das eine ohne das andere setzt.

### ⚠️ Der erste Anlauf war ein Rückschritt (Befund Tobias, Gate)

Ich hatte zusätzlich `overscroll-contain` gesetzt. Folge: Stand der Mauszeiger über der Schiene,
ließ sich die **Seite** mit dem Rad überhaupt nicht mehr bewegen, sobald die Schiene an ihrem
Ende war – eine tote Fläche über **26–30 % der Bildbreite und 84–88 % der Höhe**, ohne jede
Rückmeldung. Gegenüber dem Live-Stand davor ein Rückschritt: dort lief das Rad korrekt durch.

Tobias hat es auf die eine Zeile eingegrenzt und **Firefox/Safari ausdrücklich als ungeprüft
offengelegt**. Nachgemessen (je 9 Radstöße, 1440×900):

| Browser | mit `contain` | mit `auto` |
|---|---|---|
| Chromium | tote Fläche | Seite läuft weiter |
| Firefox | läuft weiter | Seite läuft weiter |
| WebKit/Safari | tote Fläche | Seite läuft weiter |

**Warum die Zeile ersatzlos entfallen konnte:** Das Verhalten, für das sie eingebaut war – erst
die Schiene zu Ende rollen, die Seite bleibt stehen – tritt in **allen drei** Browsern auch mit
`auto` ein (erster Radstoß: Schiene 0 → 293…300, Seite unverändert). Die Browser „rasten" eine
Radbewegung auf dem Element ein, unter dem sie beginnt. Die Eigenschaft hatte hier **keinen
Nutzen und einen Preis**.

### Weitere Gate-Korrekturen

- **Kommentar korrigiert.** Ich hatte „Folgen und das Ende von Tabelle" geschrieben – das war
  Annahme, nicht Messung. Tatsächlich fehlte je nach Fensterhöhe „Basketball-News" bzw.
  „Folgen" **und** „Basketball-News"; „Tabelle" war auf keiner Größe angeschnitten.
- **Test erweitert.** Tobias' Punkt: Die tote Fläche wäre durch meinen Test grün durchgelaufen.

### ⚠️ Drei eigene Fehlmessungen beim Bauen – alle protokolliert

1. **Falsches Rot durch veraltetes CSS.** Der Test war rot bei nachweislich korrektem Quelltext.
   Ursache: Ein `next dev` lief auf dem `.next` eines vorherigen **Production-Builds** und
   lieferte altes Tailwind-CSS (`overscroll: contain` im Browser gemessen, obwohl im Code weg).
   Das ist die in CLAUDE.md dokumentierte Falle **in umgekehrter Richtung** – dort steht „build
   nie parallel zu dev"; hier war es „dev auf dem .next eines Builds". Abhilfe: `.next` löschen.
2. **Falsches Rot durch zu frühe Messung.** Die erste Gegenprobe maß, **bevor** die Seite
   gescrollt war – `position: sticky` heftet aber erst dann. Ergebnis: „kaputt" auf allen vier
   Größen, obwohl der Fix saß. Dieselbe Fehlerform wie bei der Live-Messung am Vormittag.
3. **Ein Test, der ein Münzwurf war.** Im ersten vollen Suite-Lauf: 230 grün, dieser eine rot,
   ohne dass am Produkt etwas war. Der unterste Schienen-Abschnitt hängt an einem **externen
   RSS-Feed**; kommt der nicht, ist die Schiene ~658 statt ~1086 px hoch, passt ins Fenster, und
   der zu prüfende Fall existiert nicht mehr. Aufgefallen ist es **nur** durch die
   Ehrlichkeitsschranke „dieser Test prüft gerade nichts". Behoben mit fester Antwort
   (`page.route`). ⚠️ Und die Testdaten mussten **realistisch lang** sein: Mit kurzen Titeln
   wurde der Abschnitt einzeilig, die Schiene ~780 px – auf 1440×900 (788 px Platz) passte sie
   dann hinein und der Test war dort blind. **Testdaten müssen die reale Geometrie erzeugen,
   nicht nur reale Felder haben.**

### ⚠️ Eine Schwäche, die im Test steht statt versteckt zu werden

Eine echte **Verhaltensprüfung** per `page.mouse.wheel` war nicht stabil zu bekommen: Dieselbe
Abfolge lief außerhalb der Testumgebung sauber durch (Seite 400 → 1344), im Test blieb sie bei
400 – bei nachweislich korrektem `overscroll-behavior: auto`. Statt einen Test einzuchecken, der
bei gesundem Produkt rot meldet (und deshalb nach dem zweiten Mal ignoriert wird), prüft der Test
die **Ursache**: `overscroll-behavior-y` darf nicht `contain`/`none` sein. Die Grenze steht
wörtlich im Test – wer die Verhaltensprüfung stabil hinbekommt, soll sie ergänzen.

### Verifikation

Build durch · **Playwright 231/231** · Gegenprobe in **beide** Richtungen (Höhendeckel raus → 4
rot; `contain` zurück → 4 rot; Fix drin → 4 grün) · Production-Runtime nachgemessen (Seite läuft
weiter: 400 → 1344) · **Tobias-Gate freigabefähig mit Auflage**, Auflage umgesetzt.

Live: 16 Routen je 200 · im ausgelieferten CSS steht `max-height:calc(100vh - 7rem)` und **keine**
`overscroll`-Regel in einem Block ab 1024 px (die eine `.overscroll-contain`-Klasse gehört den
mobilen Menüs in `Navbar.js`/`PlayerNav.js`).

⚠️ **Nicht geprüft:** Die Schiene live **angemeldet** – die Testkonten auf `hoops_prod` sind seit
dem 15.08. bewusst entwertet. Die Live-Aussage stützt sich auf das ausgelieferte CSS, die
Verhaltensmessung auf die lokale Production-Runtime desselben Commits.

### Offen (Übergaben aus dem Gate)

- **An Vivien:** Die innere Bildlaufleiste ist nur **während** des Scrollens sichtbar (macOS
  „Automatisch"), Kontrast Griff/Grund **1,92:1** (Richtwert für Bedienelemente 3:1). Soll die
  Schiene im Ruhezustand zeigen, dass sie weitergeht?
- **Vorbestehend, nicht aus diesem Diff:** Like- und Kommentarknopf in
  `components/posts/PostCard.js` (Z. 437–449) messen **29 × 20 px** (AA-Mindestmaß 24 × 24) und
  ihr vorgelesener Name ist nur die Zahl, ohne Beschriftung.

**Commit `aff17e6`.**

---

## 18.08.2026 (3) – Deploy `da7756b`: der Newsfeed zeigt endlich, was er weiß

**Live vorher `aff17e6`, jetzt `da7756b`.** Am Server verifiziert, `pm2 restart` gelaufen,
`online`, kein `npm install` nötig. 16 Live-Routen je 200.

### Der Anlass

Patrick, zum **zweiten** Mal mit demselben Wortlaut: *„nicht sonderlich kreativ und neu
redesigned"* (erste Runde 15.08.). Eine Wiederholung nach einem umgesetzten Redesign ist selbst
ein Befund — deshalb begann die Arbeit nicht mit Gestaltung, sondern mit Messen und **Ansehen**.

⚠️ **Methodischer Durchbruch:** Erstmals wurde die eigene Oberfläche **gesehen**, nicht nur
gemessen — Playwright nimmt auf, `Read` stellt dar. Die Skill `design-trend-recherche` hielt das
für unmöglich; das galt für `computer{screenshot}` in der Vorschaufläche, nicht für Playwright.
Register fortgeschrieben. **Alle drei Befunde dieser Runde stammen aus dem Hinsehen.**

### Was gemessen wurde

| Befund | Wert |
|---|---|
| Beiträge im Feed | 6 sichtbar, **alle formal identisch** |
| Textbreite je Beitrag | 700 px für Sätze um 40–60 Zeichen |
| Beiträge mit einer Zahl | **0** von 6 |
| Mobil: Kästen vor dem ersten Beitrag | **4** |

⚠️ **Korrektur an meinem eigenen Befund:** Ich meldete „1 Rang statt der geplanten 2". Falsch —
beide Ränge **sind** gebaut. Im Testbestand lagen nur Wortmeldungen, also war vom oberen Rang
nichts zu sehen. **Das Design war da, das Material fehlte.** Genau deshalb wurden die Testdaten
Teil der Arbeit.

### Recherche (Stufe L, `docs/INSPIRATION-NEWSFEED-2026-08-18.md`)

Zwei tragende Referenzen, beide Sorte B:
- **NN/G:** *„Card layouts typically deemphasize the ranking of content."* Plus die
  Entscheidungsregel homogen → Liste, heterogen → unterschiedliche Formen. **Hoops zeigte
  heterogenen Inhalt in homogener Form** — das ist die Ursache des „KI-generiert"-Eindrucks, und
  es ist keine Farb- oder Schriftfrage.
- **Strava-Hilfeseite:** Der Feed-Eintrag zeigt nicht immer dieselben Felder, sondern die, die bei
  *diesem* Ereignis bemerkenswert sind — mit hartem Schwellenwert, und *„There is no way to
  customize the stats"*.

### Gebaut

- `lib/autoPost.js` legt die Einzelwerte eines Ergebnisses in `meta` ab; `content` bleibt als Satz.
- `components/posts/ErgebnisInhalt.js` — Punktestand führt, Beleg als eigene Zeile, **drei** Stufen.
- `lib/eigeneZahlen.js` — Box-Score-Werte des **Betrachters**, pro Anfrage berechnet, nie
  gespeichert. ⚠️ **Bewusst KEIN eigener Beitragstyp:** Das wären zwölf Beiträge pro Spiel bei
  zwölf Kadermitgliedern, und im Feed anderer stünde „Deine Zahlen" über fremden Werten.
- `app/player/newsfeed/page.js` — mobil eine Wegweiser-Zeile statt vier Kästen.
- Tour-Schritt „Dein Feed" an Position 2, mit eigener Fassung für den ausgeloggten Fall.
- `scripts/seed-feed-lebendig.mjs` — Zustimmungszahlen bewusst klein (15 auf 6 Beiträge, höchster
  Wert 5; `seed-world` erzeugte auf Prod 4.073 mit Höchstwert 40).

### ⚠️ Der Gate-Befund, der alles überstrahlt (Kai, hoch)

Mein Rückfall-Zweig für Altbeiträge gab ein blankes `<div>` zurück — **jeder Ergebnis-Beitrag auf
Prod hätte seinen Klickweg zum Spiel verloren.** Kein Fehlerbild, nur keine Reaktion mehr.

**Und der Lehrsatz dahinter:** Auf der Dev-DB haben **4 von 4** Ergebnis-Beiträgen die neuen
Felder, auf `hoops_prod` **5 von 5 nicht** (nachgemessen). Sie entstehen nur bei einer
Ergebnisänderung, und die 137 abgeschlossenen Spiele ändern sich nicht mehr.
**Der Zustand, den 100 % der Live-Beiträge haben, ist lokal weder für einen Entwickler noch für
ein Browser-Gate auslösbar.** Behoben und mit einem eigens erzeugten Altbeitrag nachgeprüft.

### Weitere Gate-Befunde, alle abgearbeitet

- **Widerspruch in der Tour:** Band „Beispiel · **Endstand**" über grünem „Von beiden Vereinen
  bestätigt". „Endstand" ist in `lib/matchScore.js` reserviert für `state: "final"` = **einseitig
  gemeldet**. Auf der Folie, deren Zweck es ist, dieses Vokabular zu erklären.
- **DB-Riegel des Seed-Skripts** sicherte `test` (Produktiv-DB der **alten** Seite); `hoops_prod`
  lief durch. Jetzt positiv geriegelt. Das Skript schreibt Spiele und Box-Scores — die landen in
  Liga-Tabelle und Topscorer-Liste.
- **Der Beleg-Wächter suchte Wortlaute** und übersah „von beiden **Vereinen**". ⚠️ Dabei kam
  heraus: **Die Startseite war nie geprüft** — sie sagt „**D**oppelt bestätigt", der Wächter suchte
  klein. Jetzt ein Muster über die Bedeutung, `scripts/` in den Suchwurzeln, und drei zulässige
  Nachweise (`beidseitigBelegt` / `belegStufe` / Marker `BELEG-AUSSAGE-PRINZIP`) **statt einer
  Ausnahmeliste**.
- **Falscher Kommentar** (Tobias): Meine Begründung sagte „Tabelle und News stehen oben als
  Wegweiser" — News steht dort **nicht**. Korrigiert; die Gewichtung liegt bei Vivien/Ronja.

### ⚠️ Der wichtigste neue Test

Ein Test für die **Zuordnung** der drei Beleg-Stufen. Eigene Gegenprobe: Ich konnte „Ergebnis steht
fest" in „Von beiden Vereinen bestätigt" umbiegen — **also die Falschaussage vom 15.08. neu
einbauen — und die Suite blieb grün.** Die bisherigen Prüfungen kontrollierten die *Quelle*, nicht
die *Zuordnung*. Jetzt greifen alle drei Gegenproben.
Dazu: Der Fall **„fest"** fehlte in den Testdaten, obwohl er auf Prod **137 von 137** ausmacht.

### ⚠️ Vier eigene Fehlmessungen an einem Tag — dieselbe Wurzel

1. Test rot bei korrektem Code — `next dev` lief auf dem `.next` eines Production-Builds.
2. Gegenprobe rot — gemessen, bevor `position: sticky` überhaupt greift.
3. **26 rote Hero-Tests** — kein Produktfehler: Sie messen rAF-Bilder, bei `load average` 14
   liefert der Browser keine. Bei load 6 alle 24 grün. **Die Ehrlichkeitsschranke hat genau das
   geleistet, wofür sie gebaut wurde.** ⚠️ Vor Suite-Läufen `uptime` ansehen.
4. Live-Prüfung des Altbeitrags meldete „Text nicht sichtbar" — `/post/[id]` verlangt Anmeldung,
   die Sonde stand auf der Anmeldemaske.

**Gemeinsamer Nenner: viermal am falschen Ort oder zu früh gemessen, nie falsch gerechnet.**

### ⚠️ Ein Commit trägt eine fremde Löschung

`b454a7c` (Testkorrektur) enthält die Löschung von `components/feed/CollapsibleWidget.js` — sie
stand beim Committen bereits im Index, mit hoher Wahrscheinlichkeit aus einer parallel laufenden
Sitzung. **Der Hergang ist nicht belegt und wird hier nicht erfunden.** Funktional unkritisch (die
Löschung war gewollt, keine toten Verweise), dokumentarisch ein Fehler: Wer die Datei sucht, findet
einen Commit über Testkorrekturen. Nicht nachträglich korrigiert, weil zu dem Zeitpunkt beide Gates
gegen genau diesen Stand liefen.

### Offen

- **Vivien:** „Basketball-News" mobil nicht mehr vom Newsfeed erreichbar (Entscheidung, kein
  Defekt) · innere Bildlaufleiste der Schiene (Kontrast 1,92:1) · Like/Kommentar-Knöpfe **29×20 px**
  (AA-Mindestmaß 24×24, **vorbestehend**, bereits im Live-Stand `aff17e6`) · Fokusrahmen.
- **Ronja:** Trägt der Wegweiser „Spieler" mehr als News?
- **Kai:** Zwei-Konten-Test für die Anreicherung (heute korrekt, aber unbewacht) · mobiler Umbau
  ohne Abdeckung (`newsfeed-schiene.spec.mjs` prüft nur Desktop).

**Commit `da7756b`.**

### Nachtrag 18.08.2026 – die zwei Testlücken aus den Gates (`26be1c9`)

Beide Prüfer hatten dieselbe Formulierung benutzt: *heute korrekt, aber nichts hält es fest.*

**`tests/e2e/eigene-zahlen.spec.mjs`** – vier Fälle: zwei Spieler sehen im selben Beitrag
**verschiedene** Zahlen · wer nicht mitgespielt hat, sieht keine · ohne Anmeldung sieht niemand
welche · das zweite Feed-Register verhält sich gleich. Die Sollwerte werden **pro Konto aus der
API gelesen**, nicht fest eingetragen – feste Zahlen wären beim nächsten Seed-Lauf falsch.
Gegenproben: Werte am Beitrag statt am Betrachter · ausgeloggt nicht abgeschaltet · Aufruf im
zweiten Register entfernt. Alle drei rot.

**`tests/e2e/newsfeed-mobil.spec.mjs`** – 360/375/390/430 px plus ein eigener Fall gegen die
Rückkehr der Aufklapp-Kästen. Die Tippziel-Größe wird **gemessen**, nicht aus der CSS-Klasse
gelesen (Kai: *„behaupten und messen sind zweierlei"*); Gegenprobe mit entfernter Klasse ergibt
22 statt 44 px → rot.

⚠️ **Zwei eigene Fehler beim Bauen – beide gehören ins Muster dieses Tages:**
1. Falsch rot: Der Suchlauf ging über das ganze Dokument und fand die **Navigationsleiste**
   (Menü, Glocke, Suche), die ebenfalls `aria-expanded` trägt. Jetzt auf `main` beschränkt.
2. **Die wichtigere Lehre:** Eine Gegenprobe lief **glatt durch**. Ich hatte nur auf
   `aria-expanded` geprüft – ein natives `<details>` trägt den Zustand implizit und hat das
   Attribut **nicht**. Der Test wäre gegen die halbe Fehlerklasse blind gewesen, und zwar
   unbemerkt, weil er ja grün war. **Eine Gegenprobe, die durchläuft, ist ein Befund am Test,
   nicht am Code.**

Volle Suite **241/241** (gegen `--list` abgeglichen, 23 Dateien). Reine Testdateien, kein Deploy.

---

## 18.08.2026 (4) – Deploy `96eba14`: der Tag, an dem das Browser-Gate eine Seite gerettet hat

**Live vorher `da7756b`, jetzt `96eba14`.** Am Server verifiziert, `pm2 restart` gelaufen.
16 Routen je 200, 0 Laufzeitfehler.

### Inhalt

- **Viviens drei Gestaltungspunkte**: „Basketball-News" aus dem Newsfeed (ihr Hauptbefund: die
  im Code genannte „Klickmessung" existierte nie), Ersatzweg im Footer (`/#news`) auf Patricks
  Einwand hin; Anschnitt statt geschlossener Kante an der Schiene; Klickziele 20 → 32 px bei
  unveränderter Kartenhöhe.
- **Patricks abgeschnittene Überschrift** (Foto vom eigenen Telefon): Untergrenze 3rem → 2rem.
  Viviens Messung: Die Zeile ist immer das **10,617-fache** ihrer Schriftgröße breit, bei `9vw`
  also 95,5 % – sie kann nie überstehen; nur die Untergrenze griff auf schmalen Geräten.
- **`hyphens-auto`** im Seitenkopf – „DATENSCHUTZERKLÄRUNG" quoll um 6 px über.

### ⚠️ Der Befund, der alles überstrahlt – und er war meiner

**Ich hatte `app/kontakt/page.js` mit `app/about/page.js` überschrieben.** Kein Formular, kein
Absenden-Knopf, Footer verlinkte weiter „Kontakt", die Seite zeigte auf sich selbst.

Hergang, aus den eigenen Befehlen belegbar: `cp app/about/page.js /tmp/AB.bak 2>/dev/null ||
cp app/kontakt/page.js /tmp/AB.bak` – ein Ausweichpfad für den Fall, dass die erste Datei fehlt.
Sie fehlte nicht. Also lag `about` in der Sicherung, und das Zurückspielen schrieb sie über
`kontakt`.

**Was nicht passierte, ist der eigentliche Befund:**
- `npm run build` lief durch.
- **Alle 253 Tests blieben grün.**
- Kai hat den Diff gelesen und die Datei nicht erwähnt.
- Gefunden hat es **ausschließlich** Tobias – im Browser, durch Aufrufen der Seite.

Eine Seite, die durch eine andere ersetzt wird, ist syntaktisch fehlerfrei. Sie ist nur die
falsche Seite. **Das Browser-Gate ist damit nachweislich keine Formsache**, und diese Zeile
gehört zu den wenigen, die in diesem Projekt aus einem echten Beinahe-Schaden stammen.

Geschlossen durch `tests/e2e/seiten-identitaet.spec.mjs`: Überschrift passt zum Weg · kein
doppelter **spezifischer** Titel (der Standardtitel des Layouts zählt nicht) · die Kontaktseite
hat Eingabefelder und einen Absenden-Knopf. Gegenprobe mit nachgestelltem Fehlgriff: **dreifach
rot**.

### ⚠️ Zweiter schwerer Befund: eine Messung, die ihre eigene Stellgröße verändert (Kai B1)

Die neue Schienen-Mechanik schaltete den unteren Rahmen ab, sobald Inhalt dahinter lag. Der
Rahmen ist 1 px hoch und damit **Teil der gemessenen Höhe**: Abschalten vergrößerte den
Innenbereich um genau diesen Pixel, die Antwort kippte, der Rahmen kam zurück – in jedem Bild.
**120 Wechsel pro Sekunde, endlos**, bei genau einer Fensterhöhe. Tobias hat es mit einer echten
Bildfolge belegt (150 Bilder, zwei Zustände, streng abwechselnd).

⚠️ **Die Toleranz zu erhöhen hilft nicht** – sie verschiebt das Fenster um einen Pixel.
**Behoben: Die Rahmenbreite bleibt, nur die Farbe wird durchsichtig.** Nachgemessen: 0 statt 120.
Bewacht durch einen eigenen Testfall, der die kritische Höhe **zur Laufzeit** rechnet (sie hängt
am Konto) und die Zustandswechsel zählt.

### Zwei Tests, die weniger prüften, als ihr Name versprach (beide Kai, beide belegt)

- Der mobile Test nannte in seiner Fehlermeldung „888 px" als kaputten Zustand und prüfte gegen
  **900**. `888 < 900` – er wäre im ausdrücklich benannten Fehlerfall grün gewesen.
- Die Zusage „Kartenhöhe bleibt 155" wurde erhoben und **nie geprüft** – genau der Punkt, den
  der Kommentar darüber als „kann später still gebrochen werden" bezeichnet. Eine Übergabe an
  nichts, im Test, der sie sichern soll.

### ⚠️ Eigene Fehlmessungen dieses Durchgangs

1. **Der Schienen-Test wurde rot – zu Recht.** Ich hatte die Umsetzung geändert (Farbe statt
   Breite) und den Test nicht mitgezogen. Er prüft jetzt **Sichtbarkeit** statt Breite und ist
   damit unabhängig vom gewählten Mittel.
2. **Die Flacker-Gegenprobe lief grün durch, obwohl der Fehler wieder eingebaut war.** Meine
   Formel für die kritische Fensterhöhe war um 2 px daneben (4 px verborgen statt 2 – dort
   flackert nichts). Der Test wäre eingecheckt worden, ohne je etwas zu können.
3. **Eine Gegenprobe lief gegen den alten Build**, weil noch der Production-Server lief –
   **sechste Instanz derselben Fehlerklasse an diesem Tag.**
4. Der Identitäts-Test war zunächst zu streng: Vier Seiten teilen den **Standardtitel** des
   Layouts, das ist keine Kopie. **Nebenbefund, nicht behoben:** `/kontakt`, `/feedback`,
   `/tryouts` und `/installieren` setzen keinen eigenen Seitentitel.

### Offen

- **Vivien:** Schwelle des Anschnitts (öffnet schon bei 5 px verborgen) · mobile Ankerlandung
  von `/#news` (obere Bildschirmhälfte bleibt leer) · geduldeter 320-px-Anschnitt der
  Überschrift · Silbentrennung trennt jetzt auch **Vereinsnamen** (MÖNCHENGLAD-BACH).
- **Kai:** vier weitere Testlücken aus seinem Bericht (u. a. der Datenschutz-Test fängt
  „vertauschte", nicht nur „identische" Zahlen nicht) · fehlende Seitentitel.
- **Nele:** Auflage – die Überschrift „Eine Saison, sechs Spielzüge" kann nicht mehr
  umformuliert werden, ohne die Geometrie neu zu messen (bewacht durch
  `landing-ueberschrift.spec.mjs`).

**Commit `96eba14`.**

---

## 19.08.2026 — Hero „Der Abschluss": der Dunk als Linienzeichnung, und acht Roadmap-Punkte fallen mit dem Ball

**Auftrag Patrick über Vivien.** Zwei Vorlagen: `docs/HERO-DUNK-KONZEPT-2026-08-19.md`
(figurlose Fassung, von Patrick gewählt) und `docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`
(Nele: der Hero bekommt eine primäre Handlung). **Nicht deployt, nicht gepusht** — Patrick
entscheidet, danach laufen die Gates (Kai, Tobias).

### Was gebaut ist

**Neu: `components/landing/HeroDunk.js`.** Ein Dunk als Linienzeichnung in der Strichsprache
des vorhandenen Spielfelds: Ring, Netz, Zug zum Korb, Ball. **Kein Körper** — gezeichnet wird
die Notation, der Mensch entsteht aus der Bahn. Zwei viewBox-Fassungen (500×800 hoch,
1040×700 quer), Umschalter per `@media (min-aspect-ratio: 1/1)`.

**`components/landing/HeroScrollStage.js` von rund 1.350 auf 235 Zeilen.** Der Controller
zeichnet scroll-gebunden (umkehrbar) und löst den Abschluss **einmal** aus; der läuft dann
420 ms zeitgesteuert. Danach bleibt die Zeichnung stehen — ein Spielzug, der stattgefunden
hat, hat stattgefunden.

**Hero-Inhalt reduziert (Nele):** Abzeichen raus · Absatz raus · drei Tasten → **eine**
(„Profil anlegen" → `/signup?src=home-hero`) · eine Kleinzeile „Kostenlos · ab 16 Jahren".
Überschrift unverändert (Nora-Präzedenz). **Sechs Dinge im Hero wurden vier.**
„Team gründen" ist als Textzeile in `LandingCTA.js` gewandert — und dabei auf `/signup?next=`
statt `/team/register` gelegt, weil Letzteres Ausgeloggte in ein **Anmeldeformular** schickt.

**Gelöscht:** `PlayDiagram.js` · `SwishSequence.js` · `BallSprite`/`BALL_SPRITE_FRAMES` ·
`public/images/ball-basketball-32x200.{avif,webp}` (272 KB) · `public/images/swish/` (332 KB) ·
`scripts/generate-ball-rotation.mjs` · `scripts/generate-swish-sequence.js` ·
`rail-goal-flash` in `app/globals.css`. **Die Startseite lädt wieder null Bytes Bilddaten.**

**Fortschritts-Leiste:** Die Landung am Ende ist eine **stehende Endmarke** geworden — kein
Farbblitz, keine überschwingende Lande-Kurve, und das Korb-Emblem steht ab dem ersten Bild da
statt erst bei der Ankunft aufzudämmern. Die Geometrie („der Ball ruht IM Netz") bleibt.

### ⚠️ Der wichtigste Befund des Tages — und er war still

**`pathLength="1"` wirkt nicht, wenn am selben Pfad `vector-effect: non-scaling-stroke` steht.**
Der Browser rechnet das Strichmuster dann im Gerätemaß: aus `stroke-dasharray: 1` wird 1 px an,
1 px aus. **Jede noch nicht gezeichnete Linie steht dadurch dauerhaft als feine Punktlinie im
Bild** — unabhängig vom Versatz, ohne Konsolenfehler, ohne kaputtes Layout.

Gefunden nur daran, dass im ersten Bild zwei Diagonalen standen, wo per Konstruktion nichts
stehen durfte. **Der Fehler war vermutlich schon in `PlayDiagram.js`** und ist nie aufgefallen,
weil die Taktiktafel bei Deckkraft 0,171 lief — ein Geist bei 17 % ist unsichtbar. Erst die
Anhebung von `ARC_MAX` auf 0,62 hat ihn ans Licht geholt.

Abhilfe: Der Controller misst jede Pfadlänge **einmal** beim Aufsetzen (`getTotalLength()`,
funktioniert auch an einer per `display:none` ausgeblendeten Fassung) und fährt das
Strichmuster in absoluten Einheiten.

### Sieben Testdateien gelöscht — keine stumm

`hero-ball-laufzeit` · `hero-konturkanal` · `hero-abstand` · `hero-einflug` ·
`hero-resize-im-flug` · `hero-auth-tausch` · `ball-sequenz`. Für **jede** steht in
`tests/e2e/README.md` (Abschnitt „Entfallene Tests"), was sie bewacht hat, warum der Gegenstand
weg ist und wo die Frage — falls sie weiterlebt — jetzt gestellt wird. `rail-ankunft.spec.mjs`
ist nicht gelöscht, sondern verkleinert: Der Farbblitz-Fall (Tobias B-a) ist entfallen, der
Geometrie-Fall (B-b) gilt unverändert; an seine Stelle tritt ein Fall, der prüft, dass die
Endmarke **vor** dem Scrollen dasteht.

**Neu: `tests/e2e/hero-dunk.spec.mjs`, 42 Fälle über neun Viewports** (Höhenachse von Anfang an
drin) — P1 Kontrastfenster · P2 der Korb ist im Bild, wenn der Ball fällt · P3 der Abschluss
hängt an der Zeit, nicht am Scroll (mit Ehrlichkeitsschranke: unter 8 beobachteten
Positionswechseln gilt der Lauf als **nicht gemessen**, nicht als grün) · P4 der Umschalter ist
das Seitenverhältnis · plus zwei Regeln gegen den Punktlinien-Geist und für das Standbild bei
reduzierter Bewegung.

### Gemessen (Production-Runtime, `npm start`)

**Gesamtsuite: 176 bestanden + 1 übersprungen (177 Fälle in 23 Dateien).** `npm run build`
durch. `npm run design-audit --check` ohne Abweichung (Baseline auf den 19.08. nachgezogen —
⚠️ der größte Teil der Drift war schon bei `062989e` da, also vor diesem Umbau).

- **P1, gerechnet und am angewandten Stil nachgemessen — auf zwei Nachkommastellen identisch
  mit der Konzepttabelle:** Feld 0,279 → 1,54 : 1 gegen den Grund, Text darüber 11,32 : 1 ·
  Netz 0,341 → 1,75 / 9,95 · Ring in Ruhe 0,434 → 2,15 / 8,13 · Zug 0,558 → 2,81 / 6,20 ·
  Abschluss 0,620 → **3,21 / 5,43**. AA-Bruch läge bei wirksamer Deckkraft 0,72.
- **P2:** Ring auf allen neun Viewports mehr als 24 px unter der Navigationsleiste, Ball bei der
  Landung vollständig im Bild. Das ist Roadmap 20 (d) als **Bedingung vorher** statt als Befund
  nachher.
- **P3:** Abschlussdauer im Fenster 380–460 ms, ≥ 8 Positionswechsel; ±12 px Scrollen um die
  Schwelle ändert die Ballposition um **0 px**.
- **P4:** genau eine Fassung sichtbar je Viewport, 768×1024 auf der **Hoch**-Seite.
- **Zug kreuzt die Ringellipse nicht** (400 Abtastpunkte je Bezier, minimaler Ellipsenwert
  2,59 hoch / 2,62 quer — 1,0 wäre die Kante).

**Vier Gegenproben gelaufen, alle vier fangen ihren Defekt:**
Längenmessung abgeklemmt → Punktlinien-Test rot · Umschalter auf `min-width: 768px` → genau
768×1024 rot · Abschluss an den Scroll gehängt → P3 rot · `non-scaling-stroke` wieder
angebracht → „die fertige Zeichnung ist auf jedem Maßstab vollständig" rot.
⚠️ **Und eine fünfte Gegenprobe war zunächst ein falsches Grün:** Sie lief gegen die
Production-Runtime, die noch den ALTEN Build auslieferte — die Sabotage war nie kompiliert.
Wiederholt gegen `next dev`, das jede Änderung übersetzt. **Eine Gegenprobe gegen einen
veralteten Build beweist nichts.**

### ⚠️ Zwei Messfallen, in die ich selbst gelaufen bin

**(1) Die Browser-Vorschaufläche war ausgeblendet** (`document.hidden === true`) — dort laufen
keine rAF-Bilder. Der Abschluss stand bei 6,69 von 156 Einheiten still. **Kein Produktfehler**,
sondern genau die Falle, die in CLAUDE.md steht; hätte ich sie gemeldet, wäre es ein Fehlalarm
über die Kernmechanik dieses Umbaus gewesen. Gemessen wurde danach mit Playwright gegen echtes
Chromium.

**(2) Mein erster Prüflauf lief in seinen Zeitablauf, und der Fehler war meiner:**
`waitForSelector(".hero-dunk")` wartet auf **Sichtbarkeit** und nimmt den ersten Treffer — im
Querformat ist das die ausgeblendete Hochformat-Fassung. Behoben mit `state: "attached"`.

### ⚠️ Zwei weitere stille Befunde, beide erst am gebauten Stück sichtbar

**(1) Derselbe `pathLength`-Fehler kam in zweitem Kostüm zurück — mein erster Fix war halb.**
Ich hatte `non-scaling-stroke` stehen lassen und nur die Länge absolut gesetzt. Das
Strichmuster gilt unter `non-scaling-stroke` aber im **Gerätemaß**: Bei Maßstab 1,231
(1280×800) ist der Pfad 867 Geräteeinheiten lang, das Muster nur 704,6 — **19 % jeder Linie
fehlten**, sichtbar als offener Ball und als Zug, der kurz vor dem Korb aufhört. **Auf 360 px
unsichtbar** (Maßstab 0,92: ein zu langes Muster deckt vollständig), **und mein Test war
grün** — er verglich beides in Benutzereinheiten, also in der falschen Einheit.
**Richtig gemessen, in der falschen Einheit** – dieselbe Fehlerform wie „Bühne statt
Sichtfeld" aus Roadmap 20b. Endgültige Abhilfe: `vector-effect` fällt aus der ganzen
Zeichnung; der Strich skaliert jetzt mit (1,9–4,9 px).

**(2) Ein orangefarbener Streupunkt über der Taste, wo noch nichts gezeichnet sein durfte.**
`toFixed(2)` machte aus dem Versatz 188,522 den Wert 188,52 — die verbleibenden **0,002 px
Strich** zeichnete `stroke-linecap: round` als **vollen Punkt in Strichbreite**. Abhilfe:
nicht runden UND die Lücke im Strichmuster 2 px länger machen als den Pfad.

### ⚠️ Und ein Kontrast-Befund, der zwei Gestaltungsentscheidungen erzwungen hat

Das erste Kontrast-Prüfmaß prüfte nur `paper-50` — so hatte das Konzept gerechnet. Gemessen
lag aber die **Kleinzeile unter der Taste** (`text-mist-400`) über der stärksten Linie bei
**2,79 : 1**. Sie steht jetzt in `paper-100` (mindestens 4,84 : 1 über jeder Ebene).

Die zweite Fassung prüfte jede Textfarbe gegen jede Ebene und meldete „Community"
(`brand-400`) mit 3,63 : 1. Eine exakte Messung (`isPointInStroke()`), welche Linie welchen
Text wirklich berührt, entlastete das Wort auf 360/375/768/1280/1440 — **aber nicht auf
1024×768**, wo der Zug es mit 2,77 : 1 kreuzt.
⚠️ **Geometrie löst das nicht:** Der Ball muss über dem Ring stehen, der Ring steht auf halber
Bühnenhöhe, dort steht der mittig gesetzte Inhalt. Auf kurzen Querformat-Bühnen liegen
Zug-Spitze und Überschrift zwangsläufig im selben Band. Aufhellen löste es auch nicht —
`brand-100` hält zwar 4,74 : 1, ist am gebauten Stück aber ein blasses Creme neben einer
weißen Zeile.
**Entscheidung: Die Hero-Überschrift verliert ihren Farbakzent.** Ursache ist, dass das
Designsystem genau EIN Orange erlaubt und es nach der Reduktion drei Dinge beanspruchten —
Taste, Überschriftswort, Zeichnung. Das schwächste ist das Wort: Es markiert nichts, was ohne
Markierung übersehen würde. ⚠️ **Abweichung von `docs/VISUELLE-RICHTUNG-2026-08-12.md`,
ausdrücklich nur für diesen Hero — Patrick kann sie überstimmen**, dann muss der Befund auf
1024×768 anders gelöst werden.

### Abweichungen vom eigenen Konzept

Fünf, alle nach dem Blick aufs gebaute Stück, vollständig belegt im Nachtrag des Konzepts
(`docs/HERO-DUNK-KONZEPT-2026-08-19.md`, Abschnitte A–C): Netz steht ab dem ersten Bild statt zu
fallen · Netz kürzer und dichter · **die Hand entfällt ersatzlos** (zwei Striche am Ende einer
Kurve lesen sich als Gabel, nicht als Hand — und die Notation hieß ohnehin „Bahn, Ring, Netz,
Ball") · Drei-Punkte-Bogen entfällt · Ring in Ruhe auf 0,70 statt 0,45, weil das Konzept sonst
seine eigene 2 : 1-Untergrenze verletzt hätte.

### Was NICHT geprüft ist

- **Der Abschluss ist nicht als Bewegung angesehen worden**, nur über Dauer und Zahl der
  Positionswechsel gemessen. Eine Bildschirmaufnahme wäre möglich (`ffmpeg` ist seit dem
  19.08. installiert) und ist nicht gemacht.
- **Echte Geräte:** Alle neun Viewports haben feste Fenstergrößen. Auf dem Handy ändert sich
  die Fensterhöhe **während** des Scrollens (Browserleiste) — ungemessen.
- **Eingeloggter Hero** nicht im Browser gesehen (die Testkonten auf Prod sind entwertet; lokal
  wäre es möglich gewesen, ist aber nicht geschehen).
- **Kein Gate.** Weder Kai noch Tobias haben diesen Stand geprüft.
