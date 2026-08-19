"use client";

import { forwardRef } from "react";

// ══ „DER ABSCHLUSS" — DER DUNK ALS LINIENZEICHNUNG ══════════════════════════
//
// Spezifikation: docs/HERO-DUNK-KONZEPT-2026-08-19.md (Vivien, 19.08.2026),
// Auftrag Patrick. Ersetzt `PlayDiagram.js` (Taktiktafel) UND den gerenderten
// Hero-Ball (`BallSprite`, 32-Bild-Sequenz, 104 KB). Der Hero lädt danach
// wieder null Bytes Bilddaten.
//
// ⚠️ WARUM EINE LINIE UND KEINE FLÄCHE — DER SATZ, DER ACHT ROADMAP-PUNKTE
// GEGENSTANDSLOS MACHT:
// Der alte Ball war eine deckende Scheibe. Er durfte keinen Buchstaben
// berühren, also musste der Controller zur Laufzeit wissen, wo jede einzelne
// Textzeile steht — daraus kamen Kastenbau, Lückensuche, Verankerung,
// Konturkanal, Abdunkelung und der Einflug-Schiedsrichter (Roadmap 20 bis 20h).
// Eine Linie darf jeden Buchstaben kreuzen: Ein 3 px breiter Strich über einem
// 96 px hohen Buchstaben berührt rund 3 % seiner Höhe. Damit entfällt die
// gesamte Messmaschine, nicht nur ein Teil davon.
//
// ⚠️ ES WIRD KEIN KÖRPER GEZEICHNET (Entscheidung Patrick, 19.08.2026).
// Gezeichnet wird die NOTATION — Bahn, Ring, Netz, Ball. Der Mensch entsteht
// aus der Bahn und kommt nie ins Bild. Zwei Gründe: Eine Linienfigur ist
// entweder Clipart oder braucht mehrere Illustrationsrunden; und die stilisierte
// Dunk-Silhouette ist der Branchenreflex, dessen prominentester Vertreter eine
// eingetragene Marke ist. Das Weglassen ist die Autorenentscheidung, keine
// Sparmaßnahme — es setzt uns zugleich von der Branche ab.
// ⚠️ AUCH DIE HAND IST WEGGEFALLEN, UND ZWAR NACH DEM BLICK AUFS GEBAUTE
// STÜCK. Das Konzept sah zwei kurze Striche am oberen Ende des Zugs vor
// (Unterarm + zweite Hand). Auf 360 px gesehen lesen sich zwei Striche am Ende
// einer langen Kurve nicht als Hand, sondern als Gabel — der Zug bekam eine
// Spitze mit zwei Zinken.
// Der Verzicht ist nicht nur die Reparatur eines Details, er ist konsequenter:
// Der erste Satz dieser Datei nennt die Notation „Bahn, Ring, Netz, Ball".
// Die Hand stand in dieser Aufzählung gar nicht. Sie war der letzte Rest
// Körper in einer Zeichnung, deren ganze Idee das Weglassen des Körpers ist.
// Jetzt sitzt der BALL an der Spitze des Zugs — die Linie trägt ihn nach oben,
// und was ihn trägt, denkt sich der Betrachter.

// ── Deckkraft ───────────────────────────────────────────────────────────────
//
// ⚠️ `ARC_MAX` IST VON 0,38 AUF 0,62 GESTIEGEN, UND DAS IST GERECHNET, NICHT
// GESCHMACK. Nach der WCAG-Relativluminanzformel auf navy-950 (#0B1220) mit
// brand-500 (#F07A27) und paper-50 (#F5F7FA):
//
//   wirksame Deckkraft   Linie gegen Grund   paper-50 ÜBER der Linie
//   0,279 (Feld)                  1,54 : 1                 11,32 : 1
//   0,341 (Netz)                  1,75 : 1                  9,95 : 1
//   0,434 (Ring in Ruhe)          2,15 : 1                  8,13 : 1
//   0,558 (Zug)                   2,81 : 1                  6,20 : 1
//   0,620 (Abschluss)             3,21 : 1                  5,43 : 1
//   0,720                         3,64 : 1        4,42 : 1  ← AA-BRUCH
//
// Die Obergrenze ist hart und hängt an ZWEI Farbwerten und sonst nichts — nicht
// am Wortlaut, nicht an der Breite, nicht an der Fensterhöhe. Genau die
// Eigenschaft, die dem Ball-Prüfmaß gefehlt hat. Reserve bis zum AA-Bruch:
// 0,10 wirksame Deckkraft (rund 16 %).
// ⚠️ Wer `brand-500` aufhellt oder den Grund ändert, muss sie NEU RECHNEN.
// Nachrechnen: die Tabelle stammt aus einer Ableitung, nicht aus einer Messung
// am Bildschirm — `tests/e2e/hero-dunk.spec.mjs` (P1) misst sie am gerenderten
// Pixel gegen.
export const ARC_MAX = 0.62;

