import Match from "@/models/Match";
import Player from "@/models/Player";
import Team from "@/models/Team";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { beidseitigBelegt as istBeidseitigBelegt } from "@/lib/matchScore";

// ---------------------------------------------------------------------------
// „Deine Zahlen stehen." – Benachrichtigung an die Spieler eines Box-Scores.
//
// Hintergrund (Ronjas Retention-Befund R1, docs/RETENTION-BEFUND-2026-08-13.md):
// Ein Spieler erfuhr bisher NIE, dass seine Werte gelandet sind. Das Ergebnis
// ging nur an Follower der Teams, der Box-Score an niemanden. Genau das ist
// aber das Kernmotiv der Hauptzielgruppe – und der ehrlichste Wiederaufrufgrund,
// den es gibt: der Nutzer bekommt, wofür er sich registriert hat.
//
// Regeln, die diese Datei durchsetzt:
//  1. Nur Spieler MIT Account (`playerStats[].player`), ohne `didNotPlay` und mit
//     mindestens einem erfassten Wert. Der Statistik-Editor schickt IMMER den
//     ganzen Kader mit – eine 0/0/0-Zeile heißt „noch nicht eingetragen", nicht
//     „hat nichts gemacht". Slot-Spieler ohne Account bekommen nichts.
//  2. Genau einmal je Spieler und Spiel. `Match.notifiedStatsPlayers` merkt sich,
//     wer schon informiert wurde – eine Korrektur des Box-Scores löst deshalb
//     KEINE zweite Nachricht aus. (Ein Spieler, der erst bei der Korrektur
//     dazukommt, bekommt seine erste – das ist kein Duplikat.)
//  3. Der Text trägt den Beleg: die Zahl zählt, weil beide Teams das Ergebnis
//     unabhängig gemeldet haben. Solange nur ein Team gemeldet hat, sagt der Text
//     genau das – und behauptet keine Bestätigung, die es nicht gibt.
//  4. Bei `resultStatus: "mismatch"` wird gar nichts versendet: strittige Zahlen
//     sind kein Erfolgserlebnis. Sobald der Widerspruch aufgelöst ist, greift der
//     Versand nach (niemand ist ja als „benachrichtigt" vermerkt).
//  5. Nur In-App über `Player.notifications`. Kein Mailversand – das ist eine
//     Entscheidung für Patrick, nicht für diese Funktion.
// ---------------------------------------------------------------------------

function plural(n, eins, viele) {
  return `${n} ${n === 1 ? eins : viele}`;
}

// „24 Punkte, 6 Rebounds, 3 Assists" – nur was tatsächlich > 0 ist.
function statLine(s) {
  const teile = [];
  if (s.points > 0) teile.push(plural(s.points, "Punkt", "Punkte"));
  if (s.rebounds > 0) teile.push(plural(s.rebounds, "Rebound", "Rebounds"));
  if (s.assists > 0) teile.push(plural(s.assists, "Assist", "Assists"));
  return teile.join(", ");
}

/**
 * Benachrichtigt alle noch nicht informierten Spieler im Box-Score dieses Spiels.
 * Idempotent: mehrfacher Aufruf erzeugt keine zweite Nachricht.
 *
 * @param {object} match – geladenes Mongoose-Match-Dokument (bereits gespeichert)
 * @returns {Promise<number>} Anzahl tatsächlich versendeter Benachrichtigungen
 */
