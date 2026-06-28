import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import Player from "@/models/Player";
import { sendMail } from "@/lib/mailer";
import { pendingResultEmail } from "@/lib/emailTemplates";
import { getTeamAdminRecipients } from "@/lib/teamAdmins";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const BASE_URL = process.env.NEXTAUTH_URL || "https://hoopsgermany.de";

// Secret aus Authorization-Header ("Bearer …") oder Body lesen.
function getSecret(req, body) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return body?.secret || null;
}

async function remindForMatch(match) {
  for (const team of [match.teamA, match.teamB]) {
    if (!team) continue;
    const opponent = team === match.teamA ? match.teamB : match.teamA;

    // Empfänger je Team-Einstellung (nur Haupt-Admin oder alle Admins).
    const admins = await getTeamAdminRecipients(team);
    if (!admins.length) continue;

    // In-App-Benachrichtigung an alle (immer, unabhängig vom Mail-Opt-out).
    await Player.updateMany(
      { _id: { $in: admins.map((a) => a._id) } },
      {
        $push: {
          notifications: {
            type: "pending_result",
            teamId: team._id,
            teamName: team.teamName,
            matchId: match._id,
            message: "Für ein vergangenes Spiel fehlt noch das Ergebnis.",
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );

    // Mail nur an Admins, die die Erinnerung nicht abgeschaltet haben.
    const { subject, html, text } = pendingResultEmail({
      teamName: team.teamName,
      opponentName: opponent?.teamName,
      matchDate: match.date,
      baseUrl: BASE_URL,
    });
    for (const a of admins) {
      if (a.email && a.emailPendingResult !== false) {
        try {
          await sendMail({ to: a.email, subject, html, text });
        } catch (err) {
          console.error("[PENDING RESULT MAIL ERROR]", err?.message || err);
        }
      }
    }
  }
}

async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const secret = getSecret(req, body);
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return fail("Nicht autorisiert", 401);
  }

  await connectDB();
  const now = new Date();
  const matches = await Match.find({
    status: "scheduled",
    date: { $lt: now },
    notifiedPendingResult: { $ne: true },
  })
    .populate("teamA", "teamName email adminPlayerId notifyAllAdmins")
    .populate("teamB", "teamName email adminPlayerId notifyAllAdmins");

  for (const match of matches) {
    await remindForMatch(match);
    match.notifiedPendingResult = true;
    await match.save();
  }

  return ok({ processed: matches.length });
}

export const POST = withErrorHandling(handler);
export const GET = withErrorHandling(handler);
