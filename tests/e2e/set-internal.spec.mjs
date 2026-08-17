// Deploy-Gate 939e73a: /api/admin/set-internal (isInternal-Kennzeichnung).
// Deckt Patricks 5 Prüfschwerpunkte ab: Auth, Eingabevalidierung,
// Mass-Assignment, additive Modelländerung, keine ungewollten Feldlecks.
// Läuft AUSSCHLIESSLICH gegen die Dev-DB `hoopsgermany` (Guard in global-setup).
// Voraussetzung: Seed-Daten via `node scripts/seed-demo.mjs`.
//
// Fasst am Ende jedes mutierenden Tests den Ursprungszustand wieder an
// (isInternal zurück auf false) – Seed-Daten bleiben unverändert liegen.
import { test, expect } from "@playwright/test";
import jwt from "jsonwebtoken";
import { loadEnv } from "./helpers/env.mjs";

const SUPER_ADMIN = { email: "p.schemura@gmail.com", password: "test123" };
const REGULAR_PLAYER = { email: "sven.adler@test.de", password: "test123" }; // kein Super-Admin

const SECRET_KEY = loadEnv().SECRET_KEY;

async function apiLogin(request, creds) {
  const res = await request.post("/api/player/playerlogin", { data: creds });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  return body.token;
}

async function findTeamByName(request, adminToken, name) {
  const res = await request.post("/api/admin/fetchallteams", {
    data: { token: adminToken },
  });
  const body = await res.json();
  return body.teams.find((t) => t.teamName === name);
}

async function findPlayerByEmail(request, adminToken, email) {
  const res = await request.post("/api/admin/fetchallplayers", {
    data: { token: adminToken },
  });
  const body = await res.json();
  return body.players.find((p) => p.email === email);
}

test.describe("POST /api/admin/set-internal – Auth", () => {
  test("ohne Token → 401", async ({ request }) => {
    const res = await request.post("/api/admin/set-internal", {
      data: { art: "team", id: "000000000000000000000000", isInternal: true },
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).success).toBe(false);
  });

  test("normaler Spieler-Token (kein Super-Admin) → 401, keine Änderung", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const team = await findTeamByName(request, adminToken, "Test Baskets");
    expect(team.isInternal).toBe(false);

    const playerToken = await apiLogin(request, REGULAR_PLAYER);
    const res = await request.post("/api/admin/set-internal", {
      headers: { Authorization: `Bearer ${playerToken}` },
      data: { art: "team", id: team._id, isInternal: true },
    });
    expect(res.status()).toBe(401);

    const after = await findTeamByName(request, adminToken, "Test Baskets");
    expect(after.isInternal).toBe(false); // unverändert
  });

  test("gültiger Team-Token (kryptografisch valide, aber kein Admin) → 401", async ({
    request,
  }) => {
    expect(
      SECRET_KEY,
      ".env SECRET_KEY nicht lesbar – Testvoraussetzung fehlt",
    ).toBeTruthy();
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const team = await findTeamByName(request, adminToken, "Test Baskets");

    // Team-Token selbst geschmiedet (wie signTeamToken in lib/auth.js), um zu
    // prüfen, dass getAdminFromToken einen echten Team-Token nicht durchlässt –
    // unabhängig davon, ob gerade ein Team mit Login-Passwort existiert.
    const craftedTeamToken = jwt.sign(
      { teamId: team._id, type: "team" },
      SECRET_KEY,
      {
        expiresIn: "1h",
      },
    );
    const res = await request.post("/api/admin/set-internal", {
      headers: { Authorization: `Bearer ${craftedTeamToken}` },
      data: { art: "team", id: team._id, isInternal: true },
    });
    expect(res.status()).toBe(401);
  });

  test("Super-Admin-Spieler-Token → 200, Feld wird gesetzt", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const team = await findTeamByName(request, adminToken, "Test Baskets");
    expect(team.isInternal).toBe(false);

    try {
      const res = await request.post("/api/admin/set-internal", {
        data: {
          token: adminToken,
          art: "team",
          id: team._id,
          isInternal: true,
        },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.isInternal).toBe(true);
      expect(body.name).toBe("Test Baskets");

      const after = await findTeamByName(request, adminToken, "Test Baskets");
      expect(after.isInternal).toBe(true);
    } finally {
      // Ursprungszustand wiederherstellen.
      await request.post("/api/admin/set-internal", {
        data: {
          token: adminToken,
          art: "team",
          id: team._id,
          isInternal: false,
        },
      });
      const restored = await findTeamByName(
        request,
        adminToken,
        "Test Baskets",
      );
      expect(restored.isInternal).toBe(false);
    }
  });
});

