import Link from "next/link";

// Einheitlicher Button für die ganze Plattform.
// variant: primary | secondary | ghost | danger | dangerGhost
// size: sm | md | lg
// href → rendert einen Next-Link mit identischem Styling.
const VARIANTS = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  secondary: "border border-gray-300 bg-white text-gray-700 hover:border-brand-500 hover:text-brand-600",
  ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  dangerGhost: "border border-red-300 bg-white text-red-700 hover:bg-red-50",
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
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none ${
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
