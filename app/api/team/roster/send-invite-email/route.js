import crypto from "crypto";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
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

  const link = `${getBaseUrl(req)}/team/claim/${claimToken}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#111827">Einladung von ${team.teamName}</h2>
      <p style="color:#4b5563">
        Du wurdest eingeladen, dem Kader von <strong>${team.teamName}</strong> beizutreten
        ${slot.position ? `(Position: ${slot.position})` : ""}.
      </p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#f97316;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Platz beanspruchen
        </a>
      </p>
      <p style="color:#9ca3af;font-size:12px">
        Falls dich das nicht betrifft, kannst du diese E-Mail ignorieren.
      </p>
    </div>`;

  try {
    await sendMail({
      to: email,
      subject: `Einladung in den Kader von ${team.teamName}`,
      html,
      text: `Platz beanspruchen: ${link}`,
    });
  } catch (err) {
    console.error("[ROSTER INVITE MAIL ERROR]", err);
    return fail("E-Mail konnte nicht gesendet werden", 502);
  }

  return ok({ message: `Einladung an ${email} gesendet.` });
}

export const POST = withErrorHandling(handler);
