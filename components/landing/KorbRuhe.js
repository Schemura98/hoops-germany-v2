// ══ DER RUHENDE KORB IM ABSCHLUSS-BLOCK ═════════════════════════════════════
//
// ⚠️ AM 20.08.2026 UNVERAENDERT AUS HeroDunk.js HERAUSGELOEST — nicht neu
// gestaltet. HeroDunk.js ist mit der Ruecknahme der Hero-Choreografie
// entfallen (Auftrag Patrick: „die Hero Animation … alles zusammen — neu
// ansetzen"); dieser Korb war der einzige Teil der Datei, der ausserhalb des
// Heros benutzt wird, naemlich in components/landing/LandingCTA.js.
//
// ⚠️ ES IST EINE VERSCHIEBUNG, KEINE ENTSCHEIDUNG — und der offene Punkt
// gehoert benannt, nicht verschwiegen: Patricks Ruecknahme nannte
// ausdruecklich zwei Perspektiven in einem Bild (Netz als Schraegansicht,
// Spielfeldlinien flach). Genau diese Schraegansicht steht hier weiter, waehrend
// der neue Hero streng in Draufsicht zeichnet. Auf EINER Seite stehen damit
// jetzt beide Projektionen — eine Etage tiefer als der beanstandete Fall,
// aber dieselbe Sache.
// Patricks Auftrag lautete „fokussiere dich nur darauf [den Hero]", deshalb
// ist hier nichts angefasst. Die Angleichung des Abschluss-Blocks an die
// Draufsicht ist ein eigener, zu entscheidender Auftrag.
//
// Alles Folgende ist Originalcode aus HeroDunk.js: die Konstanten und
// Hilfsfunktionen, die `KorbRuhe` braucht, und die Funktion selbst.
// Der Hochformat-Block `HOCH` ist NICHT mitgekommen — er gehoerte
// ausschliesslich der Hero-Buehne. Eine mitgeschleppte Konstante ohne
// Verwendung ist genau das Muster, das Kai als K4 gemeldet hat.

const ARC_MAX = 0.62;

// Ebenen als Anteil von ARC_MAX. Die Zeichnung hat drei Tiefen, damit „Grund",
// „Bewegung" und „Ereignis" ohne Farbwechsel unterscheidbar sind.
const EBENE = {
  feld: 0.45, // die ruhende Fläche, auf der es stattfindet
  netz: 0.55, // hängt am Ring, gehört zum Abschluss, ist aber Textur
  ringRuhe: 0.7, // ⚠️ ABWEICHUNG VOM KONZEPT, s. u.
  zug: 0.9, // die Hauptbewegung
  abschluss: 1.0, // Ring gehoben, Hand, Ball
};

// ⚠️ WARUM DER RING IN RUHE AUF 0,70 STEHT UND NICHT AUF 0,45 (Grund-Ebene),
// wie im Konzept vorgesehen — eigene Korrektur nach der Rechnung:
// Der Ring ist das EINZIGE, was im ersten Bild steht, und das erste Bild ist
// das einzige, das 100 % der Besucher sehen. Auf der Grund-Ebene läge er bei
// wirksam 0,279, also 1,54 : 1 gegen den Grund — unterhalb der Untergrenze von
// rund 2 : 1, die ich selbst gesetzt habe („darunter liest sich ein Strich als
// Tonwertänderung, nicht als Zeichnung"). Bei 0,70 sind es 2,15 : 1.
// Das Konzept hätte seine eigene Untergrenze verletzt.

