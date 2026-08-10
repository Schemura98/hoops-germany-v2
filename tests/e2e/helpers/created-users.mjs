// Registry der von der Suite selbst angelegten Wegwerf-Accounts.
// Nur E-Mails mit diesem Namensraum werden im Teardown geloescht —
// niemals Seed- oder echte Accounts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.resolve(__dirname, "..", ".artifacts");
const REGISTRY_FILE = path.join(ARTIFACTS_DIR, "created-users.json");

// Strikter Namensraum fuer Wegwerf-Adressen dieser Suite.
export const E2E_EMAIL_RE = /^e2e-kai-[a-z0-9.-]+@hoops-e2e\.test$/;

export function newDisposableEmail(tag = "user") {
  return `e2e-kai-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@hoops-e2e.test`;
}

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
  } catch {
    return [];
  }
}

// VOR dem Anlegen aufrufen (Intent aufzeichnen), damit auch bei rotem
// Test-Abbruch aufgeraeumt wird.
export function recordCreatedEmail(email) {
  if (!E2E_EMAIL_RE.test(email)) {
    throw new Error(`E-Mail ${email} liegt nicht im E2E-Namensraum — nicht erlaubt.`);
  }
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  const list = readRegistry();
  if (!list.includes(email)) list.push(email);
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(list, null, 2));
  return email;
}

export function listCreatedEmails() {
  return readRegistry().filter((e) => E2E_EMAIL_RE.test(e));
}

export function clearRegistry() {
  try {
    fs.rmSync(REGISTRY_FILE);
  } catch {}
}
