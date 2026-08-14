import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";
import { notifyTeamAdminRevoked } from "@/lib/notifyTeamAdminRevoked";

// POST /api/admin/transfer-team-admin – Super-Admin überträgt die Team-Admin-Rolle
// (Gründer) an ein ausgewähltes Mitglied. Der bisherige Admin wird normales Mitglied.
// Body: { token, teamId, playerId }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);
  if (!body.teamId || !body.playerId) return fail("Team- und Spieler-ID nötig", 400);

  await connectDB();
  const team = await Team.findById(body.teamId);
  if (!team) return fail("Team nicht gefunden", 404);

  const newAdmin = await Player.findById(body.playerId);
  if (!newAdmin || String(newAdmin.teamId) !== String(team._id)) {
    return fail("Spieler ist kein Mitglied dieses Teams", 400);
  }

  // Bisherigen Admin (Gründer) zu normalem Mitglied zurückstufen.
  // ⚠️ Der Filter verlangt zusätzlich `teamAdminOf: team._id` (Befund Kai,
  // 14.08.2026): `setteamadmin` macht dieselbe Operation und hatte den
  // Wächter, diese Geschwister-Route nicht. Zeigt `adminPlayerId` auf jemanden,
  // dessen `teamAdminOf` inzwischen auf einen ANDEREN Verein verweist, nähme
  // die ungesicherte Fassung ihm dort die Rechte weg – bei einem Rechteentzug
  // ist die defensive Haltung die richtige. Von zwei Fassungen derselben
  // Operation soll sich die sicherere ausbreiten.
  let entzogen = false;
  if (team.adminPlayerId && String(team.adminPlayerId) !== String(newAdmin._id)) {
    const { modifiedCount } = await Player.updateOne(
      { _id: team.adminPlayerId, teamAdminOf: team._id },
      { $set: { isTeamAdmin: false }, $unset: { teamAdminOf: "" } }
    );
    entzogen = modifiedCount > 0;
  }

  // Neuen Admin setzen
  newAdmin.isTeamAdmin = true;
  newAdmin.teamAdminOf = team._id;
  newAdmin.notifications.push({
    type: "team_admin_granted",
    teamId: team._id,
    teamName: team.teamName,
    teamSlug: team.slug,
    message: `Du bist jetzt Team-Admin von ${team.teamName}.`,
  });
  await newAdmin.save();
  await Team.updateOne({ _id: team._id }, { $set: { adminPlayerId: newAdmin._id } });

  // ⚠️ Die Entzugs-Notiz geht ERST hier raus, nach `newAdmin.save()` (Befund
  // Kai, 14.08.2026). Vorher stand sie direkt beim Entzug – scheitert der Save
  // aber (Mongoose validiert das ganze `notifications`-Array gegen das Enum),
  // wäre der Entzug vollzogen und die Nachricht nennte einen Nachfolger, der
  // nie einer wurde. Genau die Sorte Aussage, gegen die das ganze
  // MUSTER-ZAHLEN-Dokument geschrieben ist. Jetzt existiert der Nachfolger
  // nachweislich, bevor sein Name in einer fremden Glocke steht.
  // Nur bei tatsächlichem Entzug – s. die gleichlautende Stelle in
  // `setteamadmin`.
  if (entzogen) await notifyTeamAdminRevoked(team.adminPlayerId, team, newAdmin);

  return ok({ message: `${newAdmin.firstName} ist jetzt Admin von ${team.teamName}` });
}

export const POST = withErrorHandling(handler);
