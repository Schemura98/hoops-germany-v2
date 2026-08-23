import {
  m,
  n,
  ZONE_HALB,
  ZONE_TIEF,
  KORB_TIEF,
  KORB_R,
  BRETT_HALB,
  BRETT_TIEF,
  LADE_R,
  DREI_R,
  DREI_X,
  MARKE_LANG,
  MARKEN,
  NEUTRAL_VON,
  NEUTRAL_BIS,
  UEBERGANG,
} from "@/components/landing/feldmasse";

// ══ AUTH-MOTIV „DER KORBBEREICH IM HALBBILD" ════════════════════════════════
//
// Ersetzt am 23.08.2026 das Hallenfoto auf /signup (Auftrag Patrick: „das
// helle Foto beisst sich mit dem dunklen Design … such was Edleres, Cooleres,
// Dunkles raus — oder inspiriere dich am minimalistischen Design der
// Startseite"). /signup ist der QR-Landepunkt der Tester-Flyer, und deren
// Vorderseite IST die dunkle Feldzeichnung — wer scannt, soll visuell in
// derselben Welt ankommen, aus der der Flyer kam.
//
// WARUM EINE KOMPONENTE STATT EINES BILDES:
// · Null Lizenzfragen — vollstaendig selbst erzeugt (die Leitplanke: kein
//   Foto-Etat, keine Lizenz-Dokumentation fuer Fremdmaterial).
// · Verlustfrei auf jeder Panelhoehe, farbtreu zu den Tokens (ein gerendertes
//   Bild driftet bei jeder Farbanpassung der Plattform).
// · EINE Massquelle: `feldmasse.js` — dieselbe Datei, aus der beide Feldenden
//   der Startseite zeichnen. Dies ist die DRITTE Zeichnung derselben Familie;
//   eine eigene Zahlenliste waere ein Feld, das nur zufaellig gleich aussieht.
// · ~3 KB Inline-SVG statt 168 KB AVIF.
//
// KOMPOSITION: Draufsicht wie ueberall (die Projektion ist Teil der
// Bildsprache — kein Schraegbild, kein Foto-Genre), Grundlinie oben, der
// Korbbereich im oberen Drittel, das Feld laeuft nach unten in die Tiefe aus.
// Der Ring ist das einzige Orange. Unten wird es bewusst ruhig — das Panel
// traegt kein eigenes Versprechen, es ist die Halle hinter dem Formular.
//
// ⚠️ Standbild, absichtlich ohne Einblendung: Auf einem Registrierungs-
// formular hat Bewegung nichts verloren, und `prefers-reduced-motion` ist
// damit trivial erfuellt (dieselbe Entscheidung wie beim Hero-Standbild).
//
// ⚠️ Der Ausschnitt zeigt ~10 m Feldbreite (viewBox 600 bei 60 E/m). Die
// Seitenlinien (± 7,50 m) und die Dreipunkt-GERADEN (± 6,60 m) liegen damit
// auf JEDER Panelgeometrie ausserhalb des Bildes — `slice` laesst das
// sichtbare Fenster nie breiter als 600 Einheiten werden (breitentreibend ab
// Seitenverhaeltnis 600/840, und schmalere Panels zeigen WENIGER Breite,
// nicht mehr). Die Geraden sind trotzdem im Pfad, damit die Dreipunktlinie
// als Ganzes stimmt, falls jemand den Ausschnitt aendert; die Seitenlinien
// sind weggelassen, weil ein Pfad, der unter keiner Geometrie sichtbar ist,
// nur totes Gewicht waere. Ein Ausschnitt zeigt nicht alles — dieselbe
// Regel wie im Hero auf dem Telefon.

// Kleiner Vorlauf, damit die Grundlinie nicht auf der Fensterkante liegt.
// Bewusst kleiner als die 44 des Heros: Hier gibt es keine Navbar-Haarlinie,
// mit der die Grundlinie einen Doppelrahmen bilden koennte.
const GRUND = 40;
const MITTE_X = 300; // viewBox 600 breit — eigene Mitte, nicht die des Heros

const y = (meter) => GRUND + m(meter);

function Marke({ seite, tiefe }) {
  const x0 = MITTE_X + seite * m(ZONE_HALB);
  const x1 = x0 + seite * m(MARKE_LANG);
  return <path d={`M ${n(x0)} ${n(y(tiefe))} H ${n(x1)}`} data-court="marke" />;
}

