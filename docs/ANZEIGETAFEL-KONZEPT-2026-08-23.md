# Die echte Anzeigetafel als Stilmittel — Konzept für Spieler- und Vereinsseiten

**Datum:** 23.08.2026 · **Autorin:** Vivien (design-spezialistin) · **Auftrag:** Patrick
**Status:** KONZEPT, kein Code. Umsetzbar ohne Rückfragen durch eine andere Session.

> Patricks Auftrag wörtlich sinngemäß: *„Ich sehe leider keine wirkliche Veränderung
> bei den Spieler- und Team-Seiten. Ich will so einen Grad an Innovation und Design
> wie auf der Startseite. Falls es ins Design passt, würde ich gerne an REALE
> BASKETBALLANZEIGETAFELN angelehnte Elemente als stilistisches Mittel nutzen."*

---

## 0. Die Idee in fünf Sätzen

1. Die Startseite ist seit August der **Blick auf den Hallenboden** — ein maßstabs­getreues
   FIBA-Feld in Draufsicht, mit Außenlinie und gespiegeltem Feldende; die Spieler- und
   Vereinsseiten bekommen jetzt die **zweite Blickrichtung derselben Halle: den Blick
   hoch zur Anzeigetafel**.
2. Eine echte Hallentafel ist ein **schwarzes Gehäuse mit fest eingelassenen
   Ziffernfenstern**: Jedes Fenster hat einen aufgedruckten festen Namen (SCORE, PERIOD,
   FOULS), die Ziffern leuchten hinter Glas, ein leeres Fenster zeigt unbeleuchtete
   Segmente statt gar nichts — genau diese Anatomie wird zitiert: Gehäusefläche,
   Ziffernfenster, Beschriftungsplaketten, Segment-Ziffern, eine Lampe.