// Ebenen als Anteil von ARC_MAX. Die Zeichnung hat drei Tiefen, damit „Grund",
// „Bewegung" und „Ereignis" ohne Farbwechsel unterscheidbar sind.
export const EBENE = {
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
export const ABSCHLUSS_MS = 420;

// Zeichenfenster in `td` (dem eigenen Fortschritt der Zeichnung, s.
// HeroScrollStage.js). Sie stehen hier und nicht im Controller, damit die
// Choreografie geändert werden kann, ohne die rAF-Schleife anzufassen —
// dieselbe Trennung, die `PlayDiagram.js` schon hatte.
const F = {
  feldGrund: [0.0, 0.18],
  feldZone: [0.08, 0.28],
  // Der Ring HEBT sich (Deckkraft), er zeichnet sich nicht — er steht schon da.
  ringHebung: [0.1, 0.25],
  zug: [0.28, 0.84], // die halbe Strecke gehört der Hauptbewegung allein
  ball: [0.86, 1.0],
};

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
export const RING_HEBUNG = F.ringHebung;

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
export const VIEWBOX = {
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
const HOCH = (() => {
  const ring = { cx: 340, cy: 528, rx: 76, ry: 20 };
  // ⚠️ NETZTIEFE 74, NICHT 92. Am gebauten Stück nachgemessen: Bei 92 (also
  // 59 % des Ringdurchmessers) liest sich das Gebilde als Papierkorb. Ein
  // echtes Basketballnetz ist rund 40 % des Ringdurchmessers lang.
  const netz = { ncy: 602, nrx: 53, nry: 13 };
  // ⚠️ BALLRADIUS = 0,40 · RINGRADIUS, UND DAS IST EINE PROPORTION, KEINE
  // Ästhetik. Der erste Bau hatte 0,22 – am gerenderten Bild gemessen las sich
  // der Ball als Murmel im Korb. In Wirklichkeit misst ein Basketball 24 cm bei
  // 45 cm Ringdurchmesser, also **0,53**; er passt gerade eben durch, und genau
  // das ist die Dramatik eines Dunks. 0,40 ist der bewusste Kompromiss: deutlich
  // als Ball lesbar, ohne den Ring zu verschlucken.
  // ⚠️ Wer den Ring verbreitert, zieht diesen Wert mit – er hängt am Radius,
  // damit das Verhältnis nicht still zurückkippt.
  const ballR = Math.round(ring.rx * 0.4);
  const ball = { cx: 330, cy: 440, r: ballR };
  return {
    ring,
    ballFall: 554 - ball.cy, // Ruhelage im Netz, knapp unter dem Ring
    netzOrigin: ring.cy, // Bezugslinie der Netzbeule: die Ringebene
    // Das Feld darf über den Rand hinauslaufen – es ist der Boden, kein Motiv.
    // Die Zone öffnet sich nach unten: In der Ansicht von hinter dem Korb
    // fluchtet der Boden nach OBEN weg, und der Ring hängt davor.
    feld: {
      grund: "M-20 556 L520 556",
      zone: "M242 556 L180 760 L500 760 L438 556",
    },
    netz: netzPfade({ ...ring, ...netz }),
    // ⚠️ DER ZUG MUSS DIE RINGELLIPSE FREI LASSEN. Er kreuzt die Ringebene
    // (y = 528) bei x ≈ 240, der linke Ringrand liegt bei 264 – 24 Einheiten
    // Luft. Wer den Ring verschiebt oder verbreitert, prüft diesen Wert nach:
    // eine Linie, die durch die Ellipse läuft, liest sich als Zeichenfehler,
    // nicht als Bahn.
    zug: "M84 764 C132 700 164 626 196 556 C228 504 284 482 330 471",
    ball: kreisPfad(ball.cx, ball.cy, ballR),
  };
})();

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
  const ring = { cx: 800, cy: 420, rx: 135, ry: 33 };
  const netz = { ncy: 548, nrx: 93, nry: 22 }; // s. Kommentar im Hochformat
  const ballR = Math.round(ring.rx * 0.4); // s. Kommentar im Hochformat
  const ball = { cx: 766, cy: 266, r: ballR };
  return {
    ring,
    ballFall: 468 - ball.cy,
    netzOrigin: ring.cy,
    feld: {
      grund: "M-40 452 L1080 452",
      zone: "M672 452 L582 656 L1018 656 L928 452",
    },
    netz: netzPfade({ ...ring, ...netz }),
    // Kreuzt die Ringebene (y = 420) bei x ≈ 600, linker Ringrand 665.
    zug: "M180 660 C300 618 410 556 500 476 C578 408 686 350 766 321",
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

// ⚠️ `pathLength="1"` FUNKTIONIERT HIER NICHT — UND DAS IST DER TEUERSTE FUND
// DIESES UMBAUS, WEIL ER STILL IST.
// Der bewährte Trick lautet: `pathLength="1"` normiert die Pfadlänge auf 1,
// `stroke-dasharray="1"` deckt sie genau ab, und `stroke-dashoffset` von 1 auf 0
// zeichnet den Pfad – ohne `getTotalLength()`, also ohne Geometriezugriff je
// Bild. Genau so stand es im Konzept und genau so machte es `PlayDiagram.js`.
//
// **Zusammen mit `vector-effect: non-scaling-stroke` gilt die Normierung nicht.**
// Der Browser rechnet das Strichmuster dann im Gerätemaß: Aus „dasharray 1"
// wird 1 px an, 1 px aus – eine feine Punktlinie über den GANZEN Pfad, und
// zwar unabhängig vom Versatz.
//
// ⚠️ WARUM DAS GEFÄHRLICH IST: Es sieht fast richtig aus. Jede noch nicht
// gezeichnete Linie steht als halbheller Geist im Bild, und wer die Seite
// nicht Bild für Bild vergleicht, hält es für Absicht. Kein Fehler in der
// Konsole, kein kaputtes Layout. Gefunden wurde es nur, weil im ersten Bild
// zwei Diagonalen standen, wo per Konstruktion nichts stehen durfte.
// Gegenprobe im Browser: `vector-effect` entfernt → die Linie verschwindet.
//
// ⚠️ WARUM ES IN `PlayDiagram.js` NIE AUFFIEL: Dort lief die ganze Tafel bei
// Deckkraft 0,171 – ein Geist bei 17 % Deckkraft ist unsichtbar. Bei 0,62 ist
// er es nicht. Der Fehler war also vermutlich schon vorher da und wurde erst
// durch die Anhebung von `ARC_MAX` sichtbar.
//
// ⚠️⚠️ UND DERSELBE FEHLER KAM IN ZWEITEM KOSTÜM ZURÜCK — mein erster Anlauf
// hat ihn nur halb behoben, und der halbe Fix war auf dem Hauptgerät grün.
// Ich hatte `non-scaling-stroke` STEHEN LASSEN und nur die Länge absolut
// gesetzt. Das Strichmuster gilt unter `non-scaling-stroke` aber im GERÄTEMASS:
// Bei Maßstab 1,231 (1280×800) ist der Pfad 704,6 × 1,231 = 867 Geräteeinheiten
// lang, das Muster aber nur 704,6 — **19 % jeder Linie fehlten**.
// Sichtbar war das als offener Ball und als Zug, der kurz vor dem Korb aufhört.
// **Auf 360 px war es unsichtbar**, weil der Maßstab dort 0,92 beträgt: Ein
// Muster, das LÄNGER ist als der Pfad, deckt ihn vollständig.
// Und mein Test war grün — er prüfte die Länge in Benutzereinheiten, also in
// der falschen Einheit. **Dieselbe Fehlerklasse wie „Bühne statt Sichtfeld"
// aus CLAUDE.md Roadmap 20b: richtig gemessen, in der falschen Einheit.**
//
// Die Abhilfe ist deshalb zweiteilig, und beide Teile sind nötig:
//   1. `vector-effect` fällt weg (s. Kommentar an `STRICH`) – damit gilt das
//      Strichmuster in Benutzereinheiten, und die Rechnung stimmt per Bauart.
//   2. Der Controller (HeroScrollStage.js) misst jede Pfadlänge EINMAL beim
//      Aufsetzen (`getTotalLength()`, funktioniert auch an der per
//      `display:none` ausgeblendeten Fassung – nachgemessen) und fährt
//      `stroke-dasharray`/`stroke-dashoffset` absolut.
// Ein Geometriezugriff je Pfad beim Aufsetzen, keiner je Bild.
//
// ⚠️ `strokeDasharray` MUSS im Ruhezustand `none` SEIN, nicht `1`. Sonst
// rendert das Standbild für `prefers-reduced-motion` als gepunktete Linie –
// derselbe Fehler, nur dauerhaft und genau für die Nutzergruppe, die ihn am
// wenigsten nachvollziehen kann.
function Zeichenpfad({ d, von, bis, breite, gezeichnet }) {
  return (
    <path
      data-dunk-path
      data-from={von}
      data-to={bis}
      d={d}
      // Übergangszustand für das eine Bild zwischen Hydration und erstem
      // Controller-Lauf. Der Controller ersetzt beide Werte durch absolute
      // Längen, bevor irgendetwas Scrollbares passiert.
      strokeDasharray={gezeichnet ? "none" : "1"}
      strokeDashoffset={gezeichnet ? 0 : 1}
      strokeWidth={breite}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

// `gezeichnet`: der Ruhezustand für `prefers-reduced-motion` UND für den ersten
// Render (auch serverseitig), s. HeroScrollStage.js.
//
// ⚠️ DAS STANDBILD IST EIN GEWÄHLTES EINZELBILD, KEINE ANGEHALTENE ANIMATION.
// Prinzip aus dem Trend-Sweep (Referenz 3): erst die Bewegung entwerfen, dann
// das stehende Bild als eines ihrer Bilder ableiten. Gewählt ist der
// SCHEITELPUNKT — vollständige Zeichnung, Ball und Hand über dem Ring, der
// Abschluss findet nicht statt. Ein Körper im höchsten Punkt seines Sprungs ist
// das lesbarste Standbild, das der Sport kennt; es IST seiner Natur nach ein
// Standbild, niemand erwartet, dass es sich bewegt. Der Endzustand („Ball im
// Netz") wäre dagegen ein Logo und verschenkte die Pointe.
// ⚠️ Ehrlich benannt: Wer reduzierte Bewegung eingestellt hat, sieht den Ball
// nie durchgehen. Das ist vertretbar – die Zeichnung ist `aria-hidden` und
// trägt keine Information.
function Fassung({ geo, viewBox, klasse, gezeichnet }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      className={`hero-dunk pointer-events-none absolute inset-0 h-full w-full ${klasse}`}
      style={{ opacity: ARC_MAX }}
    >
      {/* Das Feld – der Boden, auf dem es stattfindet. Läuft bewusst über den
          Rand hinaus: eine Grundlinie, die im Bild endet, ist ein Strich. */}
      <g stroke="#F07A27" strokeOpacity={EBENE.feld}>
        <Zeichenpfad
          d={geo.feld.grund}
          von={F.feldGrund[0]}
          bis={F.feldGrund[1]}
          breite={STRICH.feld}
          gezeichnet={gezeichnet}
        />
        <Zeichenpfad
          d={geo.feld.zone}
          von={F.feldZone[0]}
          bis={F.feldZone[1]}
          breite={STRICH.feld}
          gezeichnet={gezeichnet}
        />
      </g>

      {/* Der Ring – als EINZIGES schon im ersten Bild da, ohne Scrollen.
          Warum er so früh kommt: Eine aufsteigende Linie ohne sichtbares Ziel
          ist ein beliebiger Schwung. Erst wenn der Korb dasteht, wird aus der
          Linie ein Zug ZUM KORB. Das ist Dramaturgie und kostet nichts.
          ⚠️ Er zeichnet sich nicht, er HEBT sich – die Deckkraft läuft von
          EBENE.ringRuhe auf EBENE.abschluss. */}
      <ellipse
        data-dunk-ring
        cx={geo.ring.cx}
        cy={geo.ring.cy}
        rx={geo.ring.rx}
        ry={geo.ring.ry}
        stroke="#F07A27"
        strokeOpacity={gezeichnet ? EBENE.abschluss : EBENE.ringRuhe}
        strokeWidth={STRICH.ring}
      />

      {/* Das Netz. Eigene Gruppe, weil der Abschluss sie um die RINGEBENE
          staucht und dehnt (Beule + Zurückschnappen). Die Bezugslinie steht in
          `geo.netzOrigin`, damit die Beule am Ring hängt und nicht in der Luft. */}
      <g
        data-dunk-netz
        data-origin={geo.netzOrigin}
        stroke="#F07A27"
        strokeOpacity={EBENE.netz}
      >
        {geo.netz.map((d, i) => (
          <path key={i} d={d} strokeWidth={STRICH.netz} strokeLinecap="round" />
        ))}
      </g>

      {/* Der Zug – die Hauptbewegung, ihr allein gehört die halbe Strecke.
          ⚠️ Er läuft von unten links nach oben rechts, also GEGEN die
          Scrollrichtung. Das ist hier richtig, anders als beim fallenden Ball,
          der bewusst mitlief: Ein Sprung ist eine Bewegung gegen die
          Schwerkraft, und das Auge liest den Widerstand. */}
      <g stroke="#F07A27" strokeOpacity={EBENE.zug}>
        <Zeichenpfad
          d={geo.zug}
          von={F.zug[0]}
          bis={F.zug[1]}
          breite={STRICH.zug}
          gezeichnet={gezeichnet}
        />
      </g>

      {/* Der Ball – die Abschluss-Ebene. */}
      <g stroke="#F07A27" strokeOpacity={EBENE.abschluss}>
        {/* Eigene Gruppe: den Ball verschiebt der Abschluss, sonst nichts.
            ⚠️ KEINE NÄHTE. Ein Kreis in dieser Strichsprache IST ein Ball,
            sobald ein Ring danebensteht. Nähte machen daraus ein Icon – und ein
            Icon in einer Notation ist ein Genrebruch, genau wie ein Foto in
            einem Diagramm. */}
        <g data-dunk-ball data-fall={geo.ballFall}>
          <Zeichenpfad
            d={geo.ball}
            von={F.ball[0]}
            bis={F.ball[1]}
            breite={STRICH.ball}
            gezeichnet={gezeichnet}
          />
        </g>
      </g>
    </svg>
  );
}

// ⚠️ BEIDE FASSUNGEN WERDEN GERENDERT, DIE MEDIA-QUERY BLENDET EINE AUS.
// Der Controller schreibt in beide (26 statt 13 Pfade je Bild). Das ist bewusst:
// Die Alternative wäre, zur Laufzeit zu entscheiden, welche Fassung „gilt" –
// also ein zweiter Ort, an dem die Schwelle steht, und die Sorte Doppelung, aus
// der in dieser Datei schon dreimal ein Fehler geworden ist. Ein Stilschreiben
// auf ein `display:none`-Element kostet keinen Layoutzugriff.
// Die Klassen stehen in app/globals.css.
const HeroDunk = forwardRef(function HeroDunk({ gezeichnet = false }, ref) {
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <Fassung
        geo={HOCH}
        viewBox={VIEWBOX.hoch}
        klasse="hero-dunk-hoch"
        gezeichnet={gezeichnet}
      />
      <Fassung
        geo={QUER}
        viewBox={VIEWBOX.quer}
        klasse="hero-dunk-quer"
        gezeichnet={gezeichnet}
      />
    </div>
  );
});

export default HeroDunk;

// ── Der Korb als Ruhebild ───────────────────────────────────────────────────
//
// Ersetzt `SwishSequence` im Abschluss-Block (45 Rasterbilder, 191 KB, Deckkraft
// 0,28) durch dieselbe Geometrie als Vektor. Ring und Netz, sonst nichts – kein
// Zug, keine Hand, kein Ball.
//
// ⚠️ WARUM NUR RING UND NETZ: Auf der Startseite gab es bisher DREI Momente, in
// denen ein Ball in einen Korb geht (Hero-Ball an der Taste, Landung am Ende der
// Fortschritts-Leiste, SwishSequence hier). Ein Dunk im Hero machte daraus vier.
// Das ist kein Motiv mehr, das ist ein Tick. Der Abschluss-Block bekommt deshalb
// das ZIEL, nicht noch einen Ballwurf: Der Korb steht da, das Angebot steht
// darüber.
export function KorbRuhe({ className = "" }) {
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
  const h = 548 + 22 + rand - y; // bis zur Netzunterkante
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
