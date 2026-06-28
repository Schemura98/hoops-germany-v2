import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Admin from "@/models/Admin";
import { hasTeamPermission } from "@/lib/teamPermissions";

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

// Wie getTeamFromToken, liefert aber zusätzlich den handelnden Spieler + Rolle:
// { team, playerId, isMainAdmin }. Bei Legacy-Team-Account playerId=null,
// isMainAdmin=true (Vollzugriff). Null, wenn kein Team-Admin-Zugriff.
export async function getTeamWithRole(token) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectDB();

  if (decoded.teamId) {
    const team = await Team.findById(decoded.teamId).select(TEAM_PUBLIC_FIELDS);
    return team ? { team, playerId: null, isMainAdmin: true } : null;
  }

  const playerId = decoded.id || decoded.playerId;
  if (playerId) {
    const player = await Player.findById(playerId).select("isTeamAdmin teamAdminOf");
    if (player?.isTeamAdmin && player.teamAdminOf) {
      const team = await Team.findById(player.teamAdminOf).select(TEAM_PUBLIC_FIELDS);
      if (team) {
        return {
          team,
          playerId: String(player._id),
          isMainAdmin: String(team.adminPlayerId || "") === String(player._id),
        };
      }
    }
  }
  return null;
}

// Team zurückgeben, wenn der Token-Inhaber die Capability `cap` auf dem Team hat,
// sonst null (kein Zugriff ODER fehlende Berechtigung). Für Schreib-Endpunkte.
export async function getTeamForCapability(token, cap) {
  const role = await getTeamWithRole(token);
  if (!role) return null;
  return hasTeamPermission(role.team, role.playerId, cap) ? role.team : null;
}

// Verifiziert einen Admin-Token und lädt den Admin. Akzeptiert ZWEI Quellen:
// 1) echter Admin-Account (Token type="admin")
// 2) Super-Admin-Spieler (Player-Token mit isSuperAdmin) – kein separater Login nötig.
export async function getAdminFromToken(token) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectDB();

  // 1. Echter Admin-Account
  if (decoded.type === "admin" && decoded.adminId) {
    return Admin.findById(decoded.adminId).select("-password");
  }

  // 2. Super-Admin-Spieler
  const playerId = decoded.id || decoded.playerId;
  if (playerId) {
    const player = await Player.findById(playerId).select(
      "firstName lastName email isSuperAdmin"
    );
    if (player?.isSuperAdmin) {
      return {
        _id: player._id,
        username: `${player.firstName} ${player.lastName}`.trim(),
        email: player.email,
        isSuperAdminPlayer: true,
      };
    }
  }

  return null;
}
