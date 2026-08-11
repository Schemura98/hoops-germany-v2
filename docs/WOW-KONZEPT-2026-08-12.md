# Wow-Konzept – Apple-Mechanik trifft Basketball
## Auftrag von Patrick, 12.08.2026 – „Noch nicht das Ausmaß an Wow-Effekt … ähnlich wie auf einer Apple-Website"

Erstellt von Vivien (design-spezialistin). Status: **Recherche + Konzept, kein Code.**
Ausgangspunkt ist der umgesetzte Stand aus `docs/VISUELLE-RICHTUNG-2026-08-12.md`
(Commit `d28e800`) – Struktur, Radien, Typografie (Big Shoulders/Geist/Geist Mono)
und die drei bestehenden Bewegungs-Bausteine (`HeroScrollStage.js`,
`FeatureMocks.js`, `FeatureProgressRail.js`, `Reveal.js`) bleiben unverändert
gültig. Was sich ändert, steht in Abschnitt 0.

---

## 0. Korrektur während der Arbeit: Navy statt warmer Ink-Grund

Während dieses Dokument entstand, kam Patricks Nachtrag: **„Navy Blau und
Orange war auch passend dafür"** – bezogen auf die Verbindung von Innovation
und Basketball-Thema. Das ist eine Korrektur an meiner vorherigen Richtung
(„Anzeigetafel" auf warmem `ink`-Grund, `docs/VISUELLE-RICHTUNG-2026-08-12.md`
Abschnitt 2.1), und Patrick entscheidet das, nicht ich. **Dieses Dokument ist
komplett auf `navy` + `#F07A27` entworfen**, nicht auf dem warmen Ink.

**Meine fachliche Begründung für den warmen Grund bleibt im Protokoll**
(zur Transparenz, nicht als Widerspruch): Navy ist die naheliegendste aller
Basketball-Dunkel-Optionen – genau das war mein Einwand, weil naheliegend oft
generisch endet, und weil Navy-Verlauf bereits die alte Seite trug
(`from-slate-950 to-slate-800`, in Abschnitt 1 des Vorgänger-Dokuments explizit
als Generik-Befund benannt). **Dieses Risiko ist mit dem heutigen Auftrag
sogar größer**, nicht kleiner: „Apple-Wow" und „Navy" zusammen sind die
direkte Straße zurück zu „austauschbares Tech-SaaS-Dark-Mode", wenn Navy als
reiner Farbwechsel ohne inhaltliche Bindung an Basketball behandelt wird.

**Was das für dieses Konzept bedeutet:** Ich baue nicht „Apple-Layout mit
Navy statt Ink". Ich sorge dafür, dass **jede Navy-Fläche etwas Konkretes
trägt** – Hallendunkel bei Flutlicht, das Court bei Nacht, die Anzeigetafel,
die im Dunkeln leuchtet – und dass die Apple-*Mechanik* (Abschnitt 3) konsequent
an **Basketball-Inhalt** hängt, nicht an einem generischen Marken-Layout. Das
ist die eigentliche Antwort auf Patricks Punkt 2 im Auftrag: „Nicht Apple-Layout
mit orangen Akzenten, sondern welche Apple-Mechanik hier Basketball erzählt."

### Navy-Zielwerte (falls die parallel gesetzten Tokens justiert werden sollen)

