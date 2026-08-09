---
name: league-catalog
description: Verbindliche Liga-, Saison-, Playoff- und Kreisliga-Logik von Hoops Germany. Nutze diesen Skill bei ALLEN Änderungen an Ligen, Saisons, Staffeln, Saison-Rollover, Ligafiltern, Kreisligen, Basketballkreisen, Tabellen, Spielen/Ergebnissen, Playoffs, Teamzuordnungen, Liga-Seeds/Importen und Liga-Adminfunktionen. Trennt bewusst Ist-Zustand, Produktregeln, Tech-Schulden und Zukunftsentscheidungen.
---

# Liga-Katalog – Wissens- und Prüfbasis

Dieser Skill ist die **verbindliche Prüfbasis** für alles Ligaabhängige in Hoops Germany. Er ist eine
Wissens-/Checklisten-Basis, **kein autonomer Agent** – größere Arbeiten laufen phasenweise
(Analyse → Review → Freigabe → Umsetzung → Test).

## Wann verwenden
Bei Änderungen an: Ligen · Saisons · Saison-Rollover · Ligafiltern · Kreisligen · Basketballkreisen ·
Tabellen · Spielen/Ergebnissen · Playoffs · Teamzuordnungen · Liga-Seeds/Importen · Liga-Adminfunktionen.

## Verbindliche Arbeitsweise (BEVOR du Code änderst)
1. **Zuerst den echten Code prüfen** – nicht aus dem Gedächtnis oder aus dieser Doku allein arbeiten
   (`models/League.js`, `models/TeamSeason.js`, `models/Team.js`, `app/ligen/*`, `app/api/leagues/*`,
   `app/api/admin/*league*`, `lib/standings.js`, `lib/constants.js`, `scripts/seed-nrw-leagues.mjs`,
   `scripts/rollover-season.mjs`).
2. **Ist-Zustand** (`references/current-architecture.md`) gegen **Produktregeln**
   (`references/product-rules.md`) abgleichen.
3. **Bestehende Daten nie ungeprüft ändern/löschen.** Keine große Datenmodell-Migration ohne vorherigen
   schriftlichen Bericht + Freigabe.
4. Jede Änderung gegen `references/change-checklist.md` prüfen.
5. **Konflikt Code ↔ Produktregel ausdrücklich benennen** – nicht stillschweigend „auflösen".
6. **Keine Produktentscheidung als beiläufige UX-Änderung** umsetzen (Liste großer Entscheidungen s.
   Checkliste). Bei solchen Punkten: erst dem User vorlegen.

## Erstläufe mit Prod-Risiko (besondere Vorsicht)
Zwei Aufgaben aus der Roadmap sind Erstläufe gegen Produktivdaten – hier gelten Zusatzregeln:
1. **Season-Rollover-Erstlauf** (Roadmap #7): `scripts/rollover-season.mjs` ist deployt, aber
   **noch NIE auf Prod gelaufen**. Vor dem ersten echten Lauf: `--dry` auf Dev UND Prod-Datenstand,
   10-Minuten-Sanity-Check gegen die WBV-Gruppenzahl der neuen Saison, und einplanen, dass Teams sich
   der neuen Saison über den Liga-Wechsel-/Freigabeprozess neu zuordnen (kein Auto-Übertrag).
2. **WBV-Kreisliga-PDF-Import** (Roadmap #5): PDF-Inhalt **sorgfältig prüfen, nicht blind übernehmen**
   (inkl. Umlaute korrigieren), dann ins Seed-Muster analog `seed-nrw-leagues.mjs` (`official:true`,
   `level:"Kreisliga"`, `region`=Kreis, idempotenter Upsert, `--dry`) → erst Dev testen, dann Prod.
   Demo-Daten erst **danach** per `--purge` ersetzen, nie vorher.

## Ausgabeformat bei Nutzung dieses Skills
> **Ist-Zustand** · **Betroffene Produktregeln** · **Gefundene Probleme** · **Sichere Änderungen** ·
> **Architekturentscheidungen** · **Umgesetzte Änderungen** · **Tests** · **Offene Punkte**

## Referenzen
- `references/current-architecture.md` – bestätigter technischer Ist-Zustand (Code-verifiziert).
- `references/product-rules.md` – verbindliche Produktregeln (Soll-Zustand).
- `references/wbv-nrw-catalog.md` – relevante NRW-Struktur + Basketballkreise
  (Kreis-Liste am 02.07.2026 gegen die offizielle WBV-Seite **verifiziert**, Commit `7e69f12`).
- `references/change-checklist.md` – Pflicht-Checkliste pro Ligaänderung.

## Wichtiger Grundsatz
Eine **aktuelle technische Einschränkung** (z. B. „Aktuelle Saison = `active`-Flag") darf **nicht** als
dauerhaft richtige **Produktregel** dokumentiert oder zementiert werden. Ist-Zustand und Soll-Zustand sind
in den Referenzen bewusst getrennt.
