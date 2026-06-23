import bcrypt from "bcryptjs";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/adminregister – Admin anlegen.
// Bootstrap: der erste Admin darf ohne Auth erstellt werden; danach nur durch Admins.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const username = body.username?.trim();
  const password = body.password;
  const email = body.email?.trim() || "";

  if (!username || !password) {
    return fail("Benutzername und Passwort erforderlich", 400);
  }
  if (password.length < 8) {
    return fail("Das Passwort muss mindestens 8 Zeichen lang sein", 400);
  }

  await connectDB();

  const count = await Admin.countDocuments();
  if (count > 0) {
    // Nicht der erste Admin → bestehende Admin-Auth verlangen
    const token = getTokenFromRequest(req, body.token);
    const admin = await getAdminFromToken(token);
    if (!admin) {
      return fail("Nur bestehende Admins dürfen weitere Admins anlegen", 401);
    }
  }

  const existing = await Admin.findOne({ username });
  if (existing) {
    return fail("Benutzername bereits vergeben", 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({ username, password: hashed, email });

  return ok({ message: "Admin angelegt" }, 201);
}

export const POST = withErrorHandling(handler);
