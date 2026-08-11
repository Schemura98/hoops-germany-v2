# Hoops Germany – Vollständige Projektspezifikation
## Briefing für Claude Code Neustart

---

## 0. AKTUELLER STAND (Überblick · Stand 11.08.2026)

> 🟢 **v2 IST LIVE auf https://hoopsgermany.de** (seit 24.06.2026). Hostinger-VPS `92.113.25.249`
> (Ubuntu 24.04), Code in `/root/hoops-v2` (Branch **`redesign`**), PM2-Prozess **`hoops-v2` auf Port 3001**,
> DB **`hoops_prod`** (Atlas). Alte Seite läuft als Rollback-Fallback weiter (PM2 `sports`, Port 3000,
> DB `test`) → Rollback = Nginx zurück auf 3000. Deploy: `cd /root/hoops-v2 && git pull && npm run build &&
> pm2 restart hoops-v2` (bei neuen Dependencies vorher `npm install`). Claude-SSH-Key `~/.ssh/hoops_vps`
> (lokal); VPS-Repo-Zugang via Deploy-Key (SSH-Alias `github-hoops`).
> **Zuletzt deployt: `ec423a2` (12.08.2026)** – Feature-Strecke „Ein Spielzug in sechs Szenen“
> (Stufen 1–3), Fortschritts-Anzeige, Design-Review-Wellen 3 und 4.
> **Rollback-Punkt davor: `c2fcf1a`** (auf dem VPS auschecken, `npm run build`, `pm2 restart hoops-v2`).
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
- **Projektort:** `C:\dev\hoops-germany-v2` – **NICHT zurück nach OneDrive** (OneDrive sperrt `.next`).
- **`npm run build` NIE parallel zu laufendem `next dev`** (überschreibt dessen `.next`-CSS → ungestylte
  Seiten/CSS-404; Dev-Server danach neu starten). Nach Dev-Server-Lock ggf. `.next` löschen vor dem Build.
  ⚠️ **Port-Prüfung sprachunabhängig machen:** Windows ist hier **deutsch**, `netstat` schreibt
  **`ABHÖREN`** statt `LISTENING` – ein `netstat | grep LISTEN` meldet den Port fälschlich als frei
  (am 12.08.2026 genau so passiert: Build lief in einen fremden Dev-Server hinein). Stattdessen die
  Portspalte auswerten (`netstat -ano | awk '$2 ~ /:3000$/ && $4 !~ /:/ {print $5}'`) oder schlicht
  `curl` gegen `http://localhost:3000` schicken.
