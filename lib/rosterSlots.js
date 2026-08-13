import Team from "@/models/Team";

/**
 * Gibt alle Kaderplätze frei, die dieser Spieler beansprucht hat.
 *
 * Warum das eine eigene Datei ist (13.08.2026, Befund von Kai): Beim Entfernen
 * aus einem Team (`remove-member`) und beim Wechsel über einen Einladungslink
 * (`join-via-link`) wurde bisher nur `Player.teamId` geändert. Der beanspruchte
 * Kaderplatz des alten Vereins blieb auf `claimedBy: <spieler>` stehen —
 * aufgeräumt hat das nur `lib/deletePlayer.js`, also ausschließlich beim
 * vollständigen Löschen eines Kontos.
 *
 * Folgen dieser Verwaisung:
 *  - Der alte Verein zeigt den Platz weiter als belegt, obwohl der Spieler weg
 *    ist. Der Platz lässt sich nicht neu vergeben, ohne ihn zu löschen.
 *  - Seit der Kaderprüfung in `app/api/team/match-stats/save/route.js` gilt ein
 *    verwaister `claimedBy` als „gehört zum Team": Der Ex-Verein könnte einem
 *    längst gewechselten Spieler weiterhin Statistiken zuschreiben — samt
 *    Benachrichtigung an ihn.
 *
 * `teamId` optional: Ohne Angabe werden alle Vereine bereinigt (Muster von
 * `deletePlayer`), mit Angabe nur der genannte — beim Wechsel soll der NEUE
 * Verein seinen frisch beanspruchten Platz behalten.
 */
export async function slotsFreigeben(playerId, teamId = null) {
  if (!playerId) return;
  const filter = { "rosterSlots.claimedBy": playerId };
  if (teamId) filter._id = teamId;

  await Team.updateMany(
    filter,
    { $set: { "rosterSlots.$[s].claimedBy": null, "rosterSlots.$[s].status": "empty" } },
    { arrayFilters: [{ "s.claimedBy": playerId }] },
  );
}
