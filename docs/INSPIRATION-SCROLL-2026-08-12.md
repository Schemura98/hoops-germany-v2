# Inspirations-Notiz – Scroll-Sequenzen hoopsgermany.de

**Auftrag:** Patrick: „bekommen wir die Scroll-Sequenzen (z. B. des Sprungballs)
im Design noch etwas stilvoller, moderner hin? … Funktionen bleiben erhalten,
aber sinnvoll und innovativ durch solche Design-Techniken dargestellt."

**Stufe: L (Voll-Sweep).** Begründung: Redesign einer nutzersichtbaren
Kernfläche mit ausdrücklichem Wow-Anspruch – genau der Fall, den die Skill für L
vorsieht.

**Suchschnitt:** Amateur-Basketball-Community NRW, Vereinsumfeld, mobil zuerst,
Zielgruppe Spieler und ehrenamtliche Team-Verantwortliche, kostenlos. Konkurriert
um Aufmerksamkeit mit Sport-Apps und Vereinsseiten – nicht mit SaaS.

---

## Quelle: Sorte D (Video) – erstmals wirklich genutzt

Patrick hat vier Referenz-Videos als eine zusammengefasste mp4 geliefert
(90,5 s, 502×868, 30 fps). **Ich habe sie tatsächlich gesehen** – Frames per
ffmpeg extrahiert und als Kontaktbögen gelesen. Das ist die erste Auswertung
über Sorte D, seit sie in der Skill vorgesehen ist.

⚠️ **Grenze, die bleibt:** Frames sind Stichproben (hier ~1 Bild alle 1,6 s).
Was zwischen zwei Bildern passiert, ist **nicht belegt**. Alle Aussagen unten
zur Bewegungsrichtung sind aus aufeinanderfolgenden Standbildern erschlossen,
nicht aus gesehener Bewegung.

⚠️ **Zweite Einschränkung, ehrlich:** Alle vier Videos sind **abgefilmte
Bildschirme** auf einer glänzenden Tischplatte, mit Spiegelung, Handbewegung und
Raumlicht. Ein erheblicher Teil der Wirkung kommt aus der **Aufnahme**, nicht aus
der Website. Das ist keine Nebensächlichkeit: Wer diese Wirkung im Browser
erwartet, wird enttäuscht sein – dort fehlen Spiegelung, Bokeh und Kameraschwenk.

---

## Die vier Referenzen

