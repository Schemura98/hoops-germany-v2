// ══ HERO-STRUKTUR „DIE ZONE" ════════════════════════════════════════════════
//
// Neuansatz vom 20.08.2026 (Auftrag Patrick: „die Hero Animation sieht nicht
// gut aus … alles zusammen — neu ansetzen"). Ersetzt HeroDunk.js.
// Spezifikation: docs/HERO-NEUANSATZ-2026-08-20.md.
//
// ⚠️ WAS HIER ANDERS IST ALS AM VORGÄNGER — die drei Befunde, die zur
// Rücknahme geführt haben, und was jeder davon in dieser Datei bewirkt:
//
// (1) DER VORGÄNGER WAR EIN GEGENSTAND, DIESER IST EINE FLÄCHE.
//     Der Dunk-Korb war ein Objekt, das irgendwo in der Bühne stand — also
//     konnte er am Rand abgeschnitten werden und tat es auch (rechte Kante,
//     auf der Zeile „Kostenlos · ab 16 Jahren"). Eine Spielfeld-Markierung
//     KANN nicht falsch angeschnitten werden, weil Anschnitt ihr Normalfall
//     ist: Ein Spielfeld hört am Bildrand nicht auf, es geht weiter.
//     Deshalb `slice` statt `meet` — der Anschnitt ist die Absicht.
//
// (2) EINE PERSPEKTIVE, NICHT ZWEI.
//     Der Vorgänger zeichnete den Ring als Schrägansicht von oben und die
//     Spielfeldlinien flach von der Seite. Zwei Projektionen in einem Bild —
//     daher las sich der Korb als Lampenschirm. Hier ist ALLES reine
//     Draufsicht (orthogonale Projektion, wie ein Regelwerk-Schaubild):
//     keine Ellipse, kein Fluchtpunkt, kein Netz. Der Korb ist von oben ein
//     KREIS, und ein Kreis ist er auch hier.
//
// (3) DIE FARBE TRÄGT NICHT DIE STRUKTUR, SONDERN DIE BEDEUTUNG.
//     Am Vorgänger war die ganze Zeichnung orange bei niedriger Deckkraft —
//     und Orange auf Navy heruntergedimmt ergibt kein zurückhaltendes Orange,
//     sondern ein schmutziges Braun. Deshalb: Die Linien sind KÜHL
//     (navy-Familie, dieselbe Haarlinien-Sprache wie jede Panel-Kante der
//     Plattform), und das eine Orange gehört genau zwei Dingen — dem Korb
//     (dem Gegenstand) und der Taste (der Handlung). Nichts dazwischen.
//     Damit ist auch die gesamte Kontrastmechanik des Vorgängers hinfällig:
//     Eine kühle Haarlinie greift weißen Text nicht an.
//
// ⚠️ DAS SEITENVERHÄLTNIS IST WEITERHIN DER UMSCHALTER — aber es braucht
// keine zweite Fassung mehr. `preserveAspectRatio="xMidYMin slice"` löst
// beide Fälle mit EINER Zeichnung, weil die Verankerung oben-mittig sitzt:
//   · schmal/hoch  → beschnitten werden die SEITEN; Zone und Korb liegen
//                    mittig und bleiben vollständig.
//   · breit/flach  → beschnitten wird UNTEN; oben bleibt der Korbbereich.
// In beiden Fällen überlebt das, was die Zeichnung lesbar macht. Das ist der
// Grund, warum die zwei Fassungen (`hero-dunk-hoch`/`-quer`) samt der
// `min-aspect-ratio`-Weiche in app/globals.css entfallen konnten.
//
// ── Maßstab: 1 Meter ≈ 73,5 Einheiten ──────────────────────────────────────
// Die Geometrie ist NICHT frei gezeichnet, sondern aus echten FIBA-Maßen
// gerechnet. Das ist kein Selbstzweck: Ein Basketballspieler erkennt eine
// falsche Zone sofort, und die Zielgruppe besteht ausschließlich aus
// Basketballspielern. Zonenbreite 4,90 m · Zonentiefe 5,80 m · Freiwurfkreis
// r = 1,80 m · Dreipunktlinie r = 6,75 m um die Korbmitte, Parallelen bei
// 6,60 m · Korbmitte 1,575 m von der Grundlinie · Ring Ø 0,45 m ·
// Brett 1,80 m breit, 1,20 m von der Grundlinie · Ladezone r = 1,25 m.
const M = 73.5;
const MITTE = 600; // x-Mitte der viewBox
// ⚠️ 44, NICHT 24 — am gebauten Stück korrigiert. Bei 24 lag die Grundlinie
// auf 360 px nur 17 px unter der Unterkante der Navigationsleiste, und die
// trägt selbst eine Haarlinie. Zwei parallele Striche in 17 px Abstand liest
// niemand als „hier beginnt das Feld", sondern als doppelt gezogenen Rahmen.
// Der Abstand ist damit rund 33 px — weit genug, dass die Grundlinie als
// eigene Linie auftritt, nah genug, dass sie den Abschnitt oben abschliesst.
const GRUND = 44; // y der Grundlinie

