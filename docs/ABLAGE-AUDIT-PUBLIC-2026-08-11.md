# Ablage-Audit: restlicher `public/`-Bestand (2026-08-11)

Erstellt von **Frieda** (dokumenten-logistik), Folgeauftrag zu
`docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`, Patricks Freigabe. Reine
Befundaufnahme — **nichts verschoben, umbenannt, gelöscht oder
committet.** Keine Doku-Korrekturen diesmal, nur Befund.

---

## Sicherheits-/Auslieferungsbefund zuerst (wichtigster möglicher Fund)

**`public/data/`** enthält genau eine Datei: `de-cities.json` (1,02 MB).
Aktiv genutzt über `fetch("/data/de-cities.json")` in `lib/geo.js` für die
Umkreis-Suche (Städte-Autocomplete). Inhalt: deutsche Ortsnamen +
Koordinaten — **keine sensiblen Daten, öffentliche Auslieferung ist hier
sachlich richtig.** Kein Kreisligen-Bezug gefunden (das läuft laut Code
über `lib/constants.js`, nicht über diese Datei). **Kein
Sicherheitsbefund.**

**`public/posts/`** enthält aktuell eine Datei auf der Platte
(`4e05d5023639ca4a.png`, 189 B), ist aber korrekt in `.gitignore`
eingetragen (`/public/posts/`, neben `/public/team/` und
`/public/players/`) — verifiziert per `git ls-files public/posts`
(leer) und `git status --ignored` (Datei als `!!` markiert, also aktiv
ignoriert). **Keine Inkonsistenz** — die Vermutung aus dem Auftrag
(Uploads könnten versehentlich ins Repo wandern) trifft hier nicht zu,
das ist bereits sauber.

---

## Statustabelle `public/images/`

| Datei | Status | Fundstellen | Empfehlung |
|---|---|---|---|
| `login image.jpg` | **aktiv** | `LandingHero.js:58`, `AuthShell.js:12`+`29` (+ `login-image-1000.webp/avif`) | behalten, unverändert |
| `signupImage.jpg` | **aktiv** | `AuthShell.js` auf `/signup` (+ `signup-image-1000.webp/avif`) | behalten, unverändert |
| `logo.svg` | **aktiv** | `Navbar.js:217`, `PlayerNav.js:57` (weiße Wortmarke) | behalten |
| `logo-hoops.svg` | **aktiv** | `AuthShell.js:53` (dunkle Wortmarke) | behalten — Doku stimmt hier (verifiziert, nicht nur geglaubt): 25.520 vs. 25.545 B, unterschiedliche Hashes, zwei echte Varianten |
| `logo-email.png` | **aktiv** | `lib/emailTemplates.js:65` (Mail-Header, via `${baseUrl}/images/...`) | behalten |
| `favicon.ico` | **aktiv** | kein Code-Verweis nötig — Next.js liefert `public/favicon.ico` automatisch unter `/favicon.ico` aus | behalten |
| `logo.png` | **aktiv, aber außerhalb des Web-Codes** | `tmp/pdfs/build_testerkarte.py:22` (Python-Skript, erzeugt die Tester-Kampagne-Druckkarte; Output liegt real in `output/pdf/Hoops_Germany_Testerkarte_A6_*.pdf`, zuletzt 08.08.2026 gelaufen) | behalten — hat einen echten, aktuellen Verbraucher, nur eben kein Next.js-Code |
| `basketballogo.png` | **verwaist**, MD5-**identisch** mit `logo.png` (`4d3480…`) | keine Code-/Skript-/Tmp-/Marketing-Referenz (0 Treffer, `git log -S` seit Baseline unverändert) | archivieren — `logo.png` ist der faktisch genutzte Name dieses Duplikat-Paars |
| `contentimage.png` | **verwaist**, MD5-**identisch** mit `profileimage.png` (`7cc064…`) | keine Referenz irgendwo | archivieren |
| `profileimage.png` | **verwaist**, MD5-identisch mit `contentimage.png` | keine Referenz irgendwo | archivieren — bei diesem Paar ist **keiner** der beiden Namen aktiv, es gibt also keinen "kanonischen" Namen zu bevorzugen; Auswahl beim Zurückholen wäre willkürlich |
| `basketballogorotate.png` | **verwaist** | keine Code-Referenz; plausible Erklärung: `components/ui/Loading.js` (der "Basketball-Spinner") nutzt tatsächlich ein Icon (`FaBasketballBall animate-bounce`, react-icons), kein Bild-Asset — laut `docs/CHRONIK.md` (Welle 2b) wurden sogar mehrere lokale Icon-Spinner-Kopien auf genau diese Komponente vereinheitlicht. Die Datei war vermutlich ein früher Anlauf für einen Bild-basierten Spinner, der zugunsten der Icon-Lösung nie gebraucht wurde | archivieren |
| `postcardimage.jpg` | **verwaist** | keine Referenz — auch nicht im Testerkarten-Skript, das aktuell echtes Print-Material erzeugt und dafür `logo.png` nutzt, nicht dieses Bild | archivieren; der Name klingt nach einer frühen Idee für genau dieses Kampagnen-Motiv, das ist aber **Spekulation**, kein Beleg |
| `newsfeed.png` | **verwaist** | keine Code-Referenz auf die Datei selbst; `git log -S"newsfeed"` liefert viele Treffer, aber das sind ausschließlich Commits zum **Feature** "Newsfeed" (Text), nicht zur Datei — Fehlalarm bei reiner Wort-Suche, per Datei-Historie (`git log -- public/images/newsfeed.png`) sauber widerlegt: nur der Baseline-Commit | archivieren |
| `dhlogo.jpg` | **verwaist, Herkunft unklar** | keine Referenz irgendwo (Code, Skripte, Marketing-Ordner); Bildinhalt geprüft: generisches "DH"-Monogramm-Logo (Blau/Weiß-Verlauf auf Navy), **keinerlei Hoops-Germany-Bezug** (nicht orange, kein Basketball-Motiv) | **keine Empfehlung von mir — echte Rückfrage an Patrick** (s. u.), ich rate nicht, wofür "DH" steht |

