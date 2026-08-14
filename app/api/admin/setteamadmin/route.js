import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";
import { slotsFreigeben } from "@/lib/rosterSlots";
import { recordTransfer } from "@/lib/recordTransfer";
import { notifyTeamAdminRevoked } from "@/lib/notifyTeamAdminRevoked";

// Meldet dem Spieler, dass seine Vereinszuordnung geändert wurde.
//
// ⚠️ Der Text darf NICHT behaupten, der Spieler sei gewechselt – er hat nichts
// getan, jemand anderes hat eine Zuordnung geändert. Genau daran krankt die
// bestehende Transfer-Nachricht („X hat Y verlassen." auch dann, wenn ein Admin
// ihn entfernt hat, Befund Kai). Und er erfindet keinen Grund: Der Code weiß
// nicht, ob korrigiert, umstrukturiert oder ein Fehler behoben wurde.
//
// Fehlertolerant wie `recordTransfer`: Ein Problem beim Benachrichtigen darf
// das Setzen der Admin-Rechte nicht kippen.
async function benachrichtigeZuordnung(player, vorherigesTeam, team) {
  try {
    const vorher = vorherigesTeam
      ? await Team.findById(vorherigesTeam).select("teamName")
      : null;

    // Wortlaut Nele, 14.08.2026. Jede Wendung ist begründet:
    //  • „Dein Profil ist … zugeordnet" – Zustand, kein Vorgang, kein Subjekt
    //    „du". Der Spieler hat nichts getan.
    //  • „zugeordnet", NICHT „im Kader": Der Code setzt `Player.teamId`;
    //    Roster-Slots sind eine andere Sache und können leer bleiben. „Du
    //    stehst jetzt im Kader" wäre im Sinne des Codes richtig und im Sinne
    //    des Lesers womöglich falsch.
    //  • „Eingetragen hat das die Verwaltung von Hoops Germany" benennt den
    //    Urheber, ohne einen GRUND zu behaupten. Bewusst nicht „korrigiert"
    //    oder „berichtigt" – jedes dieser Verben behauptet, was vorher der
    //    Fall war, und das weiß der Code nicht. Bewusst auch nicht „ein
    //    Administrator": das verwechselt sich mit dem Team-Admin.
    //  • Der Rückweg ist das Einzige, was die Nachricht handlungsfähig macht:
    //    Anders als bei `own_stats` gibt es hier nichts anzuklicken. Ohne ihn
    //    bliebe dem Spieler nur Rätselraten – die Sorte Sackgasse, die als
    //    „Vorfall" gelesen wird, obwohl nichts passiert ist. Im Klartext und
    //    nicht als Link, weil `notificationHref` auf die Vereinsseite führt.
    //    ⚠️ Setzt voraus, dass `/kontakt` erreichbar bleibt (Footer, geprüft).
    //    ⚠️ „Kontakt" in Anführungszeichen und NICHT „das Kontaktformular"
    //    (Angleichung Nele, 14.08.2026, auf Kais Hinweis): Der Footer-Eintrag
    //    und die `h1` auf /kontakt heißen beide „Kontakt". Wer ein Wort genannt
    //    bekommt und es auf der Seite nicht wörtlich findet, hat so viel wie
    //    keinen Hinweis. Die Anführungszeichen markieren es als Beschriftung,
    //    nach der man sucht, statt als Gattungsbegriff.
    // Ein dritter Fall („keinem Team mehr zugeordnet") kann hier nicht
    // auftreten: Der `remove`-Zweig dieser Route fasst `teamId` nicht an.
    const vorherText = vorher?.teamName
      ? `vorher ${vorher.teamName}`
      : "vorher war kein Team hinterlegt";
    const message =
      `Dein Profil ist jetzt ${team.teamName} zugeordnet – ${vorherText}. ` +
      `Eingetragen hat das die Verwaltung von Hoops Germany. ` +
      `Wenn das nicht stimmt, schreib uns über „Kontakt".`;

    await Player.updateOne(
      { _id: player._id },
      {
        $push: {
          notifications: {
            type: "team_assigned",
            teamId: team._id,
            teamName: team.teamName,
            teamSlug: team.slug,
            message,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
  } catch (err) {
    console.error("[TEAM_ASSIGNED NOTIFY ERROR]", err);
  }
}

// POST /api/admin/setteamadmin – Spieler als Team-Admin setzen/entfernen (Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  const { playerId, teamId, remove } = body;
  if (!playerId) return fail("Spieler-ID fehlt", 400);

  await connectDB();
  const player = await Player.findById(playerId);
  if (!player) return fail("Spieler nicht gefunden", 404);

  // Entfernen
  if (remove) {
    // Für die Notiz VOR dem Zurücksetzen merken – danach ist `teamAdminOf` weg.
    const verlorenesTeam = player.teamAdminOf
      ? await Team.findById(player.teamAdminOf).select("teamName slug")
      : null;

    if (player.teamAdminOf) {
      await Team.updateOne(
        { _id: player.teamAdminOf, adminPlayerId: player._id },
        { $unset: { adminPlayerId: "" } }
      );
    }
    player.isTeamAdmin = false;
    player.teamAdminOf = undefined;
    await player.save();

    // ⚠️ Auch dieser Zweig entzieht Rechte – und meldete es bis zum 14.08.2026
    // nicht (Befund Tobias). Dieselbe Lücke, die der Commit eine Zeile weiter
    // unten gerade geschlossen hat: Der Betroffene hätte es erst gemerkt, wenn
    // `/team/admin` ihn abweist.
    // Ohne dritten Parameter, weil hier NIEMAND nachrückt – die Rechte werden
    // ersatzlos entfernt. `notifyTeamAdminRevoked` fällt dann auf „jemand
    // anderem" zurück, was hier falsch wäre; deshalb bekommt es einen eigenen
    // Wortlaut über `ohneNachfolger`.
    if (verlorenesTeam) {
      await notifyTeamAdminRevoked(player._id, verlorenesTeam, null, { ohneNachfolger: true });
    }
    return ok({ message: "Team-Admin-Rechte entfernt" });
  }

  // Setzen
  if (!teamId) return fail("Team-ID fehlt", 400);
  const team = await Team.findById(teamId);
  if (!team) return fail("Team nicht gefunden", 404);

  // Vorheriges Team des Spielers ggf. lösen
  if (player.teamAdminOf && String(player.teamAdminOf) !== String(teamId)) {
    await Team.updateOne(
      { _id: player.teamAdminOf, adminPlayerId: player._id },
      { $unset: { adminPlayerId: "" } }
    );
  }

  const vorherigesTeam = player.teamId || null;
  player.isTeamAdmin = true;
  player.teamAdminOf = team._id;
  player.teamId = team._id; // Team-Admin ist auch Mitglied (sonst fehlen Kader/Spiele/Ergebnisse)
  await player.save();

  // Kaderplatz beim alten Verein freigeben (Liste aller Wechselwege in
  // lib/rosterSlots.js).
  if (vorherigesTeam && String(vorherigesTeam) !== String(team._id)) {
    await slotsFreigeben(player._id, vorherigesTeam);
  }
  // ⚠️ Dem VERDRÄNGTEN Admin die Rechte nehmen (Befund Tobias, 14.08.2026).
  // Bislang überschrieb die Zeile darunter nur `Team.adminPlayerId`, ließ beim
  // bisherigen Gründer aber `isTeamAdmin`/`teamAdminOf` stehen. Da die
  // Dual-Auth über `teamAdminOf` läuft (lib/serverAuth.js), behielt er damit
  // vollen Zugriff auf `/team/admin` – Kader ändern, Ergebnisse eintragen,
  // Mitglieder entfernen –, obwohl das Team längst auf jemand anderen zeigte.
  // Er stand dann in seinem eigenen Profil weiter als Admin eines Vereins, der
  // ihn nicht mehr als solchen führt.
  // Nur der bisherige Gründer wird entrechtet, nicht die Co-Admins: Die hat
  // ein Team bewusst zusätzlich, und ein Wechsel an der Spitze soll sie nicht
  // stillschweigend entfernen.
  const bisheriger = team.adminPlayerId;
  if (bisheriger && String(bisheriger) !== String(player._id)) {
    const { modifiedCount } = await Player.updateOne(
      { _id: bisheriger, teamAdminOf: team._id },
      { $set: { isTeamAdmin: false }, $unset: { teamAdminOf: "" } }
    );
    // ⚠️ Nur benachrichtigen, wenn tatsächlich etwas entzogen wurde. Greift der
    // `teamAdminOf`-Wächter nicht, hatte die Person hier gar keine Rechte – eine
    // Meldung darüber wäre eine Aussage über ein Ereignis, das nicht
    // stattgefunden hat. Dieselbe Regel wie bei `team_assigned`.
    if (modifiedCount > 0) await notifyTeamAdminRevoked(bisheriger, team, player);
  }
  await Team.findByIdAndUpdate(team._id, { adminPlayerId: player._id });

  // Auch der BEFÖRDERTE erfährt es (Befund Tobias, 14.08.2026): Über
  // `/admin/teams` bekam er seit jeher ein `team_admin_granted`, über diesen
  // Weg gar nichts – dieselbe Handlung, zwei verschiedene Auskünfte, je
  // nachdem welches Werkzeug der Super-Admin zufällig benutzt. Seit heute wird
  // der Verdrängte auf beiden Wegen informiert; ohne diese Zeile wäre
  // ausgerechnet der Begünstigte der einzige, der nichts hört.
  // Nur wenn er die Rolle nicht ohnehin schon hatte – sonst meldeten wir ein
  // Ereignis, das nicht stattgefunden hat.
  if (String(team.adminPlayerId || "") !== String(player._id)) {
    await Player.updateOne(
      { _id: player._id },
      {
        $push: {
          notifications: {
            type: "team_admin_granted",
            teamId: team._id,
            teamName: team.teamName,
            teamSlug: team.slug,
            message: `Du bist jetzt Team-Admin von ${team.teamName}.`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
  }

  // Transfer protokollieren (Gate-Befund 13.08.2026, nachgezogen am 14.08.).
  // Dieser Pfad setzt `player.teamId` oben mit – ohne Eintrag fehlte dem
  // Spieler ausgerechnet die Station, die ein Super-Admin vergeben hat: Der
  // Karriere-Verlauf zeigte den Verein, aber keinen Wechsel dorthin, und beim
  // nächsten echten Wechsel stand im Lebenslauf ein Sprung ohne Herkunft.
  // `recordTransfer` leitet den Typ selbst ab (kein vorheriges Team = "join",
  // sonst "move") und ist fehlertolerant – ein Problem beim Loggen darf das
  // Setzen der Admin-Rechte nicht scheitern lassen.
  //
  // ⚠️ `still: true` – Entscheidung Patrick, 14.08.2026 (Kais Befund A2).
  // Dies ist ein Verwaltungspfad: Ein Super-Admin setzt Rechte bzw. korrigiert
  // eine falsche Zuordnung. Es wechselt niemand, also gibt es auch nichts zu
  // vermelden. Der Feed-Post und die Follower-Benachrichtigung, die
  // `recordTransfer` sonst erzeugt, wären hier eine Nachricht über ein
  // Ereignis, das nie stattgefunden hat – und beide sind nicht löschbar, die
  // Rückkorrektur erzeugte also einen zweiten falschen Post. Die Station im
  // Lebenslauf entsteht trotzdem; genau darum ging es bei diesem Aufruf.
  const zuordnungGeaendert = String(vorherigesTeam || "") !== String(team._id);

  await recordTransfer({
    player: player._id,
    fromTeam: vorherigesTeam,
    toTeam: team._id,
    still: true,
  });

  // Stille Notiz an den Betroffenen (Entscheidung Patrick, 14.08.2026, auf
  // Kais Befund hin). Die Stilllegung oben nimmt Post und Follower-Meldung weg
  // – dadurch wäre ausgerechnet der Spieler die einzige Person geblieben, die
  // von einer Änderung an seinem eigenen Profil nichts erfährt. Nur In-App,
  // keine Mail: Eine Verwaltungskorrektur ist keine Nachricht, für die jemand
  // sein Postfach öffnen muss.
  //
  // ⚠️ Nur bei einer ECHTEN Zuordnungsänderung. Vergibt ein Super-Admin bloß
  // Admin-Rechte für das Team, in dem der Spieler ohnehin schon ist, hat sich
  // seine Zugehörigkeit nicht geändert – eine Meldung darüber wäre eine
  // Aussage über ein Ereignis, das nicht stattgefunden hat. `recordTransfer`
  // verwirft diesen Fall aus demselben Grund selbst.
  // ⚠️ NICHT dieselbe Prüfung wie bei `slotsFreigeben` oben (Befund A1 von
  // Kai): Die verlangt zusätzlich `vorherigesTeam &&`, weil es ohne Vorverein
  // keinen Platz freizugeben gibt. Hier ist das Fehlen eines Vorvereins
  // gerade ein gültiger Fall – die Erstzuordnung soll ebenfalls eine Notiz
  // auslösen, und der Text hat dafür eine eigene Fassung. Wer die beiden
  // Bedingungen später vereinheitlicht, verschluckt genau diesen Fall.
  if (zuordnungGeaendert) {
    await benachrichtigeZuordnung(player, vorherigesTeam, team);
  }

  return ok({ message: `${player.firstName} ist jetzt Admin von ${team.teamName}` });
}

export const POST = withErrorHandling(handler);