// ── Choreografie ────────────────────────────────────────────────────────────
//
// ⚠️ DER SATZ, AN DEM DIE GANZE MECHANIK HÄNGT:
//
//     Was gezeichnet wird, hängt am Scroll. Was fällt, hängt an der Zeit.
//
// Eine Zeichnung, die langsam entsteht, ist normal — eine Zeichnung hat keine
// Physik, sie ist in jeder Geschwindigkeit richtig und vollständig umkehrbar.
// Ein Dunk hat Physik. Wer ihn an die Scrollposition hängt, bekommt bei
// langsamem Scrollen einen Gegenstand, der in der Luft hängt und mit der Maus
// gezogen wird — und beim Zurückscrollen einen rückwärts laufenden Dunk.
// Deshalb wird der Abschluss EINMAL ausgelöst und läuft dann zeitgesteuert ab
// (ABSCHLUSS_MS), unabhängig davon, ob und wie weiter gescrollt wird.
// Danach bleibt die Zeichnung stehen: Ein Spielzug, der stattgefunden hat, hat
// stattgefunden.
const ABSCHLUSS_MS = 420;

// Zeichenfenster in `td` (dem eigenen Fortschritt der Zeichnung, s.
// HeroScrollStage.js). Sie stehen hier und nicht im Controller, damit die
// Choreografie geändert werden kann, ohne die rAF-Schleife anzufassen —
// dieselbe Trennung, die `PlayDiagram.js` schon hatte.
const F = {
  // Der Ring HEBT sich (Deckkraft), er zeichnet sich nicht — er steht schon da.
  ringHebung: [0.06, 0.3],
  zug: [0.02, 0.82], // die GANZE Strecke gehört der Hauptbewegung
  ball: [0.82, 1.0],
};

// ⚠️ `feldGrund` UND `feldZone` STEHEN HIER NICHT MEHR — DAS FELD ZEICHNET SICH
// NICHT, ES STEHT (Entscheidung Vivien, 19.08.2026, zweite Runde).
// Das ist die Antwort auf zwei Befunde, die dieselbe Ursache hatten:
//   · Kai K1: Der Server lieferte die FERTIGE Zeichnung aus, das JavaScript nahm
//     sie zurück und erzählte sie danach noch einmal.
//   · Tobias: „Bei Scrollstand 0 sind 0 % der vier Linienzüge gezeichnet … es
//     liest sich als lose Einzelstriche statt als Spielzug."
// Beide Male ging es um dasselbe: WAS STEHT IM ERSTEN BILD. Es stand entweder
// alles (Server) oder fast nichts (nach der Hydration) – und beides war falsch.
//
// Die Trennung, die jetzt gilt, ist eine inhaltliche und keine technische:
//   SZENE  = wo es stattfindet. Grundlinie, Zone, Ring, Netz. Steht ab dem
//            ersten Bild, ohne Scrollen, ohne JavaScript.
//   ZUG    = was passiert. Bahn und Ball. Entsteht beim Scrollen.
// Ein Spielzug wird auf ein Feld gezeichnet, das schon da ist – niemand malt
// beim Erklären erst die Halle. Vier Linien, die nacheinander erscheinen, sind
// vier Ereignisse; eine Linie, die über einer stehenden Szene wächst, ist eines.
//
// ⚠️ Der Nebengewinn ist der eigentliche: Die Scroll-Strecke gehört jetzt der
// BEWEGUNG allein. Vorher teilten sich Grundlinie, Zone, Zug und Ball dieselben
// rund 250 px Scrollweg – die Hauptbewegung bekam davon 56 %. Jetzt bekommt der
// Zug 80 % und der Ball die letzten 18 %; die Strecke selbst bleibt gleich lang,
// und WARUM sie nicht länger werden darf, steht bei `PROGRESS_SPAN` im
// Controller (die Geometrie gibt es nicht her – gemessen, nicht geschätzt).

