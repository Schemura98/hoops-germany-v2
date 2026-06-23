import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Benachrichtigt die Follower beider Teams über ein eingetragenes Ergebnis.
async function notifyFollowers(match) {
  const [tA, tB] = await Promise.all([
    Team.findById(match.teamA).select("teamName slug followers"),
    Team.findById(match.teamB).select("teamName slug followers"),
  ]);
  if (!tA || !tB) return;

  // Punkte je Seite aus dem (vorläufigen) Endstand ableiten
  const winId = String(match.winningTeam || "");
  const w = match.winningTeamPoints;
  const l = match.losingTeamPoints;
  const aPts = !winId || winId === String(match.teamA) ? w : l;
  const bPts = !winId || winId === String(match.teamA) ? l : w;
  const message = `${tA.teamName} ${aPts}:${bPts} ${tB.teamName}`;

  // Eindeutige Follower beider Teams sammeln (mit ihrem "Heimat"-Team für den Link)
  const seen = new Map(); // playerId -> { team }
  for (const team of [tA, tB]) {
    for (const fid of team.followers || []) {
      const key = String(fid);
      if (!seen.has(key)) seen.set(key, team);
    }
  }

  await Promise.all(
    [...seen.entries()].map(([pid, team]) =>
      Player.updateOne(
        { _id: pid },
        {
          $push: {
            notifications: {
              type: "match_result",
              teamId: team._id,
              teamName: team.teamName,
              teamSlug: team.slug,
              matchId: match._id,
              message,
              read: false,
              createdAt: new Date(),
            },
          },
        }
      )
    )
  );
}

// POST /api/team/submit-match-result – Ergebnis einreichen + Abgleich (Dual-Auth).
// Jedes Team meldet eigene + gegnerische Punkte. Stimmen beide Meldungen überein,
// wird das Spiel bestätigt; sonst Status "mismatch".
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const decoded = verifyToken(token);
  const submitterId = decoded?.id || decoded?.playerId || null;

  const ownPoints = parseInt(body.ownPoints, 10);
  const opponentPoints = parseInt(body.opponentPoints, 10);
  if (!Number.isFinite(ownPoints) || !Number.isFinite(opponentPoints) || ownPoints < 0 || opponentPoints < 0) {
    return fail("Bitte gültige Punktzahlen angeben", 400);
  }

  await connectDB();
  const match = await Match.findById(body.matchId);
  if (!match) {
    return fail("Spiel nicht gefunden", 404);
  }

  const isA = String(match.teamA) === String(team._id);
  const isB = String(match.teamB) === String(team._id);
  if (!isA && !isB) {
    return fail("Keine Berechtigung für dieses Spiel", 403);
  }
  if (match.status === "cancelled") {
    return fail("Dieses Spiel wurde abgesagt", 400);
  }
  if (match.resultStatus === "confirmed") {
    return fail("Das Ergebnis ist bereits bestätigt", 409);
  }

  const wasCompleted = match.status === "completed";

  const submission = {
    ownPoints,
    opponentPoints,
    submittedBy: submitterId,
    submittedAt: new Date(),
  };
  if (isA) match.teamAResult = submission;
  else match.teamBResult = submission;

  // Endstand (Punkte aus teamA-Sicht) setzen → Spiel gilt sofort als gespielt.
  function setOutcome(aPts, bPts) {
    if (aPts === bPts) {
      match.winningTeam = undefined;
      match.winningTeamPoints = aPts;
      match.losingTeamPoints = bPts;
    } else {
      match.winningTeam = aPts > bPts ? match.teamA : match.teamB;
      match.winningTeamPoints = Math.max(aPts, bPts);
      match.losingTeamPoints = Math.min(aPts, bPts);
    }
  }

  const a = match.teamAResult;
  const b = match.teamBResult;
  const aSub = a && a.ownPoints != null;
  const bSub = b && b.ownPoints != null;

  if (aSub && bSub) {
    // Beide gemeldet → bestätigt (übereinstimmend) oder strittig
    const consistent =
      a.ownPoints === b.opponentPoints && a.opponentPoints === b.ownPoints;
    match.resultStatus = consistent ? "confirmed" : "mismatch";
    setOutcome(a.ownPoints, a.opponentPoints);
  } else {
    // Einseitig → gilt vorläufig sofort, wartet auf Bestätigung des Gegners
    match.resultStatus = "pending";
    const aPts = aSub ? a.ownPoints : b.opponentPoints;
    const bPts = aSub ? a.opponentPoints : b.ownPoints;
    setOutcome(aPts, bPts);
  }

  // Sobald mindestens ein Ergebnis vorliegt, zählt das Spiel (Stats/Tabelle/Profil).
  match.status = "completed";

  await match.save();

  // Follower beider Teams benachrichtigen, sobald das Spiel erstmals ein Ergebnis hat
  if (!wasCompleted) {
    try {
      await notifyFollowers(match);
    } catch (err) {
      console.error("[MATCH RESULT NOTIFY ERROR]", err);
    }
  }

  return ok({
    resultStatus: match.resultStatus,
    message:
      match.resultStatus === "confirmed"
        ? "Ergebnis bestätigt – beide Angaben stimmen überein."
        : match.resultStatus === "mismatch"
        ? "Die Angaben widersprechen sich. Bitte abstimmen und erneut einreichen."
        : "Ergebnis eingetragen – es gilt vorläufig und wartet auf die Bestätigung des Gegners.",
  });
}

export const POST = withErrorHandling(handler);
