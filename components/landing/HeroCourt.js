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
// ⚠️ WORAUF SICH DIESE HÖHE BEZIEHT, HAT SICH AM 20.08.2026 GEÄNDERT — und das
// ist der Kern von Tobias' Befund B1. Die Zeichnung füllt NICHT mehr die
// Bühne, sondern einen Rahmen mit eigener, inhaltsunabhängiger Höhe; er wird
// in `HeroStage.js` gesetzt (`ZEICHNUNG`) und dort auch begründet.
// Kurz: `h-full` bezog den Maßstab auf die Bühne, und die Bühne wächst mit dem
// Inhalt — der eingeloggte Hero hat ein Element mehr, also wurde die Zeichnung
// größer und der Ring wanderte in den Text. Ein Spielfeld wird nicht größer,
// weil jemand angemeldet ist.
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

const KORB_Y = GRUND + 1.575 * M; // 159,76
const KORB_R = (0.45 / 2) * M; // 16,54
const ZONE_HALB = (4.9 / 2) * M; // 180,08
const ZONE_TIEF = 5.8 * M; // 426,3
const FW_R = 1.8 * M; // 132,30
const DREI_R = 6.75 * M; // 496,13
const DREI_X = (6.6 / 2) * M; // 242,55 → Parallele bei MITTE ± 242,55
const BRETT_HALB = (1.8 / 2) * M; // 66,15
const BRETT_Y = GRUND + 1.2 * M; // 132,20
const LADE_R = 1.25 * M; // 91,88

// Wo die Dreipunkt-Parallele in den Bogen übergeht: der Punkt auf dem Kreis
// (r = DREI_R um die Korbmitte) mit x = MITTE − DREI_X.
// ⚠️ GERECHNET, NICHT GERATEN. Ein von Hand gesetzter Übergangspunkt ergibt
// einen Knick, und ein Knick in einer Dreipunktlinie ist genau die Sorte
// Fehler, die der Zielgruppe auffällt und dem Zeichner nicht.
const UEBERGANG_Y = KORB_Y + Math.sqrt(DREI_R * DREI_R - DREI_X * DREI_X);

const n = (v) => Number(v.toFixed(2));

// ⚠️ MIT EINHEIT — UND DAS IST DER WICHTIGSTE FIX DIESER DATEI (Befund Kai H1,
// 20.08.2026). Hier stand `n(v)`, also eine nackte Zahl. Das Stylesheet baut
// daraus `calc(var(--len) + 2px)` — eine Zahl plus eine Länge. Diese Rechnung
// ist ungültig, und eine ungültige Rechnung macht nicht den einen Summanden
// kaputt, sondern die GANZE Deklaration: `stroke-dasharray` fiel auf `none`
// zurück, die `stroke-dashoffset`-Animation hatte nichts, woran sie ziehen
// konnte, und die Einblendung fand auf keinem Browser statt.
// ⚠️ Sie hat nie stattgefunden, und trotzdem stand sie an DREI Stellen als
// Zusicherung (hier, app/globals.css, CLAUDE.md). Nachgemessen:
//   `--len:1200`   → strokeDasharray "none"          ← der gebaute Zustand
//   `--len:1200px` → strokeDasharray "1200px, 1202px"
// Die Fehlerform gehört zu docs/MUSTER-ZAHLEN-DIE-LUEGEN: Es gab keine
// Fehlermeldung, nichts sah kaputt aus, und in einer Bewegungsspur las sich
// die Deckkraft-Einblendung des Korbs wie „die Linien zeichnen sich".
const px = (v) => `${n(v)}px`;

// Länge je Pfad, großzügig aufgerundet — sie steuert das Strichmuster der
// Einblend-Animation.
// ⚠️ WARUM HIER ZAHLEN STEHEN UND NICHT `pathLength="1"`: `pathLength` wird
// zusammen mit `vector-effect: non-scaling-stroke` von Browsern ignoriert
// (am Vorgänger belegt, siehe HeroScrollStage.js a. F.). Die Folge wäre eine
// dauerhafte Punktlinie statt einer unsichtbaren. Und `getTotalLength()` im
// JavaScript scheidet aus, weil diese Datei bewusst KEIN JavaScript hat.
// Also: analytisch gerechnete Längen, jeweils aufgerundet. Zu groß ist
// harmlos (der Strich ist früher fertig), zu klein wäre sichtbar.
//
// ⚠️ DIESE LÄNGEN GELTEN IN viewBox-EINHEITEN — UND DAS HÄLT NUR, SOLANGE
// NIRGENDWO `vector-effect: non-scaling-stroke` STEHT. Die Falle ist real und
// war bis zum 20.08.2026 eingebaut (Befund Kai M1): Das Attribut stand auf der
// `<g>`-Gruppe, wo es NICHTS tut — `vector-effect` wird in SVG nicht vererbt,
// gemessen war es auf jedem Pfad `none`. Die Längenrechnung war also nur
// deshalb richtig, weil das Attribut wirkungslos war. Wer es „aufräumt" und
// korrekt je Pfad setzt, rechnet das Strichmuster in GERÄTE-Pixel um: bei
// Maßstab 1,2 fehlen dann 16,7 % jeder Linie — still, ohne Fehlermeldung, als
// Lücke am Ende jedes Strichs.
// Deshalb steht das Attribut jetzt an KEINER Stelle mehr (Begründung zur
// Strichbreite unten an der Gruppe).
// ⚠️ HIER STANDEN ZWEI LÄNGEN OHNE LESER — `korb` und `zone`, beide am
// 20.08.2026 entfernt. `zone` gehörte zu den Zonen-Zargen, die weiter unten
// begründet entfallen sind; `korb` wurde an den Ring durchgereicht, der sich
// gar nicht zeichnet, sondern aufblendet. Eine Konstante, die an nichts
// übergibt, ist in diesem Projekt eine eigene Fehlerklasse (Kai K4): Sie liest
// sich wie eine Zusicherung und ist keine.
const L = {
  grund: 1200,
  brett: 2 * BRETT_HALB,
  lade: Math.PI * LADE_R,
  fw: 2 * Math.PI * FW_R,
  drei: 2 * (UEBERGANG_Y - GRUND) + DREI_R * 2 * Math.asin(DREI_X / DREI_R),
};

