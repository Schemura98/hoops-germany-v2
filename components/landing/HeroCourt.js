import {
  MITTE,
  m,
  n,
  px,
  HALB_BREIT,
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
  bogenLaenge,
} from "@/components/landing/feldmasse";

// ══ HERO-ZEICHNUNG „DER KORBBEREICH" ════════════════════════════════════════
//
// Ueberarbeitung vom 20.08.2026 (Auftrag Patrick: „schau dir nochmal genau an
// wie ein Basketballfeld aussieht und mach was richtig geiles draus, wo sich
// Basketballer direkt denken, wow cool").
//
// Die RICHTUNG ist unveraendert und von Patrick bestaetigt: Standbild, reine
// Draufsicht, kuehle Linien, EIN Orange fuer den Ring. Geaendert hat sich, was
// gezeichnet wird und wie stark.
//
// ══ WARUM ES EINE UEBERARBEITUNG BRAUCHTE — vier Vermessungsfehler ══════════
//
// Die Vorfassung berief sich auf „aus echten FIBA-Massen gerechnet". Gegen die
// Regel gehalten (Official Basketball Rules 2026, Rule 2.5, sowie Diagram 3,
// beides angesehen statt zitiert) war sie an vier Stellen falsch — und der
// erste Fehler war der, der das Bild bestimmt hat:
//
// (1) DIE DREIPUNKTLINIE STAND AUF DER HALBEN BREITE. Der Code setzte die
//     Parallelen auf 6,60 m ABSTAND ZUEINANDER (± 3,30 m von der Mitte). Die
//     Regel sagt: die Parallelen liegen 0,90 m INNERHALB DER SEITENLINIE
//     (Rule 2.5.4), und das Feld ist 15 m breit (Rule 2.1) — also
//     ± 6,60 m von der Mitte, 13,20 m auseinander. Doppelt so weit.
//     ⚠️ Die Folge war nicht „etwas zu schmal". Der Uebergangspunkt in den
//     Bogen haengt daran: bei ± 3,30 m liegt er 7,46 m vor der Grundlinie
//     statt 2,99 m. Aus der Ecken-Drei wurden zwei Geraden ueber die halbe
//     Feldlaenge, und der Bogen wurde zur Kappe darunter. Angesehen las sich
//     das als grosse Klammer um die Ueberschrift, nicht als Dreipunktlinie.
//     Es ist die Fehlerform „Radius als Durchmesser gelesen" — dieselbe
//     Klasse, die in diesem Projekt schon dreimal protokolliert ist.
//
// (2) DIE LADEZONE HATTE DEN FALSCHEN RADIUS UND KEINE SCHENKEL. Regel 2.5.7:
//     Halbkreis r = 1,30 m (nicht 1,25), und er ist an ZWEI Geraden
//     angeschlossen — 0,375 m lang, die 1,20 m vor der Grundlinie enden.
//     Der reine Halbkreis der Vorfassung ist die Form, die man zeichnet, wenn
//     man sie aus der Erinnerung zeichnet.
//
// (3) DER FREIWURFKREIS WAR EIN VOLLKREIS. Regel 2.5.2 spricht von
//     „free-throw SEMI-circles", und Diagram 3 zeichnet ausschliesslich die
//     vom Korb abgewandte Haelfte. Der halb gestrichelte Vollkreis, den man im
//     Kopf hat, ist NBA/NCAA — nicht FIBA, also nicht die Notation, in der
//     diese Zielgruppe spielt. (Deshalb ist die gestrichelte Haelfte hier auch
//     nicht „vergessen", sondern es gibt sie in diesem Regelwerk nicht.)
//
// (4) DIE ZONE FEHLTE GANZ. Sie war bewusst entfernt worden, weil ihre
//     senkrechten Linien die Ueberschrift kreuzten. Damit fehlte die Form, an
//     der ein Spieler ein Feld ZUERST erkennt — und uebrig blieben ein Kreis,
//     ein Bogen und eine Klammer, also genau das mehrdeutige Bild, das Tobias
//     am Abschluss-Korb als „Radarschirm" gelesen hat.
//
// ══ DIE GEOMETRISCHE ZWANGSLAGE, DIE MAN NICHT WEGJUSTIEREN KANN ════════════
//
// ⚠️ Wer die Zone zurueckholt, holt das Problem zurueck, dessentwegen sie
// entfernt wurde. Es ist aber KEINE Justierfrage, sondern eine Rechnung, und
// sie gehoert aufgeschrieben, damit sie nicht ein viertes Mal entdeckt wird:
//
//   Die Textspalte ist auf dem Telefon ~87 % der Fensterbreite (312 von 360),
//   auf dem Notebook ~53 % (768 von 1440, `max-w-3xl` deckelt sie).
//   Die Zone ist dagegen auf JEDER Breite derselbe Bruchteil der Zeichnung.
//   Also: Damit die Zonenlinien neben dem Text liegen, muesste die Zone
//   mobil >87 % und auf dem Notebook >53 % des Bildes einnehmen — bei
//   gleichem Massstab. Das sind zwei verschiedene Massstaebe.
//   ⇒ Es gibt KEINEN Zoom, bei dem die Zonenlinien auf beiden Geraeten neben
//     dem Text liegen. Entweder sie kreuzen ihn, oder sie sind ausserhalb des
//     Bildes. Eine gesetzte Groesse und ein Restbetrag, wieder einmal.
//
// GELOEST WIRD DAS NICHT UEBER DIE LAGE, SONDERN UEBER DIE TIEFE: Die Linien
// duerfen den Text kreuzen — sie sind dort nur nicht mehr laut. Oben, ueber der
// Ueberschrift, steht der Korbbereich in voller Staerke; auf Hoehe des Textes
// ist das Feld nur noch angedeutet. Das ist nicht Dekoration, sondern die
// Antwort auf Patricks Frage nach Betonung: „nicht alles gleich stark".
//
// ⚠️ DIESER ABSATZ WAR EINE ZUSICHERUNG OHNE BELEG, UND ER STAND DREIFACH
// SCHIEF (Befund Tobias 21.08., nachgemessen und korrigiert 21.08.).
// (1) Er nannte einen Verlauf `#tiefe`, den es seit der Aufteilung in
//     `hero-court-nah` und `hero-court-fern` nicht mehr gibt.
// (2) Er sagte „Die Linien" ohne Unterschied — es gelten aber zwei verschiedene
//     Regeln, siehe den Block „ZWEI GEFAELLE" weiter unten.
// (3) Er sagte, das Gefaelle laufe „zum Bildende hin aus". Das tat NUR das
//     nahe; das ferne endete bei voller Deckkraft an der Buehnenkante. Genau
//     daraus wurde der harte Schnitt zur Seite — behoben in `HeroStage.js`
//     (`NAHT`), wo der Satz jetzt fuer beide gilt.
//
// ⚠️ WORAN DIE LEISE WIRKUNG HAENGT — und es ist NICHT die Deckkraft.
// Tobias hat gemessen, dass die Dreipunktlinie den Text mit Deckkraft **0,85**
// kreuzt, und daraus geschlossen, „nicht mehr laut" trage nicht. Die Deckkraft
// stimmt: Die ferne Gruppe steht ueberall auf 0,85, sie wird nie schwaecher.
// Leise wird die Linie ueber die FARBE — der Verlauf laeuft von #5E79B8 an der
// Grundlinie nach #2C3A66 in der Tiefe.
// An echten Bildpunkten gemessen (`scripts/messungen/hero-kontrast.mjs`),
// Kontrast der Linie gegen die Flaeche navy-950:
//   ueber „Deine Basketball-"           1,67–1,85 : 1
//   ueber „Community"                   1,63–1,77 : 1
//   ueber „in NRW"                      1,61–1,67 : 1
// Das ist unterhalb der Grenze von rund 2 : 1, ab der sich ein Strich in
// diesem Projekt ueberhaupt als Zeichnung liest — dieselbe Einordnung, die am
// Seitenende fuer denselben Bogen gilt (CLAUDE.md, #28355E bei 1,45 : 1).
// Was der Text dabei verliert, ist nachgerechnet und klein: paper-50 faellt von
// 17,45 : 1 auf **9,41 bis 10,83 : 1** — beides weit ueber AA.
//
// ⚠️ WIE STARK IST SIE DENN SONST? Ein Tiefenprofil derselben Linie, gemessen
// dort, wo kein Text im Weg ist (1920 bzw. 1440 px, je Feldtiefe):
//   1 m 3,04 / 2,56 · 2 m 2,61 / 2,29 · 3 m 2,25 / 2,24 · 4 m 2,04 / 2,04 ·
//   5 m 1,97 / 1,95 · 6 m 1,89 / 1,87 · 7 m 1,82 / 1,80
// Das Gefaelle wirkt also — rund 40 % weniger Kontrast von der Grundlinie zum
// Textband — aber es faengt schon niedrig an. Der zweite Grund steht in der
// Zeichnung selbst: Der Strich ist 1,1 Einheiten breit, auf schmalen Fenstern
// also SCHMALER ALS EIN BILDPUNKT. Diese Linie war nie ein Strich, an keiner
// Stelle.
// ⚠️ MEINE EIGENE ERSTE ZAHL WAR HIER FALSCH, und sie ist es aus dem Grund, der
// in diesem Projekt am haeufigsten vorkommt: Hier stand „an der Grundlinie
// 6,69 : 1". Das ist gemessen — nur nicht an dieser Linie. Bei Tiefe 0 faellt
// die Dreipunktlinie mit der GRUNDLINIE zusammen (nahe Gruppe, doppelte
// Strichstaerke); die Sonde hat den falschen Gegenstand erwischt und daraus
// einen Kontrastabfall von 6,69 auf 1,65 gemacht, den es nicht gibt. Richtig
// gemessen, am falschen Objekt. Das Messwerkzeug schliesst Tiefen unter 1 m
// seither aus.
// ⚠️ Und angesehen, nicht nur gerechnet: am 3-fach vergroesserten Standbild
// (900 px, „COMMUNITY"; 1100 px, „IN NRW") laeuft dort ein dunkler, flacher
// Bogen hinter den Buchstaben durch. Es ist ein Tonwert, kein Strich.
// ⚠️ DER UNTERSCHIED ZUM FALL AM SEITENENDE, damit niemand beides in einen Topf
// wirft: Dort liefen ZONENLINIEN durch eine Textzeile — nahe Gruppe, hellere
// Farbe, senkrecht, kurz, mitten durch eine Unterstreichung. Das war eine
// Panne. Hier ist es die ferne Gruppe: lang, flach, dunkel, quer. Nicht die
// Deckkraft entscheidet, sondern welche Gruppe kreuzt.
// ⚠️ Der Verlauf liegt auf einem DARGESTELLTEN GEGENSTAND, nicht auf einer
// Flaeche der Oberflaeche — dieselbe Grenze, die fuer den Ball schon gilt
// (CLAUDE.md, Roadmap 20b c). Auf Panels bleibt es bei Flaechenstufe +
// Haarlinie.
// ⚠️ Und es ist ein GRADIENT AUF DER LINIENFARBE, keine Maske. Eine Maske
// haette mit `overflow: visible` beschnitten, was absichtlich ueber den Kasten
// hinausragt — der Beschnitt gehoert hier der Buehne, nicht der Zeichnung.
//
// ══ DER AUSSCHNITT — woher die Wirkung kommt ════════════════════════════════
//
// Nicht das ganze Feld, sondern der Korbbereich, und zwar NAH. Die Vorfassung
// zeigte rund 16 m Breite; ein Spieler erkennt ein Feld aber nicht an der
// Draufsicht auf das Ganze, sondern daran, dass er nah genug dran ist, um die
// Zonenmarkierungen zu sehen. Hier sind es mobil ~7,7 m und auf dem Notebook
// ~20 m — DASSELBE Bild, nur anders beschnitten (`slice`, oben verankert):
//   · schmal/hoch → die Zone fuellt das Bild, die Marken sind lesbar.
//   · breit/flach → es kommt Breite dazu, und damit genau das, was mobil
//     fehlt: der Uebergang der Dreipunktlinie in die Geraden (die Ecken-Drei)
//     und die Seitenlinien.
// Der Umschalter ist das Seitenverhaeltnis, nicht der Breakpoint — uebernommene
// Regel 3 aus dem Referenz-Register.
//
// ── Massstab: 1 m = 60 Einheiten ───────────────────────────────────────────
// Quelle aller Masse: FIBA, Official Basketball Rules 2026 (gueltig ab Juli
// 2026), Rule 2.1 / 2.5.1–2.5.7 und Diagram 3. Die Werte sind gegen die
// Ausgabe 2024 gegengelesen — sie sind identisch, es hat sich nichts geaendert.
// ⚠️ DIE MASSE STEHEN NICHT MEHR HIER, SONDERN IN `feldmasse.js` — seit die
// Startseite am 21.08.2026 ein ZWEITES Feldstueck bekommen hat (das
// gespiegelte Ende in `AbschlussFeld.js`). Zwei Zeichnungen mit je eigener
// Zahlenliste waeren zwei Felder, die nur zufaellig gleich aussehen: Wer eine
// Zonenbreite aendert, aendert sie an einem Ende und nicht am anderen, und
// nichts sieht dabei kaputt aus.
// Hier bleibt ausschliesslich, was NUR fuer den Hero gilt.

