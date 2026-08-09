---
name: update-feedback-analytics
description: Bei jeder nützlichen neuen Funktion/neuem Bereich von Hoops Germany das Feedback-Formular (Themen-Chips) und das Analytics-Tool (Bereichs-Bündelung + Plattform-Überblick) mitpflegen, damit Tester gezielt Feedback geben können und neue Bereiche in der Analyse/Sponsoren-Übersicht auftauchen. Nutze diese Skill nach dem Bau eines neuen Features/einer neuen Seite – zusammen mit log-progress.
---

# Feedback-Formular & Analytics bei neuen Funktionen aktualisieren

Wenn eine **neue, für Nutzer sichtbare Funktion oder ein neuer Bereich** gebaut wird, sollen drei
Stellen mitwachsen, damit nichts „unsichtbar" bleibt:
1. das **Feedback-Formular** (Tester können gezielt zum neuen Bereich Feedback geben),
2. die **Analytics-Bereichs-Bündelung** (Traffic des neuen Bereichs wird benannt statt „Sonstiges"),
3. ggf. der **Plattform-Überblick** (zählbare neue Kennzahl für Sponsoren/Reichweite).

## Wann ausführen
- Nach dem Bau eines **neuen Bereichs / einer neuen Seite**, die Nutzer ansteuern (eigener Pfad-Prefix).
- Nach einer **neuen größeren Funktion**, zu der Tester sinnvoll Feedback geben können.
- **Nicht** für winzige Tweaks/Bugfixes ohne neuen Bereich – die Listen bewusst knapp halten.

## 1. Feedback-Formular – Themen-Chip ergänzen
Datei: **`app/feedback/page.js`** → Array **`const AREAS = [...]`**.
- Füge ein **kurzes, klares Label** für den neuen Bereich hinzu (z. B. `"Transfermarkt & Scouting"`).
- Reihenfolge thematisch einsortieren; `"Sonstiges"` bleibt am Ende.
- **Kein Backend-Aufwand nötig:** Das Modell `Feedback` (`models/Feedback.js`) speichert `areas: [String]`
  frei – ein neuer Chip wirkt sofort.
- Falls eine ganz neue *Feedback-Art* nötig ist (selten): `const TYPES = [...]` im selben File.

## 2. Analytics – Bereichs-Bündelung (Traffic nach Bereich)
Datei: **`lib/analyticsSummary.js`** → der **`$switch`**-Block (bündelt Pfade zu Bereichen).
(Die Route `app/api/analytics/summary/route.js` ist nur noch ein dünner Wrapper um
`computeAnalyticsSummary` – die Logik liegt in der lib.)
- Hat das Feature einen **neuen Top-Level-Pfad** (z. B. `/transfermarkt`, `/rangliste`), füge einen Zweig hinzu:
  ```js
  { case: { $regexMatch: { input: "$path", regex: "^/<pfad>" } }, then: "<Bereichsname>" },
  ```
- **Reihenfolge beachten:** Spezifischere Regex **vor** allgemeinere setzen
  (z. B. `^/team/team-detail` **vor** `^/team/`), sonst greift die allgemeine zuerst.
- Ohne Zweig landet der Bereich in `default: "Sonstiges"` → dann ist Traffic nicht sauswertbar.
- (`AnalyticsTracker` im Root-Layout trackt jeden Seitenaufruf automatisch außer `/admin`; neue Seiten
  werden also ohne Extra-Aufwand erfasst – sie müssen hier nur **benannt** werden.)

## 3. Plattform-Überblick – neue Kennzahl (nur wenn sinnvoll)
Bringt das Feature eine **zählbare Größe** mit Aussagekraft für Reichweite/Sponsoren (z. B. „X aktive Y"),
dann an ZWEI Stellen ergänzen:
- **`lib/analyticsSummary.js`**: in der `Promise.all([...])` ein `Model.countDocuments({...})`
  ergänzen und den Wert ins zurückgegebene `platform: { ... }`-Objekt aufnehmen.
- **`app/admin/analytics/page.js`**: im „Plattform-Überblick"-Block eine Kachel ergänzen
  (`{ icon: Fa…, label: "…", value: summary.platform.<feld> }`), Icon aus `react-icons/fa` importieren.
- Nur ergänzen, wenn die Zahl wirklich etwas aussagt – den Überblick nicht mit Rauschen füllen.
- **Demo-Daten ausschließen:** Kennzahlen zählen nur echte Daten – Query auf `official:true`
  bzw. `isDemo: {$ne:true}` (etabliertes Muster: Liga-KPI, Commit `7e69f12`). Nie Demo-Teams/-Ligen
  in Sponsor-Zahlen.
- **Sponsor-Report mitprüfen:** Neue `platform`-Felder erscheinen über `computeAnalyticsSummary`
  auch im teilbaren Report (`components/admin/SponsorReportView.js`, `/sponsor-report`) – dort
  Darstellung kontrollieren, denn diese Zahlen gehen an Founding-Partner-Kandidaten.

## Abschluss
1. **Build/Verify** wie üblich (lokal Lint/Preview; Prod-Build vor Deploy).
2. **Deploy** auf den VPS (`git pull && npm run build && pm2 restart hoops-v2`; bei neuer Dependency
   zusätzlich `npm install`).
3. **`log-progress`** ausführen (Eintrag in CLAUDE.md Abschnitt 0 + Commit-Hash).

## Checkliste (knapp)
- [ ] Neuer Bereich? → Chip in `AREAS` (`app/feedback/page.js`).
- [ ] Neuer Pfad-Prefix? → `$switch`-Zweig in `lib/analyticsSummary.js` (spezifisch vor allgemein).
- [ ] Neue Kennzahl demo-bereinigt (`official:true` / `isDemo:{$ne:true}`) + im Sponsor-Report geprüft?
- [ ] Neue aussagekräftige Kennzahl? → `countDocuments` + `platform`-Feld + Kachel in `app/admin/analytics/page.js`.
- [ ] Deploy + verifiziert + in CLAUDE.md dokumentiert.
