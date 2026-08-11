import Link from "next/link";

// Einheitlicher Button für die ganze Plattform.
// variant: primary | secondary | ghost | danger | dangerGhost
// size: sm | md | lg
// href → rendert einen Next-Link mit identischem Styling.
//
// Visuelle Richtung „Anzeigetafel": kein Schatten, kein Verlauf. Die primäre
// Aktion ist die einzige orange Fläche im Blickfeld – deshalb steht dunkler
// Text darauf (navy-950 auf brand-500 = 7,1:1) statt Weiß (2,6:1, wäre unter AA).
const VARIANTS = {
  primary: "bg-brand-500 text-navy-950 hover:bg-brand-400",
  secondary:
    "border-[1.5px] border-mist-400 bg-transparent text-paper-50 hover:border-brand-500 hover:text-brand-300",
  ghost: "text-mist-300 hover:text-paper-50",
  danger: "bg-signal-error text-navy-950 hover:brightness-110",
  dangerGhost: "border border-signal-error/60 bg-transparent text-signal-error hover:bg-signal-error/10",
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
  const cls = `inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-[color,background-color,border-color,transform,filter] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:opacity-60 disabled:pointer-events-none ${
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
