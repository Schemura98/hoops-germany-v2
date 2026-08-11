# Hero-Konzept: Scroll-gesteuerte Startseite

Auftrag von Patrick, 11.08.2026. Erstellt von Vivien (design-spezialistin). **Status: Konzept +
Spezifikation, noch KEIN Code.** Umsetzung folgt durch die Hauptsession nach diesem Dokument.

## Versionsstand

- **v1 (11.08.2026, vormittags):** Desktop als Vollfassung entworfen, Mobile als Reduktion daraus
  abgeleitet. Entstand ohne belegten Nutzungskontext.
- **v2 (11.08.2026, nachmittags — dieses Dokument):** Auf Patricks verbindliche Entscheidung
  umgestellt: *„Die App wird aus Sicht der Zielgruppe und Einsatzorte eher mobil eingesetzt und
  getestet, deshalb muss es mobil optimiert sein."* → **Mobil ist der Hauptfall, Desktop die
  Ausbaustufe.** Zusätzliche Grundlage: Neles Kampagnen-Check
  (`docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md`) und Milos Materialbefund zum Hero-Foto
  (`docs/HERO-ASSETS-2026-08-11.md`, selbst nachgemessen). Der verworfene Desktop-first-Rahmen aus
  v1 ist **nicht gelöscht**, sondern in Anhang A protokolliert.

**Was sich gegenüber v1 inhaltlich ändert:**
1. Reihenfolge gedreht: Mobile bekommt einen eigenen, vollwertigen Signature-Moment statt eines
   CTA-Pulses als abgeschwächtem Fallback. Desktop erweitert diesen Moment, ersetzt ihn nicht.
2. Primärer CTA „Als Spieler registrieren" bestätigt (Nele, Beleglage Bedarfsanalyse) — die
   Ball-Ankunft dort bleibt richtig gezielt.
3. Kein Wortlaut geändert (Nora/Nele-Zuständigkeit) — aber geprüft, dass das Layout mit der
   kürzeren Zeile „...in NRW" statt „...in Deutschland" robust bleibt (siehe unten).
4. Der Ken-Burns-Foto-Zoom aus v1 entfällt **vollständig**, auf Mobil und Desktop — Begründung mit
   nachgemessenen Zahlen unten.
5. Kein Pinning/keine Zusatzstrecke auf Mobil bleibt gesetzt (unverändert aus v1, von Nele explizit
   bestätigt) — aber der eine mobile Moment wird jetzt ambitionierter statt eines reinen Pulses.

Einbezogene Kollegen: Nele (Kampagnen-Check, bereits vorliegend, siehe oben), Milo
(Materialbefund, bereits vorliegend). Keine weiteren — Nora/Lina/Ben sind laut Neles Dokument für
die Wortlaut- bzw. Tracking-Fragen zuständig, nicht für dieses Bewegungs-Konzept.

---

## Konzept in einem Satz (unverändert gültig)

**„Sprungball"** — der Hero erzählt die Ankunft auf der Plattform als Bewegung: ein Ball findet
seinen Weg zur Registrieren-Schaltfläche, das Spielfeld-Linienmotiv und die Marken-Navy vertiefen
die Szene dabei — Headline, Subline und alle CTAs bleiben vom ersten Pixel an exakt so sichtbar und
bedienbar wie heute, nur der Hintergrund erzählt die Ankunft. **Was sich in v2 ändert, ist nicht die
Idee, sondern wo sie zuerst vollständig gebaut wird:** auf dem Handy, nicht auf dem Desktop.

---

## Mobil zuerst: der Signature-Moment „Einwurf" (375–430px, Hochformat, Daumenzone)

### Die Bewegung

