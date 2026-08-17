# Visuelle Richtung – Hoops Germany v2
## Auftrag von Patrick, 12.08.2026 – „Volle Freiheit inklusive Farben"

Erstellt von Vivien (design-spezialistin). Status: **Design-Spezifikation, kein
Code.** Patrick baut den Piloten (Startseite + `/teams`) selbst nach diesem
Dokument und schickt ihn durch Kais und Tobias' Gate. Dieses Dokument ersetzt
keine der harten Grenzen aus dem Auftrag (Funktionen/Routen bleiben, WCAG AA,
keine neuen npm-Abhängigkeiten, `prefers-reduced-motion`, mobil zuerst).

---

> ⚠️ **ÜBERHOLT IN EINEM PUNKT (Nachtrag 12.08.2026): Der Grundton ist Navy, nicht warmes Braun.**
> Patrick hat nach dem Bau entschieden: „meiner Meinung nach war Navy Blau und Orange auch passend
> dafür." Damit gilt die `ink`-Palette in diesem Dokument **nicht mehr**. Sie heißt im Code `navy-*`
> und trägt nachtblaue Werte (950 `#0B1220`, 900 `#111A2E`, 800 `#182543`, 700 `#223058`,
> 600 `#3D5080`, 500 `#56699B`); `paper-50` ist `#F5F7FA`, `mist-400` `#A9B4C9`, `mist-600` `#78839C`.
> Gerechnete Kontraste und Begründung stehen in `docs/WOW-KONZEPT-2026-08-12.md` Abschnitt 0.
> **Alles Übrige dieses Dokuments gilt unverändert** – Stufung der Flächen, 1px-Haarlinie statt
> Schatten, Radien 6/10/16, die 2px-Markenleiste an genau drei Stellen, Schriften, Icon-Wechsel,
> Primärbutton mit dunklem Text auf Orange. Viviens fachliche Gegenrede zu Navy (naheliegend, und
> naheliegend kippe leicht ins Generische) steht im Wow-Konzept und wurde bewusst überstimmt.

## 0. Kurzfassung

Was heute da ist, ist technisch sauber und inhaltlich ehrlich – aber visuell
ein **austauschbares Tailwind-SaaS-Kit**: weiße `rounded-2xl`-Karten mit
`shadow-sm`/`border-gray-100`, Inter überall, Font-Awesome-Icons, runde
Pill-Badges, ein Navy-Verlauf als einziges „Statement". Nichts davon ist
falsch – aber nichts davon ist *Hoops Germany*. Es könnte eine Buchhaltungs-App
sein.

**Empfohlene Richtung: „Anzeigetafel".** Statt eines weiteren hellen
SaaS-Layouts baut die Seite auf dem einen Objekt auf, das jeder Spieler,
jede Trainerin, jeder Elternteil an der Seitenlinie kennt: der beleuchteten
Anzeigetafel in der Halle. Dunkler, warmer Grund (kein Navy, kein
Neon-Schwarz), ein einziger Akzent – **das exakte Orange aus dem
Hoops-Logo, `#F07A27`** –, große kondensierte Zahlen und Headlines
(Big Shoulders), eine ruhige, moderne Grotesk für Fließtext (Geist) und
eine echte Monospace für Statistiken (Geist Mono). Karten werden zu Panels
mit Haarlinien-Rahmen statt Schatten-Karten. Kein Farbverlauf, kein Glow,
kein Glassmorphism.

**Der wichtigste Fund dabei:** Das Logo ist nicht neutral. Es trägt bereits
ein festes Orange (`#F07A27`) im Ball-Emblem – „nur das Logo bleibt" heißt
also faktisch, dass ein Orange-Akzent nicht verhandelbar ist, seine genaue
Tönung aber schon. Ich habe die neue Palette exakt auf diesen Logo-Wert
verankert, statt eine neue Farbe zu erfinden.

**Der Foto-Engpass wird nicht kaschiert, sondern umgangen:** Der Hero
verzichtet auf das 1000×652-px-Foto komplett. Die vorhandenen Vektor-Elemente
(`HeroGlyphs.js`, `HeroScrollStage.js`) tragen die Szene bereits ohne Foto –
sie laufen künftig auf einem flachen dunklen Grund statt vor dem
hochskalierten Bild. Typografie und Bewegung werden zum Hero, nicht die
Fotografie.

**Pilot:** Startseite (Hero + Feature-Strecke + CTA) und `/teams` – siehe
Abschnitt 4 für die konkrete Umsetzung und die Rollout-Reihenfolge danach.

---

## 1. Bestandsaufnahme mit Urteil

Geprüft: `tailwind.config.js`, `app/globals.css`, `components/ui/*`,
`components/layout/PageHeader.js`, `components/layout/Navbar.js`,
`components/landing/*` (Hero, Features, FeatureMocks, FeatureProgressRail),
sowie die Seiten `/` (Landing), `/teams`, `/ligen` als reale Beispiele.

