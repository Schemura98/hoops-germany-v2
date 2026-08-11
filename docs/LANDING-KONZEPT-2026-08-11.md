# Landing-Konzept v3: Die Feature-Strecke als Spielzug

Auftrag von Patrick, 11.08.2026 abends. Erstellt von Vivien (design-spezialistin). **Status:
Konzept + Spezifikation, noch KEIN Code.** Bezieht sich auf `components/landing/LandingFeatures.js`
(„Alles, was du brauchst"). Das Hero-Konzept (`docs/HERO-KONZEPT-2026-08-11.md`) bleibt unverändert
bestehen und wird hier nur referenziert — dieses Dokument ersetzt es nicht.

---

## Kurzfassung

Patrick hat zu Recht gesagt: Was live ist, ist ein Akzent, kein Erlebnis. Sein Schwerpunkt liegt
diesmal **nicht im Hero**, sondern in der Feature-Sektion — die soll man sich scrollend *erarbeiten*
und dabei die Plattform verstehen, „spielerisch".

**Die Antwort ist NICHT ein zweites Pinning-Bauwerk wie im Hero.** Recherche und eigene Prüfung
zeigen übereinstimmend: Durchgehendes Scroll-Scrubbing/Pinning ist für eine Liste von sechs
Funktionskarten das falsche Werkzeug — teuer in Mobil-Zeit, technisch riskant, und laut aktueller
Fachmeinung („Scrollytelling... suits narrative journalism, not feature lists", siehe
Inspirations-Notiz) für genau diesen Content-Typ nicht die empfohlene Lösung.

**Die Antwort ist: Die sechs bereits gebauten Mockups (`ProfileMock`, `RosterMock`, `MatchMock`,
`TableMock`, `ScoutingMock`, `FeedMock`) bekommen echte Choreografie.** Statt nur einzublenden,
*spielen* sie beim Scrollen-ins-Bild ihre eigentliche Funktion einmal vor: der Kader füllt sich
Slot für Slot, die Tabelle sortiert sich nach einem Spieltag neu, ein Ergebnis wird sichtbar von
zwei Seiten unabhängig gemeldet und dann automatisch bestätigt. Eine dünne, verbindende
Fortschritts-Leiste macht aus der Kartenliste eine spürbare Strecke — ohne eine einzige Sekunde
zusätzliche Scrollzeit zu kosten. Kein neues Bildmaterial nötig, keine neue Abhängigkeit, volle
Wiederverwendung der bewährten `useInView`/`CountUp`-Technik aus dem eigenen Bestand.

---

## 1. Auftragsspiegelung

- **Ziel:** Aus der Feature-Liste eine Strecke machen, die man scrollend durchläuft und dabei
  versteht, was die Plattform kann — „spielerisch", mit Basketball-Vokabular, ohne kindisch zu
  wirken.
- **Medium:** `components/landing/LandingFeatures.js` auf der Startseite, zwischen Hero und
  „So funktioniert's".
- **Zielgruppe/Nutzungskontext (bereits von Nele geklärt,** `docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md`):
  mobil dominiert, der Kampagnen-QR führt an der Startseite komplett vorbei direkt auf `/signup`.
  Diese Sektion trifft also **nicht** den Halle-Scan-Moment, sondern organischen Traffic,
  Rückkehr-Besucher und alle, die die URL selbst eintippen — für diese Gruppe zählt Verständnis
  mehr als Tempo-um-jeden-Preis (anders als beim Hero, wo Nele „schnell zum Ziel" empfohlen hat).
  Das ist die Rechtfertigung, hier gestalterisch mehr zu investieren als im Hero.
- **Vorhandene CI/Assets (Pflicht-Startpunkt):** Navy/Orange-Designsystem, `Reveal`/`useInView`/
  `CountUp` als bewährte Scroll-Reveal-Bausteine, die sechs Mockups in `LandingFeatures.js` als
  fertiges „Bühnenbild", die rAF-/Scroll-Listener-Disziplin aus `HeroScrollStage.js` als
  Technik-Vorbild. Alles wiederverwendet, nichts davon wird verworfen.
- **Harte Grenze (von Patrick):** Alle sechs Funktionen und Inhalte bleiben vollständig erhalten,
  keine Route ändert sich, jeder heutige Einstiegspunkt bleibt erreichbar. Ich darf am Layout
  arbeiten, nicht an der Funktionsabdeckung.

---

## 2. Bestandsaufnahme

`components/landing/LandingFeatures.js` ist bereits gut vorgearbeitet, nicht neu zu erfinden:

- Sechs Feature-Blöcke in alternierendem Zickzack (`md:flex-row-reverse` bei ungeradem Index),
  jeder mit Icon+Titel+Text links/rechts und einem „Produkt-Mockup" aus echten Tailwind-Elementen
  (kein Bild/Screenshot) rechts/links: `ProfileMock` (Statistik-Kacheln mit `CountUp`), `RosterMock`
  (Kader-Zeilen), `MatchMock` (Ergebnis + „Bestätigt"-Badge), `TableMock` (Tabellen-Zeilen mit
  `CountUp`), `ScoutingMock` (Tryout-Karte mit Avatar-Stack), `FeedMock` (Post-Karte mit Like/
  Kommentar-Zahlen).
- `Reveal.js`/`useInView.js`: bewährter, produktionsgetesteter Einzel-Trigger („einmal sichtbar →
  bleibt sichtbar", reduzierte Bewegung = sofort sichtbar, kein Warten). `CountUp.js` nutzt exakt
  dasselbe `useInView`-Muster bereits **innerhalb** der Mockups, mit einem eigenen, von der äußeren
  `Reveal`-Fläche entkoppelten Trigger (`threshold: 0.4`). Das ist die Vorlage, die ich für alle
  sechs Szenen verallgemeinere — keine neue Technik, eine bestehende zu Ende gedacht.
- `HeroScrollStage.js`/`HeroGlyphs.js`: die bewährte rAF-+Scroll-Listener-Disziplin (ein
  zentraler Listener, `passive: true`, direkte Style-Mutation ohne Re-Render, `getBoundingClientRect`
  ausschließlich im rAF-Callback) — genau diese Disziplin übertrage ich unten auf die verbindende
  Fortschritts-Leiste.
- `tailwind.config.js`: `brand-*`-Palette, `ease-out-strong`-Timing-Kurve — beides direkt nutzbar,
  keine neuen Tokens nötig.
- `app/page.js`: Reihenfolge Hero → Onboarding-Checklist → **Features** → „So funktioniert's" →
  News → CTA bleibt unverändert; diese Sektion wird nicht verschoben.

---

## 3. Trend-Sweep (Pflicht-Inspirations-Notiz, 11.08.2026)

Recherchiert per WebSearch/WebFetch, öffentliche Quellen, keine Logins. Prinzipien übernommen, kein
Layout und keine Assets kopiert.

| Quelle | Was daran stark ist | Übernommen | Bewusst nicht übernommen |
|---|---|---|---|
| **Lovable, „Scrolling Designs: 8 Patterns and When to Use Each"** (https://lovable.dev/guides/scrolling-designs-patterns-when-to-use) | Klare Handlungsempfehlung nach Content-Typ statt Trend-Bauchgefühl: „Scrollytelling... demands significant resources; suits narrative journalism, not feature lists". Explizite Warnung vor Parallax/Infinite-Scroll für genau unseren Fall. | Verzicht auf durchgehendes Pinning/Scroll-Scrubbing in dieser Sektion; `IntersectionObserver`-getriggerte Einzel-Animationen als Haupttechnik. | CSS `scroll-snap` — würde erzwingen, dass jede Karte hart einrastet; bei sechs unterschiedlich hohen Karten auf wechselnden Bildschirmgrößen zu starr, nimmt dem Nutzer das Lesetempo ab. |
| **Brad Holmes, „Why Most Scroll Animations Miss What Apple Gets Right"** (https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/) | Der „Restraint Test": „If the animation makes the product feel smarter, keep it. If it makes the designer feel smarter, delete it." Plus: Timing an die Erzählung koppeln, nicht an Asset-Maße. | Jede Bewegung in der Szenentabelle unten hat eine geprüfte Erklär-Funktion; ein einheitliches Timing-Raster (`threshold:0.4`, gleiche Easing-Kurve) statt Sonderfall je Karte. | Apples Bildsequenz-/Video-Choreografie selbst — dafür fehlt Hallenmaterial, siehe Abschnitt 4. |
| **Awwwards, Sammlungen „Storytelling" / „Product features"** (https://www.awwwards.com/inspiration_search/Storytelling/, https://www.awwwards.com/inspiration/product-features-ethnocare) | Die überzeugendsten Beispiele erzählen mit echten Produktdaten statt mit reiner Dekoration. | Prinzip „Bewegung = der eigentliche Dateninhalt (Tabelle, Kader, Ergebnis), nicht Beiwerk drumherum". | Die dort oft eingesetzte Video-/Bildsequenz-Technik — kein passendes Filmmaterial vorhanden. |
| **DRIP-Video-Notiz** (`docs/INSPIRATION-SCROLL-BEISPIEL-2026-08-10.md`, bereits vorhandene Referenz) | „Eine Botschaft je Szene", klare Zählung der Abschnitte. | Jede der sechs Szenen bekommt genau eine Kernaussage (siehe Szenentabelle). | „Orbit-Text um ein gepinntes Objekt" — kein Pin in dieser Sektion, Begründung Abschnitt 6. |
| **Chrome for Developers, „Animate elements on scroll with Scroll-driven animations"** (https://developer.chrome.com/docs/css-ui/scroll-driven-animations) | Technische Referenz zu nativen `view-timeline`/`animation-timeline: scroll()`-Animationen. | Bestätigt die im Hero-Konzept bereits getroffene Entscheidung: IO-getriggerte, einmalige CSS-Transitions sind robuster/breiter unterstützt als `animation-timeline: scroll()` (Safari-Reife). | Kein Kurswechsel — native Scroll-Timelines bleiben (noch) nicht der Hauptweg. |

**Kernbefund der Recherche, der dieses Konzept trägt:** Die aktuell beste Fachmeinung rät bei
Feature-Listen aktiv **von** Scrollytelling/Pinning **ab** und **zu** IO-getriggerten
Einzel-Choreografien. Das deckt sich mit der ehrlichen technischen Einschätzung unten (Abschnitt 6)
und mit Neles Mobile-Tempo-Befund — drei unabhängige Quellen kommen zum selben Schluss.

---

## 4. Ehrliche Einordnung: Wo „Apple-artig" mit diesem Material nicht einlösbar ist

Patrick hat „wie Apple" als Referenz genannt. Das verdient eine ehrliche Antwort, keine Behauptung.

**Nicht einlösbar:** Apples Produktseiten leben von choreografierten Bildsequenzen/Videos —
ein iPhone, das sich beim Scrollen dreht, ein MacBook, das sich aufklappt. Das setzt echtes,
kontinuierliches Foto-/Filmmaterial voraus, das für Hoops Germany nicht existiert (kein
Hallenmaterial, siehe bereits dokumentierter Materialbefund im Hero-Konzept). Es ohne dieses
Material zu simulieren, hieße entweder Stock-Ware einzusetzen (verboten laut eigener
Ausschlussliste) oder ein aufwendiges 3D-/Illustrations-Ersatzobjekt zu bauen, das inhaltlich nichts
mit der Plattform zu tun hat — beides falsch für diesen Auftrag.

**Was stattdessen den größten Effekt bringt — und warum das sogar näher am eigentlichen Produkt
ist:** Apples Objekt ist ein physisches Produkt, das gezeigt werden muss. Unser „Produkt" ist
**Verhalten von echten Daten** — ein Ergebnis, das bestätigt wird; eine Tabelle, die sich sortiert;
ein Kader, der sich füllt. Das lässt sich, anders als Hallenfotos, mit vorhandenen Tailwind-Bausteinen
**echt** zeigen, nicht nachstellen. Für eine Community-Plattform ist das die glaubwürdigere Wahl:
Ein Betrachter sieht keine Marketing-Animation, sondern eine korrekte Miniatur dessen, was im Produkt
tatsächlich passiert. Das ist die Übernahme, die zählt: **Apples Disziplin** (eine Aussage je
Szene, jede Bewegung mit Zweck, konsequentes Timing-Raster) — nicht Apples **Werkzeugkasten**
(Bildsequenzen).

---

## 5. Kernkonzept: „Ein Spielzug in sechs Szenen"

Die sechs bestehenden Feature-Karten werden zu einer **Spielzug-Chronologie** gerahmt — nicht als
starre Pflichtreihenfolge, sondern als der typische Weg eines neuen Nutzers durch eine Saison:
eigenes Profil → Team/Kader → Spielplan & Ergebnis → Tabelle → Transfermarkt → Community. Das ist
keine willkürliche Nummerierung (die `frontend-design`-Leitlinie warnt zu Recht davor, Zahlen
ohne echten Sequenz-Sinn zu vergeben) — die heutige Kartenreihenfolge in `LandingFeatures.js` ist
bereits chronologisch sinnvoll, ich erfinde sie nicht neu, ich benenne sie nur.

Zwei Bauteile tragen die Idee, beide additiv zum Bestehenden:

1. **Choreografierte Mockups** (Hauptteil, größter Effekt): Jede Karte spielt beim Ins-Bild-Kommen
   einmal ihre eigentliche Funktion vor, statt nur einzublenden.
2. **Fortschritts-Leiste** (verbindendes Element, kleiner Aufwand): eine dünne, scroll-synchrone
   Leiste, die die sechs Karten optisch zu einer Strecke verbindet — ohne eine einzige Sekunde
   zusätzliche Scrollzeit zu kosten (siehe Abschnitt 6, warum bewusst kein Pin).

---

## 6. Szenen-Spezifikation (konkrete Zahlen)

Gemeinsamer Trigger für alle sechs Szenen: `useInView({ threshold: 0.4 })` — derselbe Wert, den
`CountUp.js` bereits produktiv nutzt. Ein Trigger, einmalig, „läuft nicht rückwärts" (wie
`Reveal`/`CountUp` heute schon). Alle Bewegungen ausschließlich `transform`/`opacity`/`clip-path`
(inset-Variante, kein Filter/Blur). Reduzierte Bewegung: Endzustand rendert sofort, keine der
folgenden Zeitleisten läuft (identisches Muster zu `CountUp`/`Reveal` heute).

| # | Szene (Spielzug) | Botschaft | Zeitleiste ab Trigger | Was sich bewegt und was es erklärt |
|---|---|---|---|---|
| 1 | **Aufstellung** — Profil & Statistik | Deine Zahlen, sobald du anfängst | 0–900 ms | `PTS`/`AST`/`REB` zählen 0→Zielwert hoch (**unverändert, bereits gebaut** — `CountUp` in `ProfileMock`). Kein zusätzlicher Aufwand nötig. |
| 2 | **Kader komplett** — Team & Kaderverwaltung | Ein Kader füllt sich Slot für Slot | 0/150/300 ms (Zeilen), 300–700 ms (Zähler) | Die drei Kader-Zeilen starten bei `opacity:0 translateY(8px)` und blenden **nacheinander** ein (Stagger 150 ms, Dauer 400 ms, `ease-out-strong`) — wie ein Kader, der Spieler für Spieler eingetragen wird. Parallel zählt „12 Spieler im Kader" von 0 hoch (`CountUp`, 500 ms), endet kurz nach der letzten Zeile. |
| 3 | **Doppelt bestätigt** — Spielplan & Ergebnisse (**Signature-Szene, größter Effekt**) | Beide Teams melden getrennt — das System bestätigt automatisch | 0–400 ms / 450–850 ms / 900–1050 ms / 950–1300 ms / 1150–1400 ms | Team-A-Score „78" blendet mit einem kleinen Tag „Team A · eingereicht" darunter ein (0–400 ms). Team-B-Score „65" folgt mit eigenem Tag „Team B · eingereicht" (450–850 ms, zeitversetzt, nicht gleichzeitig — genau das macht den unabhängigen Doppel-Check sichtbar). Beide Tags blenden aus (900–1050 ms). Der zentrale Score „78 : 65" skaliert mit leichtem Überschwung ein (0,92→1,04→1, 950–1300 ms). Das grüne „Bestätigt"-Pill blendet zuletzt ein (1150–1400 ms). Gesamtlaufzeit ≈1,4 s, einmalig. |
| 4 | **Tabelle sortiert sich** — Ligen & Tabellen | Nach jedem bestätigten Spiel setzt sich die Tabelle neu | 0–550 ms (Tausch), 0–650 ms (Zahlen) | Anfangszustand (nur im animierten Modus, vor dem Trigger): Platz 1 und 2 stehen bewusst vertauscht, beide gedimmt (`text-gray-400`, kein Highlight). Ab Trigger tauschen beide Zeilen per `transform: translateY()` die Position (550 ms, `ease-out-strong`) — **kein DOM-Reorder**, damit kein Layout-Sprung (CLS) entsteht, feste Zeilenhöhe als Voraussetzung. Sobald Rang 1 seine Endposition erreicht, blendet der `bg-brand-50`-Highlight ein. Die Punktzahlen zählen parallel hoch (`CountUp`, bereits vorhanden). |
| 5 | **Der nächste Zug** — Tryouts & Transfermarkt | Sichtbar für jeden, der noch einen Platz sucht | 0/150/300 ms (Avatare), 300–700 ms (Zähler) | Die drei Avatar-Kreise (`EK`/`TR`/`JW`) poppen nacheinander ein (Stagger 150 ms, `scale(0.6→1.05→1)`, 350 ms) — wie Bewerbungen, die eintrudeln. „5 Bewerbungen" zählt danach hoch (`CountUp`, 400 ms). |
| 6 | **Nachspielzeit** — Community & News | Dein Beitrag — und die Reaktionen, die er bekommt | 0–500 ms / 350–600 ms (Textzeilen), 650–950 ms (Like), 900–1050 ms (Kommentar) | Die beiden grauen Text-Balken „schreiben sich" per `clip-path: inset(0 X% 0 0)` (100%→0 %, links nach rechts) — zuerst die volle Zeile (0–500 ms), zeitversetzt die kürzere (350–600 ms). Danach poppt das Herz-Icon (`scale 0.7→1.15→1`, 200 ms) synchron mit dem Like-`CountUp` (0→24, 650–950 ms), zuletzt blendet „6" Kommentare ein (900–1050 ms). |

**Warum diese sechs Bewegungen und keine weiteren:** Jede zeigt eine Funktion, die heute nur als
Text behauptet wird, jetzt als Verhalten. Keine Bewegung ist Dekoration — das ist der „Restraint
Test" aus der Recherche, angewendet auf jede einzelne Zeile der Tabelle oben.

---

## 7. Verbindendes Element: die Fortschritts-Leiste

Damit aus sechs Einzel-Momenten eine **Strecke** wird (Patricks Wort), ohne dass ein einziger davon
gepinnt werden muss:

- **Desktop (≥1280px, darunter zu eng für einen sauberen Rand → ausgeblendet, rein additiv, kein
  Funktionsverlust):** ein schmaler, `sticky` positionierter vertikaler Streifen am rechten
  Viewport-Rand, außerhalb des `max-w-6xl`-Containers. Sechs Punkte (8px), verbunden durch eine
  2px-Linie. Eine zweite, überlagerte Linie in `brand-500` füllt sich mit dem Scrollfortschritt der
  gesamten Sektion.
- **Mobil/Tablet (<1280px):** ein 4px hoher, `sticky top-16` positionierter Balken über der volle
  Container-Breite, der sich analog füllt, plus ein kleines Text-Label darüber (`text-[10px]
  font-bold text-gray-500`, z. B. „2 / 6 · Kader"). Blockt nichts — Karten scrollen normal darunter
  weiter, der Balken kostet keine zusätzliche Scrollstrecke.
- **Berechnung (identische Disziplin wie `HeroScrollStage.js`):**
  ```js
  const t = clamp((NAVBAR_HEIGHT - sectionRect.top) / sectionRect.height, 0, 1);
  const activeIndex = Math.min(5, Math.floor(t * 6));
  ```
  Ein zentraler `scroll`-Listener (`passive:true`) + ein `requestAnimationFrame`-Tick für die
  **ganze Sektion** (nicht pro Karte), direkte Style-Mutation (Füllbreite/-höhe) ohne React-Re-Render.
  Das Text-Label wird nur bei Wechsel von `activeIndex` per direktem `textContent`-Schreiben
  aktualisiert (Vergleich mit vorigem Wert, kein Schreiben bei unverändertem Index) — spart
  Schreibzugriffe gegenüber einem Update pro Frame.
- **Reduzierte Bewegung:** Die Leiste bleibt als Orientierung sichtbar (sechs neutrale Punkte /
  ein Balken ohne Füllbewegung), aber **ohne** die scroll-gekoppelte Füllanimation — konsequent
  zur bestehenden Regel, dass `HeroScrollStage.js` unter `prefers-reduced-motion` ebenfalls jede
  scroll-gebundene visuelle Änderung abschaltet, nicht nur die auffälligen Layer.
- **Layer-/Messbudget:** genau **ein** zusätzlicher Scroll-Listener für die ganze Sektion (kein
  Listener pro Karte), **ein** `getBoundingClientRect()`-Aufruf pro Frame (auf den Sektions-
  Container, nicht auf jede einzelne Karte) — bleibt innerhalb des in Abschnitt 9 festgelegten
  Budgets.

---

## 8. Mobile-Pinning: bewusst NICHT eingesetzt — mit klar benannter Grenze

Patricks Freigabe vom 09.08. (kurzes Pinning auf Mobil ist nicht mehr grundsätzlich verboten, wenn
es die Strecke wirklich trägt) wird hier ernst genommen, nicht ignoriert — die Antwort ist trotzdem
**Nein für diese Sektion**, aus drei unabhängigen Gründen:

1. **Der Preis wäre real und unnötig:** Jede der sechs Choreografien in Abschnitt 6 läuft
   automatisch ab, sobald die Karte zu 40 % im Bild ist — sie braucht **keine** Kontrolle über die
   Scroll-Position, um zu funktionieren (anders als der Hero-Ball, der bewusst an die
   Scroll-Geste gekoppelt ist, weil seine Flugbahn *die* Bewegung selbst ist). Ein Pin würde hier
   nur zusätzliche Scrollstrecke kosten, ohne dass die Choreografie dadurch besser würde — genau
   der Zeit-Preis, den Patrick selbst als Maßstab genannt hat, ohne erkennbaren Gegenwert.
2. **Ein zweites Pinning-Bauwerk verletzt das eigene Sparsamkeits-Prinzip:** Der Hero hat bereits
   den einen Signature-Moment der Seite. Zwei gepinnte Passagen auf einer Startseite verwässern
   sich gegenseitig — „Spare deinen Mut für eine Stelle" gilt genauso für Bewegung wie für Farbe.
3. **Drei unabhängige Quellen kommen zum selben Schluss** (eigene Prüfung, Lovable-Leitfaden,
   Neles Mobile-Tempo-Befund aus dem Hero-Check) — das ist kein Bauchgefühl, sondern eine
   belegte Einschätzung.

**Die benannte Grenze, wo ich es doch täte:** Sollte Ronjas Nutzungsprüfung nach dem Livegang
zeigen, dass Szene 3 („Doppelt bestätigt") in der Autoplay-Fassung **nicht verstanden** wird — z. B.
weil Nutzer die zeitversetzte Zwei-Team-Meldung als Zufall statt als System lesen — wäre ein sehr
kurzer, ausschließlich auf diese eine Karte begrenzter Pin (Richtwert: max. 50vh Zusatzstrecke,
deutlich unter der Hero-Größenordnung) der richtige Nachbesserungs-Schritt, nicht die ganze Sektion.
Das ist eine bewusst offene Eskalationsstufe, keine versteckte Zusatzarbeit.

---

## 9. Performance-Budget (konkret, mit Messpunkten)

- **Sechs Szenen, sechs unabhängige `IntersectionObserver`-Instanzen** (über `useInView`, bereits
  produktiv) — **kein** zusätzlicher `scroll`-Listener pro Karte. Die einzelnen Choreografie-Schritte
  laufen als CSS-`transition` mit `transition-delay` (Stagger), nicht als eigener rAF-Loop — noch
  günstiger als der Hero, der `CountUp`-Instanzen ausgenommen (die nutzen intern bereits rAF, aber
  nur während `inView` und für maximal 900 ms, produktiv erprobt).
- **Ein** zusätzlicher zentraler Scroll-Listener + rAF-Tick für die gesamte Sektion (die
  Fortschritts-Leiste, Abschnitt 7) — identische Disziplin zu `HeroScrollStage.js`.
- Ausschließlich `transform`, `opacity`, `clip-path: inset(...)` — kein `filter`, kein Video, keine
  Bildsequenz.
- **Feste Zeilenhöhen** für die Tabellen-Vertauschung (Szene 4) sind Pflicht, nicht optional — sonst
  entsteht durch die `translateY`-Bewegung ein Layout-Sprung (CLS), obwohl kein DOM-Reorder
  stattfindet.
- `getBoundingClientRect()` ausschließlich im rAF-Callback bzw. beim IO-Trigger, nie während des
  React-Renders.

**Messpunkte, die die Umsetzung nachweisen muss** (wie im Hero-Konzept, gleicher Maßstab):
1. Chrome DevTools Performance-Panel, 4× CPU-Throttling, Moto-G4-Profil: durchgängiger Scroll durch
   die gesamte Sektion ohne Long Tasks (>16,7 ms).
2. Lighthouse Mobile (throttled): CLS unverändert zu heute — insbesondere Szene 4 (Tabellentausch)
   gezielt gegenprüfen, das ist der einzige Layer mit echtem Regressions-Risiko.
3. Schneller Fling-Scroll durch die ganze Sektion darf keine Choreografie „nachhängen" lassen, die
   den Scroll selbst blockiert — jede Szene ist in sich abgeschlossen (max. 1,4 s Laufzeit, Szene 3),
   nichts wartet auf eine vorherige Szene.
4. **Test auf echtem Mittelklasse-Android-Gerät** vor Live-Freigabe (nicht nur Emulator) — Pflicht
   laut `emil-design-eng`, hier noch nicht durchgeführt, weil dieses Dokument ein Konzept ist.

---

## 10. Komponentenstruktur (Vorschlag für die Hauptsession)

```
components/landing/
  LandingFeatures.js        Orchestriert weiterhin die sechs Karten (Struktur unverändert:
                             Zickzack, Reveal-Wrapper). Neu: rendert zusätzlich
                             <FeatureProgressRail sectionRef={...} /> als Geschwisterelement.
  FeatureProgressRail.js     NEU. Übernimmt exakt die rAF-/Scroll-Listener-Disziplin aus
                             HeroScrollStage.js, aber ohne Ball/Emblem — nur Balken/Punkte-
                             Fortschritt + Label-Text. ~60–80 Zeilen, kein neues Muster.
  (ProfileMock, RosterMock, MatchMock, TableMock, ScoutingMock, FeedMock)
                             Bleiben in LandingFeatures.js, bekommen je einen eigenen
                             useInView-Trigger (threshold:0.4) für die Choreografie aus
                             Abschnitt 6 — analog zum bereits bestehenden Muster in CountUp.
```

Kein neuer Ordner, keine neue Route, keine neue Abhängigkeit. Die sichtbarste Neuerung
(`FeatureProgressRail.js`) ist bewusst eine Kopie der bewährten Denkweise aus `HeroScrollStage.js`,
nicht eine neue Technik.

---

## 11. Rollout in Stufen (kein Big Bang)

| Stufe | Inhalt | Warum zuerst/danach |
|---|---|---|
| **Stufe 1** | Choreografie für alle sechs Mockups (Abschnitt 6) | Größter Effekt pro Aufwand — die Karten „erklären sich selbst", ohne dass ein neues Bauteil existieren muss. Kein Risiko für Layout-Bruch, da nur Inhalte *innerhalb* bestehender Karten animieren. |
| **Stufe 2** | Fortschritts-Leiste (Abschnitt 7) | Verbindet die in Stufe 1 geschaffenen Einzel-Momente zur spürbaren „Strecke" — sinnvoll erst, wenn die Momente selbst schon etwas zu verbinden haben. |
| **Stufe 3** | „Spielzug X/6"-Eyebrow-Labels + ggf. leichte Text-Rahmung als Saison-Weg | Reine Copy-Ergänzung, additiv zum bestehenden Text — **geht vor Umsetzung an Nele**, da Wortlaut ihre Zuständigkeit ist (Arbeitsteilung laut CLAUDE.md); ich liefere hier nur den Label-Vorschlag, nicht den finalen Text. |
| **Stufe 4 (offen, nur bei Bedarf)** | Kurzer, auf Szene 3 begrenzter Pin | Nur falls Ronjas Nutzungsprüfung nach Stufe 1–3 zeigt, dass die Doppel-Bestätigung nicht verstanden wird (Grenze siehe Abschnitt 8). Kein Auftrag heute. |

Jede Stufe ist für sich funktionsfähig und live-fähig — Stufe 1 allein liefert bereits den größten
Teil des „spielerisch verstehen"-Ziels.

---

## 12. Assets für Milo

**Für alle vier Stufen wird kein neues Bild-/Videomaterial benötigt.** Alle Choreografien bestehen
ausschließlich aus vorhandenen Tailwind-/SVG-Bausteinen (Kreise, Balken, Text, `CountUp`-Zahlen) —
exakt das Material, das die Mockups heute schon verwenden. Das ist keine Lücke, sondern die
bewusste Entscheidung aus Abschnitt 4: Datenverhalten zeigen statt Bildmaterial simulieren, das
nicht existiert. Sollte eine spätere Stufe (z. B. Stufe 4) doch Bildmaterial erfordern, wird das an
dieser Stelle nachgetragen — aktuell nicht der Fall.

---

## 13. Barrierefreiheit & reduzierte Bewegung

- Jede Choreografie hat einen sofort korrekten Endzustand ohne Bewegung (Werte, Reihenfolge,
  Beschriftung identisch zu heute) — deckungsgleich mit dem bereits etablierten `Reveal`/`CountUp`-
  Verhalten.
- Kein Inhalt ist ausschließlich über Bewegung erreichbar — alle Zahlen/Zustände stehen auch im
  Endzustand vollständig im DOM, nichts wird nur „während der Animation" sichtbar.
- Fortschritts-Leiste: dekorativ/`aria-hidden`, keine Tab-Stopps, keine Screenreader-Ansage nötig
  (die Information „6 Funktionsbereiche" steht bereits in der `<h2>`/den Kartentiteln).
- Kontrast der neuen Elemente (Tags „eingereicht", Label „2/6") mindestens WCAG AA gegen den
  jeweiligen Kartenhintergrund — bei Umsetzung mit den bereits im Designsystem geprüften
  Grau-/Brand-Tönen zu erfüllen, kein neuer Farbwert nötig.

---

## 14. Kollegen einbezogen

- **Nele (marketing-manager):** Ihr Kampagnen-Check (`docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md`)
  liefert den Nutzungskontext für diesen Auftrag mit — kein neuer Auftrag an sie nötig, wie von
  Patrick vorgegeben. Stufe 3 (Eyebrow-Copy) geht aber vor Umsetzung an sie, weil Wortlaut ihre
  Zuständigkeit ist.
- **Milo (medien-produzent):** geprüft, kein Auftrag — siehe Abschnitt 12, kein Material nötig.
- **Ronja (retention-analystin):** nach Umsetzung zuständig zu prüfen, ob „man die Funktionen beim
  Scrollen tatsächlich versteht" (Patricks eigentliches Ziel) — insbesondere Szene 3, siehe die
  in Abschnitt 8 benannte Eskalationsgrenze.
- **Nora/Lina:** kein Berührungspunkt in diesem Konzept (kein neuer Fließtext, keine
  Onboarding-Struktur-Änderung) — nur relevant, falls Stufe 3 tatsächlich neue Sätze einführt.

---

## 15. Selbsttest

„Würde ein gutes Designstudio das mit seinem Namen unterschreiben?" — Ja, mit einer Einschränkung,
die ich offen benenne: Ein mutigeres Studio hätte vielleicht das Pinning-Verbot ignoriert und den
„Wow"-Effekt über die Bühne statt über den Inhalt gesucht. Ich habe mich bewusst dagegen entschieden,
weil drei unabhängige Belege (eigene Prüfung, Fachliteratur, Neles Tempo-Befund) in dieselbe Richtung
zeigen und weil der eigentliche Auftrag lautet, Funktionen **verständlich** zu machen, nicht die
Seite spektakulärer aussehen zu lassen. Das ist die ehrlichere, nicht die bequemere Antwort auf
„Apple-artig" — und genau das sollte ein gutes Studio auch so vertreten, statt dem lauteren Wunsch
kosmetisch zu folgen.

---

## 16. Nachtrag 11.08.2026 (nachts): Entscheidungen zum Rest der Startseite

Stufen 1–3 sind gebaut und verifiziert. Auftrag war, über die **restlichen** Abschnitte hinter der
Feature-Strecke zu entscheiden: „So funktionierts", News-Widget, CTA, plus die offene Zahlen-
Animation (Befund 11, `docs/DESIGN-REVIEW-2026-08-10.md`) und ein Gesamtblick auf die Strecke.
Geprüfte Dateien: `components/landing/LandingHowItWorks.js`, `components/NewsWidget.js`,
`components/landing/LandingCTA.js`, `components/ui/CountUp.js`, `app/topscorer/page.js`,
`app/ligen/[id]/page.js`, `app/page.js`.

### 16.1 „So funktionierts" — Patricks Verbindungslinie: NEIN, mit Begründung

Keine Verbindungslinie zwischen den drei Kreisen. Angewendet auf den „Restraint Test" aus der
eigenen Recherche (Abschnitt 3): Die drei Kreise sind bereits durch Nummerierung (1-2-3) und Position
(nebeneinander) eindeutig als Abfolge lesbar — eine sich aufziehende Linie würde keine neue
Information liefern, nur eine bereits verstandene Reihenfolge nachträglich bebildern. Schwerer wiegt:
Es wäre die **dritte** scroll-getriggerte Bewegung in Folge, direkt im Anschluss an sechs bereits
elaborierte Szenen — genau die „Wiederholung derselben Geste", vor der Patrick in seiner eigenen
vierten Frage warnt. Der Signature-Moment der Seite ist die Feature-Strecke; dieser Abschnitt darf
ruhig sein.

**Aber:** Beim Durchsehen fällt eine echte, unbeabsichtigte Wiederholung auf, die ich beheben würde
— keine neue Bewegung, eine Farb-Korrektur:

- Die **ausgeloggte** Variante (`STEPS`) alternierte schon immer bewusst dunkel/orange
  (`s.dark ? navy-Verlauf : bg-brand-500`) — das ist bereits die richtige Zurückhaltung.
- Die **eingeloggte** Variante (`cards`, drei personalisierte Karten) nutzt für **alle drei**
  Icon-Kreise identisch `bg-brand-100`/`text-brand-500` — exakt dieselbe Farb- und Formgeste wie die
  sechs Icon-Kreise der Feature-Strecke direkt darüber, ohne die Alternation der Nachbar-Variante.
  Das ist keine Entscheidung, sondern ein Versehen (beide Varianten sollten denselben Zurückhaltungs-
  Grad haben).

  **Konkrete Korrektur:** Karte 2 (Team-Karte, mittig) bekommt den Navy-Kreis
  (`bg-gradient-to-r from-slate-950 to-slate-800`, `text-white`) statt `bg-brand-100`/
  `text-brand-500`; Karte 1 und 3 behalten Orange. Das spiegelt exakt das Muster, das die
  ausgeloggte Variante schon vorlebt, und bricht die Orange-Wiederholung aus 16.4.

### 16.2 News-Widget und CTA

- **CTA (`LandingCTA.js`): unverändert lassen.** Sie bildet zusammen mit dem Hero den einzigen
  Navy-Rahmen der Seite (Hero → … → CTA) — ein bereits bestehender, guter Bogen, den ich nicht
  anfassen würde. Reveal-Stagger und Button-Microinteractions sind schon vorhanden. Nach einer
  ereignisreichen Strecke ist ein ruhiger Schlusspunkt richtig — das ist die Ausatem-Stelle der
  Seite, kein Ort für mehr.
- **News-Widget (`NewsWidget.js`, volle Variante in `app/page.js`): eine kleine Konsistenz-Korrektur,
  kein neues Muster.** Es ist aktuell der **einzige** Karten-Grid-Abschnitt der ganzen Startseite
  ohne jedes `Reveal` — das ist keine bewusste Zurückhaltung, sondern eine Lücke (jeder andere
  Karten-Grid hat sie: Feature-Strecke, „So funktionierts"). Korrektur: jede Karte im
  `news.map(...)`-Grid mit `Reveal` umschließen, `delay={i * 60}` (6 Karten × 60 ms = max. 300 ms
  Gesamt-Stagger, spürbar schneller als die 90 ms bei „So funktionierts", weil hier sechs statt drei
  Elemente warten), `direction="up"`, exakt das Muster aus `LandingHowItWorks.js` Zeile 86.
  Kompakte Sidebar-Variante (`compact=true`) bleibt unverändert — die sitzt im Feed, nicht auf der
  Landingpage-Strecke.

### 16.3 Zahlen-Animation (Befund 11): Podium-Grenze, mit Zahlen

Ja zu `CountUp`, aber begrenzt — genau der Mittelweg, den ich beim Bauen prüfen sollte:

- **Begrenzung: nur Rang 1–3 (Podium).** Ab Rang 4 steht die Zahl sofort statisch da, keine
  `CountUp`-Instanz, kein `useInView`, kein zusätzlicher Observer.
- **Topscorer (`app/topscorer/page.js`):** `CountUp` für `Ø` und `PKT` je Zeile, aber nur für
  `rank <= 3` → **maximal 6 Instanzen** pro Tabelle (statt 62 bei 31 Zeilen × 2 Zahlen). `Ø` mit
  `decimals={1}`, `PKT` mit `decimals={0}`, beide mit dem bestehenden Default (`duration=900`,
  `threshold:0.4`) — keine neuen Parameter nötig.
- **Rangliste/Tabelle (`app/ligen/[id]/page.js`, `standings`):** `CountUp` für S/N/Diff je Zeile,
  gleiche Grenze `rank <= 3` → **maximal 9 Instanzen** pro Tabelle.
- **Warum genau Podium und nicht z. B. „erste 10":** Die Rang-Einfärbung (`RANK_COLOR`) hebt heute
  schon nur Rang 1–3 farblich hervor — die Grenze existiert im Design bereits, `CountUp` verstärkt
  eine vorhandene Hierarchie, statt eine neue zu erfinden. Das hält die Zahl der Observer klein
  *und* liefert eine inhaltliche Begründung, keine willkürliche Zahl.
- Reduzierte Bewegung: identisch zum bestehenden `CountUp`-Verhalten (Endwert sofort, kein Zählen).

### 16.4 Gesamtblick

- **Was schon stimmt, unverändert lassen:** Der Navy-Rahmen Hero↔CTA trägt die ganze Seite als
  einen Bogen. Die Sektions-Hintergründe alternieren bereits sauber (navy → gray-50 → white →
  gray-50 → navy) — ein Schachbrett-Rhythmus, den ich nicht antasten würde.
  Die Reihenfolge Reveal-Stagger-Werte (90 ms bei Karten-Trios, 150 ms bei Choreografie-Zeilen) ist
  bereits konsistent genug, um nicht wie Zufall zu wirken.
- **Ein echter Fund, behoben in 16.1:** die identische Orange-Kreis-Geste zwischen Feature-Strecke
  und „So funktionierts" (eingeloggt) — direkt hintereinander, ohne Variation. Das war die
  „Wiederholung derselben Geste", nach der gefragt wurde.
- **Kleine Rhythmus-Abweichung:** `app/page.js` Zeile 28 setzt den News-Wrapper auf `py-16`, während
  Features, „So funktionierts" und CTA alle `py-20` nutzen. Auf `py-20` vereinheitlichen — reine
  Abstands-Korrektur, kein neues Element.
- **Kein weiterer Befund.** Die Orange-Dichte durch die ganze Strecke (Feature-Icons, Progress-Rail,
  News-Akzent, CTA-Button) bleibt nach der Korrektur in 16.1 im Rahmen, weil sie sich jetzt mit
  Navy abwechselt statt sich zu wiederholen — kein zusätzlicher Eingriff nötig.

### 16.5 Kollegen einbezogen

- **Niemand neu.** Reine Layout-/Farb-/Grenzwert-Entscheidungen ohne neuen Text, keine neue Route,
  keine neue Zielgruppen-Frage — Neles Kampagnen-Check aus Abschnitt 14 deckt das weiterhin ab.
  Nach Umsetzung bleibt Ronjas Prüfung (Abschnitt 14, Eskalationsgrenze Szene 3) unverändert
  zuständig für die Gesamtstrecke inkl. dieser Ergänzungen.

### 16.6 Selbsttest

„Würde ein gutes Designstudio das mit seinem Namen unterschreiben?" — Ja. Die auffälligste
Entscheidung hier ist ein Nein (keine Verbindungslinie) und eine Grenze (Podium statt aller Zeilen)
— beides bewusster Verzicht zugunsten des einen Moments, der schon trägt, statt ihn zu verwässern.

---

## 17. Nachtrag 12.08.2026: Zwei Entscheidungen aus Ronjas Verständnisprüfung

Grundlage: `docs/RONJA-LANDING-2026-08-12.md` — gemessen (Live-DOM, 100-ms-Raster), nicht geschätzt.
Quellcode selbst nachgesehen (`components/landing/FeatureMocks.js`, `HeroScrollStage.js`) vor der
Entscheidung, nicht nur Ronjas Zahlen übernommen.

### 17.1 M1 — Szene 3 „Doppelt bestätigt": Inhalt statt nur Timing ändern

**Befund bestätigt und selbst nachvollzogen:** `useSequence(animate, reduced, [0, 450, 900, 950,
1150])` in `MatchMock` (`FeatureMocks.js` Zeile 164) erzeugt genau das gemessene Fenster — beide
`text-[9px]`-„eingereicht"-Badges sind rechnerisch von ~800 ms (B fertig eingeblendet) bis 900 ms
(beide beginnen auszublenden) gemeinsam sichtbar: **~100–180 ms**, deckt sich mit Ronjas 180–250 ms.

**Entscheidung: Ich gehe weiter als der Vorschlag — nicht nur länger zeigen, sondern die Badges
nie wieder verschwinden lassen.** Der Vorschlag (Zeitfenster auf ~950 ms strecken) behebt das
Symptom, lässt aber ein Zeitfenster-Problem übrig: Die Aussage bleibt daran gebunden, dass jemand
im richtigen Moment hinschaut. Der eigentliche Fehler ist struktureller Natur — zwei unabhängige
Meldungen als **Zustand** („eingereicht") statt als **Inhalt** (die gemeldete Zahl) zu zeigen, der
danach automatisch wieder ausgeblendet wird. Die robustere Lösung macht die Aussage zeitlos wahr,
nicht nur langsamer falsch:

1. **Inhalt statt Zustand, wie vorgeschlagen:** Aus „eingereicht" wird die tatsächlich gemeldete
   Zahl — „meldet 78" unter Team A, „meldet 65" unter Team B. Übernommen, das ist der wichtigste
   Teil des Vorschlags.
2. **Die beiden Team-Meldungen verschwinden nicht mehr — sie bleiben Teil des Endzustands.**
   Statt „A meldet → B meldet → beide weg → Endstand → Bestätigt" wird die Sequenz auf vier Schritte
   verkürzt: „A meldet → B meldet → Endstand erscheint → Bestätigt" — die beiden Team-Zahlen bleiben
   stehen, während der zusammengeführte Endstand daneben aufscheint. Damit hängt das Verständnis
   nicht mehr an einem Zeitfenster, das man treffen muss (und sei es 950 ms statt 200 ms) — jeder,
   der die Karte zu **irgendeinem** Zeitpunkt nach Ablauf der Animation ansieht, sieht alle drei
   Zahlen gleichzeitig: „meldet 78" · „78 : 65 Bestätigt" · „meldet 65". Das ist der Mechanismus als
   Dauerzustand, nicht nur als Duschblick.
3. **Neue Zeitleiste** (4 statt 5 Marken, `marks = [0, 650, 1550, 1750]`):
   - `t=0`: Team-A-Wert „meldet 78" blendet ein (250 ms) — bleibt sichtbar.
   - `t=650`: Team-B-Wert „meldet 65" blendet ein (250 ms) — bleibt sichtbar. 650 ms Abstand statt
     450 ms, damit A sichtbar allein steht, bevor B folgt (unterstreicht „nacheinander, unabhängig").
   - `t=1550`: Endstand „78 : 65" skaliert ein (0,92→1,04→1, 350 ms) — **überlappt bewusst mit den
     weiterhin sichtbaren Team-Werten** statt sie erst auszublenden. Das ist der Moment, der den
     „Zwei-werden-eins"-Mechanismus tatsächlich zeigt: Ursache (zwei Zahlen) und Wirkung (eine
     Zahl) stehen gleichzeitig im Bild.
   - `t=1750`: „Bestätigt"-Pill blendet ein (250 ms).
   - Bedingungen vereinfachen sich gegenüber heute: `step>=1`/`step>=2` für die Team-Werte (kein
     `&& step<3` mehr, weil nichts mehr ausblendet), `step>=3` für den Endstand, `step>=4` für die
     Pill.
   - Gesamtlaufzeit ≈2,0 s (heute 1,4 s) — länger, aber vertretbar: die Karte kostet weiterhin
     **keine** Scrollzeit (IntersectionObserver, kein Pin), und die Zusatzlänge kauft dauerhafte
     statt transiente Information.
4. **Textgröße:** `text-[9px]` → **`text-[11px]`**, nicht nur auf 10px. Begründung: Dieselbe Karte
   nutzt bereits `text-[11px]` für die Team-Namen direkt darüber („Test Baskets"/„Rhein Hawks") —
   11px ist die vorhandene Mikro-Textgröße dieser Karte, kein dritter neuer Wert. Zusätzlich die
   Zahl im Label stärker gewichten als das Verb, damit das Auge die Ziffer zuerst greift:
   ```jsx
   <span className="text-[11px] font-semibold text-slate-600 ...">
     meldet <span className="font-black text-slate-800">78</span>
   </span>
   ```
5. **`prefers-reduced-motion`: bewusst ANDERS als vorgeschlagen — nicht unverändert lassen.**
   Heute überspringt die reduzierte Fassung die Badges komplett (Ronjas eigener Beleg, dass das
   Vertrauensmerkmal strukturell nur im Fließtext lebt). Weil die Team-Werte jetzt zum **dauerhaften
   Endzustand** gehören und nicht mehr transient sind, ist das Argument von gestern („kein Grund,
   etwas zu zeigen, das gleich wieder weg ist") nicht mehr gültig. Reduzierte Bewegung soll denselben
   Endzustand **sofort** zeigen (kein Timing, aber `step` direkt auf 4) statt ihn wegzulassen — mehr
   Information für reduzierte Bewegung, nicht weniger, ohne dass dafür irgendetwas bewegt werden
   muss (deckt sich mit der schon etablierten Regel „gleicher Endzustand, nur ohne Übergang").
6. **Layout-Risiko, offen benannt statt verschwiegen:** Die Badges sitzen `absolute -bottom-4`
   unterhalb der Avatar-Spalte, kalkuliert für einen **transienten** Zustand. Da sie jetzt dauerhaft
   sichtbar bleiben, muss geprüft werden, ob sie mit der `mb-4`-Lücke vor der Fußzeile („Sa, 20:00 ·
   Sporthalle Nord“) kollidieren. Ich habe das nicht selbst im Browser verifiziert (kein
   Live-Zugriff in diesem Auftrag) — **falls es eng wird, `mb-4` auf `mb-6` an der Avatar-Zeile
   erhöhen** (löst 8px zusätzlichen Puffer, ohne die Kartenhöhe der übrigen fünf Mockups zu
   berühren, da nur `MatchMock` betroffen ist). Bitte von Tobias vor Freigabe gegenprüfen.

**Prüfbarkeit:** Ronjas eigene Methode (Live-DOM-Opacity-Auslese alle 100 ms) direkt wiederholbar —
Erfolgskriterium jetzt einfacher als vorher: Ab `t≈1800 ms` müssen alle drei Werte („meldet 78“,
„78 : 65 Bestätigt“, „meldet 65“) dauerhaft mit Opacity 1 im DOM stehen, nicht nur für ein Fenster.

### 17.2 S2 — Ball auf 375 px sichtbar machen: Dimmen statt Ausblenden

**Ursache selbst nachvollzogen:** `ballOpacityNearText()` (Entscheidung vom 11.08., gegen die
430-px-Textkollision) setzt die Ball-Opacity auf **0**, solange die Ball-Mitte innerhalb des
Textblock-Rects (Badge+Headline+Subline) liegt. Auf 375 px füllt dieser Block einen so großen Teil
der Fallstrecke bis zur Schaltfläche, dass die Regel, die bei 430 px richtig war, auf dem von
Patrick benannten Hauptfall-Breakpoint die Bewegung faktisch verschluckt.

**Entscheidung: c) Abschwächen statt Ausblenden — mit konkretem Bodenwert, nicht nur „irgendwie
schwächer".** Begründung gegen die Alternativen:
- **a) Pro-Zeile statt Block messen:** Löst das Problem nur teilweise (gewinnt Sichtbarkeit in den
  Zeilenzwischenräumen, nicht während der Textzeilen selbst) und bringt echten Mehraufwand
  (`Range.getClientRects()` für umbrechenden Text, mehrere Rects pro Frame statt eines). Für den
  Gewinn nicht gerechtfertigt, wenn (c) das eigentliche Problem direkter löst.
- **b) Bahn nach außen versetzen:** Widerspricht meiner eigenen Begründung vom 11.08. für die
  vertikale Bahn — auf 375 px gibt es nachweislich keinen seitlichen Freiraum (daher vertikal statt
  seitlich). Verworfen.
- **d) Ball auf Mobil ganz streichen:** Wäre das Ende des mobilen Signature-Moments, den Patrick
  gerade erst gegenüber dem reinen CTA-Puls als Mindestanspruch bestätigt hat. Verworfen.

**Konkreter Wert:** Bodenwert **0,2** statt 0 (Ball bleibt schwach, aber durchgehend sichtbar, statt
komplett zu verschwinden):

```js
const TEXT_DIM_FLOOR = 0.2; // vorher: harte 0

function ballOpacityNearText(ballCenterY, textRect) {
  if (ballCenterY < textRect.top - TEXT_FADE_MARGIN) return 1;
  if (ballCenterY < textRect.top) {
    const t = (ballCenterY - (textRect.top - TEXT_FADE_MARGIN)) / TEXT_FADE_MARGIN;
    return 1 - t * (1 - TEXT_DIM_FLOOR);
  }
  if (ballCenterY <= textRect.bottom) return TEXT_DIM_FLOOR;
  if (ballCenterY <= textRect.bottom + TEXT_FADE_MARGIN) {
    const t = (ballCenterY - textRect.bottom) / TEXT_FADE_MARGIN;
    return TEXT_DIM_FLOOR + t * (1 - TEXT_DIM_FLOOR);
  }
  return 1;
}
```

Warum 0,2 und nicht z. B. 0,5: Bei 20 % Deckkraft entsteht hinter dem Text kein scharfkantiges
„Aufblitzen zwischen Buchstaben“ mehr (das war der eigentliche Grund für die 0-Entscheidung gestern)
— nur ein schwacher warmer Schimmer, der die Bewegung durchgehend erkennbar hält, ohne mit dem Text
zu konkurrieren. Sobald die Ball-Mitte den Textblock verlässt (inkl. 24-px-Fade-Puffer, unverändert),
kehrt die volle Opacity 1 zurück — insbesondere für die Ziel-Ankunft am Korb-Emblem, die laut
Konzept ohnehin **außerhalb** des Textblocks liegt (CTA-Block kommt nach der Subline) und dadurch
bereits mit voller Deckkraft läuft.

**Offen benanntes Restrisiko:** Bei 430 px könnte die ursprünglich behobene Textkollision in stark
abgeschwächter Form wieder minimal wahrnehmbar werden (20 % statt 0 % Deckkraft hinter dem Wort
„Ligen“). Das ist ein bewusst akzeptierter Kompromiss, kein Übersehen — bei 20 % Deckkraft entsteht
kein scharfer Buchstaben-Kontrast mehr, der wie ein Rendering-Fehler wirkt. **Tobias sollte beide
Breiten (375 px und 430 px) nach der Umsetzung gegenprüfen**, damit diese Einschätzung nicht nur
behauptet, sondern verifiziert im Gate steht.

### 17.3 Kollegen einbezogen

- **Ronja:** Grundlage dieses Nachtrags, kein neuer Auftrag — ihre Messmethode (Live-DOM-Opacity,
  100-ms-Raster) ist in 17.1 direkt als Prüfvorschlag für die Nachbesserung übernommen.
- **Niemand sonst neu.** Beide Entscheidungen sind reine Timing-/Werte-/Inhalts-Korrekturen an
  bereits bestehender, freigegebener Mikro-Copy („eingereicht“ → „meldet X“ ist Zahlen-Beschriftung
  einer Mockup-Karte, keine Marketing-Aussage — fällt nicht unter Neles Zuständigkeit). Tobias prüft
  beide Punkte im nächsten Gate-Durchlauf (17.1 Layout-Kollision, 17.2 Restrisiko 430 px).

### 17.4 Selbsttest

„Würde ein gutes Designstudio das mit seinem Namen unterschreiben?“ — Ja, mit einer bewussten
Abweichung vom Vorschlag, die ich offen begründet habe: Ein längeres Zeitfenster wäre die bequemere,
kleinere Änderung gewesen. Die dauerhafte Zwei-Zahlen-Anzeige ist die unbequemere, weil sie eine
zusätzliche Zeile Zustand im UI hinzufügt (und ein Layout-Risiko, das ich nicht selbst verifizieren
konnte) — aber sie löst das Problem strukturell statt es nur zu verlangsamen, und das ist der
Maßstab, den ich an meine eigene Szene anlege.
