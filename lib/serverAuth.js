import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Admin from "@/models/Admin";

// Sensible Felder, die nie ans Frontend gehen.
export const PLAYER_PUBLIC_FIELDS = "-password -resetPasswordToken -resetPasswordExpiry";
export const TEAM_PUBLIC_FIELDS = "-password";

// Verifiziert einen Player-Token und lädt den zugehörigen Player aus der DB.
// Gibt das Player-Dokument zurück oder null (ungültiger/fehlender Token).
export async function getPlayerFromToken(token) {
  if (!token) return null;

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) return null;

  await connectDB();
  return Player.findById(id).select(PLAYER_PUBLIC_FIELDS);
}

// Dual-Auth-Resolver für Team-Admin-Endpunkte (Spezifikation Abschnitt 7):
// akzeptiert sowohl einen Team-Token (teamId) als auch einen Player-Token,
// sofern der Player Team-Admin ist (isTeamAdmin → teamAdminOf).
// Gibt das Team-Dokument zurück oder null.
export async function getTeamFromToken(token) {
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectDB();

  // 1. Direkter Team-Account
  if (decoded.teamId) {
    return Team.findById(decoded.teamId).select(TEAM_PUBLIC_FIELDS);
  }

  // 2. Spieler, der Team-Admin ist
  const playerId = decoded.id || decoded.playerId;
  if (playerId) {
    const player = await Player.findById(playerId).select("isTeamAdmin teamAdminOf");
    if (player?.isTeamAdmin && player.teamAdminOf) {
      return Team.findById(player.teamAdminOf).select(TEAM_PUBLIC_FIELDS);
    }
  }

  return null;
}

// Verifiziert einen Super-Admin-Token und lädt den Admin.
export async function getAdminFromToken(token) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== "admin" || !decoded.adminId) return null;

  await connectDB();
  return Admin.findById(decoded.adminId).select("-password");
}