| Was da ist | Warum es generisch wirkt |
|---|---|
| `rounded-2xl border border-gray-100 bg-white shadow-sm` als *die* Karte (`Card.js`, `lib/ui.js` `cardClass`, auf jeder Team-/Liga-/Spieler-Karte identisch wiederholt) | Exakt das „Generic card look"-Muster (Rahmen + Schatten + Weiß + immer derselbe Radius), das jedes zweite KI-generierte Dashboard produziert. Keine Elevation-Hierarchie – jede Karte ist gleich „schwer". |
| Inter als einzige Schrift, System-Skalierung über Tailwind-Defaults | Funktional einwandfrei, aber die meistgewählte Default-Schrift überhaupt – trägt keine Identität. Nirgends im Produkt gibt es eine typografische Geste, die nach *Sport* aussieht. |
| `bg-gradient-to-r from-slate-950 to-slate-800` als Navy-Verlauf in `Navbar.js` **und** `PageHeader.js` **und** Team-Logo-Kacheln (`/teams`) | Der einzige wiederkehrende „Marken-Moment" der Seite ist ein Zwei-Stopp-Linearverlauf – die generischste Form, ein dunkles Element zu bauen. Er trägt keine Bedeutung, er ist Dekor. |
| `react-icons/fa` (Font Awesome) durchgängig | Das Icon-Set, das in praktisch jedem Bootstrap-Ableger seit 2015 steckt. Dünne, neutrale Striche – passt nicht zur groben, körperlichen Sprache von Basketball. |
| Runde Pill-Badges (`rounded-full uppercase tracking-widest`) für Eyebrows, Tags, Positionen, Status | Wird an mindestens sieben Stellen identisch wiederverwendet (Hero-Badge, Liga-Tags, Positions-Chips, „Bestätigt"-Badge in `FeatureMocks.js`, Navbar-Login-Button …) – genau das Pill-Muster, das die Redesign-Skill als Klischee führt. |
| Icon-in-farbiger-Box + Titel + Text als Feature-Baustein (`bg-brand-100 rounded-xl` + `FaIcon`, `LandingFeatures.js`) | Das asymmetrische Zickzack-Layout selbst ist schon *nicht* das generische 3-Spalten-Icon-Grid (gut gemacht!) – aber jeder einzelne Baustein darin trägt trotzdem das generische Icon-in-Box-Muster. |
| Karten-Hover überall identisch: `hover:shadow-md hover:-translate-y-0.5` bzw. `-1` | Konsistent umgesetzt, aber die Standard-Material-Design-Geste („Karte hebt beim Hover ab") – nicht falsch, nur austauschbar. |
| Primärbutton `bg-brand-500 text-white` (`Button.js`, `LandingHero.js`) | **Echter Befund, kein Stilurteil:** Weißer Text auf `#f97316` erreicht rechnerisch nur **≈2,6:1 Kontrast** – das liegt unter WCAG AA (4,5:1) selbst für normalen Text. Der aktuelle Primärbutton ist vermutlich nicht barrierefrei, unabhängig vom Redesign. |

**Fazit:** Nichts ist kaputt, aber fast alles ist der Median dessen, was ein
Tailwind-Starter-Kit von der Stange liefert. Die Bewegungsarbeit der letzten
Tage (Feature-Choreografie, Fortschritts-Anzeige, Ball-Ankunft) ist gut und
bleibt – aber sie lief bisher auf einer Bühne ohne eigenes Gesicht.

---

## 2. Empfohlene Richtung: „Anzeigetafel"

**In drei Sätzen:** Die Seite verlässt das helle SaaS-Layout und setzt auf
einen warmen, dunklen Hallengrund – nicht Navy, nicht Tech-Schwarz, sondern
die Farbe eines Sporthallenbodens nach Betriebsschluss. Auf diesem Grund
trägt ein einziger Akzent die gesamte Farbsprache: das exakte Orange aus dem
Hoops-Logo, dosiert eingesetzt wie die Digitalanzeige einer echten
Anzeigetafel. Große kondensierte Zahlen und Headlines, ruhige Fließtext-
Grotesk, echte Tabellenschrift für Statistiken, Karten als Panels mit
Haarlinie statt Schatten – die Bühne, auf der die vorhandene Bewegungsarbeit
(Ball-Ankunft, Feature-Choreografie) endlich zu Hause ist.

### 2.1 Farb-Token

**Wichtigster Fund zuerst:** Das Logo-Emblem (`public/images/logo.svg`,
`logo-hoops.svg`) ist bereits farbig – der Ball ist exakt `#F07A27`, nicht
das aktuelle `brand-500` (`#F97316`). Die neue Palette verankert sich auf
dem **echten Logo-Wert**, nicht auf einer neu erfundenen Farbe. Das ist kein
Stilentscheid, das ist Konsistenz mit dem einzigen Fixpunkt, den der Auftrag
vorgibt.

Alle Kontrastwerte unten sind **gerechnet** (WCAG-Relativluminanz-Formel),
nicht geschätzt.

**`ink` – warmer Hallengrund (ersetzt `slate`/Navy überall):**
```
ink-950  #120E0B   Seitenhintergrund
ink-900  #1B1512   Navbar/Footer-Fläche
ink-800  #241D18   Karten-/Panel-Fläche (eine Stufe „näher an der Kamera")
ink-700  #2F2620   Hover-Fläche, Input-Füllung
ink-600  #4A3C31   Rahmen/Trenner auf dunklem Grund
ink-500  #6B5B4C   inaktive Icons, Platzhalter-Grau
```

**`paper` – Text auf dunklem Grund:**
```
paper-50   #FAF7F2   Primärtext auf ink-950 → Kontrast 17,97:1 (WCAG AAA)
paper-100  #F1EAE0   sekundäre Flächen, falls einzelne Bereiche hell bleiben
```

**`mist` – gedämpfter Text auf dunklem Grund:**
```
mist-300  #CFC7BC   Zwischenüberschriften/Labels
mist-400  #B9AFA3   Fließtext sekundär → Kontrast 8,89:1 auf ink-950
mist-600  #8A8074   Platzhalter/niedrigste Betonung → 4,96:1 (nur Labels/Icons,
                      nicht für Fließtext-Absätze verwenden)
```

**`brand` – neu verankert auf dem Logo-Orange:**
```
brand-50   #FFF4E9
brand-100  #FFE3C6
brand-200  #FFC58C
brand-300  #FCA25A
brand-400  #F68C3E
brand-500  #F07A27   ← exakter Logo-Wert (Ball-Emblem)
brand-600  #D9600F
brand-700  #B04D0D   Kontrast zu paper-50: 5,02:1 (AA-sicher für Weiß-auf-Orange-Fälle)
brand-800  #7E3509
brand-900  #4F2107
```
**Kontrast-Befund brand-500 auf ink-950 (Text/Icon):** 6,88:1 – AA-sicher,
sogar für normalen Fließtext. Orange-Eyebrows, -Icons, -Zahlen funktionieren
also direkt in der Logo-Farbe, ohne Aufhellung.

**Wichtige Korrektur zum heutigen Button:** `brand-500`-Fläche mit
**weißem** Text erreicht nur 2,61:1 (siehe Abschnitt 1 – Bestandsproblem,
nicht neu). Die neue Richtung dreht das um: **Primärbutton = `brand-500`-
Fläche mit dunklem `ink-950`-Text** → Kontrast 6,88:1, AA-sicher, UND näher
an der echten Anzeigetafel-Ästhetik (helle Digits auf/vor dunklem Grund ist
das falsche Bild – aber ein sattes, dunkel bedrucktes Signalfeld auf orangem
Grund ist genau das Bild einer Trikot-/Vereinsfarbe). Wo unbedingt weißer
Text auf Orange gebraucht wird (z. B. Badge auf Foto), `brand-700`
verwenden (5,02:1).

**Status-Farben (bewusst restriktiv – EIN Marken-Akzent bleibt Orange,
diese hier sind rein semantisch, keine zweite „Marke"):**
```
success/bestätigt  #6B9A5B   Kontrast auf ink-950: 5,86:1
warn/ausstehend     #C9A227   Kontrast auf ink-950: 7,95:1
error/mismatch      #D2604A   Kontrast auf ink-950: 5,04:1
```
Alle drei bewusst entsättigt (kein Signalgrün/-rot wie ein Verkehrsschild) –
Redesign-Skill-Regel „mehr als ein Akzent → einen wählen" wird eingehalten,
indem Status-Farben klar als *semantisch*, nicht als *Marke* auftreten.

**Was explizit NICHT Teil der Richtung ist:** keine Farbverläufe (auch keine
dunklen), kein Glow/Blur-Schein hinter Headlines, kein Glassmorphism. Die
gesamte Tiefe entsteht aus Flächenstufen (`ink-950` → `ink-800` → `ink-700`)
und einer 1px-Haarlinie, nicht aus Schatten oder Leuchteffekten.

**Die Grenze verläuft zwischen Oberfläche und Gegenstand.** *(Ergänzung Vivien,
16.08.2026 — die Regel darüber galt bis dahin pauschal und beantwortete den
Ball-Fall falsch.)* Das Verbot gilt den Flächen der Oberfläche selbst — Gründe,
Panels, Karten, Tasten, Leisten, Kästen hinter Schrift. Sie bleiben flach; ihre
Tiefe kommt aus der Flächenstufe und der 1px-Haarlinie, nie aus Verlauf,
Schatten oder Glow.

Es gilt **nicht** für einen dargestellten **Gegenstand** in einer Szene. Ein
Basketball ist eine Kugel; Körperverlauf, Kantenabdunklung und Bouncelight sind
dort **Modellierung**, nicht Dekoration — sie beschreiben eine Form, statt eine
Fläche interessanter zu machen. Deshalb trägt der Hero-Ball (`BallSprite`)
Verläufe **in** sich.

Die Probe, wenn ein Fall unklar ist: *Beschreibt der Effekt die Form eines
Dinges — oder schmückt er eine Fläche der Oberfläche?* Nur die erste Antwort ist
zulässig.

Der geworfene **Schatten** bleibt in beiden Fällen verboten, und das ist keine
Inkonsequenz: Ein Verlauf im Ball beschreibt den **Ball**, ein Schlagschatten
behauptet eine **Lichtquelle und eine Fläche dahinter** — also Eigenschaften der
Oberfläche, die es hier nicht gibt. Genau deshalb ist der `drop-shadow` am
Hero-Ball am 15.08.2026 entfallen; seine Tiefe kommt aus dem Anschnitt am
Bühnenrand.

Flache Geschwister derselben Familie sind ausdrücklich in Ordnung: Der
Streckenball (`RailBallGlyph`, 20 px) bleibt reines `brand-500` ohne Verlauf —
in dieser Größe ist Modellierung nicht lesbar und wäre nur Rauschen.

**Der Rang des Hero-Balls ist mobil und am Desktop verschieden.** *(Entscheidung
Vivien, 17.08.2026 — nachdem Tobias gefragt hatte, ob die Erzählung „ein Motiv
trägt die ganze Seite" mit einem 72-px-Ball noch aufgeht.)*

Am **Desktop** (176 px) trägt der Satz. Die gepinnte Hero-Bühne ist dort noch
offen (Roadmap 11), und der Ball ist die Hauptfigur.

**Mobil (72 px) gilt er nicht — und er war dort nie wahr.** Ein 176-px-Ball neben
einer dreizeiligen Display-Headline auf 375 px war kein Protagonist, sondern eine
**Konkurrenz zum `h1`**; genau daraus entstand der gemessene Kontrast von 1,67:1,
der die Abdunkelung nach sich zog und damit den Wirkungsverlust, den Roadmap
20 (a) protokolliert. Die Kette war: zu großer Ball → Text unlesbar →
Abdunkelung → Ball unsichtbar. Es wurde viermal am Symptom gearbeitet.

Auf 375 px hat die **Headline den Vortritt.** Das ist keine Niederlage, sondern
die richtige Hierarchie. Der Ball ist mobil ein **wiederkehrender Akzent**: Er
tritt oben rechts angeschnitten ein, verschwindet, kommt auf der Feature-Strecke
wieder, landet im Korb. Was einen wiederkehrenden Akzent zum Motiv macht, ist
nicht seine Größe — es ist **Wiedererkennbarkeit an jeder Station**. Deshalb ist
die verankerte Ruhelage (statt der gesuchten) Teil derselben Entscheidung: Fände
der Auftritt bei 360 px im Textblock und bei 375 px in der Ecke statt, wäre es
zweimal etwas anderes.

Der **Anschnitt** (80 % sichtbar bei 375) bleibt ausdrücklich: Ein angeschnittener
Gegenstand liest sich als „kommt von außen herein", ein vollständiger als „liegt
hier". Für einen Ball, der gerade hereingeflogen ist, ist der Anschnitt das
richtige Tiefenmittel.

⚠️ **Wer die 72 px als Fehler liest und zurückdreht, dreht diese Entscheidung
zurück** — und mit ihr die Kette oben.

### 2.2 Typografie

**Display: Big Shoulders** (Google Fonts, variabel, Gewichte „Thin" bis
„Black", von Patric King für das Chicago Design System gezeichnet – eine
kondensierte amerikanische Grotesk mit Signage-/Anzeigetafel-Herkunft, kein
Sport-Klischee-Font wie „Bebas Neue", aber mit derselben strukturellen
Idee: viel Aussage auf wenig Breite). Einsatz: H1/H2, Hero-Headline,
Eyebrows in Großbuchstaben, große Stat-Zahlen, Ziffern in
Fortschritts-/Score-Momenten. Gewicht 700–900, oft in Versalien mit leicht
reduziertem Tracking.

**Text/UI: Geist** (Google Fonts, variabel 100–900, von Vercel entwickelt).
Löst Inter ab, ohne die Legibility-Sicherheit aufzugeben – zeitgemäße
Neo-Grotesk mit klareren, etwas geometrischeren Formen als Inter, wirkt
weniger nach „Default-Wahl". Einsatz: Fließtext, Navigation, Formulare,
Buttons, Card-Body.

**Daten/Mono: Geist Mono** (Google Fonts, dieselbe Familie wie oben,
Monospace-Pendant mit echten tabellarischen Ziffern). Einsatz:
Spielstände, Tabellen (Sp/Pkt/Diff), Rückennummern, Zeitstempel,
Statistik-Werte in Karten. Das ist keine Spielerei – tabellarische Ziffern
verhindern das „Springen" von Zahlen beim Update (genau das Argument, das
Broadcast-Grafik-Systeme für Live-Scores anführen) und geben der Seite
strukturell, nicht nur dekorativ, ihre „Anzeigetafel"-Textur.

**Lizenz/Verfügbarkeit:** Alle drei Familien sind kostenlos auf Google
Fonts, Einbindung über `next/font/google` – **keine neue npm-Abhängigkeit**.
**Zu prüfen vor dem Bau:** Next.js 14.2.35 bündelt `next/font/google` mit
einem zum Release-Zeitpunkt eingefrorenen Font-Katalog. Big Shoulders ist
alt genug (Google-Fonts-Bestand seit Jahren), Geist/Geist Mono sind
Vercel-eigene Fonts und in aktuellen Next-Versionen in der Regel direkt
unterstützt – **trotzdem beim Bau kurz verifizieren**, ob beide Namen im
next/font-Manifest dieser Next-Version auftauchen. Fällt einer raus: Fallback
ist `next/font/local` mit selbst gehosteten `.woff2`-Dateien (Google-Fonts-
Download) – weiterhin keine neue Abhängigkeit, nur eine andere
Ladestrategie.

**Nicht mehr als zwei Familien plus Akzent** (Vorgabe eingehalten): Big
Shoulders (Display) + Geist (Text) + Geist Mono (Daten, als reiner
Utility-Akzent, keine dritte „Stimme").

### 2.3 Raster, Radien, Tiefe, Kartensprache

**Radien** – bewusst kleiner und gestuft statt überall `rounded-2xl`:
```
radius-sm   6px   Chips, Inputs, Tabellenzellen, kleine Buttons
radius-md   10px  Standard-Panels/Karten, Buttons
radius-lg   16px  reserviert für wirklich große Flächen (Hero-Panel, Modal) –
                   NICHT die Standard-Karte
```
Heute ist `rounded-2xl` (16px) der Wert für *alles* – Audit-Punkt „Uniform
border-radius on everything". Die neue Stufung macht Radius wieder zu
einem Hierarchie-Signal statt zu einem Reflex.

**Kartensprache – vom „Schatten-Kärtchen" zum „Panel":**
- Fläche: `ink-800` auf `ink-950`-Grund (Flächenstufe statt Schatten für
  Elevation)
- Rahmen: 1px `ink-600`, keine `box-shadow`
- Hover: Rahmen hellt auf `brand-500` auf **plus** Fläche hellt eine Stufe
  auf (`ink-800` → `ink-700`) – kein Translate/Lift mehr (das war die
  Material-Design-Standardgeste; auf dunklem Panel-Grund liest sich
  „heller werden" wie ein angehendes Licht, passender zum Bild)
- **Signatur-Element „Anzeigetafel-Leiste":** ein 2px durchgezogener
  `brand-500`-Strich, konsequent an genau drei Stellen eingesetzt – (1) als
  untere Kante von Navbar/PageHeader statt Verlauf, (2) als obere Kante der
  jeweils *einen* hervorgehobenen Karte einer Liste (eigenes Team in der
  Tabelle, aktives Spiel, offenes Tryout), (3) unter der aktiven Stat-Zahl
  in einer Tabellenzeile. Bewusst **nicht** überall – genau das unterscheidet
  ein Signatur-Element von einer Deko-Linie.

**Buttons:**
```
primary    Fläche brand-500, Text ink-950, Geist SemiBold, radius-md,
           Hover: Fläche brand-400, Active: scale(0.97) [bestehende Kurve
           aus Button.js bleibt]
secondary  transparent, Rahmen 1.5px mist-400, Text paper-50, radius-md,
           Hover: Rahmen brand-500, Text brand-300
ghost      Text mist-300, Hover: Text paper-50, kein Rahmen
```
Kein `rounded-full`-Pill-Button mehr außer echten Icon-Buttons (kreisrund,
z. B. Benachrichtigungs-Glocke). Badges/Tags wechseln von voll gefüllten
Pills zu kleinen `radius-sm`-Rechtecken mit dünnem Rahmen statt Flächenfarbe
– weniger „Bootstrap-Badge", mehr „Anstecker/Etikett".

**Icons:** Wechsel von `react-icons/fa` (Font Awesome) zu
`react-icons/pi` (Phosphor, Gewicht „Bold"). **Geprüft:** `react-icons`
(bereits installiert, `^5.6.0`) enthält den `pi`-Unterpfad bereits im
`node_modules`-Baum – **keine neue Abhängigkeit, nur ein anderer Import-Pfad**.
Phosphor Bold hat kräftigere, geschlossenere Formen, die besser zu den
kondensierten Headlines passen als die dünnen Fontawesome-Striche.

**Rhythmus:** Zwei Geschwindigkeiten bewusst nebeneinander – Marketing-
/Hero-Bereiche atmen großzügiger (`py-24`/`py-32` statt `py-20`), datendichte
Bereiche (Tabellen, Filterleisten, Team-Admin-Panel) bleiben eng getaktet.
Kein pauschales „mehr Weißraum überall", sondern **zwei bewusst
unterschiedene Zonen**.

---

## 3. Verworfene Richtungen

**Editorial-Foto-Hero (große Lifestyle-Fotografie, Magazin-Stil).**
Verworfen, weil das einzige vorhandene Motiv 1000×652 px misst und bei
keiner Bildschirmgröße scharf bleibt (Milos Messung, Faktor bis 5,12×) –
eine Richtung, deren Wirkung an großformatiger Fotografie hängt, ist mit dem
heutigen Material nicht einlösbar, ohne dass sie genau dort weich wird, wo
sie am schärfsten sein müsste.

**Warmes Creme + Serifen-Display + Terracotta** (die „andere" KI-
Default-Ästhetik neben Dunkel+Neon). Verworfen, weil sie als generischer
KI-Standard explizit dokumentiert ist (Design-Skill-Referenz) und weil eine
Serife das falsche Tempo-Signal für ein Live-Ergebnis-/Tabellen-Produkt
sendet – sie liest „Feuilleton", nicht „Spielstand".

**Neon-Dark/E-Sport-Ästhetik** (Near-Black + Cyan/Grün-Glow,
Glassmorphism-Karten). Verworfen aus zwei Gründen: Es ist der andere der
zwei dokumentierten KI-Standard-Looks, und es trifft den falschen
emotionalen Ton – Hoops Germany ist Amateur-Basketball in der Kreisliga,
kein Competitive-Gaming-Produkt. Ein Kreisliga-Team in Krefeld soll sich
nicht wie in einem Twitch-Overlay wiederfinden.

---

## 4. Pilot: Startseite + `/teams`

### 4.1 Startseite

- **Hero (`LandingHero.js` + `HeroScrollStage.js`):** Hintergrundfoto
  (`login image.jpg`) komplett entfernt – siehe Abschnitt 5. Flacher
  `ink-950`-Grund. Headline in Big Shoulders, groß, kondensiert, Versalien,
  Schlüsselwort in `brand-500` (Muster bleibt: „Deine Basketball-
  **Community**"). Die vorhandenen Vektor-Glyphen (Ball, Korb-Emblem,
  Spielfeld-Bogen aus `HeroGlyphs.js`) bleiben unverändert in ihrer Logik,
  nur Farbwerte auf die neue Palette umgehängt. CTA-Buttons nach neuer
  Anatomie (Primary = `brand-500`/`ink-950`-Text).
- **Feature-Strecke („Ein Spielzug in sechs Szenen", `LandingFeatures.js` +
  `FeatureMocks.js`):** Zickzack-Struktur bleibt (sie ist bereits das
  Gegenteil des generischen 3-Spalten-Grids – richtig gemacht). Ersetzt
  wird: Icon-in-`brand-100`-Box → große Big-Shoulders-Ziffer „1/6" … „6/6"
  in `brand-500`, wie eine Perioden-Anzeige. `MockFrame` (weiße
  `rounded-2xl`-Karte mit `shadow-lg`) → `ink-800`-Panel mit `ink-600`-
  Rahmen, kein Schatten. Alle Grau-/Weiß-Referenzen in `FeatureMocks.js`
  (`bg-gray-50`, `text-gray-900`, `border-gray-100`, `bg-brand-50`-Chips)
  auf die neuen Tokens umgehängt – Chips mit heller Flächenfarbe brauchen
  auf Dunkel eine transparente Variante (`brand-500` bei ~15 % Deckkraft
  als Flächenfarbe, Text `brand-300`).
- **Fortschritts-Anzeige (`FeatureProgressRail.js`):** Logik unverändert
  (ein Scroll-Listener, rAF, direkte Style-Mutation). **Wichtig für den
  Bau:** Die Farben stehen dort als **Hex-Strings direkt im JS**
  (`#f97316`, `#e5e7eb`), nicht als Tailwind-Klassen – müssen beim Umbau
  händisch auf `#F07A27` bzw. ein dunkles Pendant (`ink-600` als Hex)
  umgestellt werden, sonst wird das Tailwind-Update unsichtbar bleiben, weil
  diese Datei die Config gar nicht liest.
- **NewsWidget/LandingHowItWorks/LandingCTA/Footer:** reine Token-
  Umstellung (Flächen, Text, Rahmen), keine Strukturänderung nötig.

### 4.2 `/teams`

- **`PageHeader`:** Verlauf raus, flacher `ink-950`-Grund, Big-Shoulders-H1
  „TEAMS ENTDECKEN", Eyebrow in Geist Mono/Versalien/`brand-500`, untere
  Kante bekommt die 2px-`brand-500`-Anzeigetafel-Leiste statt des heutigen
  weichen Verlaufs.
- **Filterleiste:** Such-Input und Bundesland-Select von `bg-white
  border-gray-200` auf `ink-800`-Füllung/`ink-600`-Rahmen/`paper-50`-Text.
- **Team-Karten:** weiße `rounded-2xl`-Karte → `ink-800`-Panel,
  `radius-md`, 1px `ink-600`-Rahmen, kein Schatten, Hover = Rahmen
  `brand-500` + Fläche einen Ton heller (kein Translate mehr). Logo-Kachel
  (`bg-gradient-to-br from-slate-900 to-slate-700`) → flaches `ink-900`,
  kein Verlauf. Regions-Zeile in Geist Mono (Daten-Textur konsequent bis in
  die Kartenmeta).
- **Skeletons/EmptyState:** `bg-gray-200/70` → `bg-ink-700/70` für den
  Pulse-Platzhalter, Icon-/Textfarben in `EmptyState.js` auf `mist`-Skala.

### 4.3 Rollout-Reihenfolge danach

1. **Fundament einmal richtig:** `tailwind.config.js` (neue Farb-Token,
   Radien, Fonts), `components/ui/Button.js`, `Card.js`, `lib/ui.js`
   (`inputClass*`, `cardClass`), `components/layout/Navbar.js`,
   `components/layout/PageHeader.js`, `components/layout/Footer.js` – diese
   sechs Stellen strahlen automatisch in fast jede Seite aus.
2. **Listenseiten** (`/ligen`, `/spieler`, `/spiele`, `/transfermarkt`,
   `/tryouts`, `/topscorer`) – teilen sich PageHeader + Card + Filterleisten-
   Muster mit `/teams`, also mit dem geringsten Zusatzaufwand nach dem
   Piloten.
3. **Detailseiten** (`team-detail/[slug]`, `player-detail`,
   `match/[id]`, `ligen/[id]`) – mehr Layout-Varianz, mehr Prüfaufwand.
4. **Auth-Flow** (`/login`, `/signup`, `/reset-password`, `AuthShell.js`) –
   eigener Foto-Engpass (Milos Messung: dort sogar bis 4,42× hochskaliert,
   stärker als der Hero) und eigene Entscheidung, ob das Split-Screen-Foto
   ganz entfällt oder verkleinert überlebt – **nicht Teil dieses Piloten**,
   aber mit derselben Logik wie Abschnitt 5 zu lösen.
5. **Eingeloggter Bereich** (`/home`, Spieler-/Team-Admin-Panel) – am
   dichtesten an Formularen/Tabellen, braucht die meiste Sorgfalt bei
   Eingabefeldern auf Dunkel (Fokus-Ringe, Fehlerzustände, `Skeleton`).
6. **Rechts-/Statikseiten** (Impressum, Datenschutz, Kontakt, Feedback,
   About) – niedrigste visuelle Priorität, nur Token-Konsistenz nötig;
   lange Fließtexte hier sind der Grund, warum `paper-50`/`ink-950` mit
   17,97:1 bewusst so großzügig über AA liegt.

---

## 5. Der Engpass: Hero-Foto

Das Hero-Foto trägt in dieser Richtung **keine Wirkung mehr** – das ist die
Antwort auf die im Auftrag gestellte Alternative. Konkret:

- `HeroScrollStage.js` verliert die `backgroundImage`-Prop und das
  `bg-black/65`-Overlay ersatzlos. Der Grund wird flaches `ink-950`.
- Die Wirkung kommt stattdessen aus drei Dingen, die alle bereits existieren
  oder reine Vektorarbeit sind: der großen Big-Shoulders-Headline, den
  vorhandenen Vektor-Glyphen (Ball/Emblem/Spielfeldbogen,
  `HeroGlyphs.js` – schon heute reines SVG, hängt gar nicht am Foto) und der
  bereits gebauten Scroll-Choreografie (Ball-Ankunft am CTA).
- **Nebeneffekt, der es wert ist, benannt zu werden:** Text über einem Foto
  mit Overlay ist immer ein Kontrast-Risiko (abhängig vom Bildausschnitt,
  Ken-Burns-Zoom, Gerätehelligkeit). Text auf flachem `ink-950` ist
  rechnerisch und dauerhaft bei 17,97:1 – die neue Richtung löst also nebenbei
  ein latentes Barrierefreiheits-Risiko, ohne dass das der ursprüngliche
  Auftrag war.
- **Wenn Patrick/Jonatan trotzdem fotografieren wollen** (z. B. für
  `AuthShell.js`, wo der Foto-Engpass laut Milos Messung sogar noch größer
  ist): Zielmaß **≥ 3.600 px lange Kante** (Milos Empfehlung,
  `docs/HERO-ASSETS-2026-08-11.md`), moderne Handykameras erreichen das
  locker. Bildaufbau dann bewusst ruhig in der Mitte (wenig Bewegung/Kontrast
  genau dort, wo Text/Buttons sitzen), damit harte Zuschnitte bei
  21:9-Desktop bis zum schmalen `AuthShell`-Panel nicht zufällig Gesichter
  abschneiden. Bis dahin trägt in dieser Richtung nirgends ein Foto die
  Hauptlast – das ist bewusst so gebaut, nicht nur für den Piloten
  überbrückt.

---

## 6. Bewegungsarbeit: was übernommen wird, was sich ändert

Alle drei bestehenden Bewegungs-Bausteine bleiben **strukturell
unverändert** – sie arbeiten mit `transform`/`opacity`/`clip-path` und
Vektor-Logik, nicht mit Farbentscheidungen. Nur die Farbwerte, die sie
referenzieren, wechseln:

- **`Reveal.js`** – reine Transform/Opacity-Animation, keine Farblogik,
  **unverändert**.
- **`HeroScrollStage.js`/`HeroGlyphs.js`** – Logik unverändert, Grund wird
  flach (Abschnitt 5), Glyphen-Füllfarben von `brand-400`/Weiß/`slate` auf
  die neuen `brand`/`paper`/`mist`-Tokens umgehängt.
- **`FeatureProgressRail.js`** – Logik unverändert, aber **zwei hart
  kodierte Hex-Werte im JS** (`#f97316`, `#e5e7eb`) müssen von Hand ersetzt
  werden (siehe 4.1) – eine reine Tailwind-Config-Änderung reicht hier
  nicht.
- **`FeatureMocks.js`** (`CountUp`-Zahlen, Kader-/Ergebnis-/Tabellen-
  Choreografie) – Zeit-/Sequenz-Logik unverändert, alle Gray/White/Brand-50-
  Referenzen auf `ink`/`paper`/`mist`/`brand` umgehängt (Detail-Liste in
  4.1). Die „Doppelt bestätigt"-Szene (`MatchMock`) gewinnt inhaltlich sogar:
  Die drei nebeneinanderstehenden Zahlen („meldet 78" · „78 : 65 Bestätigt" ·
  „meldet 65") funktionieren in Geist Mono als echte Tabellen-Ziffern noch
  überzeugender als bisher in Inter.

---

## 7. Kollegen einbezogen

- **Nele (marketing-manager):** nicht eingebunden für dieses Dokument – der
  Auftrag ist ausdrücklich Gestaltung, kein neuer Text-/Kampagnen-Entwurf.
  Bestehende Copy (Nele) und Claims (Nora) bleiben wörtlich unverändert,
  nur die Trägerfläche darum wechselt.
- **Milo (medien-produzent):** seine Messung (`docs/HERO-ASSETS-2026-08-11.md`)
  ist die Grundlage für Abschnitt 5 – ohne sie wäre die
  „Foto trägt keine Wirkung"-Entscheidung eine Vermutung statt ein
  belegter Befund.
- **Kein Auftrag an Rieke/Frieda:** betrifft nur Bewerbungsdesign bzw.
  Versand/Druck, hier nicht einschlägig.
- **Nächster Schritt gehört Patrick:** Er baut den Piloten; **Kai**
  (Security-/Diff-Review) und **Tobias** (unabhängiges Browser-Gate, mobil
  zuerst) prüfen danach wie bei jedem Deploy. Ich selbst sollte den fertigen
  Piloten im Browser-Preview gegenprüfen (Mobile + Desktop,
  `resize_window`), sobald er steht – das kann ich in dieser Session nicht
  vorwegnehmen, weil es noch keinen Code gibt.

---

## 8. Recherche-Grundlage (Prinzipien, keine Kopie)

- **Google Fonts – Big Shoulders** (fonts.google.com/specimen/Big+Shoulders):
  kondensierte, für das Chicago Design System gezeichnete Superfamilie,
  Signage-/Anzeigetafel-Herkunft. Übernommen: die kondensierte, laute
  Proportion für Headlines/Ziffern. Nicht übernommen: das Stencil-/Inline-
  Substyle der Familie (zu dekorativ für Fließ-UI).
- **Google Fonts – Geist / Geist Mono** (fonts.google.com/specimen/Geist,
  .../Geist+Mono): Vercels variable Neo-Grotesk samt Mono-Pendant.
  Übernommen: die Idee, UI-Text und Tabellen-Ziffern konsequent zu trennen
  (zwei „Register" derselben Familie). Nicht übernommen: Vercels eigenes
  Farbsystem (Schwarz/Weiß/Blau) – das ist deren Marke, nicht unsere.
- **Fonts In Use – „tabular numerals"** (fontsinuse.com/tags/14097/tabular-
  numerals) und Recherche zu Live-Score-Interfaces: der Befund, dass
  tabellarische Ziffern bei Live-Updates „Sprung"-Artefakte in Spaltenbreiten
  verhindern. Übernommen: Geist Mono konsequent für alle sich ändernden
  Zahlenwerte (Punkte, Tabellenplätze). Nicht übernommen: reine
  Broadcast-Overlay-Optik (LED-Segment-Schriften u. Ä. – zu kostümhaft für
  ein Alltagsprodukt).
- **Recherche zu Scoreboard-/Sport-Dashboard-Konventionen** (u. a. zu
  chroma-tauglichen dunklen Anzeigetafel-Hintergründen für Broadcast/Beamer):
  Befund, dass ein dunkler Grund für Sport-Statistik-Flächen eine
  *funktionale*, nicht nur ästhetische Tradition hat. Übernommen: dunkler
  Grund als inhaltlich begründete Wahl, nicht als „AI-Dark-Mode-Reflex".
  Nicht übernommen: Neon-/Glow-Digitalanzeigen-Optik – bewusst durch
  gedeckte, entsättigte Statusfarben ersetzt (Abschnitt 2.1).
- **Redesign-Skill-Audit** (`redesign-existing-projects`, projektintern):
  die systematische Checkliste hinter Abschnitt 1 – jeder dort benannte
  Befund (Karten, Radien, Pills, Icons, Farbverlauf) stammt aus diesem
  Abgleich, nicht aus freier Beobachtung.

*(Awwwards/Godly/Pinterest wurden gezielt nach aktuellen Sport-/Scoreboard-
Referenzen durchsucht; konkrete Einzel-Sites mit Sport-Community-Fokus waren
zum Suchzeitpunkt nicht eindeutig auffindbar – die belastbaren, zitierfähigen
Funde waren die typografischen/Kontrast-Quellen oben. Ehrlich benannt statt
mit erfundenen Beispiel-Links aufgefüllt.)*

---

## 9. Selbsttest

Würde ein gutes Designstudio das mit seinem Namen unterschreiben? Die
Richtung hat einen echten, benennbaren Grund (Anzeigetafel/Halle), einen
gerechneten statt behaupteten Kontrast-Nachweis, einen realen Fund (Logo
trägt bereits Orange) statt einer beliebigen neuen Farbe, und löst den
Foto-Engpass, statt ihn zu verstecken. Das einzige offene Risiko ist
technisch (next/font-Verfügbarkeit der drei Google-Fonts in dieser
Next-Version) – dafür steht ein Fallback in Abschnitt 2.2. Ja, mit einer
Einschränkung: Der Beweis steht erst, wenn der Pilot im Browser auf
375px und Desktop tatsächlich verifiziert ist – das ist ausdrücklich
Patricks nächster Schritt, nicht meine Behauptung.
