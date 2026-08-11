# Ablage-Audit: Bilder `public/images/` (2026-08-11)

Erstellt von **Frieda** (dokumenten-logistik) auf Meldung von Milo
(`docs/HERO-ASSETS-2026-08-11.md`, Abschnitt 5 + Punkt 6.3). Ursprünglich
reine Befundaufnahme + Empfehlung ohne Dateibewegung — **Patrick hat
inzwischen entschieden, umgesetzt ist der Vorgang jetzt in
`docs/asset-archive/README.md` und `docs/NAMENSKONVENTION-BILDER.md`
dokumentiert.**

> **Korrektur 11.08.2026 (Hinweis der Hauptsession):** Die ursprüngliche
> Aussage in Frage 3, "0 Referenzen bei allen 8 neuen Dateien", war beim
> Abfassen bereits überholt — `login-image-1000.*`/`signup-image-1000.*`
> waren zu diesem Zeitpunkt schon in `AuthShell.js` eingebaut (Commit
> `0c978e0`). Nur die vier Hochformat-Varianten (`register-image-373.*`/
> `player-image-912.*`) waren tatsächlich referenzlos — Details bei
> Frage 3 unten. Die Umsetzung berücksichtigt das bereits korrekt:
> `AuthShell.js` wurde nicht angefasst.

---

## Befund Teil A — Verwaisungsprüfung `registerimage.jpg` / `playerimage.jpg`

### A.1 Erweiterte Code-Suche (über reinen Dateinamen-Grep hinaus)

Geprüft: Teilstrings (`register`, `player`, `registerImage`, `player-image`,
`imageSrc`), dynamisch zusammengebaute Pfade (`` /images/${...} ``),
`AuthShell`-Aufrufe mit `image`-Prop, sowie `lib/emailTemplates.js` (Mail-
Design-System) und `lib/mailer.js`.

Ergebnis: **keine funktionalen Treffer.** Einzige Fundstellen bleiben:

- `CLAUDE.md:95`, `AGENTS.md:360`, `docs/CHRONIK.md:373` — jeweils dieselbe
  Design-Sprache-Zeile, die `registerimage.jpg` als "Hero-Motiv" nennt.
  **`playerimage.jpg` taucht dort gar nicht auf** — die Doku ist sich also
  selbst nicht einig, welches der beiden Bilder je als Motiv galt.
- `docs/HERO-ASSETS-2026-08-11.md` (Milos eigener Bericht).
- Ein **Fehlalarm bei Teilstring-Suche**: `app/api/upload/player-image/route.js`
  und der Endpoint-String `/api/upload/player-image` in
  `app/player/edit-profile/page.js:293`. Das ist die API-Route für den
  Spieler-**Profilbild-Upload** (multipart, schreibt nach `public/players/`)
  — reine Namensüberschneidung, hat mit der Datei `playerimage.jpg`
  nichts zu tun.
- `lib/emailTemplates.js` referenziert für den Mail-Header ausschließlich
  `logo-email.png` — keine Hero-Bilder in E-Mail-Templates.

### A.2 Team-Registrierungs-Flows (Dateien tatsächlich gelesen, nicht nur CLAUDE.md geglaubt)

- **`app/team/register/page.js`**: verifiziert — ist wirklich nur eine reine
  Redirect-Komponente (`TeamRegisterRedirect`), kein `AuthShell`-Import,
  kein Bildbezug. Leitet zu `/team/create` (eingeloggt) bzw.
  `/login?next=/team/create` weiter. CLAUDE.md-Behauptung stimmt.
- **`app/team/create/`** (der tatsächliche, heutige Team-Gründungs-Flow):
  kein `AuthShell`, kein `/images/`-Bezug.
- **`app/team/join/[token]/`**, **`app/team/claim/[token]/`**: geprüft,
  keine `AuthShell`- oder Bild-Referenzen.
- **`app/signup/page.js`**: nutzt `AuthShell` mit `signupImage.jpg` (bekannt,
  unstrittig).

### A.3 `AuthShell.js` — Default-Prop und Verwendungsstellen

`components/layout/AuthShell.js` gelesen: Default `image = "/images/login image.jpg"`.
Die `MODERN_SOURCES`-Map (AVIF/WebP-Ersatz, von der Hauptsession am
11.08. in Commit `0c978e0` eingebaut) kennt **nur zwei Schlüssel**:
`login image.jpg` und `signupImage.jpg`. `registerimage.jpg` ist dort
nicht enthalten — selbst falls es referenziert würde, gäbe es keine
moderne Variante dafür.

