# Wow-Material-Frage: Was ist mit dem vorhandenen Stack wirklich produzierbar?

Auftrag von Patrick, 12.08.2026, parallel zu Viviens „Wow"-Konzept
(`docs/WOW-KONZEPT-2026-08-12.md`, noch in Arbeit). Erstellt von **Milo**
(medien-produzent). Zweck: die Materialfrage klären, bevor Viviens Konzept
an etwas hängt, das wir nicht herstellen können.

**Status:** ursprünglich als reiner Prüfbericht angelegt — Patrick hat
per Nachtrag „alle Freiheiten" gegeben und ausdrücklich um tatsächliche
Produktion statt nur Beschreibung gebeten. Abschnitt 0 unten dokumentiert,
was daraufhin real entstanden ist. Der Rest des Dokuments (Abschnitt 1–7)
ist die ursprüngliche Prüfung und bleibt unverändert stehen, weil ihre
Befunde weiter gelten.

---

## 0. Nachtrag: tatsächlich produziert (Patricks „alle Freiheiten", 12.08.)

**Auftrag:** nicht nur prüfen, ob eine scroll-taugliche Sequenz technisch
ginge, sondern eine bauen und Anzahl/Auflösung/Gesamtgewicht aus echten
Zahlen melden. Farbwechsel dabei berücksichtigt: **Navy-Grund** (Patricks
Entscheidung, ersetzt Viviens Warmbraun-Vorschlag aus
`docs/VISUELLE-RICHTUNG-2026-08-12.md`), Akzent bleibt das exakte
Logo-Orange `#F07A27`.

**Was ich gebaut habe:** eine 90-Frame-Vektor-Sequenz „Sprungball" —
ein Basketball fliegt in einem Parabelbogen in den Korb, rotiert dabei
(3 Umdrehungen), das Netz schwingt nach dem Einschlag aus (gedämpfte
Sinus-Schwingung), der Ball rollt/verblasst aus. Bewegungslogik,
Ball-Schattierung (radialer Verlauf, Naht-Linien) und Netz-Physik sind
prozedural berechnet (Node-Skript), nicht einzeln von Hand gezeichnet —
das macht 90 konsistente Frames in vertretbarer Zeit erst möglich.

**Werkzeugkette (alles bereits vorhanden, nichts Neues gekauft):**
eigene SVG-Erzeugung pro Frame (reines JS, Parabel-Bezier für die
Flugbahn) → `sharp` (bereits installiert) rastert jedes Frame zu WebP
q78 → Ergebnis real gemessen, nicht geschätzt.

**Reale Zahlen (gemessen, nicht Schätzung):**

| Kennzahl | Wert |
|---|---|
| Frames | **90** |
| Auflösung/Frame | **1000×625 px** |
| Gesamtgewicht (90 WebP-Dateien) | **450,7 KB** (0,44 MB) |
| Ø pro Frame | **5,01 KB** |
| Min/Max Frame | 4,2 KB / 5,3 KB |
| Poster-Frame (Einzelbild, q85) | 6,5 KB |

Zum Vergleich mein früherer Vortest (flacher, einfacherer Vektor-Kreis,
120 Frames, 800×800, gleiche Pipeline): **1,4 MB**. Die „Sprungball"-
Sequenz ist trotz mehr Bildinhalt (Ball mit Schattierung, Korb, Netz,
Hintergrund-Verlauf) über 3× leichter — WebP komprimiert große
zusammenhängende Flächen (Navy-Verlauf) sehr effizient, das schlägt
stärker durch als die zusätzliche Detailmenge.

**Live-Demo (Scroll-Scrubbing wie auf einer Apple-Produktseite, mit
echtem, im Artifact eingebettetem Bildmaterial — nichts simuliert):**
**https://claude.ai/code/artifact/74ff0ab6-0c12-42b8-8b0d-f0fa4b5782d6**
— beim Scrollen durch die erste Sektion zeichnet ein `<canvas>`
Frame für Frame exakt nach Scroll-Fortschritt, dieselbe Technik wie
`HeroScrollStage.js` heute schon fürs reine SVG nutzt, hier aber für
eine echte Bild-Sequenz. Selbst getestet (lokaler Server + Browser-
Steuerung): Scroll-Fortschritt und Frame-Zähler laufen synchron,
Encoding-Bug (Umlaute) gefunden und behoben, `prefers-reduced-motion`
zeigt ein Standbild statt zu scrubben. Die Seite selbst zeigt unten
ein Vergleichs-Panel mit den echten Zahlen aus der Tabelle oben.

