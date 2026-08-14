import TransferEvent from "@/models/TransferEvent";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { autoPostTransfer } from "@/lib/autoPost";

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
//
// `still: true` schreibt NUR die Karriere-Station (`TransferEvent`) – kein
// Feed-Post, keine Follower-Benachrichtigung. Entscheidung Patrick am
// 14.08.2026 auf Kais Gate-Befund A2 hin:
//
//   Ein Transfer hat zwei Bedeutungen, die hier bislang zusammenfielen. Für den
//   Spieler ist er eine **Station im Lebenslauf** – die soll immer entstehen,
//   sonst klafft im Karriere-Verlauf eine Lücke. Für die Community ist er eine
//   **Neuigkeit** – die ist nur dann eine, wenn tatsächlich jemand gewechselt
//   ist. Bei einer Verwaltungs-Korrektur (`/admin/players`, Super-Admin hängt
//   einen falsch zugeordneten Spieler um) ist genau das nicht der Fall: Es
//   wechselt niemand, es wird ein Fehler behoben. Ein Post dafür wäre eine
//   Nachricht über ein Ereignis, das nie stattgefunden hat – und weder Post
//   noch Benachrichtigung lassen sich zurücknehmen, die Rückkorrektur erzeugt
//   also einen zweiten falschen Post in die Gegenrichtung.
//
// Bewusst NICHT global abgeschaltet: Für die sieben echten Wechselwege
// (Beitritt, Einladung, Gründung …) ist der Auto-Post gewollt und Teil des
// Feeds. Die Asymmetrie gibt den Ausschlag – ein fehlender Post ist harmlos
// (die Station steht trotzdem im Lebenslauf), ein falscher ist nicht löschbar.
export async function recordTransfer({
  player,
  fromTeam = null,
  toTeam = null,
  type,
  still = false,
}) {
  try {
    if (!player) return;
    const resolvedType =
      type ||
      (fromTeam && toTeam ? "move" : toTeam ? "join" : fromTeam ? "leave" : null);
    if (!resolvedType) return;
    // Kein Eintrag, wenn sich nichts ändert (gleiches Team).
    if (fromTeam && toTeam && String(fromTeam) === String(toTeam)) return;

    const te = await TransferEvent.create({
      player,
      fromTeam: fromTeam || null,
      toTeam: toTeam || null,
      type: resolvedType,
    });

    // Ab hier geht es nur noch nach außen (Feed + Follower). Die Station im
    // Lebenslauf steht bereits – im stillen Modus ist die Arbeit hier getan.
    if (still) return;

    const p = await Player.findById(player).select("firstName lastName slug followers");
    if (!p) return;

    const [from, to] = await Promise.all([
      fromTeam ? Team.findById(fromTeam).select("teamName slug") : null,
      toTeam ? Team.findById(toTeam).select("teamName slug") : null,
    ]);
    const message = transferMessage(
      `${p.firstName} ${p.lastName}`,
      resolvedType,
      from?.teamName || "einem Team",
      to?.teamName || "einem Team"
    );

    // Auto-Post in den Feed (Transfer/Beitritt/Gründung).
    await autoPostTransfer({
      subjectPlayer: p._id,
      teams: [fromTeam, toTeam],
      type: resolvedType,
      message,
      playerSlug: p.slug,
      eventKey: `transfer:${te._id}`,
    });

    // Follower des Spielers benachrichtigen.
    if (p.followers?.length) {
      const refTeam = to || from;
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