Alle sieben "verwaisten" Dateien wurden **ausschließlich im allerersten
Baseline-Commit** (`79ccd75`, "funktionierender v2-Neubau vor
Design-Restyling") hinzugefügt und seither nie wieder angefasst — sie
tragen exakt dasselbe Herkunftsmuster wie `playerimage.jpg` aus dem
letzten Audit: mit dem Ordner pauschal übernommen, nie eingebaut. Anders
als bei `registerimage.jpg` (aktives Refactoring-Überbleibsel) gibt es
hier **keinen einzigen Beleg**, dass irgendeine dieser sieben Dateien
je im Code verwendet wurde.

Legacy-v1-Abgleich nicht möglich: `Desktop\Hoops\sports-website\`
(laut Ablageplan die eingefrorene v1) existiert unter diesem Pfad aktuell
nicht (geprüft) — konnte also nicht gegengecheckt werden, ob diese
Dateien von dort stammen.

---

## Sonderbefund: PWA-Icons

`app/manifest.js` referenziert ausschließlich `/icon.png` und
`/apple-icon.png` — das sind die Next.js-App-Router-Sonderdateien
`app/icon.png` / `app/apple-icon.png` (root-level, **nicht**
`public/images/`). Kein einziges `public/images/*`-Bild ist Teil der
PWA-Icon-Kette, auch nicht `basketballogo.png`/`logo.png` trotz
naheliegendem Namen. Reiner Grep hätte das nicht gezeigt (Next.js
generiert den Manifest-Eintrag aus der Dateikonvention, nicht aus einem
String-Pfad zu `public/images/`) — genau der Blindfleck, vor dem der
Auftrag gewarnt hat, hier aber ohne Befund: sauber getrennt.

Kein `robots.txt`, kein `app/sitemap.js`, kein
`app/opengraph-image.js`/`twitter-image.js`, keine `openGraph`/`twitter`-
Metadaten in `app/layout.js` gefunden — es gibt aktuell **gar kein**
Social-Share-Vorschaubild (weder aktiv noch verwaist). Das ist kein
Ablage-Befund im engeren Sinn (keine Datei liegt falsch), aber ein
Feature-Lücke, die beim Aufräumen aufgefallen ist — melde ich der
Vollständigkeit halber, keine Ablage-Handlung meinerseits nötig.

## Sonderbefund: Mail-Assets

`lib/emailTemplates.js` referenziert für den Mail-Header ausschließlich
`logo-email.png` über `${baseUrl}/images/logo-email.png` (absolute URL,
korrekt für Mail-Clients). Kein weiteres Bild-Asset im Mail-System
gefunden.

## Sonderbefund: Testerkarte-Tooling liegt im Repo-Scratch, nicht im Marketing-Ordner

Nicht explizit angefordert, aber direkt relevant für die `logo.png`-
Einordnung oben, deshalb kurz mitgemeldet statt unterschlagen:
`tmp/pdfs/build_testerkarte.py` + die gerenderten
`output/pdf/Hoops_Germany_Testerkarte_A6_*.pdf` liegen in den
**untrackten Scratch-Ordnern `tmp/`/`output/` innerhalb des Git-Repos**,
nicht unter `Desktop\Hoops-Marketing\_werkzeuge\`, wo laut Ablageplan
vergleichbares Tooling (Milos `make-hero-variants.js`) korrekt liegt.
Kein akuter Schaden (beide Ordner sind git-untracked, landen also nicht
im Repo-Verlauf), aber ein kleiner Ablage-Fund am Rande — falls
gewünscht, ziehe ich das Skript + die beiden PDFs in einem eigenen,
kleinen Vorgang nach `Desktop\Hoops-Marketing\Tester-Akquise\` bzw.
`_werkzeuge\` um. Nicht Teil dieses Auftrags, daher nicht ausgeführt.

---

## Entscheidungsvorlage für Patrick (gebündelt)

**1. Archivierung der 7 verwaisten Dateien** — Empfehlung: alle nach
`docs/asset-archive/` (analog zum letzten Audit), Optionen wie beim
letzten Mal (behalten/archivieren/löschen):
`basketballogo.png`, `contentimage.png`, `profileimage.png`,
`basketballogorotate.png`, `postcardimage.jpg`, `newsfeed.png` — plus
`dhlogo.jpg`, **wenn** Frage 2 klärt, dass es wirklich niemand mehr
braucht.

**2. `dhlogo.jpg` — reine Rückfrage, keine Ablage-Entscheidung:** Weißt
du, wofür "DH" steht bzw. woher dieses Logo stammt (Sponsor-Platzhalter?
Template-Mitbringsel? Partner aus einer frühen Konzeptphase)? Ohne diese
Info kann ich nicht sinnvoll zwischen "archivieren" und "löschen"
unterscheiden — im Zweifel würde ich zu **archivieren** raten (kostet
nichts, hält die Option offen), aber sag Bescheid, falls du weißt, dass
es wirklich gegenstandslos ist.

**3. Duplikat-Paare — welchen Namen behalten, falls konsolidiert wird?**
- `basketballogo.png` ≡ `logo.png`: `logo.png` hat einen echten Nutzer
  (`tmp/pdfs/build_testerkarte.py`), `basketballogo.png` keinen → falls
  konsolidiert wird, ist `logo.png` der klare Kandidat zum Behalten.
- `contentimage.png` ≡ `profileimage.png`: **keiner** der beiden Namen
  wird irgendwo referenziert — beide sind gleich verzichtbar, die Wahl
  wäre bei dir, falls du einen der beiden Namen für später reservieren
  willst.
- Beide Paare werden ohnehin gemeinsam archiviert (Frage 1) — diese
  Frage betrifft nur die **Namensfrage**, falls eines der Motive später
  zurückgeholt wird.

**4. Testerkarte-Tooling umziehen (`tmp/pdfs/` + `output/pdf/` →
Hoops-Marketing)?** Kleiner Bonus-Fund, siehe Sonderbefund oben — ja/nein
reicht, ich erledige es dann in einem eigenen kurzen Vorgang.

Kein Sicherheitsbefund, keine Namenskonvention-Verletzung bei aktiv
genutzten Dateien, keine Massen-Umbenennung vorgeschlagen — konsistent
zu deiner "zurückstellen"-Entscheidung bei `login image.jpg` im letzten
Audit.

---

## Umgesetzt am 11.08.2026 (Patricks Freigabe zu allen drei Fragen)

**a) Archivierung.** Per `git mv` nach `docs/asset-archive/`, Original-
namen beibehalten (kein Größenvarianten-Bestand, Umbenennung hätte nur
die Herkunft unauffindbar gemacht):
`basketballogo.png`, `basketballogorotate.png`, `postcardimage.jpg`,
`newsfeed.png`, `dhlogo.jpg` (Herkunft weiterhin unbekannt, Patrick
kennt sie auch nicht — archiviert statt gelöscht) sowie `profileimage.png`
(s. Dublette unten). Details, Begründung je Datei und Zurückhol-Anleitung
in `docs/asset-archive/README.md`.

**b) Dubletten aufgelöst** (mein Urteil, wie angefragt):
- `basketballogo.png` ≡ `logo.png` (MD5 `4D3480888B…`): `logo.png` hatte
  einen echten Nutzer (`build_testerkarte.py`) → nur `basketballogo.png`
  liegt im Archiv, `logo.png` ist stattdessen als Arbeitskopie mit dem
  Skript nach `Hoops-Marketing\_werkzeuge\` umgezogen (s. c). Keine
  doppelte Ablage derselben 80 KB.
- `contentimage.png` ≡ `profileimage.png` (MD5 `7CC064C0B0…`): Bildinhalt
  geprüft (professionelles Portrait/Headshot) → `profileimage.png` ist
  der inhaltlich treffendere, "sprechendere" Name, nur diese Version
  liegt im Archiv. `contentimage.png` wurde aus dem Repo entfernt statt
  redundant gespeichert (Bytes über `profileimage.png` vollständig
  erhalten, MD5 zur Nachprüfung im Archiv-README dokumentiert) —
  dieselbe Logik wie beim ersten Paar, wie angefragt analog angewendet.
  **Hinweis zur Zählung:** Patricks "7 Dateien insgesamt" sind damit als
  7 *benannte, resolvte* Posten zu verstehen, nicht als 7 physische
  Kopien — physisch liegen 6 Dateien im Archiv (Batch 2). Falls
  tatsächlich 7 physische Kopien gewünscht waren, sag Bescheid, dann lege
  ich `contentimage.png` nachträglich zusätzlich an.

**c) Tester-Karten-Umzug.** `tmp/pdfs/build_testerkarte.py` →
`Hoops-Marketing\_werkzeuge\build_testerkarte.py` (dort, wo auch Milos
`make-hero-variants.js` liegt — bestehende Konvention für Tooling statt
neuem Ordner). `output/pdf/Hoops_Germany_Testerkarte_A6_Druck.pdf` und
`…_Schnittmarken.pdf` → `Hoops-Marketing\Tester-Akquise\` (dort, wo die
übrigen Kampagnen-Deliverables der Tester-Akquise liegen). `logo.png` als
Arbeitskopie direkt neben das Skript kopiert
(`Hoops-Marketing\_werkzeuge\logo.png`).

Skript-Pfadlogik angepasst: `ROOT`/`LOGO`/`OUT` liefen vorher relativ zu
`C:\dev\hoops-germany-v2`, jetzt relativ zum Skript-Standort selbst
(`HERE = Path(__file__).resolve().parent`; `LOGO = HERE / "logo.png"`;
`OUT = HERE.parent / "Tester-Akquise"`). **Ungetestet** — auf dieser
Maschine ist kein lauffähiges Python vorhanden (`python3` bricht mit
"nicht gefunden"/Store-Verweis ab, exit 49, geprüft vor der Annahme statt
geglaubt) — beim nächsten echten Lauf zu verifizieren. Kommentar mit
diesem Hinweis steht jetzt auch direkt im Skript.

**d) `tmp/`/`output/` danach:** `output/pdf/` ist leer (git zeigt
`output/` nicht mehr als untracked). `tmp/pdfs/rendered/` enthält noch
zwei Vorschau-PNGs (`card-1.png`, `card-2.png`) — nicht Teil des
Auftrags ("Skript + erzeugte PDFs"), daher unangetastet gelassen, hier
nur gemeldet. `tmp/` enthält außerdem `hero-preview.mjs`,
`qa-hero-check.mjs`, `prod-runtime.log` — gehören zur parallelen
Hero-Session, nicht angefasst.

**e) Doku:** `docs/asset-archive/README.md` um Batch 2 + Dubletten-
Auflösung ergänzt (dieser Abschnitt). `docs/CHRONIK.md` nicht angefasst
— keiner der neu archivierten Dateinamen kam dort vor, kein Nachtrag
nötig. Umzugsprotokoll (`ABLAGEPLAN.md`) und Hanna: s. Rückmeldung an
die Hauptsession.

Nicht committet — Patrick committet selbst.
