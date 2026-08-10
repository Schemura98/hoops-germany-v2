# Hero-Assets: Ist-Zustand-Messung + Web-optimierte Varianten

Auftrag von Patrick, 11.08.2026, im Anschluss an Viviens Hero-Konzept
(`docs/HERO-KONZEPT-2026-08-11.md`, „Sprungball"). Erstellt von **Milo**
(medien-produzent). Vivien hat für v1 bewusst kein neues Material
angefordert — dieser Auftrag prüft trotzdem die konkrete Materiallage
und liefert, was sich aus dem vorhandenen Bestand seriös herausholen
lässt.

**Status: Asset-Lieferung + Messbericht, kein Code geändert.** Einbau in
`LandingHero.js`/`AuthShell.js` macht die Hauptsession (Patrick).

---

## 1. Ist-Zustand: tatsächliche Anzeigegrößen

### Wo die Bilder heute im Code verwendet werden (nur gelesen, nicht geändert)

| Datei | Verwendung | Container |
|---|---|---|
| `public/images/login image.jpg` | `components/landing/LandingHero.js` Zeile 58 — Hero-Hintergrund, `backgroundSize: cover` | **volle Viewport-Breite**, Höhe `calc(100vh - 4rem)` |
| `public/images/login image.jpg` | `components/layout/AuthShell.js` Default-Prop (`/login`, `/reset-password`) | **halbe Viewport-Breite** (`lg:w-1/2`), volle Viewport-Höhe (`min-h-screen`), `object-cover` |
| `public/images/signupImage.jpg` | `AuthShell` auf `app/signup/page.js` (Kampagnen-Landepunkt der Tester-Kampagne!) | wie oben: halbe Breite, volle Höhe, `object-cover` |
| `public/images/registerimage.jpg` | **nirgends im aktuellen Code referenziert** (nur in `CLAUDE.md`/`docs/CHRONIK.md` als Hero-Motiv erwähnt) | — |
| `public/images/playerimage.jpg` | **nirgends im aktuellen Code referenziert** | — |

Wichtiger Befund, der im Auftrag so nicht sichtbar war: `registerimage.jpg`
und `playerimage.jpg` sind **verwaiste Assets** — `/team/register` ist laut
`CLAUDE.md` nur noch ein Redirect, kein `AuthShell`-Aufruf mit diesen
Bildern existiert. Ich habe sie trotzdem mitgemessen und mitkonvertiert
(Auftrag), aber das ist ein Ablage-Fund, kein aktuelles Web-Performance-
Problem. Ich melde das unten separat an Frieda.

### Quellauflösungen (per `ffprobe`, real gemessen)

| Datei | Auflösung | Seitenverhältnis | JPEG-Gewicht |
|---|---|---|---|
| `login image.jpg` | 1000 × 652 px | 1,53 : 1 | 76.505 B (74,7 KB) |
| `signupImage.jpg` | 1000 × 668 px | 1,50 : 1 | 283.433 B (276,8 KB) |
| `registerimage.jpg` | 373 × 571 px | 0,65 : 1 (Hochformat) | 27.052 B (26,4 KB) |
| `playerimage.jpg` | 912 × 1235 px | 0,74 : 1 (Hochformat) | 447.271 B (436,8 KB) |

### Skalierungsfaktoren bei `cover`

Formel für `background-size: cover` / `object-fit: cover`:
`scale = max(containerBreite / bildBreite, containerHöhe / bildHöhe)` —
der größere der beiden Werte bestimmt die tatsächliche Vergrößerung,
weil das Bild beide Kanten mindestens decken muss. Annahmen für
Viewport-Höhe unten explizit genannt (16:10 bzw. 16:9 typisch); bei
anderer Bildschirmhöhe verschiebt sich das Ergebnis leicht, das
Prinzip nicht.

**A) `login image.jpg` als LandingHero-Vollbild-Hintergrund** —
Container = volle Breite, Höhe `100vh − 64px`:

| Viewport | Container (B×H, Annahme) | Treibende Kante | Skalierung DPR1 | Skalierung DPR2 | + Ken-Burns ×1,05 (Ende Szene A) |
|---|---|---|---|---|---|
| 1440 px breit | 1440 × 836 (bei 900 px Höhe) | Breite (1440/1000) | **1,44×** | **2,88×** | 1,51× / 3,02× |
| 2560 px breit | 2560 × 1376 (bei 1440 px Höhe) | Breite (2560/1000) | **2,56×** | **5,12×** | 2,69× / 5,38× |

