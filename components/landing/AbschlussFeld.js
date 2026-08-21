import {
  MITTE,
  m,
  n,
  ZONE_HALB,
  ZONE_TIEF,
  KORB_TIEF,
  KORB_R,
  BRETT_HALB,
  BRETT_TIEF,
  LADE_R,
  LADE_SCHENKEL,
  DREI_R,
  DREI_X,
  MARKE_LANG,
  MARKEN,
  NEUTRAL_VON,
  NEUTRAL_BIS,
  UEBERGANG,
} from "@/components/landing/feldmasse";

// ══ DAS GEGNERISCHE ENDE ════════════════════════════════════════════════════
//
// Auftrag Patrick, 21.08.2026: „wie waere es denn, wenn das Spielfeld aus der
// Hero unten auf der Seite gespiegelt dargestellt wird und somit die ganze
// Seite ein Spielfeld ergibt und somit am Ende der Pass an die Funktion/den
// Button zu einem Wurf in den gegnerischen minimalistischen Korb landet."
//
// Gezeichnet ist derselbe Korbbereich wie im Hero, um die Waagerechte
// gespiegelt: Die Grundlinie liegt UNTEN, die Tiefe waechst nach OBEN. Beide
// Enden benutzen dieselben Masse (`feldmasse.js`), denselben Massstab
// (1 m = 60 Einheiten) und dieselbe Massstabsregel (`slice`, Umschalter ist
// das Seitenverhaeltnis) — deshalb ist derselbe Gegenstand an beiden Enden
// gleich gross, und deshalb liest sich die Seite als EIN Feld.
//
// ══ WAS BEWUSST NICHT GEBAUT IST: EIN DURCHGEHENDES FELD ════════════════════
//
// Patricks Bild ist „die ganze Seite ein Spielfeld". Gebaut sind ZWEI
// gezeichnete Enden, verbunden durch die Aussenlinie. Der Unterschied ist
// keine Bequemlichkeit, er ist Arithmetik:
//
//   Ein Feld ist 28 × 15 m, also QUER (1,87 : 1). Eine Startseite ist auf dem
//   Telefon rund 360 × 6.000 px, also hochkant (1 : 16,7). Ein durchgehendes,
//   massstabsgetreues Feld ueber die ganze Seitenlaenge haette bei 360 px
//   Breite einen Massstab von 24 px/m — die Zone waere 118 px breit, die
//   Feldlaenge 672 px. Die Seite ist zehnmal so lang. Es bliebe also entweder
//   ein 118-px-Feld in einer 6.000-px-Seite (ein Briefmarkenfeld) oder ein
//   verzerrtes Feld, und verzerrt ist es kein Feld mehr, sondern ein Muster.
//
// ⚠️ Und es waere der Rueckfall in eine Zwangslage, die `HeroCourt.js` schon
// einmal aufgeschrieben hat: Es gibt keinen Zoom, bei dem die Zonenlinien auf
// Telefon UND Notebook neben dem Text liegen. Ein Massstab, der ueber die
// ganze Seite gelten muss, kann diesem Konflikt nicht mehr ausweichen.
//
// Was die Seite trotzdem zu EINEM Feld macht, sind vier Dinge, und keines
// davon ist der Massstab:
//   1. dieselbe Projektion (streng von oben, an beiden Enden),
//   2. dieselben Masse und derselbe Massstab IM Feldstueck,
//   3. dieselbe Farbrolle (kuehle Linie = Struktur, ein Orange = der Ring),
//   4. eine Aussenlinie, die ueber die ganze Seite durchlaeuft und an beiden
//      Enden an einem gezeichneten Korbbereich ankommt.
// So funktioniert auch die Wahrnehmung eines Spielers auf dem Feld: Er sieht
// die Markierungen um sich herum scharf und die Seitenlinien in die Ferne
// laufen — nicht den Grundriss.
//
// ══ DIE GRUNDLINIE ZEICHNET DIESE DATEI NICHT ══════════════════════════════
//
// Sie kommt von `Aussenlinie` (`grundlinie`) und liegt auf der Unterkante des
// Abschnitts. Das ist nicht Arbeitsteilung um ihrer selbst willen, sondern das
// richtigere Bild: Eine Grundlinie laeuft in Wirklichkeit GENAU zwischen den
// beiden Seitenlinien, sie steht nicht darueber hinaus. Im Hero geht sie von
// Bildrand zu Bildrand, weil die Seitenlinien dort ausserhalb des Ausschnitts
// liegen — hier liegen sie im Bild, also endet die Grundlinie an ihnen.
// ⚠️ Aus demselben Grund zeichnet diese Datei auch KEINE Seitenlinien: Die
// Aussenlinie ist an diesem Ende die Seitenlinie. Zwei Paare senkrechter
// Striche auf verschiedenen Breiten waeren genau der Widerspruch, den diese
// Runde aufloesen soll.
//
// ══ DER MASSSTAB DES GEFAELLES IST GESPIEGELT, NICHT NEU ERFUNDEN ═══════════
//
// `HeroCourt.js` begruendet ausfuehrlich, warum es ZWEI Gefaelle braucht und
// nicht eines: Der Korbbereich liegt IN der Textspalte und muss weg sein,
// bevor der Text beginnt; das ferne Feld liegt NEBEN der Textspalte und darf
// durchlaufen. Beides gilt hier unveraendert, nur mit umgekehrtem Vorzeichen —
// der Text steht ueber dem Korbbereich statt darunter.
const HOEHE = 720; // viewBox-Hoehe; die Grundlinie liegt auf der Unterkante
const yy = (meter) => HOEHE - m(meter); // Tiefe ab Grundlinie, nach OBEN

