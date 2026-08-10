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
| `helpers/env.mjs` | .env-Parser + Dev-DB-Guard |
| `helpers/created-users.mjs` | Namensraum + Registry der Wegwerf-Accounts |
| `.artifacts/` | Laufzeit-Artefakte (Registry, Screenshots) — nicht einchecken |

Hinweis Versionierung: `tests/e2e/.artifacts/` und `node_modules`-Änderungen
nicht committen; ob die Suite selbst eingecheckt wird, entscheidet Patrick.
