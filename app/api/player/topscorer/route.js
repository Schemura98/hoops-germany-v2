import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import League from "@/models/League";
import Team from "@/models/Team";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

const LIMIT = 100;

// POST /api/player/topscorer – Topscorer-Tabelle (Aggregation über playerStats).
//
// Filter (alle optional):
//   body.season   → nur Spiele der Ligen dieser Saison
//   body.leagueId → nur Spiele DIESER Liga (schlägt season, weil spezifischer)
//   body.token    → eigener Rang + Vorschlag „meine Liga"
//
// Warum der Liga-Filter existiert: Ohne ihn wird ein Kreisliga-Spieler gegen
// Regionalliga-Spieler einsortiert und steht strukturell unten. Genau die Zahl,
// die ihn zurückholen soll, demotiviert ihn dann (Befund Ronja R5, 13.08.2026).
//
// Liefert zusätzlich `seasons` und `leagues` (nur Ligen mit gewerteten Spielen)
// für die Filter sowie `viewer` (eigener Rang), wenn ein gültiger Token kam.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const season = typeof body.season === "string" ? body.season.trim() : "";
  const leagueId =
    typeof body.leagueId === "string" && mongoose.isValidObjectId(body.leagueId)
      ? body.leagueId
      : "";

  await connectDB();

  const seasons = (await League.distinct("season")).filter(Boolean).sort().reverse();

  // Nur Ligen anbieten, in denen tatsächlich schon gespielt wurde – ein Filter,
  // der auf eine leere Tabelle führt, ist eine Sackgasse mit Extraschritt.
  const gespielteLigaIds = (
    await Match.distinct("leagueId", { status: "completed" })
  ).filter(Boolean);
  const leagues = (
    await League.find({ _id: { $in: gespielteLigaIds } })
      .select("name season")
      .sort({ season: -1, name: 1 })
      .lean()
  ).map((l) => ({ _id: String(l._id), name: l.name, season: l.season }));

  // Wer zusieht: entscheidet über den eigenen Rang und – beim ersten Aufruf
  // ohne gesetzten Filter – über die Vorauswahl „meine Liga".
  const token = typeof body.token === "string" ? body.token : "";
  const me = token ? await getPlayerFromToken(token) : null;
  let ownLeagueId = null;
  if (me?.teamId) {
    const team = await Team.findById(me.teamId).select("leagueId").lean();
    if (team?.leagueId) ownLeagueId = String(team.leagueId);
  }

  // „Platz 3 der 1. Kreisliga Niers" ist eine Aussage, die ein Mensch seinem
  // Team schickt. „Platz 214 von allen" ist keine – deshalb ist die eigene Liga
  // die Vorauswahl, sobald wir sie kennen und der Aufruf keine andere nennt.
  const angewandteLiga =
    leagueId ||
    (body.ownLeague && ownLeagueId && gespielteLigaIds.some((x) => String(x) === ownLeagueId)
      ? ownLeagueId
      : "");

  // ⚠️ WORTWAHL IN DER OBERFLAECHE HAENGT AN DIESER ZEILE.
  //
  // Gefiltert wird auf `status: "completed"` — NICHT auf `resultStatus` und
  // erst recht nicht auf beidseitiges `submittedBy`. `submit-match-result`
  // setzt `status = "completed"` unbedingt, also auch bei einseitiger Meldung
  // (`pending`) und bei Widerspruch (`mismatch`). Diese Tabelle enthaelt
  // deshalb Spiele, die NICHT doppelt bestaetigt sind.
  //
  // Die Seite sagt aus diesem Grund "gewertete Spiele" und nicht "bestaetigte
  // Spiele" (Fund von Kai, 13.08.2026 — vorher stand dort "bestaetigt", was
  // eine Belegaussage an einen Status haengte, der sie nicht traegt).
  //
  // Wer den Filter spaeter verschaerft, darf das Wort wieder aendern. Wer das
  // Wort aendert, ohne den Filter zu verschaerfen, baut den Fehler neu ein.
  const matchStage = { status: "completed" };
  if (angewandteLiga) {
    matchStage.leagueId = new mongoose.Types.ObjectId(angewandteLiga);
  } else if (season) {
    const ids = (await League.find({ season }).select("_id").lean()).map((l) => l._id);
    matchStage.leagueId = { $in: ids };
  }

  const scorers = await Match.aggregate([
    { $match: matchStage },
    { $unwind: "$playerStats" },
    {
      $match: {
        "playerStats.player": { $ne: null },
        "playerStats.didNotPlay": { $ne: true },
      },
    },
    // Pro Spieler UND Team (= Team zum Zeitpunkt des Spiels) summieren.
    {
      $group: {
        _id: { player: "$playerStats.player", team: "$playerStats.team" },
        games: { $sum: 1 },
        points: { $sum: { $ifNull: ["$playerStats.points", 0] } },
        assists: { $sum: { $ifNull: ["$playerStats.assists", 0] } },
        rebounds: { $sum: { $ifNull: ["$playerStats.rebounds", 0] } },
      },
    },
    // Nach Punkten sortieren, damit $first unten das punktreichste Team trifft.
    { $sort: { points: -1 } },
    // Pro Spieler gesamt aufsummieren; Label-Team = wo die meisten Punkte erzielt wurden.
    {
      $group: {
        _id: "$_id.player",
        games: { $sum: "$games" },
        points: { $sum: "$points" },
        assists: { $sum: "$assists" },
        rebounds: { $sum: "$rebounds" },
        primaryTeam: { $first: "$_id.team" },
      },
    },
    // Spielerinfos
    {
      $lookup: {
        from: "players",
        localField: "_id",
        foreignField: "_id",
        as: "player",
      },
    },
    { $unwind: "$player" },
    // Team, für das die Punkte erzielt wurden (nicht das aktuelle Team).
    {
      $lookup: {
        from: "teams",
        localField: "primaryTeam",
        foreignField: "_id",
        as: "team",
      },
    },
    { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        playerId: "$_id",
        firstName: "$player.firstName",
        lastName: "$player.lastName",
        slug: "$player.slug",
        position: "$player.position",
        isDemo: { $ifNull: ["$player.isDemo", false] },
        teamName: "$team.teamName",
        teamSlug: "$team.slug",
        games: 1,
        points: 1,
        assists: 1,
        rebounds: 1,
        ppg: {
          $cond: [{ $gt: ["$games", 0] }, { $divide: ["$points", "$games"] }, 0],
        },
      },
    },
    { $sort: { points: -1, ppg: -1 } },
  ]);

  // Eigener Rang. Bewusst NICHT über den abgeschnittenen Auszug bestimmt: Wer
  // auf Platz 137 steht, hat ein Recht auf die Wahrheit statt auf gar keine
  // Antwort. Der Rang wird deshalb über die volle Sortierung gezählt und erst
  // danach wird gekürzt. Die Aggregation liefert eine Zeile je Spieler mit
  // gewerteten Spielen – bei dieser Größenordnung ist das unkritisch.
  let viewer = null;
  if (me) {
    const idx = scorers.findIndex((s) => String(s.playerId) === String(me._id));
    if (idx >= 0) {
      const vor = idx > 0 ? scorers[idx - 1] : null;
      viewer = {
        playerId: String(me._id),
        rank: idx + 1,
        total: scorers.length,
        points: scorers[idx].points,
        ppg: scorers[idx].ppg,
        // Abstand nach vorn: eine Tatsache aus Zahlen, die ohnehin auf dem
        // Bildschirm stehen – keine erfundene Verknappung.
        gapAhead: vor ? vor.points - scorers[idx].points : null,
      };
    } else {
      viewer = { playerId: String(me._id), rank: null, total: scorers.length };
    }
  }

  return ok({
    scorers: scorers.slice(0, LIMIT),
    seasons,
    leagues,
    viewer,
    ownLeagueId,
    appliedLeagueId: angewandteLiga || "",
  });
}

export const POST = withErrorHandling(handler);
