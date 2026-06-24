# Hoops Germany – Vollständige Projektspezifikation
## Briefing für Claude Code Neustart

---

## 0. AKTUELLER STAND (Stand: 24.06.2026 – Redesign-Phase)

> 🟢 **v2 IST LIVE auf https://hoopsgermany.de** (seit 24.06.2026, Hostinger-VPS, DB `hoops_prod`).
> Das Redesign (Navy/Slate + Orange + Canva-Logo) ist abgeschlossen und im Produktivbetrieb;
> Hauptflow live verifiziert. Details + offene Punkte siehe unten (Go-Live-Block + Roadmap).
> Alte Seite läuft als Rollback-Fallback weiter (PM2 `sports`, Port 3000, DB `test`).

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
> (`942cc69`; 57 official, Idempotenz ok; Prod-Katalog gesamt 59 inkl. 2 Demo „Regionalliga Süd"/Bayern).
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
> 2. (optional) NRW-**Kreisligen** – von den 22 Basketballkreisen separat verwaltet, KEINE zentrale WBV-PDF →
>    fragmentiert/aufwändig, eigene Quellen je Kreis. Niedrige Prio.
> Im Liga-Picker (`/team/create`) live gegenprüfen.
> **Weiter offen:** (6) Demo-Liga `Regionalliga Süd` (Bayern) durch echte NRW-Ligen ersetzen / entfernen;
> (optional) Liga-Auswahl nachträglich im Team-Einstellungen-Tab änderbar machen.
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

> **STAND / WEITER (Pause):** v2 ist live, abgesichert, Hauptflow bestätigt. Offene Punkte siehe Roadmap.
> Updates deployen: `cd /root/hoops-v2 && git pull && npm run build && pm2 restart hoops-v2` (Claude per `~/.ssh/hoops_vps`).
> ✅ `c813d56` (Akkordeon) **und** `fbbe06a` (Footer/Geburtstag/Karriere-Verlauf/aktive Nav) sind gepusht **und live deployt** (Prod-Build grün getestet).

🔜 **Noch offen (nach Go-Live):**
1. **`/admin`-Temp-Passwort** (`A1cGmhwN-1To`) auf ein eigenes ändern (oder Legacy-`/admin`-Login ganz entfernen,
   da Super-Admin-Spieler eh direkt reinkommen).
2. **Demo-Daten** nach der Testphase durch echte ersetzen (frischer Seed / Bereinigung); dann alte DB `test` löschen.
3. **Monetarisierung (#6)** – BLOCKIERT bis **Gewerbeanmeldung** des Users (Amazon-Affiliate +
   Sponsorfläche; AdSense erst bei genug Traffic + Consent-Banner).
4. Weitere UX-Feinschliffe nach Tester-Feedback.
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
   Katalog gesamt **67** (31 Herren + 16 Damen + 20 Jugend m/o/w). **Noch offen:** **U10** (beide; WBV noch
   „offen"); (optional) NRW-**Kreisligen** (pro Basketballkreis, niedrige Prio); weibliche Jugend gegen die
   finale WBV-Einteilung gegenprüfen, falls sie später auftaucht.
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

### Bekannte Einschränkungen / offen
- **Lokale Dev-Umgebung:** SMTP/Google-Keys fehlen in der lokalen `.env` → Mails/Google-Login nur auf dem VPS
  (hoops_prod) live testbar; lokal über In-App-Notifs + Trigger-Logs verifizieren.
- Schema-Änderungen erfordern Dev-Neustart (mongoose-Model-Cache). Nach Dev-Server-Lock ggf. `.next` löschen vor `npm run build`.
- **Vor Deploy immer Production-Runtime testen** (`npm start`/VPS-Build), nicht nur `next dev` (s. populate-Bug).

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
  positions: [String],  // ["PG","SG","SF","PF","C"]
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