**Wo das liegt:** Erzeugungs-Skript, alle 90 Einzel-Frames und die
Demo-HTML liegen ausschließlich im Session-Scratchpad
(`generate-swish-sequence.js`, `frames-swish-1000/`,
`sprungball-scroll-probe.html`) — **nichts davon im Hoops-Repo, nichts
committet**, wie es sich für einen Entwurf gehört, den weder Vivien noch
Patrick final abgenommen haben. Der Artifact-Link ist privat (nur für
diese Session/Patrick sichtbar, nicht veröffentlicht).

**Ehrliche Grenzen dieser Produktion, damit „alle Freiheiten" nicht in
Übertreibung kippt:**
- Das ist eine **Vektor-Illustration** (flache Formen, Verläufe,
  Linien) im „Anzeigetafel"-Stil — kein Foto, kein 3D-Render. Sie trägt
  einen eigenen Charme (passt zur Scoreboard-Ästhetik), ist aber
  bewusst kein Ersatz für echtes Hallenmaterial (Abschnitt 4 unten).
- Die Physik ist plausibel, nicht simuliert (keine echte Engine) —
  Parabelbogen und Netz-Dämpfung sind von Hand parametrisierte Kurven,
  keine Physik-Berechnung. Für einen Wow-Moment reicht das; für einen
  Anspruch „physikalisch korrekt" wäre mehr Feinarbeit nötig.
- Ich habe **nicht** Viviens Typografie (Big Shoulders/Geist) in der
  Demo-Seite verwendet, sondern eine System-Schrift als Platzhalter —
  steht so auch auf der Demo-Seite selbst vermerkt. Das ist ihr
  Entscheidungsbereich, ich wollte ihn nicht vorwegnehmen.
