# Gate-Bericht Kai — Anzeigetafel-Runde (23.08.2026)

**Geprüfter Stand:** die UNCOMMITTETEN Änderungen über `907d436` (15 geänderte
Dateien, 8 neue — Diff selbst erzeugt mit `git diff HEAD`, nicht dem
security-review-Skill überlassen). Production-Server auf Port 3000, dessen
`BUILD_ID` gegen den lokalen Build verifiziert (`ip7qWkvW7ojRo_CNSOybn`,
Zombie-Sperre-Muster). Volle Suite lief vor diesem Gate: 365 grün / 0 rot /
1 übersprungen; `design-audit -- --check` von mir erneut gefahren: keine
Abweichung.

## Urteil: **FREIGABEFÄHIG** — keine Auflage, drei Empfehlungen

Kein Blocker. Alles Nutzersichtbare am laufenden Production-Server gemessen,
nicht nur gelesen. Ein neuer Wächter (`anzeigetafel.spec.mjs`, 4 Fälle,
Mutationsmatrix 4/4) liegt fertig bereit und sollte mit dieser Runde
committet werden.

---

## 1. Sicherheits-Prüfung des Diffs

### `app/api/player/last-match/route.js` (neu) — sauber
Was die Route tut: Sie beantwortet für die „Dein letztes Spiel"-Karte des
eigenen Profils die Frage „In welchem Spiel stand ich zuletzt im Box-Score,
und mit welchen Werten?"

- **Einschleusung abgewiesen, am Server gemessen:** `{"$ne":null}`, leere
  Werte, Zeichenmüll und ein Objekt mit `toString` → alle **400 „Ungültige
  Spieler-ID"**. `mongoose.isValidObjectId` steht VOR jedem Datenbankzugriff.
  Eine formal gültige, aber nicht existierende ID → `lastMatch: null`, keine
  Fehlermeldung, kein Leck.
- **Kein Datenleck:** Die Antwort ist vorgerechnet und enthält NUR die Werte
  des angefragten Spielers (points/assists/rebounds), Gegner-Team
  (Name/Slug/Logo) und den Spielstand — alles, was auf der öffentlichen
  `/match/[id]`-Seite ohnehin steht. Der volle `playerStats`-Array mit den
  Werten ALLER Spieler wird zwar aus der DB gelesen, aber **nicht**
  zurückgegeben.
- Öffentlich ohne Anmeldung — konsistent mit `next-match` und mit der
  Kernpositionierung (Box-Scores sind öffentlich).

### `fetchsingleteaminfo`: drei neue Match-Felder — konsistent, kein neues Leck
Die Route liefert jetzt zusätzlich `resultStatus`, `teamAResult`,
`teamBResult` (für die Beleg-Lampe der Spielzeilen). Darin stecken
`submittedBy`-IDs (wer gemeldet hat). **Nachgesehen statt geglaubt:** Die
öffentliche `/api/match/[id]` gibt das KOMPLETTE Match-Dokument ohne
Feldauswahl zurück — dieselben Felder samt `submittedBy` waren dort längst
öffentlich. Es wird also nichts Neues zugänglich, nur an einer zweiten Stelle
dasselbe. Die Roster-/Token-Auswahl der Route (Leck vom 15.08.) ist unberührt.

### `fetchteams`: Liga-Name je Team — eine Abfrage, linear
EINE Zusatzabfrage über die aktiven Ligen, dann ein Map-Aufbau in linearer
Zeit — keine Abfrage je Team, keine Sortierstufe (die 32-MB-Falle aus
Roadmap 26 ist eine Sortiergrenze; hier gibt es nichts zu sortieren).
Gemessen: 28 ms auf der Dev-DB. Bei Prod-Größe (57+ Ligen × 66 Teams) bleibt
das eine Schleife über ein paar tausend Einträge — unkritisch, auch bei
zehnfachem Wachstum. Antwortfelder kontrolliert: `leagueName` kommt dazu,
sonst nichts (`isDemo` weiter dabei).

