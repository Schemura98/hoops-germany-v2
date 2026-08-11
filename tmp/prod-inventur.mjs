import https from "node:https";
const post = (path, body) => new Promise((res, rej) => {
  const d = JSON.stringify(body);
  const q = https.request({ hostname: "hoopsgermany.de", path, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(d) } }, (r) => {
    let b = ""; r.on("data", (c) => (b += c)); r.on("end", () => { try { res(JSON.parse(b)); } catch { rej(b.slice(0, 200)); } });
  });
  q.on("error", rej); q.write(d); q.end();
});
const login = await post("/api/admin/adminlogin", { username: "admin", password: process.argv[2] });
if (!login.token) { console.log("Login fehlgeschlagen:", JSON.stringify(login).slice(0, 150)); process.exit(1); }
const t = await post("/api/admin/fetchallteams", { token: login.token });
const p = await post("/api/admin/fetchallplayers", { token: login.token });
const teams = (t.teams || []).filter((x) => !x.isDemo);
console.log(`Teams gesamt ${t.teams.length}, davon ohne Demo-Kennzeichnung ${teams.length}:\n`);
for (const x of teams) {
  const admin = x.adminPlayerId ? `${x.adminPlayerId.firstName || ""} ${x.adminPlayerId.lastName || ""}`.trim() : "—";
  console.log(`  ${String(x.teamName).padEnd(34)} angelegt ${String(x.createdAt).slice(0, 10)}  Admin: ${admin.padEnd(18)} Mail: ${x.email || "—"}  intern: ${!!x.isInternal}`);
}
const spieler = (p.players || []).filter((x) => !x.isDemo);
console.log(`\nSpieler gesamt ${p.players.length}, davon ohne Demo-Kennzeichnung ${spieler.length}:\n`);
for (const x of spieler) {
  console.log(`  ${`${x.firstName} ${x.lastName}`.padEnd(28)} ${String(x.email).padEnd(34)} angelegt ${String(x.createdAt).slice(0, 10)}  Team: ${x.teamId?.teamName || "—"}  intern: ${!!x.isInternal}`);
}
