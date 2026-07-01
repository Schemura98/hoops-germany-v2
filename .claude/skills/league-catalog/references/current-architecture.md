# Ist-Zustand (Code-verifiziert, Stand 01.07.2026)

> ⚠️ Momentaufnahme. Vor dem Verlassen auf einen Punkt den echten Code gegenprüfen (Dateien sind genannt).

## League-Dokument (`models/League.js`)
**Jede Saison einer Liga ist ein eigenes `League`-Dokument** (z. B. „Oberliga 1" 2024/25 und 2025/26 =
zwei getrennte Dokumente). Es gibt **keine** dauerhafte „Wettbewerbsfamilie" und **keinen** stabilen Key
über Saisons hinweg.

Felder: `name`, `season`, `level`, `gender`, `ageGroup`, `region`, `official`, `active`, `finished`,
`champion`, `playoffMode`, `teams[]`, `matches[]`.

## Saisonlogik
- **Kein eigenes Season-Modell**, das eine Saison global als „aktuell" markiert.
- Der UI-Filter „Aktuelle Saison" verwendet technisch `League.active` (`app/api/leagues/route.js`:
  `query = season ? { season } : { active: true }`). **`active` ist also kein echter Saisonbezug.**
- Folge: Alte Ligen mit `active:true` erscheinen fälschlich unter „Aktuelle Saison". **Real auf Prod
  bestätigt:** 3 abgeschlossene 2024/25-Demo-Ligen sind noch `active:true`.
- **Bekannte technische Einschränkung, KEINE gewünschte Produktregel.**

## Altersklassen (`lib/constants.js` → `LEAGUE_AGE_GROUPS`)
- UI/Filter unterstützen bereits ausschließlich `["Senioren","U18","U16"]`.
- **Prod-Daten bestätigt:** 0 Ligen unterhalb U16.
- ⚠️ **Lücke:** Die Admin-APIs `createleague`/`updateleague` **validieren `ageGroup` NICHT serverseitig**
  (nehmen jeden String). Nur das UI-Dropdown begrenzt. → Server-Validierung ist eine offene Härtung.

## Geschlecht (`LEAGUE_GENDERS`)
- Gespeicherte Werte: `Herren | Damen | Mixed` (auch für Jugend, z. B. weibliche Jugend = `Damen`).
- „männlich/weiblich/offen" existiert **nicht** als Datenwert – höchstens als **Anzeige-Mapping**
  (Herren→männlich, Damen→weiblich, Mixed→offen), wenn `ageGroup ≠ Senioren`.
- Gespeicherte Werte **nicht** ohne eigene Migrationsentscheidung ändern.

## Region / Basketballkreis
- `region` ist ein **freier String** (z. B. „Bezirk Niederrhein", „Kreis Köln").
- **Keine** eigene verwaltete Basketballkreis-Entität. Eine kanonische Kreis-Liste liegt in
  `lib/constants.js` (`BASKETBALLKREISE_NRW`, **provisorisch** – s. wbv-nrw-catalog.md).

## Team ↔ Liga (`models/Team.js`, `models/TeamSeason.js`)
- `Team.leagueId` = **eine** aktuelle Liga eines Teams.
- `TeamSeason` = **historischer Snapshot** nach Saisonabschluss (`freezeSeason` in `lib/teamSeason.js`),
  **kein** vollständiges Live-Teilnahmemodell.
- Auf-/Abstieg bzw. Ligawechsel = **manuelle Neuzuordnung** (`/api/team/set-league`).

## Saison-Rollover (`scripts/rollover-season.mjs`)
- **Kein Cron.** Manuelles, idempotentes Skript.
- Klont Liga-**Hüllen** in die neue Saison (Upsert auf name+season+gender+ageGroup).
- **Kopiert KEINE** Ergebnisse/Matches. `--deactivate-old` setzt Altsaison-Ligen `active:false`.
- Nutzt den aktuellen Katalog → erzeugt keine <U16-Ligen.

## Tabellen & Playoffs (`lib/standings.js`, `models/Match.js`)
- Tabellen werden aus **bestätigten Matches** berechnet (`computeStandings`).
- Playoffs sind eine **Phase** (`Match.stage` = „Hauptrunde"|„Playoffs", `playoffRound`), **keine** eigene
  Spielklasse. Tabelle schließt Playoffs aus.
- `League.playoffMode` (`keine`|`best_of_1`) markiert, wie der Meister bestimmt wird.

## NICHT vorhanden (nicht als bestehend voraussetzen!)
- Liga-Follows / „Meine Ligen" (Follows gibt es **nur** für Spieler & Teams).
- permanente Wettbewerbsfamilie / stabiler `leagueKey`.
- `competitionType` (Pokal, Turnier).
- verwaltete Basketballkreis-**Datensätze** (nur die String-Liste in Konstanten).
- vollständiger Draft→Publish-Saisonworkflow.
- allgemeines Live-Teilnahmemodell (über `leagueId` hinaus).
