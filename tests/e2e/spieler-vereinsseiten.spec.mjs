// Wächter für die Spieler-/Vereinsseiten-Runde vom 23.08.2026 (Pakete A–D).
// Drei Zusicherungen, jede vor der Übernahme einmal ROT gesehen (am Stand vor
// dem Fix, HEAD 78781f3, eigener Worktree):
//
// (1) LESERICHTUNG DER PUNKTE ÜBER DREI FLÄCHEN (Befund A1, schwerster der
//     Runde): Für ein VERLORENES Spiel müssen Admin-Spielplan, Admin-
//     Ergebnisse-Reiter und die öffentliche Teamseite dieselbe Reihenfolge
//     „dein Team : Gegner" zeigen. Bis zum 23.08.2026 druckte der Spielplan-
//     Reiter „Sieger : Verlierer" – drei verlorene Spiele lasen sich als
//     Siege. Bei SIEGEN fallen beide Lesarten zusammen; deshalb misst dieser
//     Test ausschließlich an verlorenen Spielen und erklärt sich für
//     WERTLOS STATT BESTANDEN, wenn die Datenbank keines hergibt.
//     Die Soll-Reihenfolge kommt aus der API (winningTeam/Points), nicht aus
//     festen Zahlen – ein neuer Seed bricht den Test nicht.
//
// (2) BETRACHTERABHÄNGIGE BELEG-ZEILE (Befund A2): „deine Werte" darf NUR auf
//     dem eigenen Profil stehen. Auf einem fremden Profil stand bis zum
//     23.08.2026 „deine Werte" über fremden Zahlen – ein Scout las fremde
//     Werte als seine ausgewiesen (Muster „Zahlen, die lügen"). Gemessen wird
//     die gefährliche Richtung zuerst: KEIN „deine Werte" auf fremdem Profil.
//
// (3) TABS OHNE QUERLAUF (Befund A3): Auf 320–430 px muss die Team-Detailseite
//     exakt fensterbreit sein UND der letzte Reiter per Scroll IN DER LEISTE
//     erreichbar. Beides gehört zusammen: Ein overflow-hidden würde den
//     Querlauf heilen und den News-Reiter unerreichbar machen – der halbe Fix
//     wäre schlimmer als keiner. Vor dem Fix: 380 px Seite in 320er-Fenster.
import { test, expect } from "@playwright/test";

const PW = "test123";
const ADMIN_MAIL = "max@test.de"; // Team-Admin Test Baskets (Dev-Seed)
const TEAM_SLUG = "test-baskets";

