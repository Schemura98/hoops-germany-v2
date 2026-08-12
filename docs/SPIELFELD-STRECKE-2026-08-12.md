# Das Spielfeld als bereiste Strecke – Konzept
## Auftrag von Patrick, 12.08.2026 – Startseite als durchgehende Court-Reise statt sechs getrennter Blöcke

Erstellt von Vivien (design-spezialistin). Status: **Konzept, kein Code.**
Grundlage: `docs/INSPIRATION-SCROLL-2026-08-12.md` (Trend-Sweep Stufe L, heute
bereits erstellt und gelesen – kein zweiter Sweep nötig), `docs/WOW-KONZEPT-2026-08-12.md`,
`docs/RONJA-LANDING-2026-08-12.md`, sowie `PlayDiagram.js`, `HeroScrollStage.js`,
`HeroGlyphs.js`, `FeatureProgressRail.js`, `FeatureFocus.js`, `FeatureMocks.js`,
`LandingFeatures.js`, `LandingHero.js` (alle gelesen, keine Annahme ungeprüft).

**Bezug zum Inspirations-Sweep:** EverSwap („die durchgehende Welt, über die man
hinwegzieht") ist die Leitidee; ZOI liefert die zwei Zusatzmechaniken (Objekt
wandert durch alle Szenen, Headline hinter dem Objekt mit eigener Geschwindigkeit).
Beide Male gilt: **Prinzip übernommen, Bildmaterial nicht** – reines SVG,
keine gemalte Landschaft, kein Foto.

---

## 0. Der Fallstrick, den ich vorab auflöse (bevor die eigentliche Strecke beschrieben wird)

Der naheliegendste Ansatz – **eine einzige, riesige Court-Illustration**, die
sich über die komplette Höhe von Hero + sechs Feature-Szenen erstreckt und beim
Scrollen wie eine Kamerafahrt daran vorbeizieht – scheitert an genau dem
Maßstabs-Fallstrick, vor dem Patrick gewarnt hat, nur in einer größeren Version:

- Die Gesamthöhe von Hero + Feature-Strecke ist **nicht vorhersagbar** – sie
  hängt von Zeilenumbrüchen, Schriftgrößen-Einstellungen und Content ab und ist
  auf 390px (Karten stapeln ohne Zickzack, `flex-col`) deutlich anders als auf
  Desktop (Zickzack mit `md:flex-row`).
- Eine Illustration mit festem Seitenverhältnis (ein Spielfeld hat ein festes
  Längen-Breiten-Verhältnis) lässt sich mit `meet` verlustfrei in jede Box
  einpassen – aber **nicht** so, dass sie exakt so hoch wird wie eine völlig
  unabhängig bestimmte Content-Höhe. Ergebnis: entweder ein winziges Band ganz
  oben in einer sehr langen mobilen Sektion (der Rest bleibt leer), oder –
  schlimmer – die Versuchung, mit `preserveAspectRatio="none"` zu strecken,
  wodurch aus Kreisen (Mittelkreis, Freiwurfkreis) Ellipsen würden. Das lehne
  ich ausdrücklich ab, dieselbe Konsequenz, die PlayDiagram.js schon einmal
  aus der `slice`-Erfahrung gezogen hat.

**Konsequenz für dieses Konzept:** Keine einzige mega-Leinwand. Stattdessen
trägt die **bereits vorhandene, bewährte Fortschritts-Leiste** (`FeatureProgressRail.js`
– mobil der Balken, Desktop die Punkte-Reihe) die eigentliche „Kamerafahrt",
weil sie schon heute jede beliebige Content-Höhe robust auf 0–1 abbildet. Der
Court-Charakter kommt aus sechs **lokalen, klein bemessenen Feld-Fragmenten**
(ein Ausschnitt je Szene, Format vergleichbar mit den bestehenden `MockFrame`-
Karten) statt aus einer durchgehenden Karte. Kontinuität entsteht nicht durch
eine einzige Bilddatei, sondern durch: gleiche Strichstärke/-farbe in allen
Fragmenten, eine erkennbare Wanderung „eigene Hälfte → Korb" in der Abfolge der
gezeigten Zonen, und vor allem durch den Ball, der als **ein durchgehendes
Element** über die Fortschritts-Leiste wandert, nicht an eine einzelne SVG
gebunden ist. Das ist näher an dem, was die Kontaktbögen von EverSwap selbst
zeigen (deutlich unterschiedliche Motive je Kapitel – Fluss-Tal vs. Bergkette –
also vermutlich auch dort Kapitel-Kunst statt einer einzigen Mega-Landschaft),
als an einer wörtlichen Umsetzung.

