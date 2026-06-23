// Wiederverwendbarer Avatar/Logo-Platzhalter.
// Zeigt das Bild, wenn vorhanden – sonst ein aus dem Namen generiertes
// Initialen-Logo mit deterministischer Farbe (für Spieler & Teams).

const PALETTE = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-blue-600",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-slate-600",
  "bg-red-500",
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function colorFor(name) {
  return PALETTE[hash(String(name || "?")) % PALETTE.length];
}

export function initialsFor(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name,
  src,
  className = "h-10 w-10",
  textClass = "text-sm",
  square = false,
  ring = "",
}) {
  const shape = square ? "rounded-2xl" : "rounded-full";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || ""}
        className={`${className} ${shape} object-cover flex-shrink-0 bg-white ${ring}`}
      />
    );
  }

  return (
    <span
      className={`${className} ${shape} ${colorFor(name)} text-white font-bold flex items-center justify-center flex-shrink-0 ${textClass} ${ring}`}
    >
      {initialsFor(name)}
    </span>
  );
}
