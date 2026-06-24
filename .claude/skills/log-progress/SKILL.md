---
name: log-progress
description: Fortschritt von Hoops Germany dauerhaft in CLAUDE.md (Abschnitt 0) festhalten. Nutze diese Skill nach jedem Meilenstein, Feature oder Commit – sie trägt ein, was geändert wurde, den Commit-Hash und aktualisiert die offene Roadmap, damit Wissen session-übergreifend erhalten bleibt und auch bei einem kompletten Umbau der (live geschalteten) Seite nichts fehlt.
---

# Log-Progress: Fortschritt in CLAUDE.md festhalten

`CLAUDE.md` → **Abschnitt 0 (AKTUELLER STAND)** ist die **kanonische, session-übergreifende**
Projektdoku von Hoops Germany. Sie ist im Repo eingecheckt und wird von jeder Session gelesen.
Das private Session-Gedächtnis (`MEMORY.md`) ersetzt sie NICHT – CLAUDE.md ist die Quelle der Wahrheit.

## Wann ausführen
- Nach **jedem** abgeschlossenen Meilenstein / Feature / Bugfix.
- Spätestens unmittelbar **nach jedem Commit** auf `redesign` (oder dem aktiven Branch).
- Vor dem Ende einer Arbeitssitzung, wenn seit dem letzten Eintrag etwas dazugekommen ist.

## Wie aktualisieren
1. **Read** `CLAUDE.md`, Abschnitt 0 (Zeilen ~6–90).
2. Trage den Fortschritt **knapp** nach – idealerweise unter dem „Update"-/Fortschritts-Block:
   - **Datum** (absolut, z. B. „26.06.2026").
   - **Was umgesetzt wurde**: 1–3 Stichpunkte mit konkreten **Datei-/Endpoint-/Modell-Namen**
     (z. B. „`/api/...`, `components/...`, Modell `X`").
   - **Commit-Hash** (Kurzform, z. B. `a1b2c3d`).
3. Aktualisiere die Liste **„🔜 Noch offen (Pre-Live-Roadmap)"**: Erledigtes streichen/abhaken,
   Neues ergänzen.
4. Bei strukturellen Änderungen (neue Modelle, neue lib-Helfer, neue Konventionen, Schema-Felder)
   zusätzlich die passenden Stellen in Abschnitt 0 (Architektur-Konventionen / Modelle) ergänzen.
5. **Commit** `CLAUDE.md` (eigener `docs:`-Commit oder gemeinsam mit dem Feature-Commit) und pushen.

## Regeln
- **Knapp halten.** Abschnitt 0 ist Überblick, kein Changelog jeder Zeile. Lieber verdichten als anhäufen.
- **Keine Geheimnisse** (Keys, Passwörter, Tokens) in CLAUDE.md.
- **Ehrlich**: Nur als „fertig" markieren, was verifiziert ist; offene/ungetestete Punkte klar als offen führen.
- **Pfade & Namen statt Prosa** – damit ein späterer Umbau weiß, wo etwas liegt.
- Wenn ein Punkt aus der Roadmap erledigt ist, **aus der Roadmap entfernen** und in „Fertig" aufnehmen.

## Mini-Vorlage für einen Eintrag
```
#### Update (DATUM)
- <Feature/Änderung>: <kurze Beschreibung mit Datei-/Endpoint-Namen> (Commit `xxxxxxx`).
- <…>
```
