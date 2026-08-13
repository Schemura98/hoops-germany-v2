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
  "number",
  "height",
  "weight",
  "birthdate",
  "nationality",
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
    // Mindestalter auch hier durchsetzen (13.08.2026). Ohne diese Prüfung
    // bestätigt jemand bei der Registrierung „mindestens 16" und trägt danach
    // ein Geburtsdatum ein, das 14 ergibt – die Regel wäre eine Formalie, und
    // im Profil stünde offen ein Widerspruch zur eigenen Angabe.
    // `null` (kein/ungültiges Datum) bleibt erlaubt: Das Feld ist optional.
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

  // Mindestalter erst hier prüfen: Es braucht den GESPEICHERTEN Wert.
  //
  // Nur bei einer echten Änderung ablehnen (Fund von Kai). Das Profilformular
  // schickt beim Speichern immer das komplette Formular mit, auch ein
  // unverändertes Geburtsdatum. Ein Bestandskonto mit einem gespeicherten
  // Datum unter 16 hätte sonst kein einziges Feld mehr speichern können –
  // dasselbe Muster wie bei den Alt-U16-Ligen heute Mittag: Regel verengt,
  // Altbestand unbedienbar. Eine NEUE Eingabe unter 16 wird weiter abgewiesen.
  if (updates.birthdate !== undefined) {
    const abgeleitet = ageFromBirthdate(updates.birthdate);
    if (abgeleitet != null && abgeleitet < 16) {
      const bisher = await Player.findById(id).select("birthdate").lean();
      if (String(updates.birthdate || "") !== String(bisher?.birthdate || "")) {
        return fail(
          "Hoops Germany ist erst ab 16 Jahren. Bitte prüfe dein Geburtsdatum.",
          400
        );
      }
    }
  }

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
