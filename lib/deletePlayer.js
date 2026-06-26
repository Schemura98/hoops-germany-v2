import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Post from "@/models/Post";
import Match from "@/models/Match";
import TransferEvent from "@/models/TransferEvent";

// Löscht einen Spieler samt aller abhängigen Referenzen (Cascade).
// Gemeinsam genutzt von Self-Service (/api/player/delete-account) und Admin
// (/api/admin/deleteplayer).
//
// Gründer-Regel: Ist der Spieler Team-Gründer (Team.adminPlayerId), wird die
// Gründer-Rolle an einen vorhandenen Co-Admin übertragen. Gibt es keinen,
// wird das Löschen verweigert ({ ok:false, code:"FOUNDER_BLOCK" }).
//
// Rückgabe: { ok:true } | { ok:false, code, message }
export async function deletePlayerCascade(playerId) {
  await connectDB();

  const player = await Player.findById(playerId);
  if (!player) return { ok: false, code: "NOT_FOUND", message: "Spieler nicht gefunden" };

  // Gründer-Fall behandeln (vor dem Löschen)
  const foundedTeams = await Team.find({ adminPlayerId: playerId });
  for (const team of foundedTeams) {
    const coAdmin = await Player.findOne({
      _id: { $ne: playerId },
      teamId: team._id,
      isTeamAdmin: true,
      teamAdminOf: team._id,
    });
    if (!coAdmin) {
      return {
        ok: false,
        code: "FOUNDER_BLOCK",
        message: `Du bist Haupt-Admin von „${team.teamName}". Ernenne zuerst im Team-Admin-Panel (Kader) ein anderes Mitglied zum Admin – danach kannst du dein Konto löschen.`,
        teamName: team.teamName,
      };
    }
    // Gründer-Rolle übertragen (Co-Admin hat bereits isTeamAdmin + teamAdminOf)
    await Team.updateOne({ _id: team._id }, { $set: { adminPlayerId: coAdmin._id } });
  }

  // ----- Cascade-Aufräumarbeiten -----
  await Promise.all([
    // Eigene Beiträge
    Post.deleteMany({ player: playerId }),
    // Aus Follower-/Following-Listen anderer Spieler entfernen
    Player.updateMany(
      { $or: [{ followers: playerId }, { following: playerId }] },
      { $pull: { followers: playerId, following: playerId } }
    ),
    // Benachrichtigungen, die von diesem Spieler stammen, entfernen
    Player.updateMany(
      { "notifications.fromPlayerId": playerId },
      { $pull: { notifications: { fromPlayerId: playerId } } }
    ),
    // Aus Team-Follower-Listen entfernen
    Team.updateMany({ followers: playerId }, { $pull: { followers: playerId } }),
    // Beanspruchte Kader-Slots freigeben
    Team.updateMany(
      { "rosterSlots.claimedBy": playerId },
      { $set: { "rosterSlots.$[s].claimedBy": null, "rosterSlots.$[s].status": "empty" } },
      { arrayFilters: [{ "s.claimedBy": playerId }] }
    ),
    // Spiel-Statistiken: Spielerbezug lösen, Verlauf (playerName) bleibt erhalten
    Match.updateMany(
      { "playerStats.player": playerId },
      { $set: { "playerStats.$[e].player": null } },
      { arrayFilters: [{ "e.player": playerId }] }
    ),
    // Transfer-Historie dieses Spielers entfernen
    TransferEvent.deleteMany({ player: playerId }),
  ]);

  await Player.deleteOne({ _id: playerId });

  return { ok: true };
}
