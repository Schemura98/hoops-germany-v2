import TransferEvent from "@/models/TransferEvent";
import Player from "@/models/Player";
import Team from "@/models/Team";

// Baut den Benachrichtigungs-Text passend zum Transfer-Typ.
function transferMessage(name, type, fromName, toName) {
  switch (type) {
    case "found":
      return `${name} hat ${toName} gegründet.`;
    case "move":
      return `${name} wechselte von ${fromName} zu ${toName}.`;
    case "leave":
      return `${name} hat ${fromName} verlassen.`;
    case "join":
    default:
      return `${name} ist ${toName} beigetreten.`;
  }
}

// Schreibt ein Transfer-Ereignis und benachrichtigt die Follower des Spielers.
// Bewusst fehlertolerant: ein Problem beim Loggen darf den eigentlichen Flow
// (Beitritt etc.) nie scheitern lassen. `type` wird – falls nicht übergeben –
// aus from/to abgeleitet.
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

    // Follower des Spielers benachrichtigen.
    const p = await Player.findById(player).select("firstName lastName followers");
    if (p?.followers?.length) {
      const [from, to] = await Promise.all([
        fromTeam ? Team.findById(fromTeam).select("teamName slug") : null,
        toTeam ? Team.findById(toTeam).select("teamName slug") : null,
      ]);
      const refTeam = to || from;
      const message = transferMessage(
        `${p.firstName} ${p.lastName}`,
        resolvedType,
        from?.teamName || "einem Team",
        to?.teamName || "einem Team"
      );
      await Player.updateMany(
        { _id: { $in: p.followers } },
        {
          $push: {
            notifications: {
              type: "transfer",
              fromPlayerId: p._id,
              teamId: refTeam?._id,
              teamName: refTeam?.teamName,
              teamSlug: refTeam?.slug,
              message,
              read: false,
              createdAt: new Date(),
            },
          },
        }
      );
    }
  } catch (err) {
    console.error("[TRANSFER LOG ERROR]", err);
  }
}
