// Playwright-Konfiguration für die Hoops-Germany-E2E-Suite (Auth-Kernpfad).
// Start: npx playwright test -c tests/e2e/playwright.config.mjs
import { defineConfig } from "@playwright/test";
import { PROJECT_ROOT } from "./helpers/env.mjs";

export default defineConfig({
  testDir: ".",
  outputDir: "./.artifacts/test-results",
  globalSetup: "./global-setup.mjs",
  globalTeardown: "./global-teardown.mjs",
  // Seriell: kleine Suite, deterministisch, kein Registry-Race.
  workers: 1,
  fullyParallel: false,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    navigationTimeout: 60_000,
    screenshot: "only-on-failure",
  },
  // Dev-Server wird automatisch gestartet (bzw. ein laufender wiederverwendet).
  // Projektregel beachtet: hier läuft NIE `npm run build`, nur `next dev`.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    cwd: PROJECT_ROOT,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
