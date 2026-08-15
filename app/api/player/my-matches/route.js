import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// DB-Zugriff erst zur Laufzeit.
export const dynamic = "force-dynamic";

// POST /api/player/my-matches – Spiele des eigenen Teams + gefolgter Teams.
// Liefert alle relevanten Partien (Anstehend + Ergebnisse); die Aufteilung
// und der Bereichs-Filter (Mein Team / Gefolgte) passieren im Widget.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const myTeamId = player.teamId ? String(player.teamId) : null;
  const followedTeamIds = (player.followingTeams || []).map(String);
  const allIds = [...new Set([myTeamId, ...followedTeamIds].filter(Boolean))];

  let matches = [];
  if (allIds.length) {
    await connectDB();
    matches = await Match.find({
      status: { $ne: "cancelled" },
      $or: [{ teamA: { $in: allIds } }, { teamB: { $in: allIds } }],
    })
      .select(
        "teamA teamB date location status winningTeam winningTeamPoints losingTeamPoints resultStatus teamAResult teamBResult playerStats"
      )
      .populate("teamA", "teamName slug logo")
      .populate("teamB", "teamName slug logo")
      .sort({ date: -1 })
      .lean();
  }

  // Die eigenen Zahlen aus jedem Spiel herauslösen (Befund Ronja, 15.08.2026).
  //
  // Die Route lieferte bisher Ergebnisse, aber nie die eigenen Werte – deshalb
  // stand auf dem Newsfeed keine einzige Zahl über den Betrachter selbst,
  // obwohl die Plattform als „Scouting mit belegbaren Fakten" antritt und
  // `lib/statsNotify.js` seit dem 13.08. genau darüber benachrichtigt. Das
  // Erlebnis war gebaut, nur nicht auf der Fläche, auf der man täglich landet.
  //
  // ⚠️ `playerStats` geht NICHT roh hinaus: Es enthält die Werte ALLER Spieler
  // beider Mannschaften. Für diese Fläche wird der eigene Eintrag
  // herausgesucht und der Rest verworfen – „erlauben statt verbieten", dieselbe
  // Regel wie beim Kaderplatz-Leak von heute Morgen. Wer den vollen Box-Score
  // will, hat dafür `/match/[id]`.
  const meineWerte = new Map();
  for (const m of matches) {
    const eigen = (m.playerStats || []).find(
      (s) => s.player && String(s.player) === String(player._id)
    );
    if (eigen && !eigen.didNotPlay) {
      meineWerte.set(String(m._id), {
        points: eigen.points ?? null,
        assists: eigen.assists ?? null,
        rebounds: eigen.rebounds ?? null,
      });
    }
    delete m.playerStats;
  }

  const ausgabe = matches.map((m) => ({
    ...m,
    meineWerte: meineWerte.get(String(m._id)) || null,
  }));

  return ok({ matches: ausgabe, myTeamId, followedTeamIds });
}

export const POST = withErrorHandling(handler);
