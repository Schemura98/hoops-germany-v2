// Teilrechte (Capabilities) für Team-Admins. Reine Logik, kein DB-Zugriff –
// daher sowohl server- als auch clientseitig nutzbar.

export const TEAM_PERMISSIONS = [
  {
    key: "kader",
    label: "Kader & Anfragen",
    desc: "Spieler anlegen/einladen, Kader & Beitrittsanfragen verwalten",
  },
  {
    key: "spiele",
    label: "Spielplan & Ergebnisse",
    desc: "Spiele anlegen, Ergebnisse & Statistiken eintragen",
  },
  {
    key: "tryouts",
    label: "Tryouts",
    desc: "Tryouts ausschreiben und verwalten",
  },
  {
    key: "einstellungen",
    label: "Team-Einstellungen",
    desc: "Teamprofil, Liga, Transfermarkt, Einladungslink, Benachrichtigungen",
  },
];

export const TEAM_PERMISSION_KEYS = TEAM_PERMISSIONS.map((p) => p.key);

// Welcher Tab im Team-Panel braucht welche Capability.
export const TAB_PERMISSION = {
  kader: "kader",
  anfragen: "kader",
  spielplan: "spiele",
  ergebnisse: "spiele",
  tryouts: "tryouts",
  einstellungen: "einstellungen",
};

// Capabilities eines Co-Admins aus dem Team. KEIN Eintrag = Vollzugriff
// (Bestands-Co-Admins behalten ihr bisheriges Verhalten).
export function coAdminPerms(team, playerId) {
  const list = team?.adminPermissions || [];
  const entry = list.find((e) => String(e.player) === String(playerId));
  return entry ? entry.perms || [] : [...TEAM_PERMISSION_KEYS];
}

// Hat der Spieler die Capability auf diesem Team?
// - Kein playerId (Legacy-Team-Account) → Vollzugriff.
// - Haupt-Admin (adminPlayerId) → immer alle Rechte.
// - sonst Co-Admin-Rechte prüfen.
export function hasTeamPermission(team, playerId, cap) {
  if (!playerId) return true;
  if (String(team?.adminPlayerId || "") === String(playerId)) return true;
  return coAdminPerms(team, playerId).includes(cap);
}