// ⚠️ DER DREI-PUNKTE-BOGEN IST WEGGEFALLEN (Abweichung vom Konzept, drei
// Feldpfade → zwei). Grund, am gebauten Stück gesehen und nicht gerechnet:
// Im Hochformat sind nur 78 % der viewBox-Breite sichtbar. Ein Bogen, der
// 108 % der viewBox überspannt, wird dort nie als Bogen gelesen — man sieht
// zwei Diagonalen an den Rändern und eine große Kurve unten, die dem Korb die
// Aufmerksamkeit nimmt. Eine Form, die nicht erkannt wird, grundiert nicht,
// sie rauscht.
// Grundlinie plus Zone reichen: zwei fluchtende Linien SIND die Perspektive.
// ⚠️ Er fällt in BEIDEN Fassungen weg, obwohl er im Querformat (85 % sichtbar)
// getragen hätte. Die Regel „gleiche Elemente, gleiche Reihenfolge, nur andere
// Anordnung" ist mehr wert als ein Bogen — sobald die Fassungen sich in der
// Zahl der Elemente unterscheiden, sind es zwei Zeichnungen und nicht mehr
// zwei Anordnungen einer.
const RING_HEBUNG = F.ringHebung;

// ⚠️ DAS NETZ ZEICHNET SICH NICHT — ES STEHT AB DEM ERSTEN BILD, ZUSAMMEN MIT
// DEM RING. Das ist eine Abweichung vom Konzept (dort fiel es gestaffelt bei
// td 0,25–0,40) und der Grund dafür stand im Konzept selbst, nur an anderer
// Stelle: „Ellipse plus Netz sind unmissverständlich ein Korb."
// Am gebauten Stück auf 360 px nachgesehen: Eine Ellipse ALLEIN ist kein Korb,
// sie ist eine Ellipse. Sie lag quer über der letzten Headline-Zeile und las
// sich als Versehen, nicht als Motiv.
// Das erste Bild ist das einzige, das 100 % der Besucher sehen. Ein paar
// hundert Millisekunden Netzbewegung sind ein schlechter Tausch gegen ein
// unlesbares erstes Bild.

// ── Geometrie ───────────────────────────────────────────────────────────────
//
// ⚠️ DER UMSCHALTER IST DAS SEITENVERHÄLTNIS, NICHT DER BREAKPOINT.
// Jeder bisherige Platzierungsfehler in diesem Hero kam daher, dass über die
// BREITE entschieden wurde, während die HÖHE die Sache bestimmte (Roadmap 20b,
// 20f — vier Gate-Runden). Konkret mit Zahl: Ein Umschalter bei 768 px schickt
// das iPad hochkant (768×1024, Bühnenverhältnis 0,800) in die Querformat-
// Fassung; dort blieben davon 54 % übrig, **46 % der Zeichnung wären
// weggeschnitten**.
//
// Die Bühnen-Seitenverhältnisse der neun geprüften Viewports (Bühnenhöhe =
// Fensterhöhe − 64) liegen in zwei Gruppen: 0,489–0,800 und 1,268–1,739.
// **Zwischen 0,80 und 1,27 liegt kein einziges geprüftes Gerät** — eine
// Schwelle bei 1 : 1 hat also auf beiden Seiten Luft.
//
// ⚠️ UND EINE UNSAUBERKEIT, DIE BENANNT GEHÖRT: Die Media-Query misst das
// FENSTER, die Tabelle oben die BÜHNE (`100vh − 4rem`). Die beiden Werte
// unterscheiden sich; bei Fensterverhältnis 1,0 liegt das Bühnenverhältnis bei
// rund 1,09. Beide liegen im geräteleeren Band zwischen 0,80 und 1,27, deshalb
// fällt für ALLE neun Viewports dieselbe Entscheidung — nachgeprüft in
// `hero-dunk.spec.mjs` (P4), nicht angenommen.
//
// Die viewBox-Verhältnisse sind jeweils das GEOMETRISCHE MITTEL ihrer Gruppe.
// Dadurch ist der maximale Beschnitt auf beiden Seiten der Gruppe gleich groß:
//   Hochformat  500×800  = 0,625  über 0,489–0,800  → höchstens 21,9 % Beschnitt
//   Querformat 1040×700  = 1,486  über 1,268–1,739  → höchstens 14,7 %
// Daraus die Sicherheitsränder: tragende Elemente liegen innerhalb der inneren
// 76 % (Hochformat) bzw. 84 % (Querformat) der viewBox.
const VIEWBOX = {
  hoch: { w: 500, h: 800, sicher: 0.76 },
  quer: { w: 1040, h: 700, sicher: 0.84 },
};

