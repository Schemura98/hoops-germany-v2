// Lädt die lokale .env (ohne dotenv-Dependency) und erzwingt die harte
// QA-Grenze: Tests laufen AUSSCHLIESSLICH gegen die Dev-DB `hoopsgermany`.
// NIEMALS gegen `hoops_prod` oder `test` (Produktiv-DBs, siehe CLAUDE.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");

export function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, ".env");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

// Gibt die Mongo-URI zurück ODER wirft, wenn sie nicht auf die Dev-DB zeigt.
export function requireDevDbUri() {
  const uri = loadEnv().MONGODB_URI || "";
  const dbName = (uri.match(/\/([^/?]+)(\?|$)/) || [])[1] || "";
  if (dbName !== "hoopsgermany") {
    throw new Error(
      `ABBRUCH: MONGODB_URI zeigt auf DB "${dbName}" statt auf die Dev-DB ` +
        `"hoopsgermany". E2E-Tests duerfen NIEMALS gegen hoops_prod oder test laufen.`
    );
  }
  return uri;
}
