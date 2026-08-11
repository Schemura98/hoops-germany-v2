// Wiederverwendbarer Avatar/Logo-Platzhalter.
// Zeigt das Bild, wenn vorhanden – sonst ein aus dem Namen generiertes
// Initialen-Logo mit deterministischer Farbe (für Spieler & Teams).

// Gedaempfte, warme Fuellfarben statt der bunten 500er-Toene: Auf dem dunklen
// Grund waren die alten Werte die hellsten Flaechen der Seite und zogen den
// Blick von den Inhalten weg. Alle Werte tragen paper-50 mit >= 6:1.
const PALETTE = [
  "bg-[#6B4A2F]",
  "bg-[#7A3F2E]",
  "bg-[#5E5233]",
  "bg-[#3F5A4A]",
  "bg-[#33505E]",
  "bg-[#4A3F63]",
  "bg-[#6B3F4E]",
  "bg-[#4A4A44]",
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
  const shape = square ? "rounded-md" : "rounded-full";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || ""}
        className={`${className} ${shape} object-cover flex-shrink-0 bg-ink-800 ${ring}`}
      />
    );
  }

  return (
    <span
      className={`${className} ${shape} ${colorFor(name)} text-paper-50 font-bold flex items-center justify-center flex-shrink-0 ${textClass} ${ring}`}
    >
      {initialsFor(name)}
    </span>
  );
}