// ⚠️ DER RING SITZT AUF HALBER viewBox-HÖHE, UND DAS IST KEINE ÄSTHETIK.
// Bei `slice` bleibt der Mittelpunkt der viewBox immer der Mittelpunkt der
// Bühne — ein Element auf halber viewBox-Höhe liegt also auf JEDER Bühne auf
// halber Bühnenhöhe.
// Warum das genau die richtige Lage ist: Bei Scrollstand S ist
// `rect.top = 64 − S`, also ist zum Zeitpunkt `t` nur das Bühnenband
// [0,45·t·H ; H] sichtbar. Beim Auslösen des Abschlusses (t = 0,75) beginnt
// das sichtbare Band bei 0,3375·H. Ein Ring auf 0,50·H hat dorthin auf der
// kürzesten geprüften Bühne (320×568, H = 504) noch 82 px Reserve.
//
// ⚠️ DAS IST ROADMAP 20 (d) ALS BEDINGUNG VORHER STATT ALS BEFUND NACHHER.
// Dort steht: „Die Landung ist auf KEINEM Viewport sichtbar … Die Pointe der
// einen Reise durch die Seite hat noch nie jemand gesehen." Genau diese
// Rechnung hat gefehlt.

// Das Netz: sieben senkrechte Stränge plus zwei waagerechte Bögen.
//
// ⚠️ DIE ZWEI WAAGERECHTEN SIND NICHT DEKORATION, sie sind der Unterschied
// zwischen „Netz" und „Lampenschirm". Am gebauten Stück auf 360 px
// nachgesehen: Fünf senkrechte Stränge allein lesen sich als konischer Korb aus
// Draht. Erst die Querverbindung macht daraus ein Geflecht. Dasselbe Mittel
// benutzt `HoopEmblem` seit dem 12.08.2026 auf 20×14 px – dort mit zwei Quer-
// und drei Längsbögen. Die Formensprache ist also nicht neu erfunden, nur
// größer gezeichnet.
function netzPfade({ cx, cy, rx, ry, ncy, nrx, nry }) {
  const WINKEL = [180, 150, 120, 90, 60, 30, 0];
  const tiefe = ncy - cy;
  const straenge = WINKEL.map((grad) => {
    const b = (grad * Math.PI) / 180;
    const x0 = cx + rx * Math.cos(b);
    const y0 = cy + ry * Math.sin(b);
    const x1 = cx + nrx * Math.cos(b);
    const y1 = ncy + nry * Math.sin(b);
    // Bauchung nach außen, proportional zum seitlichen Abstand von der Mitte:
    // ein Netz hängt nicht in geraden Linien.
    const bx = (x0 - cx) * 0.1;
    const cxq = (x0 + x1) / 2 + bx;
    const cyq = (y0 + y1) / 2;
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cxq.toFixed(1)} ${cyq.toFixed(
      1,
    )} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });
  // Zwei Querbögen auf 45 % und 82 % der Netztiefe, nach unten durchhängend.
  const quer = [0.45, 0.82].map((f) => {
    const halb = rx + (nrx - rx) * f;
    const y = cy + tiefe * f;
    const durchhang = (rx - nrx) * 0.55 + tiefe * 0.06;
    return `M${(cx - halb).toFixed(1)} ${y.toFixed(1)} Q${cx} ${(
      y + durchhang
    ).toFixed(1)} ${(cx + halb).toFixed(1)} ${y.toFixed(1)}`;
  });
  return [...straenge, ...quer];
}

