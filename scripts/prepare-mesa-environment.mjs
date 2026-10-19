import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  args: [
    "--use-angle=swiftshader",
    "--enable-webgl",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(e));
  await page.goto("http://127.0.0.1:5173/mesa-3d/");
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 120000 }),
    page.evaluate(async () => {
      const { prepareEnvironment } =
        await import("/mesa-3d/src/scene/prepareEnvironment.ts");
      await prepareEnvironment();
    }),
  ]);
  await download.saveAs("public/mesa-3d/environments/observatory.env");
} finally {
  await browser.close();
}
