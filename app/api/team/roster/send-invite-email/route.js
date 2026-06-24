import crypto from "crypto";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { inviteEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/team/roster/send-invite-email – Claim-Link für einen Slot per Mail senden.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const email = body.email?.toLowerCase().trim();
  if (!email || !EMAIL_RE.test(email)) {
    return fail("Bitte eine gültige E-Mail-Adresse angeben", 400);
  }

  const slotId = body.slotId;
  const slot = team.rosterSlots?.id
    ? team.rosterSlots.id(slotId)
    : team.rosterSlots?.find((s) => String(s._id) === String(slotId));
  if (!slot) {
    return fail("Slot nicht gefunden", 404);
  }

  await connectDB();

  // Sicherstellen, dass der Slot einen Claim-Token hat.
  let claimToken = slot.claimToken;
  if (!claimToken) {
    claimToken = crypto.randomBytes(16).toString("hex");
    await Team.updateOne(
      { _id: team._id, "rosterSlots._id": slotId },
      { $set: { "rosterSlots.$.claimToken": claimToken } }
    );
  }

  const baseUrl = getBaseUrl(req);
  const link = `${baseUrl}/team/claim/${claimToken}`;
  const { subject, html, text } = inviteEmail({
    teamName: team.teamName,
    position: slot.position,
    link,
    baseUrl,
  });

  try {
    await sendMail({ to: email, subject, html, text });
  } catch (err) {
    console.error("[ROSTER INVITE MAIL ERROR]", err);
    return fail("E-Mail konnte nicht gesendet werden", 502);
  }

  return ok({ message: `Einladung an ${email} gesendet.` });
}

export const POST = withErrorHandling(handler);