// Kreis als Pfad statt als <circle>: `pathLength` ist auf Formelementen zwar
// spezifiziert, aber ein Pfad ist überall dasselbe. Bei einem Element, dessen
// Sichtbarkeit an `stroke-dashoffset` hängt, ist „überall dasselbe" mehr wert
// als drei gesparte Zeichen — ein Browser, der `pathLength` am <circle>
// ignoriert, zeigt den Ball dauerhaft und ohne Fehlermeldung.
const kreisPfad = (cx, cy, r) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

// ── Hochformat (< 1 : 1) ────────────────────────────────────────────────────
// Sicherer Bereich: x ∈ [60, 440], y ∈ [88, 712].

// ⚠️ DER BALL LÄUFT AUF DEM HANDY HINTER DER PRIMÄRTASTE VORBEI — UND DAS
// BLEIBT SO (Entscheidung Vivien zu Tobias' Befund B1, 19.08.2026).
// Gemessen an der Production-Runtime, Anteil der Ballfläche hinter der Taste
// „Profil anlegen" über die 24 Bilder des Falls:
//   360×800  höchstens 96 % · über 50 % in 21 % der Bilder
//   375×812  höchstens 98 % · über 50 % in 29 %
//   390×844  höchstens 98 % · über 50 % in 29 %
//   430×932  höchstens 74 % · über 50 % in 25 %
//   768×1024 höchstens 21 % · ab 1280 gar nicht
// Vollständig verdeckt ist der Ball in KEINEM einzigen Bild.
//
// Warum nicht behoben, obwohl der Befund stimmt — drei Gründe, der letzte ist
// der eigentliche:
// 1. GEOMETRISCH IST KEIN PLATZ. Auf 360 px liegt die Taste zwischen x = 74 und
//    286, der Ball zwischen 226 und 281. Damit er die Taste seitlich frei
//    passiert, müsste er rechts von 286 fallen — also in den letzten 74 px der
//    Bildbreite. Der Ring, in den er fällt, ist gerendert rund 140 px breit und
//    wäre dort zur Hälfte abgeschnitten. Beide Bedingungen zusammen sind auf
//    dieser Breite nicht erfüllbar.
// 2. WAS VERDECKT WIRD, IST DER TRANSPORT, NICHT DIE POINTE. Der Ball
//    ERSCHEINT über der Taste (Oberkante 170 gegen Tastenoberkante 214) und er
//    KOMMT AN unter ihr (Ring bei 291, Taste endet bei 274). Verdeckt ist das
//    Stück dazwischen. Tobias schreibt selbst, der Höhepunkt liege danach und
//    sei sichtbar.
// 3. ⚠️ DER PREIS DER ALTERNATIVE IST BEKANNT UND HOCH. Eine Zeichnung, die der
//    Bedienoberfläche ausweicht, braucht zur Laufzeit die Lage jedes
//    Bedienelements — Kastenbau, Lückensuche, Verankerung, Konturkanal. Genau
//    dieser Apparat ist mit dem alten Ball entfallen (Roadmap 20 bis 20h, acht
//    Punkte, jeder mindestens eine Gate-Runde). Ihn für 21–29 % der Bilder eines
//    420-ms-Falls zurückzuholen, wäre der schlechteste Tausch dieses Umbaus.
//    Eine Zeichnung im HINTERGRUND darf hinter dem Vordergrund verschwinden;
//    das ist die Bedeutung von Hintergrund.
// ⚠️ WER ES TROTZDEM WILL, hat genau einen billigen Hebel, und er gehört nicht
// mir: eine SCHMALERE Primärtaste. „Profil anlegen" ist Neles Rückfall-Wortlaut
// und misst mit Innenabstand 212 px von 360. Bei rund 150 px Tastenbreite wäre
// die Überschneidung fast weg. Das ist eine Text- und keine Geometriefrage.

