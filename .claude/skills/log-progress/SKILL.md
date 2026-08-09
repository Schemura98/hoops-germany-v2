---
name: log-progress
description: Fortschritt von Hoops Germany dauerhaft festhalten – kompakt in CLAUDE.md Abschnitt 0, vollständig als Protokoll in docs/CHRONIK.md. Nutze diese Skill nach jedem Meilenstein, Feature oder Commit – sie trägt ein, was geändert wurde, den Commit-Hash und aktualisiert die offene Roadmap, damit Wissen session-übergreifend erhalten bleibt und auch bei einem kompletten Umbau der (live geschalteten) Seite nichts fehlt.
---

# Log-Progress: Fortschritt in CLAUDE.md + CHRONIK festhalten

Die Projektdoku hat seit 08.08.2026 (Commit `b3d4bf6`) **zwei Ebenen**:
- **`CLAUDE.md` → Abschnitt 0 (AKTUELLER STAND):** kompakter Überblick (Stand, kritische
  Warnungen, Feature-Stand, offene Roadmap) – **kanonisch**, wird von jeder Session gelesen.
- **`docs/CHRONIK.md`:** das vollständige Meilenstein-Archiv (alle datierten Protokolle mit
  Commit-Hashes und Verifikations-Notizen).
Das private Session-Gedächtnis (`MEMORY.md`) ersetzt beides NICHT. Wo sich Chronik und
CLAUDE.md widersprechen, gilt CLAUDE.md.

## Wann ausführen
- Nach **jedem** abgeschlossenen Meilenstein / Feature / Bugfix.
- Spätestens unmittelbar **nach jedem Commit** auf `redesign` (oder dem aktiven Branch).
- Vor dem Ende einer Arbeitssitzung, wenn seit dem letzten Eintrag etwas dazugekommen ist.

## Wie aktualisieren (Zwei-Ebenen-Struktur seit 08.08.2026, Commit `b3d4bf6`)
1. **`CLAUDE.md` Abschnitt 0 kompakt aktualisieren:** Stand-Zeile, Feature-Stand-Überblick und
   Roadmap **verdichten statt anhäufen** – Abschnitt 0 ist Überblick, KEIN Changelog mehr.
   Keine neuen datierten Protokoll-Blöcke dort anlegen.
2. **`docs/CHRONIK.md`:** das vollständige Meilenstein-Protokoll **unten anhängen** (so verlangt
   es der Chronik-Kopf; der Archiv-Block vom 08.08. darüber ist historisch newest-first – nicht
   umsortieren, bestehende Einträge nie umschreiben):
   - **Datum** (absolut, z. B. „09.08.2026").
   - **Was umgesetzt wurde**: Stichpunkte mit konkreten **Datei-/Endpoint-/Modell-Namen**
     (z. B. „`/api/...`, `components/...`, Modell `X`") + Verifikations-Notiz.
   - **Commit-Hash** (Kurzform, z. B. `a1b2c3d`).
3. Aktualisiere die Liste **„🔜 Noch offen (Roadmap)"** in Abschnitt 0: Erledigtes streichen/abhaken,
   Neues ergänzen.
4. Bei strukturellen Änderungen (neue Modelle, neue lib-Helfer, neue Konventionen, Schema-Felder)
   zusätzlich die passenden Stellen in Abschnitt 0 (Architektur-Konventionen / Modelle) ergänzen.
5. **Commit** (`CLAUDE.md` + `docs/CHRONIK.md`, eigener `docs:`-Commit oder gemeinsam mit dem
   Feature-Commit) und pushen.

## Regeln
- **Knapp halten.** Abschnitt 0 ist Überblick, kein Changelog jeder Zeile. Lieber verdichten als anhäufen.
  Das Detail-Protokoll gehört in die CHRONIK, nicht nach Abschnitt 0.
- **Keine Geheimnisse** (Keys, Passwörter, Tokens) in CLAUDE.md.
- **Ehrlich**: Nur als „fertig" markieren, was verifiziert ist; offene/ungetestete Punkte klar als offen führen.
- **Pfade & Namen statt Prosa** – damit ein späterer Umbau weiß, wo etwas liegt.
- Wenn ein Punkt aus der Roadmap erledigt ist, **aus der Roadmap entfernen** und im
  Feature-Stand-Überblick (Abschnitt 0) bzw. im CHRONIK-Protokoll abbilden.

## Mini-Vorlage für einen Eintrag
```
#### Update (DATUM)
- <Feature/Änderung>: <kurze Beschreibung mit Datei-/Endpoint-Namen> (Commit `xxxxxxx`).
- <…>
```
