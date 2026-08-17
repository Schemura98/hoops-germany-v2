# Hoops Germany – Vollständige Projektspezifikation
## Briefing für Claude Code Neustart

---

## 0. AKTUELLER STAND (Überblick · Stand 17.08.2026)

> 🟢 **v2 IST LIVE auf https://hoopsgermany.de** (seit 24.06.2026). Hostinger-VPS `92.113.25.249`
> (Ubuntu 24.04), Code in `/root/hoops-v2` (Branch **`redesign`**), PM2-Prozess **`hoops-v2` auf Port 3001**,
> DB **`hoops_prod`** (Atlas). Alte Seite läuft als Rollback-Fallback weiter (PM2 `sports`, Port 3000,
> DB `test`) → Rollback = Nginx zurück auf 3000. Deploy: `cd /root/hoops-v2 && git pull && npm run build &&
> pm2 restart hoops-v2` (bei neuen Dependencies vorher `npm install`). Claude-SSH-Key `~/.ssh/hoops_vps`
> (lokal); VPS-Repo-Zugang via Deploy-Key (SSH-Alias `github-hoops`).
> ✅ **DEPLOYT: `f27736a`** (17.08.2026 abends) – am Server verifiziert, Abstand
> zu `origin` 0, `pm2 restart` gelaufen, Prozess `online`.
> ✅ **Production-Runtime VOR dem Deploy geprüft** (`npm start` auf frischem Build,
> `BUILD_ID` kontrolliert): 16 Routen je 200, Skip-Link und `<main>` vorhanden,
> Konturkanal ≥ 10 auf allen mobilen Breiten, **0 Laufzeitfehler**. Das war Kais
> offene Auflage aus Runde sieben.
> ✅ **Live über die DOMAIN nachgemessen:** 16 Routen je 200 · Kanal 10,18 (360) /
> 10,23 (368) / 13,17 (375) / 30,91 (412) / 39,66 (430) · Ball auf keiner Breite im
> Textblock · wirksame Sichtbarkeit 0,80 · Skip-Link und `<main>` da · 0 Fehler ·
> Cache-Vorgabe unverändert.
> ⚠️ **ZUM DRITTEN MAL STIMMTE DIESE ZEILE NICHT — diesmal aus einem neuen Grund:**
> Sie führte `f46a783` als live, der Server stand aber schon auf `40dff48`. Eine
> **andere Sitzung** (Skip-Link) hatte selbst deployt. Vorher lag es zweimal daran,
> dass committet und die Zeile gepflegt wurde, ohne zu deployen; jetzt kann auch
> das Gegenteil passieren. **Der Befehl bleibt maßgeblich, nie die Zeile:**
> `ssh … "cd /root/hoops-v2 && git log --oneline -1"`
> ⚠️ **Und die Prüfbasis hat sich unter beiden Gates bewegt:** Die Skip-Link-Arbeit
> landete per Fast-Forward auf `redesign`, während Kai und Tobias `f5b1b3f`
> prüften. Kai hat gewarnt, weil sie `app/page.js`, `app/layout.js` und
> `app/globals.css` berührt – die Flächen, die Bühnenhöhe und Eyebrow-Lage
> bestimmen. **Nachgemessen: das Fundament hielt** (elf Breiten, identische Werte).
> Es ging gut aus; die Regel bleibt trotzdem, dass parallele Sitzungen einen
> eigenen Worktree brauchen (Methodik-Lehre 0).
> ⚠️ **Zwei Dinge, die dieser Deploy über das Vorgehen gelehrt hat:**
> (1) Der Server trug eine **lokale Änderung an `package-lock.json`** (nur entfernte
> `libc`-Metadatenfelder, Artefakt einer älteren npm-Version – **keine Paketversionen betroffen**).
> `git pull` wäre kollidiert; verworfen mit `git checkout -- package-lock.json`, nachdem der Diff
> angesehen war. **Vor dem Verwerfen hinsehen, nicht danach.**
> (2) **`npm install` war NICHT nötig** – in den 31 Commits änderte sich nur eine *devDependency*
> (`@playwright/test`), der `dependencies`-Block ist unverändert. Ein `npm install` hätte Playwright
> samt Browsern auf den VPS gezogen. **Also prüfen:**
> `git diff <live>..HEAD -- package.json` – und nur bei echten `dependencies` installieren.
> ⚠️ **Roadmap 21 ist mit diesem Deploy scharf geworden:** Die Ball-Sequenz (107 KB AVIF) liegt
> unter `/images/` und hat **keine Cache-Vorgabe** – auf der Einstiegsseite jedes Erstbesuchers,
> bei jedem Aufruf neu.
> ⚠️ **Diese Zeile stand tagelang auf „fünf Commits" und war damit um den Faktor fünf falsch** –
> es wurde committet und die Zeile gepflegt, ohne den Abstand zum Deploy neu zu zählen. Genau
> die Fehlerform, die weiter unten schon zweimal für den Rollback-Zeiger protokolliert ist.
> **Nicht schätzen, zählen:** `git rev-list --count 164c784..HEAD`.
> ✅ **Stand nach Runde SIEBEN: beide Gates freigabefähig mit Auflagen** – die
> Auflagen sind umgesetzt, ebenso Tobias' H1. Build durch, Playwright **225/225** (gegen `--list`
> abgeglichen). Live ist `f46a783`; auf `redesign` liegt der Stand danach.
> ⚠️ **Der Hauptbefund der Runde war eine Zusicherung, die es nicht gab:** Der
> Kommentar, mit dem ich das Streichen der Bildzahl-Schwelle begründet habe,
> verwies auf ein „≤ 80 ms"-Stillstands-Maß im Laufzeit-Test – **das existierte
> nicht.** Kai und Tobias haben es **unabhängig** gefunden. Kais Einordnung: sein
> K4-Muster eine Ebene höher, *nicht eine Konstante ohne Verwendung, sondern eine
> **Übergabe an nichts***. Es ist jetzt gebaut, mit Tobias' Bewegungsvorbehalt.
> ⚠️ **Und die Regressionslücke war groß:** Kais Matrix zeigte **13 von 14**
> Umkehrungen dieses Mechanismus stumm, darunter die Verankerung selbst.
> Ursachen: 360/368 px kamen in **keiner** Viewport-Liste vor, „wirksam sichtbar"
> bleibt auch bei kaputter Lage 80 %, und **niemand prüfte den Kanal**, den
> Vivien zur Vorgabe gemacht hatte. Geschlossen durch
> `tests/e2e/hero-konturkanal.spec.mjs`.
> ⚠️ **Die zwei Zahlen in diesem Absatz waren beim letzten Mal beide falsch** (Befund Kai:
> „24" statt 27, „146/146" statt 150/150) – und sie stehen unmittelbar unter der
> Anweisung „Nicht schätzen, zählen". **Die Regel hat sich selbst eingeholt.** Beide Zahlen
> sind messbar: `git rev-list --count 164c784..HEAD` und `npx playwright test --list`.
> Kais Deploy-Empfehlung war „noch nicht", begründet mit einem 20-px-Satz nach der Landung auf
> jedem mobilen Laden – der ist behoben und durch drei neue Tests gedeckt. **Offen sind fünf
> Gestaltungspunkte bei Vivien** (s. Roadmap 20c) sowie zwei bewusst zurückgestellte
> Prüf-Lücken (Kais M7/M8; die Abdunkelung greift mobil überhaupt nie).
> **Zuletzt deployt: `164c784` (15.08.2026 abends, am Server verifiziert).** Newsfeed-Umbau
> („Die Anzeigetafel nach dem Spiel") nach zwei Gate-Runden. Kern: **`beidseitigBelegt()` in
> `lib/matchScore.js`** – die EINE Quelle für jede Aussage mit dem Wort „bestätigt".
> ⚠️ **Warum das der wichtigste Fix des Tages ist:** Live nachgemessen tragen **137 von 137**
> abgeschlossenen Spielen auf Prod `resultStatus: "confirmed"` **ohne** beidseitiges
> `submittedBy` (Seed-Bestand). Der Zwischenstand hätte also **jedes einzelne Spiel** als
> „beidseitig bestätigt" ausgewiesen – kein Randfall, der Gesamtbestand.
> Weiter: Anzeigetafel mit drei Registern (inkl. **„Deine Zahlen"** – die erste eigene Zahl, die
> der Newsfeed je zeigte) · zwei Zonen statt drei Spalten (Feed 700 px statt 544) · Feed mit
> zwei Rängen · eine Schiene statt fünf Karten · Checkliste ab 50 % einzeilig (504 → 39 px) ·
> erster Beitrag mobil bei **y = 888 statt 1491**.
> ✅ Live geprüft: sieben Seiten je 200, `/match/[id]` zeigt korrekt **kein** Beleg-Abzeichen.
> Alt-Beiträge im Feed tragen weiter „Endergebnis" – das ist für ein Admin-Ergebnis **wahr**,
> es steht also nirgends live eine Falschaussage (`syncMatchResultPost` läuft nur bei einer
> Änderung am Spiel; ob nachmigriert wird, ist eine Entscheidung, kein Fehler).
> Davor: **`074bcf1`** (15.08.2026, am Server verifiziert – `pm2 restart` gelaufen,
> Live-Seiten je 200, Sicherheitsfix am echten Verein nachgemessen). Sechste/siebte Runde:
> **öffentlich abrufbare Einladungstoken geschlossen** (`app/api/team/fetchsingleteaminfo`) ·
> Positions-Platzhalter vereinheitlicht · **Newsfeed-Filter ragte in den Feed**.
> ⚠️ **Der Sicherheitsfix allein reichte nicht:** Er stoppt das Leck, entwertet aber nicht die
> zwei bereits abrufbaren Token (`send-invite-email` erneuert nur `if (!claimToken)`,
> `slotsFreigeben` fasst offene Plätze nie an). Die zwei Token auf `hoops_prod` wurden deshalb am
> 15.08. **rotiert** (Entscheidung Patrick; `tmp/prod-claimtoken-rotieren.mjs`, Beleg über die
> Tokenlänge: 0 alte / 2 neue, `add-slot` erzeugt 32 Hex-Zeichen, die Rotation 48).
> ⚠️ **Folge, die jemand wissen muss:** Die bis dahin verschickten Einladungslinks dieser zwei
> Kaderplätze sind tot. Der Team-Admin (Mönchengladbach Scorpions e. V.) muss sie im Panel neu
> verschicken – **niemand hat ihn benachrichtigt.**
> ⚠️ **Zur Zeile selbst:** Hier stand `cabb62d`, am Server lief `da1abca`. Das war diesmal
> harmlos (`da1abca` ist ein reiner Doku-Commit direkt nach `cabb62d`, also derselbe Code) –
> aber die Zeile soll ab jetzt den **Zeiger nennen, den `git log` AM SERVER ausgibt**, nicht den
> Commit, den man für den letzten Codestand hält.
> Davor: **`cabb62d`** – fünfte Runde: **alle elf
> offenen Gate-Punkte** aus Roadmap 15 abgearbeitet. Kern: **`lib/scrollSperre.js`** (zwei Overlays
> hinterließen bei falscher Schließreihenfolge eine **dauerhaft gesperrte Seite** – nur ein Reload
> half) · Hinweis auf `/team/create` für alle, die dort landen, obwohl sie im Kader stehen (sonst
> versehentlich ein Zweitverein) · Kaderkarte ohne doppelte Position (die rechte Spalte trägt jetzt
> **nur** Status) · Glocken-Leerzustand für alle Rollen · Tour-Schritt 3 ausgeloggt ehrlich ·
> optimistisches Speichern wird bei Fehlern zurückgenommen. Davor: **`551ab46`** – vierte Runde: **Notiz an den
> verdrängten Team-Admin** (`team_admin_revoked`; er verlor die Rechte seit der dritten Runde und
> hätte es erst gemerkt, wenn `/team/admin` ihn abweist – ausgelöst an **drei** Stellen, inkl. dem
> `remove`-Zweig, der ebenfalls schwieg) · Klickziel bewusst **nicht** `/team/admin`, sondern die
> Vereinsseite · Notiz erst **nach** dem Speichern des Nachfolgers, sonst nennt sie jemanden, der
> nie einer wurde. Davor: **`2503433`** – dritte Runde: **stille Notiz
> an den umgehängten Spieler** (neuer Typ `team_assigned`; er war sonst die einzige Person, die von
> einer Änderung an seinem Profil nichts erfährt – nur bei ECHTER Zuordnungsänderung) ·
> **Symbol-Tabelle `NOTIF_ICON` für BEIDE Glocken** (die in `Navbar.js` hatte gar keine und zeigte
> für jeden Typ einen Basketball) · **verdrängter Team-Admin verliert seine Rechte** (er behielt
> über `teamAdminOf` vollen Zugriff auf `/team/admin`, obwohl das Team auf jemand anderen zeigte –
> in `setteamadmin` UND `transfer-team-admin`) · `positionLabel` mit `hasOwnProperty`
> (`position: "__proto__"` hätte `/spieler` und `/transfermarkt` für alle Besucher zerlegt).
> Davor: **`9f9fb77`** – zweite Runde des Tages:
> **Admin-Korrekturen posten nicht mehr öffentlich** (`recordTransfer({ still: true })`, nur in
> `setteamadmin` – Entscheidung Patrick auf Kais Befund) · **Rechtsverweise auf ALLEN drei
> kontoerzeugenden Wegen** (`components/layout/RechtsLinks.js`; sie fehlten auf `/team/join` und
> `/team/claim` völlig – Noras einziger Pflichtpunkt, Art. 13 DSGVO/§ 5 DDG) · **„ab 16" wird
> begründet, bevor das Formular ausgefüllt ist** (Neles Texte auf `/signup`, `/about`, beiden
> Einladungsseiten; die sechs Mindestalter-Meldungen liegen jetzt in `lib/constants.js`) ·
> **Sicherheitsfix `positionLabel`** (`position: "__proto__"` gab `Object.prototype` zurück und
> hätte `/spieler` und `/transfermarkt` für alle Besucher zerlegt – Befund Kai) · Fokusfalle,
> mobiles Menü mit Escape, Avatar-Zitat im Textfluss.
> Davor: **`5b84f69`** – Linas erster Einsatz: **Plattform-Tour ohne Konto**
> repariert (sie ist über den Footer ausgeloggt erreichbar und meldete dort einen Speicherfehler
> über einen Versuch, den es nie gab; Schlussfolie „Du hast schon angefangen" über „0 von 4 · 0 %";
> beide Ausgänge führten in die Anmeldemaske) · **Tour-Schritt 1 versprach zu viel** (doppelt
> bestätigt ist das *Ergebnis*, nicht der Box-Score) · **„Mein Profil" wird im Onboarding
> demonstriert** (Avatar-Zitat) · Klickflächen, Escape in der Suche, Transfer-Protokoll in
> `setteamadmin`. Nach Gates von Kai und Tobias, deren Befunde in `582d59d` eingearbeitet sind.
> Davor: `3c38959` (Altersnachweis, s. u.), `5073951` (Alt-Ligen bleiben bedienbar), `560e1e6`
> (**Newsfeed-Umbau**: Spieltag-Leiste am Kopf; Footer mit Impressum/Datenschutz, das fehlte dort
> völlig; `h1`; mobil beginnt der Feed 500 px weiter oben), `27a04fe` (Kaderplatz-Freigabe, acht
> Wege), `e7a38ce`, `275f124` (Nachtschicht).
> **Rollback-Kette:** `f27736a` (aktuell live) → `40dff48` → `f5b1b3f` → `f46a783` → `84cb7ba` → `75f2c3a` → `bc7ccad` → `6e2fbe1` → `1bcf854` →
> `4d03ba2` → `76aa289` → `1d2e3ae` → `1dc617f` → `d07c475` → `2be664e` → `cd51c92` →
> `164c784` (der Stand vor dieser Serie, bis 17.08. live) → `66f9000` → `4f64af7` → `4f3811d` (Newsfeed-Umbau,
> von beiden Gates blockiert – NICHT dorthin zurück) → `f23757b` → `074bcf1` (letzter Stand vor
> dem Newsfeed-Umbau) → `48e8a16` → `c65419d` → `da1abca` (der Stand vom
> 15.08. vor dieser Runde) → `cabb62d` (fünfte Runde) → `551ab46` (vierte Runde 14.08.) → `2503433` (dritte) → `9f9fb77` (zweite) →
> `5b84f69` (erste) → `5197d2c` (der Stand, der bis zum 14.08. tatsächlich lief) → `3c38959` →
> `5073951` → `560e1e6` → `27a04fe` → `e7a38ce` → `275f124` → `a8e4fd4` (vor der Nachtschicht) →
> `562c629` (vor dem gesamten Redesign). Auf dem VPS per
> `git checkout <hash> && npm run build && pm2 restart hoops-v2`.
> ⚠️ **Zum zweiten Mal in zwei Tagen stimmte diese Zeile nicht:** Sie führte `3c38959` als
> zuletzt deployt, auf dem Server lief aber `5197d2c` (am 13.08. war es `78d833a` gegen
> tatsächlich `a8e4fd4`). Der Grund ist immer derselbe – es wird committet und die Zeile
> gepflegt, ohne dass derselbe Vorgang auch deployt. **Vor jedem Rollback am Server nachsehen
> (`ssh … "cd /root/hoops-v2 && git log --oneline -1"`), nicht dieser Zeile glauben.**
>
> ⚠️ **PLATTFORM AB 16 JAHREN** (Entscheidung Patrick, 13.08.2026). Wirkt an **fünf** Stellen:
> `LEAGUE_AGE_GROUPS` = `["Senioren", "U18"]` (eine U16-Liga ist die Altersklasse UNTER 16) ·
> **`/signup`**, **`/team/join/[token]`** und **`/team/claim/[token]`** verlangen die
> Selbstauskunft „mindestens 16" · `playerregister` erzwingt sie **serverseitig** ·
> der **Google-Weg** legt neue Konten nur mit dem Cookie `g_oauth_minage` an ·
> `update-profile` weist ein **neu eingetragenes** Geburtsdatum unter 16 ab.
> Bewusst **kein Pflicht-Geburtsdatum**: `age`/`birthdate` sind über die öffentliche Profil-API
> einsehbar – ein Pflichtfeld hätte die Datenmenge vergrößert. Beleg je Konto:
> `Player.minAgeConfirmedAt`.
> Auf `hoops_prod` wurden 9 U16-Ligen, 4 Demo-Teams, 4 Beispielprofile entfernt; **kein echter
> Datensatz war betroffen, 0 echte Profile unter 16**.
> ⚠️ Ein Test in `tests/e2e/auth.spec.mjs` liest den **Quelltext** und prüft, dass jeder
> Aufrufer von `playerregister` die Bestätigung mitschickt – genau diese Lücke ließ die
> Einladungswege an 19 grünen Tests vorbei brechen. **Neuer Aufrufer ⇒ Feld mitschicken.**
> ✅ **Geklärt am 14.08.2026 (Nora, `docs/RECHT-MINDESTALTER-2026-08-14.md`): Die Selbstauskunft
> ist das richtige Instrument und darf NICHT zur Einwilligung umgebaut werden.** Art. 8 DSGVO
> greift nur bei Einwilligung als Rechtsgrundlage – die Datenschutzerklärung nennt aber Vertrag
> (lit. b); und „Ich bin mindestens 16" ist eine **Tatsachenangabe, keine Willenserklärung**
> (man widerruft sein Alter nicht), als Einwilligung formuliert trüge der Satz im Streitfall
> nichts. Art. 28 DSA stützt zusätzlich die Entscheidung gegen ein Pflicht-Geburtsdatum.
> ⚠️ Beim Anwalt (im ohnehin geplanten Termin, kein neuer Kostenpunkt): **§§ 107, 108 BGB** –
> ist der unentgeltliche Nutzungsvertrag mit einem 16-Jährigen ohne Eltern wirksam? Wenn nein,
> wackelt lit. b. Dazu F4-a bis F4-c aus Noras Befund.
> ⚠️ Der Google-OAuth-Weg ist lokal nicht testbar (keine Keys) – **einmal echt auf Prod
> durchspielen**.
> ⚠️ **Entscheidbar für Patrick:** Bestandskonten von vor dem 13.08. haben keinen Altersbeleg,
> und `models/Player.js` verbietet zu Recht das nachträgliche Setzen. Einmalige Bestätigung
> beim nächsten Login? In der Testphase billig.
>
> ⚠️ **Wer `Player.teamId` ändert, MUSS `slotsFreigeben` aufrufen** – die verbindliche Liste aller
> acht Wechselwege steht im Kopf von `lib/rosterSlots.js`. Sie war dreimal hintereinander
> unvollständig (zwei → vier → acht); zweimal erzeugte der Fix selbst ein Folgeproblem
> (verwaister `claimToken` = wiederverwendbarer Einladungslink; leerer Kaderplatz ohne
> Einladungs-Knopf). Beides gefunden von Kai, beides vor dem Deploy behoben.
>
> 🌙 **NACHTSCHICHT 13.08.2026** (Details: Chronik) – autonom gelaufen, sechs Stränge. Kern:
> **Ronjas Retention-Befund** (`docs/RETENTION-BEFUND-2026-08-13.md`) – **keine fehlende
> Funktion**, sondern überall fehlende **Verbindungen** zwischen bereits Gebautem. Ergebnis u. a.
> Benachrichtigung „Deine Zahlen stehen", Liga-Achse, `/tryouts`-Wege, Tour mit echten Handlungen.
>
> 🔎 **ENTDECKBARKEIT 14.08.2026** – **Lina Vogts erster Einsatz**
> (`docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md`): Sie fragt nicht wie Ronja „warum kommt jemand
> **wieder**", sondern „findet ein Erstbesucher es beim **ersten** Mal überhaupt". Ihr Kernbefund
> war ein Defekt, den niemand gesucht hatte: Die **Plattform-Tour ist über den Footer ausgeloggt
> erreichbar** – die einzige Fläche, die vor der Registrierung erklärt – und war dort kaputt
> (Speicherfehler ohne Speicherversuch; „Du hast schon angefangen" über „0 von 4 · 0 %"; beide
> Ausgänge in die Anmeldemaske). Alles behoben, Wortlaute von Nele, Gates von Kai und Tobias.
>
> ⚠️ **Das wichtigste Dokument bleibt `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`** – *eine Zahl
> oder Aussage, die im Sinne des Codes stimmt und im Sinne des Lesers falsch ist*. Acht Fälle am
> 13.08. (u. a. Sponsoren-Report mit ungefilterten Beständen **und Klarnamen echter Spieler** –
> behoben, niemandem gezeigt), **vier weitere am 14.08.**: Tour-Schritt 1 versprach eine doppelte
> Bestätigung der **eigenen Zahlen** (doppelt bestätigt ist das **Ergebnis**, den Box-Score trägt
> **ein** Team-Admin ein) · der Such-Platzhalter verschwieg die mitdurchsuchten Ligen · „oben
> rechts" zeigte auf einen Avatar, den öffentliche Seiten nicht haben · und **mein eigener Fix
> erzeugte den nächsten Fall** (ein längst verfügbarer Spieler wurde aufgefordert, sich als
> verfügbar einzutragen – Befund Kai). **Vor jeder nutzersichtbaren Zahl oder Zusage dieses
> Dokument lesen.**
>
> 📜 **Vollständige Meilenstein-Chronik mit Commit-Hashes: `docs/CHRONIK.md`** (am 08.08.2026 wörtlich und
> verlustfrei aus diesem Abschnitt ausgelagert – dort stehen ALLE datierten Protokolle seit dem Go-Live).

### ⚠️ KRITISCHE Warnungen (vor jeder Arbeit lesen)
- **Datenbanken (KRITISCH – vor schreibenden DB-Aktionen lesen):** Cluster `hoops.tbhsg.mongodb.net`:
  - **`hoopsgermany`** = lokale **Dev-DB** des v2-Neubaus (lokales `.env`). `seed-demo.mjs` darf hier löschen/neu anlegen.
  - **`hoops_prod`** = **Produktiv-DB der Live-Seite v2** – schreibende Aktionen nur gezielt und abgestimmt.
  - **`test`** = **PRODUKTIV-DB der alten Live-Seite** (alter Code verbindet ohne DB-Namen → Default `test`).
    Echte Nutzer/Feedback. **NIEMALS schreiben/löschen.** Alte `test`-Daten erst beim **Cutover** löschen
    (alte Seite läuft bis dahin als Fallback). Launch-Entscheidung (final mit Patrick & Jonatan):
    kompletter Neustart, **keine Migration**.
- **Projektort:** `~/Projekte/hoops-germany-v2` (macOS, seit 15.08.2026) – **NICHT in einen
  synchronisierten Ordner legen**. Ein Sync-Dienst greift dauernd auf `.next/` und `node_modules/`
  zu, während Build und Dev-Server dort schreiben; unter Windows sperrte OneDrive dadurch `.next`.
  Auf dem Mac heißen die Kandidaten **iCloud Drive** (`~/Library/Mobile Documents/…`, auch
  `~/Desktop` und `~/Documents`, sobald „Schreibtisch & Dokumente" synchronisiert wird) und
  **Dropbox** (`~/Dropbox`). `~/Projekte` liegt bewusst außerhalb davon.
- **`npm run build` NIE parallel zu laufendem `next dev`** (überschreibt dessen `.next`-CSS → ungestylte
  Seiten/CSS-404; Dev-Server danach neu starten). Nach Dev-Server-Lock ggf. `.next` löschen vor dem Build.
  ⚠️ **Vor jedem Build den Port prüfen** – auf dem Mac (seit 15.08.2026) mit:
  ```bash
  sh scripts/port-frei.sh && npm run build
  ```
  Das Skript braucht keine Angabe zum System: Es hat **eine** Weiche, und die trennt Windows von
  allem anderen – macOS fällt in den POSIX-Zweig, nimmt dort `ss` falls vorhanden, sonst
  `lsof -tiTCP:3000 -sTCP:LISTEN` (auf dem Mac also `lsof`). Exit 1 = belegt, Exit 2 = nicht prüfbar.
  Ohne Skript geht auch `lsof -tiTCP:3000 -sTCP:LISTEN` oder schlicht ein `curl` gegen
  `http://localhost:3000`. **Nicht die Windows-Zeile `netstat -ano` übernehmen** – macOS lehnt sie
  mit „illegal option -- o" ab, und `-p` bedeutet hier **Protokoll**, nicht Prozess. ⚠️ `netstat -an
  | grep LISTEN` **funktioniert** auf dem Mac dagegen sehr wohl (am 15.08.2026 nachgemessen: findet
  die Listener); es nennt nur **keine PID**, taugt also zum Erkennen, nicht zum Beenden.
  ⚠️ **Der Grund für die Prüfung ist plattformunabhängig und bleibt:** `preview_stop` beendet den
  Dev-Server **nicht**, es löst ihn nur aus der Verwaltung – der Node-Prozess hält Port 3000
  weiter. Am 15.08.2026 lief ein Build zweimal in einen laufenden Dev-Server hinein, einmal davon
  trotz fünf vorheriger korrekter Prüfungen.
  *Historisch (Windows, bis 15.08.2026): Dort schrieb das deutsche `netstat` **`ABHÖREN`** statt
  `LISTENING`, weshalb `netstat | grep LISTEN` einen belegten Port als frei meldete – am 12.08.2026
  lief der Build genau deshalb in einen fremden Dev-Server. Auf dem Mac ist das gegenstandslos.*
- **Schema-Änderungen an Modellen greifen erst nach Dev-Server-Neustart** (mongoose cached das Model).
- **Vor Deploy immer die Production-Runtime testen** (`npm start`), nicht nur `next dev` (populate-Bug-Lehre).
- **Bei Neu-Deploy/Server-Umzug:** `deploy/nginx-hoopsgermany.conf` nach `/etc/nginx/sites-available/default`,
  Upload-Verzeichnisse `/var/www/hoops-uploads/{players,team,posts}` + Symlinks aus `public/…`
  (chown root:www-data, chmod a+rX) neu anlegen – sonst sind Bild-Uploads kaputt (Details: Chronik, 26.06./27.06.).

### Projektort & Umgebung
- **Lokaler Pfad: `~/Projekte/hoops-germany-v2`** auf macOS (Umzug von Windows am 15.08.2026,
  Hintergrund: `docs/UMZUG-WINDOWS-MAC.md`). **Nicht in einen synchronisierten Ordner verschieben** –
  iCloud Drive (inkl. `~/Desktop`/`~/Documents` bei aktiver Synchronisierung) und Dropbox greifen
  in `.next/` und `node_modules/` hinein, während dort gebaut wird. Genau daran scheiterte unter
  Windows OneDrive.
- **Agenten & Skills auf macOS nachgezogen (15.08.2026, Protokoll in der Chronik):** Vier Verweise
  zeigten ins Leere, obwohl die Dateien migriert **aussahen** – u. a. Maliks Pflicht-Skill
  `team-ausstattung` (liegt unter `~/.claude/skills/`, nicht im General Backoffice) und fünf
  **Zwitter-Pfade** `~\.claude\skills\` (macOS-Tilde + Windows-Backslashes, auf keinem System
  auflösbar). ⚠️ **Regel daraus:** Beim Umschreiben von Pfaden jeden neuen Pfad **gegen das
  Dateisystem halten**, nicht nur den Text lesen – „0 Ersetzungen" ist kein Erfolg, sondern ein
  unbeantworteter Zustand. Ebenso: Ein INSTALL-VERMERK beschreibt auch Zustand **außerhalb**
  seines Ordners (`~/.config/watch/.env` fehlte, der Skill hätte stumm neu eingerichtet).
- Next.js **14.2.35**, App Router, JavaScript (kein TS), Tailwind.
- `.env` lokal vorhanden (MongoDB-Atlas, `SECRET_KEY`, `CRON_SECRET`, `NEXTAUTH_URL=http://localhost:3000`). SMTP/Google noch leer.
- Start: `npm run dev` → http://localhost:3000. DB-Test: `node scripts/dbcheck.mjs`.
- **Demo-Daten befüllen: `node scripts/seed-demo.mjs`** (4 Teams, 18 Spieler + 2 Super-Admins,
  Liga 2025/26 + Vorsaison-Transfer für Max, abgeschlossene Spiele + Box-Scores, Posts, Follower,
  Bundesländer/Städte → Stats/Topscorer/Tabelle/Spielplan/Stationen/Geo-Filter gefüllt).
- **Test-Accounts (alle PW `test123`) – wirksam NUR NOCH auf der Dev-DB `hoopsgermany`:**
  Spieler `max@test.de` (= Team-Admin „Test Baskets",
  hat FIBA/Instagram + Vorsaison-Transfer), weitere `@test.de`, Free Agents `sven.adler@test.de`/`jay.carter@test.de`.
  **Super-Admins** (Spieler-Login): `p.schemura@gmail.com`, `jonatanbaenavides@gmail.com`;
  /admin-Panel: `admin`/`geheim1234` ODER `patrick`/`test123` · `jonatan`/`test123`. **`team@test.de` existiert NICHT mehr**.
  > 🔒 **VORFALL 15.08.2026 – diese Konten waren auf PROD anmeldbar.** Beim Newsfeed-Umbau lief
  > ein Login-Aufruf versehentlich gegen die Live-Seite statt gegen localhost – und
  > **`max@test.de` / `test123` funktionierte dort**, als **Team-Admin mit `teamAdminOf`**.
  > Das Passwort steht in dieser Datei: Wer die Projektdoku liest, konnte sich als
  > Vereinsverwalter anmelden – Kader ändern, Ergebnisse eintragen, Einladungen verschicken,
  > also in genau die Belegbarkeit hineinschreiben, die das Produkt verkauft. Das wog schwerer
  > als der `claimToken`-Leak vom selben Tag: Dort brauchte es erst einen Token aus einer
  > API-Antwort, hier genügte eine Zeile Dokumentation.
  > ⚠️ **Mein erster Riegel war unvollständig – zweimal falsch, beides Befund Kai (A1/A2).**
  > Ich meldete „47 Konten entwertet, der Riegel sitzt". Beides stimmte nicht:
  > **(1) Die Inventur war zu eng.** Ich suchte nach **Adressmustern** und übersah dadurch
  > die Domain **`@demo.de`** aus `seed-world.mjs` – **345 Konten** mit `test123`. Kais
  > Ansatz findet sie sofort: nicht nach Domains suchen, sondern die bekannten Passwörter
  > gegen **jeden Hash** probieren. Gemessen: **346 Konten mit bekanntem Passwort, davon
  > 41 Team-Admins.**
  > **(2) Das Passwort ist gar nicht der entscheidende Weg.** Zwei Pfade lesen `password`
  > **nie**: `app/api/auth/google/callback` matcht per `$or: [{googleId}, {email}]` und
  > adoptiert ein bestehendes Konto ohne jede Prüfung · `forgotpassword` → `resetpassword`
  > ist unauthentifiziert, ungedrosselt und verlangt kein altes Passwort. **Beide hängen an
  > der E-Mail-Adresse.** Und **`nrw-demo.de` war NICHT REGISTRIERT** (RDAP: 404) – wer sie
  > für ~5 € kauft, besitzt die Postfächer von 30 Prod-Konten, davon 6 Team-Admins.
  > **Lehre:** Eine Inventur nach Namensmuster findet, was man schon vermutet. Und
  > „Passwort entwertet" ist nur dann ein Riegel, wenn das Passwort der einzige Weg ist.
  >
  > **ERLEDIGT (15.08.2026, `tmp/prod-seedkonten-schliessen.mjs`):** Bei **393** Seed-Konten
  > wurde **`.invalid` an die bestehende Domain angehängt** (`…@nrw-demo.de` →
  > `…@nrw-demo.de.invalid`) und **346 Passwörter entwertet**.
  > RFC 2606 reserviert `.invalid` dauerhaft – die Endung ist von niemandem registrierbar,
  > damit sind Google-Adoption und Passwort-Reset tot. Anhängen statt ersetzen hält die
  > Eindeutigkeit des Index und ist umkehrbar. Der **Login per Passwort** funktioniert unter
  > der neuen Adresse weiter, denn dort ist die E-Mail nur ein Zeichenvergleich.
  > **Nachgemessen, live:** Konten mit bekanntem Passwort **346 → 0**, Konten auf der freien
  > Domain **30 → 0**, Anmeldung mit den alten Adressen → **401**, `forgotpassword` erzeugt
  > **keinen** Reset-Token (die 200-Antwort ist die gewollte Anti-Enumeration).
  > **Rollen und Kader unverändert:** 50 Team-Admins, 354 Kaderzugehörigkeiten – vorher wie
  > nachher. **Die Dev-DB ist unberührt** (18 Konten auf `@test.de`, 0 auf `.invalid`) –
  > die Testsuite hängt an genau diesen Konten.
  > **Nicht gelöscht** – 354 stehen in Kadern, 50 verwalten Vereine; das gehört an den
  > Demo-Purge (Roadmap 2). ⚠️ Die 18 `@test.de` tragen **kein `seedTag`**, die
  > Purge-Befehle erfassen sie also **nicht**; sie können dort nur sein, weil
  > `seed-demo.mjs` (die **Dev**-Basis) irgendwann gegen `hoops_prod` lief – protokolliert
  > ist das nirgends.
  ⚠️ **Demo-Team-Admin `demo.coach@nrw-demo.de`: Zugang ist WEG, und das war MEIN Fehler.**
  Patrick hatte am 15.08.2026 ausdrücklich Option 3 gewählt: Konto bleibt nutzbar, offene
  Flanke bewusst in Kauf genommen. Mein Skript hat dann **jedes** Konto mit bekanntem
  Passwort entwertet – also auch dieses. Die Adresse lautet jetzt
  `demo.coach@nrw-demo.de.invalid` und ist als Login gültig, **das Passwort ist es nicht**
  (401 nachgemessen). Wiederherstellen = Passwort auf dieser Adresse neu setzen; ein
  Passwort, das Patrick nicht kennt, setze ich nicht von mir aus.
  ⚠️ **OFFEN, der schwächste verbliebene Punkt:** Die **`admins`-Sammlung** auf `hoops_prod`
  hat zwei Einträge, `patrick` und `jonatan`, **beide mit bekanntem Passwort** – das ist das
  `/admin`-Verwaltungspanel. Nicht angetastet, weil ich dort kein Passwort setze, das
  Patrick danach nicht kennt. Siehe Roadmap 1.
  ✅ Die beiden **Super-Admin-Spielerkonten** (`@gmail.com`) sind sauber: Passwörter
  nachweislich **nicht** bekannt.

### Versionierung / Backup
- **Off-Machine-Backup: privates GitHub-Repo `github.com/Schemura98/hoops-germany-v2`.**
- Branches: **`main`** = sauberer Wiederherstellungspunkt (v2 vor Redesign), **`redesign`** = aktiver
  Arbeits-Branch (hier wird gearbeitet, nach jedem Meilenstein committen + pushen).
- `.env` ist gitignored; nur `.env.example` (leer) ist eingecheckt.

> 📌 **KONVENTION (verbindlich): Fortschritt IMMER dokumentieren.** Nach **jedem Meilenstein/Commit**:
> diesen **Abschnitt 0 kompakt aktualisieren** (Stand + Roadmap pflegen – verdichten statt anhäufen) und das
> **vollständige Meilenstein-Protokoll (was umgesetzt wurde + Datei-/Endpoint-Namen + Commit-Hash) unten an
> `docs/CHRONIK.md` anhängen**. CLAUDE.md ist die **kanonische, session-übergreifende Quelle** – das private
> Session-Gedächtnis ersetzt sie nicht. Dafür gibt es die Skill **`log-progress`** (`.claude/skills/log-progress/`).
> Nur Verifiziertes als fertig markieren; Offenes klar als offen führen.
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
>
> 📌 **KONVENTION (verbindlich): Feature-/Scope-Entscheidungen gegen die Bedarfsanalyse prüfen.**
> Pflicht-Startpunkt bei neuen Features oder Priorisierungen: **`docs/BEDARFSANALYSE-2026-08-09.md`**
> (Marktforscher **Mats**, globale Agenten-Definition `~/.claude/agents/marktforscher.md`) — inkl. der
> „wird NICHT gebraucht"-Liste (kein Team-Chat, keine Trainingsverwaltung, keine Live-Ticker/Heatmaps).
> Nach Implementierung nutzersichtbarer Funktionen prüft die Nutzungs- & Retention-Analystin **Ronja**
> (`~/.claude/agents/retention-analystin.md`) die Hypothesen H1–H7 der Analyse am Live-Produkt
> (Nutzerbrille, ehrliche Retention-Hebel, keine Dark Patterns); ihre Befunde gehen an Mats zurück.
> Beide sind Vorschlags-Instanzen — kein Gate, Priorisierung entscheiden Patrick & Jonatan.
> **Zielgruppen-Seite dazu: `docs/ZIELGRUPPEN.md`** (Marketing-Managerin **Nele**,
> `~/.claude/agents/marketing-manager.md`, angelegt 12.08.2026) — kanonische, session-übergreifende
> Definition der fünf Zielgruppen (Liga-Spieler NRW · Team-Admins/Ehrenamt · Vereinslose ·
> Vereinsverantwortliche · lokale Sponsoren) mit „wo erreichbar / was motiviert / was schreckt ab /
> welche Ansprache", der „ist NICHT Zielgruppe"-Liste und durchgängiger Kennzeichnung
> **[BELEGT] / [INDIZ] / [HYPOTHESE]**. Pflicht-Startpunkt für Kampagnen, Werbematerial und Copy;
> **Änderungen an den Zielgruppen nur mit Patrick.**
>
> 📌 **KONVENTION (verbindlich): Vor jedem Deploy zwei Gates.** `npm run build` + Playwright
> (`npx playwright test -c tests/e2e/playwright.config.mjs`) und die Production-Runtime (`npm start`,
> nicht nur `next dev`) — danach **Kai** (`test-automatisierung`, Skills `security-review` + `review`
> auf `git diff origin/redesign..HEAD`) und für nutzersichtbare Änderungen **Tobias**
> (`qa-reviewer`, global unter `~/.claude/agents/`) als unabhängiges Browser-Gate, **mobil zuerst**.
> ⚠️ Vor Testläufen prüfen, ob ein fremder Dev-Server auf Port 3000 hängt; `npm run build` nie
> parallel dazu. Prüfskript: `sh scripts/port-frei.sh [PORT]` (Vorgabe 3000, Exit 1 = belegt) –
> taugt als Vorschaltung: `sh scripts/port-frei.sh && npm run build`. ⚠️ Ist die Browser-Vorschaufläche ausgeblendet, laufen **keine** rAF-Frames
> (`document.hidden`) — Scroll-/Animationsmessungen dort sind eingefroren und täuschen Fehler vor;
> dann Playwright gegen echtes Chromium nutzen (Muster: `tmp/hero-preview.mjs`).

### Architektur-Konventionen (etabliert, bitte beibehalten)
- **lib/**: `db.js`, `auth.js`, `serverAuth.js` (`getPlayerFromToken`, `getTeamFromToken`=Dual-Auth, `getAdminFromToken`), `clientAuth.js`, `apiResponse.js` (`ok`/`fail`/`withErrorHandling`), `slug.js`, `matchScore.js`, `timeAgo.js`, `constants.js`, `useCurrentPlayer/Team/Admin.js`.
- **API-Pattern**: `connectDB()` → prüfen → Logik → `ok()/fail()`, in `withErrorHandling`.
- **Modelle**: immer `mongoose.models.X || mongoose.model("X", …)`. ⚠️ Schema-Änderungen an Modellen greifen erst nach **Dev-Server-Neustart** (mongoose cached das Model).
- **Teams sind spieler-geführt:** kein eigener Team-Login mehr. Ein Spieler gründet ein Team via
  `/team/create` → wird Admin (`adminPlayerId`, `isTeamAdmin`, `teamAdminOf`, eigenes `teamId`).
  Verwaltung von `/team/admin` läuft über den **Spieler-Token** (Dual-Auth). `/team/login` &
  `/team/register` sind nur noch Redirects. `Team.email` ist optional (sparse).
- **Design-Sprache „Anzeigetafel“ (seit 12.08.2026, Spezifikation `docs/VISUELLE-RICHTUNG-2026-08-12.md`):** nachtblauer Grund `navy-950 #0B1220` (Navigation `navy-900 #111A2E`, Panels `navy-800 #182543`, Hover/Eingaben `navy-700 #223058`, Rahmen `navy-600 #3D5080`), Text `paper-50` / gedämpft `mist-300|400|600`, **ein** Akzent = das echte Logo-Orange `brand-500 #F07A27`, semantische Status in `signal-ok|wait|error`. Schriften: **Big Shoulders Display** (`font-display`, Headlines ab `text-2xl`, Eyebrows, große Zahlen), **Geist** (`font-sans`, Fließtext/UI), **Geist Mono** (`font-mono tabular-nums`, Zahlen in Tabellen) – Geist fehlt im Font-Katalog von Next 14.2.35, deshalb selbst gehostet aus `public/fonts/` über `next/font/local` (`lib/fonts.js`); nachladbar mit `sh scripts/fetch-fonts.sh` (holt das latin-Subset als woff2, `--dry` zeigt nur an). Radien gestuft 6/10/16px (`rounded-sm|md|lg`). **Farbentscheid Patrick 12.08.2026:** Navy statt des ursprünglich von Vivien vorgeschlagenen warmen Braun – Navy + Orange ist für ihn die Basketball-Paarung. Die Skala heißt deshalb `navy-*`; die Stufung ist unverändert, nur der Farbton wechselte. Werte von Vivien gerechnet (`docs/WOW-KONZEPT-2026-08-12.md` Abschnitt 0). **Keine Verläufe, keine Schatten, kein Glow** – Tiefe entsteht aus Flächenstufe + 1px-Haarlinie. Signatur: 2px `brand-500`-Leiste an genau drei Stellen (Unterkante Navbar/PageHeader, Oberkante der einen hervorgehobenen Karte, aktive Stat-Zahl). Primärbutton = orange Fläche mit **dunklem** Text (`text-navy-950`, 6,88:1) – weiß auf Orange wäre 2,61:1. Icons: `react-icons/pi` (Phosphor Bold), **nicht** mehr `fa`. `app/globals.css` setzt `color-scheme: dark`, damit auch browsereigene Bedienelemente dunkel rendern. Echte Assets in `public/images/` (`logo.svg` = weiße Wortmarke für Navy-Navbar; `logo-hoops.svg` = dunkle Variante, seit dem Redesign nirgends mehr im Einsatz; `login image.jpg`/`signupImage.jpg` = Motive der Auth-Seiten (der **Hero der Startseite trägt seit 12.08.2026 kein Foto mehr**), jeweils mit AVIF/WebP-Varianten `login-image-1000.*`/`signup-image-1000.*` über `AuthShell.js`). `registerimage.jpg`/`playerimage.jpg` waren nie bzw. nicht mehr im Einsatz (`/team/register` ist nur Redirect) und liegen seit 11.08.2026 archiviert in `docs/asset-archive/` (Befund: `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`). Namenskonvention für neue Bild-Varianten: `docs/NAMENSKONVENTION-BILDER.md` (Kebab-Case, `<basis>-<lange-Kante>.<format>`).
- **Wiederverwendbare Redesign-Bausteine:** `components/layout/AuthShell.js` (Split-Screen Auth),
  `components/layout/PageHeader.js` (Seitenkopf auf `ink-900` mit Marken-Leiste), `components/Avatar.js`
  (generiertes Initialen-Logo mit deterministischer Namensfarbe – Fallback für Spieler & Teams, überall),
  `components/player/PlayerProfileView.js` (komplettes Spieler-Profil), `components/CityInput.js`
  (Stadt-Typeahead), `components/CityRadiusFilter.js` (Umkreis-Filter), `components/layout/Navbar.js`
  (öffentlich, login-bewusst), `components/layout/FeedbackLink.js` (Feedback-Zugang im Sticky-Chrome
  aller drei Leisten, seit 13.08.2026 – ersetzt den schwebenden FeedbackButton, der dreimal
  unabhängig als Inhalts-Verdeckung gemeldet wurde; Mobil-Menüs scrollen seitdem selbst), `components/landing/HeroScrollStage.js` (scroll-gesteuerte Hero-Bühne
  „Sprungball": ein rAF-Controller für alle Deko-Ebenen, Ziel wird zur Laufzeit am CTA-Rechteck
  gemessen, kein Pinning, `prefers-reduced-motion` rendert Ball/Emblem gar nicht) mit
  `components/landing/HeroGlyphs.js` (Ball, Korb-Emblem, Spielfeld-Bogen als reine Vektoren).
- **Designsystem-Primitive (`components/ui/`):** `Button` (Varianten primary/secondary/ghost/danger/
  dangerGhost + Größen sm/md/lg, `href`→Link), `Tabs` (Umschalter mit Unterstreichung, kein Pill mehr), `Card`, `EmptyState`,
  `Loading` (Basketball-Spinner), `Skeleton`/`SkeletonCard`/`SkeletonList`, `FormAlert`
  (role=alert/aria-live), `ConfirmAction` (Bestätigungs-Popover statt `window.confirm`). Tokens in
  `lib/ui.js` (`inputClass`, `inputClassSm`, `inputClassNum`/`inputClassStat` – die beiden Zahlenfelder
  bewusst OHNE Breitenklasse, Breite setzt die aufrufende Stelle –, `cardClass`). Team-Admin-Tabs nutzen
  zusätzlich `components/team/tabs/TabAlert.js` (FormAlert-Wrapper für ihr `{type,text}`-Format).
  **Konvention:** neue/überarbeitete Seiten IMMER diese Primitive nutzen (keine Ad-hoc-Buttons/Tabs/
  Spinner, kein `window.confirm`). **Rollout abgeschlossen (Wellen 1–5 + Welle 2b für das
  Team-Admin-Panel, Commits in der Chronik)** – **mit einer Ausnahme, nachgemessen am 15.08.2026:**
  `Card` hat **3 Importe** (`components/feed/SpieltagStrip.js`, `components/feed/FollowSuggestions.js`,
  `components/posts/PostComposer.js`) und `cardClass` **0 Verwendungen** (nur die Definition in
  `lib/ui.js:22`); stattdessen bauen **141 Stellen** die Panel-Fläche von Hand (`bg-navy-800` +
  `border-navy-600`). Die **141 ist eine Untergrenze**: Zeilen mit `bg-navy-800` gibt es **180** –
  die übrigen 39 sind ebenfalls handgebaute Panels, nur mit abweichender Rahmenfarbe
  (`signal-ok`, `brand-500`, dynamisch) oder ganz ohne. Betroffen sind **78 Dateien**. Alle übrigen
  Primitive sind echt im Einsatz (Button 25, Loading 19, EmptyState 15, Skeleton 13, Reveal 12,
  FormAlert 9, Tabs 6, CountUp 5, Card/ConfirmAction/ScrollTable/SplitFlap je 3, LinkTabs 1).
  Folge: Eine Änderung an der Kartensprache wirkt
  **nicht** zentral – sie muss an 141 Stellen nachgezogen werden. Das ist der größte offene
  Konsistenz-Posten des Designsystems (Umbau bewusst zurückgestellt: hohes Regressionsrisiko,
  kein sichtbarer Gewinn). **Nebenbefund:** `components/feed/FollowSuggestions.js` importiert `Card`
  und nutzt es im Leerzustand (Z. 92), baut dieselbe Fläche im Normalzustand aber von Hand (Z. 99) –
  eine Fläche, zwei Wege, in einer Datei. Vollständiger Befund:
  `docs/NEWSFEED-DESKTOP-2026-08-15.md` Abschnitt 1.4.
  **Alle Zahlen dieses Absatzes sind messbar, nicht behauptet:** `npm run design-audit`
  (`scripts/design-audit.mjs`) zählt sie neu. `--files` zeigt die Fundstellen, `--json` gibt sie
  maschinenlesbar aus, `--check` vergleicht mit der Baseline im Skript und endet mit exit 1, sobald
  etwas gedriftet ist. **Bei Drift immer BEIDES nachziehen** – die `BASELINE`-Konstante im Skript
  und diesen Absatz samt Messdatum. Der Drift ist real: 126 → 141 in drei Tagen (12. → 15.08.2026).
  Bewusst belassen (custom/kompakt): lokale `inputClass` in
  `team/claim`, `admin/leagues`, `admin/update-match`. Optionaler Restschliff: Super-Admin-Tabellen/
  „Lädt…"-Texte auf `<Loading>`/`EmptyState`.
- **Geo-Suche:** Feld `bundesland` an Player/Team/League; `lib/geo.js` + `public/data/de-cities.json`
  (14.910 Orte mit lat/lng, lazy geladen) für Stadt+Umkreis (Haversine). Stadt-Eingabe per Typeahead
  setzt das Bundesland automatisch.
- **Onboarding-Tour, drei Regeln (seit 14.08.2026):** (1) `speichern()` in
  `components/onboarding/TourSteps.js` hat **drei** Ausgänge – `SPEICHERN_OK` / `_FEHLER` /
  `_ANONYM`. Die Tour ist über den Footer auch **ausgeloggt** erreichbar; „kein Konto" ist kein
  Fehler. Ein neuer Schritt muss alle drei behandeln, sonst entsteht entweder eine Fehlermeldung
  ohne Fehler oder – schlimmer – eine Erfolgsquittung ohne Speicherung. (2) `stand === null`
  bedeutet **„aus dem Profil vorbelegt", also gespeichert** – nicht „nichts passiert". (3) Aussagen
  über die Oberfläche („oben rechts") nur, wenn das Gemeinte auch da ist: Der Marker
  **`data-profil-avatar`** in `components/layout/PlayerNav.js` wird zur Laufzeit geprüft, weil
  PlayerNav **pro Seite** eingebunden ist und auf öffentlichen Seiten fehlt.
- **Transfer = zwei Dinge, seit 14.08.2026 trennbar:** `lib/recordTransfer.js` schreibt die
  **Station im Lebenslauf** (`TransferEvent`) UND die **Neuigkeit** (Feed-Post +
  Follower-Benachrichtigung). `still: true` schreibt nur die Station – gesetzt **ausschließlich**
  in `app/api/admin/setteamadmin/route.js`, weil dort korrigiert und nicht gewechselt wird.
  ⚠️ Für die sieben echten Wechselwege muss der Post bleiben; `tests/e2e/transfer-still.spec.mjs`
  prüft **beide** Richtungen, denn „kein Post" wirft keinen Fehler.
- **Rechtsverweise auf kontoerzeugenden Seiten:** `components/layout/RechtsLinks.js` ist die EINE
  Stelle für Datenschutz + Impressum. Jede Fläche, auf der ein Konto entsteht, muss sie tragen
  (Art. 13 DSGVO, § 5 DDG) – `tests/e2e/rechtsverweise.spec.mjs` erzwingt das. Die
  Mindestalter-Meldungen liegen als `MINDESTALTER_HINWEIS(_GOOGLE)` in `lib/constants.js`
  (sechs Fundstellen, davon drei im Google-Weg).
- **Benachrichtigungen – alles Typ-Bezogene liegt in `lib/notifications.js`:** `notificationHref`
  (Ziel), **`NOTIF_ICON`** (Symbol, seit 14.08.2026 dort statt in der Glocke) und `GLOCKE_LEER`
  (**ein** Leerzustands-String). Typ-Enum in `models/Player.js`. **Ein neuer Typ muss an allen
  drei Stellen gepflegt werden**, sonst entsteht ein Eintrag ohne Symbol oder ohne Ziel –
  `tests/e2e/benachrichtigungs-typen.spec.mjs` erzwingt das jetzt, die Regel stand vorher nur hier.
  ⚠️ Es gibt **ZWEI** Glocken: `components/layout/NotificationBell.js` (Spieler-Leiste) und eine
  eigene Umsetzung in `components/layout/Navbar.js`. Letztere hatte bis zum 14.08. gar keine
  Symbol-Zuordnung und zeigte für jeden Typ einen Basketball; beide ziehen jetzt aus `NOTIF_ICON`.
  ⚠️ **Keine Ausnahmelisten in diesem Test.** Ein erster Versuch nahm sechs Typen als „sehen nur
  Admins" aus – falsch: `getnotifications` filtert nicht nach Typ, und `set-member-admin` schickt
  `team_admin_granted` an ein normales Kadermitglied.
  Versandlogik je Ereignis in eigener lib (z. B. `lib/statsNotify.js` für `own_stats`,
  `lib/notifyEngagement.js` für Feed-Interaktionen).
- Token-Keys in localStorage: `playerAuthToken`, `teamAuthToken` (legacy, kaum noch genutzt), `adminAuthToken`.

### Feature-Stand (Kurzüberblick – alles live auf hoopsgermany.de, Details in der Chronik)
- **Liga-System:** offizieller NRW-Katalog (57 official: 31 Herren + 16 Damen + 10 Jugend U18/U16 m/w;
  Produkt-Cutoff bei U16), Saison/Archiv/Playoffs/Meister, TeamSeason-Endstand-Snapshots, Audit-Log;
  Kreisliga-Framework mit Regierungsbezirk-Navigation (alle 22 Basketballkreise, WBV-verifiziert) +
  Demo-Kreisligen (`isDemo`, noindex); **Liga-Zuordnung nur per Freigabeprozess** (`LeagueChangeRequest`,
  Admin-Seite `/admin/league-requests`, Mails + Glocke an Super-Admins und Anfragende).
- **Teams (spieler-geführt):** Gründung mit Super-Admin-Freigabe, Kader-Slots + 3 Einladungswege
  (Claim-Link, Direkt-Einladung bestehender Accounts, allgemeiner Join-Link mit Wechsel-Warnung),
  Co-Admins mit Teilrechten (`lib/teamPermissions.js`), Rückennummern, `notifyAllAdmins`-Einstellung.
- **Newsfeed (Roadmap 10/10 komplett):** „Für dich"-Ranking, Auto-Posts (Ergebnis/Transfer/Tryout/
  Recruiting/Verfügbar), Team-Posts, Engagement-/Mention-Benachrichtigungen, Bild-Upload (inkl. HEIC),
  Hashtags + @Mentions mit Autocomplete (Composer, Kommentare, Antworten), YouTube-/Link-Embeds mit
  Klick-zum-Laden (Datenschutz) + Open-Graph-Vorschau, Folge-Vorschläge, Permalinks.
- **Scouting/Transfermarkt (Phasen A+B+C):** strukturierte Filter, „Vereine suchen Spieler",
  Direktanfrage, Matching, bevorzugte Spielklasse.
  ⭐ **Kernpositionierung (Patrick & Jonatan seit Projektstart, am 12.08.2026 bekräftigt):**
  Die Plattform ist als **Scouting-Plattform mit belegbaren Fakten** gedacht – „wie LinkedIn,
  nur nachweisbar". Der Unterschied ist nicht das Profil, sondern die **Belegbarkeit**: Die
  Zahlen stammen aus Spielen, die **beide Teams unabhängig gemeldet und bestätigt** haben
  (`resultStatus: confirmed` mit beidseitigem `submittedBy`). Ein Verein muss dem Spieler also
  nicht glauben. Bei Feature-, Text- und Gestaltungsentscheidungen mitdenken.
  ✅ **Korrektur 13.08.2026 (Befund Ronja, fünf belegte Fundstellen):** Der Beleg-Satz steht
  **sehr wohl** im nutzersichtbaren Text (Landing-Szenen 1+3, „So funktioniert's",
  Karrierepanel, `/topscorer`, `/ligen/[id]`, Abzeichen auf `/match/[id]`) – die frühere
  „Lücke"-Notiz war überholt. Seit `c4dd91d` ist die Belegbarkeit zusätzlich als **Ereignis**
  eingelöst (Benachrichtigung „Deine Zahlen stehen", s. Spielbetrieb). Vergleichende Aussagen
  („einzige Plattform, die…") weiterhin wegen §6 UWG an Nora, Formulierungen an Nele.
- **Spielbetrieb:** Ergebnis-Verifikation + Mismatch-Eskalation an beide Admins + Super-Admins,
  Box-Scores, Topscorer/Rangliste saison-fähig, Spielerhistorie mit Einzelspielen, Karriere-Timeline.
  **Benachrichtigung „Deine Zahlen stehen"** (13.08.2026, `lib/statsNotify.js`, Typ `own_stats`):
  Spieler mit erfassten Werten im Box-Score werden **genau einmal je Spiel** informiert
  (Merkfeld `Match.notifiedStatsPlayers`), Text trägt den Beleg-Status (bestätigt / noch
  vorläufig), bei `mismatch` gar nichts, Ziel `/match/[id]`. Nur In-App, **keine Mail**.
- **Onboarding & Wachstum:** Willkommens-Tour, Onboarding-Checklist (Feed + Startseite), PWA
  (`/installieren`), login-bewusste Landing, Testphase-Banner.
- **Admin & Analytics:** Analytics Phase 1–3 Teil 1 (Dashboard, Sponsor-Report, teilbarer
  Passwort-geschützter Report-Link), Feedback-Inbox, zentrales Mail-System (`lib/emailTemplates.js`,
  Empfänger-Matrix mit info@-Bündelung via `lib/adminRecipients.js`).
- **Seed-/Demo-Tooling** (alle additiv, getaggt, idempotent, `--purge`-fähig): `seed-demo` (Dev-Basis),
  `seed-nrw-leagues` (offizieller Katalog), `seed-nrw-demo`, `seed-kreisligen-demo` + `-niers`,
  `seed-showcase-posts`, `seed-world`, `rollover-season` (**Prod: noch nie ausgeführt**).
  ⚠️ **KORREKTUR 15.08.2026 (Befund Ronja, von mir auf `hoops_prod` nachgemessen):** Hier stand
  bei `seed-world` **„Prod: nicht ausgeführt"** – das ist **falsch**. Der Bestand liegt dort:
  `seedTag: "world"` bei **40 Teams, 345 Spielern, 288 Beiträgen**. Zum Vergleich der echte
  Bestand ohne Tag: **6 Teams, 31 Spieler, 15 Beiträge**. Also **85 % der Spieler auf der
  Live-Seite sind Seed-Daten.** Folge: Die Aufräumliste in Roadmap 2 war unvollständig.

### 🔜 Noch offen (Roadmap)
1. **`/admin`-Temp-Passwort** (`A1cGmhwN-1To`) auf ein eigenes ändern – oder den Legacy-`/admin`-Login ganz
   entfernen (Super-Admin-Spieler kommen ohnehin direkt rein).
2. **Demo-Daten nach der Testphase durch echte ersetzen** (auf dem VPS): `node scripts/seed-nrw-demo.mjs
   --purge`, `node scripts/seed-kreisligen-demo.mjs --purge`, `node scripts/seed-kreisligen-demo-niers.mjs
   --purge`, `node scripts/seed-showcase-posts.mjs --purge`, **`node scripts/seed-world.mjs --purge`**
   (am 15.08.2026 ergänzt – der Bestand liegt entgegen der bisherigen Notiz sehr wohl auf Prod);
   **danach beim Cutover die alte DB `test` löschen**.
   ⚠️ **Vor dem Purge entscheiden (Patrick), es ist keine reine Aufräumfrage:** Die Seed-Beiträge
   tragen **4.073 Likes** (höchster Einzelwert 40; **101 Beiträge mit 20+**). Der echte Bestand
   trägt **16 Likes** bei 15 Beiträgen, höchster Wert 6 – das ist die Größenordnung, die zu rund
   zehn externen Nutzern passt. Ein Leser liest „40" als **40 Personen**. Der Testphase-Banner
   sagt „einige Inhalte sind Beispieldaten" und federt damit die *Inhalte* ab, aber **nicht die
   Zustimmungszahlen**: Eine erfundene Reichweite ist etwas anderes als ein erfundener Verein.
   Besonders heikel gegenüber Zielgruppe 5 (lokale Sponsoren) – **das gehört vor Nora**
   (§ 5 UWG, irreführende Angabe), bevor jemand der Seite Zahlen glaubt. Siehe auch
   `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`.
3. **Monetarisierung – BLOCKIERT bis Gewerbeanmeldung** des Users (Amazon-Affiliate + Sponsorfläche;
   AdSense erst bei genug Traffic + Consent-Banner; bei Dritt-Diensten Datenschutz/Consent nachziehen).
4. **Analytics Phase 3 Teil 2** (Banner-Tracking je Werbefläche mit Impressionen/Klicks/CTR, Sponsor-Entität
   + per-Sponsor-Auswertung, Leads, automatischer PDF-Export) – an Monetarisierung (#3) gekoppelt,
   bis zur Gewerbeanmeldung zurückgestellt.
5. **Echte WBV-Kreisliga-Daten statt Demo** (niedrige Prio). Verbindlicher Auftrag VOR dem Seeden:
   ChatGPT-Kreisliga-PDF des Users einlesen, **Inhalt sorgfältig prüfen (nicht blind übernehmen!) +
   Umlaute korrigieren**, erst dann ins Seed-Muster analog `seed-nrw-leagues.mjs` (`official:true`,
   `level:"Kreisliga"`, `region`=Kreis, idempotenter Upsert, `--dry`) → Dev testen, dann Prod.
   Kreis-Ort-Aliase (`KREIS_ORT_ALIASE`) bisher nur für Kreis Niers – weitere Kreise bei Bedarf.
6. **Weibliche Jugend-Einteilung verifizieren:** U18w/U16w sind struktur-basiert gespiegelt (exakte
   WBV-Einteilung 2025/26 war nicht auffindbar; WBV-Artikelseiten blocken den automatischen Abruf) →
   **User besorgt den PDF-Link** von basketball.nrw, dann gegenprüfen und ggf. per `/admin/leagues` korrigieren.
7. **Season-Rollover (jährlich ≈ Juli):** `scripts/rollover-season.mjs` ist deployt, aber **noch NIE auf
   Prod ausgeführt**; beim ersten echten Lauf 10-Min-Sanity-Check (WBV-Gruppenzahl) + Teams ordnen sich der
   neuen Saison über Liga-Wechsel/Freigabeprozess neu zu.
8. **Vom User zu bestätigen:** Sind die 2 Test-Mails der Liga-Zuordnungsanfrage (02.07.) angekommen?
   (`p.schemura@gmail.com`, `jonatanbaenavides@gmail.com`, `info@hoopsgermany.de`.) Der Freigabeprozess ist
   einsatzbereit; ein echter Praxistest mit realer Anfrage steht noch aus.
9. **Rechtliches (Betreiber):** Datenschutz-Abschnitt 10 (Klick-zum-Laden/YouTube-no-cookie) final juristisch
   prüfen lassen – die Formulierung ist ein Vorschlag, keine Rechtsberatung.
10. **Design-Review-Restwellen:** `docs/DESIGN-REVIEW-2026-08-10.md` – **Welle 1, 2a und 2b sind
    erledigt** (Team-Admin-Panel + Hero-Animation, Commit `a0dbe20`). Offen: **Welle 3** (Mobile-Tabellen
    mit Sticky-Spalte auf Rangliste/Topscorer/Liga-Tabelle, einheitliche mobile Filterleisten,
    optional `CountUp`/`Reveal` auf den öffentlichen Seiten). **Welle 4 ist erledigt** (12.08.2026):
    LegalShell-Zeilenlänge (`max-w-xl`) und Sprungnavigation stehen, der oauth-landing-Fehlerzustand
    hat Logo und Ausweg, und der FeedbackButton war auf der Einstiegs-/Formularstrecke ausgeblendet –
    er lag auf 390×640 gemessen über den letzten 36 px von „Konto erstellen". **Überholt am
    13.08.2026:** Der schwebende Knopf ist insgesamt entfernt; der Feedback-Zugang sitzt im
    Sticky-Chrome (`components/layout/FeedbackLink.js`, Protokoll in der Chronik).
11. **Startseite als Scroll-Erlebnis – was noch offen ist:** Konzepte liegen vollständig vor
    (`docs/LANDING-KONZEPT-2026-08-11.md` inkl. Nachtrag, `docs/HERO-KONZEPT-2026-08-11.md`,
    `docs/LANDING-COPY-2026-08-11.md`). Gebaut sind Hero-Stufe 1, Feature-Choreografie (Stufe 1),
    Fortschritts-Anzeige (Stufe 2), Neles Texte (Stufe 3) und Viviens Feinschliff. **Offen:**
    Hero-**Desktop**-Ausbaustufe (gepinnte Bühne, 140vh, drei Szenen – Konzept steht, bewusst
    zurückgestellt, weil mobil der Hauptfall ist); Stufe 4 der Feature-Strecke (kurzer Pin nur für
    die Ergebnis-Szene) **nur**, falls Ronjas Nutzungsprüfung zeigt, dass die Doppel-Bestätigung
    nicht verstanden wird; Test auf echtem Low-End-Android (bisher nur 4×-CPU-Drosselung);
    Neles „nice to have"-Textvorschläge für die Karten 2/5/6.
12. **Entscheidungen zu „Deine Zahlen stehen" (`own_stats`, seit 13.08.2026 gebaut):**
    (a) Soll die spätere **Bestätigung** eines zunächst vorläufigen Ergebnisses eine **zweite**
    Nachricht auslösen? Heute bewusst nein (Rauschen-Abwägung) – wer beim Stand „vorläufig"
    informiert wurde, erfährt die Bestätigung nicht noch einmal. (b) Soll es dazu eine **Mail**
    geben? Heute bewusst nicht; falls ja, nach dem Muster `emailPendingResult` **mit eigenem
    Opt-out**. Beides gehört Patrick.
13. **Rest aus `docs/RETENTION-BEFUND-2026-08-13.md`** (Ronja) – von Lina am 14.08. am Live-Stand
    gegengeprüft: **R1–R5, R7, R8 und K1–K3/K5/K9 sind erledigt und verifiziert**. Offen bleiben
    die übrigen K-Verlinkungen. Der Sponsor-Report-Punkt (Abschnitt 3a) ist behoben.
14. **Aus `docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md`** (Lina): **P2 ist erledigt** – „ab 16" wird
    seit `3fa822e` auf `/signup`, `/about` und beiden Einladungsseiten begründet (Nora → Nele).
    Offen bleibt Linas eigene Frage, ob ihre Rolle von Vivien/Nele/Ronja aufgesogen wird.
15. **Aus den Gates vom 14./15.08. — die Liste ist abgearbeitet.** Erledigt: der
    `recordTransfer`-Post, Fokusfalle und Fokus-Rückgabe, `TeamNav`-Klickfläche, Alt-Kürzel,
    Escape auf Menü/Suche/**beiden Glocken**, `GLOCKE_LEER` für alle Rollen, optimistisches
    Speichern mit Rücknahme, Tour-Schritt 3 ausgeloggt, doppelte Position auf der Kaderkarte,
    Leseposition + Scroll-Sperre, die Sackgasse auf `/team/create`, beide
    Admin-Benachrichtigungen, tote Wege (`teamSlug`/`matchId`) nach dem Löschen eines Teams.
    **Neu offen, klein:** (a) Ein Escape bedient mehrere Ebenen gleichzeitig – wer die Sperren
    stapelt, sollte auch die Escape-Ebenen stapeln (Kai). (b) ✅ **gegenstandslos** – die
    Profil-Oberfläche kann Positions-Kürzel nicht schreiben (Tobias' N4); auf Prod gibt es
    deshalb keine, s. (f).
    (c) Ein **offener** Kaderplatz ohne Position zeigt „—", wo die gesuchte Position die
    eigentliche Information wäre → Nele. (d) Auf `/team/create` steht erst „Team gründen", dann
    die Korrektur – trägt die Reihenfolge? → Vivien/Nele. (e) `PlayerNav` hat **keine Suche**:
    eingeloggt ist sie nur auf öffentlichen Seiten erreichbar → Lina/Ronja.
    (f) ✅ **erledigt/gegenstandslos:** `scripts/migrate-positions.mjs` wurde am 15.08.2026 auf Dev
    ausgeführt (19 Positionen, Idempotenz belegt). **Auf `hoops_prod` gibt es nichts zu
    migrieren** – gemessen: 392 kanonische Positionen, 0 Kürzel, und auch 0 Varianten in
    Groß-/Kleinschreibung oder mit Leerzeichen (also nichts, was das Skript übersehen hätte).
    Grund: Sie waren ein reines Seed-Artefakt der Dev-DB, das Profil-`select` bietet sie nicht an.
    ⚠️ **Korrektur (Kai, 15.08.2026):** Hier stand, ein Kürzel könne auf Prod „nur entstehen, wenn
    jemand direkt in die DB schreibt". Das war falsch und in der gefährlichen Richtung falsch –
    es klang nach einer Garantie. `update-profile` führte `position` nur in einer **Feld**-Weißliste,
    prüfte den **Wert** nie, und `models/Player.js` hat `position: String` ohne Enum: Jeder Aufruf
    mit gültigem Token schrieb jede Zeichenkette. Dass das Formular ein `select` benutzt, ist eine
    Aussage über den Browser, nicht über die API. Seit dem 15.08. prüft die Route gegen `ALL_ROLES`
    – **aber nur bei echter Änderung**, sonst wäre ein Konto mit Altwert unbedienbar (dasselbe
    Muster wie beim Geburtsdatum). **Lehre:** „kann nicht passieren" nur schreiben, wenn der Code
    es erzwingt, nicht wenn die Oberfläche es nicht anbietet.
    ⚠️ **(0) DIE REGEL AUS (1) WURDE AM 15.08. VIERMAL IN EINER RUNDE GEBROCHEN —
    von mir, und sie steht seit dem 14.08. hier.** Kai fand seinen Arbeitsbaum
    dreimal verändert vor, seine erste vollständige Mutationsmatrix lief dadurch
    gegen einen Stand von **zwei Commits vor der Prüfbasis** und meldete Befunde,
    die reine Artefakte waren. Er hat sie selbst als solche erkannt und alles in
    einem isolierten `git worktree` auf eigenem Port wiederholt — die Runde war
    nur deshalb verwertbar. **Die Konsequenz ist nicht „besser aufpassen":
    Wer ein Gate startet, arbeitet bis zu dessen Ende NICHT im selben Baum.**
    Entweder man wartet, oder man baut selbst in einem Worktree. Ein Prüfer, der
    sein eigenes Messwerkzeug gegen fremde Bewegung absichern muss, prüft nicht
    mehr das Produkt.
    ⚠️ **Methodik-Lehren aus den Gates vom 14.08.:** (1) Während ein Browser-Gate gegen `next dev`
    läuft, darf im selben Arbeitsbaum **nicht weitergebaut** werden – der Prüfer sieht sonst Code,
    der nicht im geprüften Commit ist. (2) **`preview_stop` beendet den Dev-Server nicht**, es löst
    ihn nur aus der Verwaltung; der Node-Prozess hält Port 3000 weiter (auf dem Mac sichtbar über
    `lsof -tiTCP:3000 -sTCP:LISTEN`; unter Windows hieß der Zustand `ABHÖREN`). Vor
    jedem Build `sh scripts/port-frei.sh` – sonst läuft der Build in ihn hinein. (3) Ein
    **sporadisch roter Test** ist selten ein Timing-Problem: Beim Avatar-Layout-Test halfen weder
    höhere Timeouts noch eine leichtere Seite noch eine Übergangs-Pause, weil die Ursache ein
    unbekannter Ausgangszustand war (Auto-Start der Tour bei `welcomeSeen: false` verdeckt den
    Footer-Knopf). Erst den Zustand deterministisch machen, dann an Wartezeiten denken.
    (4) **Der `security-review`-Skill wählt seine Basis selbst** und diffte gegen `main` – 4,3 MB,
    ~500 Dateien. Bei einem Langläufer-Branch wie `redesign` verdünnt das die Prüfung bis zur
    Wirkungslosigkeit. **Immer die Commit-Basis vorgeben** (`git diff <basis>..HEAD`).
    ⚠️ **Nachtrag 15.08.2026 (Kai, vierte Runde): Die Vorgabe im Auftrag WIRKT NICHT.**
    Der Skill-Rumpf übernimmt sie nicht und setzt sich in jeder Runde erneut auf `main`
    (zuletzt 4,7 MB inkl. `tmp/`-Screenshots und `.claude/`-Skills). Die Basis-Einschränkung
    muss **manuell durchgehalten** werden – also den Diff selbst erzeugen und die Analyse
    darauf ausführen, statt dem Skill zu vertrauen. Bei fünf Dateien ist das vertretbar,
    bei einem größeren Diff nicht.
    (5) ⚠️ **Feste Zeichenfenster in Quelltext-Tests sind eine Fehlerklasse für sich.** An einem Tag
    viermal aufgetreten: `slice(ab, ab + 400)`, `{0,200}` in einer Regex, `indexOf("]")`,
    `indexOf("};")`. Sie brechen in beide Richtungen – zu kurz gibt falsches Rot, und
    `indexOf`-Grenzen liefern bei Ausfall `-1`, wodurch `slice(ab, -1)` den ganzen Rest der Datei
    (6) ⚠️ **Ein Test, der seinen eigenen Ausgangszustand verändert, ist beim ZWEITEN Lauf rot.**
    Zweimal an einem Tag: Der Tour-Auto-Start (`welcomeSeen`) verdeckte den Footer-Knopf, und ein
    Layout-Test klickte fest auf „Point Guard" – beim nächsten Lauf war die Position gesetzt,
    derselbe Klick wählte ab. Beide Male sah es nach Flakiness aus und war Zustandsabhängigkeit.
    Entweder den Zustand vorher deterministisch setzen oder am Vorgefundenen entlang wählen
    (z. B. einen Chip ohne `aria-pressed="true"`).
    (7) ⚠️ **Eine Gegenprobe muss die richtige Reihenfolge treffen.** Der erste Test für die
    Scroll-Sperre war auch OHNE Fix grün: Er schloss die Overlays per Klick, und das geht
    zwangsläufig von oben nach unten – genau die Reihenfolge, in der das alte Muster zufällig
    funktionierte. Erst Escape (schließt beide auf einmal) legte den Fehler offen.
    (5-Fortsetzung) Immer Klammerzählung, und die Hilfsfunktion soll
    **werfen** statt still etwas Falsches zu liefern (Muster: `blockAb` in
    `tests/e2e/benachrichtigungs-typen.spec.mjs`).
    ⚠️ **Methodik-Lehre vom 15.08.2026 – ZWEI SESSIONS IM SELBEN ARBEITSBAUM.** An einem Tag
    dreimal aneinandergeraten; jedes Mal ging es gut aus, und jedes Mal nur, weil jemand
    hinterher gegenprüfte. Die drei Regeln daraus:
    (a) **Zuweisung je Datei, bevor gearbeitet wird.** Sonst committet die eine Session in ein
    bewegliches Ziel: Es wurde ein Entwurf aus dem Arbeitsbaum committet, während die andere
    Session noch daran schrieb. Und „fertig" heißt fertig – wer danach weiterschreibt, sagt
    vorher „ich arbeite weiter".
    (b) **Committen, pushen, deployen sind DREI Erlaubnisse; die untere trägt die obere nicht.**
    ⚠️ **Und der schärfere Teil: In einem gemeinsamen Arbeitsbaum gilt die GROSSZÜGIGSTE
    Freigabe für alles, was darunter liegt – dagegen verstoßen muss dabei niemand.** Git kennt
    keine Teil-Pushes: Wer die Spitze schiebt, schiebt alles darunter. Genau so kam ein Commit
    auf `origin`, der unter „Commit freigegeben, kein Push" entstanden war; die eine Session
    hatte Push-Freigabe, die andere nicht, und beide haben sich an ihre Vorgabe gehalten.
    **An Git sieht man diese Bindung nicht** – sie steht nur im Auftrag.
    Wer strenger gebunden ist, hat deshalb zwei Wege: **committen und warten**, oder in einem
    **eigenen Worktree** arbeiten (`git worktree add`). Und vor jedem Push nachsehen, was mitgeht:
    ```bash
    git log --oneline origin/redesign..HEAD
    ```
    (c) ⚠️ **Der eigene erste Blick auf den Baum kann veraltet sein.** Ein `git log` meldete
    `c96cb14` als HEAD, während der Reflog längst `1a00846` führte. **Maßgeblich ist der
    Reflog**, nicht der erste Blick – und für die Frage „wer hat wann gepusht" beantwortet
    `git reflog show origin/<branch> --date=iso` in EINEM Kommando, was `merge-base
    --is-ancestor` nur halb beantwortet: Dass ein Commit auf `origin` ist, sagt nichts darüber,
    **wodurch** er dorthin kam. Beide Sessions haben an diesem Punkt dieselbe Fehlerform
    produziert – **Ergebnis richtig gemessen, Mechanismus dazu erfunden.**
16. **Folgen des Sicherheits-Eingriffs vom 15.08.2026 – Entscheidungen, keine Aufräumarbeit.**
    (a) ⚠️ **48 der 66 Prod-Teams haben einen unerreichbaren Admin** (Befund Kai). Meine Meldung
    „Rollen unverändert" war technisch richtig und im Ergebnis das Gegenteil: Diese Vereine sind
    dauerhaft unverwaltbar, ohne Weg zurück außer einem Super-Admin-`setteamadmin`. Trifft ein
    echter Tester auf eines davon, hat es keinen ansprechbaren Verantwortlichen. Entscheiden,
    ob das bis zum Demo-Purge so bleibt.
    (b) ✅ **Erledigt:** `emailPendingResult: false` auf allen 393 `.invalid`-Konten – sonst
    hätte `notify-pending-results` beim nächsten Cron-Lauf bis zu 34 harte Bounces an eine
    reservierte TLD geschickt, abgesendet von demselben SMTP-Konto, über das Passwort-Resets
    echter Nutzer laufen. Gemessen: 0 Seed-Admins bekämen noch eine Mahnung, die 4 echten
    Team-Admins unberührt.
    (c) **`POST /api/team/teamlogin` entfernen** (Kai): ein zweiter, vollständiger Auth-Pfad, der
    `Team.email` + `Team.password` prüft und ein Token mit vollen Team-Admin-Rechten gibt – ohne
    die `players`-Sammlung zu berühren. Heute harmlos (gemessen: 66 Teams, **0** mit E-Mail,
    **0** mit Passwort), aber sein einziger Schutz ist, dass zufällig kein Datensatz ihn füllt.
    Die Seiten sind ohnehin nur Redirects.
    (d) **Google-Callback wertet `email_verified` nicht aus** (Kai, älter als dieser Vorfall):
    Er nimmt `email` aus dem ID-Token und adoptiert damit ein bestehendes Konto samt aller
    Rechte. Für die Seed-Konten jetzt gegenstandslos, für echte Nutzer der Mechanismus, der den
    Vorfall überhaupt möglich gemacht hat.
    (e) **`demo.coach`-Zugang wiederherstellen**, falls gewünscht – Passwort auf
    `demo.coach@nrw-demo.de.invalid` setzen (s. Abschnitt Test-Accounts).
17. **Den Team-Admin bei der Erfassung stützen – Live-Eingabe statt Nachbereitung**
    (Idee Patrick, 15.08.2026). Die Box-Scores kommen von **Ehrenamtlichen**, die sich
    freiwillig dazu bereit erklären; sie sind die Quelle, aus der die gesamte Belegbarkeit der
    Plattform stammt. Heute ist die Erfassung eine **Pflicht nach dem Spiel**: Der Admin führt
    während der Partie irgendeine eigene Notiz und überträgt sie später. Ziel: Er trägt
    Punkte/Assists/Rebounds **parallel zum Spiel** direkt hier ein und braucht **keine zweite
    Dokumentation** – im besten Fall benutzt er Hoops Germany *als* sein Werkzeug am Spielfeldrand.
    Dazu **rechtzeitig** eine Erinnerung per **Mail UND Glocke** (nicht erst danach – der
    bestehende `emailPendingResult`-Weg mahnt ein fehlendes Ergebnis *hinterher* an).
    ⚠️ **Abgrenzung, die vor der Umsetzung geklärt sein muss:** Mats' „wird NICHT
    gebraucht"-Liste enthält **Live-Ticker**. Das hier ist etwas anderes – ein
    **Erfassungswerkzeug für den Admin**, kein Zuschauer-Ticker. Ob und ab wann Zwischenstände
    für andere sichtbar werden, ist eine eigene Entscheidung und **nicht** Teil dieser Idee;
    sonst entsteht durch die Hintertür genau das Feature, das die Bedarfsanalyse ausschließt.
    ⚠️ Weitere offene Punkte vor dem Bau: Bedienung mit **einer Hand am Spielfeldrand**
    (Daumenreichweite, große Ziele, mobil zuerst) · Verhalten **ohne Netz** in der Halle
    (Zwischenspeicher lokal, später senden – sonst ist ein Funkloch gleich ein Datenverlust) ·
    wann ein live erfasster Stand als **eingereicht** gilt (die Doppel-Bestätigung darf nicht
    versehentlich schon durch das Mitschreiben ausgelöst werden) · Vorprüfung an Mats/Ronja,
    ob die Ehrenamtlichen das überhaupt wollen.
18. **Weitere UX-Feinschliffe nach Tester-Feedback** (laufend).
19. **Optional / bewusst offen:** Best-of-Serien + echte Playoff-Bracket-Grafik; Status-basierte
    Tabellen-Exklusion; Stat-Filter Hauptrunde/Playoffs/Gesamt; stabiler `leagueKey`; Benachrichtigung bei
    Team-Follow; sharp-Resize für gespeicherte Upload-JPEGs; Super-Admin-Tabellen auf `<Loading>`/`EmptyState`;
    Folge-Vorschläge nur für neue User; TransferEvents bleiben nach Team-Löschung als Historie (Design);
    `seed-world.mjs --prod` nur nach ausdrücklicher Freigabe des Users.
20. **Ball-Choreografie der Startseite – vier GESTALTUNGSENTSCHEIDUNGEN für Vivien**
    (Stand `cd51c92`, 15.08.2026; beide Gate-Prüfer weisen alle vier ihr zu, nicht der
    Entwicklung). Nichts davon ist ein Defekt – es sind Abwägungen, die am Produkt gemessen sind:
    (a) ⚠️ **Der Preis des Kontrast-Fixes.** Der Abdunkelungs-Bezug umfasst jetzt auch die
    Schaltflächenreihe (nötig: Kontrast der Beschriftung war 1,67:1 statt 4,5:1). Folge,
    gemessen: Der Hero-Ball ist über seinen gesamten Auftritt nur **9–10 % der Zeit** heller als
    0,6, mittlere Deckkraft **0,66 → 0,36–0,42**, und der **Aufsetzer findet bei 0,20 statt**.
    Tobias' Wort dafür: *Barrierefreiheit gewonnen, Wirkung verloren.*
    (b) **Die Übergabe findet mobil räumlich nicht statt.** Der Hero-Ball verlässt das Bild oben
    rechts, der Streckenball blendet unten LINKS am Balken ein – zwei Auftritte an
    entgegengesetzten Ecken. Bei 1280/1440 trägt es, weil beide am rechten Rand liegen.
    (c) **Ruhepunkt unter 640 px 34 px innerhalb der CTA-Ecke.** Nötig, damit der Ball nicht
    beschnitten wird (vorher 3 % sichtbar) – aber aus dem „Abzeichen an der oberen Ecke" wird
    eine Scheibe auf der Tastenkante. Der Kommentar in `HeroScrollStage.js` beschreibt noch das
    Alte.
    (d) **Die Landung ist auf KEINEM Viewport sichtbar** – Ball und Korb-Emblem stehen bei der
    Ankunft hinter der stickyen Navbar; mobil sitzt das Emblem links, der Ball landet rechts.
    ⚠️ **Altbestand, nicht aus dieser Runde** (per `git diff` belegt) – aber es heißt: Die Pointe
    der „einen Reise durch die Seite" hat noch nie jemand gesehen.
    Dazu offen: Zickzack statt Sinuswelle für die Dribbel-Spur (die Notationsbegründung im Code
    trägt erst dann wieder), und der `drop-shadow` auf dem Hero-Ball – Patricks Freigabe deckt
    ihn, die Abweichung von `docs/VISUELLE-RICHTUNG` sollte aber bei Vivien liegen.
20b. **Ball-Choreografie — die GESTALTUNG ist eingefroren, der Code war es nicht.**
    Roadmap 20 (a)–(d) ist umgesetzt, sechs Runden mit Vivien, fünf Gate-Runden.
    ⚠️ **Diese Überschrift log zwei Runden lang** (Befund Kai, fünfte Runde): Sie
    sagte „EINGEFROREN", darunter stand „kein Regressionsverdacht, sondern
    Entscheidungen" – und unmittelbar danach begann eine Liste behobener Defekte.
    Wer die Überschrift überflog, las das Gegenteil des Inhalts. Eingefroren ist
    seit dem 15.08. die **Gestaltungsrichtung** (keine weitere Vivien-Runde);
    die **Umsetzung** trug danach noch zwei Befunde von Tobias und sieben von Kai.
    Was hier als Abweichung steht, ist eine bewusste Entscheidung — **nicht als
    Zusicherung lesen, dass nichts mehr offen ist.**
    (a) ⚠️ **ZUERST: WAS DIE ZAHL MISST** (Befund Kai, vierte Runde). Es gibt
    ZWEI Kennzahlen: **geometrisch** = Anteil des Balls im Sichtfeld abzüglich
    Navbar, **wirksam** = derselbe Wert **mal Deckkraft**. Sie wurden von mir
    verwechselt (ich meldete „80 % → 43 %" als Vorher/Nachher – es waren beide
    Kennzahlen an derselben Position). **Viviens 55-%-Prüfmaß meint die
    WIRKSAME** – von ihr bestätigt: „Ein voll deckender Ball hinter der Navbar
    und ein weggedimmter Ball im Bild sind beide ‚nicht gesehen'."
    ✅ **Die frühere Ausnahme ist ERLEDIGT, nicht mehr eingefroren.** Sie lautete
    „mobil 43 %, 768×1024 50 % gegen ≥ 55 %". Ursache war eine Abdunkelung, die
    schon im **Anflug** rampte, obwohl die Lückensuche die Ruhelage per
    Konstruktion als frei bestimmt – zwei Mechanismen, die einander
    widersprachen. Seit die Abdunkelung nur noch bei **echter Überlappung**
    greift: **Deckkraft in der Ruhelage 1,00 auf jedem Viewport**, wirksame
    Sichtbarkeit **80 % mobil / 83 % ab 768**. Prüfmaß erfüllt.
    (b) **320 px liegt außerhalb des Zielbereichs** (Entscheidung Vivien) – der
    beginnt bei 375. Dort gilt nur „überhaupt sichtbar" (erfüllt: **80 %**,
    Fenster gemessen **132 px**), nicht die 150-px-Schwelle.
    ⚠️ **Hier standen bis zum 15.08. abends „43 %, ~138 px"** (Befund Kai): Die
    43 % stammten aus genau der Abdunkelung, die (a) zwei Zeilen weiter oben als
    behoben feiert. Die Zahl, deren Beseitigung der Absatz meldet, stand darunter
    noch als Beleg. **Eine korrigierte Aussage zieht ihre Belegzahlen mit.** Die war eine gegriffene runde Zahl.
    ⚠️ **UND DIE ZWEITE ZAHL DERSELBEN FEHLERFORM, 16.08.2026 (Vivien, selbst
    zurückgezogen).** Ihr erstes Prüfmaß zum Ball-Abstand lautete „auf 375–430
    kein Inhaltskasten näher als **16 px**, weder waagerecht noch senkrecht".
    Sie hat es kassiert, mit der schärfsten Begründung dieser Arbeit:
    > Der **senkrechte** Abstand ist eine Code-Konstante (`+ 8`) – frei wählbar.
    > Der **waagerechte** ist ein **Rest**: Viewport-Breite − Badge-Breite −
    > Anschnitt. Er wird nicht gesetzt, er **fällt an**. Eine Zahl über „beide
    > Achsen" behandelt eine **Stellschraube** und einen **Restbetrag** als
    > dieselbe Größe.
    Das ist die Bühne/Sichtfeld-Verwechslung im neuen Kostüm: in einer Einheit
    spezifizieren, die niemand steuert. ⚠️ Dazu: **Die klemmende Achse wechselt
    mit der Breite** – auf 375 bindet die Waagerechte (10,15 px), auf 320 die
    Senkrechte (dort überlappt der Ball das Badge waagerecht um 17 px). Eine
    Messung mit nur einer Achse kommt auf beiden Breiten zu einem Wert und auf
    einer davon zum falschen Schluss.
    **Geltendes Prüfmaß** (`tests/e2e/hero-abstand.spec.mjs`): gegenüber jedem
    Inhaltskasten – Textzeile ODER gefüllte Fläche, gemessen an der
    **gezeichneten** Fläche – mindestens **8 px auf mindestens einer Achse**
    („kein Kontakt, keine geteilte Kante"). Der waagerechte Abstand hat **keinen
    Sollwert**; wer ihn vergrößern will, muss eine der drei Entscheidungen
    aufgeben – Durchmesser mobil 72 px, Anschnitt `0,6·R`, Badge-Breite – **und
    benennen welche**.
    ⚠️ Diese Unterscheidung stand bis zur vierten Runde **nur hier und nicht im
    Test**: `ZIELBEREICH_AB`/`FENSTER_MIN` waren definiert und unbenutzt, weil
    meine Ergänzung am Suchmuster gescheitert war und ich die Fehlermeldung
    nicht nachgezogen habe (Befund Kai K4). Seit dem 15.08.2026 gilt sie im Test
    – wer sie ändert, ändert beide Stellen.
    (c) Der `drop-shadow` ist entfernt, die **Verläufe im Ball bleiben** – Viviens
    Grenze: keine Verläufe auf Flächen der Oberfläche, sehr wohl auf einem
    dargestellten Gegenstand. ⚠️ Gehört noch als Regel in
    `docs/VISUELLE-RICHTUNG-2026-08-12.md` nachgetragen.
    ⚠️ **Die zwei Sätze, die diese sechs Runden teuer gemacht haben** (beide von
    Vivien, beide gehören in `MUSTER-ZAHLEN-DIE-LUEGEN`):
    > „Frei" ist eine Aussage über die **Bühne**, „sichtbar" eine über das
    > **Sichtfeld**. Wer in Bühnenkoordinaten spezifiziert, was ein Mensch sehen
    > soll, bekommt grüne Kennzahlen über einen Gegenstand außerhalb des Bildschirms.

    > Vier Runden lang haben wir **Breiten** geprüft. Der Ausfall hing an der
    > **Fensterhöhe**. Eine Prüfmatrix mit nur einer Achse lässt beide Seiten
    > korrekt messen und trotzdem zu gegensätzlichen Ergebnissen kommen.
    Der Laufzeit-Test `tests/e2e/hero-ball-laufzeit.spec.mjs` prüft deshalb jetzt
    **neun Viewports mit Höhenachse**, jeder ein reales Gerät.
20d. ✅ **Viviens vier Punkte vom 17.08.2026 sind entschieden und umgesetzt** –
    und der wichtigste war keiner der vier, sondern ein Befund, den sie ungefragt
    dazu gefunden hat:
    (a) ⚠️ **Auf 360 px parkte der Ball im Textblock.** Weil die mobile Ruhelage
    am „obersten Kasten im x-Band" hing, hing sie am **ausgefransten rechten Rand
    der Display-Headline** – und der ist nicht monoton in der Breite. 360, 368,
    440, 480, 560 und 640 px trafen alle daneben; 360 px ist die verbreitetste
    Android-Breite Deutschlands. **Der Kanal zum Badge betrug dort genau 2,65 px –
    exakt der Wert, den Vivien zwei Runden früher als Defekt gemeldet hatte.**
    Er war nie behoben, nur auf eine Breite gewandert, wo er unsichtbar blieb.
    **Behoben:** Mobil ist die Ruhelage jetzt am Eyebrow **verankert** statt
    gesucht (`[data-hero-eyebrow]`).
    (b) ⚠️ **DIE REGEL, DIE DARAUS FOLGT — vierter Einheitenfehler dieser Arbeit,
    diesmal meiner:** Ich hatte „waagerechter Kanal ≥ 8 px" gebaut. Das Wort
    **waagerecht** schmuggelt eine ACHSE in ein Kriterium, das eine **diagonale**
    Beziehung beschreibt. Der Kanal zwischen Kreis und gerundetem Rechteck
    verläuft diagonal; achsenweise gemessen meldet er Kollision, wo Luft ist
    (bei 360 px: Hüllkörper 2,65 – echter Konturkanal **7,8–9,7**).
    **Geltendes Maß: kürzester Abstand der KONTUREN ≥ 10 px** (Eckenradius zählt
    mit, gemessen per `getComputedStyle`, nicht aus dem Tailwind-Mapping
    geschlossen). Der senkrechte Mittenabstand ist die **freie** Größe und wird
    als kleinster Wert in [12, 24] gelöst, der das erreicht.
    ⚠️ **Der eigentliche Gewinn:** Die Regel überlebt eine **Textänderung** am
    Eyebrow. In jeder früheren Zahl steckte die Badgebreite von 239,5 px – ein
    Wort mehr, und alle brachen.
    (c) **Die Schwelle „26 von 32 Bildern" ist GESTRICHEN**, nicht justiert:
    analytisch durchläuft die Kurve per Konstruktion alle 32, gezeigt ist die Zahl
    eine Eigenschaft der **Hardware** (30 Hz → 14, 60 Hz → 24, 120 Hz → 32), und
    Tobias' 26 gegen exakt 24 bei 60 Hz ist Frame-Jitter. Vivien: *„Eine Kennzahl,
    die zwischen zwei Läufen um zwei wandert, während die Schwelle auf der Kante
    liegt, ist kein Prüfmaß, sondern ein Münzwurf mit Fehlerbericht."*
    Es gilt **Bildstillstand ≤ 80 ms** – bindende Stelle ist der **Auslauf**
    (~66 ms von 520), also nur ~14 ms Reserve.
    (d) **Das 150-px-Scrollfenster ist GESTRICHEN**, nicht gesenkt (es wäre die
    dritte Nachgabe derselben Zahl). Begründung: Es war ein Ersatzmaß für
    „erscheint der Ball überhaupt" – richtig, solange die Ruhelage ein
    **Suchergebnis** war. Seit sie relativ zu einem Element liegt, das auf jeder
    Breite im ersten Bild steht, ist die Sichtbarkeit **per Konstruktion**
    zugesichert; sie über den Scrollweg nachzuprüfen heißt, hinter einer Garantie
    zu messen. Dazu: **Mobil ist der Auftritt nicht der Scrollweg, sondern die
    Ruhe davor** – der Scrollweg ist der **Abgang**, und der braucht keine
    Mindestdauer. Ersatz ist das bestehende Maß: wirksame Sichtbarkeit der
    Ruhelage **≥ 55 %**.
    (e) **`ZIELBEREICH_AB` 375 → 360.** Viviens Selbstkorrektur: *„Ich habe den
    Zielbereich bei 375 beginnen lassen, weil das die kleinste iPhone-Breite ist.
    Das war eine Apple-Brille."*
    (f) **72 px bleiben; die Erzählung wird korrigiert.** „Ein Motiv trägt die
    ganze Seite" war mobil **nie wahr** – ein 176-px-Ball neben einer dreizeiligen
    Headline war Konkurrenz zum `h1`, daraus der Kontrast 1,67:1, daraus die
    Abdunkelung, daraus der Wirkungsverlust aus Roadmap 20 (a). **Es wurde viermal
    am Symptom gearbeitet.** Mobil ist der Ball ein **wiederkehrender Akzent**;
    was ihn zum Motiv macht, ist Wiedererkennbarkeit an jeder Station, nicht
    Größe. Steht in `docs/VISUELLE-RICHTUNG-2026-08-12.md`.
    (g) **Klickfläche im Testphase-Banner 16 → 24,5 px**, Bandhöhe unverändert 45,
    eigener Fokusring. ⚠️ **Kein WCAG-Verstoß** (SC 2.5.8 hat eine Inline-Ausnahme
    für Ziele im Satzfluss) – es ist eine Wahl, keine Pflicht.
    ✅ **ERLEDIGT 17.08.2026 (`72a4fe9`):** Skip-Link + `main`-Landmarke stehen,
    SC 2.4.1 *Bypass Blocks* (A) und 1.3.1 sind bedient. **Zwei Fallen, die ein
    späterer Umbau kennen muss:**
    (1) Ein Wurzel-`main` um `<PageTransition>{children}</PageTransition>` in
    `app/layout.js` – der naheliegende Griff – ist **falsch**: Jede Seite bringt
    ihre eigene `Navbar`/`main`/`Footer` als Geschwister mit. Das hätte ~55
    vorhandene `main` ineinander verschachtelt und Navigation + Footer **in** den
    Inhalt gezogen; die Sprungmarke wäre **vor** der Navigation gelandet. Der
    Messwert `main.length === 0` galt für `/`, das tatsächlich eine der wenigen
    Seiten **ohne** `main` war – nicht für die Seite als Ganzes.
    (2) `sr-only` + `focus-visible:not-sr-only` ist die **falsche** Tailwind-
    Lösung: `not-sr-only` setzt `position: static`, das Element stünde im Fluss
    und würde den Testphase-Banner verschieben – genau die 45 px, auf die
    `Navbar.js`/`PlayerNav.js` mit ihren 7rem-Offsets rechnen. Deshalb
    `position: fixed`, das den Fluss **nie** beeinflusst.
    Ziel ist `main#hauptinhalt` mit `tabindex="-1"` (sonst wandert nur der
    Bildlauf, nicht der Fokus); Ring unterdrückt in `app/globals.css`.

20c. **Fünf Gestaltungspunkte liegen bei Vivien** (vorgelegt 16.08.2026, aus den
    Gate-Runden vier und fünf). Nichts davon ist ein Defekt – es sind Abwägungen,
    die beide Prüfer ausdrücklich ihr zuweisen und nicht der Entwicklung:
    (a) ⚠️ **Die Abdunkelung greift MOBIL überhaupt nie** (Befund Kai). Gemessen
    liegt die minimale Ball-Deckkraft auf 320–430 px über den **gesamten**
    Scrollweg bei **1,00**. Damit ist das ganze Werk aus `taste`-Unterscheidung,
    `TEXT_DIM_FLOOR` und `TEXT_FADE_MARGIN` auf dem **Hauptgerät wirkungslos** –
    es wirkt erst ab 768. Frage: gewollter Endzustand (die Lückensuche bzw. die
    mobile Bahn löst es geometrisch, die Abdunkelung ist nur noch Sicherheitsnetz)
    oder unentschiedener Nebeneffekt? ⚠️ Wenn gewollt, muss es als **Regel**
    festgeschrieben werden, sonst „repariert" oder entfernt jemand in vier Wochen
    eine scheinbar tote Mechanik.
    (b) **Der harte Sprung 1,00 → 0,20 über Schaltflächen** (~8 px Scrollweg, Faktor
    1 statt Rampe). ⚠️ Kais Messung dreht die ursprüngliche Begründung um: Von den
    drei Schaltflächen ist **nur „Als Spieler registrieren" deckend**; dahinter ist
    der Ball ohnehin unsichtbar. „Team gründen"/„Teams entdecken" sind
    `rgba(0,0,0,0)` – **dort** entsteht das Kontrastproblem. Die Regel wirkt
    richtig, die Begründung im Code führte in die falsche Richtung (korrigiert).
    (c) **Die Drehung steht in den letzten 150 ms des Einflugs still** (Tobias):
    ab t = 283 ms von 520 ms kein Bildwechsel mehr, gezeigt werden **14 statt 22**
    der 32 Bilder. Die Verzögerungskurve staucht die Rotation. Physikalisch
    stimmig oder soll die Bildwahl an die **lineare** Zeit statt an die verzögerte
    Position koppeln?
    (d) **Der Ball verdeckt bei der Ankunft das Netz des Korb-Emblems** fast
    vollständig (Tobias, Neubewertung von C1). Ein Akzent an dieser Stelle fände
    größtenteils dahinter statt. „Die Geometrie ist die Frage, nicht die
    Animation."
    (e) **Die Verlaufs-Regel fehlt in `docs/VISUELLE-RICHTUNG-2026-08-12.md`.**
    Dort steht pauschal „keine Verläufe, keine Schatten, kein Glow"; Viviens
    Unterscheidung (keine Verläufe auf **Flächen der Oberfläche**, sehr wohl auf
    einem **dargestellten Gegenstand**) steht bisher nur in CLAUDE.md.
20e. ✅ **ERLEDIGT: Tobias' H1 – der Ball sprang bis 39,8 px, wenn die Anmeldung
    spät auflöste.** Die beiden Hero-Zweige haben verschiedene Ruhelagen (das
    eingeloggte Eyebrow ist 179,8 px breit, das ausgeloggte 239,5 – und die
    Verankerung folgt dem Eyebrow). Löste `getmyinfo` nach der Landung auf, landete
    der Ball auf dem **ausgeloggten** Anker und `apply` schrieb die neue Lage
    danach ohne Übergang: 320 → 32,0 px · **600 → 39,8 px** · 640 → 25,2 px, je in
    EINEM Frame. ⚠️ Dass 375–412 px unauffällig waren, war **Zufall** – dort sind
    beide Anker deckungsgleich.
    Behoben: Die Korrektur wird **gefahren** (320 ms), und die Übergangszeit wird
    einmal gesetzt und danach abgeräumt – eine, die bei jedem Scroll neu startet,
    kommt nie an (Fehlerklasse Kai, dritte Runde).
    Bewacht durch `tests/e2e/hero-auth-tausch.spec.mjs` (4 Fälle); der Test prüft
    **vorab, dass der Zweig wirklich getauscht hat**, sonst wäre er grün und würde
    nichts messen.
    ⚠️ **Die Lehre steckt in der Messung, nicht im Fix** – gehört zu
    `docs/MUSTER-ZAHLEN-DIE-LUEGEN`: Meine Sonde war **zweimal wertlos**. Erst mit
    erfundenem Token (kein Zweigtausch; gemessen 20,0 px auf allen Breiten
    identisch – das waren `Reveal`s 20 px bei unsichtbarem Ball, und die Identität
    über alle Breiten war das Signal). Dann mit echtem Token und 0,0 px – **auch
    mit abgeklemmtem Fix 0,0 px**, weil sie eine Pause von >100 ms zwischen den
    Proben verlangte und die Korrektur 14 ms dauert. Entschieden hat erst die
    **Rohspur**, nicht die Kennzahl.

21. ✅ **ERLEDIGT (17.08.2026): Cache-Vorgabe für `/images/` und `/fonts/`.** Gesetzt in
    `next.config.mjs` über `headers()` – **nicht** in Nginx, damit die Vorgabe versioniert ist und
    mit jedem Deploy mitgeht statt am Server zu leben. Wert:
    `public, max-age=2592000, stale-while-revalidate=86400` (30 Tage, wie die Konvention für die
    Upload-Verzeichnisse). Auf der Production-Runtime nachgemessen, dann live.
    ⚠️ **Bewusst KEIN `immutable` und kein Jahr:** Die Dateinamen sind **nicht inhaltsadressiert**.
    `ball-basketball-32x200.webp` nennt Bildzahl und Kantenlänge, aber nichts über den Inhalt – wird
    die Sequenz mit denselben Parametern neu erzeugt (etwa mit anderem Nahtmuster), heißt die Datei
    gleich. Ein Jahr mit `immutable` hielte Wiederkehrer dauerhaft auf dem alten Ball, **und niemand
    könnte es sehen**, weil die Seite bei Erstbesuchern korrekt aussieht.
    ⚠️ **Regel daraus: Wer den Inhalt einer Datei unter gleichem Namen ändert, muss den Namen
    ändern.** Für die Ball-Sequenz ist das über drei Stellen gekoppelt und durch
    `tests/e2e/ball-sequenz.spec.mjs` abgesichert; für `logo.svg` und die Auth-Motive gibt es diese
    Absicherung **nicht**.

22. **`/signup` liefert ohne JavaScript eine leere Seite — liegt bei Vivien UND Nora.**
    Befund 17.08.2026, Nebenbefund der Sprungmarken-Arbeit, **vorbestehend**, kein Blocker:
    `docs/SIGNUP-OHNE-JS-2026-08-17.md`. Im rohen Server-HTML von `/signup` stehen **0**
    Formularfelder, **0** `<main>`, **0** Verweise auf Datenschutz und Impressum — ausgeliefert
    werden nur Banner und Sprungmarke. Ursache: `useSearchParams()` (Z. 32) auf einer statisch
    vorgerenderten Seite lässt Next die nächste `<Suspense>`-Grenze auf ihren Fallback
    zurückfallen, und der ist **leer** (Z. 291 ff.). `/login` hat dieselbe fallback-lose Grenze,
    nutzt aber kein `useSearchParams()` → rendert vollständig. Im Browser ist nach der Hydration
    alles korrekt.
    ⚠️ **Der Punkt für Nora ist der unangenehmere:** Der Datenschutzverweis, den sie am 13.08.
    für `/signup` gefordert hat (`docs/RECHT-LEISTUNGSKARTE-2026-08-13.md`), wurde in
    `AuthShell.js` eingebaut — und erreicht auf **genau dieser Seite** das Server-HTML nicht.
    Die damalige Abhilfe greift dort nur mit JavaScript. Entschärfen könnte es, dass ohne
    JavaScript auch kein Formular existiert, also nichts erhoben wird — das zu beurteilen ist
    ihre Sache, nicht meine.
    Für Vivien: `<Suspense>` ohne `fallback` heißt **kein gestalteter Ladezustand** auf dem
    QR-Landepunkt. Nicht gemessen und offen: **wie lang** die Lücke auf echten Geräten ist.

### Bekannte Einschränkungen (lokale Dev-Umgebung)
- SMTP-/Google-Keys fehlen in der lokalen `.env` → Mails/Google-Login nur auf dem VPS (hoops_prod) live
  testbar; lokal über In-App-Notifs + Trigger-Logs verifizieren.
- Schema-Änderungen erfordern Dev-Neustart (mongoose-Model-Cache). Nach Dev-Server-Lock ggf. `.next` löschen
  vor `npm run build`. Vor Deploy immer Production-Runtime testen (`npm start`), nicht nur `next dev`.

---

## 1. Projekt-Überblick

**Hoops Germany** ist eine Community-Plattform für Amateur-Basketball in Deutschland.  
Live unter: `hoopsgermany.de`  
VPS: Hostinger Ubuntu, `/root/sports/`, PM2 → `npm start`  
Repo: `https://github.com/Schemura98/sports-website.git`

**Tech-Stack (beibehalten):**
- Next.js 14 (App Router, `"use client"` wo nötig)
- MongoDB + Mongoose
- Tailwind CSS (Design: Orange `#f97316` / `orange-500` als Primärfarbe, weiß/grau-Töne)
- JWT-Auth (jsonwebtoken)
- Nodemailer (SMTP: info@hoopsgermany.de)
- react-icons/fa
- axios (Frontend HTTP)
- Inter (Google Font)

---

## 2. Umgebungsvariablen (.env – NUR auf VPS, NIE in git)

```
MONGODB_URI=...
SECRET_KEY=...
SMTP_USER=info@hoopsgermany.de
SMTP_PASS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CRON_SECRET=...
NEXTAUTH_URL=https://hoopsgermany.de
```

---

## 3. Datenbank-Modelle (MongoDB / Mongoose)

### Player
```js
{
  firstName, lastName,
  email (unique), password (nullable), googleId (nullable),
  status: "pending" | "active",
  teamId: ObjectId → teams,
  profileImage: String,
  followers: [ObjectId → players],
  following: [ObjectId → players],
  notifications: [{
    type: "follow"|"join_request"|"join_approved"|"pending_result"|"match_result",
    fromPlayerId, teamId, teamName, teamSlug, matchId, message, read, createdAt
  }],
  height, age, weight, birthdate, country, hometown,
  fibaLink, position, nationality, aboutPlayer,
  resetPasswordToken, resetPasswordExpiry,
  transferStatus: "verfuegbar"|"nicht_verfuegbar",
  preferredLeague, transferNote,
  isTeamAdmin: Boolean,
  teamAdminOf: ObjectId → teams,
  isSuperAdmin: Boolean,
  teamJoinRequest: ObjectId → teams,
  followingTeams: [ObjectId → teams],
  instagram: String
}
```

### Team
```js
{
  teamName (unique), email (unique), password,
  about, region, logo, banner,
  slug (unique),
  followers: [ObjectId → players],
  adminPlayerId: ObjectId → players,  // Spieler-geführtes Team
  inviteToken: String,
  rosterSlots: [{
    name, position, number,
    claimedBy: ObjectId → players,
    claimToken: String,
    status: "empty"|"pending"|"confirmed"
  }]
}
```

### Match
```js
{
  teamA, teamB: ObjectId → teams,
  date, location,
  leagueId: ObjectId → leagues,
  status: "scheduled"|"completed"|"cancelled",
  winningTeam: ObjectId,
  playerStats: [{
    player: ObjectId → players,  // null wenn kein Account
    playerName, rosterSlotId,   // für Slot-Spieler ohne Account
    team: ObjectId,
    points, assists, rebounds, didNotPlay
  }],
  winningTeamPoints, losingTeamPoints,
  notifiedPendingResult: Boolean,
  teamAResult: { ownPoints, opponentPoints, submittedBy, submittedAt },
  teamBResult: { ownPoints, opponentPoints, submittedBy, submittedAt },
  resultStatus: "pending"|"confirmed"|"mismatch"
}
```

### League
```js
{ name, season, teams: [ObjectId], matches: [ObjectId], active: Boolean }
```

### Post
```js
{ player: ObjectId, content, image, likes: [ObjectId], comments: [{player, text, createdAt}], createdAt }
```

### Tryout
```js
{
  teamId: ObjectId, date, location,
  positions: [String],  // kanonische Namen aus POSITIONS, keine Kürzel
  description,
  status: "active"|"closed",
  applicants: [{ playerId, appliedAt }]
}
```

### Admin
```js
{ username, password, email }
```

### Feedback
```js
{ message, type, createdAt, status: "new"|"read" }
```

### AnalyticsEvent
```js
{ eventType, path, sessionId, createdAt }
```

---

## 4. Seiten & Routing

### Öffentliche Seiten
| Route | Beschreibung |
|-------|-------------|
| `/` | Landing Page (Hero + Features + How it works) |
| `/login` | Spieler-Login (Email/PW + Google OAuth) |
| `/signup` | Spieler-Registrierung |
| `/reset-password` | Passwort zurücksetzen (Token-Flow) |
| `/home` | Newsfeed (eingeloggte Spieler) |
| `/spieler` | Alle Spieler (public) |
| `/teams` | Alle Teams (public) |
| `/spiele` | Spielplan/Ergebnisse (public) |
| `/ligen` | Liga-Übersicht |
| `/ligen/[id]` | Liga-Detail + Tabelle |
| `/match/[id]` | Spiel-Detail + Stats |
| `/tryouts` | Alle offenen Tryouts |
| `/tryouts/[id]` | Tryout-Detail + Bewerbung |
| `/topscorer` | Topscorer-Tabelle |
| `/about` | Über uns |
| `/impressum` | Impressum |
| `/datenschutz` | Datenschutzerklärung |
| `/kontakt` | Kontakt |
| `/feedback` | Feedback-Formular |
| `/oauth-landing` | Google OAuth Callback-Landing |

### Spieler-Seiten (Auth required)
| Route | Beschreibung |
|-------|-------------|
| `/player/newsfeed` | Spieler-Newsfeed (Posts, Following-Feed) |
| `/player/edit-profile` | Profil bearbeiten |
| `/player/update-password` | Passwort ändern |
| `/player/player-detail` | Eigene Profilansicht |
| `/player/view-player/[slug]` | Fremdes Spielerprofil |

### Team-Seiten
| Route | Beschreibung |
|-------|-------------|
| `/team/login` | Team-Login |
| `/team/register` | Team-Registrierung |
| `/team/dashboard` | Team-Dashboard (public: Kader, Spiele, Posts) |
| `/team/edit-team` | Team-Profil bearbeiten |
| `/team/admin` | **Team-Admin Panel** (Hauptfeature, s. Abschnitt 5) |
| `/team/join/[token]` | Einladungs-Link (Transfer-Beitritt) |
| `/team/claim/[token]` | Roster-Slot beanspruchen |
| `/team/team-detail/[slug]` | Öffentliche Team-Profilseite |

### Admin-Seiten (Super-Admin)
| Route | Beschreibung |
|-------|-------------|
| `/admin/login` | Admin-Login |
| `/admin/dashboard` | Übersicht + Charts |
| `/admin/players` | Alle Spieler verwalten |
| `/admin/teams` | Alle Teams verwalten |
| `/admin/matches` | Spiele verwalten |
| `/admin/update-match/[match-id]` | Spiel bearbeiten |
| `/admin/leagues` | Ligen verwalten |
| `/admin/analytics` | Seitenaufrufe etc. |
| `/admin/feedback` | Feedback-Nachrichten |
| `/admin/moderation` | Moderation |

---

## 5. Team-Admin Panel (Kernfeature)

**Route:** `/team/admin`  
**Auth:** `teamAuthToken` (localStorage) ODER `playerAuthToken` wenn `isTeamAdmin=true`

### Tabs:
1. **Kader** – Roster-Slots anzeigen, Slot teilen (Invite-Link), Slot-Status (empty/pending/confirmed)
2. **Anfragen** – Spieler-Beitrittsanfragen genehmigen/ablehnen
3. **Spielplan** – Spiele eintragen (Gegner, Datum, Ort)
4. **Ergebnisse** – Ergebnis einreichen (eigene + Gegner-Punkte + Spieler-Stats)
5. **Tryouts** – Tryouts ausschreiben, Status togglen (active/closed)
6. **Einstellungen** – Team-Name bearbeiten, Logo hochladen, Banner hochladen, Einladungslink

### Einladungssystem:
- Admin erstellt Roster-Slot (Name + Position)
- Slot hat einen eindeutigen `claimToken`
- Einladungs-E-Mail an den Spieler mit Link `/team/claim/[token]`
- Spieler registriert sich und Slot wird auf "pending" gesetzt
- Admin genehmigt → "confirmed"

### Ergebnis-Verifikation:
- Beide Teams reichen Ergebnis separat ein
- System vergleicht: übereinstimmend → "confirmed", widersprüchlich → "mismatch"
- Admin kann Mismatches auflösen

---

## 6. API-Endpunkte (vollständig)

### Auth
- `POST /api/player/playerlogin` – Login (email, password) → JWT
- `POST /api/player/playerregister` – Registrierung
- `GET /api/auth/google` – Google OAuth initiieren
- `GET /api/auth/google/callback` – Google OAuth Callback
- `POST /api/player/forgotpassword` – Passwort-Reset E-Mail
- `POST /api/player/resetpassword` – Neues Passwort setzen (token)

### Spieler
- `POST /api/player/getmyinfo` – Eigenes Profil (token)
- `POST /api/player/fetchinfo` – Spielerinfos
- `POST /api/player/fetchsingleplayerinfo` – Ein Spieler by slug
- `POST /api/player/fetchall` – Alle Spieler
- `POST /api/player/update-profile` – Profil updaten
- `POST /api/player/update-password` – Passwort ändern
- `POST /api/player/followplayer` – Spieler folgen/entfolgen
- `POST /api/player/checkfollowing` – Folge-Status prüfen
- `POST /api/player/getfollowlist` – Follower/Following-Liste
- `POST /api/player/fetchposts` – Posts eines Spielers
- `POST /api/player/fetchsingleplayerposts` – Posts by Slug
- `POST /api/player/getfollowingposts` – Feed (Following)
- `POST /api/player/careerstats` – Karriere-Stats
- `POST /api/player/calculateplayerstats` – Stats berechnen
- `POST /api/player/topscorer` – Topscorer-Tabelle
- `POST /api/player/transfer` – Transfer-Status lesen
- `POST /api/player/update-transfer` – Transfer-Status setzen
- `POST /api/player/team-feed` – Team-Feed
- `POST /api/player/getnotifications` – Benachrichtigungen
- `POST /api/player/marknotificationsread` – Als gelesen markieren

### Team
- `POST /api/team/teamlogin` – Login (email, password) → JWT
- `POST /api/team/teamregister` – Team registrieren
- `POST /api/team/fetchteams` – Alle Teams
- `POST /api/team/fetchinfo` – Team-Info (by token)
- `POST /api/team/fetchsingleteaminfo` – Team by Slug
- `POST /api/team/fetchsingleteamplayers` – Team-Spieler by Slug
- `POST /api/team/fetchsingleteamposts` – Team-Posts by Slug
- `POST /api/team/fetchtopteams` – Top-Teams
- `POST /api/team/addplayer` – Spieler hinzufügen
- `POST /api/team/removeplayer` – Spieler entfernen
- `POST /api/team/requestjoin` – Beitrittsanfrage stellen
- `POST /api/team/fetchjoinrequests` – Anfragen abrufen
- `POST /api/team/handlejoinrequest` – Anfrage genehmigen/ablehnen
- `POST /api/team/followteam` – Team folgen/entfolgen
- `POST /api/team/update-team` – Team-Daten updaten (Name, Logo) – dual auth
- `POST /api/team/updatebanner` – Banner hochladen
- `POST /api/team/generate-invite` – Einladungs-Token generieren
- `POST /api/team/invite-email` – Einladungs-E-Mail senden
- `POST /api/team/join-team` – Team via Token beitreten
- `POST /api/team/submit-match-result` – Ergebnis einreichen
- `POST /api/team/matchesupdate` – Spiele-Update

### Roster-Slots
- `POST /api/team/roster/add-slot` – Slot hinzufügen
- `POST /api/team/roster/remove-slot` – Slot entfernen
- `POST /api/team/roster/slot-info` – Slot-Info
- `POST /api/team/roster/claim-slot` – Slot beanspruchen
- `POST /api/team/roster/request-claim` – Anspruch anfragen
- `POST /api/team/roster/approve-claim` – Anspruch genehmigen
- `POST /api/team/roster/admin-join` – Admin trägt sich selbst ein
- `POST /api/team/roster/send-invite-email` – Einladungs-Mail für Slot
- `POST /api/team/report-roster-slot` – Slot melden

### Spiele
- `POST /api/admin/createandfetchmatches` – Spiel erstellen oder alle holen
- `GET /api/matches/public` – Öffentliche Spiele
- `GET /api/match/[id]` – Spiel-Detail

### Ligen
- `GET /api/leagues` – Alle Ligen
- `GET/PATCH/DELETE /api/leagues/[id]` – Liga CRUD
- `POST /api/admin/createleague` – Liga erstellen
- `POST /api/admin/updateleague` – Liga updaten
- `POST /api/admin/deleteleague` – Liga löschen

### Admin
- `POST /api/admin/adminlogin` – Admin-Login
- `POST /api/admin/adminregister` – Admin anlegen
- `POST /api/admin/fetchallplayers` – Alle Spieler (Admin)
- `POST /api/admin/fetchallteams` – Alle Teams (Admin)
- `POST /api/admin/deleteplayer` – Spieler löschen
- `POST /api/admin/deleteteam` – Team löschen
- `POST /api/admin/deletepost` – Post löschen
- `POST /api/admin/setteamadmin` – Spieler als Team-Admin setzen
- `POST /api/admin/updatematch` – Spiel-Ergebnis als Admin setzen
- `POST /api/admin/notify-pending-results` – Pending-Results-E-Mails (Cron)

### Tryouts
- `POST /api/tryouts/create` – Tryout erstellen
- `GET /api/tryouts` – Alle aktiven Tryouts
- `GET /api/tryouts/[id]` – Tryout-Detail
- `POST /api/tryouts/[id]/apply` – Bewerben
- `POST /api/tryouts/my-tryouts` – Meine Tryouts (Team-Admin)
- `PATCH /api/tryouts/my-tryouts` – Status ändern

### Sonstiges
- `POST /api/posts/uploadpost` – Post erstellen
- `POST /api/posts/likepost` – Like togglen
- `POST /api/posts/addcomment` – Kommentar
- `POST /api/feedback` – Feedback senden (→ E-Mail an Admin)
- `GET /api/news/rss` – Basketball-News RSS
- `POST /api/analytics/track` – Seitenaufruf tracken
- `GET /api/analytics/summary` – Analytics-Zusammenfassung

---

## 7. Auth-System

**Zwei Auth-Token-Typen (beide in localStorage):**
1. `teamAuthToken` – für Team-Accounts (JWT enthält `teamId`)
2. `playerAuthToken` – für Spieler-Accounts (JWT enthält `playerId`/`id`)

**Team-Admin-Flow:**
- Spieler kann Admin eines Teams sein: `isTeamAdmin=true`, `teamAdminOf=ObjectId`
- Alle Team-Admin-Endpoints akzeptieren BEIDE Token-Typen
- Wenn `teamAuthToken` fehlt → prüfe `playerAuthToken` → hole `teamAdminOf` aus DB

**Google OAuth:**
- Route: `/api/auth/google` → redirect zu Google
- Callback: `/api/auth/google/callback` → erstellt/findet Player → JWT → redirect zu `/oauth-landing`
- `/oauth-landing` schreibt Token in localStorage und redirectet zu `/player/newsfeed`

---

## 8. E-Mail-System

- SMTP: `info@hoopsgermany.de` über Hostinger Webmail
- Nodemailer (lib/mailer.js)
- E-Mails für: Passwort-Reset, Team-Einladung, Feedback-Benachrichtigung, Pending-Results-Erinnerung

---

## 9. Design-System

**Primärfarbe:** Orange (`orange-500` = `#f97316`, `orange-600` für Hover)  
**Hintergrund:** `gray-50` (Seiten), `white` (Cards)  
**Text:** `gray-900` (Überschriften), `gray-600`/`gray-500` (Fließtext)  
**Font:** Inter (Google Fonts)  
**Icons:** react-icons/fa  
**Rounded:** xl, 2xl für Cards  
**Shadow:** sm, md für Cards  
**Navbar:** weiß mit orange Akzenten, mobil responsive  
**Buttons:** `bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2`

---

## 10. Was NICHT neu gebaut werden muss

- Admin-Panel (nur für internen Gebrauch, kann am Ende ergänzt werden)
- Analytics-System
- Die alten "Pakistaner"-Komponenten-Struktur (alles in `components/player/newsfeed/...` war chaotisch)

## 11. Prioritäten für den Neustart

**Phase 1 – Core:**
1. Auth (Spieler Login/Register + Google OAuth)
2. Spielerprofil (Edit, Anzeige)
3. Team (Login, Register, Profil)
4. Team-Admin Panel (alle 6 Tabs)

**Phase 2 – Features:**
5. Spielplan & Ergebnisse
6. Ligen & Tabellen
7. Tryouts
8. Transfermarkt
9. Roster-Slot-System

**Phase 3 – Community:**
10. Newsfeed / Posts
11. Follower-System
12. Benachrichtigungen
13. Topscorer

---

## 12. VPS-Deployment

```bash
# SSH: ssh root@[VPS-IP]
# Projekt: /root/sports/
# Start: pm2 start "npm start" --name sports --cwd /root/sports
# Build: cd /root/sports && npm run build
# Logs: pm2 logs sports
```

**.gitignore muss enthalten:**
```
.env
.next/
node_modules/
public/team/
public/players/
```

---

## 13. Bekannte Probleme im alten Code (vermeiden!)

- Doppelte Mongoose-Model-Definitionen (z.B. PlayerModel zweimal importiert)
- Keine einheitliche Fehlerbehandlung in API-Routes
- Chaotische Komponenten-Verschachtelung (6 Ebenen tief)
- `"use client"` fehlte an kritischen Stellen
- Kein einheitliches Loading/Error-State-Pattern
- Kein TypeScript (optional für Neustart zu überlegen)
- Direkte `localStorage`-Zugriffe ohne Null-Checks
- Template-Literals mit Backticks in base64-Strings (Escape-Probleme)