async function anmelden(request, email) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email, password: PW },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token für ${email} – ohne Anmeldung prüft dieser Test nichts.`,
  ).toBe(true);
  return { token, player: j?.data?.player || j?.player || null };
}

// Willkommens-Tour stummschalten (legt sich sonst über jede Seite) und
// Anmeldung setzen – wie nach einem echten Login inklusive gespeicherter
// Spielerdaten (view-player liest viewerId aus localStorage["player"]).
async function alsSpieler(page, { token, player }) {
  await page.addInitScript(
    (d) => {
      if (d.token) {
        localStorage.setItem("playerAuthToken", d.token);
        sessionStorage.setItem("hg_welcome_token", d.token);
      } else {
        sessionStorage.setItem("hg_welcome_token", "gast");
      }
      if (d.player) localStorage.setItem("player", JSON.stringify(d.player));
    },
    { token: token || null, player: player || null },
  );
}

// Verlorene, abgeschlossene Spiele des eigenen Teams aus der API – die EINE
// Quelle für die Sollwerte aller drei Flächen. winningTeam kommt hier
// unpopuliert (rohe Kennung); die Zeile deckt beide Formen ab.
async function verloreneSpiele(request, token) {
  const res = await request.post("/api/team/matches/list", { data: { token } });
  const j = await res.json().catch(() => ({}));
  const teamId = String(j?.data?.teamId || j?.teamId || "");
  const matches = j?.data?.matches || j?.matches || [];
  expect(teamId.length > 5, "matches/list lieferte keine teamId").toBe(true);
  const verloren = matches.filter((m) => {
    if (m.status !== "completed" || m.winningTeamPoints == null) return false;
    const sieger = String(m.winningTeam?._id || m.winningTeam || "");
    return sieger && sieger !== teamId;
  });
  return { teamId, matches, verloren };
}

function gegnerName(m, teamId) {
  const istA = String(m.teamA?._id || m.teamA) === teamId;
  const gegner = istA ? m.teamB : m.teamA;
  return gegner?.teamName || "";
}

test.describe("Spieler-/Vereinsseiten (Pakete A–D, 23.08.2026)", () => {
  test("A1: verlorenes Spiel liest sich auf allen drei Flächen als eigene:Gegner mit N", async ({
    page,
    request,
  }) => {
    const konto = await anmelden(request, ADMIN_MAIL);
    const { teamId, verloren } = await verloreneSpiele(request, konto.token);

    // Ehrlichkeitsschranke: Ohne verlorenes Spiel ist dieser Test blind –
    // bei Siegen fallen richtige und falsche Reihenfolge zusammen.
    expect(
      verloren.length,
      "Kein verlorenes Spiel in der Dev-DB – der Test kann die Leserichtung " +
        "nicht messen. Das ist WERTLOS, nicht bestanden (seed-demo.mjs legt " +
        "verlorene Juli-Spiele an).",
    ).toBeGreaterThan(0);

    const m = verloren[0];
    const eigene = m.losingTeamPoints; // verloren ⇒ eigene Punkte = Verlierer
    const gegner = m.winningTeamPoints;
    const name = gegnerName(m, teamId);
    const richtig = `${eigene}:${gegner}`;
    const falsch = `${gegner}:${eigene}`;

    await alsSpieler(page, konto);

    // Fläche 1: Admin-Spielplan – eigene:Gegner plus N-Kürzel.
    await page.goto("/team/admin?tab=spielplan");
    const spielplan = page.locator("main");
    await expect(spielplan.getByText(richtig, { exact: false }).first()).toBeVisible({
      timeout: 15000,
    });
    // Das Kürzel hängt an derselben Zeile wie der Score.
    const zeile = page
      .locator("span.font-mono", { hasText: richtig })
      .locator("xpath=..");
    await expect(zeile.first()).toContainText("N");
    // Und die falsche Reihenfolge steht NICHT daneben: Derselbe Score darf im
    // Spielplan nicht zusätzlich als Sieger:Verlierer auftauchen.
    await expect(spielplan.locator(`span.font-mono:has-text("${falsch}")`)).toHaveCount(0);

    // Fläche 2: Ergebnisse-Reiter (dort mit Leerzeichen um den Doppelpunkt).
    await page.goto("/team/admin?tab=ergebnisse");
    await expect(
      page.locator("main").getByText(`${eigene} : ${gegner}`).first(),
    ).toBeVisible({ timeout: 15000 });

    // Fläche 3: öffentliche Teamseite, Vergangen-Ansicht – dieselbe Richtung,
    // und die Zeile ist ein Link zum Spielbericht (C1).
    await page.goto(`/team/team-detail/${TEAM_SLUG}`);
    await page.getByRole("button", { name: "Spielplan" }).first().click();
    await page.getByRole("button", { name: "Vergangen" }).click();
    const reihe = page.locator(`a[href="/match/${m._id}"]`);
    await expect(reihe, "Spielzeile ist kein Link auf /match/[id] (C1)").toBeVisible({
      timeout: 15000,
    });
    await expect(reihe).toContainText(`${eigene} : ${gegner}`);
    if (name) await expect(reihe).toContainText(name);
  });

  test("A2: die Beleg-Zeile nennt nur auf dem eigenen Profil »deine Werte«", async ({
    browser,
    request,
  }) => {
    const konto = await anmelden(request, ADMIN_MAIL);

    // Station aufklappen, bis eine Beleg-Zeile sichtbar wird. Meldet ehrlich,
    // wenn keine Station Spieldaten hergibt – dann wurde nichts gemessen.
    async function belegZeilen(page, url) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const stationen = page.locator("tr[class*='cursor-pointer']");
      const n = await stationen.count();
      expect(
        n,
        `Keine aufklappbare Karriere-Station auf ${url} – Beleg-Zeile nicht messbar (wertlos, nicht bestanden).`,
      ).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        await stationen.nth(i).click();
        try {
          await page
            .locator("p", { hasText: "Endstand ·" })
            .first()
            .waitFor({ timeout: 4000 });
          break;
        } catch {
          /* nächste Station – nicht jede hat Spiele */
        }
      }
      const zeilen = await page
        .locator("p", { hasText: "Endstand ·" })
        .allInnerTexts();
      expect(
        zeilen.length,
        `Keine Station mit Spielzeilen auf ${url} – nicht messbar.`,
      ).toBeGreaterThan(0);
      return zeilen.map((z) => z.replace(/\s+/g, " "));
    }

    // Eigenes Profil: „deine Werte".
    const eigenCtx = await browser.newContext();
    const eigen = await eigenCtx.newPage();
    await alsSpieler(eigen, konto);
    const eigenZeilen = await belegZeilen(eigen, "/player/player-detail");
    expect(eigenZeilen.join(" ")).toContain("deine Werte");
    await eigenCtx.close();

    // Fremdes Profil, angemeldet: neutral MIT Vornamen, ohne „deine".
    // Leon steht im selben Kader und hat Spieldaten (Dev-Seed).
    const fremdCtx = await browser.newContext();
    const fremd = await fremdCtx.newPage();
    await alsSpieler(fremd, konto);
    const fremdZeilen = await belegZeilen(fremd, "/player/view-player/leon-schneider-2");
    expect(
      fremdZeilen.join(" "),
      "»deine Werte« über den Zahlen eines FREMDEN Spielers – genau der Befund A2.",
    ).not.toContain("deine Werte");
    expect(fremdZeilen.join(" ")).toContain("Werte von Leon");
    await fremdCtx.close();

    // Ausgeloggt auf Max' Profil: ebenfalls neutral.
    const gastCtx = await browser.newContext();
    const gast = await gastCtx.newPage();
    await alsSpieler(gast, { token: null, player: null });
    const gastZeilen = await belegZeilen(gast, "/player/view-player/max-mustermann-1");
    expect(gastZeilen.join(" ")).not.toContain("deine Werte");
    expect(gastZeilen.join(" ")).toContain("Werte von Max");
    await gastCtx.close();
  });

  for (const breite of [320, 360, 390, 430]) {
    test(`A3: Team-Detailseite ohne Querlauf auf ${breite}px, letzter Reiter erreichbar`, async ({
      browser,
    }) => {
      const ctx = await browser.newContext({
        viewport: { width: breite, height: 800 },
      });
      const page = await ctx.newPage();
      await page.addInitScript(() =>
        sessionStorage.setItem("hg_welcome_token", "gast"),
      );
      await page.goto(`/team/team-detail/${TEAM_SLUG}`);
      await page.waitForLoadState("networkidle");
      // Reiterleiste muss stehen, sonst misst der Querlauf-Teil eine leere Seite.
      await expect(page.getByRole("button", { name: "News" })).toBeAttached({
        timeout: 15000,
      });

      const mass = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      expect(
        mass.scrollW,
        `Seite ist ${mass.scrollW}px breit in einem ${mass.innerW}px-Fenster – Querlauf (Befund A3).`,
      ).toBe(mass.innerW);

      // Der letzte Reiter muss per Scroll IN DER LEISTE erreichbar sein –
      // ein overflow-hidden würde den Querlauf heilen und den Reiter opfern.
      const news = await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find((b) =>
          b.textContent.trim().startsWith("News"),
        );
        if (!btn) return null;
        const scroller = btn.closest("div");
        let el = btn.parentElement;
        let found = null;
        while (el && el !== document.body) {
          const s = getComputedStyle(el);
          if (s.overflowX === "auto" || s.overflowX === "scroll") {
            found = el;
            break;
          }
          el = el.parentElement;
        }
        if (found) found.scrollLeft = found.scrollWidth;
        const r = btn.getBoundingClientRect();
        return {
          hatScroller: Boolean(found),
          sichtbar: r.width > 0 && r.right <= window.innerWidth + 1 && r.left >= -1,
        };
      });
      expect(news, "News-Reiter nicht gefunden").not.toBeNull();
      expect(
        news.hatScroller,
        "Die Reiterleiste hat keinen eigenen Scroll-Rahmen (overflow-x) – " +
          "der letzte Reiter wäre auf schmalen Fenstern unerreichbar.",
      ).toBe(true);
      expect(news.sichtbar, "News-Reiter nach Leisten-Scroll nicht im Fenster").toBe(true);
      await ctx.close();
    });
  }
});
