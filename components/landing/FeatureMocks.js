"use client";

import { useEffect, useState } from "react";
import { FaHeart, FaRegComment, FaMapMarkerAlt } from "react-icons/fa";
import CountUp from "@/components/ui/CountUp";
import { useInView } from "@/lib/useInView";

// Produkt-Miniaturen der Feature-Strecke „Ein Spielzug in sechs Szenen"
// (Konzept: docs/LANDING-KONZEPT-2026-08-11.md, Stufe 1).
//
// Leitgedanke: Jede Karte spielt beim Ins-Bild-Scrollen EINMAL ihre echte
// Funktion vor, statt nur einzublenden – der Kader füllt sich Slot für Slot,
// die Tabelle sortiert sich neu, ein Ergebnis wird von beiden Teams getrennt
// gemeldet und dann bestätigt. Bewegung erklärt hier etwas, sie schmückt nicht.
//
// Technik bewusst schlicht: ein `useInView`-Trigger je Karte (threshold 0.4,
// einmalig – dasselbe Muster wie CountUp/Reveal), danach CSS-Transitions mit
// gestaffelter Verzögerung bzw. wenige setTimeout-Schritte. Kein Scroll-
// Listener, kein rAF pro Karte, ausschließlich transform/opacity/clip-path.
//
// prefers-reduced-motion: Jede Karte rendert sofort ihren Endzustand – Werte,
// Reihenfolge und Beschriftungen sind dann identisch zur bewegten Fassung.

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)"; // = ease-out-strong aus der Tailwind-Konfiguration

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

// Gemeinsamer Einstieg jeder Karte: sichtbar geworden UND Bewegung erlaubt.
function useChoreography() {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const reduced = usePrefersReducedMotion();
  return [ref, inView && !reduced, reduced];
}

// Mehrstufige Szene: liefert den erreichten Schritt (0 = noch nichts).
// Bei reduzierter Bewegung steht sofort der letzte Schritt.
function useSequence(active, reduced, marks) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced) {
      setStep(marks.length);
      return;
    }
    if (!active) return;
    const timers = marks.map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced]);
  return step;
}

// Gemeinsamer Karten-Rahmen für alle Mini-Mockups.
function MockFrame({ innerRef, children }) {
  return (
    <div
      ref={innerRef}
      className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/60 p-5 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {children}
    </div>
  );
}

