import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { signToken } from "@/lib/auth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/adminlogin – Admin-Login → Admin-JWT.
async function handler(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return fail("Benutzername und Passwort erforderlich", 400);
  }

  await connectDB();
  const admin = await Admin.findOne({ username: username.trim() });
  if (!admin) {
    return fail("Ungültige Anmeldedaten", 401);
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return fail("Ungültige Anmeldedaten", 401);
  }

  const token = signToken({ adminId: admin._id.toString(), type: "admin" });
  return ok({ token, admin: { username: admin.username, email: admin.email } });
}

export const POST = withErrorHandling(handler);
