import { defineConfig, devices } from "@playwright/test";

/** Stress test config — max parallelism for concurrent user simulation */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "stress.spec.ts",
  timeout: 30000,
  retries: 0,
  workers: 10, // 10 concurrent workers = 10 simultaneous users
  reporter: [["html", { open: "never", outputFolder: "stress-report" }], ["list"]],

  use: {
    baseURL: "https://gardenstate.ai",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10000,
  },

  projects: [
    {
      name: "stress",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  outputDir: "./e2e-results/stress",
});