export default function HeroCourt() {
  return (
    // ⚠️ `overflow: visible` TRENNT ZWEI DINGE, DIE EIN SVG SONST KOPPELT:
    // den MASSSTAB und den BESCHNITT. Beides hängt normalerweise am selben
    // Kasten — und genau daran ist mein erster Anlauf gegen Tobias' B1
    // gescheitert. Der Kasten bekam eine feste Höhe (richtig, damit der Maßstab
    // nicht mehr am Inhalt hängt), und damit endete auch die ZEICHNUNG dort:
    // auf 1440×900 hörten die Dreipunkt-Parallelen 92 px vor dem
    // Abschnittsende einfach auf. Vier abgeschnittene Linienenden mitten in
    // einer leeren Fläche — gebaut, ANGESEHEN, verworfen.
    // Mit `visible` bestimmt der Kasten nur noch den Maßstab; beschnitten wird
    // von der Bühne (`overflow-hidden` in HeroStage.js). Die Zeichnung läuft
    // damit immer bis zur Unterkante des Abschnitts, egal wie hoch der Inhalt
    // ist — und das ist bei einer Feld-Markierung der richtige Abschluss: Ein
    // Spielfeld hört am Bildrand auf, nicht im Nichts.
    // ⚠️ Es entsteht dadurch KEIN Querüberlauf: Die Zeichnung ragt auch
    // seitlich über den Kasten, aber die Bühne schneidet beide Achsen ab.
    // Nachgemessen auf zwölf Fenstern: Dokumentbreite = Fensterbreite.
    <svg
      className="hero-court pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMin slice"
      style={{ overflow: "visible" }}
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

      {/* ⚠️ DIE STRICHBREITE SKALIERT MIT — ENTSCHEIDUNG, NICHT VERSEHEN
          (Vivien, 20.08.2026, aus Kais Befund M1 heraus entschieden).
          Hier stand `vectorEffect="non-scaling-stroke"`, wirkungslos, weil
          `vector-effect` nicht vererbt wird. Die naheliegende „Korrektur"
          wäre gewesen, es je Pfad zu setzen. Sie ist falsch, und zwar
          zweifach:
          · Sie hätte das Strichmuster der Einblendung zerlegt (siehe oben).
          · Sie widerspricht der Sache. Eine Feldlinie ist Teil des
            GEZEICHNETEN GEGENSTANDS, keine Kante der Oberfläche. In echt ist
            sie 5 cm breit und wird mit dem Feld größer, wenn man näher
            herangeht. Das ist dieselbe Grenze, die für Verläufe schon gilt:
            keine auf Flächen der Oberfläche, sehr wohl auf einem
            dargestellten Gegenstand.
          Gemessen bedeutet das 1,17 px auf 360 und 1,80 px auf 1440.
          ⚠️ Und deshalb trägt der Ring es jetzt AUCH NICHT MEHR. Vorher war
          er das einzige Element mit fester Breite (3 px überall) — sein
          Gewicht gegenüber den Linien wäre damit von 2,6 : 1 auf 1,7 : 1
          gewandert, je größer der Bildschirm. Das eine bedeutungstragende
          Zeichen der Zeichnung wäre also ausgerechnet dort am leisesten, wo am
          meisten Platz ist. Jetzt skaliert alles gemeinsam, das Verhältnis
          bleibt konstant 2 : 1. */}
      <g
        className="hero-court-linien"
        fill="none"
        stroke="#3A4E7A"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {/* Grundlinie — läuft absichtlich von Rand zu Rand. Sie ist die
            Kante, an der die Komposition oben abschließt. */}
        <path
          d={`M 0 ${GRUND} H 1200`}
          style={{ "--len": px(L.grund), "--delay": "0ms" }}
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
          style={{ "--len": px(L.fw), "--delay": "180ms" }}
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
          style={{ "--len": px(L.drei), "--delay": "260ms" }}
          data-court-path
        />

        {/* Brett, von oben eine Linie. */}
        <path
          d={`M ${n(MITTE - BRETT_HALB)} ${n(BRETT_Y)} H ${n(MITTE + BRETT_HALB)}`}
          style={{ "--len": px(L.brett), "--delay": "340ms" }}
          data-court-path
        />

        {/* Ladezone (Halbkreis unter dem Korb) — das Detail, das die
            Draufsicht endgültig als Regelwerk-Schaubild lesbar macht. */}
        <path
          d={`M ${n(MITTE - LADE_R)} ${n(KORB_Y)} A ${n(LADE_R)} ${n(LADE_R)} 0 0 0 ${n(MITTE + LADE_R)} ${n(KORB_Y)}`}
          style={{ "--len": px(L.lade), "--delay": "400ms" }}
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
        data-court-korb
      />
    </svg>
  );
}
