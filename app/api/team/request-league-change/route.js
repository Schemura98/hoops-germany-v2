import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import LeagueChangeRequest from "@/models/LeagueChangeRequest";
import Player from "@/models/Player";
import { getTeamWithRole } from "@/lib/serverAuth";
import { hasTeamPermission } from "@/lib/teamPermissions";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/request-league-change – Team-Admin fragt eine NEUE offizielle
// Liga-Zuordnung an (statt sie direkt zu speichern). Erst nach Super-Admin-Freigabe
// wird Team.leagueId/League.teams tatsächlich geändert (siehe review-league-change-request).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const role = await getTeamWithRole(token);
  if (!role || !hasTeamPermission(role.team, role.playerId, "einstellungen")) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }
  const { team, playerId } = role;

  if (!body.requestedLeagueId || !mongoose.isValidObjectId(body.requestedLeagueId)) {
    return fail("Bitte eine Ziel-Liga auswählen", 400);
  }

  await connectDB();

  const requested = await League.findById(body.requestedLeagueId).select(
    "name season ageGroup gender finished"
  );
  if (!requested) return fail("Liga nicht gefunden", 404);
  if (requested.finished) {
    return fail("Diese Liga ist bereits abgeschlossen und kann nicht angefragt werden.", 400);
  }
  if (team.leagueId && String(team.leagueId) === String(requested._id)) {
    return fail("Das ist bereits eure aktuelle Liga.", 400);
  }

  // Passt die Zielliga fachlich zur aktuellen (Altersklasse + Kategorie)? Nur relevant,
  // wenn das Team bereits einer Liga zugeordnet ist.
  if (team.leagueId) {
    const current = await League.findById(team.leagueId).select("ageGroup gender");
    if (current) {
      if (current.ageGroup !== requested.ageGroup) {
        return fail(
          `Die Zielliga passt nicht zur aktuellen Altersklasse (${current.ageGroup}).`,
          400
        );
      }
      if (current.gender !== requested.gender) {
        return fail(`Die Zielliga passt nicht zur aktuellen Kategorie (${current.gender}).`, 400);
      }
    }
  }

  const openExisting = await LeagueChangeRequest.findOne({
    team: team._id,
    status: "ausstehend",
  });
  if (openExisting) {
    return fail(
      "Es gibt bereits eine offene Ligazuordnungs-Anfrage für dieses Team. Bitte zuerst stornieren.",
      409
    );
  }

  const requestingPlayerId = playerId || team.adminPlayerId;
  const request = await LeagueChangeRequest.create({
    team: team._id,
    currentLeagueId: team.leagueId || null,
    requestedLeagueId: requested._id,
    season: requested.season || "",
    requestedBy: requestingPlayerId,
    note: body.note?.trim() || "",
    status: "ausstehend",
  });

  // Super-Admins in-app benachrichtigen (analog team_pending).
  try {
    const admins = await Player.find({ isSuperAdmin: true }).select("_id");
    if (admins.length) {
      await Player.updateMany(
        { _id: { $in: admins.map((a) => a._id) } },
        {
          $push: {
            notifications: {
              type: "league_change_request",
              teamId: team._id,
              teamName: team.teamName,
              teamSlug: team.slug,
              message: `${team.teamName} möchte der Liga „${requested.name}" zugeordnet werden.`,
              read: false,
              createdAt: new Date(),
            },
          },
        }
      );
    }
  } catch {
    /* Benachrichtigung ist best-effort */
  }

  return ok({ request }, 201);
}

export const POST = withErrorHandling(handler);
