import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getTeamForCapability, TEAM_PUBLIC_FIELDS } from "@/lib/serverAuth";
import { recordTransfer } from "@/lib/recordTransfer";
import { followOwnTeam } from "@/lib/teamFollow";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/roster/approve-claim – Slot-Anspruch genehmigen (Dual-Auth).
// Setzt den Slot auf "confirmed", verknüpft den Spieler mit dem Team
// und legt eine Benachrichtigung an.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const slotId = body.slotId;
  if (!slotId) {
    return fail("Slot-ID fehlt", 400);
  }

  const slot = team.rosterSlots?.id
    ? team.rosterSlots.id(slotId)
    : team.rosterSlots?.find((s) => String(s._id) === String(slotId));

  if (!slot) {
    return fail("Slot nicht gefunden", 404);
  }
  if (slot.status !== "pending") {
    return fail("Für diesen Slot liegt keine ausstehende Anfrage vor", 400);
  }

  await connectDB();

  // Slot bestätigen
  await Team.updateOne(
    { _id: team._id, "rosterSlots._id": slotId },
    { $set: { "rosterSlots.$.status": "confirmed" } }
  );

  // Spieler mit Team verknüpfen + Benachrichtigung
  if (slot.claimedBy) {
    const claimer = await Player.findById(slot.claimedBy).select("teamId number");
    const prevTeam = claimer?.teamId || null;

    // Slot-Rückennummer übernehmen, falls der Spieler noch keine eigene hat.
    const setFields = { teamId: team._id };
    if (slot.number && !claimer?.number) {
      setFields.number = String(slot.number);
    }

    await Player.findByIdAndUpdate(slot.claimedBy, {
      $set: setFields,
      $push: {
        notifications: {
          type: "join_approved",
          teamId: team._id,
          teamName: team.teamName,
          teamSlug: team.slug,
          message: `Du wurdest im Kader von ${team.teamName} bestätigt.`,
          read: false,
          createdAt: new Date(),
        },
      },
    });

    await recordTransfer({
      player: slot.claimedBy,
      fromTeam: prevTeam,
      toTeam: team._id,
    });
    await followOwnTeam(slot.claimedBy, team._id);
  }

  const updated = await Team.findById(team._id).select(TEAM_PUBLIC_FIELDS);
  return ok({ team: updated });
}

export const POST = withErrorHandling(handler);
