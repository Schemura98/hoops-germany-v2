# Asset-Archiv

Archiviert von **Frieda** (dokumenten-logistik) am 11.08.2026, Patricks
Entscheidung nach `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`. Bewusst
**außerhalb von `public/`** abgelegt: alles unter `public/` wird von
Next.js live ausgeliefert, unabhängig vom Ordnernamen — ein "Archiv"
innerhalb von `public/images/` wäre also weiterhin live erreichbar
gewesen. Hier nicht.

## Was hier liegt

### Batch 1 (11.08.2026, `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`) — Hero-Motive

| Datei (neu) | Ursprünglicher Name | Auflösung | Herkunft |
|---|---|---|---|
| `registerimage.jpg` | `public/images/registerimage.jpg` | 373×571 (Hochformat) | Original-JPEG |
| `register-image-571.webp` | `public/images/register-image-373.webp` | 373×571 (nativ) | von Milo erzeugt, 11.08.2026 |
| `register-image-571.avif` | `public/images/register-image-373.avif` | 373×571 (nativ) | von Milo erzeugt, 11.08.2026 |
| `playerimage.jpg` | `public/images/playerimage.jpg` | 912×1235 (Hochformat) | Original-JPEG |
| `player-image-1235.webp` | `public/images/player-image-912.webp` | 912×1235 (nativ) | von Milo erzeugt, 11.08.2026 |
| `player-image-1235.avif` | `public/images/player-image-912.avif` | 912×1235 (nativ) | von Milo erzeugt, 11.08.2026 |

Die WebP/AVIF-Varianten wurden bei der Archivierung gleich auf das neue
Namensschema umbenannt (lange Kante statt Breite, s.
`docs/NAMENSKONVENTION-BILDER.md`) — sie hießen vorher `register-image-373.*`
und `player-image-912.*`, benannt nach der (bei diesen Hochformat-Bildern
kurzen) Breite.

### Batch 2 (11.08.2026, `docs/ABLAGE-AUDIT-PUBLIC-2026-08-11.md`) — restlicher verwaister `public/images/`-Bestand

| Datei (Originalname, unverändert) | Auflösung/Größe | Herkunft |
|---|---|---|
| `basketballogo.png` | 80.237 B | Baseline-Commit `79ccd75`, nie referenziert |
| `basketballogorotate.png` | 92.716 B | Baseline-Commit `79ccd75`, nie referenziert |
| `profileimage.png` | 202.114 B | Baseline-Commit `79ccd75`, nie referenziert |
| `postcardimage.jpg` | 60.517 B | Baseline-Commit `79ccd75`, nie referenziert |
| `newsfeed.png` | 173.141 B | Baseline-Commit `79ccd75`, nie referenziert |
| `dhlogo.jpg` | 16.178 B | Baseline-Commit `79ccd75`, nie referenziert, **Herkunft/Bedeutung von "DH" unbekannt** — Patrick kennt sie ebenfalls nicht (Rückfrage aus dem Audit), generisches "DH"-Monogramm ohne erkennbaren Hoops-Germany-Bezug |

Namenskonvention bewusst **nicht** angewendet: diese sechs sind Altbestand
ohne Größenvarianten — eine Umbenennung nach `<basis>-<lange-Kante>` hätte
hier keinen Nutzen (keine zweite Stufe, die zu disambiguieren wäre) und
hätte nur die Herkunft (Originalname = Beleg, welche Datei das war)
unauffindbar gemacht. Originalnamen bewusst beibehalten.

#### Zwei MD5-Dubletten aufgelöst, nicht doppelt gespeichert

Zwei Paare im Alt-Bestand waren **byte-identisch** (verifiziert per
`Get-FileHash -Algorithm MD5`, nicht nur gleiche Dateigröße):

- **`basketballogo.png` ≡ `logo.png`** (MD5 `4D3480888B457329773F8773F3DF64AB`,
  80.237 B). `logo.png` hatte einen echten, aktuellen Nutzer
  (`tmp/pdfs/build_testerkarte.py`, s. u.) — deshalb liegt **nur
  `basketballogo.png` hier im Archiv**, `logo.png` ist stattdessen als
  Arbeitskopie nach `Hoops-Marketing\_werkzeuge\logo.png` umgezogen
  (Patricks Entscheidung 11.08.2026). Beide Namen sind damit erhalten,
  aber an unterschiedlichen, jeweils passenden Orten — keine doppelte
  Ablage derselben 80 KB.
- **`contentimage.png` ≡ `profileimage.png`** (MD5
  `7CC064C0B0E2726EAD3019117ED50C1F`, 202.114 B). Hier hatte **keiner**
  der beiden Namen einen Nutzer. Bildinhalt geprüft: professionelles,
  freigestelltes Portrait/Headshot-Foto — inhaltlich klar ein
  "Profilbild"-Motiv, nicht generisches "Content". Deshalb **nur
  `profileimage.png` archiviert**, `contentimage.png` wurde aus dem Repo
  entfernt (nicht separat gespeichert, Bytes bleiben über
  `profileimage.png` vollständig erhalten — falls die Gleichheit später
  geprüft werden muss, reicht der MD5-Hash oben, ohne dass eine zweite
  Kopie vorgehalten werden müsste).

