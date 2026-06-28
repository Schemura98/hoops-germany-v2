import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Tryout from "@/models/Tryout";
import { getTeamForCapability } from "@/lib/serverAuth";
import { POSITIONS } from "@/lib/constants";
import { autoPostTryout } from "@/lib/autoPost";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/tryouts/create – Tryout ausschreiben (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "tryouts");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const location = body.location?.trim();
  if (!body.date) {
    return fail("Bitte ein Datum angeben", 400);
  }
  if (!location) {
    return fail("Bitte einen Ort angeben", 400);
  }
  const date = new Date(body.date);
  if (Number.isNaN(date.getTime())) {
    return fail("Ungültiges Datum", 400);
  }

  // Nur gültige Positionen übernehmen
  const positions = Array.isArray(body.positions)
    ? body.positions.filter((p) => POSITIONS.includes(p))
    : [];

  await connectDB();
  const tryout = await Tryout.create({
    teamId: team._id,
    date,
    location,
    positions,
    description: body.description?.trim() || "",
    status: "active",
    applicants: [],
  });

  // Auto-Post in den Feed (Followern des Teams + Entdecken).
  await autoPostTryout({ tryout, teamName: team.teamName });

  return ok({ tryout }, 201);
}

export const POST = withErrorHandling(handler);
