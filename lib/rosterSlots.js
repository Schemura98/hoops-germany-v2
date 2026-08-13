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
 *
 * ⚠️ WER `Player.teamId` AENDERT, MUSS HIER STEHEN. Die vollstaendige Liste,
 * an EINER Stelle, weil sie beim ersten Versuch zweimal unvollstaendig war
 * (erst zwei Wege gemeldet, dann vier gefunden, dann von Kai drei weitere):
 *
 *   1. app/api/team/remove-member/route.js        Admin entfernt ein Mitglied
 *   2. app/api/team/join-via-link/route.js        allgemeiner Einladungslink
 *   3. app/api/team/handlejoinrequest/route.js    Beitrittsanfrage genehmigt
 *   4. app/api/team/roster/approve-claim/route.js Kaderplatz bestaetigt
 *   5. app/api/team/respond-invite/route.js       Direkt-Einladung angenommen
 *   6. app/api/team/roster/request-claim/route.js Claim-Link, Direktbestaetigung
 *   7. app/api/team/create/route.js               Mitglied gruendet eigenes Team
 *   8. app/api/admin/setteamadmin/route.js        Super-Admin setzt Team-Admin
 *
 * Dazu `lib/deletePlayer.js` (Konto-Loeschung, alle Vereine) — ruft diese
 * Funktion seit dem 13.08.2026 selbst auf, statt die Abfrage zu kopieren.
 *
 * BEWUSST NICHT hier, obwohl sie `Player.teamId` aendern (Kai, 13.08.2026):
 *   - app/api/admin/deleteteam/route.js
 *   - app/api/admin/approve-team/route.js  (Ablehnen-Zweig)
 * Beide loeschen das Team-Dokument mitsamt seiner `rosterSlots`. Es gibt also
 * nichts freizugeben. Sie stehen hier, damit der naechste Pruefer nach einem
 * Grep nicht denkt, die Liste sei wieder unvollstaendig — sie war es dreimal
 * hintereinander.
 */
export async function slotsFreigeben(playerId, teamId = null) {
  if (!playerId) return;
  const filter = { "rosterSlots.claimedBy": playerId };
  if (teamId) filter._id = teamId;

  await Team.updateMany(
    filter,
    {
      $set: {
        "rosterSlots.$[s].claimedBy": null,
        "rosterSlots.$[s].status": "empty",
        // `claimToken` MUSS mit weg (Fund von Kai beim Review dieses Fixes).
        // Sonst reisst das Freigeben eine neue Luecke auf: `request-claim`
        // prueft nur `status === "empty"`, der alte Einladungslink waere also
        // wieder gueltig. Ein vom Admin entfernter Spieler hat ihn noch in
        // seiner Mail und koennte sich ohne Genehmigung sofort selbst
        // zurueck in den Kader setzen. Vor diesem Fix war das nicht
        // erreichbar, weil der Platz belegt blieb — die Freigabe haette den
        // Weg erst geoeffnet.
        // `send-invite-email` erzeugt bei Bedarf ohnehin ein neues Token.
        "rosterSlots.$[s].claimToken": null,
      },
    },
    { arrayFilters: [{ "s.claimedBy": playerId }] },
  );
}