Bei DPR2/2560 (z. B. ein 27"-5K-Bildschirm, der 2560 CSS-Pixel bei
physisch 5120 px zeigt — in der Apple-Welt keine Randerscheinung)
verlangt der Hero effektiv **5120 physische Pixel Breite aus einer
1000-px-Quelle** — Faktor 5,12, mit Zoom 5,38×. Das ist die Kennzahl,
die den Auftrag ausgelöst hat, und sie stimmt.

**B) `login image.jpg` / `signupImage.jpg` im `AuthShell`-Split-Screen**
— Container = **halbe** Breite, aber **volle** Viewport-Höhe
(`min-h-screen`, kein Navbar-Abzug). Das schmale, hohe Container-
Seitenverhältnis gegen ein breites Foto-Motiv macht hier die **Höhe**
zur treibenden Kante — das Bild wird stärker hochskaliert als im
Vollbild-Hero:

| Viewport | Container (B×H, Annahme) | Treibende Kante | `login image.jpg` DPR1/DPR2 | `signupImage.jpg` DPR1/DPR2 |
|---|---|---|---|---|
| 1440 px breit | 720 × 900 | Höhe (900/652 bzw. 900/668) | 1,38× / 2,76× | 1,35× / 2,69× |
| 2560 px breit | 1280 × 1440 | Höhe (1440/652 bzw. 1440/668) | **2,21× / 4,42×** | **2,16× / 4,31×** |

**Ergebnis:** Die Auth-Seiten (`/login`, `/signup`, `/reset-password`)
sind bei großen Bildschirmen sogar **stärker** hochskaliert als der
Hero, weil der schmale, hohe Panel-Zuschnitt gegen ein breites Foto
arbeitet. `/signup` ist zusätzlich der Landepunkt der QR-Tester-
Kampagne (Nele) — das größere der beiden Motive (276,8 KB Original)
liegt dort.

---

## 2. Erzeugte Varianten (WebP + AVIF, aus dem vorhandenen Material)

