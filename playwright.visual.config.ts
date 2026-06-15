import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    ...devices["Pixel 5"],
    baseURL: "http://127.0.0.1:5176",
    colorScheme: "dark",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5176",
    url: "http://127.0.0.1:5176",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
