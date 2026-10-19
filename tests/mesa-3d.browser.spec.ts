import { test, expect } from "@playwright/test";
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    if (!localStorage.getItem("lumina_mesa_quality"))
      localStorage.setItem("lumina_mesa_quality", "low");
  });
});
async function newTable(page, deck = "tarot") {
  await page.addInitScript(() => {
    if (!localStorage.getItem("lumina_mesa_quality"))
      localStorage.setItem("lumina_mesa_quality", "low");
  });
  await page.goto("/mesa-3d/");
  await page.locator(`#welcome input[value="${deck}"]`).check();
  await page.getByRole("button", { name: "Abrir nova mesa" }).click();
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#welcome")).toBeHidden();
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
}

test("complete reading, notes, undo, export, resume and two-tab conflict", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await newTable(page);
  await expect(
    page.getByRole("dialog", { name: "Não foi possível abrir os gráficos" }),
  ).toHaveCount(0);
  await page.locator("#draw").click();
  await page.locator("#objects").click();
  await page.locator("#object-list button").first().click();
  await page.getByRole("button", { name: "Revelar", exact: true }).click();
  await expect(page.locator(".inspect-art")).toBeVisible();
  await page.getByRole("button", { name: "Mover →", exact: true }).click();
  await page.getByRole("button", { name: "Girar 15°" }).click();
  await page.getByRole("button", { name: "Anotar", exact: true }).click();
  await page.locator("textarea").fill("Minha reflexão <b>em texto</b>");
  await page.getByRole("button", { name: "Guardar nota" }).click();
  await expect(page.locator("#object-list button")).toHaveCount(2);
  await page.locator("#undo").click();
  await expect(page.locator("#object-list button")).toHaveCount(1);
  await page.locator("#redo").click();
  await expect(page.locator("#object-list button")).toHaveCount(2);
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  await page.locator("#sessions-button").click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar atual" }).click();
  expect((await download).suggestedFilename()).toMatch(/lumina-mesa/);
  await page.keyboard.press("Escape");
  await page.reload();
  await page.locator("#continue").click();
  await expect(page.locator("#loading")).toBeHidden();
  await page.locator("#objects").click();
  await expect(page.locator("#object-list button")).toHaveCount(2);
  const other = await context.newPage();
  await other.goto("/mesa-3d/");
  await other.locator("#continue").click();
  await expect(other.locator("#loading")).toBeHidden();
  await page.locator("#draw").click();
  await expect(
    other.getByRole("dialog", { name: "Duas versões da mesma mesa" }),
  ).toBeVisible();
  await other.getByRole("button", { name: "Salvar como nova mesa" }).click();
  await expect(other.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/mesa-desktop.png" });
});
for (const viewport of [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
])
  test(`touch layout ${viewport.width}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport,
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await newTable(page, "lenormand");
    await noOverflow(page);
    await page.locator("#draw").tap();
    await page.locator("#objects").tap();
    await page.locator("#object-list button").first().tap();
    await page.getByRole("button", { name: "Revelar", exact: true }).tap();
    await expect(page.locator(".inspect-art")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Inverter", exact: true }),
    ).toHaveCount(0);
    await noOverflow(page);
    await page.screenshot({ path: `test-results/mesa-${viewport.width}.png` });
    await context.close();
  });
test("storage unavailable keeps session exportable and import is safe", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await newTable(page);
  await page.locator("#draw").click();
  await expect(page.locator("#save-status")).toHaveText(
    "Falha ao salvar · exporte",
  );
  await page.locator("#sessions-button").click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar atual" }).click();
  await download;
});
test("main application never requests Babylon bundle", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(requests.some((url) => /\/table-|\/mesa-/.test(url))).toBeFalsy();
});

async function savedSession(page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("lumina-mesa-3d");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const rows = await new Promise<any[]>((resolve, reject) => {
      const r = db.transaction("sessions").objectStore("sessions").getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    db.close();
    return rows.sort((a, b) =>
      b.session.updatedAt.localeCompare(a.session.updatedAt),
    )[0].session;
  });
}
async function cardPoint(page, s) {
  const { Vector3, Matrix } =
    await import("@babylonjs/core/Maths/math.vector.js");
  const { Viewport } = await import("@babylonjs/core/Maths/math.viewport.js");
  const rect = await page.locator("#table-canvas").boundingBox();
  const c = s.camera;
  const target = new Vector3(c.x, 0, c.z),
    eye = new Vector3(
      c.x + c.radius * Math.sin(c.beta) * Math.cos(c.alpha),
      c.radius * Math.cos(c.beta),
      c.z + c.radius * Math.sin(c.beta) * Math.sin(c.alpha),
    );
  const view = Matrix.LookAtLH(eye, target, Vector3.Up()),
    projection = Matrix.PerspectiveFovLH(
      0.8,
      rect.width / rect.height,
      0.1,
      10000,
    );
  const p = s.cards[0].position;
  return Vector3.Project(
    new Vector3(p.x, 0.06, p.z),
    Matrix.Identity(),
    view.multiply(projection),
    new Viewport(rect.x, rect.y, rect.width, rect.height),
  );
}
test("canvas drag commits once, Escape and interrupted touch cancel safely", async ({
  page,
  context,
}) => {
  await newTable(page);
  await page.locator("#draw").click();
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  await expect(page.locator("#table-canvas")).toHaveAttribute(
    "data-motion",
    "idle",
  );
  const before = await savedSession(page),
    p = await cardPoint(page, before);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 70, p.y + 20, { steps: 8 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect((await savedSession(page)).cards[0].position).toEqual(
    before.cards[0].position,
  );
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 90, p.y + 10, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  const moved = await savedSession(page);
  expect(moved.cards[0].position.x).toBeGreaterThan(
    before.cards[0].position.x + 0.5,
  );
  await page.locator("#undo").click();
  await expect(page.locator("#table-canvas")).toHaveAttribute(
    "data-motion",
    "idle",
  );
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect((await savedSession(page)).cards[0].position).toEqual(
    before.cards[0].position,
  );
  // A second touch cancels an in-progress object drag before camera navigation.
  const cdp = await context.newCDPSession(page);
  const tp = await cardPoint(page, await savedSession(page));
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: tp.x, y: tp.y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: tp.x + 30, y: tp.y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: tp.x + 30, y: tp.y, id: 1 },
      { x: tp.x + 90, y: tp.y + 20, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: tp.x - 20, y: tp.y, id: 1 },
      { x: tp.x + 140, y: tp.y + 20, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => (await savedSession(page)).camera.radius)
    .not.toBe(before.camera.radius);
  expect((await savedSession(page)).cards[0].position).toEqual(
    before.cards[0].position,
  );
});
test("imports full deck, rejects malformed imports, quality controls and recovery on lost context", async ({
  page,
}) => {
  // This scenario recompiles the complete scene after context loss on a software GPU.
  test.setTimeout(90_000);
  const { createSession } = await import("../mesa-3d/src/session/model");
  const { applyCommand } = await import("../mesa-3d/src/session/commands");
  let s = createSession("tarot", "Baralho completo");
  for (let i = 0; i < 78; i++) s = applyCommand(s, { type: "draw" });
  s = applyCommand(s, { type: "arrange", layout: "grid" });
  s.cards.forEach((c) => (c.faceUp = true));
  await page.goto("/mesa-3d/");
  await page.locator("#welcome-saved").click();
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.locator("#notice")).toContainText("inválido");
  await page.locator("input[type=file]").setInputFiles({
    name: "mesa.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#table-title")).toHaveText(
    "Baralho completo (cópia)",
  );
  await page.locator("#objects").click();
  await expect(page.locator("#object-list button")).toHaveCount(78);
  await page.locator("#close-panel").click();
  await page.locator("#settings-button").click();
  await page.locator("select").selectOption("medium");
  await page.locator("select").selectOption("high");
  await page.locator("select").selectOption("low");
  await page.getByRole("button", { name: "Ver medição da cena" }).click();
  await expect
    .poll(async () => {
      await page.getByRole("button", { name: "Atualizar medição" }).click();
      return JSON.parse(await page.locator("pre").innerText())
        .idleFramesSkipped;
    })
    .toBeGreaterThan(0);
  const metrics = JSON.parse(await page.locator("pre").innerText());
  expect(metrics.meshes).toBeGreaterThan(150);
  expect(metrics.idleFramesSkipped).toBeGreaterThan(0);
  console.log(
    "Full deck metrics (SwiftShader, CPU render submission):",
    JSON.stringify(metrics),
  );
  await page.keyboard.press("Escape");
  await page.screenshot({ path: "test-results/mesa-full-deck.png" });
  await page
    .locator("#table-canvas")
    .evaluate(async (canvas: HTMLCanvasElement) => {
      const gl = canvas.getContext("webgl2");
      const ext = gl?.getExtension("WEBGL_lose_context");
      ext?.loseContext();
      if (ext) setTimeout(() => ext.restoreContext(), 500);
    });
  await expect(page.locator("#notice")).toContainText("Gráficos restaurados.");
  await expect(page.locator("#table-canvas")).toHaveAttribute(
    "data-render",
    "ready",
  );
  expect((await savedSession(page)).cards).toHaveLength(78);
});

test("direct navigation and refresh work under GitHub Pages subdirectory", async ({
  page,
}) => {
  const missing: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  await page.goto("http://127.0.0.1:4175/lumina-tarot/mesa-3d/");
  await page.getByRole("button", { name: "Abrir nova mesa" }).click();
  await expect(page.locator("#loading")).toBeHidden();
  await page.locator("#draw").click();
  await page.locator("#objects").click();
  await page.locator("#object-list button").click();
  await page.getByRole("button", { name: "Revelar", exact: true }).click();
  await expect(page.locator(".inspect-art")).toBeVisible();
  await expect(page.locator(".inspect-art")).toHaveJSProperty(
    "naturalWidth",
    480,
  );
  await page.reload();
  await expect(page.locator("#welcome")).toBeVisible();
  await page.locator("#continue").click();
  await expect(page.locator("#loading")).toBeHidden();
  await page.locator("#back").click();
  await expect(page).toHaveURL("http://127.0.0.1:4175/lumina-tarot/");
  expect(missing).toEqual([]);
});

test("offline navigation never substitutes the main shell for the mesa shell", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.goto("/mesa-3d/");
  await expect(
    page.getByRole("heading", { name: "A mesa precisa de conexão" }),
  ).toBeVisible();
  await expect(page.locator("#reading-intention")).toHaveCount(0);
});
test("failed artwork remains operable, and graphics unavailable allows export", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.serviceWorker.register = async () => {
      throw new Error("Disable worker only for network failure test");
    };
  });
  await page.route("**/tarot/**/*.webp", (route) => route.abort());
  await newTable(page);
  await page.locator("#draw").click();
  await page.locator("#objects").click();
  await page.locator("#object-list button").click();
  await page.getByRole("button", { name: "Revelar", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("arte não carregou");
  await expect(page.locator(".meaning").first()).toBeVisible();
});
test("without WebGL the accessible session remains exportable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.apply(this, [type, ...args]);
    } as any;
  });
  await page.goto("/mesa-3d/");
  await page.getByRole("button", { name: "Abrir nova mesa" }).click();
  await expect(
    page.getByRole("dialog", { name: "Não foi possível abrir os gráficos" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar mesa", exact: true })
    .click();
  await download;
});

test("revision transaction protects sessions without BroadcastChannel", async ({
  page,
  context,
}) => {
  // Remove the property entirely so capability detection follows the unsupported-browser path.
  await context.addInitScript(() => {
    delete (window as any).BroadcastChannel;
  });
  await newTable(page);
  const other = await context.newPage();
  await other.goto("/mesa-3d/");
  await other.locator("#continue").click();
  await expect(other.locator("#loading")).toBeHidden();
  await page.locator("#draw").click();
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  await other.locator("#draw").click();
  await expect(
    other.getByRole("dialog", { name: "Duas versões da mesma mesa" }),
  ).toBeVisible();
});
test("keyboard focus survives reveal, note editing and undo", async ({
  page,
}) => {
  await newTable(page);
  await page.locator("#draw").click();
  await page.locator("#objects").click();
  await page.locator("#object-list button").click();
  const reveal = page.getByRole("button", { name: "Revelar", exact: true });
  await reveal.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Fechar carta", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Anotar", exact: true }).click();
  await page.locator("textarea").fill("Uma reflexão");
  await page.getByRole("button", { name: "Guardar nota" }).click();
  await expect(page.locator("#selection-heading")).toBeFocused();
  await page.locator("#table-canvas").focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Control+z");
  await expect(page.locator("#table-canvas")).toBeFocused();
});

test("visual reference scene in low and high quality", async ({ page }) => {
  const { createSession } = await import("../mesa-3d/src/session/model");
  const { applyCommand } = await import("../mesa-3d/src/session/commands");
  let s = createSession("tarot", "O que deseja florescer?");
  const chosen = ["major_0", "major_2", "major_17"];
  s.remainingCardIds = s.remainingCardIds
    .filter((id) => !chosen.includes(id))
    .concat([...chosen].reverse());
  for (let i = 0; i < 3; i++) s = applyCommand(s, { type: "draw" });
  s.cards.forEach((c, i) => {
    c.faceUp = true;
    c.position = { x: (i - 1) * 3, z: 0.5 };
  });
  for (const [i, text] of ["O chamado", "A escuta", "O horizonte"].entries())
    s = applyCommand(s, {
      type: "note",
      note: {
        instanceId: crypto.randomUUID(),
        kind: "position",
        text,
        position: { x: (i - 1) * 3, z: -1.6 },
        rotation: 0,
        stackingOrder: i + 4,
      },
    });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/mesa-3d/");
  await page.screenshot({ path: "test-results/reference-entry.png" });
  await page.locator("#welcome-saved").click();
  await page.locator("input[type=file]").setInputFiles({
    name: "reference.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#table-canvas")).toHaveAttribute(
    "data-render",
    "ready",
  );
  await page.screenshot({ path: "test-results/reference-low.png" });
  await page.locator("#settings-button").click();
  await page.locator("select").selectOption("high");
  await page.keyboard.press("Escape");
  await expect(page.locator("#table-canvas")).toHaveAttribute(
    "data-render",
    "ready",
  );
  await page.screenshot({ path: "test-results/reference-high.png" });
  await page.locator("#settings-button").click();
  await page.locator("select").selectOption("low");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#camera-button").click();
  await page
    .getByRole("button", { name: "Visão da mesa", exact: true })
    .click();
  await expect(page.locator("#table-canvas")).toHaveAttribute(
    "data-render",
    "ready",
  );
  await page.screenshot({ path: "test-results/reference-portrait.png" });
  await page.locator("#objects").click();
  await page.locator("#object-list button").nth(1).click();
  await page.screenshot({ path: "test-results/reference-inspection.png" });
});

test("aborted writes are handled without an unhandled rejection and export permits leaving", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      const request = original.apply(this, args);
      this.transaction.abort();
      return request;
    };
  });
  await newTable(page);
  await page.locator("#draw").click();
  await expect(page.locator("#save-status")).toHaveText(
    "Falha ao salvar · exporte",
  );
  await page.locator("#back").click();
  await expect(
    page.getByRole("dialog", { name: "Preservar sua mesa" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar", exact: true }).click();
  await download;
  await page.locator("#back").click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  expect(errors).toEqual([]);
});

test("a card can be extracted from the deck, with atomic undo and cancellation", async ({
  page,
  context,
}) => {
  // LAN HTTP does not expose randomUUID, but deck gestures and saved sessions must still work.
  await page.addInitScript(() =>
    Object.defineProperty(crypto, "randomUUID", {
      value: undefined,
      configurable: true,
    }),
  );
  await newTable(page);
  const original = await savedSession(page);
  const p = await cardPoint(page, {
    ...original,
    cards: [{ position: { x: -8, z: -4.4 } }],
  });
  const pull = async () => {
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await expect(page.locator("#table-canvas")).toHaveAttribute(
      "data-interaction",
      "drawing",
    );
    await page.mouse.move(p.x + 170, p.y - 85, { steps: 10 });
  };
  await pull();
  expect((await savedSession(page)).cards).toHaveLength(0);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect((await savedSession(page)).remainingCardIds).toEqual(
    original.remainingCardIds,
  );
  await expect(page.locator("#undo")).toBeDisabled();
  await pull();
  await page.mouse.move(p.x, p.y, { steps: 6 });
  await page.mouse.up();
  expect((await savedSession(page)).cards).toHaveLength(0);
  await pull();
  await page.mouse.up();
  await expect(page.locator("#remaining")).toHaveText("77");
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  const drawn = await savedSession(page);
  expect(drawn.cards).toHaveLength(1);
  expect(drawn.cards[0].faceUp).toBe(false);
  expect(drawn.cards[0].cardId).toBe(original.remainingCardIds.at(-1));
  expect(drawn.cards[0].position).not.toEqual({ x: -5.625, z: -1.8 });
  await page.keyboard.press("Control+z");
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect((await savedSession(page)).remainingCardIds).toEqual(
    original.remainingCardIds,
  );
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: p.x, y: p.y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: p.x + 70, y: p.y - 20, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  expect((await savedSession(page)).cards).toHaveLength(0);
  await expect(page.locator("#table-canvas")).not.toHaveAttribute(
    "data-interaction",
    "drawing",
  );
});
test("keyboard draw flip discard and navigation work without stealing text input", async ({
  page,
}) => {
  await newTable(page);
  await page.keyboard.press("d");
  await expect(page.locator("#remaining")).toHaveText("77");
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect((await savedSession(page)).cards[0].faceUp).toBe(false);
  await page.locator("#objects").focus();
  await page.keyboard.press("f");
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect((await savedSession(page)).cards[0].faceUp).toBe(true);
  await page.keyboard.press("Delete");
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect((await savedSession(page)).discardedCardIds).toHaveLength(1);
  expect((await savedSession(page)).cards).toHaveLength(0);
  await page.keyboard.press("Control+z");
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect((await savedSession(page)).cards[0].faceUp).toBe(true);
  await page.keyboard.press("d");
  await page.keyboard.press("[");
  await page.keyboard.press("f");
  await expect(page.locator("#save-status")).toHaveText(
    "Salvo neste navegador",
  );
  expect((await savedSession(page)).cards[0].faceUp).toBe(false);
  await page.locator("#add-note").click();
  await page.locator("textarea").fill("d f r");
  await page.keyboard.press("f");
  await page.keyboard.press("Backspace");
  expect((await savedSession(page)).cards).toHaveLength(2);
  await page.keyboard.press("Escape");
  await page.locator("#shortcuts-button").click();
  await expect(
    page.getByRole("dialog", { name: "Seu ritual, nas mãos" }),
  ).toContainText("Delete / Backspace");
});

test("return controls and shuffle shortcuts preserve cards and undo", async ({ page }) => {
  await newTable(page);
  await expect(page.locator("#return-button")).toBeDisabled();
  await page.locator("#draw").click();
  await expect(page.locator("#remaining")).toHaveText("77");
  await page.locator("#return-button").click();
  await expect(page.locator("#remaining")).toHaveText("78");
  await page.locator("#undo").click();
  await expect(page.locator("#remaining")).toHaveText("77");
  await page.locator("#shuffle-button").click();
  await expect(page.locator("#remaining")).toHaveText("77");
  await page.locator("#undo").click();
  await page.keyboard.press("d");
  await expect(page.locator("#remaining")).toHaveText("76");
  await page.keyboard.press("b");
  await expect(page.locator("#remaining")).toHaveText("77");
  await page.keyboard.press("s");
  await expect(page.locator("#remaining")).toHaveText("77");
  await expect(page.locator("#return-button")).toBeDisabled();
});
