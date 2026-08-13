# Inspirations-Notiz: Newsfeed-Umbau

**Vivien (design-spezialistin) · 13.08.2026 · Skill `design-trend-recherche`**

**Auftrag + Stufe:** Newsfeed-Seite (`/player/newsfeed`) moderner in Design &
Architektur. **Stufe M (Kurz-Sweep)** — nutzersichtbare Kernfläche innerhalb
der bestehenden Marke; die Formensprache ist durch
`docs/VISUELLE-RICHTUNG-2026-08-12.md` entschieden und der Sport-Community-
L-Sweep vom 12.08. (Referenz-Register) deckt sie ab. Offen war nur die
**Informationsarchitektur eines Feeds** — dafür Sorte-B-Quellen.

**Suchschnitt:** Activity-/Social-Feed-Muster für eine Sport-Community,
mobil zuerst, Zielgruppe Liga-Spieler NRW (Z1), wiederkehrende Nutzer.

## Referenzen

| Quelle | Was daran stark ist | Übernommen | Bewusst nicht |
|---|---|---|---|
| `uxpatterns.dev/patterns/social/activity-feed` (Sorte B) | Der eine Satz, der den Umbau trägt: **„Do not hide critical next steps below large promotional modules."** Dazu: Zustände (default/loading/error/success) explizit prüfen, semantisches HTML vor ARIA. | Feed und Handlung nach vorn: Widgets mobil alle eingeklappt, Composer einzeilig, Spieltag-Antwort ganz oben. `<main>`-Landmarke + h1 nachgezogen. | Die dort beschriebene Filter-/Sortier-Leiste am Feed — bei zwei Feed-Modi reicht der bestehende Tab-Umschalter. |
| `getstream.io/blog/activity-feed-design` (Sorte B) | „Feeds should be simple — remove redundancies"; Zero States bewusst gestalten; Vorschläge („Who to follow") als Seitenleisten-Muster (Quora/Twitter/Product Hunt); Einträge nicht mit UI-Controls überladen. | Vorschläge auf Desktop in die rechte Spalte statt mitten in den Feed-Fluss; ehrlicher Leertext im Vorschläge-Akkordeon statt leerer Fläche. | ML-Personalisierungs-Empfehlungen (existiert als „Für dich"-Ranking bereits, kein Ausbau nötig); Instagram-artige horizontale Account-Karussells — bei 9 externen Nutzern erfundene Fülle. |
| WebSearch-Schnitt „feed design 2025" (u. a. greatfrontend.com News-Feed-Systemdesign) | Bestätigt den Bestand: cursor-/offset-Paginierung mit IntersectionObserver ist Stand der Technik — genau so bereits gebaut. | Nichts Neues — der Fund ist die Bestätigung, die Feed-Mechanik NICHT anzufassen. | Virtualisierte Listen — bei heutigen Feed-Größen Overhead ohne Nutzen. |

**Umsetzbarkeit:** Alles mit Bestand baubar (Tailwind-Tokens, `components/ui/*`,
`matchVerification`/`teamScores`, Playwright-Verifikation). Kein neues Werkzeug.

**Nicht geprüft / Grenzen:** Reine Text-Abrufe — wie die Referenz-Feeds
*aussehen*, habe ich nicht gesehen (bekannte Grenze der Quellsorte, siehe
Quellen-Register). Kein Blick auf konkurrierende Sport-Apps (FuPa u. a.) in
diesem Sweep — deren Feed-IA wäre ein sinnvoller Kandidat für den nächsten
M-Sweep dieser Branche.
