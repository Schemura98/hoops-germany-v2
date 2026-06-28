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
>
> 📌 **KONVENTION (verbindlich): Bei neuen Funktionen Feedback & Analytics mitpflegen.** Wird ein
> **neuer nutzersichtbarer Bereich/eine neue Funktion** gebaut, das **Feedback-Formular** (Themen-Chip
> in `app/feedback/page.js` `AREAS`) und das **Analytics-Tool** (Bereichs-Bündelung im `$switch` von
> `app/api/analytics/summary/route.js`; bei zählbarer Kennzahl zusätzlich Plattform-Überblick +
> `app/admin/analytics/page.js`) aktualisieren. Dafür gibt es die Skill **`update-feedback-analytics`**
> (`.claude/skills/update-feedback-analytics/`).

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
> 2. (optional) NRW-**Kreisligen** – von den 22 Basketballkreisen separat verwaltet, KEINE zentrale WBV-PDF →
>    fragmentiert/aufwändig, eigene Quellen je Kreis. Niedrige Prio.
> Im Liga-Picker (`/team/create`) live gegenprüfen.
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
> - **`app/installieren/page.js`** (`/installieren`): Anleitungsseite mit **Plattform-Erkennung** –
>   Android/Chrome zeigt bei `beforeinstallprompt` einen **„App installieren"-Button** (sonst Menü-Anleitung),
>   iOS/Safari die **„Teilen → Zum Home-Bildschirm"-Schritte**; erkennt bereits installierten Standalone-Modus.
>   Navy-`PageHeader` + 3 Vorteils-Cards (Vollbild/Immer aktuell/Schneller Start) + Navbar/Footer.
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
