import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { signTeamToken } from "@/lib/auth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/teamlogin – Team-Login (email, password) → Team-JWT.
async function handler(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return fail("E-Mail und Passwort sind erforderlich", 400);
  }

  await connectDB();

  const team = await Team.findOne({ email: email.toLowerCase().trim() });
  if (!team || !team.password) {
    return fail("Ungültige Anmeldedaten", 401);
  }

  const valid = await bcrypt.compare(password, team.password);
  if (!valid) {
    return fail("Ungültige Anmeldedaten", 401);
  }

  const token = signTeamToken({ teamId: team._id.toString() });

  return ok({
    token,
    team: {
      id: team._id,
      teamName: team.teamName,
      email: team.email,
      slug: team.slug,
      region: team.region,
    },
  });
}

export const POST = withErrorHandling(handler);
