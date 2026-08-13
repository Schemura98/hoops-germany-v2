import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import Player from "@/models/Player";
import { getTeamForCapability } from "@/lib/serverAuth";
import { recordAudit } from "@/lib/audit";
import { notifyOwnStats } from "@/lib/statsNotify";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

function toCount(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// POST /api/team/match-stats/save – Spieler-Statistiken des eigenen Teams setzen.
// Ersetzt die bestehenden playerStats-Einträge DIESES Teams (Score bleibt unberührt).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "spiele");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();
  const match = await Match.findById(body.matchId);
  if (!match) {
    return fail("Spiel nicht gefunden", 404);
  }

  const involved =
    String(match.teamA) === String(team._id) ||
    String(match.teamB) === String(team._id);
  if (!involved) {
    return fail("Keine Berechtigung für dieses Spiel", 403);
  }

  const incoming = Array.isArray(body.stats) ? body.stats : [];

  // Jede playerId muss zu DIESEM Team gehoeren (Fund von Kai, 13.08.2026).
  //
  // Vorher wurde `s.playerId` ungeprueft aus dem Body uebernommen. Ein
  // freigegebener Team-Admin konnte damit einem beliebigen, aus /spieler
  // abgelesenen Konto erfundene Werte zuschreiben — die Zeile lief in
  // Topscorer und oeffentlichen Box-Score ein, und seit lib/statsNotify.js
  // bekommt das Opfer zusaetzlich eine Benachrichtigung darueber. Der
  // Datenintegritaets-Teil war schon vorher live, die Benachrichtigung machte
  // ihn sichtbar.
  //
  // Drei Quellen gelten als erlaubt — die dritte ist der Grund, warum hier
  // nicht einfach der aktuelle Kader steht:
  const erlaubteSpieler = new Set();

  // 1. Aktueller Kader.
  const kader = await Player.find({ teamId: team._id }).select("_id").lean();
  for (const p of kader) erlaubteSpieler.add(String(p._id));

  // 2. Beanspruchte Kaderplaetze — deckt den Zustand zwischen Anspruch und
  //    Freigabe ab, in dem `Player.teamId` noch nicht gesetzt ist.
  for (const slot of team.rosterSlots || []) {
    if (slot.claimedBy) erlaubteSpieler.add(String(slot.claimedBy));
  }

  // 3. Wer in DIESEM Spiel bereits fuer dieses Team erfasst war. Ohne das
  //    waere eine spaetere Korrektur an einem alten Spiel unmoeglich, sobald
  //    ein Spieler den Verein gewechselt hat — die Statistik gehoert aber zu
  //    dem Spiel, nicht zum heutigen Kader.
  for (const s of match.playerStats || []) {
    if (String(s.team) === String(team._id) && s.player) {
      erlaubteSpieler.add(String(s.player));
    }
  }

  const fremdeSpieler = incoming
    .map((s) => s.playerId)
    .filter((id) => id && !erlaubteSpieler.has(String(id)));
  if (fremdeSpieler.length) {
    return fail("Mindestens ein Spieler gehört nicht zu diesem Team.", 403);
  }

  // Dasselbe fuer Kaderplaetze ohne Konto: ein fremder Platz waere zwar
  // harmlos (keine Benachrichtigung, keine Karriere-Statistik), aber er wuerde
  // einen fremden Namen in den oeffentlichen Box-Score schreiben.
  const eigeneSlots = new Set(
    (team.rosterSlots || []).map((slot) => String(slot._id)),
  );
  const fremdeSlots = incoming
    .map((s) => s.rosterSlotId)
    .filter((id) => id && !eigeneSlots.has(String(id)));
  if (fremdeSlots.length) {
    return fail("Mindestens ein Kaderplatz gehört nicht zu diesem Team.", 403);
  }

  const entries = incoming
    .filter((s) => s.playerId || s.rosterSlotId || s.playerName)
    .map((s) => ({
      player: s.playerId || null,
      playerName: s.playerName || undefined,
      rosterSlotId: s.rosterSlotId || undefined,
      team: team._id,
      points: toCount(s.points),
      assists: toCount(s.assists),
      rebounds: toCount(s.rebounds),
      didNotPlay: !!s.didNotPlay,
    }));

  // Bestehende Einträge dieses Teams entfernen, neue setzen
  match.playerStats = (match.playerStats || []).filter(
    (s) => String(s.team) !== String(team._id)
  );
  match.playerStats.push(...entries);
  await match.save();

  // Audit: Bearbeitung der Statistiken eines bereits gespielten Spiels protokollieren
  // (Score/Ergebnis bleibt unberührt; nur die eigenen Spieler-Stats werden ersetzt).
  if (match.status === "completed") {
    const decoded = verifyToken(token);
    await recordAudit({
      entityType: "match",
      entityId: match._id,
      action: "stats_edited",
      actorPlayerId: decoded?.id || decoded?.playerId || undefined,
      actorName: team.teamName,
      actorRole: "team_admin",
      teamId: team._id,
      summary: `${team.teamName} bearbeitete die Spieler-Statistiken (${entries.length} Einträge)`,
    });
  }

  // Spieler über ihre eigenen Werte informieren (nur beim ersten Mal je Spieler –
  // eine Korrektur löst keine zweite Nachricht aus, s. lib/statsNotify.js).
  // Fire-and-forget in der Wirkung: ein Fehler hier darf das Speichern nie kippen.
  try {
    await notifyOwnStats(match);
  } catch (err) {
    console.error("[OWN STATS NOTIFY ERROR]", err);
  }

  return ok({ message: "Statistiken gespeichert." });
}

export const POST = withErrorHandling(handler);
