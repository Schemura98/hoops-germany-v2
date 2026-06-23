import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { PLAYER_PUBLIC_FIELDS } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Nur diese Felder dürfen vom Spieler selbst geändert werden.
const STRING_FIELDS = [
  "firstName",
  "lastName",
  "position",
  "height",
  "weight",
  "birthdate",
  "nationality",
  "country",
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
  if (body.age !== undefined) {
    const age = parseInt(body.age, 10);
    updates.age = Number.isFinite(age) ? age : undefined;
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
