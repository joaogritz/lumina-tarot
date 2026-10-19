import {
  type Session,
  type Position,
  type Note,
  clone,
  shuffle,
  randomUnit,
  newId,
  clampPosition,
  LIMITS,
} from "./model";
export type Command =
  | { type: "draw"; position?: Position }
  | { type: "shuffle"; jump?: boolean }
  | { type: "move"; id: string; position: Position }
  | { type: "rotate"; id: string; amount: number }
  | {
      type: "reveal" | "reverse" | "discard" | "return" | "deleteNote";
      id: string;
    }
  | { type: "arrange"; layout: "row" | "column" | "grid" }
  | { type: "note"; note: Note }
  | { type: "title"; title: string }
  | { type: "snap"; enabled: boolean };
export function shuffleJump(random = randomUnit) {
  return random() < 1 / 50;
}

export function applyCommand(
  state: Session,
  command: Command,
  random = randomUnit,
): Session {
  const s = clone(state);
  const order =
    Math.max(
      0,
      ...s.cards.map((c) => c.stackingOrder),
      ...s.notes.map((n) => n.stackingOrder),
    ) + 1;
  const objects = [...s.cards, ...s.notes];
  const target =
    "id" in command
      ? objects.find((c) => c.instanceId === command.id)
      : undefined;
  const card = target && "cardId" in target ? target : undefined;
  switch (command.type) {
    case "draw": {
      const cardId = s.remainingCardIds.pop();
      if (!cardId) return state;
      const i = s.cards.length;
      s.cards.push({
        instanceId: newId(),
        cardId,
        position: clampPosition(
          command.position || {
            x: ((i % 6) - 2.5) * 2.25,
            z: Math.min(3.5, Math.floor(i / 6) * 1.1 - 1.8),
          },
        ),
        rotation: 0,
        stackingOrder: order,
        faceUp: false,
        isReversed:
          s.deckId === "tarot" && s.preferences.allowReversed && random() < 0.5,
      });
      break;
    }
    case "shuffle": {
      if (s.remainingCardIds.length < 2) return state;
      s.remainingCardIds = shuffle(s.remainingCardIds, random);
      // Keep shuffle and its optional jumper in a single undoable transaction.
      if (command.jump) {
        const next = applyCommand(s, { type: "draw" }, random);
        const jumper = next.cards.at(-1)!;
        jumper.rotation = -Math.PI / 12;
        return next;
      }
      break;
    }
    case "move":
      if (target) {
        const p = clampPosition(command.position);
        if (s.preferences.snap) {
          p.x = Math.round(p.x * 2) / 2;
          p.z = Math.round(p.z * 2) / 2;
        }
        target.position = clampPosition(p);
        target.stackingOrder = order;
      }
      break;
    case "rotate":
      if (target)
        target.rotation = (target.rotation + command.amount) % (Math.PI * 2);
      break;
    case "reveal":
      if (card) card.faceUp = !card.faceUp;
      break;
    case "reverse":
      if (card && s.deckId === "tarot") card.isReversed = !card.isReversed;
      break;
    case "discard":
    case "return":
      if (card) {
        s.cards = s.cards.filter((c) => c !== card);
        (command.type === "return"
          ? s.remainingCardIds
          : s.discardedCardIds
        ).unshift(card.cardId);
        s.notes.forEach((n) => {
          if (n.cardInstanceId === card.instanceId) delete n.cardInstanceId;
        });
      }
      break;
    case "deleteNote":
      s.notes = s.notes.filter((n) => n.instanceId !== command.id);
      break;
    case "arrange": {
      const count = s.cards.length;
      const cols =
        command.layout === "column"
          ? 1
          : command.layout === "row"
            ? count
            : Math.min(8, Math.max(1, Math.ceil(Math.sqrt(count * 1.5))));
      const rows = Math.ceil(count / cols),
        dx = Math.min(2.25, 16 / Math.max(1, cols - 1)),
        dz = Math.min(3.5, 9 / Math.max(1, rows - 1));
      s.cards.forEach((c, i) => {
        c.position = {
          x: ((i % cols) - (cols - 1) / 2) * dx,
          z: (Math.floor(i / cols) - (rows - 1) / 2) * dz,
        };
        c.rotation = 0;
        c.stackingOrder = i + 1;
      });
      break;
    }
    case "note": {
      const i = s.notes.findIndex(
        (n) => n.instanceId === command.note.instanceId,
      );
      const note = clone(command.note);
      note.text = note.text.slice(
        0,
        note.kind === "position" ? 120 : LIMITS.text,
      );
      note.position = clampPosition(note.position);
      if (i >= 0) s.notes[i] = note;
      else if (s.notes.length < LIMITS.notes) {
        note.stackingOrder = order;
        s.notes.push(note);
      } else return state;
      break;
    }
    case "title":
      s.title = command.title.trim().slice(0, LIMITS.title) || "Minha mesa";
      break;
    case "snap":
      s.preferences.snap = command.enabled;
      break;
  }
  s.updatedAt = new Date().toISOString();
  return s;
}
export class History {
  state: Session;
  past: Session[] = [];
  future: Session[] = [];
  constructor(session: Session) {
    this.state = clone(session);
  }
  execute(command: Command) {
    const next = applyCommand(this.state, command);
    if (next === this.state) return false;
    this.past.push(this.state);
    if (this.past.length > 100) this.past.shift();
    this.state = next;
    this.future = [];
    return true;
  }
  undo() {
    const previous = this.past.pop();
    if (!previous) return false;
    this.future.push(this.state);
    this.state = {
      ...previous,
      camera: this.state.camera,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  redo() {
    const next = this.future.pop();
    if (!next) return false;
    this.past.push(this.state);
    this.state = {
      ...next,
      camera: this.state.camera,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
}
