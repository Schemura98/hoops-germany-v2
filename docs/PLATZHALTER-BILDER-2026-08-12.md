# Platzhalter-Bilder für die Testphase — wo sie liegen und wie sie reinkommen

Angelegt 12.08.2026 aus der Backoffice-Session. Zweck: Die Hoops-Session
soll die Bilder **finden**, ohne dass jemand sie erwähnt.

⚠️ **Platzhalter, keine Designentscheidung.** Die entschiedene Richtung
bleibt „kein Foto, Vektor" (`dec-hoops-material-richtung`, Option 1). Diese
Bilder dienen einem Einbauversuch, damit Jonatan Anschauung hat und sichtbar
wird, wie sich Fotos ins Design fügen. Wer sie auf einer Ansicht zeigt, sagt
dazu, dass sie Platzhalter sind.

## Wo sie liegen

```
C:\Users\schem\OneDrive\Desktop\Hoops-Marketing\_werkzeuge\stock-kandidaten\
  auswahl\          14 ausgewählte Bilder, sprechende Dateinamen
  AUSWAHL.md        Begründung je Bild + was nicht funktioniert hat
  HERKUNFT.json     Fotograf, Pexels-ID, Originallink je Datei
  halle\ spiel\ detail\ menschen\   alle 68 Kandidaten
  kontaktbogen-*.jpg                Übersichtsbögen zum Ansehen
```

Der Ordner ist **kein Git-Repo** und liegt bewusst außerhalb von
`hoops-germany-v2`. Das ist keine Ausnahme: `Hoops-Marketing` wird aus
diesem Projekt bereits an fünf Stellen referenziert (u. a.
`HERO-ASSETS-2026-08-11.md`, beide Ablage-Audits).

## Lesen: geht

Absolute Pfade auf derselben Maschine. `Read`, `Glob` und `Grep` erreichen
den Ordner; die Kontaktbögen lassen sich direkt ansehen. Milos Definition
zeigt ohnehin schon dorthin
(`Hoops-Marketing\_werkzeuge\INSTALL-VERMERK-*.md`).

## Im Browser anzeigen: geht NICHT ohne Kopie

Next.js liefert statische Dateien ausschließlich aus `public/` aus. Für
einen echten Einbauversuch müssen die verwendeten Bilder dorthin — aber
**nicht alle vierzehn und nicht unbearbeitet**:

- `public/images` ist heute **1,3 MB** gesamt. Die 14 Platzhalter wiegen
  **2,6 MB** — das wäre eine Verdreifachung durch Material, das wieder
  verschwinden soll.
- Am 11.08.2026 hat Frieda dort **sechs verwaiste Dateien** aufgeräumt
  (`ABLAGE-AUDIT-PUBLIC-2026-08-11.md`). Genau dieses Problem nicht neu
  erzeugen.

**Deshalb der Weg:**

1. Nur die Bilder kopieren, die tatsächlich in den Versuch gehen — im
   Zweifel zwei oder drei, nicht vierzehn.
2. Nach `public/images/platzhalter/` — eigener Unterordner, damit später
   ein einziges Löschen reicht.
3. Vorher optimieren wie der Bestand: Die vorhandenen Assets liegen als
   `*-1000.webp` und `*-1000.avif` vor; das Werkzeug dafür steht in
   `Hoops-Marketing\_werkzeuge\make-hero-variants.js`, Zielgrößen in Milos
   Definition (Hero ≥ 2400 px lange Kante, WebP Q 80–85).
4. Im Commit vermerken, dass es Platzhalter sind und wann sie rausfliegen.

## Was die Auswahl taugt — Kurzfassung

Vollständig in `AUSWAHL.md`. Die drei Sätze, die zählen:

- **Bester Treffer:** `hintergrund-01_korb-von-unten-dunkel.jpg` — dunkler
  Grund fügt sich in Navy, der orange Ring ist fast die Markenfarbe.
- **Glaubwürdigster:** `szene-04_trainingsgruppe-sprossenwand.jpg` —
  Sprossenwand heißt deutsche Turnhalle, nicht US-Gym. Das ist die Welt der
  Zielgruppe (Bezirks- bis Kreisliga, Anfang 20 bis Mitte 30).
- **Menschen nur anonym:** Von neun Porträts blieben zwei übrig, beide ohne
  erkennbare Gesichter. Nicht wegen der Lizenz — Pexels erlaubt die Nutzung
  —, sondern wegen Glaubwürdigkeit: erkennbare US-College-Spieler oder
  Teenager verlieren genau die Zielgruppe, die gewonnen werden soll.

## Nächster Schritt

`task-material-eignungspruefung` (Option 2 der freigegebenen Entscheidung):
Vivien urteilt an echten Beispielen, ob Fotos die Vektor-Richtung stärken
oder brechen. Diese Bilder sind das Material dafür — der Einbauversuch ist
die Prüfung, nicht ihr Ergebnis.
