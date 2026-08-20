// ══ DIE KORB-MARKE DES ABSCHLUSS-BLOCKS — DRAUFSICHT ════════════════════════
//
// Neu gezeichnet am 20.08.2026 (Auftrag Patrick: „Richtung stimmt, Gates
// starten und den Korb im Abschluss-Block auch angleichen"). Vorher stand hier
// unveraendert die Schraegansicht aus dem entfallenen `HeroDunk.js`.
//
// ⚠️ WAS AN DER ALTEN FASSUNG DEFEKT WAR — am gebauten Stueck gesehen:
//   1. ZWEI PROJEKTIONEN AUF EINER SEITE. `HeroCourt.js` zeichnet streng von
//      oben; derselbe Gegenstand stand hier schraeg. Genau der Bruch, den
//      Patrick am Vorgaenger beanstandet hat, eine Etage tiefer.
//   2. GROSS UND BLASS WIRD BRAUN. Orange auf 0,62 x 0,55 gedimmt ueber die
//      halbe Blockbreite ist im Standbild kein Orange mehr, sondern ein
//      schmutziges Braun. `HeroCourt` haelt die Regel fest: eine kleine,
//      gesaettigte Marke liest sich als Absicht, eine grosse, blasse als Panne.
//   3. ES LAS SICH ALS LAMPENSCHIRM. Auf 390 px sass „BEREIT LOSZULEGEN?" IM
//      Korb, das Netz lief durch beide Tasten.
//
// ── ⚠️ UND EIN ZWEITER ANLAUF, DER GESCHEITERT IST — er gehoert hierher,
// weil er die naheliegende Loesung ist und der Naechste ihn sonst wiederholt:
// Die erste neue Fassung war die GROSSAUFNAHME desselben Korbs — Ring Ø 300
// Einheiten, Netz von oben, ganzflaechig hinter dem Text. Gebaut, angesehen,
// verworfen. Drei Befunde, alle am Standbild:
//   · Der Ring war unten angeschnitten. Ein angeschnittener Korb ist ein
//     Fragment — genau das, was die Vorgaenger-Fassung mit `meet` vermeiden
//     wollte. Bei einer Feld-MARKIERUNG ist Anschnitt der Normalfall, bei
//     einem GEGENSTAND ist er ein Unfall. Der Korb ist ein Gegenstand.
//   · Der orange Kreis kreuzte auf 1440 px die Headline und auf 390 px die
//     Beschriftung der zweiten Taste. Ausweichen ging nicht: Text UND Korb
//     sind beide mittig — auf jeder Breite.
//   · Ein grosser hohler Kreis unmittelbar neben einer gleichfarbigen Taste
//     liest sich nicht als Korb, sondern als zweites Bedienelement.
// ⚠️ DIE LEHRE, UND SIE IST DIE EIGENTLICHE: Eine Hintergrund-Zeichnung hinter
// einem MITTIG gesetzten Textblock kann dem Text nicht ausweichen. Es gibt
// keine Lage, die auf allen Breiten frei ist. Die alte Fassung hatte dasselbe
// Problem und hat es mit Deckkraft zugedeckt — daher das Braun. Das ist kein
// Justierungsfehler, es ist die Bauart.
//
// ── Die Loesung: keine Grundierung, eine MARKE ──────────────────────────────
// Der Korb steht jetzt IM FLUSS, ueber der Headline, in fester Groesse. Damit
// ist die ganze Fehlerklasse „Zeichnung kreuzt Text" nicht behoben, sondern
// abgeschafft: Ein Element im Fluss kann per Konstruktion nichts ueberlagern.
// Inhaltlich ist es die richtige Stelle. Der Hero setzt den kleinen orangen
// Ring ueber seine Headline; der Abschluss-Block tut dasselbe — dieselbe
// Marke, dieselbe Rolle, am anderen Ende der Seite. Die Seite bekommt
// Buchstuetzen statt einer Tapete.
// Unterschied zum Hero, damit es kein blosser Nachdruck ist: Dort ist der Korb
// aus der Distanz zu sehen (ein blosser Kreis im Feld), hier NAH — Ring und
// Netz. Derselbe Gegenstand, dieselbe Blickrichtung, andere Entfernung.
//
// ── Was von oben zu sehen ist ───────────────────────────────────────────────
// Ein Ring ist von senkrecht oben ein KREIS. Das Netz liegt darin und
// verjuengt sich nach unten, also erscheint es als kleiner werdende Kreise mit
// verdrehten Straengen. Die Verdrehung ist nicht Zierat: Ein Netz ist
// GEFLOCHTEN. Ohne sie sind acht Speichen in einem Ring ein Rad.
// Die Mitte bleibt OFFEN — man sieht durch den Korb hindurch. Bei einem Ziel
// ist das die richtige Aussage, und es haelt die dichteste Stelle der
// Zeichnung frei, statt dort einen Knoten aus acht Linien zu erzeugen.
//
// ── Farbrolle, unveraendert aus dem Hero ────────────────────────────────────
// Kuehle Haarlinie traegt die STRUKTUR (#3A4E7A, dieselbe Linienfarbe wie
// `HeroCourt`), Orange traegt die BEDEUTUNG und gehoert genau einem Ding: dem
// Ring. Vorher war das Netz ebenfalls orange — von zwei Gegenstaenden in einer
// Farbe wird keiner betont. Und der Ring wird NICHT gedimmt; er muss es nicht
// mehr, weil er keinen Text mehr kreuzt.