// ── Querformat (≥ 1 : 1) ────────────────────────────────────────────────────
// Sicherer Bereich: x ∈ [76, 964], y ∈ [51, 649].
const QUER = (() => {
  // ⚠️ DER KORB IST IM QUERFORMAT KLEINER UND WEITER RECHTS als im Hochformat.
  // Das ist responsive Art Direction, keine Inkonsequenz: Die Querformat-Bühne
  // ist breit und FLACH (736 px hoch bei 1280 Breite). Mit der Hochformat-
  // Proportion belegte der Korb 37 % der Bühnenhöhe und wurde unten
  // angeschnitten – am gebauten Stück auf 1280×800 gesehen.
  // Gerendert misst der Ring rund 26 % der Bühnenbreite im Querformat und
  // rund 39 % im Hochformat. Die im Konzept genannten „rund 34 %" waren eine
  // Zahl für EIN Seitenverhältnis; unter `slice` hängt die gerenderte Breite
  // einer festen viewBox-Größe zwangsläufig am Verhältnis der Bühne.
  // ⚠️ DIE GANZE SZENE IST AM 19.08.2026 UM 54 EINHEITEN NACH UNTEN GERÜCKT
  // (Ring 420 → 474, Netz 548 → 602, Ball 266 → 320, Feld 452 → 506), UND DAS
  // IST EIN GEMESSENER BEFUND, KEINE KOMPOSITION.
  // Auftritt des Balls im Moment der Auslösung, Oberkante in Bildschirm-Pixeln:
  //   1280×800  →  22 px   (Navigationsleiste reicht bis 64)
  //   1440×900  →  17 px
  // Der Ball erschien also HINTER der Leiste und kam erst auf halbem Fallweg
  // hervor. Das ist Roadmap 20g in neuem Gewand — dort stand über den alten
  // Ball: „ein Auftritt ohne Publikum". Es war derselbe Fehler an derselben
  // Stelle, nur mit einem anderen Gegenstand.
  // ⚠️ WARUM DIE GANZE SZENE UND NICHT NUR DER BALL: Der Ball allein tiefer zu
  // setzen hätte den Abstand zum Ring von 108 auf 46 Einheiten gedrückt — der
  // Ball hinge dann eine halbe Balllänge über dem Ring, und der Sprung wäre
  // seine Fallhöhe los. Die Fallstrecke bleibt jetzt exakt 202 Einheiten.
  // ⚠️ Nach unten ist die Grenze das NETZ, nicht der Ring: Die Netzunterkante
  // liegt bei 624 im sicheren Bereich (y ≤ 649). Wer weiter schiebt, schneidet
  // sie auf der kürzesten Querformat-Bühne an — `hero-dunk.spec.mjs` (P4) sagt
  // es, aber erst nach dem Bauen.
  const ring = { cx: 800, cy: 474, rx: 135, ry: 33 };
  const netz = { ncy: 602, nrx: 93, nry: 22 }; // s. Kommentar im Hochformat
  const ballR = Math.round(ring.rx * 0.4); // s. Kommentar im Hochformat
  const ball = { cx: 766, cy: 320, r: ballR };
  return {
    ring,
    ballFall: 522 - ball.cy,
    netzOrigin: ring.cy,
    // Unterkante des Netzes – EINE Quelle, weil `KorbRuhe` weiter unten
    // denselben Wert braucht. Er stand dort als Zahl im Code und wäre bei
    // dieser Verschiebung still falsch geworden.
    netzUnten: netz.ncy + netz.nry,
    feld: {
      grund: "M-40 506 L1080 506",
      zone: "M672 506 L582 710 L1018 710 L928 506",
    },
    netz: netzPfade({ ...ring, ...netz }),
    // Kreuzt die Ringebene (y = 474) bei x ≈ 600, linker Ringrand 665.
    zug: "M180 714 C300 672 410 610 500 530 C578 462 686 404 766 375",
    ball: kreisPfad(ball.cx, ball.cy, ballR),
  };
})();

