# Verbindliche Produktregeln (Soll-Zustand)

> Diese Regeln sind bewusste Produktentscheidungen. Wo der Ist-Zustand (siehe `current-architecture.md`)
> abweicht, ist das eine **technische Schuld**, keine Rechtfertigung, die Regel aufzuweichen.

## Unterstützte Altersbereiche
Hoops Germany unterstützt **ausschließlich**: **Senioren · U18 · U16**.

**Nicht unterstützt** (bewusste Produktentscheidung, kein fehlendes Feature): U14, U12, U10, U8,
Mini-Basketball, alle jüngeren Altersklassen.

Nicht unterstützte Altersklassen dürfen:
- nicht im öffentlichen Filter erscheinen,
- nicht über reguläre Adminformulare angelegt werden,
- nicht automatisch importiert werden,
- nicht durch das Saison-Rollover erzeugt werden,
- nicht über indirekte Beziehungen öffentlich sichtbar werden.

Bestehende Altdaten unterhalb U16 **nicht ungeprüft löschen** → erst analysieren, dokumentieren,
öffentlich ausblenden, sichere Bereinigungs-/Archivoption vorschlagen. (Stand jetzt: auf Prod existieren
**0** solche Ligen.)

## „Aktuelle Saison"
Die nutzerseitige Bezeichnung „Aktuelle Saison" darf **nicht dauerhaft** allein mit `active` gleichgesetzt
werden.
- **Kurzfristig sicher:** Filter ehrlich in „Aktive Ligen" umbenennen **oder** Saisonwert + `active`
  gemeinsam prüfen (und abgeschlossene Altsaisons via `--deactivate-old` auf `active:false`).
- **Langfristig:** echte Saisonkennung / eindeutige Saisonlogik (eigenes Season-Modell = große Entscheidung).

## Liga & Saison
- Alte Saisons dürfen **niemals** überschrieben werden; jede Saison bleibt historisch aufrufbar.
- Matches, Tabellen, Statistiken bleiben **saisonbezogen**.
- Rollover erzeugt **neue** Liga-Dokumente, **keine** kopierten Ergebnisse.
- Teams werden in einer neuen Saison **nur als Vorschlag** übernommen, nicht ungeprüft endgültig.

## Statuslogik (ZIEL-Regel – aktuell noch nicht erzwungen!)
| Zustand | active | finished |
|---|---|---|
| laufend | true | false |
| beendet | false | true |
| geplant / in Vorbereitung | false | false |
| **widersprüchlich** | **true** | **true** |

⚠️ **Ist-Hinweis:** `active:true + finished:true` existiert derzeit real (3 Demo-Ligen). Diese Kombination
soll künftig verhindert oder ausdrücklich als Fehler markiert werden – ist aber **noch nicht** durchgesetzt.

## Playoffs
- Playoffs = **Wettbewerbsphase**, keine Spielklasse. Gehören zur jeweiligen Saison.
- Verändern **standardmäßig nicht** die Hauptrundentabelle.
- Best-of-1/3/5 müssen grundsätzlich abbildbar bleiben (aktuell nur best_of_1 modelliert).
- Qualifikation/Hauptrunde/Zwischenrunde/Playoffs/Finalrunde **nicht** als ungeordnete eigenständige
  Ligen vermischen.

## Leere Ligen (0 Teams)
- Offizielle Ligen mit 0 Teams **dürfen im Datenbestand bleiben** (der Katalog ist bewusst so).
- Normalen Nutzern sollen sie **nicht ungefiltert zwischen aktiven Ligen** angezeigt werden.
- Mögliche Darstellung: nur im vollständigen Katalog · als „In Vorbereitung" / „Anmeldung läuft" · in der
  Adminansicht · über direkte URL.
- ⚠️ **Ist-Konflikt:** Aktuell werden leere Ligen gezeigt (nur nach `teamCount` nach hinten sortiert), weil
  `/ligen` gleichzeitig als offizieller Katalog-Browser dient. Auflösung ist eine bewusste UX-Entscheidung.
