# Inspirations-Notiz: Patricks Scroll-Telling-Beispiel (10.08.2026)

Quelle: Von Patrick bereitgestelltes Video (Screen-Recording einer
Produkt-Landingpage „DRIP"-Trinkflasche; YouTube-Short:
https://www.youtube.com/shorts/A2b8F0IdbVo). Frames analysiert am
10.08.2026. **Referenz für Viviens Design-Aufträge — Inspiration, nie Kopie.**

## Beobachtete Muster (das „Wow" zerlegt)

1. **Gepinntes Hero-Objekt:** Das Produkt bleibt beim Scrollen sticky in
   der Bildmitte und rotiert/kippt scroll-synchron (Bildsequenz oder
   3D-Transform), während die Seite „unter ihm" weiterscrollt.
2. **Text orbitiert das Objekt:** Eigenschaften (Material, Kapazität,
   Haltbarkeit) blenden als große Typo-Etiketten um das gepinnte Objekt
   ein/aus — je Scroll-Abschnitt eine Aussage, nie mehrere gleichzeitig.
3. **Masken-Übergänge:** Sektionswechsel über expandierende Kreis-Masken
   (Objekt „taucht" durch einen Kreis in die nächste Szene) statt harter
   Schnitte.
4. **Ruhige Basis:** Ein-Farb-Hintergrund (warmes Beige), dunkles Produkt,
   eine Akzentfarbe — die Bewegung trägt die Dramaturgie, nicht die Farben.
5. **Klare Zählung:** Wenige, klar getrennte Scroll-Szenen (Hero → Feature
   → Feature → CTA), jede mit genau einer Botschaft.

## Übertragung (Vorschlags-Ebene, Entscheidung bei Patrick/Jonatan)

- **Hoops:** Kandidaten für dieses Muster sind die Landing (Hero:
  Basketball/Screenshot-Objekt gepinnt, Features orbitieren) und die
  „So funktioniert's"-Strecke. Techniken: CSS Scroll-Driven Animations /
  sticky + Transform-Sequenzen, `react-view-transitions` für
  Seitenübergänge; Assets (Rotations-Bildsequenz) von Milo
  (medien-produzent). Pflicht: Performance-Budget mobil,
  `prefers-reduced-motion`-Fallback (statisches Layout bleibt vollständig
  nutzbar), keine Funktions-/Routen-Änderung.
- **HGH:** dosierter — z. B. Präsentations-Seite; die App selbst bleibt
  dem „Arbeitsjournal"-Charakter treu (DESIGN.md).

## Grenzen

Inspiration = Prinzipien (Pinning, Orbit-Typo, Masken-Übergang, eine
Botschaft je Szene). KEINE 1:1-Übernahme des Layouts, keine fremden Assets.
Frames liegen temporär im Session-Scratchpad; diese Notiz ist die dauerhafte
Referenz.