### 1. ZOI ICE TEA (Produktseite, dunkel)
Was genau stark ist: **Ein einziges Objekt trägt die ganze Seite.** Eine Dose –
erst frei schwebend zwischen Eisbrocken, dann eingeschlossen in einem Eisblock,
dann rotierend, am Ende aus zerspringendem Eis heraus. Die Headline
„Drink … freeze." liegt **hinter** dem Objekt und wandert beim Scrollen
waagerecht, während das Objekt rotiert – zwei Ebenen, zwei Geschwindigkeiten,
daraus entsteht Tiefe. Dazu Kapitel-Farbfelder (tiefes Blau → warmes
Orangerot bei „A TASTE ABOVE THE REST"), eine waagerechte Kartenreihe und am
Ende eine Mosaikwand aus kleinen Bildern.

- **Was ich übernehme:** (a) das persistente Objekt, das durch mehrere Szenen
  wandert statt nur im Hero zu fallen; (b) Headline hinter dem Objekt, mit
  unterschiedlicher Scroll-Geschwindigkeit; (c) Kapitel als Farbfeld-Wechsel.
- **Was bewusst nicht:** die Produktfotografie und das 3D-Eis. Wir haben kein
  solches Material und werden keins bekommen (Patrick hat den Dreh-Termin am
  12.08. abgelehnt). Der Versuch, das mit unseren Mitteln nachzustellen, würde
  billig aussehen – der Ball bleibt Vektor.

### 2. EverSwap (Finanz-Produktseite, illustrierte Welt)
Was genau stark ist: **Eine durchgehende Landschaft, über die man beim Scrollen
hinwegfliegt.** Flüsse, Täler, Bergketten in gemalter Optik; die Kamera bewegt
sich weiter, während Kapitelwörter in Serifen darüber erscheinen („Traders",
„One Pool / Every Function", „Flows", „LPs"). Übergänge laufen durch Nebel/Wolken.
Links eine Punkte-Leiste als Kapitelanzeige. Eine Raute dient als Fenster, das
ein Stück der Welt zeigt.

- **Was ich übernehme:** **Das ist der stärkste Fund für uns.** Eine
  durchgehende Welt statt sechs getrennter Blöcke – bei uns: das **Spielfeld von
  oben**, über das man scrollend hinwegzieht (Mittelkreis, Zonen, Drei-Punkte-
  Bögen, Seitenlinien). Genau das Vokabular, das `PlayDiagram.js` schon
  spricht – bisher nur als stehender Hintergrund statt als bereiste Strecke.
  Die Kapitel-Punkteleiste haben wir bereits (`FeatureProgressRail.js`).
- **Was bewusst nicht:** die gemalte 3D-Landschaft. Reines SVG-Spielfeld,
  keine Illustration, die wir nicht zeichnen können.

### 3. Bucks Sauce (Marke, sehr dunkel)
Was genau stark ist: riesige **hohle Konturschrift** („WHY BUCKS SAUCE") über
die volle Breite, darunter ein Raster echter Kundenstimmen als Karten.

- **Was ich übernehme:** die Konturschrift als Kapitel-Marke – bei uns in Big
  Shoulders, sparsam, an genau einer Stelle.
- **Was bewusst nicht:** das Kundenstimmen-Raster. Wir haben derzeit
  **1 externes Team und 9 externe Nutzer** – eine Wand aus Zitaten wäre
  erfunden. Kommt frühestens, wenn Neles Schwelle von 20–25 Vereinen steht.

### 4. KONK / Shopify (Produktseite, hell)
Was genau stark ist: großes Objekt auf hellem Grund, Headline in zwei Blöcken
links und rechts daneben („KONK" / „OUT"), Gerätedarstellung mit echter Uhrzeit,
Wolkenillustration als Abschluss.

- **Was ich übernehme:** die geteilte Headline links/rechts des Objekts – bei uns
  mit dem Ball dazwischen.
- **Was bewusst nicht:** der helle Grund. Wir haben uns am 12.08. bewusst für
  Navy entschieden; ein Wechsel wäre kein Trend-Argument, sondern Beliebigkeit.

---

## Gegenprobe (Pflicht bei Stufe L)

**Was in dieser Branche alle gleich machen:** Sport- und Vereinsseiten setzen auf
Actionfotos aus der Halle, Ergebnis-Kacheln und Sponsorenleisten. Wer kein
Bildmaterial hat, nimmt Stockfotos – erkennbar generisch.

**Was wir bewusst anders machen:** **kein Foto.** Statt schlechter Bilder eine
gezeichnete Taktiktafel, die entsteht, während man liest. Das ist zugleich die
ehrlichere Aussage – die Plattform verkauft keine Bildwelt, sondern
nachvollziehbare Ergebnisse.

**Mode oder Handwerk?**
- *Handwerk, wird übernommen:* ein Motiv je Bildschirm, durchgehende Objektreise,
  Ebenen mit unterschiedlicher Geschwindigkeit, Kapitelanzeige.
- *Mode, wird nicht übernommen:* gemalte 3D-Welten, Produktrender, Nebelblenden
  als Selbstzweck.
- Gegen Viviens Ausschlussliste geprüft: Keiner der übernommenen Punkte ist
  Verlauf, Neon-Glow, Glassmorphism, Deko-Partikel oder 3D-Blob.

---

## Umsetzbarkeit mit vorhandenen Mitteln

| Übernommener Mechanismus | Trägt | Neue Abhängigkeit |
|---|---|---|
| Spielfeld als bereiste Welt | `PlayDiagram.js` erweitern (SVG, `transform`) | nein |
| Kapitelanzeige | `FeatureProgressRail.js` (existiert) | nein |
| Objektreise über Sektionen | rAF-Muster aus `HeroScrollStage.js` | nein |
| Headline hinter Objekt, zwei Geschwindigkeiten | CSS `transform` + bestehender Controller | nein |
| Konturschrift | Big Shoulders + `-webkit-text-stroke` | nein |
| Kapitel-Farbfelder | vorhandene `navy`/`brand`-Token | nein |

Milos 90-Bilder-Sequenz (450,7 KB) bleibt die Alternative für den Ball, falls
Vektor-Bewegung nicht reicht – Entscheidung liegt bei Patrick, Ronjas Grenze
sind 200 KB.

---

## Nicht geprüft / nicht gesehen

- Die Bewegung **zwischen** den Frames (Stichprobenabstand 1,6 s).
- Die Original-Websites selbst – ich habe nur die Abfilmung gesehen, nicht die
  Seiten im Browser. Aussagen zu Ladeverhalten, Bedienbarkeit und
  Barrierefreiheit dieser Referenzen sind damit **nicht** möglich.
- Tonspur: kein Whisper-Schlüssel gesetzt, die Videos haben keine Untertitel.
  Falls die Sprecherstimme etwas erklärt, ist es mir entgangen.
