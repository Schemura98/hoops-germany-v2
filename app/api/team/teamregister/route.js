import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { signTeamToken } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const teamName = body.teamName?.trim();
  const email = body.email?.toLowerCase().trim();
  const password = body.password;
  const region = body.region?.trim() || "";
  const about = body.about?.trim() || "";

  if (!teamName || !email || !password) {
    return fail("Bitte Teamname, E-Mail und Passwort ausfüllen", 400);
  }
  if (!EMAIL_RE.test(email)) {
    return fail("Bitte eine gültige E-Mail-Adresse angeben", 400);
  }
  if (password.length < 6) {
    return fail("Das Passwort muss mindestens 6 Zeichen lang sein", 400);
  }

  await connectDB();

  const existing = await Team.findOne({ $or: [{ email }, { teamName }] });
  if (existing) {
    if (existing.email === email) {
      return fail("Diese E-Mail-Adresse ist bereits registriert", 409);
    }
    return fail("Dieser Teamname ist bereits vergeben", 409);
  }

  const slug = await uniqueSlug(Team, teamName);
  const hashed = await bcrypt.hash(password, 10);

  const team = await Team.create({
    teamName,
    email,
    password: hashed,
    region,
    about,
    slug,
  });

  const token = signTeamToken({ teamId: team._id.toString() });

  return ok(
    {
      token,
      team: {
        id: team._id,
        teamName: team.teamName,
        email: team.email,
        slug: team.slug,
        region: team.region,
      },
    },
    201
  );
}

export const POST = withErrorHandling(handler);