// ── Dichte und Groesse haengen zusammen — beides am Standbild entschieden ───
//
// ⚠️ ZWEI VERWORFENE FASSUNGEN, damit sie niemand wiederholt. Beide wurden
// gebaut, in ECHTER Anzeigegroesse angesehen und daran verworfen — nicht
// gerechnet, nicht geschaetzt:
//   · ACHT STRAENGE MIT 30 GRAD DRALL las sich als KAMERA-BLENDE. Starker
//     Drall auf gebogenen Straengen erzeugt Blendenlamellen, keine Masche.
//   · RAUTENMASCHE (Straenge gegenlaeufig gekreuzt) war bei dreifacher
//     Vergroesserung die schoenste Loesung und bei 56 px die schlechteste: Die
//     Kreuzungen verschmelzen, uebrig bleibt der STERN, den die Zwischenraeume
//     bilden. Aus dem Netz wird eine Rosette.
// ⚠️ Die Lehre gilt ueber diese Datei hinaus: Eine Zeichnung wird in der
// Groesse beurteilt, in der sie ausgeliefert wird. Eine Vergroesserung zeigt
// den Entwurf, nicht das Ergebnis.
//
// Was traegt: ZWOELF Straenge mit leichtem Drall und ZWEI Flechtringen. Zwoelf
// ist die Zahl eines echten Netzes; sie verteilt so gleichmaessig, dass keine
// Figur in den Zwischenraeumen entsteht — genau das, woran acht und sechs
// gescheitert sind. Die Flechtringe machen aus Speichen ein Geflecht (dasselbe
// Mittel wie im alten Emblem, dort mit zwei Querboegen). Der leichte Drall
// gibt dem Trichter Drehung, ohne zur Blende zu werden.
//
// ⚠️ UND DIE GROESSE IST TEIL DER ZEICHNUNG, KEINE LAYOUT-FRAGE. Bei 56 px
// verschmiert dieses Netz zu einem Fleck; ab rund 72 px liest es sich als
// Trichter mit offener Kehle. Deshalb steht die Anzeigegroesse als Vorgabe im
// Aufrufer (`LandingCTA.js`) und ist durch einen Test gedeckt. Wer sie
// verkleinert, bekommt keinen kleineren Korb, sondern ein Rauschen.
const STRAENGE = 12;
const RING_R = 26;
const FLECHT = [19, 12]; // die beiden sichtbaren Querringe des Geflechts
const INNEN_R = 7; // hier endet das Netz — die Kehle, durch die der Ball faellt
const DRALL = 10; // Grad Verdrehung aussen → innen

