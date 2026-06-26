import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getAdminFromToken } from "@/lib/serverAuth";
import ReportShare from "@/models/ReportShare";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/analytics/shares – teilbare Sponsor-Report-Links verwalten (Admin).
// action: "list" | "create" { label, password } | "revoke" { id }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const action = body.action || "list";

  if (action === "create") {
    const label = (body.label || "").trim();
    const password = String(body.password || "");
    if (password.length < 4) return fail("Passwort muss mindestens 4 Zeichen haben", 400);
    const token = crypto.randomBytes(9).toString("hex"); // 18 Zeichen, unrätselbar
    const hashed = await bcrypt.hash(password, 10);
    const share = await ReportShare.create({ token, password: hashed, label, active: true });
    return ok({ share: { _id: share._id, token: share.token, label: share.label, active: share.active, createdAt: share.createdAt } });
  }

  if (action === "revoke") {
    if (!body.id) return fail("Keine ID angegeben", 400);
    await ReportShare.findByIdAndUpdate(body.id, { $set: { active: false } });
    return ok({ revoked: true });
  }

  // list (ohne Passwort-Hash)
  const shares = await ReportShare.find({})
    .select("token label active createdAt")
    .sort({ createdAt: -1 });
  return ok({ shares });
}

export const POST = withErrorHandling(handler);
