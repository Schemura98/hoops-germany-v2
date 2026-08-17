// Räumt NUR die von der Suite selbst angelegten Wegwerf-Accounts aus der
// Dev-DB `hoopsgermany` — doppelt abgesichert:
//  1) Nur E-Mails aus der Registry-Datei dieses Laufs,
//  2) UND nur, wenn sie im strikten Namensraum e2e-kai-*@hoops-e2e.test liegen.
// Seed-Accounts (max@test.de usw.) werden nie angefasst.
import mongoose from "mongoose";
import { requireDevDbUri } from "./helpers/env.mjs";
import {
  listCreatedEmails,
  clearRegistry,
  E2E_EMAIL_RE,
} from "./helpers/created-users.mjs";

export default async function globalTeardown() {
  const emails = listCreatedEmails();
  if (emails.length === 0) {
    console.log("[e2e] Teardown: keine selbst angelegten Accounts zu löschen.");
    return;
  }

  const uri = requireDevDbUri(); // wirft, falls nicht Dev-DB
  await mongoose.connect(uri);
  try {
    const db = mongoose.connection;
    if (db.name !== "hoopsgermany") {
      throw new Error(
        `ABBRUCH: verbunden mit DB "${db.name}" statt hoopsgermany`,
      );
    }
    const safe = emails.filter((e) => E2E_EMAIL_RE.test(e));
    const res = await db
      .collection("players")
      .deleteMany({ email: { $in: safe } });
    console.log(
      `[e2e] Teardown: ${res.deletedCount}/${safe.length} Wegwerf-Account(s) aus Dev-DB entfernt:`,
      safe.join(", "),
    );
    clearRegistry();
  } finally {
    await mongoose.disconnect();
  }
}