// ⚠️ KEIN `vector-effect: non-scaling-stroke` — UND DAS IST EINE ENTSCHEIDUNG,
// KEINE AUSLASSUNG. Sie hat diesen Umbau zwei Anläufe gekostet, s. den Block
// über `Zeichenpfad`. Kurzfassung: Unter `non-scaling-stroke` rechnet der
// Browser das STRICHMUSTER im Gerätemaß statt in Benutzereinheiten. Jede
// Rechnung mit `stroke-dasharray` stimmt dann nur bei Maßstab 1.
// Der Preis: Der Strich skaliert mit der Zeichnung. Gemessen rendert eine
// 3-Einheiten-Linie zwischen **1,9 px** (320×568, Maßstab 0,64) und **4,9 px**
// (1440×1136, Maßstab 1,62).
// Das ist vertretbar und sogar richtig: Die Zeichnung ist ein MOTIV, das als
// Ganzes wächst, kein Kartennetz aus Haarlinien. Ein größerer Bildschirm
// bekommt ein größeres Bild mit einem entsprechend stärkeren Strich.
// ⚠️ Wer den Strich wieder festnageln will, muss das Strichmuster je Pfad in
// Gerätemaß umrechnen (`getScreenCTM()`) UND bei jeder Größenänderung neu —
// eine versteckte Kopplung genau der Sorte, die dieser Datei schon zweimal
// teuer geworden ist.
const STRICH = { feld: 1.5, netz: 2, zug: 3, ring: 3, ball: 3 };

export default function KorbRuhe({ className = "" }) {
  // ⚠️ ENGE viewBox UND `meet`, NICHT `slice` WIE IM HERO — am gebauten Stück
  // korrigiert. Mit der Hero-viewBox (1040×700) und `slice` blieb auf 360 px
  // vom Korb ein Bogenstück am rechten Rand übrig: Der Abschluss-Block ist viel
  // flacher als die Bühne, `slice` schneidet dort fast alles weg.
  // Ein Fragment ist keine Grundierung, es ist ein Strich, den niemand
  // zuordnen kann. Deshalb hier: Ausschnitt genau um Ring und Netz, und `meet`
  // — der Korb ist auf jeder Abschnittsgröße vollständig.
  //
  // ⚠️ UND ER IST LEISER ALS IM HERO — gemessen, nicht geschätzt. Mit der
  // Abschluss-Ebene (wirksam 0,620) kreuzte der Ring ab 768 px den Fließtext
  // „Werde Teil der Community-Plattform…" (`text-mist-400`): **2,68 : 1**,
  // unter AA. Hier ist der Korb Grundierung hinter einem Textblock, nicht der
  // Hauptdarsteller einer Bühne — er darf die Lautstärke des Netzes haben.
  // Wirksam 0,341 (Ring) und 0,273 (Netz); `mist-400` hält darüber 4,74 : 1
  // bzw. 5,90 : 1, `paper-50` 9,22 : 1.
  const rand = 18;
  const x = QUER.ring.cx - QUER.ring.rx - rand;
  const y = QUER.ring.cy - QUER.ring.ry - rand;
  const w = 2 * (QUER.ring.rx + rand);
  const h = QUER.netzUnten + rand - y; // bis zur Netzunterkante
  return (
    <svg
      aria-hidden="true"
      viewBox={`${x} ${y} ${w} ${h}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={`pointer-events-none ${className}`}
      style={{ opacity: ARC_MAX }}
    >
      <ellipse
        cx={QUER.ring.cx}
        cy={QUER.ring.cy}
        rx={QUER.ring.rx}
        ry={QUER.ring.ry}
        stroke="#F07A27"
        strokeOpacity={EBENE.netz}
        strokeWidth={STRICH.ring}
      />
      <g
        stroke="#F07A27"
        strokeOpacity={EBENE.netz * 0.8}
        strokeWidth={STRICH.netz}
        strokeLinecap="round"
      >
        {QUER.netz.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

