# E2E-Tests (Playwright) — Auth-Kernpfad

Automatisierte Tests für den Auth-Kernpfad von Hoops Germany:
Login (gültig/ungültig), Signup (neuer Account, Duplikat-Mail),
Dual-Auth-Grundfall (Spieler-Token → Team-Admin-Zugriff auf `/api/team/fetchinfo`).

## ⚠️ Harte Regel: nur Dev-DB

Die Suite läuft **ausschließlich gegen die Dev-DB `hoopsgermany`**.
`global-setup.mjs` prüft die `MONGODB_URI` aus der `.env` und **bricht den
kompletten Lauf ab**, wenn sie nicht auf `hoopsgermany` zeigt (niemals
`hoops_prod` oder `test` — das sind Produktiv-DBs, siehe CLAUDE.md).

## Voraussetzungen (einmalig)

```bash
# 1. Test-Runner installieren (bewusst --no-save: package.json bleibt unberührt)
npm install --no-save @playwright/test@1.62.1

# 2. Browser installieren
npx playwright install chromium

# 3. Dev-DB mit Demo-Daten befüllen (falls noch nicht geschehen)
node scripts/seed-demo.mjs
```

Benötigte Seed-Accounts (kommen aus `seed-demo.mjs`, PW `test123`):
- `max@test.de` — Team-Admin von „Test Baskets" (Dual-Auth-Positivfall)
- `sven.adler@test.de` — Free Agent ohne Team (Dual-Auth-Negativfall)

## Ausführen

```bash
npx playwright test -c tests/e2e/playwright.config.mjs
```

Der Dev-Server (`npm run dev`, Port 3000) wird automatisch gestartet; läuft
bereits einer, wird er wiederverwendet (`reuseExistingServer`). Es wird **nie**
`npm run build` ausgeführt (Projektregel: Build nie parallel zu `next dev`).

Einzelne Gruppe: `npx playwright test -c tests/e2e/playwright.config.mjs -g "Dual-Auth"`

## Wegwerf-Accounts & Aufräumen

Signup-Tests legen Accounts **nur** im Namensraum
`e2e-kai-<tag>-<timestamp>-<rand>@hoops-e2e.test` an. Jede angelegte Mail wird
**vor** der Anlage in `.artifacts/created-users.json` registriert;
`global-teardown.mjs` löscht nach dem Lauf **genau diese** Accounts aus der
Dev-DB (doppelt abgesichert: Registry-Eintrag UND Namensraum-Regex müssen
passen). Seed- und echte Accounts werden nie angefasst. Bleibt nach einem
harten Abbruch etwas liegen, räumt der nächste Lauf es über die Registry mit auf.

## Struktur

| Datei | Zweck |
|---|---|
| `playwright.config.mjs` | Runner-Config (1 Worker, Dev-Server-Autostart, Screenshots bei Fehlern) |
| `global-setup.mjs` | DB-Guard (Abbruch, wenn nicht Dev-DB `hoopsgermany`) |
| `global-teardown.mjs` | Löscht nur selbst angelegte Wegwerf-Accounts |
| `auth.spec.mjs` | 8 Tests: 3× Login, 2× Signup, 3× Dual-Auth |
| `sicherer-pfad.spec.mjs` | Offene Weiterleitung über `?next=` (Kai K4): das Modul, die echte Kette im Browser, und dass die Prüfung an **einer** Stelle steht |
| `rail-ball-drehpunkt.spec.mjs` | Drehpunkt des Streckenballs, gemessen auf beiden Aufrufstellen (wiederhergestellt, s. Korrektur unten) |
| `helpers/env.mjs` | .env-Parser + Dev-DB-Guard |
| `helpers/created-users.mjs` | Namensraum + Registry der Wegwerf-Accounts |
| `.artifacts/` | Laufzeit-Artefakte (Registry, Screenshots) — nicht einchecken |

Hinweis Versionierung: `tests/e2e/.artifacts/` und `node_modules`-Änderungen
nicht committen; ob die Suite selbst eingecheckt wird, entscheidet Patrick.

## Entfallene Tests (19.08.2026) — und warum keiner davon stumm gelöscht wurde

Mit dem Hero-Umbau „Der Abschluss" (`docs/HERO-DUNK-KONZEPT-2026-08-19.md`) ist
der gerenderte Hero-Ball entfallen und durch eine Linienzeichnung ersetzt
worden. Sieben Testdateien prüften Eigenschaften, die es danach nicht mehr gibt.

> ⚠️ **Ein stumm gelöschter Wächter ist die gefährlichste Änderung eines
> Umbaus.** Deshalb steht hier für jede Datei, WAS sie bewacht hat, WARUM der
> Gegenstand weg ist und WO die Frage — falls sie weiterlebt — jetzt gestellt
> wird. Wer eine dieser Eigenschaften zurückbaut, holt den Test aus dem
> Verlauf zurück; er ist nicht kaputt, er ist gegenstandslos.

