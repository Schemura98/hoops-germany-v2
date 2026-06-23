import Link from "next/link";

// Wiederverwendbarer Button im Design-System (Orange-Primärfarbe).
const variants = {
  primary: "bg-brand-500 hover:bg-brand-600 text-white",
  secondary: "border border-gray-300 hover:border-brand-500 text-gray-700",
  ghost: "text-gray-600 hover:text-brand-600",
};

export default function Button({
  children,
  variant = "primary",
  href,
  className = "",
  ...props
}) {
  const classes = `inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors ${
    variants[variant] || variants.primary
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
