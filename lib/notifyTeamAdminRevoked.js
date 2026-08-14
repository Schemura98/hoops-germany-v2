import Player from "@/models/Player";

// ---------------------------------------------------------------------------
// Meldet dem bisherigen Haupt-Admin, dass seine Verwaltungsrechte über einen
// Verein entzogen wurden.
//
// Warum es das gibt (14.08.2026): Bis zu diesem Tag blieben die Rechte beim
// verdrängten Gründer einfach stehen – er behielt über `teamAdminOf` vollen
// Zugriff auf `/team/admin`, obwohl das Team längst auf jemand anderen zeigte
// (Befund Tobias). Seit der Entzug greift, hätte er ihn erst gemerkt, wenn die
// Seite ihn abweist (Befund Kai). Patrick hat entschieden, das zu schließen.
//
// Eigene lib, weil ZWEI Routen denselben Entzug vornehmen:
// `app/api/admin/setteamadmin/route.js` und
// `app/api/admin/transfer-team-admin/route.js`. Eine Kopie in beiden hätte
// dieselbe Lage erzeugt wie beim Glocken-Leerzustand und den Rechtsverweisen –
// zwei Stellen, die auseinanderlaufen.
//
// Nur In-App, keine Mail: Eine organisatorische Umstellung ist keine Nachricht,
// für die jemand sein Postfach öffnen muss.
//
// Fehlertolerant wie `recordTransfer`: Ein Problem beim Benachrichtigen darf
// den Rechtewechsel selbst nicht kippen.
export async function notifyTeamAdminRevoked(playerId, team, neuerAdmin) {
  try {
    if (!playerId || !team?._id) return;

    // Wortlaut Nele, 14.08.2026. Jede Wendung ist begründet:
    //  • Der Einstieg ist die NEUE Lage, nicht der Verlust. Wer mit „Dir wurden
    //    die Rechte entzogen" anfängt, hat den Leser in der ersten Sekunde in
    //    die Defensive gestellt, und die zweite holt ihn da nicht mehr raus.
    //  • Der NAME des Nachfolgers ist der eigentliche Rückweg – eine Person,
    //    die im selben Verein ist und die Rücknahme auslösen kann. Ihn
    //    stattdessen an ein Formular zu schicken, machte eine vereinsinterne
    //    Sache zu einem Fall für uns.
    //  • „hast du damit nicht mehr" statt „wurden dir entzogen": Zustand, kein
    //    Vorgang mit ihm als Objekt einer Handlung. Er hat nichts getan.
    //  • ⚠️ „Mitglied von X bleibst du" steht im SELBEN Satz, hinter dem
    //    Komma. Das ist die wahrscheinlichste Fehllesart („Rauswurf"), und die
    //    entkräftet man nicht in Satz zwei, sondern im selben Atemzug. Mit
    //    wiederholtem Vereinsnamen – die Kurzform ließe offen, in welchem.
    //  • „Eingetragen hat das die Verwaltung" benennt den Urheber ohne einen
    //    GRUND zu behaupten. Kein „umgestellt"/„korrigiert"/„übergeben" – jedes
    //    davon erfindet die Vorgeschichte. Auch kein „ab sofort"/„vorerst",
    //    beides behauptet etwas über die Dauer.
    //  • „schreib uns" bleibt als ZWEITE Spur, weil `setteamadmin` jemanden zum
    //    Haupt-Admin machen kann, der vorher kein Mitglied war – dann ist der
    //    genannte Name für den Empfänger womöglich ein Fremder. Es ist kein
    //    Versprechen auf Rücknahme, nur darauf, dass jemand zuhört.
    const nachfolger = [neuerAdmin?.firstName, neuerAdmin?.lastName].filter(Boolean).join(" ");
    const wer = nachfolger || "jemand anderem";
    const message =
      `Die Verwaltung von ${team.teamName} liegt jetzt bei ${wer} – die Admin-Rechte ` +
      `für den Verein hast du damit nicht mehr, Mitglied von ${team.teamName} bleibst du. ` +
      `Eingetragen hat das die Verwaltung von Hoops Germany; wenn das nicht stimmt, ` +
      `schreib uns über „Kontakt".`;

    await Player.updateOne(
      { _id: playerId },
      {
        $push: {
          notifications: {
            type: "team_admin_revoked",
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
    console.error("[TEAM_ADMIN_REVOKED NOTIFY ERROR]", err);
  }
}
