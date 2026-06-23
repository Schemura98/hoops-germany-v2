import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import Player from "@/models/Player";
import { sendMail } from "@/lib/mailer";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Secret aus Authorization-Header ("Bearer …") oder Body lesen.
function getSecret(req, body) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return body?.secret || null;
}

async function remindForMatch(match) {
  const teams = [match.teamA, match.teamB].filter((t) => t?.email);
  for (const team of teams) {
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#111827">Ergebnis ausstehend</h2>
        <p style="color:#4b5563">Hallo ${team.teamName},</p>
        <p style="color:#4b5563">
          für euer Spiel vom ${new Date(match.date).toLocaleDateString("de-DE")} fehlt noch
          das Ergebnis. Bitte tragt es im Team-Bereich unter „Ergebnisse" ein.
        </p>
        <p style="margin:24px 0">
          <a href="${process.env.NEXTAUTH_URL || "https://hoopsgermany.de"}/team/admin"
             style="background:#f97316;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            Ergebnis eintragen
          </a>
        </p>
      </div>`;
    try {
      await sendMail({
        to: team.email,
        subject: "Hoops Germany – Ergebnis ausstehend",
        html,
        text: "Bitte tragt euer Spielergebnis im Team-Bereich ein.",
      });
    } catch (err) {
      console.error("[PENDING RESULT MAIL ERROR]", err);
    }
  }

  // Team-Admins (spielergeführte Teams) zusätzlich benachrichtigen
  for (const team of [match.teamA, match.teamB]) {
    if (team?.adminPlayerId) {
      await Player.findByIdAndUpdate(team.adminPlayerId, {
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
      });
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
    .populate("teamA", "teamName email adminPlayerId")
    .populate("teamB", "teamName email adminPlayerId");

  for (const match of matches) {
    await remindForMatch(match);
    match.notifiedPendingResult = true;
    await match.save();
  }

  return ok({ processed: matches.length });
}

export const POST = withErrorHandling(handler);
export const GET = withErrorHandling(handler);