// Szene 1 – „Aufstellung": Die Zahlen zählen hoch, sobald man das Profil sieht.
// Bereits vorhandenes Verhalten (CountUp), bewusst unverändert übernommen.
export function ProfileMock() {
  return (
    <MockFrame>
      <div className="flex items-center gap-3 mb-5">
        <span className="h-12 w-12 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
          MB
        </span>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">Max Bauer</p>
          <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide mt-0.5">
            Point Guard
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
        {[
          [18.4, "PTS"],
          [6.1, "AST"],
          [4.2, "REB"],
        ].map(([v, l]) => (
          <div key={l}>
            <p className="font-black text-lg text-gray-900">
              <CountUp value={v} decimals={1} />
            </p>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

// Szene 2 – „Kader komplett": Die Zeilen erscheinen nacheinander, wie ein Kader,
// der Spieler für Spieler eingetragen wird.
export function RosterMock() {
  const [ref, animate, reduced] = useChoreography();
  const rows = [
    { n: 4, name: "Jonas Weber", pos: "SG" },
    { n: 11, name: "Elif Kaya", pos: "PF" },
    { n: 23, name: "Tom Richter", pos: "C" },
  ];
  const shown = animate || reduced;
  return (
    <MockFrame innerRef={ref}>
      <div className="flex items-center gap-3 mb-4">
        <span className="h-9 w-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
          TB
        </span>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">Test Baskets</p>
          <p className="text-[11px] text-gray-500">
            <CountUp value={12} duration={500} /> Spieler im Kader
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div
            key={r.n}
            className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-2.5 py-1.5"
            style={{
              opacity: shown ? 1 : 0,
              transform: shown ? "translateY(0)" : "translateY(8px)",
              transition: reduced
                ? "none"
                : `opacity 400ms ${EASE} ${i * 150}ms, transform 400ms ${EASE} ${i * 150}ms`,
            }}
          >
            <span className="h-6 w-6 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-gray-600 flex items-center justify-center flex-shrink-0">
              {r.n}
            </span>
            <span className="text-xs font-medium text-gray-800 flex-1 truncate">{r.name}</span>
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded flex-shrink-0">
              {r.pos}
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

// Szene 3 – „Doppelt bestätigt" (Signature-Szene): Beide Teams melden getrennt,
// erst danach steht der Endstand. Genau das ist der Unterschied der Plattform zu
// einer Tabelle, die einer allein pflegt.
export function MatchMock() {
  const [ref, animate, reduced] = useChoreography();
  // Schritte: 1 Team A gemeldet · 2 Team B gemeldet · 3 Tags weg · 4 Endstand · 5 bestätigt
  const step = useSequence(animate, reduced, [0, 450, 900, 950, 1150]);

  const tagBase =
    "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full";
  const fade = (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    // Verzögerung bewusst Teil der Kurzform: transition + transitionDelay
    // gemischt löst in React eine Shorthand-Warnung aus.
    transition: reduced ? "none" : `opacity 250ms ${EASE} ${delay}ms`,
  });

  return (
    <MockFrame innerRef={ref}>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex flex-col items-center gap-1.5 w-16">
          <span className="h-10 w-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
            TB
          </span>
          <span className="text-[11px] font-semibold text-gray-600 text-center">Test Baskets</span>
          <span
            aria-hidden="true"
            className={`${tagBase} -bottom-4 bg-slate-100 text-slate-600`}
            style={fade(step >= 1 && step < 3)}
          >
            eingereicht
          </span>
        </div>

        <div className="text-center">
          <p
            className="font-black text-2xl text-gray-900 tracking-tight"
            style={{
              opacity: step >= 4 ? 1 : 0,
              transform: step >= 4 ? "scale(1)" : "scale(0.92)",
              transition: reduced ? "none" : `opacity 350ms ${EASE}, transform 350ms ${EASE}`,
            }}
          >
            78 : 65
          </p>
          <span
            className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={fade(step >= 5)}
          >
            Bestätigt
          </span>
        </div>

        <div className="relative flex flex-col items-center gap-1.5 w-16">
          <span className="h-10 w-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
            RH
          </span>
          <span className="text-[11px] font-semibold text-gray-600 text-center">Rhein Hawks</span>
          <span
            aria-hidden="true"
            className={`${tagBase} -bottom-4 bg-slate-100 text-slate-600`}
            style={fade(step >= 2 && step < 3)}
          >
            eingereicht
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 border-t border-gray-100 pt-3">
        <FaMapMarkerAlt className="text-brand-400 flex-shrink-0" /> Sa, 20:00 · Sporthalle Nord
      </div>
    </MockFrame>
  );
}

// Szene 4 – „Tabelle sortiert sich": Platz 1 und 2 starten vertauscht und
// tauschen per transform die Plätze – kein DOM-Umbau, also kein Layout-Sprung.
// In rem statt px: h-8 (2rem) + space-y-1 (0.25rem). Hart kodierte 36px sind bei
// vergrößerter Schrift falsch - ab 150% überlappten die vertauschten Zeilen sichtbar
// (Befund Tobias, 12.08.2026). rem wächst mit der Zeilenhöhe mit.
const TABLE_ROW_SHIFT = "2.25rem";

export function TableMock() {
  const [ref, animate, reduced] = useChoreography();
  const rows = [
    { pos: 1, team: "Rhein Hawks", sp: 14, pkt: 26 },
    { pos: 2, team: "Test Baskets", sp: 14, pkt: 24 },
    { pos: 3, team: "Köln Comets", sp: 14, pkt: 21 },
  ];
  const sorted = animate || reduced;
  const offset = (pos) => {
    if (sorted) return "0px";
    if (pos === 1) return TABLE_ROW_SHIFT;
    if (pos === 2) return `-${TABLE_ROW_SHIFT}`;
    return "0px";
  };

  return (
    <MockFrame innerRef={ref}>
      <div className="grid grid-cols-[1.5rem_1fr_2.5rem_2.5rem] gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wide px-1 mb-1.5">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">Sp</span>
        <span className="text-center">Pkt</span>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div
            key={r.pos}
            className={`grid h-8 grid-cols-[1.5rem_1fr_2.5rem_2.5rem] gap-1 items-center rounded-lg px-1 ${
              r.pos === 1 && sorted ? "bg-brand-50" : ""
            }`}
            style={{
              transform: `translateY(${offset(r.pos)})`,
              transition: reduced
                ? "none"
                : `transform 550ms ${EASE}, background-color 300ms ease-out 550ms`,
            }}
          >
            <span
              className={`text-xs font-black ${
                r.pos === 1 && sorted ? "text-brand-600" : "text-gray-500"
              }`}
            >
              {r.pos}
            </span>
            <span className="text-xs font-medium text-gray-800 truncate">{r.team}</span>
            <span className="text-xs text-center text-gray-500">{r.sp}</span>
            <CountUp value={r.pkt} className="text-xs text-center font-bold text-gray-900" />
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

// Szene 5 – „Der nächste Zug": Die Bewerbungen trudeln nacheinander ein.
export function ScoutingMock() {
  const [ref, animate, reduced] = useChoreography();
  const shown = animate || reduced;
  return (
    <MockFrame innerRef={ref}>
      <span className="inline-block text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
        Tryout offen
      </span>
      <p className="text-sm font-bold text-gray-900 mb-1">Sucht: Point Guard, Flügel</p>
      <p className="text-xs text-gray-500 mb-4">Test Baskets · Bezirksliga NRW</p>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex -space-x-2">
          {["EK", "TR", "JW"].map((i, idx) => (
            <span
              key={i}
              className="h-7 w-7 rounded-full bg-slate-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "scale(1)" : "scale(0.6)",
                transition: reduced
                  ? "none"
                  : `opacity 350ms ${EASE} ${idx * 150}ms, transform 350ms ${EASE} ${idx * 150}ms`,
              }}
            >
              {i}
            </span>
          ))}
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          <CountUp value={5} duration={400} /> Bewerbungen
        </span>
      </div>
    </MockFrame>
  );
}

// Szene 6 – „Nachspielzeit": Der Beitrag schreibt sich, dann kommen die Reaktionen.
export function FeedMock() {
  const [ref, animate, reduced] = useChoreography();
  const step = useSequence(animate, reduced, [0, 350, 650]);
  const written = (from) => ({
    clipPath: step >= from ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
    transition: reduced ? "none" : `clip-path 500ms ${EASE}`,
  });
  return (
    <MockFrame innerRef={ref}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="h-8 w-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0">
          MB
        </span>
        <div>
          <p className="text-xs font-bold text-gray-900">Max Bauer</p>
          <p className="text-[10px] text-gray-500">vor 2 Std</p>
        </div>
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-2 rounded-full bg-gray-100 w-full" style={written(1)} />
        <div className="h-2 rounded-full bg-gray-100 w-2/3" style={written(2)} />
      </div>
      <div className="flex items-center gap-4 text-gray-500 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <FaHeart
            className="text-brand-500"
            style={{
              transform: step >= 3 ? "scale(1)" : "scale(0.7)",
              transition: reduced ? "none" : `transform 200ms ${EASE}`,
            }}
          />{" "}
          <CountUp value={24} duration={300} />
        </span>
        <span
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{
            opacity: step >= 3 ? 1 : 0,
            transition: reduced ? "none" : `opacity 250ms ${EASE} 250ms`,
          }}
        >
          <FaRegComment /> 6
        </span>
      </div>
    </MockFrame>
  );
}
