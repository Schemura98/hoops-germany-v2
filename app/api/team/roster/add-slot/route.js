import crypto from "crypto";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamForCapability, TEAM_PUBLIC_FIELDS } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";
import { ALL_ROLES } from "@/lib/constants";

// POST /api/team/roster/add-slot – neuen Kader-Slot anlegen (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const name = body.name?.trim();
  if (!name) {
    return fail("Bitte einen Namen für den Slot angeben", 400);
  }

  // Position gegen die Liste prüfen (Befund Kai F-4, 15.08.2026).
  //
  // Hier stand `body.position?.trim() || ""` ohne jede Werteprüfung, und
  // `models/Team.js` hat `rosterSlots[].position: String` ohne Enum. Dieselbe
  // Lücke wie bei `Player.position`, nur an der Slot-Grenze – die
  // Vereinheitlichung endete genau hier. Dass `KaderTab` ein `select` anbietet,
  // ist wieder nur eine Aussage über den Browser.
  //
  // Der Wert ist nicht folgenlos: Er erscheint über `positionLabel(...)` auf
  // der ÖFFENTLICHEN Vereinsseite und geht in die Einladungsmail.
  //
  // ⚠️ Anders als bei `update-profile` braucht es hier KEINE Ausnahme für
  // unveränderte Altwerte: Ein Slot wird angelegt, nicht bearbeitet – es gibt
  // keinen Bestand, den eine strenge Regel unbedienbar machen könnte.
  const position = body.position?.trim() || "";
  if (position && !ALL_ROLES.includes(position)) {
    return fail("Diese Position gibt es nicht zur Auswahl.", 400);
  }

  const slot = {
    name,
    position,
    number: body.number?.toString().trim() || "",
    status: "empty",
    // Jeder Slot bekommt direkt einen Claim-Token für den Einladungslink.
    claimToken: crypto.randomBytes(16).toString("hex"),
  };

  await connectDB();
  const updated = await Team.findByIdAndUpdate(
    team._id,
    { $push: { rosterSlots: slot } },
    { new: true, runValidators: true }
  ).select(TEAM_PUBLIC_FIELDS);

  return ok({ team: updated });
}

export const POST = withErrorHandling(handler);