// ⚠️ NETZFARBE = DIE LINIENFARBE DES HEROS. Gleiche Rolle, gleiche Farbe:
// Kuehle Haarlinie traegt die Struktur, in `HeroCourt.js` wie hier.
//
// ⚠️ UND EINE KORREKTUR AN MIR SELBST, die stehenbleiben soll. Der erste
// Entwurf dieser Zeile begruendete einen Wechsel auf `navy-600` mit
// „2,90 : 1 im Hero gegen 2,13 : 1 hier". **Die 2,90 war erfunden** — im Kopf
// gerechnet und nie nachgerechnet. Gemessen (WCAG-Formel, sRGB):
//     #3A4E7A auf navy-950 #0B1220 (Hero) ....... 2,27 : 1
//     #3A4E7A auf navy-900 #111A2E (hier) ....... 2,11 : 1
//     #3D5080 auf navy-900 (der Gegenvorschlag) . 2,19 : 1
// Der Unterschied zwischen den beiden Kandidaten betraegt also 0,08 — das ist
// keine wahrnehmbare Stufe. Damit faellt die Begruendung weg, mit der ich die
// Farbe wechseln wollte, und es entscheidet die Sprache: dieselbe Rolle,
// derselbe Farbwert wie im Hero.
// Der hellere Grund kostet real 0,16 gegenueber dem Hero; die Untergrenze,
// die sich dieses Projekt fuer einen gezeichneten Strich gesetzt hat, liegt
// bei rund 2 : 1 („darunter liest sich ein Strich als Tonwertaenderung, nicht
// als Zeichnung"). 2,11 haelt sie, mit wenig Reserve — wer den Grund dieses
// Blocks aufhellt, muss hier nachmessen.
// ⚠️ Die Lehre ist nicht die Farbe, sondern die Zahl: Eine im Kopf gerechnete
// Kennzahl in einer Begruendung ist eine Behauptung. Sie gehoert gerechnet,
// bevor sie eine Entscheidung traegt (docs/MUSTER-ZAHLEN-DIE-LUEGEN).
const NETZ_FARBE = "#3A4E7A";

const n = (v) => Number(v.toFixed(2));
const pol = (r, grad) => [
  n(32 + r * Math.cos((grad * Math.PI) / 180)),
  n(32 + r * Math.sin((grad * Math.PI) / 180)),
];

// Ein Strang laeuft nicht gerade nach innen, er dreht mit. Als quadratische
// Kurve mit dem Stuetzpunkt auf halbem Weg und halbem Drall — dadurch biegt
// sich die Linie, statt geknickt zu wirken.
const strangPfade = Array.from({ length: STRAENGE }, (_, i) => {
  const a = (360 / STRAENGE) * i;
  const [x0, y0] = pol(RING_R, a);
  const [xm, ym] = pol((RING_R + INNEN_R) / 2, a + DRALL * 0.5);
  const [x1, y1] = pol(INNEN_R, a + DRALL);
  return `M${x0} ${y0} Q${xm} ${ym} ${x1} ${y1}`;
});

export default function KorbRuhe({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      // Griff fuer tests/e2e/abschluss-korb.spec.mjs. Ein `data`-Attribut und
      // nicht die viewBox: Die viewBox ist eine Gestaltungsentscheidung und
      // darf sich aendern, ohne dass ein Test rot wird, der etwas ganz
      // anderes prueft (dieselbe Falle, in die korb-emblem.spec.mjs mit
      // `viewBox === "0 0 20 14"` gelaufen ist).
      data-abschluss-korb=""
      viewBox="0 0 64 64"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      {/* Netz — kuehl, hinter dem Ring. */}
      <g stroke={NETZ_FARBE} strokeLinecap="round" fill="none">
        {FLECHT.map((r) => (
          <circle key={r} cx="32" cy="32" r={r} strokeWidth="0.85" />
        ))}
        <g strokeWidth="1">
          {strangPfade.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>

      {/* Der Ring — das einzige Orange, voll deckend, wie im Hero. */}
      <circle
        cx="32"
        cy="32"
        r={RING_R}
        stroke="#F07A27"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
}