| Gelöschte Datei | Was sie bewacht hat | Warum gegenstandslos | Nachfolger |
|---|---|---|---|
| `hero-ball-laufzeit.spec.mjs` | Ball am Ruhepunkt vollständig sichtbar; Balldeckkraft über Schaltflächen ≤ `TEXT_DIM_FLOOR` | Beide Zusicherungen beschreiben eine **deckende Scheibe**, die keinen Buchstaben berühren darf. Eine Linie darf jeden Buchstaben kreuzen; es gibt keine Ruhelage und keine Abdunkelung mehr | Der Kontrast wird jetzt als Farbfrage geprüft: `hero-dunk.spec.mjs` **P1** |
| `hero-konturkanal.spec.mjs` | Kürzester Abstand der Konturen zwischen Ball und Eyebrow-Badge ≥ 10 px | Es gibt weder den Ball noch das Eyebrow (letzteres entfernt auf Entscheidung Nele, `docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`). Der Kanal war die Antwort auf eine gesuchte Ruhelage — die Zeichnung hat keine | keiner nötig |
| `hero-abstand.spec.mjs` | Ball teilt sich keine Kante mit einem Inhaltskasten | dito — eine Linie darf jede Kante kreuzen, das ist der Kern des neuen Konzepts | keiner nötig |
| `hero-einflug.spec.mjs` | Mobiler Ladeauftritt des Balls: findet statt, zeigt Bildwechsel, ist keine Standbild-Attrappe | Der mobile Einflug existiert nicht mehr. Er war nötig, weil mobil keine scroll-getriebene Lösung für eine deckende Scheibe existierte | keiner nötig |
| `hero-resize-im-flug.spec.mjs` | Größenänderung während des Einflugs friert die Ziellage nicht ein | Der Abschluss rechnet in viewBox-Einheiten und kennt keine eingefrorene Bildschirmkoordinate — eine Größenänderung ist per Konstruktion folgenlos | keiner nötig; die Eigenschaft steht als Kommentar an `abschlussSetzen()` |
| `hero-auth-tausch.spec.mjs` | Ball springt nicht, wenn die Anmeldung spät auflöst und den Hero-Zweig tauscht | Die Zeichnung hängt an **keinem** Inhaltselement. Der Zweigtausch ist ihr gleichgültig — damit sind auch Roadmap 20e und 20f gegenstandslos | keiner nötig |
| `ball-sequenz.spec.mjs` | **vier** Fälle: 3× Bildzahl der Rotationssequenz über Konstante, CSS-Dateinamen und Datei — **und 1× der Drehpunkt des Streckenballs** | Für die drei Sequenz-Fälle: Sequenz, Bilddateien und Erzeuger `scripts/generate-ball-rotation.mjs` sind gelöscht. **Für den vierten Fall galt das nicht** — s. Korrektur unten | `rail-ball-drehpunkt.spec.mjs` (wiederhergestellt 20.08.2026) |

### ⚠️ Korrektur 20.08.2026: diese Löschung war unvollständig begründet

Die Zeile zu `ball-sequenz.spec.mjs` nannte einen Grund, der nur für **drei der
vier** Fälle jener Datei zutraf. Der vierte prüfte einen anderen Gegenstand, der
dort nur einquartiert war: **den Drehpunkt des Streckenballs** (ursprünglich
Befund Kai B1 vom 15.08.2026).

Dieser Gegenstand **lebt**: `RailBallGlyph` in `components/landing/HeroGlyphs.js`,
eingesetzt an zwei Stellen in `components/landing/FeatureProgressRail.js`, mit
aktiver Rollbewegung bis 1965°. Nach der Löschung fand
`grep -rn transformOrigin tests/` **null** Treffer — der Wächter war weg, sein
Gegenstand nicht.

> **Die Lehre ist nicht „sorgfältiger löschen".** Eine Testdatei mit vier Fällen
> kann vier verschiedene Gegenstände bewachen. Der Satz „der Gegenstand ist weg"
> muss für **jeden Fall einzeln** gelten, nicht für den Dateinamen. Diese Tabelle
> ist nach Dateien geordnet — das ist bequem und genau deshalb die Stelle, an der
> ein Fall unter dem Namen eines anderen verschwindet.

Wiederhergestellt und dabei verschärft in `rail-ball-drehpunkt.spec.mjs`: Der
alte Fall las nur Quelltext. Der neue **misst** zusätzlich den tatsächlichen
`transform-origin` im Browser, und zwar auf **beiden** Aufrufstellen (mobil und
Desktop) — der ursprüngliche Fehler trat nur auf der Desktop-Stelle auf, ein
Test auf einer Breite hätte ihn mit halber Wahrscheinlichkeit durchgelassen.

**Nicht gelöscht, aber inhaltlich verkleinert:** `rail-ankunft.spec.mjs`. Der
Farbblitz-Teil (Befund B-a) ist entfallen, weil es keinen Farbblitz mehr gibt —
die Landung am Ende der Fortschritts-Leiste ist zur **stehenden Endmarke**
geworden. Der Geometrie-Teil (Befund B-b, „der Ball ruht IM Netz, nicht
daneben") gilt unverändert und wird weiter geprüft.

**Was NEU bewacht wird** (`hero-dunk.spec.mjs`):
P1 Kontrastfenster · P2 der Korb ist im Bild, wenn der Ball fällt · P3 der
Abschluss hängt an der Zeit, nicht am Scroll (mit Ehrlichkeitsschranke) ·
P4 der Umschalter ist das Seitenverhältnis, nicht der Breakpoint · plus zwei
Regressionsregeln zum stillen Punktlinien-Geist (`pathLength` wirkt nicht
zusammen mit `vector-effect: non-scaling-stroke`) und zum Standbild bei
`prefers-reduced-motion`.
