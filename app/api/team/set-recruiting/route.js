import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamForCapability } from "@/lib/serverAuth";
import { ALL_ROLES } from "@/lib/constants";
import { autoPostRecruiting } from "@/lib/autoPost";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-recruiting – Team als „sucht Verstärkung" listen/aktualisieren
// (Dual-Auth). Gesuchte Positionen/Rollen werden gegen ALL_ROLES validiert.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "einstellungen");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();

  const recruiting = !!body.recruiting;
  const positions = Array.isArray(body.positions)
    ? [...new Set(body.positions.filter((p) => ALL_ROLES.includes(p)))]
    : [];
  const note = typeof body.recruitingNote === "string" ? body.recruitingNote.trim() : "";

  // Vorherigen Status lesen, um nur beim echten Einschalten einen Auto-Post zu erzeugen.
  const prev = await Team.findById(team._id).select("recruiting teamName slug");

  await Team.findByIdAndUpdate(team._id, {
    $set: { recruiting, recruitingPositions: positions, recruitingNote: note },
  });

  // Nur beim Übergang false → true → Auto-Post in den Feed (Tages-Throttle im Helper).
  if (recruiting && !prev?.recruiting) {
    await autoPostRecruiting({
      teamId: team._id,
      teamName: prev?.teamName || team.teamName,
      teamSlug: prev?.slug || team.slug,
      positions,
      note,
    });
  }

  return ok({ recruiting, recruitingPositions: positions, recruitingNote: note });
}

export const POST = withErrorHandling(handler);