const KORB_Y = GRUND + 1.575 * M; // 175,8
const KORB_R = (0.45 / 2) * M; // 16,5
const ZONE_HALB = (4.9 / 2) * M; // 180,1
const ZONE_TIEF = 5.8 * M; // 426,3
const FW_R = 1.8 * M; // 132,3
const DREI_R = 6.75 * M; // 496,1
const DREI_X = (6.6 / 2) * M; // 242,6 → Parallele bei MITTE ± 242,6
const BRETT_HALB = (1.8 / 2) * M; // 66,2
const BRETT_Y = GRUND + 1.2 * M; // 148,2
const LADE_R = 1.25 * M; // 91,9

// Wo die Dreipunkt-Parallele in den Bogen übergeht: der Punkt auf dem Kreis
// (r = DREI_R um die Korbmitte) mit x = MITTE − DREI_X.
// ⚠️ GERECHNET, NICHT GERATEN. Ein von Hand gesetzter Übergangspunkt ergibt
// einen Knick, und ein Knick in einer Dreipunktlinie ist genau die Sorte
// Fehler, die der Zielgruppe auffällt und dem Zeichner nicht.
const UEBERGANG_Y = KORB_Y + Math.sqrt(DREI_R * DREI_R - DREI_X * DREI_X);

const n = (v) => Number(v.toFixed(2));

// Länge je Pfad, großzügig aufgerundet — sie steuert das Strichmuster der
// Einblend-Animation.
// ⚠️ WARUM HIER ZAHLEN STEHEN UND NICHT `pathLength="1"`: `pathLength` wird
// zusammen mit `vector-effect: non-scaling-stroke` von Browsern ignoriert
// (am Vorgänger belegt, siehe HeroScrollStage.js a. F.). Die Folge wäre eine
// dauerhafte Punktlinie statt einer unsichtbaren. Und `getTotalLength()` im
// JavaScript scheidet aus, weil diese Datei bewusst KEIN JavaScript hat.
// Also: analytisch gerechnete Längen, jeweils aufgerundet. Zu groß ist
// harmlos (der Strich ist früher fertig), zu klein wäre sichtbar.
const L = {
  grund: 1200,
  brett: 2 * BRETT_HALB,
  korb: 2 * Math.PI * KORB_R,
  lade: Math.PI * LADE_R,
  zone: 2 * ZONE_TIEF + 2 * ZONE_HALB,
  fw: 2 * Math.PI * FW_R,
  drei: 2 * (UEBERGANG_Y - GRUND) + DREI_R * 2 * Math.asin(DREI_X / DREI_R),
};

