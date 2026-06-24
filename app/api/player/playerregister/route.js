import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { signPlayerToken } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";
import { sendMail } from "@/lib/mailer";
import { welcomeEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handler(req) {
  const body = await req.json();
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.toLowerCase().trim();
  const password = body.password;

  if (!firstName || !lastName || !email || !password) {
    return fail("Bitte alle Felder ausfüllen", 400);
  }
  if (!EMAIL_RE.test(email)) {
    return fail("Bitte eine gültige E-Mail-Adresse angeben", 400);
  }
  if (password.length < 6) {
    return fail("Das Passwort muss mindestens 6 Zeichen lang sein", 400);
  }

  await connectDB();

  const existing = await Player.findOne({ email });
  if (existing) {
    return fail("Diese E-Mail-Adresse ist bereits registriert", 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  const slug = await uniqueSlug(Player, `${firstName}-${lastName}`);

  const player = await Player.create({
    firstName,
    lastName,
    email,
    slug,
    password: hashed,
    status: "active",
  });

  const token = signPlayerToken({ id: player._id.toString() });

  // Willkommensmail – fire-and-forget, darf die Registrierung nie blockieren.
  const { subject, html, text } = welcomeEmail({
    firstName,
    baseUrl: getBaseUrl(req),
  });
  sendMail({ to: email, subject, html, text }).catch((err) =>
    console.error("[WELCOME MAIL ERROR]", err?.message || err)
  );

  return ok(
    {
      token,
      player: {
        id: player._id,
        firstName: player.firstName,
        lastName: player.lastName,
        email: player.email,
        isTeamAdmin: player.isTeamAdmin,
        isSuperAdmin: player.isSuperAdmin,
      },
    },
    201
  );
}

export const POST = withErrorHandling(handler);