3. Die Lampe ist der inhaltliche Kern: Auf einer echten Tafel zeigt eine Leuchte den
   **Bonus** an — bei uns leuchtet sie, wenn ein Ergebnis **beidseitig belegt** ist.
   Damit wird die Kernpositionierung („belegbare Fakten") zum wiederkehrenden
   visuellen Zeichen statt zu einem Textbaustein.
4. Es wird **genau EINE Tafel je Seite** gebaut — die Fläche, für die man die Seite
   besucht (Match-Kopf, Karriere-Bilanz, Liga-Platzierung) — alles andere bleibt die
   ruhige bestehende Sprache; eine Tafel wirkt durch den Kontrast zur dunklen Halle
   drumherum, zwanzig Tafeln sind eine Messehalle.
5. Alle Registerregeln gelten weiter: Bewegung heißt **Ankunft, nie Reise**, das eine
   Orange wird nicht inflationiert, keine Verläufe/Schatten/Glow, keine erfundene Zahl.

### Was es NICHT ist (Abgrenzung zu Kostüm und Kitsch)

- **Kein Skeuomorphismus.** Keine gezeichneten Schrauben, kein Plastikglanz, keine
  Vignette, kein „LED-Glow" (Bloom/Schein steht auf der Verbotsliste und bleibt dort).
  Zitiert wird die **Anatomie** der Tafel (Fenster, Plaketten, Segmente, Lampe), nicht
  ihre Materialoberfläche.
- **Keine Dauerbeschallung.** Die Segment-Ästhetik ist auf die Ziffernfenster der einen
  Tafel je Seite beschränkt. Tabellen, Topscorer-Listen, Fließtext behalten Geist Mono
  `tabular-nums` — eine Tabelle in Segment-Schrift ist unlesbar und genau das Kostüm,
  das `VISUELLE-RICHTUNG-2026-08-12.md` zu Recht verboten hat (dazu Abschnitt 8,
  Entscheidungspunkt 1).
- **Keine erfundene Uhr.** Eine Anzeigetafel hat eine Spieluhr und eine Shot-Clock —
  wir haben keine Live-Erfassung. Es wird **keine tickende Uhr, kein Countdown, kein
  „LIVE"** gebaut. Eine Uhr ohne echtes Spiel wäre eine erfundene Zahl
  (`docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`).
- **Kein HOME : GUEST.** Die wörtlichste Scoreboard-Beschriftung ist bei uns verboten:
  `teamA`/`teamB` trägt die Bedeutung Heim/Auswärts **nicht** (Ehrlichkeitsregel im Kopf
  von `components/feed/Anzeigetafel.js`). Die Plaketten tragen stattdessen die
  **Team-Kürzel** (wie „BB : PP" auf `/match/[id]` heute schon sinngemäß) bzw. im
  Admin „DEIN TEAM : GEGNER" (Konvention aus `SpielplanTab.js` seit `248d5e3`).

---

## 1. Trend-Sweep (Stufe L) — Referenzen und was übernommen wird

**Stufe L, begründet:** Wow-Anspruch auf Kernflächen plus ein neuer Bildgegenstand
(reale Tafel-Anatomie), der in keinem bisherigen Sweep erhoben wurde. Register vor
Suche hat gegriffen: Formensprache, Motion-Regeln und der Befund „Sorte A versagt bei
Gebrauchsflächen" wurden übernommen; **gesucht wurde nur das Delta „was zeigt eine
echte Tafel wirklich"** — über Herstellerdaten und Regelwerk (Sorte B/C), nicht über
Galerien. *(Die Inspirations-Notiz ist auftragsgemäß in dieses eine Dokument
integriert statt als eigene Datei.)*

**Suchschnitt:** Amateur-Basketball-Community, Datenseiten mit täglicher Nutzung,
mobil zuerst, Zielgruppen 1–4 (Spieler/Team-Admins/Vereinslose/Vereinsverantwortliche).

| Referenz | Sorte | Was daran stark ist | Übernommen | Bewusst nicht |
|---|---|---|---|---|
| **Daktronics BB-2101 Produktdaten** (daktronics.com, Spezifikations-PDF dd2481847) | B | Die komplette Anatomie einer realen Hallentafel in Zahlen: Uhr bis 99:59, HOME/GUEST bis 199, PERIOD bis 9, Bonus-Leuchten, Ballbesitz-Pfeile. **Ziffern-Hierarchie über Größe:** Perioden-Ziffer 10", alle anderen 13". **Zwei Leuchtfarben nach Rolle** (Uhr/Periode/Bonus bernstein, Score rot). Schwarzes Aluminium-Gehäuse. | Gehäuse + fest beschriftete Fenster + Lampe als Bauprinzip; Größen-Hierarchie nach Wichtigkeit, nicht nach Kategorie; feste Fensterbreiten (eine Tafel reflowt nie) | Die wörtlichen Leuchtfarben Rot/Bernstein — unser System hat EIN Orange und gedeckte Signalfarben; Rot ist bei uns `signal-error`, nicht „Score" |
| **FIBA Official Rules 2026, Equipment-Anhang** (assets.fiba.basketball, …equipment-v1-0.pdf) | C | Amtliche Anforderungen: Anzeige in *„bright contrasting colours"* auf **blendfreiem Grund**; Uhr mm:ss, in der letzten Minute ss:Zehntel; **Shot-Clock-Ziffern (30 cm) größer als Spieluhr-Ziffern (14 cm)** — die dringlichste Zahl ist die größte | Blendfrei = kein Glow ist sogar amtlich; „die dringlichste Zahl ist die größte" als Hierarchieregel (auf dem Profil sind das die Pro-Spiel-Werte, nicht die Summen) | ss:Zehntel-Mechanik — wir haben keine Uhr |
| **DSEG-Fontfamilie** (keshikan.net, github.com/keshikan/DSEG) | C | Echte 7-/14-Segment-Geometrie als Font, **SIL OFL 1.1 (kommerziell frei), woff2 im Paket** — passt exakt in unsere Selbsthosting-Infrastruktur (`lib/fonts.js`, `public/fonts/`); Ghost-Effekt („888" unbeleuchtet dahinter) ist mit dem Font trivial, weil jede Ziffer dieselbe Breite belegt | DSEG7 Classic Bold als Fenster-Schrift (Empfehlung, s. Entscheidungspunkt 1) | Die 14-Segment-Buchstaben für Wörter — Beschriftungen bleiben Geist Mono; Segment-Buchstaben sind das Kostüm-Kippmoment |
| **note.com/amotdesign Scoreboard-UI** (aus Register, 15.08.) | B | *„What to show first, rather than what to cut"*; ein Statuswechsel verändert nur seinen Teilbereich | Feste Register, in denen sich nur der Wert ändert — nie das Layout | — |
| **Eigene Messung am Live-Stand** (Playwright-Screenshots, 23.08., Liste in Abschnitt 9) | C | Der Ist-Zustand ist gut gebaut, aber überall dieselbe Karte: navy-800-Fläche, 1px-Rahmen, Überschrift, Inhalt. Die PPG/APG/RPG-Kacheln des Profils benutzen **bereits** das Fenster-Prinzip (navy-950 in navy-800), ohne es zu wissen | Das Fenster-Prinzip wird formalisiert statt neu erfunden | — |

**Gegenprobe (Pflicht bei L):** Was machen in dieser Branche alle gleich? Sport-Apps
(FuPa, kicker, MaxPreps) zeigen Ergebnisse als **Textzeilen in Listen**; Sport-Marken-
Sites (Awwwards-Kategorie) leben von Foto/3D-Material, das wir nicht haben. **Keiner
baut die physische Tafel als Interface-Metapher** — das ist die Lücke, die Patricks
Idee besetzt und die mit unserem Null-Bildbudget sogar erreichbar ist (eine Tafel ist
Geometrie + Typografie, kein Foto). Mode vs. Handwerk: Segment-Ziffern sind als
*Deko-Trend* Mode (Retro-Digital-Ästhetik), als *Zitat einer realen Sportmaschine* auf
einer Basketball-Plattform aber inhaltlich begründet — die Begründung trägt nur,
solange sie an Spielstands-Kontexte gebunden bleibt.

**Nicht geprüft, ehrlich benannt:** Kein Foto einer echten Tafel wurde angesehen
(Bildquellen liefern hier Text); die Anatomie stammt aus Hersteller-Spezifikation und
Regelwerk — für Maße und Register verlässlicher als jedes Foto, für die *Anmutung*
(wie warm leuchtet bernstein wirklich) keine Aussage. Die Anmutung entscheidet bei uns
ohnehin das Token-System, nicht die Vorlage.

---

## 2. Das Bausystem: Gehäuse, Fenster, Plakette, Segment-Ziffer, Lampe

### 2.1 Flächenlogik (nur bestehende Tokens, keine neue Farbe)

Eine Tafel hat drei Flächenstufen, alle aus dem Bestand:

| Rolle | Token | Heute schon so im Einsatz |
|---|---|---|
| **Gehäuse** (der Kasten) | `bg-navy-800` + `border border-navy-600` | jede Panel-Karte |
| **Kopfleiste des Gehäuses** (wo Titel + Bedienung sitzen) | `bg-navy-900` | Kopfzeile der Nächstes-Spiel-Karte (`PlayerProfileView.js:113`) |
| **Ziffernfenster** (das „Glas", hinter dem die Ziffern leuchten) | `bg-navy-950 rounded-sm` | die PPG/APG/RPG-Kacheln (`PlayerProfileView.js:697`) |

Das ist der entscheidende Griff: **Das Fenster-Prinzip existiert im Code bereits** —
navy-950-Flächen in navy-800-Karten. Neu ist nur, dass es benannt, systematisiert und
mit den übrigen Tafel-Bauteilen kombiniert wird. Tiefe entsteht weiter aus
Flächenstufe + 1px-Haarlinie, exakt wie die Spezifikation es verlangt — eine Tafel
braucht weder Schatten noch Glow, das Fenster IST die Tiefe.

Zusatzdetail mit Wirkung: Das Fenster bekommt **innen** eine 1px-Haarlinie
(`ring-1 ring-inset ring-navy-600/40`) — die Glaskante. Das ist der Unterschied
zwischen „dunkler Kachel" (heute) und „eingelassenem Fenster" (Tafel).

### 2.2 Segment-Ziffern (`SegmentZahl`)

**Empfehlung: echter Segment-Font (DSEG7 Classic Bold), kein CSS-/SVG-Eigenbau.**

| Weg | Aufwand | Urteil |
|---|---|---|
| **DSEG7 Classic Bold, selbst gehostet** | **klein** — 1 woff2 nach `public/fonts/`, ein `next/font/local`-Eintrag in `lib/fonts.js` (Muster Geist), Tailwind-Familie `font-segment`. OFL 1.1, kommerziell frei, keine CDN-Abhängigkeit | ✅ Echte Segment-Geometrie inkl. Doppelpunkt, Punkt, Minus; alle Ziffern gleich breit (kein Zittern beim CountUp); der Ghost-Effekt ist eine zweite Textebene aus „8"-Glyphen — deckungsgleich, weil selbe Metrik |
| CSS-Balken je Segment (7 divs je Ziffer) | mittel–groß | ❌ Viel Code, eigene Glyphen-Logik, Accessibility-Sonderweg — für null sichtbaren Mehrwert gegenüber dem Font |
| SVG-Ziffern | mittel | ❌ Wie CSS-Weg, plus eigene Breitenverwaltung |
| Nur Geist Mono größer | null | ❌ Genau der Zustand, den Patrick als „keine wirkliche Veränderung" benennt — Geist Mono ist eine Bildschirmschrift, kein Tafel-Zitat |

**Der Ghost-Effekt (das authentischste Detail):** Auf einer echten LED-Tafel sieht man
die unbeleuchteten Segmente schwach — vor der „1" steht eine dunkle „8". Umsetzung:
hinter dem Wert liegt eine `aria-hidden`-Ebene aus „8"-Glyphen gleicher Stellenzahl in
`text-paper-50` mit sehr geringer Deckkraft. **Grenzwert:** Der Ghost muss unter der
projekteigenen 2:1-Zeichnungsgrenze bleiben, damit er als Tonwert liest, nicht als
Inhalt — bei 6 % Deckkraft von `#F5F7FA` über `#0B1220` liegt der rechnerische
Kontrast bei ≈ 1,25 : 1 ✅ (beim Bau am gerenderten Bild nachmessen, nicht nur rechnen).
Der Ghost ist Textur, nie Information: Ein leeres Fenster zeigt zusätzlich einen
Gedankenstrich in `text-mist-600` — nie eine Ghost-„0", die als echte Null gelesen
werden könnte.

**Ziffernfarben (kein neues Rot/Bernstein):**
- Standard: `text-paper-50` auf Fenster `navy-950` → **16,16 : 1** (dokumentierter Wert) ✅
- Die EINE hervorgehobene Zahl der Tafel: `text-brand-500` auf `navy-950` → **6,88 : 1**
  (dieselbe Paarung wie Primärbutton, dokumentiert) ✅ — weit über den 3 : 1, die für
  Ziffern dieser Größe (≥ 24 px bold) gelten, und über AA 4,5 : 1.
- Status niemals über Ziffernfarbe allein (Farbfehlsicht): Sieg/Niederlage trägt
  weiterhin das S/N-Kürzel bzw. die Helligkeitsstufe `paper-50`/`mist-400` wie heute
  auf `/match/[id]`.

**Größenleiter** (mit `clamp`, nie mit Fensterbreiten-Sprüngen):
- Match-Kopf-Spielstand: `clamp(2.75rem, 9vw, 4.5rem)`
- Tafel-Hauptwert (PPG, Platzierung): `clamp(2rem, 6vw, 3rem)`
- Tafel-Nebenwerte (Summen): `clamp(1.5rem, 4.5vw, 2rem)`
- **Unter 1.25rem gibt es keine Segment-Ziffer** — dort Geist Mono. Segment-Schrift
  unter dieser Größe wird zum unlesbaren Muster (harte Grenze im Primitiv erzwingen).

### 2.3 Plaketten (Fenster-Beschriftung)

Auf der Tafel sind Beschriftungen **aufs Gehäuse gedruckt**, nicht Teil der Anzeige.
Übersetzung: Labels stehen IMMER außerhalb des navy-950-Fensters auf der
navy-800/900-Gehäusefläche, in der bestehenden Plaketten-Typo
(`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400` —
wörtlich die `LABEL`-Konstante aus `components/feed/Anzeigetafel.js:75`). Kontrast
mist-400 auf navy-800: **6,54 : 1** (in `docs/NEWSFEED-DESKTOP-2026-08-15.md`-Familie
dokumentierte Paarung; beim Bau gegenmessen) ✅.

### 2.4 Die Beleg-Lampe (`BelegLampe`)

Das Bonus-Lampen-Zitat, gefüllt mit unserem Inhalt. Drei Zustände, Quelle ist
**ausschließlich** `matchVerification`/`beidseitigBelegt()` aus `lib/matchScore.js`
(die EINE Quelle für jede „bestätigt"-Aussage):

| Zustand | Form | Farbe | Text daneben (Pflicht, nie Farbe allein) |
|---|---|---|---|
| beidseitig belegt | gefüllter Kreis 8 px | `bg-signal-ok` (5,86 : 1 auf navy-950, dokumentiert) | „Belegt" |
| Ergebnis steht (Admin-gesetzt o. einseitig) | Kreis-Umriss 8 px, `border-mist-600` | — | „Ergebnis steht" bzw. „vorläufig" (Wortlaute aus P6/Nele unverändert übernehmen) |
| strittig | Kreis-Umriss | `border-signal-wait` | „strittig" |

Die Lampe ersetzt **keine** bestehenden Status-Texte, sie bündelt sie in eine
wiedererkennbare Form. Wichtig: Sie ist ein **neues wiederkehrendes Zeichen** der
Formensprache — das braucht Patricks Freigabe (Entscheidungspunkt 3), weil die
Spezifikation Signatur-Elemente bewusst limitiert.

### 2.5 Bewegungsregeln (Ankunft, nie Reise — Registerregel gilt unverändert)

- **Einschalt-Moment:** Beim ersten Erscheinen der Tafel im Viewport blenden die
  Ziffern von 0 auf volle Deckkraft (≤ 300 ms, Fenster gestaffelt ≤ 80 ms Versatz,
  maximal eine Staffel je Tafel). Der Ghost steht sofort — das Gehäuse ist „an",
  die Werte kommen. Umsetzung über `useInView` wie `SplitFlap`/`Reveal`.
- **CountUp bleibt** für Summen/Schnitte (existiert, `components/ui/CountUp.js`).
- **SplitFlap bleibt auf genau EINER Stelle je Seite** (bestehende Regel im
  Komponentenkopf) — auf `/match/[id]` ist das der Spielstand (heute schon so).
- **Datenwechsel** (Saison-Select der Karriere-Bilanz): Werte tauschen ohne
  Animation. Ein zweiter Flap wäre Regelbruch, ein CountUp von altem zu neuem Wert
  suggeriert eine Entwicklung, die es nicht gibt.
- **`prefers-reduced-motion`:** fertig eingeschaltete Tafel, alle Werte stehen
  (Muster `SplitFlap`/`CountUp`: `useInView` meldet sofort true, `motion-reduce:animate-none`).
  Kein Zustand, in dem etwas unsichtbar bleibt.
- **Nichts hängt am Scroll.** Keine scroll-gebundene Choreografie auf Gebrauchsflächen.

### 2.6 Grenzwerte (die Regeln, die das Kostüm verhindern)

1. **Eine Tafel je Seite** — die Fläche, für die man die Seite besucht. Alle übrigen
   Karten bleiben unverändert.
2. **Segment-Ziffern nur in Fenstern, Fenster nur in der Tafel.** Nie in Tabellen,
   Listen, Fließtext, Navigation. (Im Primitiv erzwingen: `SegmentZahl` rendert nur
   innerhalb des `Tafel`-Kontexts, sonst wirft es im Dev-Modus.)
3. **Keine Segment-Buchstaben.** Wörter setzt Geist Mono/Big Shoulders.
4. **Brand-Orange auf maximal EINER Zahl je Tafel** (dieselbe Logik wie „aktive
   Stat-Zahl" der Spezifikation).
5. **Ghost ≤ 2 : 1 gegen den Fenstergrund** (Tonwert-Grenze), `aria-hidden`,
   nie als Nullwert lesbar.
6. **Leeres Fenster = „—" + erklärender Satz.** Die bestehenden ehrlichen
   Leerzustands-Texte („Noch keine Spiele erfasst … Zählt, sobald…") bleiben wörtlich
   erhalten; die Tafel ersetzt keine Erklärung durch Ästhetik.
7. **Keine Zahl wird durch die Tafel erfunden oder umgedeutet.** Quelle jeder Zahl
   bleibt der heutige Endpunkt; die Tafel ist reine Darstellung.

---

## 3. Neue Primitive (API-Skizze)

Ablage in `components/ui/`, Konvention wie Button/Tabs/Card. Dazu ein Font-Eintrag.

```js
// lib/fonts.js — Ergänzung (Muster: bestehende next/font/local-Einträge)
// public/fonts/DSEG7Classic-Bold.woff2 (OFL 1.1; Lizenzdatei mit ablegen,
// scripts/fetch-fonts.sh um den Download erweitern, --dry wie gehabt)
export const segment = localFont({
  src: "../public/fonts/DSEG7Classic-Bold.woff2",
  variable: "--font-segment",
  display: "swap",
  adjustFontFallback: false, // Segment-Metrik hat kein sinnvolles System-Fallback
  fallback: ["ui-monospace", "monospace"], // Fallback ist LESBAR, nur ohne Segment-Optik
});
// tailwind.config.js: fontFamily.segment = ["var(--font-segment)", "monospace"]
```

```jsx
// components/ui/Tafel.js — das Gehäuse
<Tafel
  titel="Karriere-Bilanz"          // Kopfleiste (navy-900), Big Shoulders/Bestand
  akzent                            // optional: 2px brand-Oberkante (nur wenn die
                                    // Tafel die EINE hervorgehobene Karte der Seite ist)
  aktion={<select…/>}               // rechts in der Kopfleiste (Saison-Wahl etc.)
>
  <Tafel.Zeile>                     // ein Register: horizontale Fenstergruppe,
                                    // mobil 2-spaltig umbrechend (grid-cols-2 sm:grid-cols-4)
    <Tafel.Fenster label="Spiele" wert={19} />
    <Tafel.Fenster label="Punkte" wert={249} />
  </Tafel.Zeile>
</Tafel>

// Tafel.Fenster: Plakette (LABEL-Typo, auf Gehäusefläche) + navy-950-Fenster mit
// ring-inset-Glaskante + SegmentZahl. Props:
//   label (Pflicht) · wert (Zahl|null → null zeigt „—") · stellen (Ghost-Breite,
//   Default = String(wert).length) · dezimalen (0|1) · betont (bool → brand-500,
//   max. 1 je Tafel — im Dev-Modus gezählt) · countUp (bool)
```

```jsx
// components/ui/SegmentZahl.js — nur von Tafel.Fenster benutzt
<SegmentZahl wert={13.1} dezimalen={1} stellen={3} groesse="haupt" betont />
// Rendert zwei deckungsgleiche Ebenen:
//   <span aria-hidden class="text-paper-50/[0.06]">88.8</span>   (Ghost)
//   <span class="font-segment tabular-nums …">13.1</span>
// Barrierefreiheit: Der zugängliche Name ist der nackte Zahlwert; die Ghost-Ebene
// ist aria-hidden; dezimalen über toLocaleString("de-DE") — DSEG hat Punkt UND
// Komma-Glyphe zu prüfen (s. Abschnitt 9, „vermutet").
```

```jsx
// components/ui/BelegLampe.js
<BelegLampe verification={matchVerification(match)} />
// Kreis 8px + Textlabel, Zustände s. 2.4. Quelle IMMER lib/matchScore.js —
// die Komponente nimmt das Verification-Objekt entgegen, nie rohe Felder.
```

**Wartungsfolgen, im selben Zug:** `scripts/design-audit.mjs` zählt neue Primitive
mit (BASELINE + dieser Absatz in CLAUDE.md nachziehen — Pflicht laut Abschnitt-0-Regel).
Tailwind liest `lib/` seit Roadmap 36: Klassennamen in `lib/fonts.js`-Kommentaren
erzeugen CSS — Kommentare entsprechend formulieren.

---

## 4. Die Flächen im Einzelnen

### Fläche A — `/match/[id]`-Kopf (heute am nächsten dran, kleinster Schritt)

**Am Bild geprüft (Desktop + mobil):** Der Kopf hat bereits SplitFlap-Mono-Ziffern
„120 : 95" mit orangem Unterstrich, Liga-Eyebrow, Status-Pille „Beendet" — gute
Grundlage, aber die Ziffern stehen frei auf der Seitenfläche; es ist eine Überschrift,
keine Tafel.

**Entwurf:**
- Der Spielstand wandert in eine `Tafel` ohne Titel: zwei Fenster (je Team) mit
  Segment-Ziffern in Spielstand-Größe, Doppelpunkt als Gehäusetext dazwischen,
  **Plaketten = Team-Kürzel** (2–3 Buchstaben, wie die Avatar-Initialen; volle
  Teamnamen + Avatare bleiben wie heute daneben/darunter — das Kürzel ist Zitat,
  nicht Ersatz der Namen).
- Unter dem Stand: ein schmales Register `PERIODE — beendet · Datum · Ort` in
  Plaketten-Typo (keine erfundene Perioden-Zahl: wir kennen keine Viertelstände,
  also steht dort der **Spielstatus**, nicht „Q4").
- **Die Beleg-Lampe** sitzt rechts in diesem Register — der Ort, an dem heute die
  Status-Pille hängt. `/match/[id]` ist die Seite, deren Beleg-Abzeichen die ganze
  Plattform referenziert („steht am jeweiligen Spiel") — hier gehört die Lampe zuerst hin.
- Sieg/Niederlage weiter über Helligkeit (`text-paper-50` vs `text-mist-400` — heute
  schon so gebaut) plus bestehende Semantik; die Mismatch-Regel bleibt wörtlich
  (bei strittigem Ergebnis Zahl ohne Urteilswort).
- SplitFlap bleibt an dieser einen Stelle. Einschalt-Moment entfällt hier (der Flap
  IST die Ankunft; zwei Ankunfts-Animationen auf derselben Zahl sind eine zu viel).

**Bewegung:** wie heute (Flap bei Ankunft, reduced-motion: steht sofort).
**Aufwand:** klein (Primitive vorausgesetzt). **Risiko:** klein — öffentliche Seite,
bestehende Wächter prüfen den Feed-Beleg-Status, nicht die Kopf-Optik.

### Fläche B — Karriere-Bilanz des Spielerprofils (`PlayerProfileView.js`, Stats-Tab)

**Am Bild geprüft:** 4 Summen mit Unterstrich (19 · 249 · 159 · 58) + 3 navy-950-Kacheln
(13.1 PPG · 8.4 APG · 3.1 RPG). Solide, aber es liest sich als Formular-Zusammenfassung,
nicht als das, wofür ein Spieler wiederkommt.

**Entwurf — die SectionCard „Karriere-Bilanz" wird die Tafel dieser Seite:**
- `Tafel` mit Titel „Karriere-Bilanz", `aktion` = bestehendes Saison-Select,
  **ohne** `akzent` (die brand-Oberkante der Seite trägt die Nächstes-Spiel-Karte —
  bestehende „eine hervorgehobene Karte"-Regel bleibt unangetastet).
- **Zeile 1 (Hauptregister, Shot-Clock-Prinzip):** PPG · APG · RPG als große Fenster —
  die Scouting-Zahlen sind die dringlichsten und darum die größten (FIBA-Prinzip:
  Shot-Clock 30 cm > Spieluhr 14 cm). PPG als die eine betonte Zahl (`betont`,
  brand-500) — sie ist heute schon die Topscorer-Währung der Plattform.
- **Zeile 2 (Nebenregister):** Spiele · Punkte · Assists · Rebounds als kleinere
  Fenster (mobil 2×2).
- Der Herkunfts-Satz („Diese Zahlen stammen aus eingetragenen Spielen — keine
  Selbstauskunft…") bleibt **wörtlich** und rückt unter die Tafel als Gehäuse-Fußzeile —
  auf einer echten Tafel steht der Herstellername an dieser Stelle; bei uns steht
  dort die Herkunft der Zahlen. Das ist die schönste Stelle des ganzen Konzepts:
  **Die Plakette der Tafel ist unser Beleg-Versprechen.**
- Leerzustand: Tafel mit „—"-Fenstern + bestehende Erklärtexte (Grenzwert 6).
  Damit verschwindet nebenbei die heutige Härte, dass ein Profil ohne Spiele oben
  „0.0 PPG" behauptet — im Kopf-Band der Seite (dort stehen PPG/APG/RPG klein) auf
  „—" umstellen, gleiche Quelle, ehrlichere Aussage.
- „Wo stehst du?"-Verweis (eigenes Profil) bleibt unverändert unter der Tafel.
- Spielerhistorie/Tabellen darunter: **unverändert** Geist Mono (Grenzwert 2).

**Bewegung:** Einschalt-Moment + CountUp auf den Fenstern (CountUp existiert dort
schon — nur die Hülle ändert sich). **Aufwand:** mittel. **Risiko:** klein–mittel
(`eigene-zahlen.spec.mjs` prüft Werte, nicht Markup — beim Bau gegenlaufen lassen).

### Fläche C — Liga-Karte der Vereinsseite (`app/team/team-detail/[slug]/page.js`)

**Am Bild geprüft:** Karte mit brand-Oberkante, „3. von 5" (CountUp, Big Shoulders),
„2S · 2N · Korbdiff +20" in Mono — der heutige, bewusst konservative Stand.

**Entwurf — die Liga-Karte wird die Tafel dieser Seite:**
- `Tafel akzent` (sie IST die eine hervorgehobene Karte — die brand-Oberkante wandert
  vom Karten- auf den Tafel-Rahmen, Signaturstelle bleibt dieselbe).
- Links im Gehäuse: Liga-Name, Saison, Bezirk (unverändert, Big Shoulders/Bestand).
- Rechts: **Fenster „RANG"** mit Segment-Ziffer (betont, brand-500 — die eine Zahl,
  für die ein Verein die Seite besucht), Plakette darunter „von 5".
- Unterzeile S/N/Korbdiff bleibt Geist Mono auf der Gehäusefläche — drei kleine
  Zusatzfenster wären hier schon Messehalle (Grenzwert-Gefühl: die Tafel dieser Seite
  hat EIN Fenster).
- Meister-Fall: Trophäen-Pille wie heute statt Fenster (ein „1."-Fenster neben
  „Meister" wäre doppelt).
- Ganze Karte bleibt Link auf `/ligen/[id]` mit heutigem Hover.

**Bewegung:** CountUp auf dem Rang (existiert), Einschalt-Moment fürs Fenster.
**Aufwand:** klein. **Risiko:** klein. ⚠️ Ein Wächter aus `248d5e3` könnte auf die
Klassenkette der Liga-Karte prüfen (`spieler-vereinsseiten.spec.mjs`, Fall-Zuschnitt
beim Bau nachlesen) — Test mit umbauen, nicht umgehen.

### Fläche D — Ergebniszeilen: Team-Spielplan (öffentlich) + Admin-Ergebnisse-Tab

**Am Bild geprüft (öffentlicher Spielplan-Tab):** Textzeilen mit Mono-Ergebnis.
**Nur im Code geprüft (Admin):** `SpielplanTab.js`/`ErgebnisseTab.js` — „dein
Team:Gegner" + S/N seit `248d5e3`.

**Entwurf — bewusst die kleinste Dosis:** Listenzeilen werden NICHT zu Tafeln
(zwanzig Gehäuse untereinander = Messehalle). Stattdessen bekommt jede Ergebniszeile
ein **Mini-Fenster**: der Spielstand in einer navy-950-Fläche mit Glaskante,
Geist Mono (unter der Segment-Mindestgröße — Grenzwert der Größenleiter greift),
feste Breite (`ch`-basiert, „199 : 199" als Maximalmaß aus der BB-2101-Spez —
dreistellig reicht nachweislich für Basketball), S/N-Kürzel davor wie gebaut.
Dazu die **BelegLampe in Miniatur** (nur Kreis, Label im Titel-Attribut + sr-only)
am Zeilenende — im Admin-Ergebnisse-Tab ersetzt sie die „Bestätigt"/„Ergebnis
steht"-Pillen NICHT, sondern steht davor (Wortlaute sind Neles Gate-Ergebnis).
- Damit entsteht Wiedererkennung: Dasselbe Fenster, das groß auf `/match/[id]`
  leuchtet, taucht klein in jeder Zeile auf — die Zeile ist ein Zitat der Tafel,
  der Klick führt zur Tafel (Spielplan-Zeilen verlinken `/match/[id]` seit `248d5e3`).

**Bewegung:** keine (Listen; Reveal-Stagger der Liste existiert bereits).
**Aufwand:** klein–mittel (drei Einsatzorte). **Risiko:** klein.

### Fläche E — Listen-Köpfe `/spieler` und `/teams` (das Tafel-Statement)

**Am Bild geprüft:** PageHeader mit Eyebrow + Big-Shoulders-Titel + orangener
Haarlinie unten; darunter Filter; klein „407 SPIELER" / „66 TEAMS".

**Entwurf:** Der PageHeader-Bereich bekommt rechts (Desktop) bzw. unter dem
Untertitel (mobil) **ein einzelnes großes Fenster** mit dem Live-Bestandszähler als
Segment-Zahl: `407` / Plakette „SPIELER GELISTET" bzw. `66` / „TEAMS GELISTET".
Das ist das Gegenstück zum Hero der Startseite: Dort empfängt einen das Feld, hier
empfängt einen der Zählerstand der Halle. Ehrlichkeitsbedingung: Es ist exakt die
Zahl, die heute schon über der Liste steht (gleiche Quelle, gefilterte Ansicht zählt
gefiltert — Zähler folgt dem Filter, sonst lügt er neben der Liste).
⚠️ **Aber:** 85 % der gelisteten Spieler sind Seed-Bestand (gemessen, CLAUDE.md).
Die kleine Zahl über der Liste ist Bestandsangabe; dieselbe Zahl als Statement
**verstärkt** eine Zahl mit Seed-Anteil. Das ist keine Gestaltungs-, sondern eine
Eigentümerfrage → Entscheidungspunkt 2. Bis zur Entscheidung: Fläche E nicht bauen.

**Aufwand:** klein (wenn freigegeben). **Risiko:** inhaltlich (s. o.), nicht technisch.

### Fläche F — optional: Topscorer/Tabellen (Welle 3)

**Nicht vorgeschlagen in dieser Runde.** Bestenlisten sind Tabellen; Tabellen sind
Geist-Mono-Terrain (Grenzwert 2). Das Einzige, was die Tafel dort beitragen könnte —
die Hervorhebung der eigenen Zeile — hat bereits eine Signaturstelle (aktive
Stat-Zahl). Wenn Welle 3 (Sticky-Spalten mobil) ohnehin ansteht, kann die eigene
Zeile ein Mini-Fenster um den Punktwert bekommen; eigener Auftrag, nicht dieser.

---

## 5. Prioritäten, Aufwand, Risiko

| Stufe | Inhalt | Aufwand | Risiko |
|---|---|---|---|
| **1 — in EINER Runde baubar** | Font-Setup (DSEG7 selbst gehostet) + Primitive `Tafel`/`SegmentZahl`/`BelegLampe` + **Fläche A** (Match-Kopf mit Lampe) + **Fläche C** (Liga-Karte) | mittel | klein: zwei klar umrissene Flächen, Primitive isoliert testbar; design-audit-Baseline nachziehen |
| **2** | **Fläche B** (Karriere-Bilanz-Tafel + „—" statt 0.0 im Profilkopf) | mittel | klein–mittel (bestehende Profil-Wächter mitziehen) |
| **3** | **Fläche D** (Mini-Fenster + Mini-Lampe in Ergebniszeilen, öffentlich + Admin) | klein–mittel | klein |
| **4 — nur nach Entscheidungspunkt 2** | **Fläche E** (Zähler-Statement der Listen-Köpfe) | klein | inhaltlich (Seed-Zahl) |

Stufe 1 ist bewusst „Primitive + die zwei billigsten Flächen": Nach Stufe 1 ist auf
zwei Seiten sichtbar, ob die Richtung trägt — bevor die aufwendigere Profil-Tafel
gebaut wird. Jede Stufe endet mit Playwright-Screenshots (ansehen, nicht nur messen),
`design-audit -- --check`, beiden Gates (Kai + Tobias, mobil zuerst).

---

## 6. Entscheidungspunkte für Patrick (maximal 3, hier sind es 3)

1. **Segment-Ziffern: Ja zur wörtlichen Tafel-Schrift?**
   Die Design-Spezifikation vom 12.08. hat „LED-Segment-Schriften" ausdrücklich als
   „zu kostümhaft für ein Alltagsprodukt" verworfen. Dein Auftrag („an reale
   Anzeigetafeln angelehnt") stellt genau das zur Disposition — das ist legitim
   (Eigentümer-Entscheidung), aber es muss ausdrücklich entschieden werden, nicht
   still passieren. **Meine Empfehlung: Ja, mit den Grenzwerten aus 2.6** (nur in
   Fenstern, eine Tafel je Seite, nie in Tabellen, keine Buchstaben, kein Glow).
   So wird aus dem Kostüm ein Zitat. Sagst du Nein, bleibt das gesamte übrige
   Konzept (Gehäuse/Fenster/Plaketten/Lampe) baubar — die Fenster tragen dann
   Big Shoulders wie die heutige Rang-Zahl; das Tafel-Gefühl ist schwächer, aber da.
   Bei Ja wird die Spezifikations-Zeile in `VISUELLE-RICHTUNG-2026-08-12.md`
   entsprechend präzisiert (verworfen bleibt: Segment-Schrift AUSSERHALB von
   Tafel-Fenstern).

2. **Listen-Kopf-Zähler (Fläche E) jetzt oder nach dem Demo-Purge?**
   Die große Zahl wäre ehrlich (sie steht heute schon dort), aber sie macht eine
   Zahl mit 85 % Seed-Anteil zum lautesten Element der Seite — dieselbe Familie wie
   die Seed-Likes-Frage (Roadmap 2, § 5 UWG, liegt bei Nora). **Empfehlung: Mechanik
   erst mit dem Purge bzw. nach Noras Urteil bauen.** Du hast entschieden, dass die
   Testphase lebendig aussehen soll — ob das auch für ein Zahlen-Statement gilt,
   ist deine Abwägung.

3. **Die Beleg-Lampe als neues wiederkehrendes Zeichen der Marke?**
   Die Spezifikation limitiert Signatur-Elemente bewusst (2px-Leiste an genau drei
   Stellen). Die Lampe wäre ein viertes wiederkehrendes Zeichen — klein, aber überall
   dort, wo ein Ergebnis steht. **Empfehlung: Ja** — sie ist das einzige Element
   dieses Konzepts, das die Kernpositionierung (Belegbarkeit) direkt sichtbar macht,
   und sie ersetzt auf Dauer verstreute Text-Pillen durch EIN System. Bei Ja gehört
   sie in die Spezifikation als benanntes Element mit ihren drei Zuständen.

---

## 7. Was ich bewusst NICHT vorschlage — und warum

- **Dot-Matrix-Laufschrift / Ticker** (Namen laufen durchs Bild): Bewegung ohne
  Ankunfts-Anlass = Reise auf einer Gebrauchsfläche; dazu Lesbarkeitskiller.
- **Uhr/Shot-Clock-Countdowns:** keine Live-Erfassung, jede Uhr wäre erfunden.
  Falls Roadmap 17 (Live-Eingabe am Spielfeldrand) je gebaut wird, ist die
  Shot-Clock-Ästhetik dort die natürliche Fortsetzung — heute nicht.
- **HOME/GUEST-Beschriftung:** Datenmodell trägt Heim/Auswärts nicht (s. Abschnitt 0).
- **Rote/bernsteinfarbene Leucht-Digits nach Vorbild:** bricht das Ein-Orange-System;
  Rot kollidiert mit `signal-error`-Semantik.
- **Glow, Scanlines, Pixel-Raster, Gehäuse-Texturen:** Verbotsliste bzw. Kitsch;
  die FIBA-Anforderung „antiglare" adelt den Verzicht sogar amtlich.
- **Tafel-Optik auf dem Profil-KOPF** (Name/Avatar/Folgen): Der Kopf ist Identität,
  keine Anzeige — ein Mensch in einem Ziffernfenster wäre die falsche Aussage.
  Einzige Kopf-Änderung: „—" statt „0.0" ohne Spiele (Fläche B).
- **Vollflächige Tafel-Seiten** („die ganze Seite ist die Tafel"): Der Hero der
  Startseite trägt die Ganzflächen-Rolle; Datenseiten brauchen Ruhe um die eine Tafel.
- **Segment-Font per CDN:** Selbsthosting ist Projektkonvention (Geist-Präzedenz);
  ein CDN-Font wäre zudem ein neuer Dritt-Dienst (Datenschutz-Folgefrage).

---

## 8. Konflikt-Transparenz

1. **Segment-Verwerfung vom 12.08. vs. Patricks Auftrag** → Entscheidungspunkt 1
   (nicht still übergangen, nicht still befolgt).
2. **Signatur-Limit vs. neue Lampe** → Entscheidungspunkt 3.
3. **Nebenbefund außerhalb dieses Auftrags:** `NextMatchCard`
   (`PlayerProfileView.js:145`) beschriftet mit „Heimspiel gegen / Auswärts bei",
   abgeleitet aus `teamA === eigenes Team` — die Feed-Anzeigetafel verbietet genau
   diese Ableitung („`teamA`/`teamB` trägt diese Bedeutung nicht"). Entweder trägt
   das Datenmodell die Bedeutung doch (dann gehört die Feed-Regel präzisiert) oder
   die Karte behauptet Heimspiele, die keine sind. → Prüfauftrag an Kai/Nele,
   unabhängig von diesem Konzept.

---

## 9. Was geprüft ist und was Vermutung ist

**Am Bild geprüft (Playwright gegen https://hoopsgermany.de, 23.08.2026, Desktop 1440
+ mobil 390):** Startseite (Hero), `/spieler`, `/teams`, Team-Detail
(`aachen-aces-w`, inkl. Liga-Karte mit Rang-Fenster-Vorstufe), Spielerprofil leer
(`mohammed-anis-abdessamad`) und mit Daten (`julian-petrovi-w55`, Karriere-Bilanz
4+3), `/match/6a3f8492995c0e61ba1f6645` (SplitFlap-Kopf 120:95, Box-Scores).
Screenshots im Session-Scratchpad (`shots/`), nicht im Repo.

**Im Code geprüft:** `SplitFlap.js` (Ein-Stelle-Regel, reduced-motion),
`Anzeigetafel.js` (LABEL-Konstante, Heim/Auswärts-Verbot, Ehrlichkeitsregeln),
`PlayerProfileView.js` (NextMatchCard-Struktur, Karriere-Bilanz-Markup, CountUp),
Team-Detail-Liga-Karte (Klassenkette), Token-Werte in `tailwind.config.js`.

**Aus dokumentierten Messungen übernommen (nicht neu gemessen):** paper-50/navy-950
16,16:1 · brand-500/navy-950 6,88:1 · mist-400/navy-950 8,97:1 · signal-ok 5,86:1.

**Vermutet, beim Bau zu prüfen:**
- Ghost-Kontrast 1,25:1 ist gerechnet, nicht am gerenderten Bild gemessen.
- DSEG7-Glyphenumfang: Ziffern/Doppelpunkt/Minus sicher; **Komma-Glyphe für „13,1"
  ungeprüft** — falls sie fehlt oder hässlich ist: Dezimaltrenner als eigenes
  Nicht-Segment-Zeichen setzen (Geist Mono im selben Fenster) oder Punkt-Notation
  nur innerhalb der Fenster (Entscheidung beim Bau, am Bild).
- DSEG7-woff2-Dateigröße (erwartet < 30 KB, ungeprüft) und das Verhalten von
  `next/font/local` mit `adjustFontFallback: false` in Next 14.2.35.
- mist-400 auf navy-800 (Plaketten) 6,54:1 — Paarung ist im Projekt im Einsatz,
  der genaue Wert hier aus der Erinnerung an die Doku-Familie; nachrechnen.
- Wächter-Zuschnitt von `tests/e2e/spieler-vereinsseiten.spec.mjs` gegenüber der
  Liga-Karten-Klassenkette: nicht gelesen; vor Fläche C prüfen.

**Kollegen:** Nele — Wortlaute auf den Tafeln bleiben ihre (Beleg-Sätze, Status-Wörter
unverändert übernommen); Zähler-Statement (E) berührt ihre Zielgruppen-Aussage.
Nora — Entscheidungspunkt 2 hängt an ihrem § 5-UWG-Urteil (Roadmap 2). Kai/Tobias —
Gates je Stufe wie immer; Kai zusätzlich der Nebenbefund aus Abschnitt 8.3.
Milo bewusst nicht — die Tafel ist Geometrie + Typografie, kein Asset-Bedarf.

**Quellen des Sweeps:**
[Daktronics BB-2101](https://www.daktronics.com/en-us/products/sports/BB-2101) ·
[BB-2101 Spezifikations-PDF](https://www.daktronics.com/web-documents/hspr-documents/dd2481847.pdf) ·
[FIBA Official Rules 2026 — Equipment](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-equipment-v1-0.pdf) ·
[DSEG-Font (keshikan, OFL 1.1)](https://www.keshikan.net/fonts-e.html) ·
[DSEG auf GitHub](https://github.com/keshikan/DSEG) ·
[Favero FIBA-Shot-Clock-Datenblatt](https://www.favero.com/en3b_pdf-128-57.pdf)

## 10. Selbsttest

Würde ein gutes Designstudio das unterschreiben? Die Idee hat einen echten Grund
(zweite Blickrichtung derselben Halle — die Startseite hat die erste), einen
inhaltlichen Kern (die Lampe macht die Belegbarkeit sichtbar), gerechnete Kontraste,
harte Grenzwerte gegen das Kostüm, und sie überschreibt die einzige entgegenstehende
Alt-Entscheidung nicht still, sondern legt sie Patrick vor. Ja — mit der
Einschränkung, dass der Beweis erst am gebauten Stufe-1-Stück steht, angesehen auf
390 px und 1440 px.
