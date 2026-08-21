# Inspirations-Notiz — das gespiegelte Feldende der Startseite

**Datum:** 21.08.2026 · **Trägerin:** Vivien (design-spezialistin)
**Skill:** `design-trend-recherche`

---

## Auftrag + Stufe

**Auftrag Patrick (wörtlich):** *„wie wäre es denn, wenn das Spielfeld aus der
Hero unten auf der Seite gespiegelt dargestellt wird und somit die ganze Seite
ein Spielfeld ergibt und somit am Ende der Pass an die Funktion/den Button zu
einem Wurf in den gegnerischen minimalistischen Korb landet / geworfen wird."*

**Stufe: M (Kurz-Sweep).** Begründung, zu Beginn festgelegt:

- **L wäre zu viel.** Die Formensprache ist entschieden und zweimal durch die
  Gates gegangen: strenge Draufsicht, FIBA-Maße, kühle Linie = Struktur, ein
  Orange = der Ring, Tiefe statt Lage (`docs/VISUELLE-RICHTUNG-2026-08-12.md`,
  `docs/INSPIRATION-HERO-FELD-2026-08-20.md`). Es steht keine Paletten-, Typo-
  oder Stilfrage offen.
- **S wäre zu wenig.** Zwei echte Gestaltungsentscheidungen standen zur
  Disposition: ob der Ball in den Korb fliegt (Erzählung) und ob die Seite ein
  durchgehendes Feld wird (Komposition). Beides ist mehr als eine
  Token-Korrektur.

**Register vor Suche hat den Kern des Auftrags vorentschieden.** Im
`referenz-register.md` stand bereits, vom 20.08.2026:

> Der Abschluss-Korb (`KorbRuhe.js`, Tobias' „Radarschirm") lässt sich mit der
> Hero-Lösung NICHT reparieren. Was den Ring dort eindeutig macht, ist das
> BRETT — und das ist bei maßstabsgetreuer Zeichnung 4 Ringradien breit […]
> Die Marke bräuchte statt 1 : 1 ein Verhältnis von 3 : 1.

Damit war ohne eine Minute Suche klar: Eine quadratische Marke kann den Befund
nicht lösen, ein **Feldstück** kann es. Der Sweep musste nur noch die zweite
Frage beantworten — wohin der Ball fliegt.

---

## Suchschnitt

Sport-Community, Vereinsumfeld, mobil zuerst, Zielgruppe Liga-Spieler und
Team-Admins 16–35 in NRW, kostenlos, kein Bildbudget. Offene Frage:
**Wie endet eine scroll-getriebene Objektreise — am Handlungsknopf oder
dahinter?**

---

## Referenzen

| Quelle | Sorte | Was daran stark ist | Was ich übernehme | Was bewusst NICHT |
|---|---|---|---|---|
| `lastdanceforglory.world` (Awwwards Honorable Mention, 23.07.2026) — **aus dem Register übernommen, nicht neu gesucht** | A/B | *„scroll the golden trophy through nine chapters"* — ein Objekt reist durch die ganze Seite und ist der rote Faden, nicht die Dekoration | Die Bestätigung, dass die Reise selbst trägt: Das Objekt muss am Ende **ankommen**, nicht bloß aufhören | Die mythologische Tonalität. Hoops verkauft Belegbarkeit, nicht Legende |
| `landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages` + `trajectorywebdesign.com/blog/website-call-to-action-best-practices/` | B | Der Abschluss-CTA ist der *final push* für die Leser, die die ganze Wertgeschichte konsumiert haben — genau die Gruppe, die hier ankommt. Dazu: „If users consistently abandon a page before reaching a call to action, consider repositioning **or redesigning the content hierarchy**" | Das Argument gegen den Wurf: Die Hierarchie am Seitenende hat **eine** Spitze, und das ist die Taste. Der stärkste Blickfang der Seite (der Ball) gehört dorthin | Die Empfehlung mehrerer CTAs über die Seite verteilt. Nele hat den Hero bewusst auf **einen** Ausgang reduziert; ein zweiter Knopf nähme diese Entscheidung zurück |
| Eigenes Referenz-Register, Eintrag 20.08.2026 („Brett, 3 : 1") | B | Benennt die Ursache des „Radarschirm"-Befunds als **Projektionsfrage**, nicht als Größenfrage — und nennt das Element, das sie löst | Genau das: Das Brett kommt zurück, weil ein Feldstück den Platz dafür hat, den eine quadratische Marke nie hatte | „Mehr Netzdetail". Die verworfene Richtung aus derselben Notiz — von oben ist jede konzentrische Radialfigur ein Instrument, kein Korb |
| FIBA, *Official Basketball Rules 2026*, Rule 2.5.1–2.5.7 + Diagram 3 | C | Die Maße selbst, inkl. der Aufstellungsmarken und der neutralen Zone | Unverändert übernommen, jetzt aus **einer** Quelldatei (`components/landing/feldmasse.js`) für beide Enden | — |

---

## Gegenprobe (nicht Pflicht auf Stufe M, hier trotzdem gelaufen)

**Branchen-Einerlei:** Sport- und Vereinsseiten setzen auf Hallenfotos und
Actionbilder; prämierte Sportseiten setzen ein Bildbudget voraus, das wir nicht
haben (Negativbefund aus dem 19.08.-Sweep, hier erneut bestätigt).

**Was wir anders machen:** Die Seite ist kein Behälter für Bilder, sondern
selbst der Gegenstand — ein Feld, an dessen beiden Enden ein Korb steht. Das
kostet null Bytes Bilddaten und ist mit einem Fotobudget gar nicht erreichbar.

---

## Umsetzbarkeit

Kein neues Werkzeug nötig. Reines SVG plus die vorhandene
`Aussenlinie`-Mechanik. Kein JavaScript im neuen Bauteil, keine Bilddaten,
keine Animation — die Zeichnung ist Markup und kommt mit dem ersten Bild.

---

## Nicht geprüft — ehrlich benannt

- **Sorte D (Video) ist weiterhin nicht betriebsbereit.** Es lag kein
  Referenzvideo vor, und der `watch`-Preflight meldet unverändert fehlende
  Werkzeuge. Aussagen über die *Wirkung* fremder Scroll-Arbeiten stützen sich
  deshalb auf Beschreibungen, nicht auf Gesehenes.
- **Awwwards/siteinspire wurden nicht abgefragt.** Registerurteil vom
  15.08.2026: „Sorte A versagt bei Gebrauchsflächen" — die offene Frage war
  eine Hierarchiefrage am CTA, keine Stilfrage.
- **`land-book` und `godly` bleiben unerreichbar** (403, im
  `quellen-register.md` seit 12.08.2026).
- **Die eigene Arbeit ist dagegen gesehen, nicht nur gemessen:** neun
  Standbilder, davon drei bei dreifacher Auflösung. Zwei Befunde stammen
  ausschließlich aus dem Hinsehen und aus keiner Messung — siehe Bericht.
