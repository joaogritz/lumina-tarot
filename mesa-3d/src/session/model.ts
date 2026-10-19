import { DECKS } from "../../../src/data/decks.js";

export type DeckId = "tarot" | "lenormand";
export type Quality = "low" | "medium" | "high";
export type Position = { x: number; z: number };
export type Card = {
  instanceId: string;
  cardId: string;
  position: Position;
  rotation: number;
  stackingOrder: number;
  faceUp: boolean;
  isReversed: boolean;
};
export type Note = {
  instanceId: string;
  kind: "position" | "reflection";
  text: string;
  cardInstanceId?: string;
  position: Position;
  rotation: number;
  stackingOrder: number;
};
export type CameraState = {
  alpha: number;
  beta: number;
  radius: number;
  x: number;
  z: number;
};
export type Session = {
  schemaVersion: 1;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  deckId: DeckId;
  remainingCardIds: string[];
  discardedCardIds: string[];
  cards: Card[];
  notes: Note[];
  camera: CameraState;
  preferences: { allowReversed: boolean; snap: boolean };
};
export const LIMITS = {
  x: 8.7,
  z: 5.2,
  notes: 60,
  text: 4000,
  title: 120,
  fileBytes: 512_000,
};
export const DEFAULT_CAMERA: CameraState = {
  alpha: -Math.PI / 2,
  beta: 0.68,
  radius: 22,
  x: 0,
  z: 0,
};
export const clone = <T>(value: T): T => structuredClone(value);
export const clampPosition = (p: Position): Position => ({
  x: Math.max(-LIMITS.x, Math.min(LIMITS.x, p.x)),
  z: Math.max(-LIMITS.z, Math.min(LIMITS.z, p.z)),
});
export function randomUnit() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 4294967296;
}
export function shuffle<T>(values: T[], random = randomUnit): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
// randomUUID is restricted to secure contexts; local-network HTTP can still use getRandomValues.
export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export function createSession(
  deckId: DeckId,
  title = "",
  allowReversed = false,
): Session {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    id: newId(),
    title: title.trim().slice(0, LIMITS.title) || "Minha mesa",
    createdAt: now,
    updatedAt: now,
    deckId,
    remainingCardIds: shuffle(DECKS[deckId].cards.map((c) => c.id)),
    discardedCardIds: [],
    cards: [],
    notes: [],
    camera: { ...DEFAULT_CAMERA },
    preferences: {
      allowReversed: deckId === "tarot" && allowReversed,
      snap: false,
    },
  };
}
export function cardLabel(s: Session, c: Card) {
  return c.faceUp
    ? `${DECKS[s.deckId].cards.find((d) => d.id === c.cardId)?.name}${c.isReversed ? " · invertida" : ""}`
    : `Carta fechada ${s.cards.indexOf(c) + 1}`;
}
export function validateSession(input: unknown): Session {
  const fail = (): never => {
    throw new Error("Arquivo de mesa inválido ou versão não suportada.");
  };
  if (!input || typeof input !== "object") return fail();
  const s = input as Session;
  const text = (v: unknown, max: number) =>
    typeof v === "string" && v.length <= max;
  const num = (v: unknown, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  const id = (v: unknown) => typeof v === "string" && /^[\w-]{1,100}$/.test(v);
  const date = (v: unknown) =>
    typeof v === "string" && v.length < 50 && Number.isFinite(Date.parse(v));
  if (
    s.schemaVersion !== 1 ||
    !id(s.id) ||
    !text(s.title, LIMITS.title) ||
    !date(s.createdAt) ||
    !date(s.updatedAt) ||
    !["tarot", "lenormand"].includes(s.deckId)
  )
    return fail();
  const deckIds = new Set(DECKS[s.deckId].cards.map((c) => c.id));
  if (
    !Array.isArray(s.cards) ||
    !Array.isArray(s.notes) ||
    !Array.isArray(s.remainingCardIds) ||
    !Array.isArray(s.discardedCardIds) ||
    s.cards.length > deckIds.size ||
    s.notes.length > LIMITS.notes
  )
    return fail();
  const all = [
    ...s.remainingCardIds,
    ...s.discardedCardIds,
    ...s.cards.map((c) => c?.cardId),
  ];
  if (
    all.length !== deckIds.size ||
    new Set(all).size !== all.length ||
    all.some((v) => !deckIds.has(v))
  )
    return fail();
  const objects = [...s.cards, ...s.notes];
  if (new Set(objects.map((o) => o?.instanceId)).size !== objects.length)
    return fail();
  for (const o of objects) {
    if (
      !o ||
      !id(o.instanceId) ||
      !o.position ||
      !num(o.position.x, -LIMITS.x, LIMITS.x) ||
      !num(o.position.z, -LIMITS.z, LIMITS.z) ||
      !num(o.rotation, -10000, 10000) ||
      !Number.isInteger(o.stackingOrder) ||
      !num(o.stackingOrder, 0, 100000)
    )
      return fail();
  }
  for (const c of s.cards)
    if (
      typeof c.faceUp !== "boolean" ||
      typeof c.isReversed !== "boolean" ||
      (s.deckId === "lenormand" && c.isReversed)
    )
      return fail();
  for (const n of s.notes)
    if (
      !["position", "reflection"].includes(n.kind) ||
      !text(n.text, n.kind === "position" ? 120 : LIMITS.text) ||
      (n.cardInstanceId !== undefined &&
        !s.cards.some((c) => c.instanceId === n.cardInstanceId))
    )
      return fail();
  const c = s.camera,
    p = s.preferences;
  if (
    !c ||
    !num(c.alpha, -10000, 10000) ||
    !num(c.beta, 0.08, 1.2) ||
    !num(c.radius, 9, 42) ||
    !num(c.x, -6, 6) ||
    !num(c.z, -4, 4) ||
    !p ||
    typeof p.snap !== "boolean" ||
    typeof p.allowReversed !== "boolean" ||
    (s.deckId === "lenormand" && p.allowReversed)
  )
    return fail();
  // Reconstruct known fields only: imported properties never become application configuration.
  return {
    schemaVersion: 1,
    id: s.id,
    title: s.title,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    deckId: s.deckId,
    remainingCardIds: [...s.remainingCardIds],
    discardedCardIds: [...s.discardedCardIds],
    cards: s.cards.map((c) => ({
      instanceId: c.instanceId,
      cardId: c.cardId,
      position: { ...c.position },
      rotation: c.rotation,
      stackingOrder: c.stackingOrder,
      faceUp: c.faceUp,
      isReversed: c.isReversed,
    })),
    notes: s.notes.map((n) => ({
      instanceId: n.instanceId,
      kind: n.kind,
      text: n.text,
      ...(n.cardInstanceId ? { cardInstanceId: n.cardInstanceId } : {}),
      position: { ...n.position },
      rotation: n.rotation,
      stackingOrder: n.stackingOrder,
    })),
    camera: { alpha: c.alpha, beta: c.beta, radius: c.radius, x: c.x, z: c.z },
    preferences: { allowReversed: p.allowReversed, snap: p.snap },
  };
}
export function importSession(json: string): Session {
  if (new TextEncoder().encode(json).length > LIMITS.fileBytes)
    throw new Error("Arquivo muito grande (máximo 512 KB).");
  const s = validateSession(JSON.parse(json));
  s.id = newId();
  s.title = `${s.title.slice(0, 110)} (cópia)`;
  s.createdAt = s.updatedAt = new Date().toISOString();
  return s;
}
