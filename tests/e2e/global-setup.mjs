// Harte Sicherung VOR jedem Lauf: Die Suite bricht komplett ab, wenn die
// .env nicht auf die Dev-DB `hoopsgermany` zeigt (Kai-Regel, CLAUDE.md-Warnblock).
import { requireDevDbUri } from "./helpers/env.mjs";

export default async function globalSetup() {
  const uri = requireDevDbUri();
  const host = (uri.match(/@([^/]+)\//) || [])[1] || "?";
  console.log(`[e2e] DB-Guard OK: Dev-DB "hoopsgermany" auf ${host}`);
}