// ⚠️ 44 bleibt, und der Grund bleibt derselbe: Bei kleineren Werten liegt die
// Grundlinie so dicht unter der Haarlinie der Navigationsleiste, dass beide
// zusammen als doppelt gezogener Rahmen gelesen werden statt als „hier beginnt
// das Feld".
// ⚠️ Und das ist der eine Wert, den das gespiegelte Ende NICHT uebernimmt:
// Dort schliesst die Seite unmittelbar mit der Fusszeile an, die Grundlinie
// liegt also auf der Unterkante des Abschnitts. Ein Vorlauf waere dort eine
// Luecke ohne Gegenstand.
const GRUND = 44;

const y = (meter) => GRUND + m(meter); // Tiefe ab Grundlinie

const L = {
  grund: 1200,
  seiten: 2 * (900 - GRUND),
  zone: 2 * m(ZONE_TIEF) + 2 * m(ZONE_HALB),
  marken: m(MARKE_LANG),
  drei: 2 * m(UEBERGANG - 0) + m(bogenLaenge(DREI_R, DREI_X)),
  brett: 2 * m(BRETT_HALB),
  lade: 2 * m(LADE_SCHENKEL) + Math.PI * m(LADE_R),
};

// Eine Marke: 0,10 m langer Strich, senkrecht zur Zonenlinie, nach AUSSEN —
// so steht es in Diagram 3, und nach aussen ist auch das einzig Sinnvolle:
// nach innen laege sie in der Zone.
function Marke({ seite, tiefe, verzug }) {
  const x0 = MITTE + seite * m(ZONE_HALB);
  const x1 = x0 + seite * m(MARKE_LANG);
  return (
    <path
      d={`M ${n(x0)} ${n(y(tiefe))} H ${n(x1)}`}
      style={{ "--len": px(L.marken), "--delay": `${verzug}ms`, "--dur": "240ms" }}
      data-court="marke"
      data-court-tiefe={tiefe}
      data-court-path
    />
  );
}

