# Change-Checkliste – vor JEDER Ligaänderung durchgehen

## Prüffragen
- [ ] Betrifft die Änderung nur **Senioren, U18 oder U16**? (sonst: stoppen – nicht unterstützt)
- [ ] Kompatibel mit der aktuellen Code-Architektur (`current-architecture.md`)?
- [ ] Wird **Ist-Zustand mit Soll-Produktlogik verwechselt**? (z. B. `active` ≠ „aktuelle Saison")
- [ ] Werden **historische Saisons** geschützt (nichts überschreiben)?
- [ ] Werden **bestehende Ergebnisse/Matches** geschützt?
- [ ] Kann die Änderung **Dubletten** erzeugen? (Liga: `findDuplicateLeague`; Seeds: idempotenter Upsert)
- [ ] Betrifft sie `active` oder `finished`? (Statuslogik beachten; `active:true+finished:true` vermeiden)
- [ ] Betrifft sie das **Rollover-Skript** (`rollover-season.mjs`)? (keine Ergebnisse kopieren, idempotent)
- [ ] Betrifft sie **`Team.leagueId` oder `TeamSeason`**? (Live-Zuordnung vs. Snapshot nicht verwechseln)
- [ ] Betrifft sie **Tabellen/Topscorer**? (`lib/standings.js`; saisongenau; Playoffs ausschließen)
- [ ] Betrifft sie **Hauptrunde oder Playoffs**? (`Match.stage`/`playoffRound`)
- [ ] Betrifft sie **Kreis- oder Verbandsebene**? (Kreisliga = kreisbezogen, `region` = Kreis)
- [ ] Muss der **Basketballkreis** angegeben werden? (kanonische Liste `BASKETBALLKREISE_NRW`)
- [ ] Ist eine **Server-Validierung** vorhanden/nötig? (v. a. `ageGroup`-Whitelist in Admin-APIs)
- [ ] Sind **Tests** erforderlich?
- [ ] Ist eine **Datenmigration** notwendig? (dann erst Bericht + Freigabe)
- [ ] Ist die Änderung in Wahrheit eine **Produktentscheidung** (s. u.)?

## Große Produktentscheidungen — NICHT beiläufig umsetzen
Diese Punkte erst dem User vorlegen (Analyse → Freigabe), nie als „kleine UX-Änderung":
- Liga-Follows / „Meine Ligen"
- permanente Wettbewerbsfamilie
- stabiler `leagueKey` über Saisons
- eigenes **Season-Modell** (echte „aktuelle Saison")
- `competitionType` (Pokal/Turnier)
- Basketballkreis als **eigene DB-Entität** (statt String)
- echtes Live-**Teilnahmemodell** (statt `leagueId`)
- **Draft→Publish**-Saisonworkflow
- Änderung der **gespeicherten Geschlechtswerte** (Herren/Damen/Mixed)

## Vorgehen bei größeren Arbeiten
Immer phasenweise: **1. Analyse → 2. Review → 3. Freigabe → 4. Umsetzung → 5. Test.**
Vor destruktiven/großen Änderungen ausdrücklich um Freigabe bitten. Nach der Umsetzung Tests + Abschlussbericht.