`AuthShell` wird aktuell an genau drei Stellen aufgerufen:
`app/login/page.js`, `app/signup/page.js`, `app/reset-password/page.js`.
Keine davon überschreibt `image` mit `registerimage.jpg` oder
`playerimage.jpg`.

### A.4 Git-Historie — der entscheidende Befund

**`registerimage.jpg` war im Code, wurde aber bewusst wieder entfernt:**

| Commit | Datum | Was |
|---|---|---|
| `0fd42d2` "Redesign Auth: Split-Screen-Look via gemeinsame AuthShell" | 23.06.2026 | führt `registerimage.jpg` als Motiv für `/team/login` und `/team/register` ein |
| `a6ab9a5` "Spieler-geführte Teams: Team-Login entfernt, Team-Gründung + Kader-Mitglieder" | 23.06.2026, ca. 38 Min. später | entfernt beide `image="/images/registerimage.jpg"`-Zeilen wieder — im selben Zug, in dem Team-Accounts durch spieler-geführte Teams ersetzt wurden (`/team/login` & `/team/register` → Redirects, neuer Flow `/team/create`) |

Das ist ein **dokumentierter, bewusster Architektur-Umbau**, kein
Versehen: Die Commit-Message von `a6ab9a5` beschreibt den kompletten
Wechsel des Team-Modells. `registerimage.jpg` wurde nicht "vergessen",
sondern ist mit dem gesamten Team-Account-Login-Flow mitgestorben, ohne
dass jemand daran gedacht hat, das inzwischen ungenutzte Bild selbst
aufzuräumen — das ist normal und genau der Fall, für den dieses Audit da
ist.

**`playerimage.jpg` war nie im Code:** `git log -S"playerimage" --oneline --all`
liefert außer Milos heutigem Doku-Commit (`0c978e0`) **keinen einzigen
Treffer**. Die Datei liegt seit dem allerersten Baseline-Commit
(`79ccd75`, "funktionierender v2-Neubau vor Design-Restyling") unverändert
im Ordner, wurde aber zu keinem Zeitpunkt in eine Komponente eingebunden.
Anders als bei `registerimage.jpg` gibt es hier keinen "war mal drin,
dann entfernt"-Beleg — es sieht nach Material aus, das beim
Redesign-Start pauschal mit in den neuen `public/images/`-Ordner
übernommen wurde, ohne je gebraucht zu werden (passt zum Hochformat
912×1235 — denkbar für ein früher erwogenes, nie umgesetztes
Spieler-Profil-Motiv, aber das ist Spekulation, kein Beleg).

### A.5 Nutzung außerhalb des Repos