### Font-Beschaffung
`public/fonts/DSEG7Classic-Bold.woff2`: echter woff2-Header (`wOF2`-Magic
geprüft), 5 KB, SIL-OFL-1.1-Lizenztext liegt daneben.
`scripts/fetch-segment-font.sh` lädt versionsgepinnt (v0.46) aus dem
offiziellen Release, hat `--dry`, bricht bei Fehlern ab. In Ordnung.

## 2. Die Beleg-Lampe — an allen drei Orten gegen die Datenbank gemessen

Die Lampe ist das neue wiederkehrende Beleg-Zeichen. Die eiserne Regel: Sie
rechnet NIE aus rohen Feldern, sondern nur über `lib/matchScore.js` — genau
die Verwechslung, die am 15.08. der Blocker war. Im Code verifiziert
(BelegLampe importiert ausschließlich `beidseitigBelegt` +
`matchVerification`), und am Server in der Wirkung:

| Fläche | Messung | Ergebnis |
|---|---|---|
| `/match/[id]`, beidseitig belegtes Spiel (20.08.) | Lampe + Text | **gefüllt + „Von beiden Teams bestätigt"** ✓ |
| `/match/[id]`, admin-gesetztes Spiel (05.08.) | Lampe + Text | **Umriss + „Ergebnis steht"**, und „Von beiden Teams bestätigt" kommt auf der GANZEN Seite nicht vor ✓ (P6-Regel hält) |
| Teamseite, Spielplan → „Vergangen" (6 Zeilen) | Mini-Lampen | **17.08. + 20.08. gefüllt, die vier Juli/August-Admin-Spiele Umriss** — deckungsgleich mit der DB (je Spiel `beidseitigBelegt` selbst nachgerechnet) ✓ |
| Mini-Lampe (kompakt) | Zugänglichkeit | `title` + `sr-only` tragen den Text, der Kreis selbst ist `aria-hidden` — Zustand hängt nie an der Farbe allein ✓ |
| ErgebnisseTab (Admin) | Code-Prüfung | nutzt `beidseitigBelegt`, Wortlaut „Bestätigt"/„Ergebnis steht" aus dem P6-Gate ✓ |

`beleg-aussage.spec.mjs` ist korrekt nachgezogen: Der Eintrag der Spielseite
wandert auf die Lampe, der ErgebnisseTab steht zusätzlich drauf. Der
Quelltext-Sweep über alle Dateien greift weiter.

## 3. SegmentZahl / Tafel — der größte Verdachtspunkt, aufgeklärt

**Der Verdacht:** Das Zellen-Rendering legt hinter jede Ziffer eine
Geist-„8". `textContent` eines Tafel-Fensters ist damit z. B. **„8878"**
(gemessen am Match-Kopf: Geist „88" + Wert „78"). Ein Test, der Werte über
`textContent` liest, bekäme die Geister mit — falsches Grün oder falsches
Rot.

**Befund: Heute fällt kein Test darauf herein — geprüft, nicht vermutet.**
- `eigene-zahlen.spec.mjs` prüft die **API**, nicht das DOM (steht so als
  Absicht im Dateikopf) — unberührt.
- `spieler-vereinsseiten.spec.mjs` liest `span.font-mono`-Scores im
  Admin-Spielplan und auf der Teamseite — beides sind die Geist-Mono-Fenster
  OHNE SegmentZahl; der Text „78 : 65" ist dort weiterhin zusammenhängend.
- Kein anderer Test liest PPG/Tafel-Werte aus dem DOM.

**Die Falle ist real für JEDEN KÜNFTIGEN Test** — deshalb bewacht der neue
Wächter genau den Vertrag, an dem sie hängt (s. Abschnitt 5), und
dokumentiert im Kommentar: Sollwert-Lesungen gehören auf den
`sr-only`-Knoten.

**Barrierefreiheit, am DOM gemessen (Screenreader-Simulation über
aria-hidden-Filterung):**
- Match-Kopf-Gehäuse, hörbarer Text: **„TB 78 RB 71 Beendet Von beiden Teams
  bestätigt"** — der echte Spielstand, keine einzige Geist-Acht.
