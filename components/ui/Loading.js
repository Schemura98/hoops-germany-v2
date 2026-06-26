import { FaBasketballBall } from "react-icons/fa";

// Einheitlicher Ladezustand (springender Basketball). Plattformweit verwenden.
export default function Loading({ className = "py-16", size = "text-3xl", label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <FaBasketballBall className={`text-brand-500 ${size} animate-bounce`} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}
