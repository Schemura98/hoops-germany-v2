import Player from "@/models/Player";
import Team from "@/models/Team";

// Lässt einen Spieler seinem (neuen) eigenen Team automatisch folgen, sodass
// Team-Inhalte sofort im „Folge ich"-Feed erscheinen. Beidseitig + idempotent
// ($addToSet) und fehlertolerant – darf den Beitritts-Flow nie kippen.
export async function followOwnTeam(playerId, teamId) {
  try {
    if (!playerId || !teamId) return;
    await Player.updateOne(
      { _id: playerId },
      { $addToSet: { followingTeams: teamId } }
    );
    await Team.updateOne(
      { _id: teamId },
      { $addToSet: { followers: playerId } }
    );
  } catch (err) {
    console.error("[followOwnTeam]", err);
  }
}
