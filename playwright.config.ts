import { defineConfig } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3145";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: { baseURL },
  webServer: {
    command: `npm run start -- --hostname localhost --port ${port}`,
    url: baseURL,
    timeout: 60_000,
  },
});
