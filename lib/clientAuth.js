"use client";

import { TOKEN_KEYS } from "@/lib/constants";

// Sichere localStorage-Zugriffe mit Null-/SSR-Checks
// (vermeidet das bekannte Altproblem: direkte localStorage-Zugriffe ohne Guards).

function isBrowser() {
  return typeof window !== "undefined";
}

export function setPlayerToken(token) {
  if (!isBrowser() || !token) return;
  window.localStorage.setItem(TOKEN_KEYS.PLAYER, token);
}

export function getPlayerToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEYS.PLAYER);
}

export function clearPlayerToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEYS.PLAYER);
}

export function setTeamToken(token) {
  if (!isBrowser() || !token) return;
  window.localStorage.setItem(TOKEN_KEYS.TEAM, token);
}

export function getTeamToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEYS.TEAM);
}

export function clearTeamToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEYS.TEAM);
}

export function setAdminToken(token) {
  if (!isBrowser() || !token) return;
  window.localStorage.setItem(TOKEN_KEYS.ADMIN, token);
}

// Token für Admin-Anfragen: echter Admin-Token, sonst der Spieler-Token –
// ein eingeloggter Super-Admin-Spieler braucht so KEINEN separaten Admin-Login.
// Der Server (getAdminFromToken) entscheidet, ob der Token Admin-Rechte hat.
export function getAdminToken() {
  if (!isBrowser()) return null;
  return (
    window.localStorage.getItem(TOKEN_KEYS.ADMIN) ||
    window.localStorage.getItem(TOKEN_KEYS.PLAYER)
  );
}

export function clearAdminToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEYS.ADMIN);
}

// Optional: einfache Hilfsdaten zum Player im localStorage
export function setStoredPlayer(player) {
  if (!isBrowser() || !player) return;
  window.localStorage.setItem("player", JSON.stringify(player));
}

export function getStoredPlayer() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem("player");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
