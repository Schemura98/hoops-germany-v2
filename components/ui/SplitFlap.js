"use client";

import { useInView } from "@/lib/useInView";

// Splitflap-Moment: Ein Wort klappt um, wie auf einer mechanischen
// Anzeigetafel (Konzept docs/WOW-KONZEPT-2026-08-12.md, Stufe A.2).
//
// Warum das Wort und nicht das einzelne Zeichen: Zeichen-für-Zeichen ist auf
// 375px Breite eine Unruhe, die den Text schwerer lesbar macht, statt ihn zu
// betonen. Ein Wort, ein Umschlag, einmal – das liest sich als Anzeigetafel,
// nicht als Spielerei.
//
// Bewusst zurückhaltend: Der Effekt gehört an genau EINE Stelle je Seite. Sobald
// mehrere Wörter klappen, ist es Deko ohne Bedeutung.
//
// Reduzierte Bewegung: `useInView` meldet dort sofort `true` und die
// Animationsklasse entfällt – das Wort steht einfach da. Kein Zwischenzustand,
// in dem etwas unsichtbar bleibt.
export default function SplitFlap({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });

  return (
    // perspective am Elternteil: Ohne sie ist rotateX eine reine Stauchung
    // ohne Tiefe – es sieht dann aus, als würde der Text zusammengedrückt,
    // nicht als würde eine Klappe umschlagen.
    <span ref={ref} className={`inline-block [perspective:600px] ${className}`}>
      <span
        className={`inline-block origin-top will-change-transform motion-reduce:animate-none ${
          inView ? "animate-flap" : "opacity-0"
        }`}
        style={inView ? { animationDelay: `${delay}ms` } : undefined}
      >
        {children}
      </span>
    </span>
  );
}
