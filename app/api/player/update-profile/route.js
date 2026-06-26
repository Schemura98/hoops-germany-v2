import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { PLAYER_PUBLIC_FIELDS } from "@/lib/serverAuth";
import { ageFromBirthdate } from "@/lib/age";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Nur diese Felder dürfen vom Spieler selbst geändert werden.
const STRING_FIELDS = [
  "firstName",
  "lastName",
  "position",
  "height",
  "weight",
  "birthdate",
  "hometown",
  "bundesland",
  "aboutPlayer",
  "instagram",
  "fibaLink",
  "profileImage",
  "preferredLeague",
];

async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  const updates = {};
  for (const field of STRING_FIELDS) {
    if (body[field] !== undefined) {
      updates[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  }
  // Alter wird nicht mehr manuell gepflegt, sondern aus dem Geburtsdatum
  // abgeleitet (Snapshot für Altcode/APIs; die Anzeige berechnet live).
  if (updates.birthdate !== undefined) {
    const derived = ageFromBirthdate(updates.birthdate);
    updates.age = derived == null ? undefined : derived;
  }
  // Mail-Einstellung (Team-Admin): „Ergebnis eintragen"-Erinnerung an/aus.
  if (body.emailPendingResult !== undefined) {
    updates.emailPendingResult = !!body.emailPendingResult;
  }

  if (Object.keys(updates).length === 0) {
    return fail("Keine Änderungen übermittelt", 400);
  }

  await connectDB();
  const player = await Player.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select(PLAYER_PUBLIC_FIELDS);

  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }

  return ok({ player });
}

export const POST = withErrorHandling(handler);
