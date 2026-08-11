# Namenskonvention: Bild-Varianten in `public/images/`

Festgelegt von **Frieda** (dokumenten-logistik), Patricks Freigabe
11.08.2026, im Anschluss an `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`
(Frage 3). Kurz gehalten, damit sie beim nächsten Bild-Auftrag in
Sekunden auffindbar ist — Querverweis aus `CLAUDE.md`/`AGENTS.md`
Abschnitt "Architektur-Konventionen".

## Regel

```
<basis>-<lange-Kante-in-px>.<format>
```

- **Kebab-Case**, wie im übrigen Projekt (API-Routen, Seiten-Routen —
  z. B. `/api/upload/player-image`, `/reset-password`).
- **`<lange-Kante>`** ist die **größere** der beiden Pixel-Kanten (Breite
  bei Querformat, Höhe bei Hochformat) — **nicht** immer die Breite.
  Grund: Bei Hochformat-Bildern ist die Breite die kurze, wenig
  aussagekräftige Kante; die lange Kante ist außerdem exakt die Metrik,
  nach der künftiges Ersatzmaterial bemessen wird (s.
  `docs/HERO-ASSETS-2026-08-11.md`, Abschnitt 3: Zielmarke "≥ 3600 px
  lange Kante").
- Nur echte, real erzeugte Größenstufen benennen — keine
  Hochskalierung, keine spekulativen Stufen ohne Datei.

## Beispiele (Stand 11.08.2026)

| Datei | Native Auflösung | Lange Kante im Namen |
|---|---|---|
| `login-image-1000.webp` / `.avif` | 1000×652 (Querformat) | 1000 (= Breite, hier zufällig auch lange Kante) |
| `signup-image-1000.webp` / `.avif` | 1000×668 (Querformat) | 1000 |
| `register-image-571.webp` / `.avif` (archiviert, `docs/asset-archive/`) | 373×571 (Hochformat) | **571 = Höhe**, nicht 373 |
| `player-image-1235.webp` / `.avif` (archiviert, `docs/asset-archive/`) | 912×1235 (Hochformat) | **1235 = Höhe**, nicht 912 |

Die beiden Hochformat-Beispiele hießen ursprünglich `register-image-373`
und `player-image-912` (nach Breite benannt) und wurden bei der
Archivierung auf das lange-Kante-Schema umbenannt — auch wenn sie aktuell
im Archiv liegen und nicht ausgeliefert werden, soll das Schema von
Anfang an konsistent sein, falls sie zurückgeholt werden.

## Wann die Dimension weglassen?

Wenn von einem Motiv nur **eine** Nicht-Original-Größe existiert,
disambiguiert die Zahl im Namen nichts — sie ist reine Vorbereitung auf
einen Fall, der noch nicht eingetreten ist. Aktuell (11.08.2026) tragen
trotzdem alle vier aktiven Varianten die Dimension, damit das Schema von
Anfang an einheitlich ist und nicht erst nachträglich eingeführt werden
muss, sobald echte Mehrfachstufen kommen (z. B. nach neuem
≥3600px-Hero-Material).

## Backlog (zurückgestellt, nicht vergessen)

- **`public/images/login image.jpg`** enthält ein **Leerzeichen** im
  Dateinamen und wird aktiv referenziert (`components/landing/LandingHero.js:58`,
  `components/layout/AuthShell.js:12`+`:29`). Funktioniert aktuell nur
  über Browser-Auto-Encoding (`%20`) — kein akutes Problem, aber ein
  schlafendes Risiko bei jeder Verwendung außerhalb dieses Pfads
  (Shell-Skripte, Sitemap/RSS, künftige `next/image`-Nutzung). **Patricks
  Entscheidung 11.08.2026: zurückgestellt (Option A), nicht umbenennen.**
  Falls doch umbenannt wird (z. B. zu `login-image.jpg`): nur mit
  Freigabe, atomar mit allen drei Fundstellen zusammen ändern.
- Der übrige Altbestand (`signupImage.jpg` camelCase; `registerimage.jpg`/
  `playerimage.jpg`-Stil alles-klein-zusammen bei den restig verbliebenen
  Alt-Assets wie `basketballogo.png`, `contentimage.png`, `postcardimage.jpg`,
  `profileimage.png`, `newsfeed.png`, `dhlogo.jpg`) folgt dieser Konvention
  **nicht rückwirkend** — sie gilt für neu erzeugte Varianten-Dateien ab
  sofort, ist aber kein Auftrag, den kompletten Altbestand umzubenennen.
