import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import LeagueChangeRequest from "@/models/LeagueChangeRequest";
import League from "@/models/League";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getAdminFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { leagueChangeApprovedEmail, leagueChangeRejectedEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/review-league-change-request – Super-Admin genehmigt/lehnt eine
// Ligazuordnungs-Anfrage ab. Bei Genehmigung: Team aus alter League.teams entfernen,
// in neue League.teams aufnehmen, Team.leagueId aktualisieren – konsistent, EIN Schritt.
// TeamSeason-Snapshots werden NIE angefasst (nur Endstand vergangener Saisons).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.requestId) return fail("Anfrage-ID fehlt", 400);
  const approve = !!body.approve;

  await connectDB();

  const request = await LeagueChangeRequest.findById(body.requestId);
  if (!request) return fail("Anfrage nicht gefunden", 404);
  if (request.status !== "ausstehend") {
    return fail("Diese Anfrage wurde bereits bearbeitet.", 409);
  }

  // reviewedBy referenziert "players" – nur bei Super-Admin-Spieler-Login setzen
  // (echter Admin-Account hat keine Player-ID).
  request.reviewedBy = admin.isSuperAdminPlayer ? admin._id : null;
  request.reviewNote = body.reviewNote?.trim() || "";
  request.reviewedAt = new Date();

  if (approve) {
    const requested = await League.findById(request.requestedLeagueId).select("_id finished name");
    if (!requested) return fail("Zielliga nicht mehr vorhanden", 404);
    if (requested.finished) {
      return fail("Zielliga ist inzwischen abgeschlossen – Anfrage kann nicht genehmigt werden.", 400);
    }

    await Team.findByIdAndUpdate(request.team, { $set: { leagueId: requested._id } });
    if (request.currentLeagueId) {
      await League.findByIdAndUpdate(request.currentLeagueId, { $pull: { teams: request.team } });
    }
    await League.findByIdAndUpdate(requested._id, { $addToSet: { teams: request.team } });

    request.status = "genehmigt";
  } else {
    request.status = "abgelehnt";
  }

  await request.save();

  // Anfragenden Team-Admin benachrichtigen: in-app (Glocke) + Bestätigungsmail.
  try {
    if (request.requestedBy) {
      const requestedLeague = await League.findById(request.requestedLeagueId).select("name");
      await Player.updateOne(
        { _id: request.requestedBy },
        {
          $push: {
            notifications: {
              type: approve ? "league_change_approved" : "league_change_rejected",
              message: approve
                ? `Eure Ligazuordnung zu „${requestedLeague?.name || "der Liga"}" wurde genehmigt.`
                : `Eure Ligazuordnungs-Anfrage wurde abgelehnt.${
                    request.reviewNote ? ` Hinweis: ${request.reviewNote}` : ""
                  }`,
              read: false,
              createdAt: new Date(),
            },
          },
        }
      );

      const requester = await Player.findById(request.requestedBy).select("email");
      const team = await Team.findById(request.team).select("teamName");
      if (requester?.email && team) {
        const baseUrl = getBaseUrl(req);
        const mail = approve
          ? leagueChangeApprovedEmail({
              teamName: team.teamName,
              leagueName: requestedLeague?.name || "der Liga",
              reviewNote: request.reviewNote,
              baseUrl,
            })
          : leagueChangeRejectedEmail({
              teamName: team.teamName,
              leagueName: requestedLeague?.name || "der Liga",
              reviewNote: request.reviewNote,
              baseUrl,
            });
        await sendMail({ to: requester.email, subject: mail.subject, html: mail.html, text: mail.text });
      }
    }
  } catch {
    /* Benachrichtigung/Mail ist best-effort */
  }

  return ok({ request });
}

export const POST = withErrorHandling(handler);