export default function HeroCourt() {
  return (
    // ⚠️ `overflow: visible` trennt MASSSTAB und BESCHNITT. Der Kasten
    // bestimmt nur noch den Massstab; beschnitten wird von der Buehne
    // (`overflow-hidden` in HeroStage.js). Ohne das enden die Linien dort, wo
    // der Kasten endet — auf 1440×900 hoerten die Dreipunkt-Geraden einmal
    // 92 px vor dem Abschnittsende einfach auf. Ein Feld hoert am Bildrand
    // auf, nicht im Nichts.
    <svg
      className="hero-court pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMin slice"
      style={{ overflow: "visible" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* DAS TIEFENGEFAELLE. In viewBox-Koordinaten verankert
            (`userSpaceOnUse`), nicht am Element — sonst haette jede Linie ihr
            eigenes Gefaelle und die Zeichnung zerfiele in Einzelteile.
            Die Stufen sind an der Sache ausgerichtet, nicht an runden Zahlen:
            volle Staerke bis unter die Ladezone (dort endet der Korbbereich
            und dort beginnt der Text), dann Abfall, und ab dem Bogenscheitel
            ein Boden, damit unten nicht einfach nichts ist. */}
        {/* ⚠️ ZWEI GEFÄLLE, NICHT EINS — und das ist der Unterschied zwischen
            „Tiefe" und „Striche durch die Schrift". Der erste Anlauf hatte ein
            gemeinsames Gefälle; ANGESEHEN auf 1440 lief dabei eine senkrechte
            Zonenlinie mitten durch „BASKETBALL-" und die Zonenkante waagerecht
            durch „COMMUNITY". Gedimmt war das trotzdem ein Strich durch einen
            Buchstaben, und ein Strich durch einen Buchstaben liest sich als
            Panne, nicht als Raum.
            Die Trennung folgt der Geometrie, nicht dem Geschmack:
            · Der KORBBEREICH liegt in der Textspalte (die Zone ist 4,90 m
              breit, die Textspalte ist auf jedem Gerät breiter oder ähnlich
              breit — siehe die Zwangslage oben). Er muss also weg sein, bevor
              der Text beginnt: volle Stärke bis 2,9 m, ab 4,2 m nichts mehr.
            · Das FERNE FELD darf durchlaufen. Nur so bleibt unten etwas
              stehen, statt dass die untere Bildhälfte leer wird.
              ⚠️ HIER STAND DER GRUND DAFÜR FALSCH, und er las sich wie eine
              Zusicherung: „Die Dreipunkt-Geraden stehen bei ± 6,60 m, die
              Seitenlinien bei ± 7,50 m — auf 1440 px sind das ± 475 bzw.
              ± 540 px, die Textspalte ist ± 384 px breit. Sie kreuzen den
              Text nicht."
              Die Rechnung stimmt und beweist nichts, weil sie zwei Dinge
              auslässt. **(a) Den BOGEN.** Die Geraden stehen senkrecht neben
              dem Text — der Bogen läuft quer und kommt auf jeder Breite in
              die Textspalte. **(b) Den Maßstabswechsel.** Unterhalb von
              ~1200 px treibt nicht mehr die Breite den Maßstab, sondern die
              Zeichnungshöhe; die Geraden rücken damit nach innen
              (768 px → ± 334 px gegen eine ± 336 px breite Textspalte).
              NACHGEMESSEN kreuzt die Dreipunktlinie den Text auf **768, 820,
              900, 1024 und 1100 px** — genau in dem Band, das Tobias gemeldet
              hat. Sie DARF das; sie tut es nur nicht deshalb, weil sie es
              nicht täte. Die tragfähige Begründung ist der gemessene
              Kontrast — sie steht oben im Kopf dieser Datei. */}
        <linearGradient
          id="hero-court-nah"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={GRUND}
          x2="0"
          y2={n(y(6))}
        >
          <stop offset="0" stopColor="#7E9AD8" />
          <stop offset={n(2.0 / 6)} stopColor="#6E8BCC" />
          <stop offset={n(2.9 / 6)} stopColor="#4C639F" stopOpacity="0.85" />
          <stop offset={n(3.6 / 6)} stopColor="#33447A" stopOpacity="0.35" />
          <stop offset={n(4.2 / 6)} stopColor="#2A3765" stopOpacity="0" />
          <stop offset="1" stopColor="#2A3765" stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id="hero-court-fern"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={GRUND}
          x2="0"
          y2="720"
        >
          <stop offset="0" stopColor="#5E79B8" />
          <stop offset={n((y(3.5) - GRUND) / (720 - GRUND))} stopColor="#3E5188" />
          <stop offset="1" stopColor="#2C3A66" />
        </linearGradient>
      </defs>

      {/* ══ DAS FERNE FELD ══════════════════════════════════════════════════
          Seitenlinien, Dreipunktlinie und Freiwurf-Halbkreis. Duenner als der
          Korbbereich — sie tragen die Orientierung, nicht die Aufmerksamkeit.
          Auf dem Telefon liegen die Seitenlinien ausserhalb des Bildes; das ist
          richtig so und kein Verlust: Ein Ausschnitt zeigt nicht alles. */}
      <g
        fill="none"
        stroke="url(#hero-court-fern)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      >
        {/* Seitenlinien — Rule 2.1, ± 7,50 m. Sie laufen bis unter den
            Bildrand, damit das Feld weitergeht statt aufzuhoeren. */}
        <path
          d={
            `M ${n(MITTE - m(HALB_BREIT))} ${GRUND} V 900 ` +
            `M ${n(MITTE + m(HALB_BREIT))} ${GRUND} V 900`
          }
          style={{ "--len": px(L.seiten), "--delay": "220ms" }}
          data-court="seiten"
          data-court-path
        />

        {/* Dreipunktlinie — zwei Geraden bis 2,99 m, dann der Bogen.
            DAS ist die Ecken-Drei, und sie ist der Grund, warum ein reiner
            Halbkreis hier falsch waere. */}
        <path
          d={
            `M ${n(MITTE - m(DREI_X))} ${GRUND} V ${n(y(UEBERGANG))} ` +
            `A ${n(m(DREI_R))} ${n(m(DREI_R))} 0 0 0 ` +
            `${n(MITTE + m(DREI_X))} ${n(y(UEBERGANG))} V ${GRUND}`
          }
          style={{ "--len": px(L.drei), "--delay": "320ms" }}
          data-court="drei"
          data-court-path
        />

        {/* ⚠️ HIER LAG DER FREIWURF-HALBKREIS, UND ER IST BEWUSST NICHT MEHR DA.
            Er ist regelkonform (Rule 2.5.2: „free-throw SEMI-circles", r =
            1,80 m, nur die vom Korb abgewandte Haelfte — die gestrichelte
            zweite Haelfte, die man im Kopf hat, ist NBA/NCAA und gibt es im
            FIBA-Regelwerk gar nicht). Gezeichnet war er trotzdem falsch am
            Platz, und das ist keine Geschmacksfrage, sondern nachgerechnet:
            Er sitzt bei 5,80–7,60 m Tiefe und ± 1,80 m um die Mitte — also
            GENAU dort, wo auf jeder Breite die Ueberschrift steht, und nah
            genug an der Mitte, dass keine Textspalte an ihm vorbeikommt.
            ANGESEHEN auf 1440 war das ein Bogenstueck hinter „IN NRW", das
            sich als Artefakt liest und nicht als Feld.
            Er ist damit das eine Element, das man weglassen MUSS: alles andere
            liegt entweder ueber dem Text (Korbbereich) oder neben ihm
            (Dreipunktlinie, Seitenlinien). */}
      </g>

      {/* ══ DER KORBBEREICH ═════════════════════════════════════════════════
          Grundlinie, Zone, Aufstellungsmarken, Brett, Ladezone. Kraeftiger —
          das ist der Teil, der ueber der Ueberschrift steht und in einer
          halben Sekunde beantworten muss, ob hier jemand weiss, wovon er
          spricht. */}
      <g
        fill="none"
        stroke="url(#hero-court-nah)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Grundlinie, von Rand zu Rand. Die Kante, an der die Komposition
            oben abschliesst. */}
        <path
          d={`M 0 ${GRUND} H 1200`}
          style={{ "--len": px(L.grund), "--delay": "0ms" }}
          data-court="grund"
          data-court-path
        />

        {/* Die Zone — Rule 2.5.3, 4,90 m breit, 5,80 m tief.
            ⚠️ Die obere Kante ist hier ueber die volle Zonenbreite gezogen, so
            wie Diagram 3 sie zeichnet und wie sie auf jedem Hallenboden liegt.
            Die eigentliche Freiwurflinie ist nach Regel nur 3,60 m lang; die
            4,90 m sind die „verlaengerte Freiwurflinie", also die Kante der
            Zone. Beides ist richtig, gezeichnet wird die Kante. */}
        <path
          d={
            `M ${n(MITTE - m(ZONE_HALB))} ${GRUND} ` +
            `V ${n(y(ZONE_TIEF))} H ${n(MITTE + m(ZONE_HALB))} V ${GRUND}`
          }
          style={{ "--len": px(L.zone), "--delay": "120ms" }}
          data-court="zone"
          data-court-path
        />

        {/* Brett — 1,80 m breit, Vorderkante 1,20 m vor der Grundlinie.
            Von oben ist ein Brett ein Strich, und dieser Strich ist der Grund,
            warum der Ring daneben nicht als Radarschirm gelesen wird: Erst
            Strich + Kreis + Bogen ergeben eindeutig einen Korb. */}
        <path
          d={`M ${n(MITTE - m(BRETT_HALB))} ${n(y(BRETT_TIEF))} H ${n(MITTE + m(BRETT_HALB))}`}
          style={{ "--len": px(L.brett), "--delay": "520ms" }}
          data-court="brett"
          data-court-path
        />

        {/* Ladezone — Halbkreis r = 1,30 m plus die zwei 0,375-m-Schenkel, die
            1,20 m vor der Grundlinie enden (Rule 2.5.7). Die Schenkel sind das
            Detail, an dem man sieht, ob jemand die Regel gelesen oder die Form
            aus dem Gedaechtnis gezeichnet hat. */}
        <path
          d={
            `M ${n(MITTE - m(LADE_R))} ${n(y(BRETT_TIEF))} ` +
            `V ${n(y(KORB_TIEF))} ` +
            `A ${n(m(LADE_R))} ${n(m(LADE_R))} 0 0 0 ` +
            `${n(MITTE + m(LADE_R))} ${n(y(KORB_TIEF))} ` +
            `V ${n(y(BRETT_TIEF))}`
          }
          style={{ "--len": px(L.lade), "--delay": "600ms" }}
          data-court="lade"
          data-court-lade
          data-court-path
        />

        {/* Die Aufstellungsmarken. Zehn Striche, und sie sind der Grund, warum
            das Bild nah ist: Auf 16 m Bildbreite waeren sie 2 px lang und
            damit Rauschen. Sie stehen gestaffelt von aussen nach innen, weil
            der Blick beim Freiwurf genauso laeuft. */}
        {MARKEN.map((tiefe, i) => (
          <Marke key={`l${tiefe}`} seite={-1} tiefe={tiefe} verzug={700 + i * 40} />
        ))}
        {MARKEN.map((tiefe, i) => (
          <Marke key={`r${tiefe}`} seite={1} tiefe={tiefe} verzug={700 + i * 40} />
        ))}
      </g>

      {/* Die neutrale Zone ist in Diagram 3 ein ausgefuellter Block, kein
          Strich — der einzige Ort des Feldes, an dem Farbe eine Flaeche ist.
          Sie blendet auf statt sich zu zeichnen: ein 24 Einheiten hoher Block,
          der sich „zeichnet", ist ein Zucken. */}
      <g className="hero-court-block" fill="url(#hero-court-nah)">
        <rect
          x={n(MITTE - m(ZONE_HALB) - m(MARKE_LANG))}
          y={n(y(NEUTRAL_VON))}
          width={n(m(MARKE_LANG))}
          height={n(m(NEUTRAL_BIS - NEUTRAL_VON))}
        />
        <rect
          x={n(MITTE + m(ZONE_HALB))}
          y={n(y(NEUTRAL_VON))}
          width={n(m(MARKE_LANG))}
          height={n(m(NEUTRAL_BIS - NEUTRAL_VON))}
        />
      </g>

      {/* ══ DER RING ════════════════════════════════════════════════════════
          Das einzige Orange der Zeichnung, voll deckend, klein und genau.
          Er blendet zuletzt auf und zeichnet sich nicht — ein sich zeichnender
          Kreis von 27 Einheiten ist eine Zappelei.
          ⚠️ Die Strichbreite ist bewusst staerker als massstabsgetreu: ein
          Ring ist real 20 mm stark, das waeren hier 1,2 Einheiten. Gezeichnet
          sind 2,8 — die Betonung ist Absicht, nicht Schlamperei. */}
      <circle
        className="hero-court-korb"
        cx={MITTE}
        cy={n(y(KORB_TIEF))}
        r={n(m(KORB_R))}
        fill="none"
        stroke="#F07A27"
        strokeWidth="2.8"
        data-court-korb
      />
    </svg>
  );
}
