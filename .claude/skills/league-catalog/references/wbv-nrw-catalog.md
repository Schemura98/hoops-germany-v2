# NRW-Struktur (WBV) für Hoops Germany

> Der WBV bietet auch Wettbewerbe **unterhalb U16** an – Hoops Germany bildet diese **bewusst nicht** ab.
> Staffeln/Staffelanzahlen sind **saisonabhängig** und dürfen **nicht dauerhaft im Frontend hart codiert**
> werden – aus den tatsächlichen Ligadaten oder einer saisonbezogenen Konfiguration ableiten.

## Senioren Herren
Ebenen (Spielklasse), von oben nach unten:
1. 1. Regionalliga Herren
2. 2. Regionalliga Herren
3. Oberliga Herren
4. Landesliga Herren
5. Bezirksliga Herren
6. Kreisliga Herren  ← Unterbau der Bezirksliga, **kreisbezogen** (s. u.)

## Senioren Damen
1. Regionalliga Damen
2. Oberliga Damen
3. Landesliga Damen
4. Bezirksliga Damen

Eine **Kreisliga Damen** nur anlegen, wenn sie in tatsächlich gepflegten/importierten Daten existiert –
nicht automatisch erzeugen.

## Jugend (nur U18 & U16)
Mögliche Verbandsebenen:
1. 1. Jugendregionalliga
2. 2. Jugendregionalliga
3. Jugendoberliga
4. Jugendlandesliga

Nicht jede Kombination existiert in jeder Saison → verfügbare Kombinationen aus echten Ligadaten oder
saisonbezogener Konfiguration ableiten (nicht raten). Datenmodell: `gender` bleibt `Herren|Damen|Mixed`;
Anzeige kann zu männlich/weiblich/offen mappen.

## Kreisligen (Unterbau, kreisbezogen)
- Kreisligen sind **einem Basketballkreis** zuzuordnen (`region` = Kreisname).
- Stufen je Kreis können sein: **1. Kreisliga** und **2. Kreisliga**.
- Hoops Germany berücksichtigt im Jugendbereich davon **nur U18 & U16**.
- **Nicht pauschal voraussetzen:** dass jeder Kreis beide Stufen hat · dass jede Altersklasse in jedem
  Kreis angeboten wird · dass jede Saison dieselbe Struktur hat · dass eine „Kreisklasse" existiert.
- „**Kreisklasse**" nur verwenden, wenn sie in einer gepflegten/importierten offiziellen Quelle
  tatsächlich vorkommt.

## Basketballkreise in NRW — ⚠️ PROVISORISCHE LISTE (gegen echte WBV-Quelle prüfen!)
> Diese Liste stammt aus einer ChatGPT-Recherche und ist **noch nicht** gegen die offizielle
> WBV-Struktur (basketball.nrw) verifiziert. Namen/Zuschnitte können abweichen. **Vor produktiver
> Nutzung prüfen und korrigieren.** Kanonische Quelle im Code: `lib/constants.js → BASKETBALLKREISE_NRW`
> (dort NICHT mehrfach über Komponenten verteilen).

**Regierungsbezirk Köln:** Kreis Aachen · Kreis Erft · Kreis Bonn · Kreis Köln · Rheinisch Bergischer Kreis
**Regierungsbezirk Düsseldorf:** Kreis Düsseldorf · Kreis Niers · Kreis Niederrhein · Kreis Essen ·
Kreis Mettmann · Kreis Wuppertal
**Regierungsbezirk Arnsberg:** Kreis Bochum · Kreis Dortmund · Kreis Unna/Hamm/Soest · Kreis Ennepe-Ruhr ·
Kreis Hagen · Märkischer Kreis · Kreis Südwestfalen
**Regierungsbezirk Münster:** Kreis Münster · Kreis Emscher-Lippe
**Regierungsbezirk Detmold:** Kreis Ostwestfalen · Kreis Paderborn

Der **Regierungsbezirk** dient nur der internen Gruppierung – **kein** zusätzlicher Hauptfilter für normale
Nutzer.

## Basketballkreis-Filter (UX-Regel)
Filter „Basketballkreis" nur einblenden, wenn: **NRW** gewählt **und** Spielklasse **Kreisliga** gewählt –
oder tatsächlich kreisbezogene Ergebnisse vorliegen. Optionen möglichst aus vorhandenen Daten ableiten.

Bei bestehenden abweichenden `region`-Strings: **nicht automatisch löschen** → normalisieren/zuordnen,
unklare Werte im Bericht auflisten.