- `C:\Users\schem\OneDrive\Desktop\Hoops-Marketing\` existiert und wurde
  rekursiv nach beiden Dateinamen durchsucht. Einziger Treffer:
  `_werkzeuge\INSTALL-VERMERK-sharp.md`, wo Milo `registerimage.jpg`
  ausschließlich als **Testobjekt zur Verifikation des `sharp`-Tool-Setups**
  benutzt hat ("`sharp('registerimage.jpg').metadata()` korrekt gelesen").
  Das ist keine Marketing-Verwendung, sondern ein technischer Lesetest an
  einer Kopie/Referenz der Repo-Datei.
- Kein Treffer im Sponsoren-Deck-Material oder sonstigen HTML/PDF/PPTX
  unter dem Marketing-Ordner.

### A.6 Einschätzung

Beide Dateien sind **im aktuellen Code nachweislich verwaist** und auch
außerhalb des Repos ungenutzt — mit unterschiedlicher Vorgeschichte:
`registerimage.jpg` ist Überbleibsel eines bewussten Refactorings,
`playerimage.jpg` wurde vermutlich nie eingebaut. Beide haben jetzt
frische WebP/AVIF-Geschwister (`register-image-373.*`,
`player-image-912.*`), die im selben Moment mit-verwaisen, falls die
Originale wegfallen.

---

## Befund Teil B — Namensschema-Gegenprüfung

### B.1 Ist-Zustand `public/images/` (vollständig, per `ls`)

| Datei | Konvention |
|---|---|
| `login image.jpg` | Leerzeichen im Namen |
| `signupImage.jpg` | camelCase |
| `registerimage.jpg`, `playerimage.jpg` | alles klein, zusammengeschrieben |
| `logo-hoops.svg`, `logo-email.png`, `logo.svg`, `logo.png` | Kebab-Case bzw. einfach |
| `basketballogo.png`, `basketballogorotate.png`, `contentimage.png`, `postcardimage.jpg`, `profileimage.png`, `newsfeed.png`, `dhlogo.jpg` | weitere Altbestände, alles klein zusammen |
| `login-image-1000.{webp,avif}`, `signup-image-1000.{webp,avif}`, `register-image-373.{webp,avif}`, `player-image-912.{webp,avif}` | Milos neue Dateien, Kebab-Case + Breite |

Der Altbestand ist tatsächlich uneinheitlich, wie im Auftrag beschrieben —
**vier verschiedene Schreibweisen** im selben Ordner.

### B.2 Bewertung von Milos Schema (`<basis>-<breite>.<format>`, Kebab-Case)

**Kebab-Case-Grundstruktur: bestätigt.** Das ist nicht nur "eine von
mehreren" Altkonventionen, sondern deckt sich mit der Konvention, die im
übrigen Projekt tatsächlich lebt — API-Routen (`/api/upload/player-image`),
Seiten-Routen (`/team/create`, `/reset-password`) sind durchgehend
Kebab-Case. Milos Wahl ist also nicht willkürlich, sondern die einzige der
vier Alt-Schreibweisen, die zum Rest der Codebase passt.

**Breite als Dimension im Namen: nur teilweise treffend.**

- Bei `login-image-1000` / `signup-image-1000` (Querformat, ~1,5:1) ist
  die Breite eine plausible Kenngröße — auch wenn Milos eigener Messbericht
  (Abschnitt 1B) zeigt, dass im `AuthShell`-Split-Screen tatsächlich die
  **Höhe** die treibende Kante ist, nicht die Breite. Die Breite im Namen
  beschreibt also korrekt die Quellauflösung, aber nicht immer die
  "kritische" Kante für die konkrete Verwendung.
- Bei `register-image-373` / `player-image-912` (**Hochformat**, 373×571
  bzw. 912×1235) ist die Breite die **kurze** Kante — `-373` bzw. `-912`
  im Namen wirkt für ein Hochformat-Bild eher irreführend als informativ,
  weil man beim Lesen des Dateinamens erwartet, die auffällige/lange
  Kante zu sehen. Genau dieses Problem hat der Auftrag selbst schon
  aufgeworfen.

**Zukunftstauglichkeit:** Milo hat bewusst keine `-1600`/`-2400`-Stufen
erzeugt (keine Hochskalierung). Sein eigener Bericht (Abschnitt 3) nennt
als Zielmarke für echtes Ersatzmaterial "≥ 3600 px **lange Kante**" — das
ist eine andere Metrik als "Breite". Wenn later echtes Material in dieser
Größenordnung kommt, würde ein reines Breite-Schema bei Hochformat-Bildern
wieder dieselbe Verzerrung produzieren wie jetzt bei `register-image-373`.

**Zusatzbefund: `-1000`/`-373`/`-912` disambiguieren aktuell nichts.** Da
es je Bild nur genau **eine** neue Größenstufe gibt (keine `-1600` usw.),
hat die Zahl im Namen aktuell keine unterscheidende Funktion gegenüber
anderen Dateien — sie ist reine Vorbereitung auf einen Fall, der noch
nicht eingetreten ist (mehrere Stufen desselben Motivs). Das ist an sich
kein Fehler, aber eine YAGNI-Abwägung, die Patrick treffen sollte: jetzt
festlegen (während noch nichts referenziert, also das billigste
Zeitfenster) oder erst, wenn tatsächlich mehrere Stufen existieren.

### B.3 Eigener Befund: `login image.jpg` (Leerzeichen, aktiv referenziert)

Verifiziert per Grep — **3 Fundstellen**, alle aktiv in Produktion:
`components/landing/LandingHero.js:58` (`backgroundImage: url('/images/login image.jpg')`),
`components/layout/AuthShell.js:12` (Map-Schlüssel) und `:29` (Default-Prop).

Funktioniert aktuell, weil Browser das Leerzeichen in String-URLs
automatisch als `%20` kodieren. Das Risiko ist damit **nicht akut, aber
real und schläft**: Es bricht potenziell bei jeder Verwendung, die nicht
durch denselben Browser-Auto-Encoding-Pfad läuft — z. B. ein
Shell-Skript, das über `public/images/*.jpg` iteriert, ein Sitemap-/
RSS-Eintrag, ein direkter `curl`/Downloadlink, oder ein künftiges Next.js
`<Image>`-Element mit strikterer Pfad-Validierung. Da diese Datei der
tatsächliche Landing-Hero auf der Live-Seite ist, ist eine Umbenennung
nicht dringend, aber sinnvoll — **nur mit Freigabe, atomar mit allen drei
Fundstellen zusammen.**

### B.4 Dokumentations-Drift (unabhängig von der Archivierungs-Entscheidung)

`CLAUDE.md:95`, `AGENTS.md:360`, `docs/CHRONIK.md:373` listen
`registerimage.jpg` weiterhin als "Hero-Motiv" — das stimmt seit dem
23.06.2026 (Commit `a6ab9a5`) nicht mehr. Diese Zeile ist unabhängig
davon, was mit den Bilddateien passiert, bereits veraltet und sollte
korrigiert werden.

---

## Entscheidungsvorlage für Patrick

**1. Was passiert mit `registerimage.jpg` + `register-image-373.{webp,avif}`
(zusammengehöriges Set)?**
- **A — Behalten wie jetzt** (in `public/images/`, ungenutzt, wird aber
  mit jedem Deploy live mitausgeliefert und ist unter der öffentlichen
  URL erreichbar/crawlbar, auch wenn keine Seite darauf verlinkt).
- **B — In ein Archiv außerhalb von `public/` verschieben** (z. B.
  `docs/asset-archive/` — wichtig: **muss außerhalb von `public/`
  liegen**, sonst bleibt es trotz "Archiv"-Namen weiterhin live
  ausgeliefert). Sinnvoll, falls das Hochformat-Motiv für ein späteres
  Feature (Vivien-Konzept, Spieler-Profil-Optik) noch infrage kommt.
- **C — Löschen** (Original + beide Varianten). Sinnvoll, falls weder
  Vivien noch Nele hierfür einen Bedarf sehen.
- *(D — inhaltliche Bewertung, ob das Motiv für ein künftiges Feature
  taugt, ist nicht meine Entscheidung — ggf. kurz Vivien fragen, bevor
  B vs. C entschieden wird.)*

**2. Was passiert mit `playerimage.jpg` + `player-image-912.{webp,avif}`
(zusammengehöriges Set)?**
Gleiche Optionen A/B/C wie bei Frage 1. Zusatzhinweis: Da diese Datei nie
im Code eingebunden war (kein Refactoring-Beleg, s. A.4), ist die
Vermutung eines "geplant, nie umgesetzt"-Assets plausibler als bei
`registerimage.jpg` — falls Patrick sich erinnert, wofür es ursprünglich
gedacht war, würde das die Entscheidung zwischen B und C erleichtern.

**3. Namensschema für neue Bild-Varianten — Milos Vorschlag
`<basis>-<breite>.<format>` bestätigen oder anpassen?**
- **A — So bestätigen wie vorgeschlagen** (Breite, unabhängig von
  Orientierung).
- **B — Anpassen auf lange Kante statt Breite** (`<basis>-<lange-Kante>.<format>`),
  damit Hochformat- und Querformat-Bilder einheitlich und ohne
  Irreführung benannt sind, und damit das Schema direkt an Milos eigene
  Zielmarke "≥ 3600 px lange Kante" anschließt, wenn später echtes
  Ersatzmaterial kommt. Würde bedeuten: `register-image-571.*`,
  `player-image-1235.*` statt `-373`/`-912` (nur die zwei Hochformat-Dateien
  wären betroffen, `login-image-1000`/`signup-image-1000` blieben gleich,
  da bei denen die Breite zufällig auch die lange Kante ist).
- **C — Dimension aus dem Namen ganz weglassen**, solange es je Motiv nur
  eine Nicht-Original-Größe gibt (`login-image.webp` statt
  `login-image-1000.webp`) — die Zahl disambiguiert aktuell nichts, da
  keine zweite Stufe existiert. Erst wenn echte Größenstufen entstehen
  (z. B. nach neuem ≥3600px-Material), Dimension wieder einführen.
- **Korrektur (nachgetragen 11.08.2026, Hinweis der Hauptsession):** Die
  Prämisse "0 Referenzen bei allen 8 neuen Dateien" war zum Abfassungs-
  zeitpunkt bereits überholt. Seit Commit `0c978e0` ("Auth-Seiten: Motiv
  als AVIF/WebP und unter 1024px gar nicht laden", 11.08. 01:56) sind
  `login-image-1000.avif/.webp` und `signup-image-1000.avif/.webp`
  bereits in `components/layout/AuthShell.js` Zeilen 12–18 über die
  `MODERN_SOURCES`-Map eingebaut (`<picture>` AVIF→WebP→JPEG, per
  `media`-Query unter 1024px kein Motiv-Ladevorgang). **Referenzlos sind
  nur noch die vier Hochformat-Varianten** `register-image-373.*` /
  `player-image-912.*` — und genau die sind ohnehin die, die laut
  Entscheidung 1/2 archiviert werden. Für diese vier bleibt die
  Kernaussage richtig: Umbenennung ist jetzt am billigsten, weil kein
  Code darauf verweist. Für `login-image-1000.*`/`signup-image-1000.*`
  gilt das **nicht mehr** — sie sind aktiv eingebaut und korrekterweise
  unangetastet geblieben (Breite = lange Kante bei diesen beiden, s.
  Patricks Entscheidung 3 unten).
- Sobald referenzierte Dateien betroffen wären, würde jede Umbenennung
  teurer (Code-Anpassung nötig) — trifft aktuell auf keine der vier
  archivierten Dateien zu, da sie beim Verschieben ins Archiv ohnehin
  gleich mitumbenannt wurden.

**4. `login image.jpg` (Leerzeichen im Namen) — jetzt mit umbenennen oder
zurückstellen?**
- **A — Zurückstellen**, da funktional unauffällig und die Datei gerade
  aktiv drei Code-Stellen referenziert (höheres Umbau-Risiko als bei den
  unbenutzten Dateien).
- **B — Jetzt mit umbenennen** (z. B. `login-image.jpg`), im selben Zug
  wie eine mögliche Schema-Entscheidung zu Frage 3, damit der ganze
  Auth-Bild-Bestand einheitlich wird. Erfordert Freigabe + atomare
  Anpassung aller drei Fundstellen (`LandingHero.js:58`,
  `AuthShell.js:12`, `AuthShell.js:29`).

**5. Dokumentations-Korrektur `CLAUDE.md:95` / `AGENTS.md:360` /
`docs/CHRONIK.md:373`** (Design-Sprache-Zeile nennt `registerimage.jpg`
fälschlich noch als aktives Hero-Motiv, seit 23.06.2026 falsch) —
**unabhängig von Fragen 1–4 zu korrigieren.** Vorschlag: die Zeile auf
die tatsächlich genutzten Motive (`login image.jpg`/`signupImage.jpg`)
kürzen. Kleinere, risikolose Korrektur — auf Zuruf erledige ich das,
sobald Patrick grünes Licht gibt (oder es fließt automatisch mit ein,
falls Clara ohnehin im Rahmen von `log-progress` an diesen Dateien
arbeitet).

---

## Kollegen einbezogen

- **Milo (medien-produzent):** Ersteller des Fundes und der neuen
  Varianten-Dateien — hat den Fall bereits in Abschnitt 5/6.3 seines
  Berichts sauber an mich weitergereicht. Kein weiterer Rückfragebedarf
  meinerseits, da sein Bericht die nötigen technischen Fakten (Maße,
  Gewichte, Git-unabhängig beobachtete Nichtnutzung) schon lieferte —
  ich habe sie hier nur unabhängig gegengeprüft und um die Git-Historie
  ergänzt.
- **Hanna (hr-koordinator):** noch nicht eingebunden — dieses Audit ist
  reine Befundaufnahme ohne Dateibewegung, daher noch kein
  Ablage-Vorgang fürs Backoffice-Roster. Sobald Patrick zu Frage 1/2
  entscheidet, trage ich den tatsächlichen Umzug/die Löschung ins
  Umzugsprotokoll ein und informiere Hanna.
- **Clara (log-progress):** relevant für Frage 5 (CLAUDE.md-Korrektur)
  und, falls B/C bei Fragen 1–2 gewählt wird, für die Doku des
  Ablageorts in der CLAUDE.md — aktuell nicht aktiv eingebunden, da noch
  keine Entscheidung vorliegt, die dokumentiert werden müsste.
- **Vivien (design-spezialistin):** noch nicht gefragt, aber in Frage 1
  als sinnvolle Zusatzmeinung vorgeschlagen (ob das Hochformat-Motiv für
  ein künftiges Feature taugt), bevor Patrick zwischen Archivieren und
  Löschen entscheidet.
