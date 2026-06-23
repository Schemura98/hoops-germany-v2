import TransferEvent from "@/models/TransferEvent";

// Schreibt ein Transfer-Ereignis. Bewusst fehlertolerant: ein Problem beim
// Loggen darf den eigentlichen Flow (Beitritt etc.) nie scheitern lassen.
// `type` wird – falls nicht übergeben – aus from/to abgeleitet.
export async function recordTransfer({ player, fromTeam = null, toTeam = null, type }) {
  try {
    if (!player) return;
    const resolvedType =
      type ||
      (fromTeam && toTeam ? "move" : toTeam ? "join" : fromTeam ? "leave" : null);
    if (!resolvedType) return;
    // Kein Eintrag, wenn sich nichts ändert (gleiches Team).
    if (fromTeam && toTeam && String(fromTeam) === String(toTeam)) return;

    await TransferEvent.create({
      player,
      fromTeam: fromTeam || null,
      toTeam: toTeam || null,
      type: resolvedType,
    });
  } catch (err) {
    console.error("[TRANSFER LOG ERROR]", err);
  }
}
