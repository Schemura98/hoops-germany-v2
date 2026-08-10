"use client";

import { useInView } from "@/lib/useInView";

// Scroll-/Load-Reveal: blendet Inhalt einmalig ein (fade + leichter Versatz),
// sobald er in den Viewport kommt. Für Elemente, die schon beim Laden im
// sichtbaren Bereich stehen (z.B. der Hero), löst das praktisch sofort aus –
// dieselbe Komponente liefert so auch den gestaffelten Page-Load-Moment.
// Animiert ausschließlich transform/opacity. Reduzierte Bewegung: Versatz
// entfällt komplett, nur das Opacity-Fade bleibt (Bewegung aus, Opacity ok).
const OFFSET = {
  up: "translate-y-5",
  left: "-translate-x-6",
  right: "translate-x-6",
  pop: "scale-75",
  none: "",
};

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  duration = 700,
  direction = "up",
  className = "",
  children,
  ...props
}) {
  const [ref, inView] = useInView();
  const offset = OFFSET[direction] ?? OFFSET.up;

  return (
    <Tag
      ref={ref}
      className={`transition-all ease-out-strong motion-reduce:transition-opacity motion-reduce:!duration-300 motion-reduce:!translate-x-0 motion-reduce:!translate-y-0 motion-reduce:!scale-100 ${
        inView ? "opacity-100 translate-x-0 translate-y-0 scale-100" : `opacity-0 ${offset}`
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        ...(inView && delay ? { transitionDelay: `${delay}ms` } : null),
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
