import Avatar from "@/components/Avatar";

// Spieler-Avatar (Bild-Fallback auf generiertes Initialen-Logo mit Namensfarbe).
export default function PlayerAvatar({ player, className = "h-10 w-10" }) {
  const name = `${player?.firstName || ""} ${player?.lastName || ""}`.trim();
  return <Avatar name={name} src={player?.profileImage} className={className} />;
}
