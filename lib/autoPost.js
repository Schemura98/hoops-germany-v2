import Post from "@/models/Post";
import Team from "@/models/Team";

// Automatische Ereignis-Beiträge für den Feed. Grundsätze: nie den auslösenden
// Flow (Ergebnis/Transfer/Tryout) kippen → alles in try/catch; idempotent über
// `eventKey`; Render-Daten denormalisiert in content/meta (kein populate nötig).

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// Hält den Auto-Post zu einem Spielergebnis synchron: legt ihn an/aktualisiert ihn,
// sobald ein gültiges Ergebnis vorliegt (bestätigt oder vorläufig), und entfernt ihn
// wieder bei strittigem/zurückgesetztem Ergebnis. Aus submit-match-result UND
// admin/updatematch nach dem Speichern aufrufbar.
export async function syncMatchResultPost(match) {
  try {
    if (!match?._id) return;
    const eventKey = `result:${match._id}`;

    const valid =
      match.status === "completed" &&
      (match.resultStatus === "confirmed" || match.resultStatus === "pending") &&
      match.winningTeamPoints != null &&
      match.losingTeamPoints != null;

    if (!valid) {
      await Post.deleteOne({ eventKey });
      return;
    }

    const [tA, tB] = await Promise.all([
      Team.findById(match.teamA).select("teamName"),
      Team.findById(match.teamB).select("teamName"),
    ]);
    if (!tA || !tB) return;

    // Punkte aus teamA-Sicht ableiten.
    const winId = String(match.winningTeam || "");
    const w = match.winningTeamPoints;
    const l = match.losingTeamPoints;
    const aPts = !winId || winId === String(match.teamA) ? w : l;
    const bPts = !winId || winId === String(match.teamA) ? l : w;

    const headline = `${tA.teamName} ${aPts}:${bPts} ${tB.teamName}`;
    const note =
      match.resultStatus === "confirmed" ? "Endergebnis" : "Vorläufiges Ergebnis";

    await Post.findOneAndUpdate(
      { eventKey },
      {
        $set: {
          kind: "auto",
          autoType: "match_result",
          content: headline,
          teams: [match.teamA, match.teamB],
          meta: { href: `/match/${match._id}`, note },
        },
        $setOnInsert: { likes: [], comments: [], createdAt: new Date() },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("[AUTOPOST match_result]", err);
  }
}

// Auto-Post zu einem Transfer/Beitritt/Gründung. Wird aus recordTransfer mit den
// dort bereits vorhandenen Daten aufgerufen (message ist die fertige Klartextzeile).
export async function autoPostTransfer({
  subjectPlayer,
  teams = [],
  type,
  message,
  playerSlug,
  eventKey,
}) {
  try {
    if (!subjectPlayer || !message) return;
    const autoType = type === "found" ? "team_founded" : "transfer";
    const doc = {
      kind: "auto",
      autoType,
      content: message,
      subjectPlayer,
      teams: teams.filter(Boolean),
      meta: { href: playerSlug ? `/player/view-player/${playerSlug}` : null },
      likes: [],
      comments: [],
      createdAt: new Date(),
    };
    if (eventKey) {
      await Post.findOneAndUpdate(
        { eventKey },
        { $setOnInsert: { ...doc, eventKey } },
        { upsert: true }
      );
    } else {
      await Post.create(doc);
    }
  } catch (err) {
    console.error("[AUTOPOST transfer]", err);
  }
}

// Auto-Post zu einer neuen Tryout-Ausschreibung.
export async function autoPostTryout({ tryout, teamName }) {
  try {
    if (!tryout?._id) return;
    const where = tryout.location ? ` in ${tryout.location}` : "";
    const content = `${teamName || "Ein Team"} sucht Verstärkung – Tryout am ${fmtDate(
      tryout.date
    )}${where}.`;
    await Post.findOneAndUpdate(
      { eventKey: `tryout:${tryout._id}` },
      {
        $setOnInsert: {
          eventKey: `tryout:${tryout._id}`,
          kind: "auto",
          autoType: "tryout",
          content,
          teams: [tryout.teamId].filter(Boolean),
          meta: { href: `/tryouts/${tryout._id}` },
          likes: [],
          comments: [],
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("[AUTOPOST tryout]", err);
  }
}