function Marke({ seite, tiefe }) {
  const x0 = MITTE + seite * m(ZONE_HALB);
  const x1 = x0 + seite * m(MARKE_LANG);
  return <path d={`M ${n(x0)} ${n(yy(tiefe))} H ${n(x1)}`} data-endfeld="marke" />;
}

export default function AbschlussFeld() {
  return (
    // ⚠️ `overflow: visible` trennt MASSSTAB und BESCHNITT — dieselbe
    // Entscheidung und derselbe Grund wie im Hero: Der Kasten bestimmt nur den
    // Massstab, beschnitten wird vom Abschnitt (`overflow-hidden` in
    // `LandingCTA.js`). Ohne das endet die Zeichnung dort, wo der Kasten endet,
    // und ein Feld, das mitten in der Flaeche aufhoert, ist eine Panne.
    //
    // ⚠️ KEINE data-court-*-ATTRIBUTE UND KEINE KLASSE `hero-court`. Drei
    // Pruefungen lesen diese Namen DOKUMENTWEIT
    // (`hero-standbild.spec.mjs` zaehlt `data-court-path` im rohen
    // Server-Blatt, `hero-einblendung.spec.mjs` sammelt sie ueber das ganze
    // Dokument). Ein zweites Feldstueck unter denselben Namen haette diese
    // Pruefungen still verfaelscht statt sie rot zu machen — die teuerste
    // Sorte Fehler in diesem Projekt. Das Ende hat deshalb einen eigenen
    // Namensraum (`data-endfeld`).
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[35rem] w-full sm:h-[38rem] lg:h-[40rem]"
      viewBox={`0 0 1200 ${HOEHE}`}
      preserveAspectRatio="xMidYMax slice"
      style={{ overflow: "visible" }}
      aria-hidden="true"
      focusable="false"
      data-endfeld-svg
    >
      <defs>
        {/* Der KORBBEREICH — voll an der Grundlinie, weg bevor der Text
            beginnt. Die Stufen sind exakt die des Heros, an der Grundlinie
            gespiegelt: volle Staerke bis 2,0 m, Abfall ab 2,9 m, ab 4,2 m
            nichts mehr. Dass der Text erst darueber anfaengt, ist keine
            Hoffnung, sondern gesetzt — der untere Innenabstand des
            Abschluss-Blocks ist aus derselben Zahl gerechnet (LandingCTA.js). */}
        <linearGradient
          id="endfeld-nah"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={HOEHE}
          x2="0"
          y2={n(yy(6))}
        >
          <stop offset="0" stopColor="#7E9AD8" />
          <stop offset={n(2.0 / 6)} stopColor="#6E8BCC" />
          <stop offset={n(2.9 / 6)} stopColor="#4C639F" stopOpacity="0.85" />
          <stop offset={n(3.6 / 6)} stopColor="#33447A" stopOpacity="0.35" />
          <stop offset={n(4.2 / 6)} stopColor="#2A3765" stopOpacity="0" />
          <stop offset="1" stopColor="#2A3765" stopOpacity="0" />
        </linearGradient>

        {/* Das FERNE FELD — die Dreipunktlinie. Sie laeuft nach oben aus dem
            Bild und liegt dabei NEBEN der Textspalte (die Geraden stehen bei
            ± 6,60 m; auf 1440 px sind das ± 475 px gegen eine ± 384 px breite
            Textspalte, mobil liegen sie ausserhalb des Bildes).
            ⚠️ ANDERS ALS IM HERO ENDET DIESES GEFAELLE BEI NULL, und das ist
            der eine Punkt, an dem das gespiegelte Ende bewusst nicht spiegelt.
            Im Hero laeuft das Feld nach unten aus dem Abschnitt heraus und wird
            an der Naht hart beschnitten — genau der Befund, den Tobias als
            „ein Filmschnitt ist lesbar, weil sich das Bild aendert" gemeldet
            hat. Hier faellt die Linie vor der Naht auf null, es gibt also
            nichts zu beschneiden: Das Feld taucht aus der Ferne auf, statt an
            einer Kante anzufangen. */}
        <linearGradient
          id="endfeld-fern"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={HOEHE}
          x2="0"
          y2={n(yy(9))}
        >
          <stop offset="0" stopColor="#5E79B8" />
          <stop offset={n(3.5 / 9)} stopColor="#3E5188" />
          <stop offset={n(7.0 / 9)} stopColor="#2C3A66" />
          <stop offset="1" stopColor="#2C3A66" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ══ DAS FERNE FELD ═══════════════════════════════════════════════════
          Nur die Dreipunktlinie. Die Ecken-Drei ist die Form, an der ein
          Spieler die Notation erkennt — zwei Geraden bis 2,99 m, dann der
          Bogen um die Korbmitte. */}
      <g
        fill="none"
        stroke="url(#endfeld-fern)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      >
        <path
          d={
            `M ${n(MITTE - m(DREI_X))} ${HOEHE} V ${n(yy(UEBERGANG))} ` +
            `A ${n(m(DREI_R))} ${n(m(DREI_R))} 0 0 1 ` +
            `${n(MITTE + m(DREI_X))} ${n(yy(UEBERGANG))} V ${HOEHE}`
          }
          data-endfeld="drei"
        />
      </g>

      {/* ══ DER KORBBEREICH ══════════════════════════════════════════════════
          Zone, Aufstellungsmarken, Brett, Ladezone. Das ist der Teil, der die
          Frage beantwortet, ob hier jemand weiss, wovon er spricht — und im
          Besonderen ist es das BRETT, das den Ring eindeutig macht.
          ⚠️ Das ist der Grund, warum diese Zeichnung die alte Korb-Marke
          (`KorbRuhe.js`) ersetzt und nicht ergaenzt: Tobias hat sie als
          „Radarschirm" gelesen, und der Befund im Referenz-Register nennt die
          Ursache — was einen Ring von oben eindeutig macht, ist das Brett, und
          das passt in eine quadratische Marke nicht hinein. In einem Feldstueck
          ist der Platz da. */}
      <g
        fill="none"
        stroke="url(#endfeld-nah)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Die Zone — 4,90 m breit, 5,80 m tief, geoeffnet nach oben. */}
        <path
          d={
            `M ${n(MITTE - m(ZONE_HALB))} ${HOEHE} ` +
            `V ${n(yy(ZONE_TIEF))} H ${n(MITTE + m(ZONE_HALB))} V ${HOEHE}`
          }
          data-endfeld="zone"
        />

        {/* Brett — 1,80 m breit, Vorderkante 1,20 m vor der Grundlinie. */}
        <path
          d={`M ${n(MITTE - m(BRETT_HALB))} ${n(yy(BRETT_TIEF))} H ${n(MITTE + m(BRETT_HALB))}`}
          data-endfeld="brett"
        />

        {/* Ladezone — Halbkreis r = 1,30 m plus die zwei 0,375-m-Schenkel.
            Gespiegelt woelbt sich der Bogen nach oben; die Schenkel laufen
            zurueck zur Brettkante. */}
        <path
          d={
            `M ${n(MITTE - m(LADE_R))} ${n(yy(BRETT_TIEF))} ` +
            `V ${n(yy(KORB_TIEF))} ` +
            `A ${n(m(LADE_R))} ${n(m(LADE_R))} 0 0 1 ` +
            `${n(MITTE + m(LADE_R))} ${n(yy(KORB_TIEF))} ` +
            `V ${n(yy(BRETT_TIEF))}`
          }
          data-endfeld="lade"
        />

        {MARKEN.map((tiefe) => (
          <Marke key={`l${tiefe}`} seite={-1} tiefe={tiefe} />
        ))}
        {MARKEN.map((tiefe) => (
          <Marke key={`r${tiefe}`} seite={1} tiefe={tiefe} />
        ))}
      </g>

      {/* Die neutrale Zone — der einzige Ort des Feldes, an dem Farbe eine
          Flaeche ist (Diagram 3 zeichnet sie ausgefuellt). */}
      <g fill="url(#endfeld-nah)">
        <rect
          x={n(MITTE - m(ZONE_HALB) - m(MARKE_LANG))}
          y={n(yy(NEUTRAL_BIS))}
          width={n(m(MARKE_LANG))}
          height={n(m(NEUTRAL_BIS - NEUTRAL_VON))}
        />
        <rect
          x={n(MITTE + m(ZONE_HALB))}
          y={n(yy(NEUTRAL_BIS))}
          width={n(m(MARKE_LANG))}
          height={n(m(NEUTRAL_BIS - NEUTRAL_VON))}
        />
      </g>

      {/* ══ DER RING ═════════════════════════════════════════════════════════
          Das Ziel. Gleiche Groesse, gleiche Farbe, gleiche Strichstaerke wie
          im Hero — es ist derselbe Gegenstand am anderen Ende.
          ⚠️ ER IST NICHT DAS ZIEL DES BALLS, SONDERN DES NUTZERS. Der Ball
          kommt an der Taste zur Ruhe (`BallPass.js`); der Ring liegt dahinter,
          in Laufrichtung. Ein Wurf ist eine Bogenbewegung, und ein Bogen liegt
          in der Ebene, die eine Draufsicht gerade nicht zeigt — von senkrecht
          oben sind ein Wurf und ein Rollen dasselbe Bild. Die ausfuehrliche
          Begruendung steht in `LandingCTA.js`. */}
      <circle
        cx={MITTE}
        cy={n(yy(KORB_TIEF))}
        r={n(m(KORB_R))}
        fill="none"
        stroke="#F07A27"
        strokeWidth="2.8"
        data-endfeld-korb
      />
    </svg>
  );
}
