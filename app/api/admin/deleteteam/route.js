import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Match from "@/models/Match";
import Tryout from "@/models/Tryout";
import League from "@/models/League";
import Player from "@/models/Player";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/deleteteam – Team löschen (Admin) inkl. Cascade-Cleanup,
// damit keine verwaisten Referenzen (Matches/Tryouts/Liga/Spieler) zurückbleiben.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.teamId) return fail("Team-ID fehlt", 400);

  await connectDB();
  const team = await Team.findById(body.teamId);
  if (!team) return fail("Team nicht gefunden", 404);
  const teamId = team._id;

  // 1. Spiele des Teams (gegen jeden Gegner) ermitteln und löschen.
  const matches = await Match.find({
    $or: [{ teamA: teamId }, { teamB: teamId }],
  }).select("_id");
  const matchIds = matches.map((m) => m._id);
  if (matchIds.length) await Match.deleteMany({ _id: { $in: matchIds } });

  // 2. Tryouts des Teams löschen.
  await Tryout.deleteMany({ teamId });

  // 3. Liga-Referenzen bereinigen (Team aus teams[], gelöschte Spiele aus matches[]).
  await League.updateMany({ teams: teamId }, { $pull: { teams: teamId } });
  if (matchIds.length) {
    await League.updateMany(
      { matches: { $in: matchIds } },
      { $pull: { matches: { $in: matchIds } } }
    );
  }

  // 4. Spieler-Referenzen lösen (Mitgliedschaft, Admin-Rolle, Anfrage, Folgen).
  await Player.updateMany({ teamId }, { $unset: { teamId: "" } });
  await Player.updateMany(
    { teamAdminOf: teamId },
    { $unset: { teamAdminOf: "", isTeamAdmin: "" } }
  );
  await Player.updateMany({ teamJoinRequest: teamId }, { $unset: { teamJoinRequest: "" } });
  await Player.updateMany(
    { followingTeams: teamId },
    { $pull: { followingTeams: teamId } }
  );

  // Den toten Verweis aus Benachrichtigungen nehmen (Befund Kai, 14.08.2026).
  // `teamSlug` wird beim Versand als Momentaufnahme in die Notification
  // geschrieben. Ohne diese Zeile bleibt er nach der Löschung stehen,
  // `notificationHref` bildet weiter `/team/team-detail/<slug>` – und der Klick
  // landet auf einer 404 statt auf dem Fallback, den es für genau diesen Fall
  // gibt. Der EINTRAG bleibt bewusst erhalten: „X hat dich eingeladen" ist
  // Historie, auch wenn der Verein weg ist. Nur der Weg dorthin verschwindet.
  await Player.updateMany(
    { "notifications.teamId": teamId },
    { $unset: { "notifications.$[n].teamSlug": "" } },
    { arrayFilters: [{ "n.teamId": teamId }] }
  );

  // Dasselbe für die gelöschten Spiele (Befund A3 von Kai): Schritt 1 dieser
  // Route entfernt alle Partien des Teams, ließ `matchId` auf den
  // Benachrichtigungen aber stehen. `notificationHref` prüft `own_stats` und
  // `match_result` VOR dem generischen `teamSlug`-Zweig – wer „Deine Zahlen
  // stehen" für eines dieser Spiele bekommen hat, klickte weiter auf ein
  // gelöschtes Spiel. Derselbe tote Weg, nur über das andere Feld.
  if (matchIds.length) {
    await Player.updateMany(
      { "notifications.matchId": { $in: matchIds } },
      { $unset: { "notifications.$[m].matchId": "" } },
      { arrayFilters: [{ "m.matchId": { $in: matchIds } }] }
    );
  }

  // 5. Team selbst löschen.
  await Team.findByIdAndDelete(teamId);

  return ok({
    message: "Team gelöscht",
    cleanup: { matches: matchIds.length },
  });
}

export const POST = withErrorHandling(handler);
