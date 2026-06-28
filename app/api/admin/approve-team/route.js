import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import League from "@/models/League";
import Match from "@/models/Match";
import Tryout from "@/models/Tryout";
import { getAdminFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { teamApprovedEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/approve-team – neues Team freigeben oder ablehnen (Admin).
// Body: { token, teamId, approve: boolean }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.teamId) return fail("Team-ID fehlt", 400);

  await connectDB();
  const team = await Team.findById(body.teamId);
  if (!team) return fail("Team nicht gefunden", 404);

  const founder = team.adminPlayerId
    ? await Player.findById(team.adminPlayerId).select("email firstName")
    : null;

  // ---- Ablehnen: Team verwerfen ----
  if (body.approve === false) {
    await Promise.all([
      Player.updateMany({ teamId: team._id }, { $unset: { teamId: "" } }),
      Player.updateMany(
        { teamAdminOf: team._id },
        { $unset: { teamAdminOf: "", isTeamAdmin: "" } }
      ),
      Match.deleteMany({ $or: [{ teamA: team._id }, { teamB: team._id }] }),
      Tryout.deleteMany({ teamId: team._id }),
    ]);
    if (founder) {
      await Player.updateOne(
        { _id: founder._id },
        {
          $push: {
            notifications: {
              type: "team_pending",
              teamName: team.teamName,
              message: `Dein Team „${team.teamName}" wurde leider nicht freigegeben. Bei Fragen melde dich beim Support.`,
            },
          },
        }
      );
    }
    await Team.deleteOne({ _id: team._id });
    return ok({ message: "Team abgelehnt und entfernt" });
  }

  // ---- Freigeben ----
  team.approved = true;
  await team.save();
  // Jetzt erst in die Liga aufnehmen (war beim Anlegen aufgeschoben).
  if (team.leagueId) {
    await League.findByIdAndUpdate(team.leagueId, { $addToSet: { teams: team._id } });
  }
  if (founder) {
    await Player.updateOne(
      { _id: founder._id },
      {
        $push: {
          notifications: {
            type: "team_approved",
            teamId: team._id,
            teamName: team.teamName,
            teamSlug: team.slug,
            message: `Dein Team „${team.teamName}" wurde freigeschaltet und ist jetzt öffentlich sichtbar.`,
          },
        },
      }
    );
    if (founder.email) {
      try {
        const mail = teamApprovedEmail({ teamName: team.teamName, slug: team.slug, baseUrl: getBaseUrl(req) });
        await sendMail({ to: founder.email, subject: mail.subject, html: mail.html, text: mail.text });
      } catch (err) {
        // Mail-Fehler nicht nach außen geben, aber protokollieren (Diagnose).
        console.error("[TEAM APPROVED MAIL ERROR]", founder.email, err?.message || err);
      }
    } else {
      console.warn("[TEAM APPROVED] Kein Gründer/Mail für Team", String(team._id), team.teamName);
    }
  }
  return ok({ message: "Team freigegeben" });
}

export const POST = withErrorHandling(handler);