Ich kenne die exakten Werte nicht, die parallel eingezogen werden – falls
nachgeschärft werden soll, hier **gerechnete** Zielwerte (WCAG-Formel,
Node-Skript, keine Schätzung), bewusst **kein** Verlauf, bewusst **kein**
Cyan-/Violett-Stich (sonst kippt es in die bereits verworfene
„Neon-Dark/E-Sport"-Ecke aus dem Vorgänger-Dokument, Abschnitt 3):

```
navy-950  #0B1220   Seitenhintergrund               – Kontrast paper-50: 17,45:1
navy-900  #111A2E   Navbar/Footer                    – Kontrast paper-50: 16,16:1
navy-800  #182543   Panel-Fläche                     – Kontrast mist-400: 7,27:1
navy-700  #223058   Hover-Fläche/Input-Füllung
navy-600  #3D5080   Rahmen/Haarlinie                 – 1,92:1 zu navy-800 (Referenz
                     Original ink-600/ink-800 war 1,57:1 – bewusst etwas
                     sichtbarer, weil Blau auf Blau schwerer zu lesen ist als
                     Braun auf Braun)
paper-50  #F5F7FA   Primärtext (kühler als vorher, wie von der Korrektur
                     verlangt: „mist etwas blaustichig, paper etwas kühler")
mist-400  #A9B4C9   Fließtext sekundär                – 8,97:1 auf navy-950
mist-600  #78839C   niedrigste Betonung                – 4,93:1 auf navy-950
brand-500 #F07A27   unverändert, Logo-Wert             – 6,70:1 auf navy-950
                     (Text/Icon) und 6,70:1 navy-950-Text auf brand-500-Fläche
                     (Primärbutton, identisch zur ink-Version – die Formel ist
                     symmetrisch, das ändert sich mit dem Grundton nicht)
```

Struktur, Flächenstufen-Logik, 1px-Haarlinie statt Schatten, Radien-Stufung
und die 2px-`brand-500`-Anzeigetafel-Leiste bleiben exakt wie in
`VISUELLE-RICHTUNG-2026-08-12.md` Abschnitt 2.3 spezifiziert – nur der Farbton
der Basis wechselt. Ab hier im Dokument heißen die Flächen `navy-*`.

---

## 1. Recherche-Grundlage (echte Referenzen, keine erfundenen)

Ehrlich vorweg, was **nicht** ging: **land-book.com** blockte den automatischen
Abruf (HTTP 403 – kein Login-Umgehungsversuch unternommen). **Pinterest**-
Idea-Boards lieferten beim Abruf nur abgeschnittenen/nicht auslesbaren Inhalt
(„content truncated") – keine einzelnen Pins mit Titel/Quelle verifizierbar,
deshalb hier nicht als Einzel-Referenz aufgeführt. **siteinspire.com** war
abrufbar, lieferte aber keine Sport-spezifischen Treffer (aktuelle Vorschau:
Portfolio-/Studio-Seiten wie „Estudio Niksen", „Otherkind" – stilistisch
generisches Editorial-Portfolio, für dieses Projekt nicht einschlägig, deshalb
nicht zitiert). Ausgewichen wurde auf **Awwwards' Sport-Kategorie** (direkt
durchsuchbar), **Dribbble-Suche** und **Codrops/CSS-Tricks/MDN** für die
technische Mechanik – das sind die Quellen, auf die sich der Rest des
Dokuments stützt.

| Referenz | URL | Konkreter Mechanismus |
|---|---|---|
| MDN – CSS Scroll-driven Animations | [developer.mozilla.org/…/Scroll-driven_animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) | Native `animation-timeline: scroll()`/`view()` koppelt Keyframe-Fortschritt direkt an Scroll-Position bzw. Viewport-Eintritt eines Elements – **läuft auf dem Compositor-Thread, ohne JS**, aber laut Spezifikation aktuell primär Chromium/neuere Safari-Versionen; empfohlener Fallback über `@supports not (scroll-timeline: --t)`. |
| Codrops – Practical Introduction to Scroll-Driven Animations | [tympanus.net/codrops/…/practical-introduction-to-scroll-driven-animations](https://tympanus.net/codrops/2024/01/17/a-practical-introduction-to-scroll-driven-animations-with-css-scroll-and-view/) | Zeigt `scroll()` für Fortschrittsbalken/Sticky-Nav-Schatten und `view()` für Reveal-Effekte beim Viewport-Eintritt – reines CSS, keine Bibliothek; Autor nennt den Support 2024 noch als „Chromium only", was den Fallback-Zwang begründet. |
| Codrops – Sticky Grid Scroll | [tympanus.net/codrops/2026/03/…/sticky-grid-scroll](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/) | `position: sticky` + überhöhter Wrapper (`height: 425vh`) hält eine Bühne fest, während eine GSAP/ScrollTrigger-Timeline in drei Phasen (Reveal → Zoom → Content-Toggle) nur `transform`/`opacity` bewegt – der **Pinning-Mechanismus selbst ist reines CSS** (`position: sticky`), nur die Orchestrierung nutzt eine Library. |
| CSS-Tricks – Apple-Produktseiten-Scroll-Animation | [css-tricks.com/…/fancy-scrolling-animations-used-on-apple-product-pages](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/) | `<canvas>` fix positioniert in überhöhtem Wrapper; Scroll-Fraktion (`scrollTop / maxScrollTop`) wird auf einen **Frame-Index** einer vorab geladenen Bildsequenz gemappt – der Effekt ist technisch simpel, aber **hängt vollständig an einer produzierten Frame-Sequenz** (Foto oder Render), nicht am Code. |
| Codrops – On-Scroll Typography Animations | [tympanus.net/codrops/…/on-scroll-typography-animations](https://tympanus.net/codrops/2023/01/18/on-scroll-typography-animations/) | Kombiniert `transform-origin`-Verschiebung mit Rotation/Skalierung für Tiefenwirkung bei Headline-Reveals; ausdrückliche Warnung im Artikel selbst: „sollte nicht übermäßig eingesetzt werden" – Zurückhaltung ist Teil der Technik, nicht nur Geschmack. |
| CSS-Tricks – Scroll Drawing / SVG Line Animation | [css-tricks.com/scroll-drawing](https://css-tricks.com/scroll-drawing/) und [css-tricks.com/svg-line-animation-works](https://css-tricks.com/svg-line-animation-works/) | `stroke-dasharray`/`stroke-dashoffset` auf einem `<path>` lässt eine Linie sich „selbst zeichnen"; `getTotalLength()` liefert die Pfadlänge, der Offset wird 1:1 an den Scroll-Fortschritt gekoppelt – **reines SVG+CSS/JS, keine Bibliothek**, exakt die Technik, die `HeroGlyphs.js`/`CourtArc` heute schon als SVG bereitstellt. |
| Design Engineering – Split-Flap-Display-Komponente | [hello-mat.com/design-engineering/component/split-flap-display](https://hello-mat.com/design-engineering/component/split-flap-display) und [github.com/mni007nomi/Split-Flap-Display](https://github.com/mni007nomi/Split-Flap-Display) | Zeichen-„Flip" per `transform: rotateX(-180deg)` + `transform-style: preserve-3d` auf zwei gestapelten Hälften – die klassische Bahnhofs-/Flughafen-Anzeigetafel-Mechanik, **reines CSS 3D-Transform, keine Bibliothek nötig**. |
| Awwwards – Audi F1 „Feel Every Second" | [awwwards.com/sites/audi-f1-feel-every-second](https://www.awwwards.com/sites/audi-f1-feel-every-second) | Zwei-Farb-Schema (`#EB0D3F` Rot, `#1F1F1F` Schwarz), phasenweise aufgebauter Content über eine Saison, „Racing Heritage Timeline" als Scroll-Galerie mit Video – Beleg dafür, dass **ein knappes Zwei-Farb-System mit hohem Kontrast** in der Motorsport-/Sport-Kategorie trägt, ohne Verlauf oder Glow. |
| Awwwards – World Cup „The Immortals" | [awwwards.com/sites/world-cup-the-immortals](https://www.awwwards.com/sites/world-cup-the-immortals) | WebGL-3D-Scroll durch WM-Historie 1930–2022 mit Scoreboard-/Spielerkarten-Modulen; Stack: Vanilla JS + WebGL (kein Framework) – zeigt, dass **Scoreboard-Karten als eigenständiges Erzählelement** funktionieren, aber die 3D-Tiefe hier bewusst NICHT übernommen wird (WebGL wäre eine neue, schwere Abhängigkeit, siehe Abschnitt 4). |
| Awwwards – WC 2026 „Data Portraits" | [awwwards.com/sites/wc-2026-data-portraits](https://www.awwwards.com/sites/wc-2026-data-portraits) | ~1.500 Spielereignisse pro Match werden zu einem begehbaren 3D-Gelände (Three.js/GLSL); Beleg für „echte Live-Daten als Bühne" statt Stock-Fotografie – **Prinzip übernommen** (eigene Daten sind das Material), **Technik nicht** (Three.js ist eine neue, große Abhängigkeit). |
| Dribbble-Suche – Sports Dashboard / Scoreboard / Livescore Dark Mode | [dribbble.com/search/sports-dashboard](https://dribbble.com/search/sports-dashboard), [dribbble.com/tags/scoreboard](https://dribbble.com/tags/scoreboard), [dribbble.com/shots/21209957-Livescore-App-Dark-Mode](https://dribbble.com/shots/21209957-Livescore-App-Dark-Mode) | Suchindex, keine Einzelseite mit Mechanismus-Beschreibung – hier ehrlich nur als **Bestätigung des Stilfelds** genannt (dunkle Live-Score-Interfaces sind ein etabliertes, kein erfundenes Muster), nicht als Quelle für eine konkrete Technik. |
| DiagramTheGame / CoachCanvas (Basketball-Playbook-Tools) | [diagramthegame.com/basketball-play-maker](https://diagramthegame.com/basketball-play-maker), [coachcanvas.app](https://coachcanvas.app/) | Beide Tools „animieren Spielzüge Frame für Frame" mit Pfeilen auf einem Court-Diagramm – **kein Design-Vorbild im visuellen Sinn**, sondern der Beleg, dass die „Taktiktafel mit sich zeichnenden Pfeilen" ein **echtes, in der Basketball-Praxis existierendes Vokabular** ist (8.000+ Coaches laut Anbieter-Angabe nutzen CoachCanvas) – keine für dieses Projekt erfundene Metapher. |

---

## 2. Der „Apple-Effekt" in Mechanik zerlegt

| Mechanismus | Was er technisch tut | Auf unserem Stack machbar? |
|---|---|---|
| **Gepinnte Bühne über mehrere Viewport-Höhen** | `position: sticky` + überhöhter Wrapper hält eine Fläche fest, während Inhalt/Zustand sich ändert | **Ja, nativ, keine Abhängigkeit.** Bereits in `CLAUDE.md` Punkt 11 als „Hero-Desktop-Ausbaustufe (140vh, drei Szenen)" vorgemerkt und bewusst zurückgestellt – Grund war, dass mobil der Hauptfall ist und Pinning dort laut eigenem Entscheid (`HeroScrollStage.js`, Kommentar Zeile 22–25) explizit vermieden wird. Bleibt dabei: **Pin nur als Desktop-Progressive-Enhancement**, mobil bleibt flach. |
| **Scroll-gebundene Bildsequenz (Frame-für-Frame-„Video")** | Canvas zeigt vorgeladene Einzelbilder, Frame-Index = Scroll-Fraktion × Frame-Anzahl | **Nein, nicht ohne Fotografie/3D-Render.** Das ist exakt der Mechanismus, der eine produzierte Bildserie braucht (siehe CSS-Tricks-Referenz oben) – der bestätigte Engpass aus Abschnitt 3. |
| **Maßstabssprünge** (kleines Element wird beim Scrollen riesengroß) | `transform: scale()` an Scroll-Fortschritt gekoppelt | **Ja, nativ.** Exakt das Muster, das `HeroScrollStage.js` schon für den Ball nutzt (direkte `style.transform`-Mutation im rAF-Tick) – lässt sich auf Zahlen/Icons/Kartenausschnitte übertragen, ohne neue Technik. |
| **Text, der sich beim Scrollen zusammensetzt** | Wort-/Zeichen-Reveal an Scroll- oder Viewport-Fortschritt gekoppelt | **Ja, aber nicht über natives `scroll-timeline` CSS** (Support laut Recherche noch uneinheitlich, Fallback-Pflicht). Der bereits bewährte, plattformübergreifende Weg ist unser eigenes Muster: ein rAF-Tick mit direkter Style-Mutation (wie in `FeatureProgressRail.js`) – funktioniert heute schon in jedem Browser, ohne auf CSS-Timeline-Support zu warten. |
| **Präzise Easing-Kurven** | Custom `cubic-bezier()` statt Standard-Easings | **Ja, längst vorhanden.** `tailwind.config.js` definiert bereits `out-strong: cubic-bezier(0.23, 1, 0.32, 1)` (Zeile 70) und `page-in` (Zeile 79); `Button.js` hat bereits `active:scale-[0.97]` (Zeile 33). Die Bausteine sind da, sie sind nur nicht konsequent auf allen Zustandswechseln im Einsatz. |
| **Extreme Leerraum-Disziplin** | Weniger, größer, mehr Abstand pro Aussage | **Ja, reine Gestaltungsdisziplin**, kein technisches Thema. |
| **Ein Motiv pro Bildschirm** | Strukturelle Reduktion, nicht Bewegung | **Ja, reine Gestaltungsdisziplin.** Bereits teilweise vorhanden (Feature-Strecke = ein Moment pro Karte), aber die Seite darunter (News, So funktioniert's, CTA) reiht noch mehrere Aussagen pro Bildschirm. |
| **SVG-Pfad zeichnet sich selbst** (nicht in der Ausgangsfrage genannt, aber die für uns wichtigste Zusatz-Mechanik) | `stroke-dashoffset` an Scroll-Fortschritt gekoppelt | **Ja, nativ, und schon im Code vorhanden** – `HeroGlyphs.js`/`CourtArc` ist bereits ein SVG-Pfad. Das ist der Hebel, der Abschnitt 4 trägt. |

**Kurzfassung der Tabelle:** Vier von sieben Apple-Mechanismen sind mit dem
heutigen Stack, ohne neue Abhängigkeit und ohne Foto-/3D-Material sauber
umsetzbar (Pinning, Maßstabssprung, Easing, Leerraum-Disziplin) – zwei weitere
sind umsetzbar, aber über unser **bereits bewährtes** rAF-Muster statt über
die noch nicht überall unterstützte native `scroll-timeline`-CSS. Nur die
Bildsequenz braucht etwas, das wir nicht haben.

---

## 3. Der ehrliche Engpass – bestätigt, mit einer Ergänzung

**Deine These wird bestätigt:** Apples Wirkung hängt an studioqualitativer
Produktfotografie/3D-Rendering – exakt der Ressource, die laut Milos Messung
(`docs/HERO-ASSETS-2026-08-11.md`) hier fehlt (1000×652 px, bis 5,12× hochskaliert).
Ohne dieses Material bleibt der Frame-Sequenz-Mechanismus (Abschnitt 2, Zeile 2)
verschlossen – das ist kein Stilentscheid, das ist eine Materialgrenze.

**Eine Ergänzung, die ich für wichtig halte:** Bewegung + Großformat-Typografie
+ Live-Daten ist die richtige Antwort, aber sie braucht einen vierten Pfeiler,
den Apple genauso konsequent einsetzt wie Bewegung: **Verknappung.** Apples
„Wow" kommt nicht aus *mehr* Animation, sondern daraus, dass jede Aussage
allein auf ihrem Bildschirm steht, bevor die nächste kommt. Unsere Feature-
Strecke macht das für sechs Karten bereits richtig – aber „So funktioniert's",
News-Widget und CTA-Sektion reihen sich heute noch als klassische Ein-Bildschirm-
Blöcke ohne diese Disziplin (Screenshot `tmp/shots/desktop-start-voll.png`,
untere Hälfte). Ohne dieses vierte Element wird aus „Bewegung + Typo + Daten"
schnell „viel Bewegung", nicht „Apple-Bewegung".

**Und die zentrale Ergänzung aus Patricks Nachtrag:** Selbst mit allen vier
Pfeilern bleibt das Ergebnis „gutes Apple-Imitat", solange die Mechanik nicht
an *Basketball* hängt. Der Unterschied zwischen „Apple-Layout mit orangen
Akzenten" und einer eigenen Wow-Antwort ist, **welches Bild wächst, welcher
Text sich zusammensetzt, welche Linie sich zeichnet**. Zwei Ideen aus der
Recherche (Abschnitt 1) sind dafür der Schlüssel, weil sie beide bereits
vorhandene Bausteine sind und beide originär Basketball-Vokabular:

- **Die Taktiktafel statt der Frame-Sequenz.** `HeroGlyphs.js`/`CourtArc`
  ist schon ein SVG-Pfad. Statt (unmöglich) ein Foto-Video zu scrubben, kann
  sich ein **Spielzug als Linie zeichnen** – Ball- und Laufwege, wie ein Coach
  sie auf die Taktiktafel malt (echtes Vokabular, siehe DiagramTheGame/
  CoachCanvas-Referenz). Das ist Apples „Bildsequenz"-Mechanik, **ersetzt
  durch das basketball-eigene Äquivalent**, das wir mit reinem SVG+CSS ohne
  jedes Foto abbilden können.
- **Die Splitflap-Anzeige statt des generischen Text-Reveals.** Ein Headline-
  oder Zahlen-Wechsel, der wie eine mechanische Bahnhofs-/Sporthallen-
  Anzeigetafel „umklappt" (`rotateX`-Flip, siehe Referenz), ist nicht nur
  eine hübsche Typo-Animation – es ist **die konkrete physische Anzeigetafel**,
  auf der die „Anzeigetafel"-Richtung ohnehin schon beruht. Apples „Text setzt
  sich zusammen" wird damit zu „die Anzeigetafel schaltet um".

Diese zwei Ideen sind der Unterschied zwischen „Apple-Mechanik kopiert" und
„Apple-Mechanik für Hoops Germany übersetzt" – sie tragen die drei
Ausbaustufen in Abschnitt 5.

---

## 4. Ausdrücklich NICHT vorgeschlagen (mit Größe/Begründung, falls Patrick es trotzdem will)

Diese kommen in keiner der drei Ausbaustufen vor – aus den Referenzen sind
sie es, die dort die Wirkung tragen, aber sie verletzen die „keine neue
Abhängigkeit ohne Freigabe"-Grenze:

| Bibliothek | Ungefähre Größe | Wofür (in den Referenzen) | Warum nicht vorgeschlagen |
|---|---|---|---|
| **GSAP + ScrollTrigger** | ~70 kB (Core) + ~15 kB (Plugin), min+gzip | Sticky-Grid-Orchestrierung, Typo-Animationen (Codrops-Referenzen) | Unser rAF-Direktmutations-Muster (bereits in drei Komponenten bewährt) deckt denselben Bedarf ohne Laufzeit-Overhead und ohne neue Lizenz-/Update-Fläche. |
| **Lenis** (Smooth-Scroll) | ~5–6 kB min+gzip | Sanftes Scrollen unter der Sticky-Grid-Referenz | Verändert das native Scroll-Verhalten für die ganze Seite – Eingriff mit Auswirkung auf jede bestehende Seite, nicht nur die Wow-Momente. Nur mit ausdrücklicher Freigabe, nicht nebenbei. |
| **Three.js** | ~150 kB+ min+gzip (Kernbibliothek, ohne Beispiel-Assets) | 3D-Terrain (WC-Data-Portraits), WebGL-Übergänge (World-Cup-Immortals) | Der Aufwand steht in keinem Verhältnis zum Nutzen für eine Kreisliga-Plattform – und würde auf Mittelklasse-Android genau das Ruckel-Risiko erzeugen, das die Grenzen ausdrücklich ausschließen. |

Wenn Patrick eine davon ausdrücklich will (z. B. GSAP für aufwendigere
Choreografien in Stufe A), kann ich das gesondert vorschlagen – hier bewusst
nicht eingebaut, wie im Auftrag verlangt.

---

## 5. Drei Ausbaustufen

### A. Startseite als Bühne (Hero + Feature-Strecke)

**Was:**
1. **Taktiktafel-Hero (Desktop, Progressive Enhancement):** `CourtArc` wird zu
   einer echten Spielzug-Linie erweitert (Ball- und Laufweg zweier Positionen,
   `stroke-dashoffset` an Scroll gekoppelt) – sie zeichnet sich, während der
   Nutzer scrollt, und endet exakt dort, wo der Ball heute schon landet
   (Wiederverwendung des bestehenden Zielpunkt-Mess-Mechanismus aus
   `HeroScrollStage.js`). Auf Mobile bleibt die heutige, bewusst kürzere
   Ball-Choreografie ohne Pin – **kein neuer Mechanismus für Mobile nötig**,
   nur der bestehende bleibt wie er ist.
2. **Splitflap-Headline-Moment:** Das Schlüsselwort „Community" (oder das
   aktuelle Nele-Wording) bekommt beim ersten Eintritt in den Viewport einen
   kurzen Splitflap-„Umschalt"-Effekt (rotateX-Flip pro Wort, nicht pro
   Zeichen – Zeichen-für-Zeichen wäre auf 375px zu unruhig), **einmalig**,
   nicht bei jedem Scroll wiederholt (vgl. `Reveal.js`-Logik: `useInView`
   mit `once`).
3. **Feature-Strecke – Maßstabssprung statt reinem Fade:** Die jeweils
   „aktive" Karte (mittig im Viewport, per bereits vorhandenem
   Scroll-Listener aus `FeatureProgressRail.js` ableitbar, kein zweiter
   Listener nötig) wächst leicht (`scale(1.02)`) und ihr `brand-500`-Rahmen
   zieht sich zu voller Deckkraft hoch, während Nachbarkarten auf `scale(0.98)`
   und reduzierte Deckkraft zurückfallen – der Maßstabssprung-Mechanismus aus
   Abschnitt 2, angewendet auf die bereits gebaute Zickzack-Strecke.

**Wirkung:** Hoch – das ist der erste Eindruck, den Patrick mit Apple
vergleicht.
**Aufwand:** Mittel – alle drei Punkte erweitern bestehende, bewährte
Komponenten (kein neuer Scroll-Listener, keine neue Abhängigkeit), aber die
SVG-Pfad-Geometrie für einen glaubwürdigen Spielzug braucht Sorgfalt (echte
Spielzug-Logik, kein beliebiges Gekritzel).
**Risiko:** Mittel – Pin auf Desktop muss gegen Layout-Shift und Sprung-Effekte
beim schnellen Scrollen (Trackpad-Flick) getestet werden; Splitflap-Effekt
zu häufig oder zu grob eingesetzt kippt schnell ins Verbotene („Deko-Spielerei
ohne Bedeutung") – deshalb bewusst nur EIN Wort, EIN Mal.

### B. Produktseiten-Momente (Liga-Tabelle, Spielergebnis, Profil)

**Was:**
1. **„Tabelle sortiert sich" – echt statt nur als Feature-Mock:** Wenn ein
   Ergebnis von „pending" auf „confirmed" wechselt und dadurch die Liga-Tabelle
   (`/ligen/[id]`) neu sortiert, animieren betroffene Zeilen ihren Positions-
   wechsel per FLIP-Technik (First-Last-Invert-Play: alte Position messen,
   neue Position rendern, Differenz als `transform: translateY()` invertieren,
   auf 0 zurückanimieren – reines `transform`, keine Bibliothek). Das ist
   exakt der Moment, den `FeatureMocks.js` heute nur als Marketing-Vorschau
   zeigt („Tabelle sortiert sich") – hier wird er zur echten Produktfunktion.
2. **Splitflap-Scoreboard beim Ergebnis-Abgleich:** Auf `/match/[id]`, wenn
   beide Teams unabhängig ihr Ergebnis eingereicht haben und sie übereinstimmen
   (`resultStatus: "confirmed"`), klappt die finale Punktzahl in Geist Mono
   per Splitflap in Position, begleitet von der `brand-500`-Anzeigetafel-Leiste,
   die kurz aufleuchtet. Kein Fake-Ereignis – bindet an einen echten
   Zustandswechsel, den es im Datenmodell bereits gibt (`teamAResult`/
   `teamBResult`/`resultStatus`).
3. **Karriere-Odometer auf dem Spielerprofil:** Die vorhandene `CountUp`-Logik
   aus `FeatureMocks.js` wandert vom Marketing-Mock in die echte
   Karriere-Statistik-Ansicht – Punkte/Rebounds/Assists zählen hoch, sobald
   der Statistikblock in den Viewport scrollt (bestehende `useInView`-Logik
   aus `Reveal.js` wiederverwendbar), mit echten Werten aus
   `careerstats`/`calculateplayerstats`.

**Wirkung:** Hoch, und ehrlicher als Stufe A – diese Momente treffen die
tatsächliche Funktion der Plattform, nicht nur die Marketing-Fläche. Das ist
der Unterschied zwischen „die Seite wirkt beeindruckend" und „die Plattform
fühlt sich lebendig an", wenn sie tatsächlich genutzt wird.
**Aufwand:** Mittel bis hoch – FLIP-Logik ist pro Listenseite (`/ligen/[id]`,
`/topscorer`, `/spiele`) einzeln zu verdrahten, da jede ihre eigene
Render-Logik hat; das Splitflap-Ergebnis-Modul ist einmalig baubar und dann
wiederverwendbar (Match-Detail + evtl. Team-Admin-Ergebnis-Tab).
**Risiko:** Gering bis mittel – FLIP ist eine etablierte, gut verstandene
Technik (nur `transform`/`opacity`, GPU-beschleunigt), `prefers-reduced-motion`
lässt sich sauber lösen (Zeilen direkt neu anordnen, Animationsschritt
überspringen statt nur zu verkürzen).

### C. Politur (Easing, Staffelung, Zustandsübergänge, Seitenwechsel)

**Was:**
1. **`out-strong`-Kurve konsequent statt punktuell:** Die bereits definierte
   Kurve (`tailwind.config.js` Zeile 70) app-weit auf alle Enter-Übergänge
   ziehen (aktuell nur an einzelnen Stellen genutzt), Stagger-Disziplin
   30–80 ms zwischen Listenelementen codifizieren statt pro Seite neu zu
   entscheiden.
2. **Karten-Hover:** Von „Rahmen hellt auf" (heutige Spezifikation) um ein
   Detail ergänzen: Panel-interne Geist-Mono-Zahlen (falls vorhanden) blitzen
   beim Hover kurz in `brand-500` auf – ein Mikro-Detail im Sinne von Emils
   „unsichtbare Details, die sich summieren".
3. **Seitenwechsel als „Trading-Card"-Moment:** Für Team-/Spielerkarte →
   Detailseite ein **natives** `document.startViewTransition()` (Browser-API,
   keine npm-Abhängigkeit – ausdrücklich **nicht** das React-`ViewTransition`-
   Experimental-Feature aus der `react-view-transitions`-Skill, das React 19
   Experimental-Channel braucht und mit unserem Next 14.2.35/React-18-Stack
   nicht kompatibel ist). Die Karte „wächst" beim Klick zur Detailseite –
   wie eine Trading-Card, die man umdreht. Progressive Enhancement: Browser
   ohne Support (nicht-Chromium) bekommen den normalen, sofortigen
   Seitenwechsel, keinen Fehlerzustand.

**Wirkung:** Mittel für sich genommen, aber in der Summe genau das, was
„Apple-Politur" von „Apple-Hero-Moment" unterscheidet – die Politur ist der
Grund, warum sich *jede* Seite hochwertig anfühlt, nicht nur die Startseite.
**Aufwand:** Gering bis mittel.
**Risiko:** Gering – alle drei Punkte sind additiv, mit sauberem Fallback
für Browser ohne Unterstützung, kein Blockierer für bestehende Flows.

---

## 6. Harte Grenzen – Selbstprüfung

- **Funktionen/Routen bleiben:** Ja – alle drei Stufen sind additive
  Bewegungs-/Darstellungsschicht, keine Stufe ändert Datenmodell, API oder
  Navigation.
- **WCAG AA:** Ja, mit gerechneten Werten (Abschnitt 0) für die Navy-Korrektur;
  keine der Bewegungsideen betrifft Text-auf-Fläche-Kontrast, weil Splitflap/
  FLIP/Odometer auf denselben Text-/Flächen-Tokens laufen, die bereits geprüft
  sind.
- **`prefers-reduced-motion`:** Für jede der neun Einzelideen benannt, wo sie
  entfällt oder auf einen einmaligen Zustandswechsel ohne Bewegung reduziert
  wird (Abschnitt 5, jeweils implizit oder explizit: FLIP → Zeilen springen
  direkt an neue Position, Splitflap → Zahl erscheint direkt, Pin → Desktop-
  only-Enhancement entfällt mobil ohnehin schon strukturell).
- **Mobil zuerst:** Ja – der einzige neue Pin-Mechanismus ist ausdrücklich
  **Desktop-Progressive-Enhancement**, mobil bleibt exakt der heute geprüfte,
  bewusst pin-freie Ablauf.
- **Keine neue npm-Abhängigkeit:** Ja – alle neun Ideen sind mit CSS/SVG/
  nativer Web-API und dem bereits im Projekt bewährten rAF-Direktmutations-
  Muster umsetzbar; drei bewusst nicht vorgeschlagene Bibliotheken sind in
  Abschnitt 4 mit Größe benannt.
- **Keine Leistungseinbußen auf schwachem Android:** Alle Bewegungsideen
  nutzen ausschließlich `transform`/`opacity` (Compositor-Thread, GPU) –
  keine Idee animiert `width`/`height`/`top`/`left`. Muss vor Bau trotzdem
  mit echter 4×-CPU-Drosselung (wie beim bisherigen Hero-Test) verifiziert
  werden, das ersetzt dieses Dokument nicht.

---

## 7. Kollegen einbezogen

- **Milo (medien-produzent):** nicht eingebunden – jede der neun Ideen kommt
  bewusst ohne neues Foto-/Videomaterial aus (das ist der Kern der Antwort
  auf den Engpass). Falls Patrick den Frame-Sequenz-Mechanismus (Abschnitt 2)
  trotzdem will, bräuchte das Milos Produktion nach den Maßstäben aus
  `docs/HERO-ASSETS-2026-08-11.md` – dann wäre er der nächste Ansprechpartner,
  hier nicht nötig.
- **Nele/Nora:** nicht eingebunden – reiner Gestaltungs-/Technik-Auftrag, keine
  neue Copy, keine rechtliche Frage.
- **Malik (team-coach), Befund statt Auftrag:** Unser eigenes rAF-Direktmutations-
  Muster (`HeroScrollStage.js`, `FeatureProgressRail.js`) leistet heute schon,
  wofür andere Projekte zu GSAP/ScrollTrigger greifen (Abschnitt 1, Sticky-Grid-
  Referenz) – das ist wiederverwendbares Wissen, das als kleiner interner
  Bewegungs-Baustein/Skill-Notiz für andere Projekte (HomeGrow Homie o. Ä.)
  festgehalten werden könnte. Kein Skill-Gap, eher ein „das dokumentieren wir
  noch nicht zentral"-Hinweis, den ich Malik als Randnotiz weitergebe, keinen
  eigenen Auftrag.
- **Nächster Schritt gehört Patrick:** Entscheidung zwischen den drei Stufen
  (alle drei? nur A zuerst?), Freigabe/Ablehnung der Navy-Zielwerte aus
  Abschnitt 0, und danach – wie beim Piloten zuvor – Bau, gefolgt von Kais
  Diff-/Security-Review und Tobias' unabhängigem Browser-Gate (mobil zuerst).

---

## 8. Selbsttest

Würde ein gutes Designstudio das mit seinem Namen unterschreiben? Die
Referenzen sind real und mit URL belegt, die Fehlversuche (land-book,
Pinterest) sind ehrlich benannt statt verschwiegen, die Kontrastwerte sind
gerechnet statt geschätzt, und die drei Ausbaustufen binden Apples Mechanik
konkret an Basketball-Vokabular (Taktiktafel, Splitflap-Anzeigetafel,
Odometer-Statistik) statt an ein generisches Dark-Layout mit Orange-Akzent –
genau der Punkt, den Patricks Nachtrag verlangt hat. Die Einschränkung bleibt
dieselbe wie beim letzten Dokument: Der Beweis steht erst am gebauten und im
Browser geprüften Ergebnis, nicht an dieser Konzeptniederschrift.
