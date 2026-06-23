import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamFromToken, TEAM_PUBLIC_FIELDS } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Felder, die ein Team-Admin ändern darf.
const STRING_FIELDS = ["region", "about", "logo", "banner"];

// POST /api/team/update-team – Team-Stammdaten ändern (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const updates = {};

  // Teamname separat behandeln (Pflichtfeld, eindeutig).
  if (body.teamName !== undefined) {
    const teamName = body.teamName.trim();
    if (!teamName) {
      return fail("Der Teamname darf nicht leer sein", 400);
    }
    if (teamName !== team.teamName) {
      const clash = await Team.findOne({ teamName, _id: { $ne: team._id } });
      if (clash) {
        return fail("Dieser Teamname ist bereits vergeben", 409);
      }
      updates.teamName = teamName;
    }
  }

  for (const field of STRING_FIELDS) {
    if (body[field] !== undefined) {
      updates[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return fail("Keine Änderungen übermittelt", 400);
  }

  await connectDB();
  const updated = await Team.findByIdAndUpdate(
    team._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select(TEAM_PUBLIC_FIELDS);

  return ok({ team: updated });
}

export const POST = withErrorHandling(handler);