- Zellen-Pfad (Teamseite, RANG-Fenster): sichtbar „8"+„2" übereinander,
  `sr-only` = **„2"** — der zugängliche Name ist der nackte Wert. ✓
- Randnotiz: Der Doppelpunkt zwischen den Scores ist `aria-hidden` — ein
  Screenreader hört „78 … 71" ohne Trenner. Durch die Team-Kürzel davor
  eindeutig; kein Handlungsbedarf.

**Einschalt-Moment, am Server gemessen:**
- 150 ms nach Scroll-Ankunft: alle Werte noch Deckkraft 0 → die
  **250-ms-Haltezeit greift** (der 1-px-Beobachter-Frühstart ist draußen).
- Danach: Deckkraft 1, Staffel-Verzögerungen **0 / 60 / 120 ms** je Fenster
  gemessen, Zähler enden exakt auf den API-Sollwerten (17.5 / 2.5 / 4.6 =
  `careerstats`).
- **Reduzierte Bewegung:** Tafel unter der Falz, OHNE Scrollen — alle Werte
  sofort Deckkraft 1. Niemand mit dieser Einstellung sieht je leere Fenster.
- „Genau eine betonte Zahl": Die 4 brand-Elemente in der Bilanz sind die
  **vier Zellen der EINEN PPG** — kein Verstoß gegen den Konzept-Grenzwert.

**Profil sonst:** „Dein letztes Spiel"-Karte erscheint auf dem eigenen Profil
(gemessen), S/N-Kürzel mit der Unentschieden-Schranke aus dem Admin-Spielplan
(Code), `TransferControl` im Steckbrief-Reiter mit echtem
`inputClassSm`-Token (Felder 14+15 der grauen Familie erledigt — und die
Variable heißt nicht mehr wie das Token, die Zähler-Blindstelle wird hier
also nicht neu gestellt).

**Radien-Entscheid:** Im gebauten CSS live nachgemessen: `rounded-sm` = 2 px,
`rounded-md` = 4 px; `rounded-full` (Lampen, Avatare) unberührt rund.
Liga-Zeile auf den `/teams`-Karten sichtbar.

## 4. Drei Empfehlungen (keine Auflagen)

1. **ErgebnisseTab baut die Lampe von Hand nach** statt `BelegLampe`
   einzusetzen — ein kopierter `aria-hidden`-Kreis mit denselben Klassen.
   Nachvollziehbar (der P6-Wortlaut „Bestätigt" ist kürzer als der
   Lampen-Text), aber es ist dieselbe Fläche auf zwei Wegen: Wer die
   Lampen-Form ändert, muss an diese Stelle denken, und nichts erinnert ihn.
   Dazu vorbestehend: „Ergebnis steht" erscheint dort in Grün
   (`text-signal-ok`) neben einer bewusst NICHT gefüllten Lampe — gemischte
   Signale. → Vivien/Kai, nächste Runde.
2. **Beim Bau des Wächters gefunden:** Die „Dein letztes Spiel"-Karte lädt
   asynchron OBERHALB der Karriere-Bilanz nach und schiebt die Tafel nach
   unten — die Haltezeit bricht dann korrekt ab (genau ihr Zweck). Für
   Menschen harmlos (sie scrollen nach), für automatisierte Scrolls eine
   Falle; der Wächter scrollt deshalb in der Poll-Schleife nach. Ein
   reservierter Ladeplatz für die Karte würde den Sprung nehmen → Vivien,
   niedrig.
3. **StrictMode-Randnotiz:** Der Staffel-Zähler in `Tafel.Fenster` zieht
   seinen Platz im `useState`-Initializer — im Dev-Modus mit
   React-StrictMode-Doppelaufruf entstünden Lücken in der Staffel (0/120/240
   statt 0/60/120). Production ist sauber (gemessen: 0/60/120); rein
   kosmetisch, nur falls je StrictMode aktiviert wird.

