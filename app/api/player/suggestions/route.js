import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { positionLabel } from "@/lib/constants";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const PLAYER_LIMIT = 5;
const TEAM_LIMIT = 3;

// POST /api/player/suggestions – Folge-Vorschläge: Spieler/Vereine aus der eigenen
// Region (Bundesland) bzw. Liga, denen man noch nicht folgt. Hilft v.a. neuen
// Nutzern gegen den „leeren Feed". Sortiert nach Reichweite (Follower-Zahl).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const me = await getPlayerFromToken(getTokenFromRequest(req, body.token));
  if (!me) {
    return fail("Bitte zuerst anmelden", 401);
  }

  await connectDB();
  const byFollowers = (a, b) => (b.followers?.length || 0) - (a.followers?.length || 0);

  // ----- Spieler -----
  const excludePlayers = [me._id, ...(me.following || [])];
  const pBase = { _id: { $nin: excludePlayers }, slug: { $exists: true, $ne: null } };
  const pSelect = "firstName lastName slug profileImage bundesland position followers";

  let players = me.bundesland
    ? await Player.find({ ...pBase, bundesland: me.bundesland }).select(pSelect).limit(40)
    : [];
  // Auffüllen mit beliebigen (z.B. wenn kein/leeres Bundesland oder zu wenige).
  if (players.length < PLAYER_LIMIT) {
    const have = new Set(players.map((p) => String(p._id)));
    const more = await Player.find({
      _id: { $nin: [...excludePlayers, ...players.map((p) => p._id)] },
      slug: { $exists: true, $ne: null },
    })
      .select(pSelect)
      .limit(40);
    players = [...players, ...more.filter((p) => !have.has(String(p._id)))];
  }
  const playerOut = players
    .sort(byFollowers)
    .slice(0, PLAYER_LIMIT)
    .map((p) => ({
      _id: p._id,
      firstName: p.firstName,
      lastName: p.lastName,
      slug: p.slug,
      profileImage: p.profileImage,
      subtitle: p.position ? positionLabel(p.position) : p.bundesland || "",
      followersCount: (p.followers || []).length,
    }));

  // ----- Teams (Bundesland ODER gleiche Liga) -----
  let myLeague = null;
  if (me.teamId) {
    const t = await Team.findById(me.teamId).select("leagueId");
    myLeague = t?.leagueId || null;
  }
  const excludeTeams = [me.teamId, ...(me.followingTeams || [])].filter(Boolean);
  const tBase = {
    _id: { $nin: excludeTeams },
    approved: { $ne: false },
    slug: { $exists: true, $ne: null },
  };
  const tOr = [];
  if (me.bundesland) tOr.push({ bundesland: me.bundesland });
  if (myLeague) tOr.push({ leagueId: myLeague });

  let teams = tOr.length
    ? await Team.find({ ...tBase, $or: tOr }).select("teamName slug logo bundesland followers").limit(40)
    : [];
  if (teams.length < TEAM_LIMIT) {
    const have = new Set(teams.map((t) => String(t._id)));
    const more = await Team.find({
      ...tBase,
      _id: { $nin: [...excludeTeams, ...teams.map((t) => t._id)] },
    })
      .select("teamName slug logo bundesland followers")
      .limit(40);
    teams = [...teams, ...more.filter((t) => !have.has(String(t._id)))];
  }
  const teamOut = teams
    .sort(byFollowers)
    .slice(0, TEAM_LIMIT)
    .map((t) => ({
      _id: t._id,
      teamName: t.teamName,
      slug: t.slug,
      logo: t.logo,
      subtitle: t.bundesland || "",
      followersCount: (t.followers || []).length,
    }));

  return ok({ players: playerOut, teams: teamOut });
}

export const POST = withErrorHandling(handler);
