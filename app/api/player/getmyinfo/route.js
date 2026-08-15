import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import Team from "@/models/Team";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/getmyinfo – eigenes Profil anhand des Tokens laden.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  if (!token) {
    return fail("Nicht authentifiziert", 401);
  }

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Sitzung ungültig oder abgelaufen", 401);
  }

  // Rückwärtskompatibel: teamId bleibt unverändert (ObjectId), zusätzlich
  // ein populiertes `team`-Objekt (für Navbar "Mein Team" o.ä.).
  const out = player.toObject();
  if (player.teamId) {
    // ⚠️ `leagueId` gehört dazu (Befund Kai B6, Tobias M1, 15.08.2026).
    //
    // Der Newsfeed übergibt `meineLigaId={player?.team?.leagueId}`, damit die
    // Tabelle auf die eigene Liga vorgewählt startet. Das Feld war hier nicht
    // in der Projektion – der Wert war also IMMER `undefined`, die Vorwahl
    // konnte nie greifen, und `useState` rastete auf „Alle Ligen" ein.
    //
    // Das ist die unangenehme Sorte Fehler: kein Fehlerbild, keine Warnung,
    // in der Dev-DB mit EINER Liga nicht einmal sichtbar – auf Prod mit 57
    // Ligen aber genau die Lücke, die der Umbau schließen sollte. So etwas
    // wird als erledigt abgehakt. Beide Gates haben es unabhängig gefunden.
    out.team = await Team.findById(player.teamId).select("teamName slug logo leagueId");
  }
  out.followersCount = out.followers?.length || 0;
  out.followingCount = out.following?.length || 0;

  return ok({ player: out });
}

export const POST = withErrorHandling(handler);