**Anmerkung zur Zählung:** Patricks Freigabe sprach von "7 Dateien
insgesamt" (6 aus der ursprünglichen Liste + `dhlogo.jpg`). Durch die
Dublette `contentimage.png`/`profileimage.png` liegen hier physisch nur
**6 Dateien** aus Batch 2 — der siebte Name (`contentimage.png`) ist
vollständig dokumentiert (Herkunft, MD5, Grund) statt redundant
gespeichert, wie es Patrick für das erste Dubletten-Paar
(`logo.png`/`basketballogo.png`) ausdrücklich vorgegeben hatte ("Es wäre
unsinnig, dieselben 80 KB zweimal ins Archiv zu legen") — dieselbe Logik
wurde hier analog angewendet. Falls Patrick tatsächlich sieben
*physische* Kopien wollte, bitte Bescheid geben, dann lege ich
`contentimage.png` nachträglich doch als zweite Kopie an.

## Warum archiviert

**Batch 1** — verwaiste Hero-Motive (im aktuellen Code nachweislich
ungenutzt, Detailbefund in `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`,
Abschnitt "Befund Teil A"):

- **`registerimage.jpg`** war für `/team/login` und `/team/register`
  eingebunden (Commit `0fd42d2`, "Redesign Auth: Split-Screen-Look via
  gemeinsame AuthShell", 23.06.2026), wurde aber **38 Minuten später**
  im selben Umbau wieder entfernt (Commit `a6ab9a5`, "Spieler-geführte
  Teams: Team-Login entfernt, Team-Gründung + Kader-Mitglieder") — Teams
  wurden von eigenem Account-Login auf spieler-geführt umgestellt,
  `/team/login`/`/team/register` sind seither nur noch Redirects. Ein
  dokumentierter, bewusster Architektur-Umbau, kein Versehen — das Bild
  ist danach einfach liegen geblieben.
- **`playerimage.jpg`** war zu **keinem Zeitpunkt** in der Git-Historie
  im Code referenziert (`git log -S"playerimage" --oneline --all` liefert
  außer dem Doku-Commit des Audits keinen Treffer). Die Datei lag seit dem
  allerersten Baseline-Commit (`79ccd75`) unverändert im Ordner, ohne je
  eingebunden worden zu sein — vermutlich Material, das beim
  Redesign-Start pauschal mit übernommen, aber nie gebraucht wurde.

**Batch 2** — verwaister Altbestand ohne funktionalen Bezug zur
Basketball-Plattform (Detailbefund in
`docs/ABLAGE-AUDIT-PUBLIC-2026-08-11.md`): alle sechs Dateien wurden
ausschließlich im allerersten Baseline-Commit (`79ccd75`) hinzugefügt und
seither nie wieder angefasst oder referenziert — weder im Next.js-Code
noch in Skripten, Tmp-/Output-Ordnern oder externem Marketing-Material.
Gleiches Herkunftsmuster wie `playerimage.jpg`: pauschal mit dem Ordner
übernommen, nie eingebaut.

## Zurückholen, falls ein Motiv doch gebraucht wird

1. Datei(en) mit `git mv` zurück nach `public/images/` verschieben
   (Dateiname dabei nach Bedarf anpassen, z. B. wieder auf das
   `<basis>-<lange-Kante>`-Schema oder einen neuen sprechenden Namen).
2. In der gewünschten Komponente einbinden (z. B. `AuthShell.js` um einen
   `MODERN_SOURCES`-Eintrag ergänzen, falls WebP/AVIF genutzt werden
   sollen) — das ist eine Code-Änderung, keine Ablage-Aufgabe, macht die
   Hauptsession/Patrick.
3. `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md` bzw.
   `docs/ABLAGE-AUDIT-PUBLIC-2026-08-11.md` und diese README kurz
   ergänzen, dass das Set wieder aktiv ist.

**Sonderfall `contentimage.png`:** liegt hier nicht als eigene Datei —
falls der Name (statt `profileimage.png`) gebraucht wird, einfach
`profileimage.png` unter dem gewünschten Namen zurückkopieren, die Bytes
sind identisch (MD5 oben).

**Sonderfall `logo.png`:** liegt nicht hier im Archiv, sondern lebt aktiv
unter `Hoops-Marketing\_werkzeuge\logo.png` weiter (Arbeitskopie für
`build_testerkarte.py`). Falls es wieder im Web-Code gebraucht wird, aus
dieser Marketing-Kopie zurück nach `public/images/` kopieren (nicht aus
diesem Archiv, hier liegt nur `basketballogo.png`, byte-identisch, MD5
oben) oder alternativ von dort neu ableiten.

Kein Rückfragebedarf bei Vivien vor der Archivierung nötig — genau dieser
Rückhol-Pfad hält ihr die Option offen, falls sie eines der Motive für
ein künftiges Feature will.