export async function notifyOwnStats(match) {
  if (!match) return 0;
  // Ohne Ergebnis zählt die Zeile noch nirgends – dann gibt es auch nichts zu melden.
  if (match.status !== "completed") return 0;
  // Strittiges Ergebnis: nichts versenden, nichts vermerken (holt der nächste Aufruf nach).
  if (match.resultStatus === "mismatch") return 0;

  const bereits = new Set((match.notifiedStatsPlayers || []).map(String));
  const gesehen = new Set();
  const kandidaten = [];

  for (const s of match.playerStats || []) {
    if (!s.player || s.didNotPlay) continue;
    const summe = (s.points || 0) + (s.assists || 0) + (s.rebounds || 0);
    if (summe <= 0) continue; // Leerzeile aus dem Kader-Formular
    const id = String(s.player);
    if (bereits.has(id) || gesehen.has(id)) continue;
    gesehen.add(id);
    kandidaten.push(s);
  }
  if (kandidaten.length === 0) return 0;

  const [tA, tB] = await Promise.all([
    Team.findById(match.teamA).select("teamName slug"),
    Team.findById(match.teamB).select("teamName slug"),
  ]);

  // Der Beleg-Satz hängt NICHT allein an `resultStatus`. Der Super-Admin-Pfad
  // (/admin/update-match) setzt ebenfalls "confirmed", obwohl dort nur EINE Person
  // tippt – beide `submittedBy` bleiben leer. Belastbar ist erst die beidseitige
  // Meldung. (Derselbe Fehler wurde am 12.08.2026 im Abzeichen auf /match/[id]
  // gefunden, Befund Kai – hier von Anfang an korrekt.)
  const aGemeldet = match.teamAResult?.ownPoints != null;
  const bGemeldet = match.teamBResult?.ownPoints != null;
  // Seit dem 15.08.2026 aus `lib/matchScore.js` statt hier erneut formuliert.
  // Die Bedingung stand an DREI Stellen wortgleich – und genau deshalb hat
  // eine vierte Fläche (die Anzeigetafel) sie nicht mitbekommen und stattdessen
  // `matchVerification` befragt, was die falsche Antwort gibt. Eine Regel, die
  // man abschreiben muss, wird irgendwann nicht abgeschrieben.
  const beidseitigBelegt = istBeidseitigBelegt(match);
  const versendet = [];

  await Promise.all(
    kandidaten.map(async (s) => {
      const istB = String(s.team) === String(match.teamB);
      const eigenes = istB ? tB : tA;
      const gegner = istB ? tA : tB;
      const gegnerName = gegner?.teamName || "den Gegner";
      const gegnerGemeldet = istB ? aGemeldet : bGemeldet;

      let beleg;
      if (beidseitigBelegt) {
        beleg = "Bestätigt – beide Teams haben das Ergebnis unabhängig gemeldet.";
      } else if (match.resultStatus === "confirmed") {
        // Nachgetragen (Super-Admin) – kein Anspruch auf doppelte Bestätigung.
        beleg = "Das Ergebnis ist eingetragen.";
      } else if (!gegnerGemeldet) {
        beleg = `Noch vorläufig – bestätigt ist die Zahl, sobald ${gegnerName} das Ergebnis ebenfalls meldet.`;
      } else {
        beleg =
          "Noch vorläufig – bestätigt ist die Zahl, sobald auch dein Team das Ergebnis meldet.";
      }

      const message = `Deine Zahlen aus dem Spiel gegen ${gegnerName} stehen: ${statLine(
        s
      )}. ${beleg}`;

      await Player.updateOne(
        { _id: s.player },
        {
          $push: {
            notifications: {
              type: "own_stats",
              teamId: eigenes?._id,
              teamName: eigenes?.teamName,
              teamSlug: eigenes?.slug,
              matchId: match._id,
              message,
              read: false,
              createdAt: new Date(),
            },
          },
        }
      );
      versendet.push(s.player);
    })
  );

  if (versendet.length === 0) return 0;

  // Merkfeld setzen – ab jetzt gilt: dieser Spieler wurde für dieses Spiel informiert.
  await Match.updateOne(
    { _id: match._id },
    { $addToSet: { notifiedStatsPlayers: { $each: versendet } } }
  );
  // In-Memory-Dokument mitziehen, falls der Aufrufer es weiterverwendet.
  match.notifiedStatsPlayers = [...(match.notifiedStatsPlayers || []), ...versendet];

  // Messung (Ronja): Wie viele Spieler wurden benachrichtigt, und wie viele
  // öffnen daraufhin das Spiel? Gegenstück `own_stats_opened` in der Glocke.
  // Fire-and-forget – darf den Speichervorgang nie blockieren.
  AnalyticsEvent.insertMany(
    versendet.map((pid) => ({
      eventType: "own_stats_notified",
      path: `/match/${match._id}`,
      sessionId: "",
      playerId: pid,
    }))
  ).catch((err) => console.error("[OWN STATS EVENT ERROR]", err?.message || err));

  return versendet.length;
}
