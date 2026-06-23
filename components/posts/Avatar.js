// Kleiner Avatar mit Bild-Fallback auf Initialen.
// Größe über className steuern (z.B. "h-10 w-10"), damit Tailwind die Klassen sieht.
export default function Avatar({ player, className = "h-10 w-10" }) {
  const initials =
    `${player?.firstName?.[0] || ""}${player?.lastName?.[0] || ""}`.toUpperCase() ||
    "?";

  if (player?.profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={player.profileImage}
        alt={initials}
        className={`${className} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <span
      className={`${className} rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </span>
  );
}