export default function AuthCourt() {
  return (
    // Haarlinie zur Formularspalte: Beide Haelften stehen auf navy-950 —
    // ohne Kante waere die Naht unsichtbar und das Feld hinge "im" Formular.
    // Flaechenstufe + Haarlinie ist die Tiefe dieses Designsystems.
    <div
      className="absolute inset-0 bg-navy-950 border-l border-navy-600"
      aria-hidden="true"
      data-auth-court
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 840"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Tiefengefaelle wie im Hero, aber ohne dessen Textzwang: Hier
              kreuzt keine Zeile, der Korbbereich darf laenger stehen und
              laeuft erst zur Panelmitte hin aus. In viewBox-Koordinaten
              verankert, damit alle Linien EIN Gefaelle teilen. */}
          <linearGradient
            id="auth-court-nah"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={GRUND}
            x2="0"
            y2={n(y(7.5))}
          >
            <stop offset="0" stopColor="#7E9AD8" />
            <stop offset={n(2.1 / 7.5)} stopColor="#6E8BCC" />
            <stop offset={n(3.4 / 7.5)} stopColor="#4C639F" stopOpacity="0.8" />
            <stop offset={n(5.8 / 7.5)} stopColor="#2F3E6F" stopOpacity="0.35" />
            <stop offset="1" stopColor="#2A3765" stopOpacity="0" />
          </linearGradient>

          <linearGradient
            id="auth-court-fern"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={GRUND}
            x2="0"
            y2="840"
          >
            <stop offset="0" stopColor="#5E79B8" />
            <stop offset="0.45" stopColor="#3E5188" />
            <stop offset="1" stopColor="#2C3A66" />
          </linearGradient>
        </defs>

        {/* Das ferne Feld: die Dreipunktlinie, duenn, laeuft in die Tiefe aus. */}
        <g
          fill="none"
          stroke="url(#auth-court-fern)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        >
          <path
            d={
              `M ${n(MITTE_X - m(DREI_X))} ${GRUND} V ${n(y(UEBERGANG))} ` +
              `A ${n(m(DREI_R))} ${n(m(DREI_R))} 0 0 0 ` +
              `${n(MITTE_X + m(DREI_X))} ${n(y(UEBERGANG))} V ${GRUND}`
            }
            data-court="drei"
          />
        </g>

        {/* Der Korbbereich: Grundlinie, Zone, Marken, Brett, Ladezone.
            Strichbreite 1,9 wie im Hero — bei 600er-viewBox auf einem
            720-px-Halbbild ist der Massstab (~1,2) derselbe wie dort auf
            1440 px, die Linien wiegen also gleich viel. */}
        <g
          fill="none"
          stroke="url(#auth-court-nah)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={`M 0 ${GRUND} H 600`} data-court="grund" />

          <path
            d={
              `M ${n(MITTE_X - m(ZONE_HALB))} ${GRUND} ` +
              `V ${n(y(ZONE_TIEF))} H ${n(MITTE_X + m(ZONE_HALB))} V ${GRUND}`
            }
            data-court="zone"
          />

          <path
            d={`M ${n(MITTE_X - m(BRETT_HALB))} ${n(y(BRETT_TIEF))} H ${n(MITTE_X + m(BRETT_HALB))}`}
            data-court="brett"
          />

          <path
            d={
              `M ${n(MITTE_X - m(LADE_R))} ${n(y(BRETT_TIEF))} ` +
              `V ${n(y(KORB_TIEF))} ` +
              `A ${n(m(LADE_R))} ${n(m(LADE_R))} 0 0 0 ` +
              `${n(MITTE_X + m(LADE_R))} ${n(y(KORB_TIEF))} ` +
              `V ${n(y(BRETT_TIEF))}`
            }
            data-court="lade"
          />

          {MARKEN.map((tiefe) => (
            <Marke key={`l${tiefe}`} seite={-1} tiefe={tiefe} />
          ))}
          {MARKEN.map((tiefe) => (
            <Marke key={`r${tiefe}`} seite={1} tiefe={tiefe} />
          ))}
        </g>

        {/* Die neutrale Zone — in Diagram 3 ein ausgefuellter Block. */}
        <g fill="url(#auth-court-nah)">
          <rect
            x={n(MITTE_X - m(ZONE_HALB) - m(MARKE_LANG))}
            y={n(y(NEUTRAL_VON))}
            width={n(m(MARKE_LANG))}
            height={n(m(NEUTRAL_BIS - NEUTRAL_VON))}
          />
          <rect
            x={n(MITTE_X + m(ZONE_HALB))}
            y={n(y(NEUTRAL_VON))}
            width={n(m(MARKE_LANG))}
            height={n(m(NEUTRAL_BIS - NEUTRAL_VON))}
          />
        </g>

        {/* Der Ring — das einzige Orange des Panels, wie ueberall. */}
        <circle
          cx={MITTE_X}
          cy={n(y(KORB_TIEF))}
          r={n(m(KORB_R))}
          fill="none"
          stroke="#F07A27"
          strokeWidth="2.8"
          data-court="korb"
        />
      </svg>
    </div>
  );
}