---

## 1. Die Strecke: welcher Feldausschnitt gehört zu welcher Szene

Sieben Stationen: Hero + die sechs bestehenden Szenen aus `LandingFeatures.js`
(Reihenfolge, Titel und Texte **unverändert**). Start an der eigenen Grundlinie
(Hero, wie heute), Ziel am gegnerischen Korb (Szene 6) – wörtlich Patricks
Vorgabe „von der eigenen Hälfte bis zum Korb".

| # | Szene (unverändert) | Feldzone | Warum diese Zone | Links/rechts? |
|---|---|---|---|---|
| 0 | Hero | Eigene Grundlinie + Zone | **Unverändert** – exakt die heutige `PlayDiagram`-Geometrie (viewBox 0 0 900 700), nichts wird neu gezeichnet. | zentriert (wie heute) |
| 1 | Aufstellung | Eigener Freiwurfkreis | Anstoß/Aufstellung wird klassisch am Freiwurfkreis angesagt – zentrales Feld-Element, kein Seitenbezug nötig. | zentriert |
| 2 | Kader füllt sich | Eigene Dreierlinie, **linker** Flügel | Team betritt sukzessive das Feld am Flügel; die Seite ist bewusst gewählt, weil die Mock-Karte in dieser Szene (i=1, `reversed`) links steht – einziger Punkt, an dem Feldseite und Kartenseite bewusst übereinstimmen. | links |
| 3 | Doppelt bestätigt | Mittelkreis / Seitenlinie | Symbolisches Zentrum der Erzählung (auch laut Ronjas Befund die wichtigste Szene) – liegt folgerichtig auf der Mittellinie des Feldes. | zentriert |
| 4 | Tabelle sortiert sich | Übergang direkt hinter der Mittellinie, gegnerische Hälfte beginnt | **Setzt die Linie aus Szene 3 unmittelbar fort, ohne Bruch** – das behebt gezielt Ronjas Befund O1 („Tabelle sortiert sich" wirkte visuell abgekoppelt vom Ergebnis in Szene 3). Gleicher Strich, keine Lücke. | zentriert |
| 5 | Der nächste Zug | Gegnerische Dreierlinie, **rechter** Flügel | „Der nächste Zug" ist wörtlich ein Vorstoß Richtung Korb; Kartenseite dieser Szene (i=4) steht rechts – zweite bewusste Übereinstimmung. | rechts |
| 6 | Nachspielzeit | Gegnerische Grundlinie + Korb | Ankunft. Der Ball trifft, während diese Szene in den Fokus rückt – „Nachspielzeit" liest sich dann als der Moment direkt nach dem Korberfolg, nicht als Bruch mit der Spielmetapher. | zentriert |

**Was hier bewusst NICHT wörtlich gemeint ist:** Ich behaupte nicht, dass
„Tabelle sortiert sich" basketballlogisch an der gegnerischen Freiwurflinie
stattfindet. Wie bei EverSwap trägt die Feld-Zone **Kontinuität und Stimmung**,
nicht eine erzwungene 1:1-Bedeutung – nur Start (eigene Hälfte) und Ziel
(Korb) sind wörtlich gemeint, weil Patrick das genau so vorgegeben hat. Alles
dazwischen ist eine plausible, aber bewusst lose Reise-Dramaturgie.

**Geometrie in Bereichen (kein Endmaß, zum Nachmessen):** Jedes Fragment
bekommt ein eigenes, kleines, zu sich selbst konsistentes Seitenverhältnis
(grob Kartenformat, vergleichbar `max-w-sm`, landschaftlich) – **nicht** die
900er-Breite des Hero-Diagramms, das wäre für ein Kartenformat zu breit angelegt.
Innerhalb dieses lokalen Formats:
- Zentrierte Zonen (Freiwurfkreis, Mittelkreis, Übergang, Grundlinie+Korb):
  Kreismittelpunkt/Schlüssel-Element bei x∈[45 %, 55 %] der Fragment-Breite.
- Linker Flügel (Szene 2): Bogen-Segment und Seitenlinie im Bereich x∈[0 %, 35 %].
- Rechter Flügel (Szene 5): Bogen-Segment im Bereich x∈[65 %, 100 %].
- Grundlinie+Korb (Szene 6): Zonen-Rechteck x∈[35 %, 65 %], Korb-Strich im
  unteren Fünftel (y∈[80 %, 100 %]) – spiegelt bewusst die y-Lage der
  bestehenden Hero-Geometrie (Zone bei y 500–700 von 700), damit die Fragmente
  optisch derselben Feder entstammen.

---

## 2. Wie sich die „Kamera" bewegt

**Verschieben – aber nicht per JS-Transform auf einer großen Fläche, sondern
durch normales Dokumenten-Scrollen kleiner, lokal verankerter Fragmente.**
Kein Maßstabswechsel (kein Hinein-/Herauszoomen) auf der Feld-Ebene – aus zwei
Gründen:

1. **Trennung der Zuständigkeiten:** Der Maßstabssprung-Mechanismus (Apple-
   Mechanik, „ein Motiv ist im Fokus, Nachbarn treten zurück") existiert
   bereits und läuft auf den **Karten** (`FeatureFocus.js`, `scale(1.02)` vs.
   `scale(0.955)`). Würde die Feld-Ebene zusätzlich zoomen, konkurrieren zwei
   Systeme um dieselbe Aufmerksamkeit – genau das, was die Gegenprobe im
   Inspirations-Sweep als „Mode statt Handwerk" verwirft.
2. **Kostendisziplin:** `FeatureFocus.js` liest heute schon pro Frame die
   Bounding-Rects aller sechs Zeilen (etablierter, gemessener Aufwand, 60 fps
   bestätigt). Die Ball-Position hängt sich an **exakt diese bereits bezahlte
   Messung** – kein zusätzlicher Scroll-Listener, kein zusätzlicher
   Layout-Read. Ein zweites, eigenständiges Kamera-System hätte das nicht.

Konkret: `FeatureProgressRail.js` kennt schon den Fortschritt (0–1) durch die
ganze Sektion und den aktiven Szenen-Index. `FeatureFocus.js` kennt schon die
Bildschirmposition jeder Zeile. Die neue Ball-Bewegung liest beide bereits
vorhandenen Werte und interpoliert nur ihre eigene Transform-Zeile dazu – das
„Kamerafahrt"-Gefühl entsteht aus dem, was ohnehin passiert (man scrollt an
sechs Zonen vorbei, deren Feld-Fragmente sich stilistisch fortsetzen), nicht
aus einer zusätzlichen Bewegung, die berechnet werden müsste.

---

## 3. Was mit dem Ball passiert – und wo er landet

**Ein durchgehendes Objekt, zwei Auftritte, eine Landung:**

- **Hero (unverändert im Aussehen):** Der Ball fällt wie heute sichtbar durch
  die Szene. **Geändert wird nur die Bedeutung, nicht die Technik:** Er
  landet **nicht mehr** im kleinen Korb-Emblem an der Hero-CTA – das wäre nach
  Patricks Auftrag jetzt eine falsche Zwischen-Pointe (er soll durch **alle**
  Szenen wandern, nicht im Hero schon ankommen). Stattdessen kommt er kurz zur
  Ruhe (leichtes Aufsetzen/Abbremsen an der Stelle, wo heute das Korb-Emblem
  sitzt) und **bleibt im Spiel** – sichtbar als kleiner, ab dort permanent
  präsenter Marker auf der Fortschritts-Leiste.
- **Feature-Strecke:** Der Ball reitet als kleiner Marker auf der
  Fortschritts-Leiste mit – auf Mobile an der Spitze des sich füllenden
  Balkens (dort, wo die orangene Füllung endet), auf Desktop entlang der
  Punkte-Reihe rechts, zwischen den sechs Punkten interpolierend. Seine
  Y-Position folgt eins zu eins dem ohnehin vorhandenen Fortschrittswert; eine
  leichte X-Bewegung (nur Desktop, s. Abschnitt 4) begleitet die zwei echten
  Flügel-Momente aus Abschnitt 1 (Szene 2 links, Szene 5 rechts).
- **Landung/Ziel:** Am Ende der Fortschritts-Leiste (Höhe des sechsten
  Punktes/100 % des Balkens, zeitlich exakt wenn Szene 6 „Nachspielzeit" in
  den Fokus rückt) sitzt ein kleines Korb-Zeichen – Wiederverwendung von
  `HoopEmblem` aus `HeroGlyphs.js`, nur in der kompakten Rail-Größe. Der Ball
  spielt dort **einmalig** die bereits existierende Swish-Choreografie
  (Größensprung + Ausblenden, exakt der Mechanismus aus `HeroScrollStage.js`,
  Zeilen 184–192) und **bleibt danach als Ruhezustand am Ziel liegen** – kein
  Zurückspringen, kein zweites Abspielen beim Zurückscrollen (Ronja-Prinzip:
  einmalig, kein Deko-Loop). Optional, kleine Zusatz-Idee: Der Korb-Treffer
  blitzt kurz in `signal-ok` auf (dieselbe Farbe, die die „Bestätigt"-Badge in
  Szene 3 schon nutzt) – Wiederverwendung eines bestehenden Bedeutungstons
  statt einer neuen Farbe.
- **Danach (So funktioniert's, CTA):** Der Ball bewegt sich nicht weiter mit.
  Die Geschichte ist an diesem Punkt bewusst zu Ende erzählt (siehe Abschnitt 6).

---

## 4. Was auf 390px anders ist als auf Desktop

| Aspekt | Mobil (390px, Hauptfall) | Desktop (≥1280px, `xl`) |
|---|---|---|
| Feld-Fragmente hinter den Szenen | **Entfallen ganz.** Bei `flex-col` gibt es keinen Zickzack, der eine links/rechts-Position rechtfertigen würde, und der Platz neben dem Text ist auf 390px ohnehin durch die Karte belegt – ein zusätzliches Hintergrund-Fragment wäre reine Enge ohne Zugewinn. | Sechs kleine Fragmente, je eines pro Szene, in der freien Fläche neben/hinter der jeweiligen Mock-Karte, niedrige Deckkraft (Richtwert ähnlich Hero-`ARC_MAX`≈0,35–0,4, im Browser feinzujustieren). |
| Ball-Träger | Der bestehende sticky Balken unter der Navbar (`top-16`, bereits vorhanden). Ball-Marker sitzt an der Balkenspitze. | Die bestehende Punkte-Reihe rechts (`right-6`, `xl:block`). Ball-Marker gleitet zwischen den Punkten. |
| X-Bewegung des Balls | **Keine.** Der Balken ist eine reine 1D-Fortschrittsanzeige – eine seitliche Auslenkung hätte kein Bezugsobjekt und würde nur unruhig wirken. | Leichte X-Auslenkung an den zwei echten Flügel-Stationen (Szene 2/5, Abschnitt 1) – auf Desktop sinnvoll, weil dort auch die Karten selbst seitlich wechseln; unterstreicht die ohnehin vorhandene Zickzack-Bewegung, statt eine neue zu behaupten. |
| Korb-Ziel | Am unteren Ende des Balkens, sobald „6 / 6 · Nachspielzeit" erreicht ist. | Am unteren Ende der Punkte-Reihe, auf Höhe des sechsten Punktes. |
| Kostenrahmen | Kleinstmöglich: ein Marker-Element, keine neue SVG-Fläche. | Sechs kleine Fragment-SVGs (Richtwert: einige hundert Byte je Fragment, weit unter dem 200-KB-Budget) zusätzlich zum Marker. |

---

## 5. Ruhezustand bei `prefers-reduced-motion` (vollständig, nicht als Nachsatz)

- **Feld-Fragmente (Desktop):** Werden **sofort im Endzustand** gerendert –
  vollständig gezeichnet (`strokeDashoffset: 0`), feste Deckkraft, keine
  Einblend-Animation. Das ist dieselbe Regel, die `PlayDiagram.js` heute schon
  für den Hero-Court anwendet (`gezeichnet=!animated`) – hier nur auf sechs
  kleine Fragmente statt einem Diagramm ausgeweitet. Kein Fragment steht je
  auf „unsichtbar" (Offset 1), das war exakt der früher gemachte Fehler, den
  dieses Konzept nicht wiederholt.
- **Fortschritts-Leiste (Balken/Punkte):** Verhält sich weiterhin wie heute
  bereits spezifiziert (`FeatureProgressRail.js`, Zeilen 42–50): Balken auf
  volle Breite/neutrale Farbe, Punkte/Beschriftung als reine, nicht bewegte
  Zustandswechsel. Daran ändert dieses Konzept nichts.
- **Ball-Marker:** Anders als der heutige Hero (dort entfällt der Ball bei
  reduzierter Bewegung komplett, weil er sonst mitten im Fall eingefroren
  aussähe) wird der Marker hier **bewusst gezeigt, aber unbeweglich direkt am
  Korb-Ziel** – am unteren Ende von Balken/Punkte-Reihe, in Ruhehaltung, ohne
  Swish-Animation. Begründung für die Abweichung vom Hero-Muster: Ein
  ruhender Ball am Ziel ist ein **kohärentes Standbild** („die Reise ist
  abgeschlossen"), kein eingefrorener Bewegungsrest – das ist ein Unterschied
  in der Qualität des Ruhezustands, kein Widerspruch zum Prinzip. Nutzer mit
  reduzierter Bewegung verlieren dadurch keine Information (der Ball „ist am
  Korb angekommen" ist genauso lesbar wie bewegt), gewinnen aber gegenüber
  „Ball fehlt komplett" ein Stück Erzählung zurück.
- **Hero-Ball:** Bleibt exakt bei der heutigen Regel (entfällt komplett bei
  reduzierter Bewegung, `HeroScrollStage.js` Zeile 250–255) – unverändert,
  weil dort die bestehende Begründung (mitten in der Flugbahn eingefroren
  sähe nach Fehler aus) unverändert zutrifft.

---

## 6. Was ich bewusst weglasse (und warum)

1. **Eine einzige durchgehende Mega-Illustration statt sechs Fragmenten.**
   Abschnitt 0 begründet das ausführlich – Aspect-Ratio-Konflikt mit
   unvorhersagbarer Content-Höhe, keine saubere Lösung ohne Verzerrung oder
   Leerraum.
2. **Zoom/Maßstabswechsel auf der Feld-Ebene.** Bleibt exklusiv bei
   `FeatureFocus.js` (Karten-Ebene) – zwei konkurrierende Zoom-Systeme wären
   unruhiger, nicht wirkungsvoller.
3. **Wörtliche 1:1-Zuordnung jeder Szene zu einer „logischen" Feldzone.** Nur
   Start und Ziel sind wörtlich gemeint (Patricks Vorgabe); dazwischen trägt
   die Zone Stimmung/Kontinuität, keine erzwungene Basketball-Logik – bewusst
   im EverSwap-Sinn statt buchstabengetreu.
4. **Fortsetzung der Ball-Reise in „So funktioniert's" und die Abschluss-CTA.**
   Beide Sektionen sind eigenständige, andersartige Bildschirme (nummerierte
   Schritte bzw. eine reine Registrierungs-Aufforderung, die zudem nur
   eingeloggten Besuchern verborgen bleibt). Die Geschichte dort fortzusetzen
   würde entweder die „ein Motiv pro Bildschirm"-Disziplin aus der Gegenprobe
   verletzen oder eine dritte, andersartige Ziel-Logik erfordern. Sauberer
   Schnitt: Die Reise endet, wenn sie erzählerisch fertig ist (Korb, Szene 6).
5. **X-Auslenkung des Balls auf Mobile.** Kein Bezugsobjekt (kein Zickzack),
   also keine erfundene Bewegung nur um der Bewegung willen.
6. **Neue npm-Abhängigkeit.** Nirgends nötig – alles läuft über bereits im
   Projekt bewährte Technik (SVG `pathLength`/`stroke-dashoffset`, rAF mit
   direkter Style-Mutation, dieselbe Disziplin wie in allen drei
   referenzierten Bestandskomponenten).
7. **Der bestehende Ball-Gradient/Drop-Shadow (`HeroGlyphs.js`, `BallGlyph`)
   bleibt unangetastet, ist aber eine offene Spannung zur Vorgabe „keine
   Verläufe, keine Schatten".** Ich fasse dieses bereits gebaute, bewusst so
   gestaltete Asset in diesem Konzept nicht an (ein flacher oranger Kreis
   verliert seine Lesbarkeit als Ball) – melde die Spannung aber ehrlich statt
   sie stillschweigend zu ignorieren. Alle **neuen** Elemente aus diesem
   Konzept (Feld-Fragmente, Rail-Korb-Ziel, Strichführung) verwenden
   ausschließlich flache `navy-*`/`brand-*`/`signal-*`-Töne und 1px-Linien,
   keine neuen Verläufe oder Schatten.

---

## 7. Kollegen einbezogen

- **Ronja (retention-analystin):** Zwei ihrer Befunde fließen direkt ein –
  **O1** (Szene 3→4 wirkte visuell abgekoppelt) wird durch die ununterbrochene
  Linie über die Mittellinie hinweg gezielt behoben; **S2** (Ball-Landung auf
  Mobile praktisch unsichtbar) wird durch die Verlagerung der Landung auf die
  ohnehin sticky, immer sichtbare Fortschritts-Leiste strukturell gelöst statt
  nur nachjustiert. M1 (Szene 3, Doppelt-Meldung) ist bereits an anderer
  Stelle behoben (`FeatureMocks.js`, dauerhafte statt kurz eingeblendete
  Badges) und bleibt von diesem Konzept unberührt.
- **Milo (medien-produzent):** nicht eingebunden – wie im Wow-Konzept
  begründet, kommt dieses Konzept bewusst ohne neues Foto-/Videomaterial aus.
- **Malik (team-coach):** kein neuer Befund – das Konzept verlängert exakt
  die drei Bausteine, die der Wow-Konzept-Sweep bereits als wiederverwendbares
  internes Muster benannt hat (rAF-Direktmutation statt GSAP), kein neuer
  Skill-Bedarf.
- **Nele/Nora:** nicht eingebunden – keine neue Copy, keine neue Rechtsfrage;
  alle sechs Szenentexte bleiben wortgleich.
- **Nächster Schritt bei Freigabe:** Bau, danach wie üblich Kais Diff-/
  Security-Review und Tobias' unabhängiges Browser-Gate (mobil zuerst,
  ausdrücklich inklusive erneuter Prüfung der Ball-Sichtbarkeit auf 375–390px,
  weil genau dort Ronjas S2-Befund entstand).

---

## 8. Die eine Entscheidung, die ich mir von Patrick bestätigen lassen möchte

**Darf ich die heutige Hero-eigene Ball-Landung (Swish an der Hero-CTA,
`HeroScrollStage.js`) zugunsten einer einzigen, späteren Landung am Ende von
Szene 6 aufgeben?**

Das ist kein Nebendetail: Die aktuelle Hero-Landung wurde am 11./12.08. mehrfach
feinjustiert (Textblock-Ausblendung, Zielpunkt-Messung an der CTA, Ronjas
S2-Befund zur Mobile-Sichtbarkeit) – ich würde dieses bereits durchdachte
Verhalten bewusst zugunsten der neuen, durchgehenden Ein-Objekt-Erzählung
zurückbauen (Hero-Ball kommt nur noch zur Ruhe, trifft aber nicht mehr dort).
Das entspricht meinem Verständnis von Patricks Auftrag „ein Objekt wandert
durch alle Szenen, statt nur im Hero zu fallen" – aber es ist eine echte
Verhaltensänderung an einer bereits live stehenden, bewusst gebauten Stelle,
und genau dafür will ich sein ausdrückliches Ja, bevor das in die Umsetzung geht.
