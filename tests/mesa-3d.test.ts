import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  validateSession,
  importSession,
  shuffle,
  LIMITS,
} from "../mesa-3d/src/session/model";
import { applyCommand, History } from "../mesa-3d/src/session/commands";

test("draws every card exactly once; shuffled remainder survives serialization", () => {
  let s = createSession("tarot", "Leitura", true);
  const original = [...s.remainingCardIds];
  for (let i = 0; i < 78; i++) s = applyCommand(s, { type: "draw" });
  assert.equal(new Set(s.cards.map((c) => c.cardId)).size, 78);
  assert.deepEqual(
    s.cards.map((c) => c.cardId),
    original.reverse(),
  );
  assert.equal(applyCommand(s, { type: "draw" }), s);
  let partial = createSession("lenormand");
  partial = applyCommand(partial, { type: "draw" });
  partial = applyCommand(partial, { type: "shuffle" });
  const restored = validateSession(JSON.parse(JSON.stringify(partial)));
  assert.equal(
    applyCommand(restored, { type: "draw" }).cards[1].cardId,
    partial.remainingCardIds.at(-1),
  );
});
test("Lenormand never reverses; Tarot reversals and visual rotation are independent", () => {
  let l = createSession("lenormand", "", true);
  l = applyCommand(l, { type: "draw" }, () => 0);
  l = applyCommand(l, { type: "reverse", id: l.cards[0].instanceId });
  assert.equal(l.cards[0].isReversed, false);
  assert.equal(l.preferences.allowReversed, false);
  let t = applyCommand(
    createSession("tarot", "", true),
    { type: "draw" },
    () => 0,
  );
  const id = t.cards[0].instanceId;
  t = applyCommand(t, { type: "rotate", id, amount: 1 });
  assert.equal(t.cards[0].isReversed, true);
  assert.equal(t.cards[0].rotation, 1);
});
test("commands undo and redo including return, discard, notes and bounded moves", () => {
  const h = new History(createSession("tarot"));
  const before = JSON.stringify(h.state.remainingCardIds);
  h.execute({ type: "draw" });
  const id = h.state.cards[0].instanceId;
  h.execute({ type: "move", id, position: { x: 100, z: -100 } });
  assert.deepEqual(h.state.cards[0].position, { x: LIMITS.x, z: -LIMITS.z });
  h.undo();
  assert.notEqual(h.state.cards[0].position.x, LIMITS.x);
  h.redo();
  h.execute({ type: "reveal", id });
  assert.equal(h.state.cards[0].faceUp, true);
  h.execute({
    type: "note",
    note: {
      instanceId: crypto.randomUUID(),
      kind: "reflection",
      text: "<script>plain text</script>",
      cardInstanceId: id,
      position: { x: 0, z: 0 },
      rotation: 0,
      stackingOrder: 0,
    },
  });
  h.execute({ type: "discard", id });
  assert.equal(h.state.discardedCardIds.length, 1);
  assert.equal(h.state.notes[0].cardInstanceId, undefined);
  h.undo();
  assert.equal(h.state.notes[0].cardInstanceId, id);
  h.execute({ type: "return", id });
  assert.equal(h.state.remainingCardIds[0], h.past.at(-1)!.cards[0].cardId);
  h.undo();
  assert.equal(h.state.cards.length, 1);
  while (h.undo()) {}
  assert.equal(JSON.stringify(h.state.remainingCardIds), before);
  assert.equal(h.state.cards.length, 0);
});
test("import creates a copy and rejects corrupt, duplicate, oversized and unsupported data", () => {
  const s = applyCommand(createSession("tarot"), { type: "draw" });
  assert.notEqual(importSession(JSON.stringify(s)).id, s.id);
  for (const corrupt of [
    { ...s, schemaVersion: 2 },
    { ...s, deckId: "other" },
    { ...s, remainingCardIds: [] },
    { ...s, remainingCardIds: [...s.remainingCardIds, s.cards[0].cardId] },
    { ...s, cards: [{ ...s.cards[0], position: { x: Infinity, z: 0 } }] },
    {
      ...s,
      notes: [
        {
          instanceId: "bad",
          kind: "reflection",
          text: "x",
          position: { x: 0, z: 0 },
          rotation: 0,
          stackingOrder: 0,
          cardInstanceId: "missing",
        },
      ],
    },
    { ...s, camera: { ...s.camera, radius: 100 } },
    { ...s, preferences: { allowReversed: "yes", snap: false } },
  ])
    assert.throws(() => validateSession(corrupt));
  assert.throws(() => importSession(" ".repeat(LIMITS.fileBytes + 1)));
  assert.throws(() => importSession("{"));
  assert.throws(() => validateSession(null));
});
test("full deck arrangements and notes remain within importable bounds", () => {
  let s = createSession("tarot");
  for (let i = 0; i < 78; i++) s = applyCommand(s, { type: "draw" });
  for (const layout of ["row", "column", "grid"] as const) {
    s = applyCommand(s, { type: "arrange", layout });
    assert.doesNotThrow(() => validateSession(s));
  }
  for (let i = 0; i < 61; i++)
    s = applyCommand(s, {
      type: "note",
      note: {
        instanceId: crypto.randomUUID(),
        kind: "position",
        text: "x".repeat(200),
        position: { x: 100, z: 0 },
        rotation: 0,
        stackingOrder: 0,
      },
    });
  assert.equal(s.notes.length, 60);
  assert.equal(s.notes[0].text.length, 120);
  assert.doesNotThrow(() => validateSession(s));
  assert.deepEqual(
    shuffle([1, 2, 3], () => 0),
    [2, 3, 1],
  );
});

