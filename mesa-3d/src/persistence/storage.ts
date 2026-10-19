import { openDB, type IDBPDatabase } from "idb";
import { type Session, validateSession, clone } from "../session/model";
export class ConflictError extends Error {
  constructor() {
    super(
      "Esta mesa foi alterada em outra aba. Salve uma cópia para preservar suas mudanças.",
    );
  }
}
export type SavedRecord = { id: string; revision: number; session: Session };
export class SessionStorage {
  private db?: IDBPDatabase;
  private channel?: BroadcastChannel;
  onExternalSave: (id: string, revision: number) => void = () => {};
  async open() {
    this.db = await openDB("lumina-mesa-3d", 1, {
      upgrade(db) {
        db.createObjectStore("sessions", { keyPath: "id" });
      },
    });
    if ("BroadcastChannel" in globalThis) {
      this.channel = new BroadcastChannel("lumina-mesa-3d");
      this.channel.onmessage = (e) => {
        if (
          typeof e.data?.id === "string" &&
          Number.isInteger(e.data?.revision)
        )
          this.onExternalSave(e.data.id, e.data.revision);
      };
    }
  }
  async list(): Promise<SavedRecord[]> {
    if (!this.db)
      throw new Error(
        "Armazenamento indisponível. Exporte a mesa para guardar uma cópia.",
      );
    return (await this.db.getAll("sessions"))
      .map((r) => ({ ...r, session: validateSession(r.session) }))
      .sort((a, b) => b.session.updatedAt.localeCompare(a.session.updatedAt));
  }
  async save(session: Session, expectedRevision: number): Promise<number> {
    if (!this.db)
      throw new Error(
        "Armazenamento indisponível. Exporte a mesa para guardar uma cópia.",
      );
    const data = validateSession(clone(session));
    const tx = this.db.transaction("sessions", "readwrite");
    // A failed request and its transaction each reject. Observe both, including quota/abort failures.
    const completed = tx.done;
    void completed.catch(() => {});
    const previous: SavedRecord | undefined = await tx.store.get(data.id);
    if ((previous?.revision || 0) !== expectedRevision) {
      tx.abort();
      await completed.catch(() => {});
      throw new ConflictError();
    }
    const revision = expectedRevision + 1;
    await tx.store.put({ id: data.id, revision, session: data });
    await completed;
    this.channel?.postMessage({ id: data.id, revision });
    return revision;
  }
  close() {
    this.channel?.close();
    this.db?.close();
  }
}