export default function HeroCourt() {
  return (
    <svg
      className="hero-court pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* ⚠️ HIER LAG EINE ZONENFLÄCHE (navy-900 auf navy-950) UND SIE IST AM
          GEBAUTEN STÜCK GESCHEITERT — beide Male aus demselben Grund, und der
          gehört aufgeschrieben, weil er gegen die Vorgabe der Visuellen
          Richtung steht („Tiefe aus Flächenstufe + Haarlinie").
          Die Fläche ist 4,90 m breit. Ein Display-Textblock ist im selben
          Maßstab breiter. Also ragte die Überschrift über die Fläche hinaus,
          und was man sah, war nicht „Text steht in der Zone", sondern ein
          Kasten hinter dem Text, aus dem der Text herausläuft — auf 360 px
          gemessen die Kanten bei x = 48 und x = 312.
          Eine Flächenstufe trägt nur, wenn sie den Inhalt UMSCHLIESST. Tut sie
          das nicht, wird aus Tiefe ein Rahmen, den niemand gezogen hat.
          Deshalb ist der Hero reine Haarlinie — dieselbe Sprache, nur das
          andere der beiden zulässigen Mittel. */}

      <g
        className="hero-court-linien"
        fill="none"
        stroke="#3A4E7A"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* Grundlinie — läuft absichtlich von Rand zu Rand. Sie ist die
            Kante, an der die Komposition oben abschließt. */}
        <path
          d={`M 0 ${GRUND} H 1200`}
          style={{ "--len": n(L.grund), "--delay": "0ms" }}
          data-court-path
        />

        {/* ⚠️ DIE ZONEN-ZARGEN SIND KEINE LINIE MEHR, NUR NOCH DIE KANTE DER
            FLÄCHE — und das ist ein Befund aus dem ersten gebauten Stück, nicht
            aus dem Konzept. Als 1,5-px-Linie standen sie auf 360 px bei x = 74
            und x = 286 und schnitten damit senkrecht durch „BASKETBALL-".
            Der Grund ist Geometrie, nicht Justierung: Die Zone ist 4,90 m
            breit, ein lesbarer Textblock ist auf jedem Gerät breiter als 4,90 m
            im selben Maßstab. Die Linien MÜSSEN den Text kreuzen, auf jeder
            Größe — verschieben hätte nur die Breite gewechselt, auf der es
            auffällt (dieselbe Fehlerform wie CLAUDE.md Roadmap 20d: „nie
            behoben, nur auf eine Breite gewandert, wo es unsichtbar blieb").
            Eine FLÄCHENSTUFE kreuzt keinen Buchstaben — sie liegt darunter.
            Deshalb trägt die Zone ihre Kante jetzt über den Tonwert, nicht
            über einen Strich. */}

        {/* Freiwurfkreis, voll — die untere Hälfte ist im Regelwerk gestrichelt,
            hier bewusst durchgezogen: Ein gestrichelter Halbkreis hinter einer
            Schaltfläche liest sich als Störung, nicht als Notation. */}
        <circle
          cx={MITTE}
          cy={n(GRUND + ZONE_TIEF)}
          r={n(FW_R)}
          style={{ "--len": n(L.fw), "--delay": "180ms" }}
          data-court-path
        />

        {/* Dreipunktlinie: zwei Parallelen + Bogen, im gerechneten Punkt
            verbunden. */}
        <path
          d={
            `M ${n(MITTE - DREI_X)} ${GRUND} V ${n(UEBERGANG_Y)} ` +
            `A ${n(DREI_R)} ${n(DREI_R)} 0 0 0 ${n(MITTE + DREI_X)} ${n(UEBERGANG_Y)} ` +
            `V ${GRUND}`
          }
          style={{ "--len": n(L.drei), "--delay": "260ms" }}
          data-court-path
        />

        {/* Brett, von oben eine Linie. */}
        <path
          d={`M ${n(MITTE - BRETT_HALB)} ${n(BRETT_Y)} H ${n(MITTE + BRETT_HALB)}`}
          style={{ "--len": n(L.brett), "--delay": "340ms" }}
          data-court-path
        />

        {/* Ladezone (Halbkreis unter dem Korb) — das Detail, das die
            Draufsicht endgültig als Regelwerk-Schaubild lesbar macht. */}
        <path
          d={`M ${n(MITTE - LADE_R)} ${n(KORB_Y)} A ${n(LADE_R)} ${n(LADE_R)} 0 0 0 ${n(MITTE + LADE_R)} ${n(KORB_Y)}`}
          style={{ "--len": n(L.lade), "--delay": "400ms" }}
          data-court-path
        />
      </g>

      {/* ⚠️ DER KORB IST DAS EINZIGE ORANGE IN DER ZEICHNUNG — und er steht
          bewusst OBEN, dort wo am Vorgänger das Loch war.
          Er ist klein (Ø 33 von 1200 Einheiten) und dafür voll deckend. Das
          ist die Umkehrung des Vorgängers, der groß und durchscheinend war
          und deshalb bräunlich wirkte. Eine kleine, gesättigte Marke liest
          sich als Absicht; eine große, blasse liest sich als Panne.
          Zusammen mit der Taste ergibt das zwei orange Punkte — oben der
          GEGENSTAND, unten die HANDLUNG — und dazwischen die Überschrift.
          Das ist die Blickführung, nicht Dekoration. */}
      <circle
        className="hero-court-korb"
        cx={MITTE}
        cy={n(KORB_Y)}
        r={n(KORB_R)}
        fill="none"
        stroke="#F07A27"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        data-court-korb
        style={{ "--len": n(L.korb) }}
      />
    </svg>
  );
}