- **Schema-Änderungen an Modellen greifen erst nach Dev-Server-Neustart** (mongoose cached das Model).
- **Vor Deploy immer die Production-Runtime testen** (`npm start`), nicht nur `next dev` (populate-Bug-Lehre).
- **Bei Neu-Deploy/Server-Umzug:** `deploy/nginx-hoopsgermany.conf` nach `/etc/nginx/sites-available/default`,
  Upload-Verzeichnisse `/var/www/hoops-uploads/{players,team,posts}` + Symlinks aus `public/…`
  (chown root:www-data, chmod a+rX) neu anlegen – sonst sind Bild-Uploads kaputt (Details: Chronik, 26.06./27.06.).

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
  Demo-Team-Admin (Prod-Testphase): `demo.coach@nrw-demo.de` / `test123` (Köln Comets).

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
>
> 📌 **KONVENTION (verbindlich): Vor jedem Deploy zwei Gates.** `npm run build` + Playwright
> (`npx playwright test -c tests/e2e/playwright.config.mjs`) und die Production-Runtime (`npm start`,
> nicht nur `next dev`) — danach **Kai** (`test-automatisierung`, Skills `security-review` + `review`
> auf `git diff origin/redesign..HEAD`) und für nutzersichtbare Änderungen **Tobias**
> (`qa-reviewer`, global unter `~/.claude/agents/`) als unabhängiges Browser-Gate, **mobil zuerst**.
> ⚠️ Vor Testläufen prüfen, ob ein fremder Dev-Server auf Port 3000 hängt; `npm run build` nie
> parallel dazu. ⚠️ Ist die Browser-Vorschaufläche ausgeblendet, laufen **keine** rAF-Frames
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
- **Design-Sprache (Redesign):** helle Seiten (`gray-50`) + **Navy-Flächen** (`bg-gradient-to-r from-slate-950 to-slate-800`) + Orange-Akzente (`brand-*`, `brand-500=#f97316`) + `font-black`-Headlines + Inter. Echte Assets in `public/images/` (`logo.svg` = weiße Wortmarke für Navy-Navbar; `logo-hoops.svg` = dunkel für helle Auth-Seiten; `login image.jpg`/`signupImage.jpg` = Hero-Motive, jeweils mit AVIF/WebP-Varianten `login-image-1000.*`/`signup-image-1000.*` über `AuthShell.js`). `registerimage.jpg`/`playerimage.jpg` waren nie bzw. nicht mehr im Einsatz (`/team/register` ist nur Redirect) und liegen seit 11.08.2026 archiviert in `docs/asset-archive/` (Befund: `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`). Namenskonvention für neue Bild-Varianten: `docs/NAMENSKONVENTION-BILDER.md` (Kebab-Case, `<basis>-<lange-Kante>.<format>`).
- **Wiederverwendbare Redesign-Bausteine:** `components/layout/AuthShell.js` (Split-Screen Auth),
  `components/layout/PageHeader.js` (Navy-Banner für Listen), `components/Avatar.js`
  (generiertes Initialen-Logo mit deterministischer Namensfarbe – Fallback für Spieler & Teams, überall),
  `components/player/PlayerProfileView.js` (komplettes Spieler-Profil), `components/CityInput.js`
  (Stadt-Typeahead), `components/CityRadiusFilter.js` (Umkreis-Filter), `components/layout/Navbar.js`
  (öffentlich, login-bewusst), `components/landing/HeroScrollStage.js` (scroll-gesteuerte Hero-Bühne
  „Sprungball": ein rAF-Controller für alle Deko-Ebenen, Ziel wird zur Laufzeit am CTA-Rechteck
  gemessen, kein Pinning, `prefers-reduced-motion` rendert Ball/Emblem gar nicht) mit
  `components/landing/HeroGlyphs.js` (Ball, Korb-Emblem, Spielfeld-Bogen als reine Vektoren).
- **Designsystem-Primitive (`components/ui/`):** `Button` (Varianten primary/secondary/ghost/danger/
  dangerGhost + Größen sm/md/lg, `href`→Link), `Tabs` (einheitlicher Pill-Umschalter), `Card`, `EmptyState`,
  `Loading` (Basketball-Spinner), `Skeleton`/`SkeletonCard`/`SkeletonList`, `FormAlert`
  (role=alert/aria-live), `ConfirmAction` (Bestätigungs-Popover statt `window.confirm`). Tokens in
  `lib/ui.js` (`inputClass`, `inputClassSm`, `inputClassNum`/`inputClassStat` – die beiden Zahlenfelder
  bewusst OHNE Breitenklasse, Breite setzt die aufrufende Stelle –, `cardClass`). Team-Admin-Tabs nutzen
  zusätzlich `components/team/tabs/TabAlert.js` (FormAlert-Wrapper für ihr `{type,text}`-Format).
  **Konvention:** neue/überarbeitete Seiten IMMER diese Primitive nutzen (keine Ad-hoc-Buttons/Tabs/
  Spinner, kein `window.confirm`). **Rollout abgeschlossen (Wellen 1–5 + Welle 2b für das
  Team-Admin-Panel, Commits in der Chronik).** Bewusst belassen (custom/kompakt): lokale `inputClass` in
  `team/claim`, `admin/leagues`, `admin/update-match`. Optionaler Restschliff: Super-Admin-Tabellen/
  „Lädt…"-Texte auf `<Loading>`/`EmptyState`.
- **Geo-Suche:** Feld `bundesland` an Player/Team/League; `lib/geo.js` + `public/data/de-cities.json`
  (14.910 Orte mit lat/lng, lazy geladen) für Stadt+Umkreis (Haversine). Stadt-Eingabe per Typeahead
  setzt das Bundesland automatisch.
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
- **Spielbetrieb:** Ergebnis-Verifikation + Mismatch-Eskalation an beide Admins + Super-Admins,
  Box-Scores, Topscorer/Rangliste saison-fähig, Spielerhistorie mit Einzelspielen, Karriere-Timeline.
