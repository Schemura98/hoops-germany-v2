import { PiBasketballBold } from "react-icons/pi";

// Einheitlicher Ladezustand (springender Basketball). Plattformweit verwenden.
export default function Loading({ className = "py-16", size = "text-3xl", label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <PiBasketballBold className={`text-brand-400 ${size} animate-bounce motion-reduce:animate-none`} />
      {label && <p className="text-sm text-mist-400">{label}</p>}
    </div>
  );
}