## 5. Neuer Wächter: `anzeigetafel.spec.mjs` — 4 Fälle, Mutationsmatrix 4/4

Gebaut und belegt in einem **isolierten Worktree** (Stand = `907d436` + der
uncommittete Diff + die neuen Dateien, eigener Build, Port 3210 — der
Gate-Server auf 3000 wurde nie angefasst). Liegt zur Übernahme bereit:
`<scratchpad>/anzeigetafel.spec.mjs` → nach `tests/e2e/` kopieren und mit
dieser Runde committen.

Drei Zusicherungen, die sonst NIEMAND bewacht:

1. **Die Lampe folgt dem Prädikat, nicht dem `resultStatus`** — DOM der
   Teamseiten-Zeilen gegen `beidseitigBelegt()` je Spiel aus der API, in
   BEIDE Richtungen (eine nie leuchtende Lampe wäre sonst genauso grün wie
   eine immer leuchtende). Ehrlichkeitsschranke: Ohne beide Beleglagen in der
   Dev-DB erklärt sich der Fall für wertlos statt bestanden. Fängt auch den
   Fall, dass die API-Felder wieder verschwinden (dann wäre alles Umriss).
2. **Ein Screenreader hört den echten Spielstand, nie die Geist-Achten** —
   jede Segment-Kulisse muss unter `aria-hidden` stehen, und der hörbare
   Text des Gehäuses muss beide echten Scores enthalten.
3. **Kein Wert bleibt dauerhaft unsichtbar** (2 Fälle) — der ganze
   Einschalt-Apparat startet jede Zahl bei Deckkraft 0; fällt das
   „an"-Signal aus, steht für immer ein leeres Fenster, und nichts wirft
   einen Fehler. Gemessen in der Währung des Defekts (gerenderte Deckkraft),
   normal UND bei reduzierter Bewegung.

**Jede Zusicherung einzeln rot gesehen** (Gegenproben nacheinander, nie
gebündelt — Methodik-Lehre vom 22.08.):

| Mutation | Erwartung | Ergebnis |
|---|---|---|
| M1: Lampe rechnet `v.state === "confirmed"` statt Prädikat (der historische Blocker) | Fall 1 rot | **rot** ✓ |
| M2: `aria-hidden` vom Geist entfernt | Fall 2 rot | **rot** ✓ |
| M3: reduced-motion-Weiche aus der Tafel entfernt | Fall 4 rot | **rot** ✓ |
| M4: Einschalt-Signal feuert nie (`setAn` entfernt) | Fall 3 rot | **rot** ✓ |

Unmutierter Kontroll-Lauf danach: **4/4 grün**. Worktree nach Byte-Vergleich
der zurückgesetzten Dateien entfernt; Hauptbaum vor und nach dem Gate
identisch (23 Status-Einträge, gleicher Diff-Stat).

## 6. Bewusst NICHT gebaut / offen gelassen

- **Kein Wächter für die Radien-Token** — `design-audit` und die Baseline
  tragen die Absicht; ein CSS-Werte-Wächter würde eine Eigentümer-Entscheidung
  zementieren, die Patrick jederzeit zurückdrehen darf.
- **Kein DOM-Wächter für den ErgebnisseTab** (Admin-Login-Fluss) — die
  Quelltext-Seite deckt `beleg-aussage.spec.mjs` ab; ein DOM-Fall lohnt erst,
  wenn Empfehlung 1 entschieden ist (sonst bewacht er die Duplikat-Form).
- Die Eignung des 5-KB-woff2 als exakte Kopie des Releases habe ich nicht
  gegen das Original-Zip geprüft (kein Download im Gate) — Magic-Bytes und
  Lizenz stimmen, das Skript ist reproduzierbar.

**Einbezogen:** Tobias' Browser-Urteil ersetzt dieses Gate nicht — die
Gestaltungsfragen (Empfehlung 1, Ladeplatz) sind seins/Viviens Terrain.
Ronjas M1–M3 sind die fachliche Grundlage der geprüften Karten.