- **Farbkonflikt aktiv, nicht von mir aufgelöst:** Viviens
  `VISUELLE-RICHTUNG-2026-08-12.md` empfiehlt explizit *gegen* Navy
  („warmer Hallengrund … nicht Navy, nicht Tech-Schwarz"). Patricks
  Nachtrag sagt das Gegenteil. Ich bin Patricks direkter Anweisung
  gefolgt (er ist laut Auftrag „finaler Entscheider"), aber das ist ein
  offener Widerspruch zu Viviens bereits dokumentierter Empfehlung —
  sie sollte das wissen, bevor sie ihr Wow-Konzept weiterschreibt.

**Skalier-Antwort auf Patricks Frage „Anzahl/Auflösung/Gesamtgewicht
für eine scroll-gebundene Sequenz":** Bei dieser Vektor-Machart ist
sogar deutlich mehr drin, ohne das Mobil-Budget zu sprengen — 150 statt
90 Frames läge bei ähnlicher Kompressionsrate um **~0,75 MB**, selbst
eine höhere Auflösung (1600×1000) bliebe voraussichtlich unter 1 MB bei
150 Frames. Die harte Grenze ist nicht die Vektor-Sequenz, sondern (wie
in Abschnitt 3 unten hergeleitet) **fotorealistisches** Material — dort
bräuchte dieselbe Frame-Zahl eher 10–30 MB, das wäre auf einer
Kreisliga-Datenverbindung nicht vertretbar.

---

**Ausgangsbefund, den ich bestätige statt nur übernehme:** Ich habe die
Werte aus meinem eigenen `docs/HERO-ASSETS-2026-08-11.md` gegengeprüft.
`login image.jpg` misst tatsächlich 1000×652 px (per `ffprobe` gemessen)
und wird bei 2560-px-Breite/DPR2 auf Faktor 5,12× hochskaliert. Der Befund
stimmt, das Bild ist deshalb im Zuge von Viviens neuer „Anzeigetafel"-
Richtung bereits komplett aus dem Hero geflogen (`docs/VISUELLE-RICHTUNG-
2026-08-12.md`, Abschnitt 5). Kein verwertbares Fotomaterial ist der
richtige Ausgangspunkt.

---

## 1. Was mit Canva wirklich produzierbar ist — geprüft, nicht behauptet

Ich habe die vier autorisierten Canva-Werkzeuge (`generate-design`,
`edit-design`, `resize-design`, `export-design`) direkt an ihrem Schema
geprüft und zusätzlich Canvas eigenen Help-Service gefragt, statt aus
Erinnerung zu antworten.

### 1.1 Geht: hochwertige statische Bild-/Vektor-Assets

- `generate-design` erzeugt ausschließlich **statische** Design-Typen —
  das komplette erlaubte enum ist: `business_card, card,
  desktop_wallpaper, doc, document, email, facebook_cover,
  facebook_post, flyer, infographic, instagram_post, invitation, logo,
  phone_wallpaper, photo_collage, pinterest_pin, postcard, poster,
  presentation, proposal, report, resume, twitter_post, your_story,
  youtube_banner, youtube_thumbnail`. **Kein Video-/Animations-Typ ist in
  diesem enum enthalten** — das ist keine Vermutung, das steht so im
  Tool-Schema.
- `export-design` liefert PNG bis **25.000 px** Kantenlänge (Schema-
  Limit `maximum: 25000`), JPG mit Qualitätsregler, verlustfreies PNG,
  transparenter Hintergrund möglich. Für Header-/Kampagnen-Einzelbilder
  in hoher Auflösung ist das mehr als ausreichend.
- Ein **Hoops-Brand-Kit ist in Canva bereits hinterlegt** (Kit-ID
  `kAGH2ZqTUy0`, per `list-brand-kits` real abgefragt) — Farben/Logo aus
  dem Kit lassen sich direkt in `generate-design` einspeisen, sobald
  Vivien die neue Palette (`#F07A27` etc.) dort pflegt oder mir die
  Zielwerte gibt.
- **Fazit:** Für Kampagnen-Visuals, Social-Assets, Hero-Standbilder,
  Bildserien (mehrere Einzel-Designs, keine Sequenz) ist Canva ein
  echtes, geprüftes Werkzeug.

### 1.2 Geht NICHT: Video, Loop-Animationen, jede Art Bewegtbild-Erzeugung über meine Werkzeuge

Ich habe das direkt bei Canva erfragt (`help`-Tool, wörtliche Antwort):

> „Mit den Canva-API/MCP-Werkzeugen wie generate-design, edit-design,
> resize-design und export-design [kannst du] keine komplett neue,
> bewegte Videosequenz oder animierte Grafik direkt aus einem reinen
> Text-Prompt generieren. […] Wenn du aus einem Text-Prompt ein kurzes
> Video oder eine animierte Sequenz erstellen möchtest, ist das direkt
> in Canva mit den Magic Design-Features möglich – zum Beispiel mit
> Magic Media oder Canva AI Video. Diese Funktionen sind aber in der
> Canva-Oberfläche verfügbar, nicht über die API/MCP-Werkzeuge."

Das deckt sich mit dem Tool-Schema selbst: `resize-design` akzeptiert als
Preset nur `presentation`/`whiteboard` oder freie Pixel-Maße — kein
Video-Zielformat. `export-design` hat zwar `mp4`/`gif` im Format-Enum,
aber das exportiert nur **bereits vorhandenen** Video-/Animationsinhalt;
ich habe keinen Weg, diesen Inhalt über meine Werkzeuge erst zu
**erzeugen**. Canvas eigene Video-KI (Magic Media/Canva AI Video) läuft
ausschließlich in der Web-Oberfläche — dort habe ich keinen Zugriff, und
selbst wenn: das wäre erneut KI-Videogenerierung, die für den Ball-Clip
bereits am 11.08. bewusst verworfen wurde (`dec-milo-bewegtbild-tools`,
Option 1 — Sportphysik-Schwäche aktueller Modelle, widerspricht Viviens
Mandat „kein generisches KI-Design").

**Konkret zur Frage „60–150-Bild-Scroll-Sequenzen à la Apple" über
Canva:** Nein. Canva ist ein Design-Tool für Einzel-Designs, keine
Rendering-Pipeline für Frame-Sequenzen. Das wäre selbst mit vollem
Web-UI-Zugriff falsch adressiert — Apple erzeugt solche Sequenzen aus
3D-Renderings oder Turntable-Fotografie mit hunderten Einzelaufnahmen
eines echten/gerenderten Produkts, nicht aus einem Grafik-Tool.

### 1.3 Ein echter Zwischenweg, den ich getestet habe: Vektor-Sequenz aus Code (nicht Canva)

Um nicht nur „geht nicht" zu melden, habe ich geprüft, ob mein
zweites Standbein — `sharp` (SVG→Raster) — eine **stilisierte**,
scroll-taugliche Bildsequenz aus reinem Vektor-Material herstellen
könnte, ähnlich wie `HeroGlyphs.js` heute schon den Ball als SVG zeichnet.

**Realer Test** (Scratchpad, 24 Frames statt voller 120 als Stichprobe,
800×800 px, WebP q80, ein rotierender Vektor-Ball auf `ink-950`-Grund):

```
Frames erzeugt: 24 bei 800x800px
Gesamtgroesse: 293.1 KB
Durchschnitt/Frame: 12.21 KB
Hochgerechnet auf 60 Frames: 732.6 KB
Hochgerechnet auf 120 Frames: 1465.3 KB
Hochgerechnet auf 150 Frames: 1831.6 KB
```

**Das funktioniert technisch** — `sharp` rastert SVG zuverlässig, die
Dateigröße für eine **flache Vektor-Grafik** ist überraschend gut
(120 Frames ≈ 1,4 MB). **Aber:** Das ist eine flache, einfarbige
Test-Grafik. Eine wirklich hochwertige, „Apple-Wow"-taugliche Vektor-
Sequenz (z. B. ein Basketball mit Materialschattierung, Lichtreflex,
Netz-Physik) wäre pro Frame deutlich schwerer und vor allem: **das
Zeichnen der 60–150 Einzelposen selbst ist nicht automatisierbar** —
das wäre entweder aufwendige Illustrationsarbeit (Vivien/ein
Illustrator) oder ein echtes 3D-Modell mit Renderer (haben wir nicht).
Ich kann die **Rasterisierung/Kompression/Größensteuerung** einer
fertigen Vektor-Sequenz übernehmen — ich kann nicht die künstlerische
Sequenz selbst erschaffen. Das ist ein ehrlicher Unterschied zwischen
„technisch machbar" und „mit meinem Werkzeugstack allein herstellbar".

**Kein Test-Output liegt im Hoops-Repo** — nur im Session-Scratchpad,
zur reinen Beleg-Führung dieses Berichts.

---

## 2. Was ausdrücklich nicht geht — und der Beschaffungsvorschlag dazu

| Bedarf | Geht mit meinem Stack? | Warum nicht | Vorschlag an Patrick (über Malik) |
|---|---|---|---|
| Photoreal. Produkt-/3D-Scroll-Sequenz (Apple-Stil) | **Nein** | Braucht 3D-Modell + Renderer (z. B. Blender-Turntable) oder Studio-Fotografie mit Dreh-Rig — beides nicht im Stack, kein Werkzeug dafür freigegeben | 3D-Render ist Overkill für den Umfang/Reifegrad des Projekts; realistischer: **Turntable-Fotoserie** eines echten Basketballs (Smartphone auf Stativ, Ball auf drehbarer Unterlage, ~30–60 Einzelfotos) — keine Software-Anschaffung nötig, nur ein Nachmittag Produktionsarbeit. Kann ich mit `ffmpeg`/`sharp` zu einer sauberen, komprimierten Sequenz verarbeiten, sobald die Fotos vorliegen. |
| KI-Videogenerierung (Ball fliegt in den Korb etc.) | **Nein** | Kein Runway-/vergleichbarer Zugang autorisiert (`dec-milo-bewegtbild-tools`, Option 1 — bewusst zurückgestellt); Sportphysik ist eine bekannte Schwäche aktueller Modelle | Bereits entschieden (11.08.2026): **kein** KI-Video, stattdessen echtes Trainingsmaterial (`task-milo-ballclip`, blockiert bis Patrick/Jonatan filmen). Ich schlage nicht erneut vor, das zu öffnen — nur zur Vollständigkeit hier gelistet, weil die Frage nach „Bewegungs-Sequenzen eines Basketballs" direkt danach klingt. |
| Lizenzklares Stock-Video/-Foto (Pexels/Pixabay) als Lückenfüller | **Nein, noch nicht** | Kostenlose API-Keys sind noch nicht angelegt (`task-milo-stock-api`, blockiert auf Patricks Kontoanlage — kein OAuth nötig, nur Registrierung) | Wenn bis zur Wow-Umsetzung kein eigenes Material steht: Patrick legt kostenlose Pexels-/Pixabay-Konten an (5 Minuten, kein Zahlungsmittel nötig), dann kann ich sofort lizenzsauberes B-Roll/Fotomaterial ziehen.低Priorität laut Backoffice, aber schnell nachholbar. |
| Canva Magic Media/Canva AI Video (Web-UI-Feature) | **Nein, für mich** | Nur in der Canva-Weboberfläche verfügbar, nicht über meine MCP-Werkzeuge — technisch ohnehin wieder KI-Videogenerierung, siehe oben | Kein Vorschlag — würde dieselbe bereits verworfene Entscheidung nur über einen Umweg reaktivieren. |
| Echtes Hallen-/Spielfoto (≥3600 px) für Hero/Auth | **Nein, noch nicht vorhanden** | Kein Studio, kein Fotoshooting — Materialbeschaffung, kein Tool-Problem | Siehe Abschnitt 4 — genau hier ist die eigentliche Chance, kein Beschaffungsproblem im klassischen Sinn. |

**Bewusst nicht vorgeschlagen:** ein bezahlter Video-Editor oder eine
Remotion-artige programmatische Video-Erzeugung. Der Bedarf, den Vivien
vermutlich für ihr Konzept hat, ist in erster Linie **Rohmaterial**
(echte Fotos/Videos), nicht ein fehlendes Schnitt-/Encoding-Werkzeug —
`ffmpeg` deckt Schnitt/Kompression/Loop-Naht/Poster-Frame bereits ab,
real getestet (`INSTALL-VERMERK-ffmpeg.md`).

---

## 3. Gewicht — was mobil über Kreisliga-Datenverbindung vertretbar ist

Referenzwerte aus echten Tests (nicht geschätzt):

| Material | Realistische Größe | Vertretbar mobil? |
|---|---|---|
| Hero-Einzelbild, WebP/AVIF, ~1000–2400 px lange Kante | 25–140 KB (real gemessen, `docs/HERO-ASSETS-2026-08-11.md`) | **Ja, problemlos** |
| Hero-Einzelbild bei Zielgröße ≥3600 px lange Kante, WebP q80–85 | grobe Hochrechnung ~250–500 KB je nach Bildinhalt | **Ja**, mit `<picture>`/`srcset` sowieso nur an große Screens ausgeliefert |
| 24–120-Frame **Vektor**-Sequenz, 800×800, WebP q80 (real getestet) | 293 KB (24 Frames) → **~1,4–1,8 MB (120–150 Frames)** | **Grenzwertig.** Für eine Kreisliga-Datenverbindung (oft 3G/schwaches 4G in Hallen) ist 1,4 MB+ **nur** vertretbar, wenn die Sequenz **lazy geladen** wird (erst beim Erreichen der Sektion) und **nicht** im initialen Ladepfad hängt — genau das Muster, das `HeroScrollStage.js` für den Ball heute schon nicht braucht, weil er reines SVG ist. Meine ehrliche Grenze: **ab ~800 KB–1 MB für eine einzelne Sequenz würde ich selbst zurückmelden statt stillschweigend liefern** — das ist eine Aufwand/Nutzen-Frage, die Vivien/Patrick treffen sollten, keine, die ich mir anmaße zu entscheiden. |
| 24–120-Frame **fotorealistische** Sequenz (hypothetisch, kein Test möglich mangels Quellmaterial) | grobe Literatur-Faustregel: 80–250 KB/Frame bei ähnlicher Auflösung → **5–35 MB für 60–150 Frames** | **Nein**, nicht ohne aggressive Kompromisse (kleinere Auflösung, weniger Frames, stärkere Kompression, Video-Sprite statt Einzelbilder). Das ist der Kernkonflikt zwischen „Apple-Wow" und „Kreisliga-Datenverbindung" — Apple kalkuliert für Breitband-Zielgruppen, wir nicht. |
| Kurzes Loop-Video, H.264+VP9, 1080p, 4–6 s (Viviens frühere Zielwerte) | ≤1,5 MB Desktop / ≤600 KB Mobile — als real erreichbar eingeschätzt (`docs/HERO-ASSETS-2026-08-11.md`, Abschnitt 4) | **Ja**, sobald echtes Rohmaterial vorliegt |

**Meine Empfehlung für Vivien:** Wenn ihr Konzept eine Scroll-Sequenz
vorsieht, sollte sie primär auf **Video statt Einzelbild-Sequenz**
setzen, wo immer scroll-gebundene Wiedergabe (via `currentTime`-Scrubbing
auf einem `<video>`-Element) ausreicht — ein 4–6-s-H.264/VP9-Clip
kommt bei ähnlicher visueller Dichte auf einen Bruchteil der Größe
einer PNG/WebP-Frame-Sequenz, weil Video-Codecs zeitliche Redundanz
ausnutzen, was Einzelbild-Sequenzen per Definition nicht können.

---

## 4. Die eigentliche Chance: echtes Material von echten Hallen

Das ist der Punkt, an dem Hoops Germany etwas hat, das Apple nicht hat —
und wo mein Werkzeugstack tatsächlich reicht, **sobald** Rohmaterial da
ist.

**Was organisatorisch fehlt, ist kein Tool, sondern ein Dreh-Termin:**

1. **Der Kanal existiert bereits.** Jonatan ist laut Backoffice-Roster
   ohnehin „Tester-Akquise vor Ort bei Spielen" zugeordnet und bringt
   dorthin schon Werbematerial mit (`task-jonatan-distribution`,
   Tester-Kampagne bis 10.09.). Fotos/Video bei genau diesen Terminen
   mitzunehmen ist **kein zusätzlicher Termin**, sondern derselbe.
2. **Was ich brauche, um daraus etwas Verwertbares zu machen:** ein
   kurzes **Dreh-Briefing** (Zielauflösung ≥3600 px lange Kante für
   Fotos bzw. 4K/1080p für Video, ruhige Bildmitte für Textüberlagerung,
   mehrere Versuche pro Motiv, Quer- **und** Hochformat für Mobile) —
   das kann ich selbst schreiben und Jonatan/Patrick vor dem nächsten
   Termin an die Hand geben. Das ist reine Produktionsarbeit meinerseits,
   kein neues Werkzeug.
3. **Was ich NICHT selbst klären kann und was vor der Veröffentlichung
   geklärt sein muss:** Persönlichkeitsrechte der abgebildeten
   Spieler/innen (Recht am eigenen Bild) und Nutzungsrechte an
   Vereinslogos/Trikots Dritter. Das ist **ausdrücklich eine Frage für
   Nora** (recht-vorpruefung), nicht etwas, das ich als Medien-Produzent
   selbst einschätzen darf — ich flagge das hiermit, statt es
   stillschweigend vorauszusetzen. Praktisch heißt das vermutlich: eine
   kurze mündliche/schriftliche Einwilligung der gefilmten Spieler:innen
   und ggf. des Vereins vor Ort, bevor Material auf hoopsgermany.de
   öffentlich landet — Nora sollte die genaue Form vorgeben.
4. **Timing:** Bis zur Tester-Kampagne (10.09.) sind es von heute
   (12.08.) rund vier Wochen — ausreichend Zeit für mindestens einen,
   realistisch zwei Hallen-Termine, wenn Jonatan ohnehin unterwegs ist.
5. **Was ich danach real leisten kann** (alles bereits funktionsgeprüft):
   Zuschnitt, Farbkorrektur-taugliche Kompression, H.264+VP9-Export,
   Poster-Frame, WebP/AVIF-Varianten, SVG-Optimierung für mitgebrachte
   Vereinslogos (`svgo`, falls Logos als Vektor vorliegen — bei
   Rasterlogos übernimmt `sharp` die Aufbereitung).

**Kurz:** Die Chance ist real und der Aufwand ist überschaubar — der
fehlende Baustein ist ein abgestimmter Dreh-Termin plus Noras
Rechte-Freigabe, nicht ein weiteres Werkzeug.

---

## 5. Kurzfassung für Vivien (geht / geht nicht / bräuchte X)

- **Geht:** hochwertige statische Canva-Assets (Bild bis 25.000 px Kante,
  Brand-Kit vorhanden); Bildserien aus mehreren Einzel-Designs;
  HTML/SVG-Grafiken; Video-**Nachbearbeitung** (Schnitt, Kompression,
  Loop-Naht, Poster-Frame, Mobile-Varianten) von echtem Rohmaterial über
  `ffmpeg`; stilisierte Vektor-Frame-Sequenzen — **produziert und
  gemessen, nicht nur behauptet**: 90 Frames, 1000×625 px, 450,7 KB
  gesamt, Live-Demo mit echtem Scroll-Scrubbing in Abschnitt 0.
- **Geht nicht:** jede Form von Video-/Animations-**Erzeugung** über
  Canva (bestätigt am Tool-Schema und direkt bei Canva erfragt);
  KI-Videogenerierung (bewusst verworfen, 11.08.); photorealistische
  60–150-Bild-Scroll-Sequenz — weder herstellbar noch beim aktuellen
  Materialstand gewichtsseitig mobil vertretbar.
- **Bräuchte X:** (a) einen abgestimmten Dreh-Termin mit Jonatan bei
  einem der nächsten Spiele/Trainings für echtes Foto-/Videomaterial —
  organisatorisch, kein Tool-Kauf; (b) Noras Rechte-Klärung für
  Spieler:innen/Vereinslogos, bevor solches Material öffentlich
  eingesetzt wird; (c) optional, niedrige Priorität: Pexels-/
  Pixabay-Konten als Lückenfüller, falls kein eigenes Material
  rechtzeitig entsteht (`task-milo-stock-api`, bereits vorgemerkt,
  wartet nur auf Patricks Kontoanlage).

---

## 6. Kollegen einbezogen

- **Vivien (design-spezialistin):** Hauptadressatin dieses Berichts —
  ihr „Wow"-Konzept soll sich auf diese geprüften Grenzen stützen können,
  statt an einer unbelegten Fähigkeit zu hängen. **Zusätzlich zu
  informieren, nicht nur zu referenzieren:** Patricks Farb-Nachtrag
  (Navy statt Warmbraun) widerspricht ihrer expliziten Empfehlung in
  `docs/VISUELLE-RICHTUNG-2026-08-12.md` Abschnitt 2 (dort: „nicht
  Navy, nicht Tech-Schwarz"). Ich habe die produzierte Demo auf
  Patricks direkte Anweisung in Navy gebaut, aber das ist ein offener
  Design-Konflikt zwischen den beiden, kein von mir entschiedener.
- **Jonatan (Mitgründer, Partnerschaften):** namentlich referenziert als
  der bereits bestehende organisatorische Zugang zu echten Spielen/
  Hallen (Abschnitt 4) — kein aktiver Auftrag von mir an ihn, das ist
  Patricks Entscheidung, ob/wann der Dreh-Termin stattfindet.
- **Malik (team-coach/Werkzeug):** kein neues Werkzeug beantragt für
  diesen Bericht — die vorhandenen (Canva, ffmpeg, sharp, svgo) wurden
  an ihrer tatsächlichen Fähigkeit geprüft, nicht an ihrer Beschreibung.
  Die einzigen offenen Beschaffungspunkte (Stock-API-Keys) sind bereits
  in `task-milo-stock-api` erfasst, hier nur referenziert.
- **Nora (recht-vorpruefung) — empfohlen, nicht selbst beauftragt:**
  Abschnitt 4 flaggt ausdrücklich eine Rechtsfrage (Personen-/
  Logo-Rechte bei echtem Hallenmaterial), die vor jeder Veröffentlichung
  durch sie laufen sollte. Ich beauftrage sie nicht selbst — das ist
  Patricks/Vivien Schritt, sobald Material vorliegt.
- **Nele (marketing-manager):** nicht eingebunden — dieser Auftrag ist
  Werkzeug-/Materialprüfung, keine Kampagnen-Entscheidung.
- **Frieda (dokumenten-logistik):** nicht eingebunden — es entstehen
  keine neuen Assets in dieser Session, die abgelegt werden müssten
  (der Scratchpad-Test liegt bewusst außerhalb des Repos).

## 7. Offene Punkte

1. Vivien nutzt diesen Bericht für `docs/WOW-KONZEPT-2026-08-12.md` —
   ich stehe für Rückfragen zur Verfügung, sobald ihr Konzept konkrete
   Sequenz-/Bewegtbild-Ideen enthält.
2. Dreh-Termin mit Jonatan: Patricks Entscheidung, ob/wann.
3. Rechte-Klärung (Nora): steht noch aus, sobald Material terminiert ist.
4. `task-milo-stock-api`/`task-milo-ballclip` bleiben wie gehabt
   blockiert — unverändert durch diesen Bericht.
5. **Farbkonflikt Navy vs. Warmbraun** (Abschnitt 0/6): Patrick und
   Vivien sollten das kurz abstimmen, bevor Viviens Wow-Konzept auf
   einer der beiden Richtungen aufbaut.
6. Die produzierte Sprungball-Sequenz liegt bewusst nur im Scratchpad/
   als privates Artifact — Übernahme ins Repo (`public/images/` o. Ä.)
   erst nach Viviens/Patricks Freigabe, nicht eigenmächtig von mir.
