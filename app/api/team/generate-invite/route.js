import crypto from "crypto";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamForCapability } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/generate-invite – Einladungs-Token erzeugen/rotieren (Dual-Auth).
// Der Link /team/join/[token] erlaubt Spielern den Beitritt (Transfer).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const inviteToken = crypto.randomBytes(16).toString("hex");

  await connectDB();
  await Team.findByIdAndUpdate(team._id, { $set: { inviteToken } });

  return ok({ inviteToken });
}

export const POST = withErrorHandling(handler);