Der Ball (wiederverwendetes SVG-Markup aus `HeroBallArc.js` — Gradient, Nähte, Netz-Rautenmuster,
alles bereits markenkonform) fällt **vertikal** durch den Hero, während dieser beim natürlichen
Scrollen vorbeizieht — keine seitliche Flugbahn wie am Desktop, sondern eine Fallbewegung von oben
nach unten mit leichtem Sinus-Wackeln (Amplitude ±6px) und Rotation. Startpunkt: knapp oberhalb des
sichtbaren Bereichs, direkt unter der Navbar. Zielpunkt: ein kleiner (20×14px), fest positionierter
Korb-/Netz-Glyph, der wie ein Emblem an der **oberen rechten Ecke des primären CTA-Buttons**
(„Als Spieler registrieren") sitzt, zur Hälfte über die Button-Kante hinausragend — ähnlich einem
Benachrichtigungs-Badge, nie über dem Button-Label. Beim Eintreffen ein kurzer Netz-Swish (derselbe
Feder-Mechanismus wie heute in `HeroBallArc.js`s `THROUGH_START`/Swish-Berechnung).

Das ist der **eine** Signature-Moment auf Mobile — kein zusätzlicher Effekt daneben.

### Warum diese Lösung (und nicht die anderen drei geprüften)

| Alternative | Geprüft, verworfen weil |
|---|---|
| **Seitlicher Bogen wie am Desktop-Gutter** | Mobile hat keine Lateralfläche: Die CTA-Buttons sind unterhalb 640px `w-full` und gestapelt (`HERO_W = "w-full sm:w-52"` in `LandingHero.js` — der `sm:`-Wert greift auf Phones nicht). Jede seitliche Bahn kreuzt entweder Text oder endet unter dem Falz — derselbe Befund, der schon zur xl-only-Entscheidung von `HeroBallArc.js` geführt hat. |
| **Linienbogen, der sich um den CTA legt** (Vorschlag aus dem Auftrag) | Geprüft: Der Bogen bräuchte Freiraum entweder unter dem Button (kollidiert bei 3 UND 5 Buttons mit dem jeweils nächsten Button im Stack) oder über ihm (kollidiert mit der Subline). Bei wechselnder Button-Anzahl (3 ausgeloggt / 5 eingeloggt) ist das nicht robust mit einem festen Wert lösbar, ohne bei jeder Variante neu zu vermessen. |
| **Reiner CTA-Puls per IntersectionObserver** (v1-Fallback) | Von Patrick zu Recht als zu wenig ambitioniert eingestuft — eine Reaktion auf das Erscheinen des Buttons ist kein eigener Erzählmoment, nur eine Bestätigung. |
| **Netz-/Ring-Geste am Rand ohne Flugbahn** (dritter Vorschlag aus dem Auftrag) | Als isolierte Lösung zu schwach (kein Bewegungs-Ursprung, wirkt beliebig) — aber ihr Kern (kurze Geste statt langer Bahn) ist Teil der gewählten Lösung: Der Fall-Weg ist bewusst kurz, der Swish am Ende ist genau diese Geste. |

**Warum die vertikale Fallbewegung trägt, wo die horizontale nicht trug:** Sie nutzt die
Bildschirm-Dimension, die auf einem Phone tatsächlich reichlich vorhanden ist (Höhe, nicht Breite),
und sie läuft in **dieselbe Richtung wie die Scroll-Geste** des Nutzers — verstärkt das Gefühl „ich
bewege mich nach unten, der Ball auch mit mir", statt gegen die Scrollrichtung zu wirken. Und sie
braucht nur **einen** Referenzpunkt (`getBoundingClientRect()` des primären CTA-Buttons), nicht die
Gesamthöhe des Content-Blocks — bleibt deshalb bei 3 wie bei 5 Buttons gleichermaßen korrekt, ohne
Sonderfall-Code je Variante.

### Technische Spezifikation Mobil

```js
// Fortschritt entlang der ohnehin vorhandenen Scroll-Passage (kein Pin, keine Zusatzstrecke)
const t = clamp((NAVBAR_HEIGHT - heroRect.top) / (heroRect.height * 0.7), 0, 1);

// Ballbahn: reine Fallbewegung, CTA-Rect als Ziel (nicht als Festwert)
const y0 = -40;                          // Startpunkt oberhalb der Navbar
const y1 = ctaRect.top - heroRect.top - 8; // Zielpunkt: 8px über der CTA-Oberkante
const x  = ballCenterX + Math.sin(t * Math.PI * 2.2) * 6; // leichtes Wackeln, keine Gerade
const y  = y0 + (y1 - y0) * t;
const rotate = t * 280;

// Korb-Emblem: fix an der CTA-Ecke, erst kurz vor Ankunft sichtbar
emblem.style.opacity = t > 0.85 ? String((t - 0.85) / 0.15) : "0";
```

- Ball- und Emblem-Layer sind aria-hidden, `pointer-events: none`, ausschließlich `transform` und
  `opacity`.
- Fällt der Ball bei einem schnellen Fling durch den unteren Bildschirmrand, bevor `t=1` erreicht
  ist, ist das unkritisch: Das Ziel hängt an der bereits sichtbaren Position des CTA-Buttons, nicht
  an einer festen Bühnenkoordinate — es „materialisiert" beim Ankommen unabhängig von der
  Scrollgeschwindigkeit, keine Sonderbehandlung nötig (deckt sich mit der Web-Interface-Guidelines-
  Regel „Animationen interruptible").
- Fehlt der CTA-Ref (z. B. vor Hydration) → Komponente rendert nichts, exakt die defensive Praxis,
  die `HeroBallArc.js` bei fehlendem `active`-Zustand bereits nutzt.
- **Navy-Vertiefung und ein Linienbogen bleiben aus v1 unverändert Teil der mobilen Fassung**
  (Navy-Layer max. Opacity 0.5, ein Drei-Punkte-Bogen als reiner Opacity-Fade 0→0.14, keine
  gerichtete Clip-Path-Wischbewegung) — das war in v1 schon die mobile Reduktion und bleibt richtig,
  nur der Ball bekommt jetzt einen echten Moment statt eines Pulses.

---

## Performance-Budget Mobil (konkret, mit Messpunkten)

- **Maximal 4 animierte Layer**, davon 2 mit kontinuierlicher Pro-Frame-Mutation (Ball, Navy-Opacity
  + Linienbogen-Opacity teilen sich dieselbe `t`-Quelle und zählen praktisch als ein
  Update-Durchlauf) und 1 mit einem einmaligen Schwellenwert-Wechsel (Korb-Emblem, kein Dauer-Update
  über die ganze Scrollstrecke). Kein Foto-Transform (siehe Zoom-Entscheidung unten).
- Ausschließlich `transform` (translate/rotate) und `opacity` — kein `filter`, kein
  `clip-path`-Wipe auf Mobil (Reveal läuft dort nur über Opacity, wie in v1 entschieden).
- **Ein** zentraler `scroll`-Listener (`passive: true`), **ein** `requestAnimationFrame`-Tick pro
  Scroll-Event, direkte Style-Mutation ohne React-Re-Render — identisch zum bewährten Muster in
  `HeroBallArc.js`.
- Alle `getBoundingClientRect()`-Aufrufe ausschließlich im rAF-Callback bzw. Resize-Handler, nie
  während des React-Renders (Web-Interface-Guidelines-Regel „No layout reads in render").

**Messpunkte, die die Umsetzung nachweisen muss** (nicht „fühlt sich gut an"):
1. Chrome DevTools Performance-Panel, **4× CPU-Throttling**, Moto-G4-Profil oder vergleichbar:
   durchgängiger Scroll durch den Hero ohne Long Tasks (>16,7ms) im Bereich der Layer-Updates.
2. Lighthouse Mobile (throttled): CLS unverändert zu heute (0 durch diese Komponente — keine
   layout-verschiebenden Eigenschaften), LCP unverändert zu heute (kein neues Bild im kritischen
   Pfad, siehe unten).
3. Schneller Fling-Scroll (ganzer Hero in <300ms) darf kein Einfrieren/Scroll-Blockieren erzeugen —
   Ball/Emblem dürfen sichtbar „nachspringen", der Scroll selbst darf nie hängen.
4. **Test auf echtem Mittelklasse-Android-Gerät** vor Live-Freigabe (nicht nur Emulator/Throttling)
   — Pflicht-Check laut `emil-design-eng`, hier noch nicht durchgeführt, weil dieses Dokument ein
   Konzept ist, kein Code.

---

## Ken-Burns-Zoom: gestrichen (Materiallage von Milo, selbst nachgemessen)

Milo hat gemeldet, ich habe es selbst nachgeprüft (`Image.open("login image.jpg").size` →
**(1000, 652)**, Dateigröße **76.505 Byte ≈ 74,7 KB** — deckt sich mit seinem Befund):

- Bei Vollbild-`background-size: cover` ist das Foto **ohne jede Zoom-Animation** bereits auf
  **1,44×** (1440px-Desktop, DPR1) bis **5,12×** (2560px-Desktop, DPR2) hochskaliert. Mit dem in v1
  vorgeschlagenen 1.00→1.05-Zoom stiege das auf bis zu **5,38×**.
- Das ist keine Geschmacksfrage: Ein Foto, das bereits über das Fünffache seiner Quellauflösung
  gestreckt gezeigt wird, zusätzlich zu vergrößern, verstärkt sichtbare Weichzeichnung und
  Kompressionsartefakte messbar. „Sieht auf meinem Monitor okay aus" trägt bei dieser Zahlenlage
  nicht.
- **Entscheidung: Der Foto-Zoom entfällt vollständig — auf Mobil UND Desktop**, nicht nur reduziert
  auf z. B. 1.00→1.02. Die „Ankunfts"-Tiefe entsteht stattdessen ausschließlich über
  - den Overlay-Opacity-Wert (0.65→0.72 in Szene A, ein reiner Schwarz-Layer, auflösungsunabhängig)
    und
  - die Vektor-Layer (Linienmotiv, Ball/Korb-Emblem) —

  keine dieser beiden Techniken vergrößert Foto-Pixel, es entsteht also kein zusätzlicher
  Qualitätsverlust gegenüber dem heutigen, unbewegten Zustand.
- **Bedingte Wiedereinführung:** Sobald Material mit ≥3600px langer Kante vorliegt (Milos
  Empfehlung — ein normales Handyfoto von Patrick/Jonatan aus der Halle genügt technisch dafür),
  wäre ein sehr dezenter Zoom (z. B. 1.00→1.02, nur Desktop, wo die Skalierung geringer ausfällt)
  wieder vertretbar. Das ist ein **separater, zukünftiger** Vorschlag, keine Voraussetzung für dieses
  Konzept.
- **Konsistenz-Hinweis zu `/signup`** (nicht mein Auftrag — die Hauptsession baut die dortige
  Bildoptimierung laut Nachtrag selbst ein, aber relevant, falls später eine gestalterische Klammer
  Startseite ↔ `/signup` entstehen soll): Dasselbe Motiv wird dort im `AuthShell`-Split-Screen laut
  Milo noch stärker hochskaliert (bis 4,42× bei DPR2). Die Zoom-Streich-Entscheidung hier sollte bei
  einer eventuellen späteren Angleichung **nicht stillschweigend anders** für `/signup` gelten, falls
  dieselbe Bilddatei zum Einsatz kommt — ich flagge das nur als Konsistenz-Hinweis, entscheide es
  nicht mit.

---

## Robustheit gegenüber der bevorstehenden Textänderung („Deutschland" → „NRW")

Geprüft: Keiner der hier beschriebenen Layer ist an die Breite oder Zeilenzahl der Headline
gebunden. Das Linienmotiv positioniert sich relativ zum Bühnen-/Content-Container (Gutter-Breite am
Desktop, Container-Rand mobil), die Ball-Ziel-Position hängt am **CTA-Button-Rect**, nicht am
Headline-Text. Eine kürzere Zeile („...in NRW" statt „...in Deutschland") verändert höchstens die
Höhe des Headline-Blocks geringfügig (typischerweise identische Zeilenzahl, da „NRW" kürzer als
„Deutschland" ist) — das verschiebt CTA-Block und damit den Ball-Zielpunkt automatisch mit, weil
der Zielpunkt zur Laufzeit gemessen wird, nicht hart codiert ist. **Keine Anpassung an diesem
Konzept nötig**, wenn die Hauptsession den Textfix einbaut.

---

## Desktop als Ausbaustufe (nicht mehr die Vollfassung)

Desktop bekommt **alles, was Mobile hat** — Ball-Ankunft am primären CTA, Navy-Vertiefung,
Linienmotiv — **plus** den Pin/140vh/Drei-Szenen-Rahmen aus v1 als zusätzliche Bühne davor. Die
mobile „Einwurf"-Idee wird zum **Finale** der Desktop-Choreografie (Szene C), nicht zu etwas
komplett anderem — dasselbe Korb-Emblem an derselben CTA-Ecke ist auch am Desktop der Zielpunkt,
nur mit mehr seitlichem Raum für eine sichtbar längere Bézier-Flugbahn statt der kompakten
vertikalen Mobile-Bahn. **Ein Konzept, zwei Ausbaustufen — nicht zwei Konzepte:**

| | Mobil (Basis, <1024px) | Desktop (Ausbaustufe, ≥1024px) |
|---|---|---|
| Pin/Zusatzstrecke | keine | 140vh, wie in v1 begründet (deutlich unter Apple-typischen 300–400vh) |
| Foto | unbewegt (kein Zoom, s. o.) | unbewegt (kein Zoom, s. o. — **v1-Wert 1.05 gestrichen**) |
| Navy-Fläche | Opacity 0→0.5 (Tint, kein Vollwechsel) | Opacity 0→1 (voller Wechsel, Szene B) |
| Linienmotiv | 1 Bogen, Opacity-Fade | 2 Bögen, Clip-Path-Wipe (Szene A/B) |
| Ball-Ziel | Korb-Emblem an CTA-Ecke, vertikale Bahn | Korb-Emblem an CTA-Ecke, seitliche Bézier-Bahn (Szene C) |
| Signature-Moment | vollständig vorhanden | derselbe Moment, nur mit mehr Inszenierung drumherum |

Die konkreten Werte, die DOM-Skizze, die Komponentenstruktur und die Sticky-/Pin-Mechanik aus v1
für Szene A/B/C bleiben inhaltlich gültig — mit zwei Korrekturen gegenüber v1:
1. `PHOTO_SCALE_END = 1.05` entfällt ersatzlos (kein Foto-Transform mehr, siehe oben).
2. `BALL_FLIGHT`-Zielpunkt war in v1 bereits als `ctaRef.getBoundingClientRect()`-Mittelpunkt
   spezifiziert — das bleibt, wird jetzt aber explizit als **dieselbe** Korb-Emblem-Logik wie mobil
   benannt (ein Bauteil, zwei Bahn-Berechnungen je Breakpoint), nicht als eigenständiges
   Desktop-only-Element.

Alle übrigen Desktop-Werte (Komponentenstruktur, `RUNWAY_VH=140`, Szenen-Tabelle, Ablösung von
`HeroBallArc.js` zugunsten von `HeroBallArrival.js`, Referenzliste, Grundsatzentscheidung
rAF statt CSS-`animation-timeline`) sind unverändert gültig und im Volltext in **Anhang A**
dokumentiert, um dieses Dokument nicht mit Wiederholungen aufzublähen.

---

## Reduced-Motion-Fassung (angepasst)

Unverändert zu v1 im Mechanismus (`matchMedia("(prefers-reduced-motion: reduce)")`,
`RUNWAY_VH → 0` bei aktivierter Präferenz, Layer rendern sofort im Endzustand, Ball-/Emblem-Layer
wird gar nicht gerendert) — mit einer Vereinfachung durch die Zoom-Streichung: Da das Foto ohnehin
nie animiert wird, entfällt der in v1 nötige Sonderfall „Foto ohne Zoom rendern" ersatzlos. Endzustand
bleibt: Foto unbewegt, Navy-Layer fix bei Opacity 0.25 (Desktop) bzw. 0.2 (Mobil, dezenterer
Marken-Tint), Linienmotiv fix bei finaler Opacity, kein Ball, kein Emblem. Alle Inhalte und CTAs
identisch zur bewegten Fassung vorhanden.

---

## Risiken/Grenzen (ehrlich, aktualisiert)

- **Die Neuordnung löst einen scheinbaren Widerspruch zu Neles Befund auf — hier eingeordnet, nicht
  verschwiegen:** Nele kommt in ihrem Kampagnen-Check zum Schluss, die v1-Mobile-Reduktion sei
  „aus Kampagnensicht richtig, keine Nachbesserung nötig" — weil der Kampagnen-QR den Hero über
  `/signup?src=...` komplett umgeht. Das bleibt faktisch richtig für DIESE Kampagne. Patricks
  Entscheidung ist aber breiter gefasst: Sie gilt der generellen Nutzungsmuster-Einschätzung der App
  (mobil dominiert unabhängig von diesem einen QR-Pfad), nicht nur der laufenden Tester-Aktion. Beide
  Aussagen widersprechen sich nicht — sie beantworten unterschiedliche Fragen. Ich folge Patricks
  verbindlicher, breiterer Entscheidung.
- **Kein Pin auf Mobil bleibt bewusst bestehen** — auch v2 fügt keine Zusatz-Scrollstrecke auf
  Handys hinzu. Der „mobil optimiert"-Auftrag wird hier als „ein echter, eigenständiger
  Bewegungsmoment ohne Zeitkosten" gelesen, nicht als „so lang wie am Desktop". Sollte Patrick mit
  „mobil optimiert" tatsächlich eine dem Desktop gleichwertige *Länge* der Inszenierung meinen (nicht
  nur Qualität), wäre das ein Kurswechsel, den ich nicht eigenmächtig vorwegnehme — bitte
  rückmelden, falls das gemeint war.
- **Der Ken-Burns-Verzicht ist ein echter gestalterischer Verlust**, kein kostenloser Tausch: Ohne
  Foto-Bewegung trägt Szene A am Desktop weniger visuelle Energie als in v1 geplant. Das ist der
  Preis für Bildqualität bei diesem Ausgangsmaterial — vertretbar, aber nicht unsichtbar. Sobald
  hochauflösendes Material vorliegt, sollte der Zoom-Vorschlag erneut geprüft werden.
- **Safari/iOS, Low-End-Android, LCP:** Einschätzung unverändert zu v1 (rAF-Technik statt CSS-
  Timelines, kein neues Bild im kritischen Pfad) — siehe Anhang A für die volle Begründung.
- **Korb-Emblem-Positionierung an der Button-Ecke ist ein neues, ungetestetes UI-Element:** Anders
  als der reine CTA-Puls aus v1 fügt das Emblem ein dauerhaft sichtbares (wenn auch kleines)
  Vektor-Element am Button hinzu. Vor Live-Freigabe visuell prüfen, dass es auf allen drei
  CTA-Varianten (ausgeloggt: „Als Spieler registrieren"; eingeloggt: „Zum Feed") nicht mit
  System-UI (z. B. iOS-Dynamic-Island-Aussparung bei sehr hohen Buttons) kollidiert.

---

## Selbsttest

„Würde ein gutes Designstudio das mit seinem Namen unterschreiben?" — Ja. Die Reihenfolge-Korrektur
ist kein Nachbessern eines Fehlers, sondern das Ergebnis fehlenden Nutzungskontexts in v1, der jetzt
vorliegt — ein gutes Studio dreht ein Konzept ohne Gesichtsverlust um, wenn neue Fakten (mobile
Priorität, Bildmaterial-Grenzen) das verlangen, und sagt das offen, statt die alte Reihenfolge
kosmetisch umzudeuten.

---

## Anhang A: verworfener Desktop-first-Rahmen (v1, 11.08.2026 vormittags)

Diese Reihenfolge (**Desktop = Vollfassung, Mobile = Reduktion**) wurde von Patrick am 11.08.
nachmittags verworfen. Der Inhalt bleibt hier als Protokoll stehen — er ist **nicht mehr die
aktuelle Empfehlung**, die Werte (Szenen-Timing, `RUNWAY_VH`, DOM-Skizze, Komponentenstruktur,
Grundsatzentscheidung rAF vs. CSS-Timelines, vollständige Referenzliste) gelten aber inhaltlich für
die Desktop-Ausbaustufe in v2 weiter, siehe Verweis oben.

### Szenen-Dramaturgie (Desktop, ≥1024px) — Timing unverändert gültig

| Szene | `p`-Bereich | Was passiert (v1-Text, Foto-Zoom seit v2 gestrichen) | Botschaft |
|---|---|---|---|
| **A — Anwurf** | 0.00–0.30 | ~~Foto bekommt einen sehr sanften Ken-Burns-Zoom (scale 1.00→1.05)~~ **entfällt seit v2**. Ein dünner Drei-Punkte-Linien-Bogen (orange, 16 % Deckkraft) blendet per Clip-Path-Wipe von links ein. Overlay-Opacity 0.65→0.72 trägt die Tiefe jetzt allein. Content-Block bleibt exakt an seiner heutigen Position. | Tiefe/Ankunft, bevor irgendetwas „passiert". |
| **B — Wechsel** | 0.30–0.65 | Navy-Fläche (`from-slate-950 to-slate-800`) blendet über dem Foto ein (Opacity 0→1). Zweiter, dezenterer Linienbogen (Mittelkreis-Segment, 12 %) kommt hinzu. | Der Hero „wird" die Marke. |
| **C — Bereit** | 0.65–1.00 | Ball fliegt auf Bézier-Bahn zum primären CTA-Button (seit v2: Ziel ist das Korb-Emblem an der Button-Ecke, dieselbe Logik wie mobil), Settle-Puls, CTA-Unterstrich. Linienmotiv dimmt auf 8 %. Bei `p=1` löst sich der Pin. | „Hier geht's los". |

### Konkrete Werte (Desktop) — mit v2-Korrektur

```js
const RUNWAY_VH = 140;
const NAVBAR_HEIGHT = 64;
// const PHOTO_SCALE_END = 1.05;  // ENTFÄLLT seit v2 — Begründung siehe Hauptteil
const NAVY_FADE = [0.30, 0.65];
const ARC1_REVEAL = [0.05, 0.35];
const ARC2_REVEAL = [0.35, 0.55];
const ARC_DIM     = [0.85, 1.00];
const BALL_FLIGHT  = [0.65, 0.95]; // Ziel: ctaRef-Rect, wie in Mobile-Spezifikation
const BALL_SETTLE  = [0.95, 1.00];
const CTA_UNDERLINE = [0.92, 1.00];
```

### Grundsatzentscheidungen (unverändert gültig)

- **rAF/Scroll-Listener statt CSS `animation-timeline`:** Safari-Support erst seit Version 26
  (Herbst 2025, Bugfixes bis Juni 2026), globale Unterstützung ~84 % Mitte 2026 — zu riskant für
  eine Plattform, die gezielt aufs Handy führt. Baut auf der bewährten `HeroBallArc.js`-Technik auf.
- **`HeroBallArc.js` wird abgelöst, nicht ergänzt:** Ball-/Korb-Vektor wird 1:1 übernommen, nur die
  Bahn-Berechnung wechselt (Ziel: CTA-Button statt freier Gutter-Parabel). Empfehlung, keine
  eigenmächtige Änderung an Patricks Arbeit vom 11.08.
- **`react-view-transitions` bewusst nicht eingesetzt:** für diskrete Zustands-/Routenwechsel gedacht,
  nicht für kontinuierliches, umkehrbares Scroll-Scrubbing.

### Komponentenstruktur (unverändert gültig, jetzt mit mobiler Bahn-Variante)

```
components/landing/
  HeroScrollStage.js      Pin-Wrapper (nur ≥1024px aktiv) + zentraler rAF-Controller
  CourtLineMotif.js        inline-SVG, aria-hidden, 1 Bogen mobil / 2 Bögen Desktop
  HeroBallArrival.js       Ball+Korb-Emblem, Bahn-Berechnung nach Breakpoint (vertikal mobil /
                           Bézier Desktop), Ziel immer ctaRef.getBoundingClientRect()
  LandingHero.js            Wrapper ersetzt, innerer Content-JSX unverändert
  HeroBallArc.js            Vorschlag: ablösen zugunsten von HeroBallArrival.js
```

### DOM-Skizze (Desktop, gepinnt) — unverändert gültig, ohne Foto-Transform-Layer

```
<section class="relative">
  <div style="height: calc(100vh - 4rem + 140vh)">
    <div class="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
      <div class="absolute inset-0" style="background: url(login image.jpg) center/cover" />
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-800" style="opacity:0" />
      <div class="absolute inset-0 bg-black/[.68]" />
      <CourtLineMotif aria-hidden />
      <HeroBallArrival aria-hidden targetRef={ctaRef} />
      <div class="relative z-10 ...">{/* unveränderter Content-Slot */}</div>
    </div>
  </div>
</section>
```

### Referenzliste (Inspiration, keine Kopie) — unverändert gültig

- **DRIP-Video** (`docs/INSPIRATION-SCROLL-BEISPIEL-2026-08-10.md`) — übernommen: Pinning,
  Masken-/Blend-Übergang, eine Botschaft je Szene. Nicht übernommen: orbitierende Text-Etiketten.
- **WebKit-Blog, „A guide to Scroll-driven Animations with just CSS"**
  (https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/) — übernommen:
  Bewegung konsequent in `prefers-reduced-motion` kapseln, `animation-range` begrenzen. Nicht
  übernommen: die Technik selbst als Hauptweg.
- **caniuse, `animation-timeline: scroll()`**
  (https://caniuse.com/mdn-css_properties_animation-timeline_scroll) — Beleg für die
  Safari-Reife-Einschätzung.
- **Apple-Produktseiten** (u. a.
  https://uxplanet.org/8-things-i-learned-analyzing-apples-product-pages-9a5284681b37,
  https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/)
  — übernommen: „ein Blickwinkel/eine Idee pro Viewport". Nicht übernommen: SF-Pro-Typografie,
  Bildsequenz-Technik.
- **Awwwards, Sammlung „Sports"** (https://www.awwwards.com/websites/sports/, u. a. Lacoste Ace
  Breaker, Radian, Balmoral, Podium) — übernommen: ein technisch sauberer Signature-Moment statt
  vieler kleiner Effekte. Nicht übernommen: Layout/Branding dieser Seiten.
- **`ui-ux-pro-max`, Domain `gsap`, Preset „Scroll Reveal" (Complex-Tier)** — übernommen: max. 1–2
  gepinnte Sektionen pro Seite, Layer-Zahl über 3–4 hat abnehmenden Ertrag, Recalc nach
  Bild-/Font-Load.
- **Eigene Vorarbeit:** `components/landing/HeroBallArc.js`, `docs/INSPIRATION-SCROLL-BEISPIEL-
  2026-08-10.md`.

## Assets — unverändert gültig, mit Materialstand ergänzt

Für die Basis (Mobil + Desktop-Ausbaustufe) braucht Milo weiterhin **nichts Neues** — bestehendes
Foto (unbewegt, kein Zoom mehr), Marken-Navy als CSS-Gradient, Ball-/Korb-Vektor als Inline-SVG.
**Neu seit v2:** Milo hat für dasselbe Foto bereits gewichtsoptimierte, auflösungsgleiche Varianten
bereitgestellt (`login-image-1000.webp`, 38,1 KB; `login-image-1000.avif`, 24,6 KB) — die lösen das
Schärfe-Problem nicht (gleiche 1000×652-Quelle), sparen aber Ladezeit und sollten unabhängig von
diesem Konzept eingebunden werden. Optionale Ausbaustufe mit echtem Video bleibt wie in v1
beschrieben (4–6s Loop, ≤1,5MB Desktop/≤600KB Mobil, Poster-Frame Pflicht) — weiterhin explizit
**nicht** Voraussetzung.
