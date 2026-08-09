import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Match from "@/models/Match";
import Post from "@/models/Post";
import League from "@/models/League";
import { computeStandings } from "@/lib/standings";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/fetchsingleteaminfo – öffentliches Team-Profil per Slug.
// Liefert Team, Kader (Account-Spieler + belegte Slots), Spiele und Team-News
// (Beiträge der Team-Mitglieder).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const slug = body.slug;
  if (!slug) {
    return fail("Kein Team angegeben", 400);
  }

  await connectDB();
  const team = await Team.findOne({ slug }).select(
    "teamName slug about region logo banner rosterSlots followers adminPlayerId leagueId approved isDemo"
  );
  // Noch nicht freigegebene Teams sind öffentlich nicht sichtbar (nur explizit false).
  if (!team || team.approved === false) {
    return fail("Team nicht gefunden", 404);
  }

  // Liga des Teams + Platzierung (Tabelle) ermitteln.
  let league = null;
  if (team.leagueId) {
    const lg = await League.findById(team.leagueId).select(
      "name season level gender ageGroup region finished champion teams active"
    );
    if (lg) {
      const standings = await computeStandings(lg._id, lg.teams);
      const idx = standings.findIndex((s) => s.teamId === String(team._id));
      const me = idx >= 0 ? standings[idx] : null;
      const championId = lg.champion
        ? String(lg.champion)
        : standings[0]?.teamId || null;
      league = {
        _id: lg._id,
        name: lg.name,
        season: lg.season || "",
        level: lg.level || "",
        gender: lg.gender || "",
        ageGroup: lg.ageGroup || "",
        region: lg.region || "",
        finished: !!lg.finished,
        rank: idx >= 0 ? idx + 1 : null,
        totalTeams: standings.length,
        record: me
          ? { games: me.games, wins: me.wins, losses: me.losses, diff: me.diff }
          : null,
        isChampion: !!lg.finished && championId === String(team._id),
      };
    }
  }

  // Spieler mit Account, die dem Team angehören
  const members = await Player.find({ teamId: team._id }).select(
    "firstName lastName slug position number profileImage nationality"
  );
  const memberIds = members.map((m) => m._id);

  // Spiele des Teams (neueste zuerst)
  const matches = await Match.find({
    $or: [{ teamA: team._id }, { teamB: team._id }],
    status: { $ne: "cancelled" },
  })
    .select(
      "teamA teamB date location status winningTeam winningTeamPoints losingTeamPoints stage playoffRound leagueId"
    )
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .populate("leagueId", "name season")
    .sort({ date: -1 })
    .limit(50);

  // Team-News: Beiträge des Vereins selbst (authorTeam), auf den Verein bezogene
  // Auto-Posts (teams enthält das Team) sowie Beiträge der Mitglieder.
  const postOr = [{ authorTeam: team._id }, { teams: team._id }];
  if (memberIds.length) postOr.push({ player: { $in: memberIds } });
  const posts = await Post.find({ $or: postOr })
    .populate("player", "firstName lastName slug profileImage teamId bundesland")
    .populate("authorTeam", "teamName slug logo")
    .populate("comments.player", "firstName lastName slug profileImage")
    .populate("comments.replies.player", "firstName lastName slug profileImage")
    .sort({ createdAt: -1 })
    .limit(15);

  return ok({
    team: {
      _id: team._id,
      teamName: team.teamName,
      slug: team.slug,
      about: team.about,
      region: team.region,
      logo: team.logo,
      banner: team.banner,
      followersCount: team.followers?.length || 0,
      // Belegte (pending/confirmed) UND vom Admin benannte Plätze öffentlich zeigen
      // (benannte „empty"-Slots erscheinen als „eingeladen"); nur namenlose Leer-Slots ausblenden.
      rosterSlots: (team.rosterSlots || []).filter(
        (s) => s.status !== "empty" || (s.name && s.name.trim())
      ),
    },
    league,
    members,
    matches,
    posts,
  });
}

export const POST = withErrorHandling(handler);