- **Onboarding & Wachstum:** Willkommens-Tour, Onboarding-Checklist (Feed + Startseite), PWA
  (`/installieren`), login-bewusste Landing, Testphase-Banner.
- **Admin & Analytics:** Analytics Phase 1–3 Teil 1 (Dashboard, Sponsor-Report, teilbarer
  Passwort-geschützter Report-Link), Feedback-Inbox, zentrales Mail-System (`lib/emailTemplates.js`,
  Empfänger-Matrix mit info@-Bündelung via `lib/adminRecipients.js`).
- **Seed-/Demo-Tooling** (alle additiv, getaggt, idempotent, `--purge`-fähig): `seed-demo` (Dev-Basis),
  `seed-nrw-leagues` (offizieller Katalog), `seed-nrw-demo`, `seed-kreisligen-demo` + `-niers`,
  `seed-showcase-posts`, `seed-world` (**Prod: nicht ausgeführt**), `rollover-season` (**Prod: noch nie ausgeführt**).

### 🔜 Noch offen (Roadmap)
1. **`/admin`-Temp-Passwort** (`A1cGmhwN-1To`) auf ein eigenes ändern – oder den Legacy-`/admin`-Login ganz
   entfernen (Super-Admin-Spieler kommen ohnehin direkt rein).
2. **Demo-Daten nach der Testphase durch echte ersetzen** (auf dem VPS): `node scripts/seed-nrw-demo.mjs
   --purge`, `node scripts/seed-kreisligen-demo.mjs --purge`, `node scripts/seed-kreisligen-demo-niers.mjs
   --purge`, `node scripts/seed-showcase-posts.mjs --purge`; **danach beim Cutover die alte DB `test` löschen**.
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
    optional `CountUp`/`Reveal` auf den öffentlichen Seiten) und **Welle 4** (LegalShell-Zeilenlänge,
    Sprungnavigation Datenschutz – nur Gestaltung, Text gehört Nora –, oauth-landing-Fehlerzustand,
    FeedbackButton-Position auf Formularseiten).
11. **Startseite als Scroll-Erlebnis – was noch offen ist:** Konzepte liegen vollständig vor
    (`docs/LANDING-KONZEPT-2026-08-11.md` inkl. Nachtrag, `docs/HERO-KONZEPT-2026-08-11.md`,
    `docs/LANDING-COPY-2026-08-11.md`). Gebaut sind Hero-Stufe 1, Feature-Choreografie (Stufe 1),
    Fortschritts-Anzeige (Stufe 2), Neles Texte (Stufe 3) und Viviens Feinschliff. **Offen:**
    Hero-**Desktop**-Ausbaustufe (gepinnte Bühne, 140vh, drei Szenen – Konzept steht, bewusst
    zurückgestellt, weil mobil der Hauptfall ist); Stufe 4 der Feature-Strecke (kurzer Pin nur für
    die Ergebnis-Szene) **nur**, falls Ronjas Nutzungsprüfung zeigt, dass die Doppel-Bestätigung
    nicht verstanden wird; Test auf echtem Low-End-Android (bisher nur 4×-CPU-Drosselung);
    Neles „nice to have"-Textvorschläge für die Karten 2/5/6.
12. **Weitere UX-Feinschliffe nach Tester-Feedback** (laufend).
13. **Optional / bewusst offen:** Best-of-Serien + echte Playoff-Bracket-Grafik; Status-basierte
    Tabellen-Exklusion; Stat-Filter Hauptrunde/Playoffs/Gesamt; stabiler `leagueKey`; Benachrichtigung bei
    Team-Follow; sharp-Resize für gespeicherte Upload-JPEGs; Super-Admin-Tabellen auf `<Loading>`/`EmptyState`;
    Folge-Vorschläge nur für neue User; TransferEvents bleiben nach Team-Löschung als Historie (Design);
    `seed-world.mjs --prod` nur nach ausdrücklicher Freigabe des Users.

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
