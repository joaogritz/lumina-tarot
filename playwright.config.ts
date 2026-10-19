import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "mesa-3d.browser.spec.ts",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      args: [
        "--use-angle=swiftshader",
        "--enable-webgl",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: [
    {
      command: "npm run preview -- --host 127.0.0.1",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "npm run preview -- --host 127.0.0.1 --port 4175 --base /lumina-tarot/",
      url: "http://127.0.0.1:4175/lumina-tarot/",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
