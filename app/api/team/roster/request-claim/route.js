import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { memberJoinedEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { positionLabel } from "@/lib/constants";
import { recordTransfer } from "@/lib/recordTransfer";
import { slotsFreigeben } from "@/lib/rosterSlots";
import { followOwnTeam } from "@/lib/teamFollow";
import { getTeamAdminRecipients } from "@/lib/teamAdmins";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/roster/request-claim – eingeloggter (oder gerade registrierter)
// Spieler übernimmt einen Slot über den Einladungslink. Der Link = Autorisierung
// durch den Team-Admin → der Spieler wird DIREKT bestätigt (kein manuelles
// Genehmigen mehr); die Team-Admins erhalten eine Bestätigung (In-App + Mail).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst als Spieler anmelden", 401);
  }

  const claimToken = body.claimToken;
  if (!claimToken) {
    return fail("Ungültiger Einladungslink", 400);
  }

  await connectDB();
  const team = await Team.findOne({ "rosterSlots.claimToken": claimToken });
  if (!team) {
    return fail("Dieser Einladungslink ist ungültig oder abgelaufen", 404);
  }

  const slot = team.rosterSlots.find((s) => s.claimToken === claimToken);
  if (!slot) {
    return fail("Slot nicht gefunden", 404);
  }
  if (slot.status !== "empty") {
    return fail("Dieser Platz wurde bereits vergeben", 409);
  }

  // Slot direkt bestätigen (Einladungslink = Autorisierung)
  slot.status = "confirmed";
  slot.claimedBy = player._id;
  await team.save();

  // Spieler mit Team verknüpfen (+ Slot-Nummer übernehmen, falls keine eigene)
  const prevTeam = player.teamId || null;
  const setFields = { teamId: team._id };
  if (slot.number && !player.number) {
    setFields.number = String(slot.number);
  }
  await Player.findByIdAndUpdate(player._id, {
    $set: setFields,
    $push: {
      notifications: {
        type: "join_approved",
        teamId: team._id,
        teamName: team.teamName,
        teamSlug: team.slug,
        message: `Du bist jetzt im Kader von ${team.teamName}.`,
        read: false,
        createdAt: new Date(),
      },
    },
  });

  if (String(prevTeam || "") !== String(team._id)) {
    await recordTransfer({ player: player._id, fromTeam: prevTeam, toTeam: team._id });
    // Kaderplatz beim ALTEN Verein freigeben. Ausgerechnet diese Route erzeugt
    // `claimedBy`-Eintraege - wer per Claim-Link wechselt, hinterliess also
    // garantiert einen verwaisten Platz. Der gerade beanspruchte Platz DIESES
    // Teams bleibt stehen (anderes teamId-Argument).
    if (prevTeam) await slotsFreigeben(player._id, prevTeam);
  }
  await followOwnTeam(player._id, team._id);

  // Team-Admins benachrichtigen: erfolgreicher Beitritt (In-App + Mail).
  const playerName = `${player.firstName} ${player.lastName}`.trim();
  const admins = await getTeamAdminRecipients(team);
  if (admins.length) {
    await Player.updateMany(
      { _id: { $in: admins.map((a) => a._id) } },
      {
        $push: {
          notifications: {
            type: "member_joined",
            fromPlayerId: player._id,
            teamId: team._id,
            teamName: team.teamName,
            teamSlug: team.slug,
            message: `${playerName} hat sich registriert und ist jetzt in deinem Kader.`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
    const mail = memberJoinedEmail({
      teamName: team.teamName,
      playerName,
      position: positionLabel(slot.position),
      baseUrl: getBaseUrl(req),
    });
    for (const a of admins) {
      if (a.email) {
        sendMail({ to: a.email, subject: mail.subject, html: mail.html, text: mail.text }).catch(
          (err) => console.error("[MEMBER JOINED MAIL ERROR]", err?.message || err)
        );
      }
    }
  }

  return ok({ message: "Willkommen im Kader!" });
}

export const POST = withErrorHandling(handler);
