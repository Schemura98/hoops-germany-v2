import Link from "next/link";

// Einheitlicher Button für die ganze Plattform.
// variant: primary | secondary | ghost | danger | dangerGhost
// size: sm | md | lg
// href → rendert einen Next-Link mit identischem Styling.
//
// Visuelle Richtung „Anzeigetafel": kein Schatten, kein Verlauf. Die primäre
// Aktion ist die einzige orange Fläche im Blickfeld – deshalb steht dunkler
// Text darauf (navy-950 auf brand-500 = 7,1:1) statt Weiß (2,6:1, wäre unter AA).
// ⚠️ DER RUHEZUSTAND GEHÖRT IN DIE VARIANTE, NICHT IN DEN GRUNDSATZ
// (Entscheidung Patrick, 22.08.2026 – Anlass: Befund am Newsfeed-Composer).
//
// Bis hierher stand `disabled:opacity-60` in der GEMEINSAMEN Klassenkette, galt
// also für alle fünf Varianten. Für die drei OHNE Fläche (secondary, ghost,
// dangerGhost) ist das richtig: Dort dimmt Deckkraft nur Text und Rahmen, es
// entsteht keine neue Farbe.
//
// Für die zwei GEFÜLLTEN Varianten ist es falsch, und zwar sichtbar falsch:
// Eine farbige Fläche mit 60 % Deckkraft MISCHT sich mit dem Grund darunter.
// Gerechnet (nicht geschätzt):
//   primary  brand-500    #F07A27 → #9A5832 über navy-800 · #945024 über navy-950
//   danger   signal-error #E07257 → #90534F über navy-800 · #8B4C41 über navy-950
// Das sind stumpfe Braun- und Rosttöne – also ausgerechnet die Farbfamilie, die
// beim Farbentscheid vom 12.08.2026 zugunsten von Navy + Orange verworfen wurde.
// Sie stehen in keinem Token, niemand hat sie gewählt, und sie ändern sich je
// nachdem, worauf der Knopf zufällig liegt.
//
// Beide gefüllten Varianten benutzen deshalb im Ruhezustand echte
// Systemflächen. navy-600 trägt mist-300 mit 4,50 : 1 und hebt sich mit
// 1,63 : 1 von einem navy-700-Eingabefeld daneben ab – der Knopf bleibt als
// Knopf erkennbar, statt zur rechten Hälfte des Feldes zu werden.
//
// ⚠️ `disabled:opacity-60` steht bewusst NICHT mehr im Grundsatz: Bliebe es
// dort, würde es die neue Fläche gleich wieder mitdimmen, und welche der beiden
// Regeln gewinnt, hinge an der Reihenfolge im erzeugten Stylesheet – also an
// etwas, das man beim Lesen des Codes nicht sieht.
const RUHE_GEFUELLT = "disabled:bg-navy-600 disabled:text-mist-300";
const RUHE_FLACH = "disabled:opacity-60";

const VARIANTS = {
  primary: `bg-brand-500 text-navy-950 hover:bg-brand-400 ${RUHE_GEFUELLT}`,
  secondary:
    `border-[1.5px] border-mist-400 bg-transparent text-paper-50 hover:border-brand-500 hover:text-brand-300 ${RUHE_FLACH}`,
  ghost: `text-mist-300 hover:text-paper-50 ${RUHE_FLACH}`,
  danger: `bg-signal-error text-navy-950 hover:brightness-110 ${RUHE_GEFUELLT}`,
  dangerGhost: `border border-signal-error/60 bg-transparent text-signal-error hover:bg-signal-error/10 ${RUHE_FLACH}`,
};
const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  ...props
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-[color,background-color,border-color,transform,filter] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:pointer-events-none ${
    VARIANTS[variant] || VARIANTS.primary
  } ${SIZES[size] || SIZES.md} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