test("drawing into a position commits one reversible action without changing the remaining deck order", () => {
  const original = createSession("tarot");
  const h = new History(original);
  h.execute({ type: "draw", position: { x: 2, z: 3 } });
  assert.deepEqual(h.state.cards[0].position, { x: 2, z: 3 });
  assert.deepEqual(
    h.state.remainingCardIds,
    original.remainingCardIds.slice(0, -1),
  );
  assert.equal(h.past.length, 1);
  h.undo();
  assert.deepEqual(h.state.remainingCardIds, original.remainingCardIds);
  assert.equal(h.state.cards.length, 0);
});

test("in-flight cards finish at the latest commanded position and rotation", async () => {
  const { CardMotion } = await import("../mesa-3d/src/cards/motion");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const mesh = {
    position: new Vector3(),
    rotation: new Vector3(),
    getChildMeshes: () => [],
  };
  const motion = new CardMotion(() => false);
  motion.fly(
    "card",
    mesh as any,
    new Vector3(-8, 0.3, -4.4),
    new Vector3(0, 0.1, 0),
  );
  motion.retarget("card", new Vector3(2, 0.2, 3), Math.PI / 12);
  motion.update(performance.now() + 1000);
  assert.deepEqual(mesh.position.asArray(), [2, 0.2, 3]);
  assert.equal(mesh.rotation.y, Math.PI / 12);
  assert.equal(motion.active, false);
});
test("reversing or moving during a flip preserves the final document projection", async () => {
  const { CardMotion } = await import("../mesa-3d/src/cards/motion");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const mesh = {
      position: new Vector3(0, 0.1, 0),
      rotation: new Vector3(),
      getChildMeshes: () => [],
    },
    face = { material: null, rotation: new Vector3() };
  const motion = new CardMotion(() => false);
  motion.flip("card", mesh as any, face as any, null, null, 0, 0);
  motion.retarget("card", new Vector3(3, 0.4, 2), 0.3, Math.PI);
  motion.update(performance.now() + 1000);
  assert.deepEqual(mesh.position.asArray(), [3, 0.4, 2]);
  assert.equal(mesh.rotation.y, 0.3);
  assert.equal(face.rotation.y, Math.PI);
  assert.equal(mesh.rotation.z, 0);
});

test("session IDs remain valid when randomUUID is unavailable on local-network HTTP", async () => {
  const { newId } = await import("../mesa-3d/src/session/model");
  const descriptor = Object.getOwnPropertyDescriptor(crypto, "randomUUID");
  Object.defineProperty(crypto, "randomUUID", {
    value: undefined,
    configurable: true,
  });
  try {
    const ids = new Set(Array.from({ length: 100 }, () => newId()));
    assert.equal(ids.size, 100);
    for (const id of ids)
      assert.match(
        id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    assert.doesNotThrow(() =>
      validateSession(applyCommand(createSession("tarot"), { type: "draw" })),
    );
  } finally {
    if (descriptor) Object.defineProperty(crypto, "randomUUID", descriptor);
    else delete (crypto as any).randomUUID;
  }
});

test("return and shuffle preserve the complete deck and can both be undone", () => {
  const h = new History(createSession("tarot"));
  h.execute({ type: "draw" });
  h.execute({ type: "draw" });
  const before = structuredClone(h.state);
  const id = h.state.cards[0].instanceId;
  const returned = h.state.cards[0].cardId;
  h.execute({ type: "return", id });
  assert.equal(h.state.cards.length, 1);
  assert.ok(h.state.remainingCardIds.includes(returned));
  const returnedState = structuredClone(h.state);
  h.execute({ type: "shuffle" });
  assert.deepEqual(h.state.cards, returnedState.cards);
  assert.deepEqual(h.state.discardedCardIds, returnedState.discardedCardIds);
  const all = [...h.state.remainingCardIds, ...h.state.discardedCardIds, ...h.state.cards.map(c => c.cardId)];
  assert.equal(all.length, 78);
  assert.equal(new Set(all).size, 78);
  h.undo();
  assert.deepEqual(h.state.remainingCardIds, returnedState.remainingCardIds);
  h.undo();
  assert.deepEqual(h.state.cards, before.cards);
  assert.deepEqual(h.state.remainingCardIds, before.remainingCardIds);
});
