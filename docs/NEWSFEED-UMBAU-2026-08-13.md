# Newsfeed-Umbau — Entscheidungen und bewusste Auslassungen

**Vivien (design-spezialistin) · 13.08.2026 · Commits `9244492`…`446317c` (+ Doku)**

Patricks Auftrag: „Die Newsfeed Seite könnte meiner Meinung nach auch ein
moderneres Design & Architektur besitzen." Leitfrage aus dem Briefing: Ein
Wiederkehrer fragt **„Was ist passiert, seit ich weg war?"** — die Seite
antwortete bisher „Hier sind Beiträge", alles gleichrangig.

## Was gebaut wurde

| Änderung | Warum | Wo |
|---|---|---|
| **Spieltag-Leiste**: nächstes Spiel + letztes Ergebnis des eigenen Teams, Beleg-Status daneben, Links auf `/match/[id]` | Die ehrlichste Antwort auf die Wiederkehrer-Frage aus Daten, die die Seite ohnehin lädt. Ronjas R3 (Checkliste begrüßt vom ersten Tag), auf den Spieler übertragen: Ist die Checkliste erledigt/ausgeblendet, begrüßt jetzt der Spieltag. | `components/feed/SpieltagStrip.js` |
| **Kopf mit h1** („Newsfeed", Big Shoulders) + Anrede-Eyebrow + Datum in Mono | Befund Tobias L5 (kein h1). Anzeigetafel-Sprache statt anonymer Widget-Stapel. | `app/player/newsfeed/page.js` |
| **Footer** mit Impressum/Datenschutz | Befund Tobias L4, von Nora als rechtlich zu bewerten markiert — einzige Seite ohne Verweis. Globaler `<Footer />`, kein eigener Rechtstext (Verweis, keine Formulierung). | dito |
| **Mobil: Feed nach vorn** — alle Widgets eingeklappt, Composer einzeilig | Sweep-Beleg: „Do not hide critical next steps below large promotional modules" (uxpatterns.dev). Feed-Beginn gemessen von **1858 px → 1360 px** (max@test.de, 390 px; mit sichtbarer Checkliste). | dito + `PostComposer.js` |
| **Checkliste ehrlich**: „X von 4 **Schritten**", Bonus unter eigener Trennzeile | Befund Tobias L3 = ein Fall aus `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md` (Zahl stimmt im Code, lügt beim Lesen). | `OnboardingChecklist.js` |
| **Ein `my-matches`-Abruf** statt zwei; Feed-Logik nach `PostFeed.js` ausgelagert; `<main>`-Landmarke auch mobil | „Architektur": weniger Anfragen, Seite = Anordnung + Datenbeschaffung, Bausteine einzeln testbar. | `page.js`, `PostFeed.js`, `TeamMatchesWidget.js` |
| **Desktop: Vorschläge in die rechte Spalte** | Seitenleisten-Muster (getstream-Sweep); die Mitte gehört Composer + Feed. | `page.js`, `FollowSuggestions.js` |
| **`distDir` per `NEXT_DIST_DIR` umlenkbar** (Standard unverändert `.next`) | Ein liegengebliebener `next start` auf Port 3000 blockierte `.next`; die Umlenkung löst die dokumentierte Kollisionsklasse dauerhaft. | `next.config.mjs`, `.gitignore` |

**Primitive:** Neue Flächen nutzen `Card` (erste echten `Card`-Importe des
Projekts — Spieltag-Leiste), `Skeleton`, `Tabs`, `Loading`, `EmptyState`,
`Button`. **Urteil zum 126-Stellen-Posten:** Ein zentraler Umbau auf `Card`
lohnt sich m. E. erst, wenn sich die Kartensprache das nächste Mal ÄNDERT —
heute wäre es Risiko ohne sichtbaren Gewinn (bestätigt die bestehende
Zurückstellung). Neue Arbeit sollte aber ab sofort `Card`/`cardClass` nehmen,
sonst wächst der Posten weiter.

**Ehrlichkeits-Regeln der Leiste** (gegen das Muster „Zahlen, die lügen"):
kein „Heim/Auswärts" (trägt das Datenmodell nicht), Beleg-Status aus
`matchVerification` direkt neben dem Ergebnis, Ergebnisse ohne Punktestand
(offener Mismatch) erscheinen nicht als Zahl, ohne Team/Spiele erscheint die
Leiste gar nicht.

## Bewusst NICHT gemacht — und warum

- **`components/posts/*` (PostCard, RichText, Embeds, ~1000 Zeilen) nicht
  angefasst** außer Composer: Die Beitragskarten sind bereits in der neuen
  Design-Sprache und funktional unauffällig. Umbau wäre Umbau um des Umbaus
  willen.
- **Kein „X neue Beiträge seit deinem letzten Besuch"-Zähler:** Es gibt kein
  gespeichertes „zuletzt gesehen"-Datum. Jede daraus gebaute Zahl wäre geraten
  — exakt das Muster aus der Nacht. Wenn gewünscht: eigenes Feld + eigener
  Auftrag.
- **Keine Benachrichtigungs-Zusammenfassung im Kopf:** Die Glocke trägt das
  bereits (inkl. „Deine Zahlen stehen" seit `c4dd91d`); eine zweite Fläche
  wäre Doppelanzeige.
- **Widgets nicht entfernt:** Top-Teams/Transfers/News haben Publikum und
  tragen Ronjas K-Verlinkungen (u. a. einziger `/rangliste`-Zugang neben der
  Nav). Sie sind mobil nur nachrangig geordnet.
- **Kein projektweiter `Card`-Rollout** (ausdrücklich eigener Auftrag).
- **Escape schließt das Suchfenster nicht** (Tobias, klein): Bestand in der
  öffentlichen `Navbar`, nicht Teil dieser Seite — offen gelassen.
- **`AuthShell.js` Zeile 93/97:** Die Rechtsverweise dort verlinken mit
  **Backslash** (`href="\datenschutz"`) — Browser normalisieren das zwar,
  sauber ist es nicht. Nicht von mir angefasst (fremder, heutiger Strang) —
  als Befund gemeldet.

## Verifiziert (Playwright, Chromium, Dev-Server `:3005`)

390×844 und 1280×900, Konten `max@test.de` (Team) und `sven.adler@test.de`
(vereinslos), Vorher/Nachher via `git stash` gegen denselben Server.
Belege: `tmp/newsfeed-shots/`, Skripte `tmp/newsfeed-umbau-shots.mjs`,
`tmp/newsfeed-verhalten.mjs`.

- h1/Footer-Links/`<main>`: vorher 0/0/mobil-nein → nachher überall da.
- Kein horizontaler Überlauf, keine Konsolenfehler (alle 8 Läufe).
- Spieltag-Leiste: bei Max da (2 Links, Klick navigiert auf `/match/…`),
  bei Sven korrekt abwesend.
- Spiele-Widget öffnet ohne zweiten `my-matches`-Abruf (2 Abrufe beim Laden
  sind der React-StrictMode-Doppellauf im Dev-Modus, danach 0 weitere).
- Composer: Aufklappen setzt Fokus ins Textfeld, Hinweise erscheinen.

## Nicht geprüft — ehrlich

- **`npm run build` + Playwright-Suite + Production-Runtime**: bewusst den
  Deploy-Gates überlassen (Patrick) — ein fremder `next start` hielt `.next`;
  mein 4-Sekunden-Fehlstart eines Dev-Servers hat dessen API gebrochen
  (Prozess-Beenden vom Berechtigungs-Classifier gesperrt; beim nächsten
  `npm run build && npm start` bzw. Neustart erledigt). **Vor dem Gate `.next`
  löschen** — es enthält jetzt gemischte Artefakte.
- Echtes Low-End-Android, Screenreader-Durchlauf, `prefers-reduced-motion`
  nur per Code-Durchsicht (keine neue Bewegung eingeführt; `animate-bounce`
  des Nachladers jetzt `motion-reduce:animate-none`, Fortschrittsbalken
  `motion-reduce:transition-none`).
- Der Tour-Auto-Start über der neuen Seite (Dialog-Overlay) — Tour-Logik
  unverändert, aber nicht erneut durchgespielt.

## Kollegen

- **Ronja:** ihr Befund (R3, „Verbindungen statt Funktionen") ist die
  inhaltliche Grundlage der Spieltag-Leiste — nicht erneut beauftragt, ihr
  Dokument lag vor.
- **Nele:** keine neue Copy nötig (nur Mikrotexte in ihrer Tonlage);
  Zielgruppen-Grundlage `docs/ZIELGRUPPEN.md` Z1.
- **Tobias/Kai:** ausdrücklich NICHT vorweggenommen — die beiden Gates fahren
  vor dem Deploy wie immer, mobil zuerst. Befunde L3/L4/L5 sind adressiert
  und dort gegenzuprüfen.
- **Nora:** Der Footer ist ein Verweis, keine Rechtsformulierung — ihre
  Bewertung von L4 bleibt unberührt gültig. Neuer Befund für sie/Patrick:
  Backslash-Hrefs in `AuthShell.js` (s. o.).
