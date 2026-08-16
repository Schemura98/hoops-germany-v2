// Gate-Konfiguration Kai, sechste Runde – IDENTISCH zur Projekt-Konfiguration
// bis auf den Port. Grund: Am 16.08.2026 hat mein Worktree-Server um 14:33:51
// Port 3000 übernommen, während Tobias' Browser-Gate dort maß. `.claude/
// launch.json` ist versioniert und kennt nur 3000; Tobias hat bewusst keine
// Schreibwerkzeuge und konnte deshalb nicht ausweichen.
// Zwei parallele Gates brauchen zwei Ports – diese Datei ist meiner.
// ⚠️ Bewusst NICHT eingecheckt: Sie liegt nur im Gate-Worktree.
import { defineConfig } from "@playwright/test";
import { PROJECT_ROOT } from "./helpers/env.mjs";

const PORT = Number(process.env.GATE_PORT || 3210);

export default defineConfig({
  testDir: ".",
  outputDir: "./.artifacts/test-results-gate6",
  globalSetup: "./global-setup.mjs",
  globalTeardown: "./global-teardown.mjs",
  workers: 1,
  fullyParallel: false,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    navigationTimeout: 60_000,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    cwd: PROJECT_ROOT,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