Erzeugt mit `sharp` (0.35.3, lokal in
`C:\Users\schem\OneDrive\Desktop\Hoops-Marketing\_werkzeuge\`, keine
Hoops-Repo-Dependency) über
`C:\Users\schem\OneDrive\Desktop\Hoops-Marketing\_werkzeuge\make-hero-variants.js`.
**Ausschließlich Neucodierung bei nativer Quellauflösung — keine
Hochskalierung.** Alle Dateien liegen **neben** den Originalen in
`public/images/`, die Originale sind unangetastet (Zeitstempel/Größe
geprüft, unverändert).

| Neue Datei | Auflösung | Gewicht | Ersparnis ggü. Original-JPEG |
|---|---|---|---|
| `login-image-1000.webp` | 1000×652 (nativ) | 39.040 B (38,1 KB) | **−48,9 %** |
| `login-image-1000.avif` | 1000×652 (nativ) | 25.226 B (24,6 KB) | **−67,0 %** |
| `signup-image-1000.webp` | 1000×668 (nativ) | 224.940 B (219,7 KB) | −20,6 % |
| `signup-image-1000.avif` | 1000×668 (nativ) | 137.972 B (134,7 KB) | **−51,3 %** |
| `register-image-373.webp` | 373×571 (nativ) | 3.202 B (3,1 KB) | −88,2 % |
| `register-image-373.avif` | 373×571 (nativ) | 2.619 B (2,6 KB) | −90,3 % |
| `player-image-912.webp` | 912×1235 (nativ) | 67.104 B (65,5 KB) | −85,0 % |
| `player-image-912.avif` | 912×1235 (nativ) | 43.383 B (42,4 KB) | −90,3 % |

Auffällig: `signupImage.jpg` komprimiert deutlich schlechter als die
anderen drei (nur −20,6 % als WebP, während `login image.jpg`
−48,9 % erreicht) — das Quell-JPEG ist pro Pixel rund 3,5× so
"dicht" wie `login image.jpg` (0,42 vs. 0,12 Byte/Px), enthält also
schon mehr Bilddetail/Rauschen, das sich schwerer wegkomprimieren
lässt. Das AVIF (−51,3 %) ist hier der klar bessere Kandidat.

**Was ich bewusst NICHT erzeugt habe:** keine `-1600`/`-2400`-
benannten "Größenstufen". Bei 1000 px nativer Breite wäre jede höher
benannte Stufe eine Hochskalierung — genau das reine Pixel-Aufblasen,
vor dem der Auftrag ausdrücklich warnt. Eine WebP/AVIF-Neucodierung
bei nativer Auflösung ist die einzige ehrliche "kleinere Variante",
die aus diesem Quellmaterial herausholbar ist; sie verkleinert das
**Gewicht** erheblich (bis −90 %), nicht die Pixel-Lücke bei großen
Bildschirmen.

### Integrationsnotiz für den Einbau (an Patrick/Vivien, keine Code-Änderung von mir)

Empfohlenes Muster für `LandingHero.js` und `AuthShell.js`:
`<picture>` mit AVIF-Quelle zuerst, WebP als zweite Quelle, das
bestehende JPEG als `<img>`-Fallback (für den `background-image`-Fall
in `LandingHero.js` bräuchte es stattdessen `image-set()` oder ein
vorgeschaltetes `<picture>`-Element mit `position:absolute` statt
Inline-`backgroundImage` — das ist eine Strukturentscheidung, die
Vivien/Patrick beim Einbau treffen, ich liefere nur die Dateien).

---

## 3. Empfehlung zur Quelle

**Die Auflösung reicht für einen kompromisslosen Vollbild-Hero auf
großen/hochauflösenden Bildschirmen nicht aus** — das gilt für alle
vier Motive, am stärksten für die beiden tatsächlich genutzten
(`login image.jpg`, `signupImage.jpg`).

- **Praktikables Minimum** (deckt DPR1 bis 2560 px und DPR2 bis
  1440 px CSS-Breite ohne spürbare Weichzeichnung, plus Puffer für den
  1,05×-Zoom): **≥ 3600 px lange Kante**. Das entspricht handelsüblichem
  Smartphone-Foto-Material (moderne Handykameras liefern 4000+ px lange
  Kante nativ) — kein Studio-Equipment nötig.
- **Ohne Kompromiss** auch für DPR2 bei 2560 px CSS-Breite (5K-Displays,
  s. o.): **≥ 5400 px lange Kante** mit Zoom-Puffer. Das ist ein
  Luxus-Ziel; ob es den Aufwand lohnt, hängt davon ab, wie viele Tester
  tatsächlich auf großen Retina-Desktops landen (bei einer QR-Code-
  Kampagne aufs Handy vermutlich eine kleine Minderheit) — Nele/Patrick
  müssten das priorisieren, nicht ich.
- **Bildaufbau:** Der Hero-Text ist zentriert (`text-center`,
  `max-w-4xl mx-auto`) über einem `bg-black/65`-Overlay — das Overlay
  federt Kontrastprobleme schon gut ab. Trotzdem lohnt sich für ein
  Ersatzmotiv eine **ruhige Zone in der Bildmitte** (z. B. Halle mit
  unscharfem Hintergrund, Deckenlicht, wenig visuelles Rauschen genau
  dort, wo Headline/Subline/Buttons liegen), damit die Cover-Zuschnitte
  bei 21:9 (breites Desktop) bis hin zum schmalen `AuthShell`-Panel
  (0,8:1 bei 1440 px) nicht zufällig Gesichter/Spielszenen abschneiden.
- **Lizenzfrage:** Ich beschaffe nichts. Zwei ehrliche Optionen für
  Patrick:
  1. **Echtes Hoops-Germany-Material** (Patrick/Jonatan fotografieren
     in der Halle) — passt zur bereits etablierten Linie „echte
     Community statt Stock", ist automatisch lizenzfrei, und moderne
     Handykameras erreichen die 3600-px-Zielmarke locker.
  2. **Lizenzklarer Stock** (z. B. Pexels/Unsplash mit dokumentierter
     Lizenz) als Zwischenlösung, falls kein eigenes Material rechtzeitig
     entsteht — das wäre eine Beschaffung und braucht Patricks
     Freigabe, ich schlage es nur vor.

---

## 4. Optionale Ausbaustufe (Vivien-Konzept Abschnitt „Optionale Ausbaustufe")

Viviens Zahlen für Szene B als späteren Hallen-Loop:

- MP4 (H.264) + WebM (VP9), `muted`/`loop`/`playsinline`, 4–6 s nahtloser Loop
- 1920×1080 Desktop-Master, 960×540 Mobile-Variante
- Gewicht-Budget: **≤ 1,5 MB Desktop / ≤ 600 KB Mobile**
- Poster-Frame Pflicht

**Einschätzung aus Produktionssicht:** Die Zahlen sind eng, aber
machbar — kein Widerspruch in sich.

- 1,5 MB über 5 s bei 1080p entspricht ≈ 2,4 Mbit/s effektive
  Bitrate (H.264, ohne Ton, da `muted`). Das ist deutlich unter
  üblichen Consumer-Zielwerten für 1080p (5–8 Mbit/s), aber für
  ruhiges Hallen-Material (wenig Kameraschwenk, kontrollierte
  Bewegung) mit `-crf` um 28–32 und `preset veryslow` real erreichbar
  — VP9/WebM komprimiert bei gleicher Qualität typischerweise 30–50 %
  besser, dort ist das Budget entspannter.
- 600 KB über 5 s bei 960×540 entspricht ≈ 0,96 Mbit/s — bei der
  kleineren Auflösung komfortabel machbar.
- **Der kritische Faktor ist nicht die Kompression, sondern der
  nahtlose Loop-Punkt.** Ein sauberer 4–6-s-Loop ohne sichtbaren
  Schnitt braucht entweder eine im Rohmaterial bereits wiederkehrende
  Bewegung (z. B. loopfähige Kreisbewegung) oder einen kurzen
  Crossfade zwischen Clip-Ende und -Anfang — das ist ein redaktioneller
  Schnittentscheid am realen Material, kein reiner Ausführungsschritt.
- **Was ich mit dem vorhandenen Werkzeug (`ffmpeg`) real herstellen
  kann, sobald echtes Rohmaterial vorliegt:** Zuschnitt auf den
  Loop-Ausschnitt, Crossfade-Loop-Naht, verlustoptimierte H.264- und
  VP9-Zwei-Pass-Kodierung auf die Gewicht-Budgets, Skalierung auf die
  Mobile-Variante, Poster-Frame-Extraktion (`-update 1 -frames:v 1`,
  bekannte Eigenheit dieser ffmpeg-Version laut
  `INSTALL-VERMERK-ffmpeg.md`). Alles Standard-`ffmpeg`-Funktionalität,
  am synthetischen Testclip von Malik bereits verifiziert.
- **Was ich nicht kann und nicht tue:** Rohmaterial erzeugen. Keine
  KI-Videogenerierung (`dec-milo-bewegtbild-tools` bleibt verworfen),
  kein Stock-Videokauf ohne Freigabe. Diese Ausbaustufe bleibt
  vollständig blockiert, bis Patrick/Jonatan gefilmt haben — das war
  schon Viviens Stand und ändert sich durch diese Prüfung nicht.

---

## 5. Kollegen einbezogen

- **Vivien (design-spezialistin):** Auslöserin des Auftrags über ihr
  Hero-Konzept; kein Rückfragebedarf, da reine Mess-/Produktionsarbeit
  ohne Design-Entscheidung — Ergebnis (Integrationsnotiz Abschnitt 2)
  ist für ihren/Patricks Einbau gedacht.
- **Nele (marketing-manager):** `/signup` ist der Landepunkt der
  QR-Tester-Kampagne — die 276,8 KB des Original-JPEGs dort (jetzt
  219,7 KB WebP / 134,7 KB AVIF verfügbar) sind für sie relevant, weil
  genau dort mobile Kampagnen-Besucher landen. Kein aktiver
  Auftrag an sie nötig, nur Kontext für die Priorisierung des Einbaus.
- **Frieda (dokumenten-logistik):** Namensschema (`<basis>-<breite>.webp`)
  angelehnt an bestehende Konvention, aber nicht von ihr bestätigt —
  und der Fund verwaister Assets (`registerimage.jpg`, `playerimage.jpg`,
  aktuell nirgends im Code referenziert) gehört in ihr Ablage-Audit.
  Dafür habe ich einen separaten Hintergrund-Hinweis ausgelöst.
- **Malik (team-coach/Werkzeug):** kein neues Werkzeug nötig — `sharp`
  und `ffmpeg` decken diesen Auftrag vollständig ab. Die eigentliche
  Grenze ist Quellmaterial, kein Tooling-Problem.

---

## 6. Offene Punkte

1. Einbau der `<picture>`/`image-set()`-Struktur in `LandingHero.js`
   und `AuthShell.js` — macht Patrick/die Hauptsession, nicht ich.
2. Entscheidung, ob/wann echtes Ersatz-Hallenfoto (≥ 3600 px lange
   Kante) beschafft wird — Patricks/Jonatans Entscheidung.
3. Verwaiste Assets `registerimage.jpg`/`playerimage.jpg` — behalten,
   archivieren oder löschen ist Friedas/Patricks Entscheidung, nicht
   meine.
4. Video-Ausbaustufe bleibt vollständig blockiert bis echtes
   Rohmaterial existiert (unverändert gegenüber Viviens Konzeptstand).
