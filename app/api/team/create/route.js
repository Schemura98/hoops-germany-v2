import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import League from "@/models/League";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { uniqueSlug } from "@/lib/slug";
import { recordTransfer } from "@/lib/recordTransfer";
import { followOwnTeam } from "@/lib/teamFollow";
import { sendMail } from "@/lib/mailer";
import { teamPendingEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/create – ein eingeloggter Spieler gründet ein Team und wird
// automatisch dessen Admin. Spieler-geführtes Modell (kein eigener Team-Login).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst als Spieler anmelden", 401);
  }

  const teamName = body.teamName?.trim();
  const region = body.region?.trim() || "";
  const bundesland = body.bundesland?.trim() || "";
  const about = body.about?.trim() || "";
  if (!teamName) {
    return fail("Bitte einen Teamnamen angeben", 400);
  }

  await connectDB();

  if (player.isTeamAdmin && player.teamAdminOf) {
    return fail("Du verwaltest bereits ein Team", 409);
  }

  const existing = await Team.findOne({ teamName });
  if (existing) {
    return fail("Dieser Teamname ist bereits vergeben", 409);
  }

  // Optional gewählte Liga aus dem offiziellen Katalog prüfen.
  let leagueId = null;
  if (body.leagueId && mongoose.isValidObjectId(body.leagueId)) {
    const league = await League.findById(body.leagueId).select("_id");
    if (league) leagueId = league._id;
  }

  const slug = await uniqueSlug(Team, teamName);
  const team = await Team.create({
    teamName,
    region,
    bundesland,
    about,
    slug,
    leagueId,
    adminPlayerId: player._id,
    approved: false, // wartet auf Super-Admin-Freigabe
  });

  // Hinweis: Aufnahme in die Liga (League.teams) erfolgt erst bei der Freigabe,
  // damit ein noch nicht freigegebenes Team nicht in Liga-/Tabellen-Ansichten auftaucht.

  // Spieler wird Admin + Mitglied des eigenen Teams (kann es schon verwalten)
  await Player.findByIdAndUpdate(player._id, {
    isTeamAdmin: true,
    teamAdminOf: team._id,
    teamId: team._id,
  });

  await recordTransfer({
    player: player._id,
    fromTeam: player.teamId || null,
    toTeam: team._id,
    type: "found",
  });

  // Gründer folgt automatisch dem eigenen Team (Team-Inhalte im „Folge ich"-Feed).
  await followOwnTeam(player._id, team._id);

  // Super-Admins zur Freigabe benachrichtigen (In-App + Mail). Fehler nicht nach außen geben.
  try {
    const admins = await Player.find({ isSuperAdmin: true }).select("email firstName");
    const founderName = `${player.firstName || ""} ${player.lastName || ""}`.trim();
    if (admins.length) {
      await Player.updateMany(
        { _id: { $in: admins.map((a) => a._id) } },
        {
          $push: {
            notifications: {
              type: "team_pending",
              teamId: team._id,
              teamName: team.teamName,
              teamSlug: team.slug,
              message: `Neues Team „${team.teamName}" wartet auf Freigabe.`,
            },
          },
        }
      );
    }
    const recipients = admins.map((a) => a.email).filter(Boolean);
    const to = recipients.length ? recipients.join(", ") : process.env.SMTP_USER || "info@hoopsgermany.de";
    const mail = teamPendingEmail({
      teamName: team.teamName,
      founderName,
      region: region || bundesland,
      baseUrl: getBaseUrl(req),
    });
    await sendMail({ to, subject: mail.subject, html: mail.html, text: mail.text });
  } catch {
    /* Mail/Notif-Fehler ignorieren – Team ist trotzdem angelegt */
  }

  return ok(
    {
      team: { _id: team._id, teamName: team.teamName, slug: team.slug, region: team.region },
      pending: true,
    },
    201
  );
}

export const POST = withErrorHandling(handler);