test.describe("POST /api/admin/set-internal – Eingabevalidierung", () => {
  test("ungültiger 'art'-Wert → 400, keine 500", async ({ request }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const res = await request.post("/api/admin/set-internal", {
      data: {
        token: adminToken,
        art: "verein",
        id: "000000000000000000000000",
        isInternal: true,
      },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).success).toBe(false);
  });

  test("fehlende id → 400", async ({ request }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const res = await request.post("/api/admin/set-internal", {
      data: { token: adminToken, art: "team", isInternal: true },
    });
    expect(res.status()).toBe(400);
  });

  test("gültige, aber nicht existierende ObjectId → 404", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const res = await request.post("/api/admin/set-internal", {
      data: {
        token: adminToken,
        art: "team",
        id: "000000000000000000000000",
        isInternal: true,
      },
    });
    expect(res.status()).toBe(404);
  });

  // BEFUND (Schwerpunkt 2, siehe Bericht): eine strukturell ungültige
  // ObjectId (kein 24-stelliger Hex-String) landet ungeprüft in
  // findByIdAndUpdate. Mongoose wirft einen CastError, withErrorHandling
  // fängt ihn zwar sauber ab (kein Stacktrace nach außen), antwortete aber
  // mit 500 statt 400. Behoben am 12.08.2026 (mongoose.isValidObjectId-Prüfung
  // vor dem Schreibzugriff) – dieser Test hält das Soll fest: Falscheingabe
  // ist 400, und es darf weiterhin keine interne Pfadinfo nach außen gehen.
  test("strukturell ungültige id (kein ObjectId) → 400, ohne interne Details", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const res = await request.post("/api/admin/set-internal", {
      data: {
        token: adminToken,
        art: "team",
        id: "not-a-valid-object-id",
        isInternal: true,
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Ungültige ID");
    expect(JSON.stringify(body)).not.toMatch(/at .*\.js:\d+/); // keine Stack-Frame-Zeile
  });
});

test.describe("POST /api/admin/set-internal – Mass Assignment", () => {
  test("zusätzliche Body-Felder (teamName, isSuperAdmin) werden ignoriert", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const team = await findTeamByName(request, adminToken, "Test Baskets");

    try {
      const res = await request.post("/api/admin/set-internal", {
        data: {
          token: adminToken,
          art: "team",
          id: team._id,
          isInternal: true,
          teamName: "GEHACKT",
          approved: false,
          region: "Nirgendwo",
        },
      });
      expect(res.status()).toBe(200);

      const after = await findTeamByName(request, adminToken, "Test Baskets");
      expect(after.teamName).toBe("Test Baskets"); // unverändert
      expect(after.approved).toBe(true); // unverändert
      expect(after.region).toBe("Berlin"); // unverändert
      expect(after.isInternal).toBe(true); // nur DIESES Feld geändert
    } finally {
      await request.post("/api/admin/set-internal", {
        data: {
          token: adminToken,
          art: "team",
          id: team._id,
          isInternal: false,
        },
      });
    }
  });

  test("Player-Pfad: nur isInternal ändert sich, restliche Felder unverändert", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, SUPER_ADMIN);
    const player = await findPlayerByEmail(
      request,
      adminToken,
      REGULAR_PLAYER.email,
    );
    expect(player.isInternal).toBe(false);

    try {
      const res = await request.post("/api/admin/set-internal", {
        data: {
          token: adminToken,
          art: "spieler",
          id: player._id,
          isInternal: true,
          isSuperAdmin: true, // Versuch: Rechteausweitung über den Endpoint
          email: "uebernommen@example.com",
        },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.isInternal).toBe(true);
      expect(body.name).toBe("Sven Adler");

      const after = await findPlayerByEmail(
        request,
        adminToken,
        REGULAR_PLAYER.email,
      );
      expect(after.isInternal).toBe(true);
      expect(after.isSuperAdmin).toBe(false); // NICHT eskaliert
      expect(after.email).toBe(REGULAR_PLAYER.email); // unverändert
    } finally {
      await request.post("/api/admin/set-internal", {
        data: {
          token: adminToken,
          art: "spieler",
          id: player._id,
          isInternal: false,
        },
      });
    }
  });
});
