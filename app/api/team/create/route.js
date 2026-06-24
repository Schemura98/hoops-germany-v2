import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import League from "@/models/League";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { uniqueSlug } from "@/lib/slug";
import { recordTransfer } from "@/lib/recordTransfer";
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
  });

  // Team in die Liga aufnehmen.
  if (leagueId) {
    await League.findByIdAndUpdate(leagueId, { $addToSet: { teams: team._id } });
  }

  // Spieler wird Admin + Mitglied des eigenen Teams
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

  return ok(
    {
      team: { _id: team._id, teamName: team.teamName, slug: team.slug, region: team.region },
    },
    201
  );
}

export const POST = withErrorHandling(handler);
