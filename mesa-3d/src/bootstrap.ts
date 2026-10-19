import "./styles/fonts.css";
import "./styles/mesa.css";
import "./styles/refinement.css";
import { decorateTools } from "./ui/icons";
decorateTools();
import { DECKS } from "../../src/data/decks.js";
import { CARD_ARTWORK } from "../../src/data/cardArtwork.js";
import {
  createSession,
  newId,
  importSession,
  clone,
  LIMITS,
  type Session,
  type DeckId,
  type Note,
  type Quality,
} from "./session/model";
import { ShuffleSound } from "./audio/shuffleSound";
const shuffleSound = new ShuffleSound();
import { History, shuffleJump, type Command } from "./session/commands";
import {
  SessionStorage,
  ConflictError,
  type SavedRecord,
} from "./persistence/storage";
import type { Table } from "./engine/table";

import { $, button, paragraph } from "./ui/dom";

const storage = new SessionStorage();
let history: History | undefined,
  table: Table | undefined,
  selected: string | undefined,
  records: SavedRecord[] = [];
let exportedChange = -1;
let revision = 0,
  dirty = false,
  changeNumber = 0,
  timer: ReturnType<typeof setTimeout> | undefined,
  saveQueue = Promise.resolve(),
  conflicted = false;
let noticeTimer: ReturnType<typeof setTimeout> | undefined,
  modalReturn: HTMLElement | null = null,
  panelReturn: HTMLElement | null = null;
let starting = false,
  welcomeAfterModal = false;
let quality: Quality = "medium";
try {
  const q = localStorage.getItem("lumina_mesa_quality");
  if (q === "low" || q === "medium" || q === "high") quality = q;
} catch {
  /* Preferences remain in memory. */
}
const welcome = $<HTMLDialogElement>("welcome"),
  modal = $<HTMLDialogElement>("modal");
function announce(text: string) {
  $("announcement").textContent = text;
}
function notice(text: string, persistent = false) {
  clearTimeout(noticeTimer);
  $("notice").textContent = text;
  $("notice").hidden = false;
  announce(text);
  if (!persistent)
    noticeTimer = setTimeout(() => ($("notice").hidden = true), 7000);
}
function status(text: string) {
  if ($("save-status").textContent !== text)
    $("save-status").textContent = text;
}
function session() {
  if (!history) throw new Error("Abra uma mesa primeiro.");
  return history.state;
}
function scheduleSave() {
  dirty = true;
  changeNumber++;
  status("Salvando…");
  clearTimeout(timer);
  timer = setTimeout(() => void flush(), 450);
}
function flush(): Promise<void> {
  clearTimeout(timer);
  saveQueue = saveQueue.then(async () => {
    if (!history || !dirty || conflicted) return;
    const data = clone(session()),
      change = changeNumber;
    try {
      revision = await storage.save(data, revision);
      if (changeNumber === change) dirty = false;
      status(dirty ? "Salvando…" : "Salvo neste navegador");
      if (dirty) scheduleSave();
    } catch (e) {
      conflicted = e instanceof ConflictError;
      status(conflicted ? "Conflito entre abas" : "Falha ao salvar · exporte");
      notice(
        conflicted && e instanceof Error
          ? e.message
          : "Não foi possível salvar neste navegador. Sua mesa continua aqui; exporte uma cópia para guardá-la.",
        true,
      );
      if (conflicted) showConflict();
    }
  });
  return saveQueue;
}
function execute(command: Command) {
  if (!history) return;
  if (command.type === "shuffle") command = { ...command, jump: shuffleJump() };
  const previousCardCount = session().cards.length;
  if (history.execute(command)) {
    const jumped = command.type === "shuffle" && session().cards.length > previousCardCount;
    if (jumped) table?.prepareJumper();
    if (command.type === "draw" || jumped) {
      selected = session().cards.at(-1)?.instanceId;
      announce("Carta retirada, ainda fechada. Use Revelar para vê-la.");
    }
    if (
      selected &&
      ![...session().cards, ...session().notes].some(
        (o) => o.instanceId === selected,
      )
    )
      selected = undefined;
    scheduleSave();
    render();
    if (command.type === "shuffle") {
      table?.shuffleDeck();
      void shuffleSound.play();
      if (jumped) notice("Uma carta saltou do bolo! Selecione Virar ou pressione F para revelar.");
      announce(jumped
        ? "Uma carta saltou do bolo para a mesa! Continua fechada; F para revelar."
        : "Bolo embaralhado.");
    }
    if (command.type === "return") announce("Carta devolvida ao bolo. Ctrl Z para desfazer.");
    if (["shuffle", "draw", "reveal", "discard", "return", "note"].includes(command.type))
      void flush();
  }
}
function showModal(title: string, content: HTMLElement | string) {
  modalReturn = document.activeElement as HTMLElement;
  $("modal-title").textContent = title;
  $("modal-body").replaceChildren(
    typeof content === "string" ? paragraph(content) : content,
  );
  if (!modal.open) modal.showModal();
}
function closeModal() {
  modal.close();
}
$("modal-close").onclick = closeModal;
modal.addEventListener("close", () => {
  if (welcomeAfterModal && !history) {
    welcomeAfterModal = false;
    welcome.showModal();
  } else if (modalReturn?.isConnected) modalReturn.focus();
  else ($("selection-heading") || $("objects")).focus();
});
welcome.addEventListener("cancel", (e) => {
  if (!history) e.preventDefault();
});
async function start(s: Session, savedRevision = 0) {
  if (starting) return;
  starting = true;
  await flush();
  if (history && dirty && exportedChange !== changeNumber) {
    starting = false;
    notice(
      "Guarde sua mesa com Exportar ou Salvar cópia antes de abrir outra.",
      true,
    );
    showRecovery();
    return;
  }
  welcomeAfterModal = false;
  if (welcome.open) welcome.close();
  if (modal.open) modal.close();
  $("loading").hidden = false;
  $("loading-step").textContent = "Carregando o motor 3D…";
  table?.dispose();
  table = undefined;
  history = new History(s);
  revision = savedRevision;
  dirty = false;
  exportedChange = -1;
  conflicted = false;
  selected = undefined;
  try {
    const { Table } = await import("./engine/table");
    $("loading-step").textContent = "Preparando madeira, tecido e iluminação…";
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    table = new Table(
      $<HTMLCanvasElement>("table-canvas"),
      {
        select: (id, inspect) => {
          selected = id;
          render();
          if (id && inspect) setPanel(true);
          if (id)
            announce(
              "Objeto selecionado. As ações estão no painel e na lista.",
            );
        },
        move: (id, position) => execute({ type: "move", id, position }),
        returnCard: (id) => execute({ type: "return", id }),
        draw: (position) => execute({ type: "draw", position }),
        camera: (camera) => {
          if (history) {
            const old = history.state.camera;
            const changed = (
              Object.keys(camera) as (keyof typeof camera)[]
            ).some((key) => Math.abs(old[key] - camera[key]) > 0.0001);
            if (changed) {
              history.state.camera = camera;
              scheduleSave();
            }
          }
        },
        message: (m) => notice(m),
        context: (lost) => {
          notice(
            lost
              ? "A conexão gráfica foi interrompida. Sua mesa continua disponível para exportação."
              : "Gráficos restaurados.",
          );
        },
      },
      quality,
    );
    table.setCamera(s.camera);
    if (savedRevision === 0 && innerWidth < 700) table.view("table");
    render();
    $("loading-step").textContent = "Finalizando os materiais da mesa…";
    let readyTimeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        table.ready(),
        new Promise<never>((_, reject) => {
          readyTimeout = setTimeout(
            () =>
              reject(new Error("O carregamento dos gráficos demorou demais.")),
            20000,
          );
        }),
      ]);
    } finally {
      clearTimeout(readyTimeout);
    }
    if (savedRevision === 0) {
      scheduleSave();
      await flush();
    } else status("Salvo neste navegador");
    $("hint").textContent =
      "Segure e puxe do monte · F para virar · Del para descartar · Dois dedos para navegar";
    $("table-canvas").focus();
  } catch (e) {
    console.error(e);
    table?.dispose();
    table = undefined;
    // Keep the document operational even when graphics are unavailable.
    if (!history) history = new History(s);
    render();
    setPanel(true);
    if (savedRevision === 0) {
      scheduleSave();
      void flush();
    }
    showModal(
      "Não foi possível abrir os gráficos",
      recoveryContent(
        "Você pode acessar a lista de objetos, exportar a mesa ou tentar novamente.",
      ),
    );
  } finally {
    $("loading").hidden = true;
    starting = false;
  }
}
function recoveryContent(message: string) {
  const box = document.createElement("div");
  box.append(paragraph(message));
  box.append(
    button("Exportar mesa", exportCurrent),
    button("Tentar gráficos novamente", () => {
      const s = clone(session());
      dirty = false;
      void start(s, revision);
    }),
  );
  const a = document.createElement("a");
  a.href = "../";
  a.textContent = "Voltar ao Lumina";
  a.className = "text-link";
  box.append(a);
  return box;
}
function setPanel(open: boolean, focus = false) {
  if (open && $("inspector").hidden)
    panelReturn = document.activeElement as HTMLElement;
  $("inspector").hidden = !open;
  $("objects").setAttribute("aria-expanded", String(open));
  if (focus && open) $("close-panel").focus();
  if (!open) {
    if (panelReturn?.isConnected) panelReturn.focus();
    else $("objects").focus();
  }
}
$("objects").onclick = () => setPanel(Boolean($("inspector").hidden), true);
$("close-panel").onclick = () => setPanel(false);
function render() {
  if (!history) return;
  const s = session();
  $("table-title").textContent = s.title;
  $("remaining").textContent = String(s.remainingCardIds.length);
  $("deck-caption").textContent =
    `${DECKS[s.deckId].name} · ${s.cards.length} ${s.cards.length === 1 ? "carta" : "cartas"} na mesa`;
  const chosen = s.cards.find((c) => c.instanceId === selected);
  $<HTMLButtonElement>("flip-button").disabled = !chosen;
  $<HTMLButtonElement>("discard-button").disabled = !chosen;
  $<HTMLButtonElement>("return-button").disabled = !chosen;
  $<HTMLButtonElement>("sideways-button").disabled = !chosen;
  $<HTMLButtonElement>("shuffle-button").disabled = s.remainingCardIds.length < 2;
  $<HTMLButtonElement>("draw").disabled = !s.remainingCardIds.length;
  $<HTMLButtonElement>("undo").disabled = !history.past.length;
  $<HTMLButtonElement>("redo").disabled = !history.future.length;
  $<HTMLButtonElement>("add-note").disabled = s.notes.length >= LIMITS.notes;
  $<HTMLButtonElement>("add-position").disabled =
    s.notes.length >= LIMITS.notes;
  table?.sync(s, selected);
  renderDetail();
  const list = $("object-list");
  const focused = (document.activeElement as HTMLElement)?.dataset?.object;
  list.replaceChildren();
  $("object-count").textContent =
    `${s.cards.length} cartas · ${s.notes.length} notas`;
  for (const o of [...s.cards, ...s.notes].sort(
    (a, b) => a.stackingOrder - b.stackingOrder,
  )) {
    const isCard = "cardId" in o;
    const label = isCard
      ? o.faceUp
        ? `${DECKS[s.deckId].cards.find((c) => c.id === o.cardId)?.name}${o.isReversed ? " · invertida" : ""}`
        : `Carta fechada ${s.cards.indexOf(o) + 1}`
      : `${o.kind === "position" ? "Posição" : "Nota"}: ${o.text.slice(0, 70)}`;
    const b = button("", () => {
      selected = o.instanceId;
      render();
      setPanel(true);
      $("selection-heading")?.focus();
    });
    b.dataset.object = o.instanceId;
    b.setAttribute("aria-pressed", String(selected === o.instanceId));
    const icon = document.createElement("span");
    icon.className = "object-icon";
    icon.textContent = isCard ? "▯" : "≡";
    icon.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "object-label";
    text.textContent = label;
    b.append(icon, text);
    list.append(b);
  }
  if (!list.childElementCount)
    list.append(
      paragraph("Sua mesa está livre. Comece puxando uma carta.", "help"),
    );
  if (focused)
    list
      .querySelector<HTMLButtonElement>(`[data-object="${focused}"]`)
      ?.focus();
}
function renderDetail() {
  const s = session(),
    c = s.cards.find((c) => c.instanceId === selected),
    n = s.notes.find((n) => n.instanceId === selected);
  const detail = $("selection-detail");
  const focusedAction = detail.contains(document.activeElement)
    ? (document.activeElement as HTMLElement)?.dataset.action ||
      document.activeElement?.textContent
    : undefined;
  detail.replaceChildren();
  if (!c && !n) {
    detail.append(
      paragraph("Escolha uma carta ou nota para examinar e editar.", "help"),
    );
    return;
  }
  const heading = document.createElement("h2");
  heading.id = "selection-heading";
  heading.tabIndex = -1;
  const actions = document.createElement("div");
  actions.className = "action-grid";
  if (c) {
    const data = DECKS[s.deckId].cards.find((d) => d.id === c.cardId)!;
    heading.textContent = c.faceUp ? data.name : "Carta fechada";
    detail.append(heading);
    if (c.faceUp) {
      const image = document.createElement("img");
      image.src = new URL(
        `../${CARD_ARTWORK[c.cardId as keyof typeof CARD_ARTWORK].thumbnail}`,
        document.baseURI,
      ).href;
      image.alt = data.name;
      image.className = `inspect-art${c.isReversed ? " reversed" : ""}`;
      detail.append(image);
      detail.append(
        paragraph(data.keywords.join(" · "), "keywords"),
        paragraph(c.isReversed ? data.shadow : data.light, "meaning"),
        paragraph(data.advice, "meaning"),
      );
      const artButton = button("Ampliar arte", () => {
        const box = document.createElement("div"),
          full = document.createElement("img");
        full.src = new URL(
          `../${CARD_ARTWORK[c.cardId as keyof typeof CARD_ARTWORK].src}`,
          document.baseURI,
        ).href;
        full.alt = data.name;
        full.style.cssText =
          "display:block;max-width:100%;max-height:70dvh;margin:auto";
        if (c.isReversed) full.style.transform = "rotate(180deg)";
        box.append(
          full,
          paragraph(
            "Arte histórica em domínio público. Consulte os créditos em Preferências.",
            "help",
          ),
        );
        showModal(data.name, box);
      });
      detail.append(artButton);
    } else
      detail.append(
        paragraph(
          "Selecionar não revela a carta. Respire e revele quando desejar.",
          "help",
        ),
      );
    actions.append(
      button(c.faceUp ? "Fechar carta" : "Revelar", () => {
        execute({ type: "reveal", id: c.instanceId });
        announce(c.faceUp ? "Carta fechada." : `Carta revelada: ${data.name}.`);
      }),
      button("Girar 90° · de lado", () =>
        execute({ type: "rotate", id: c.instanceId, amount: Math.PI / 2 }),
      ),
      button("Girar 15°", () =>
        execute({ type: "rotate", id: c.instanceId, amount: Math.PI / 12 }),
      ),
    );
    if (s.deckId === "tarot")
      actions.append(
        button(c.isReversed ? "Deixar normal" : "Inverter", () =>
          execute({ type: "reverse", id: c.instanceId }),
        ),
      );
    actions.append(
      button("Anotar", () => editNote("reflection", undefined, c.instanceId)),
      button("Descartar", () => execute({ type: "discard", id: c.instanceId })),
      button("Devolver ao monte", () =>
        execute({ type: "return", id: c.instanceId }),
      ),
    );
  } else if (n) {
    heading.textContent = n.kind === "position" ? "Posição" : "Reflexão";
    detail.append(heading, paragraph(n.text, "meaning"));
    if (n.cardInstanceId)
      detail.append(paragraph("Associada a uma carta desta mesa.", "help"));
    actions.append(
      button("Editar", () => editNote(n.kind, n)),
      button("Girar 15°", () =>
        execute({ type: "rotate", id: n.instanceId, amount: Math.PI / 12 }),
      ),
      button("Excluir nota", () =>
        execute({ type: "deleteNote", id: n.instanceId }),
      ),
    );
  }
  detail.append(actions);
  const object = c || n!;
  const movement = document.createElement("div");
  movement.className = "movement";
  movement.setAttribute("role", "group");
  movement.setAttribute("aria-label", "Mover objeto");
  for (const [label, dx, dz] of [
    ["←", -0.5, 0],
    ["↑", 0, 0.5],
    ["↓", 0, -0.5],
    ["→", 0.5, 0],
  ] as const) {
    const b = button(label, () => {
      const current = [...session().cards, ...session().notes].find(
        (o) => o.instanceId === object.instanceId,
      );
      if (current)
        execute({
          type: "move",
          id: object.instanceId,
          position: { x: current.position.x + dx, z: current.position.z + dz },
        });
    });
    b.setAttribute("aria-label", `Mover ${label}`);
    movement.append(b);
  }
  detail.append(
    movement,
    paragraph(
      "F vira · Del descarta · R gira · Setas movem no canvas · Esc cancela o gesto.",
      "help",
    ),
  );
  if (focusedAction)
    [...detail.querySelectorAll("button")]
      .find((b) => (b.dataset.action || b.textContent) === focusedAction)
      ?.focus();
}
function editNote(
  kind: Note["kind"],
  existing?: Note,
  cardInstanceId?: string,
) {
  if (!history) return;
  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent =
    kind === "position" ? "Título da posição" : "Sua reflexão";
  const field = document.createElement("textarea");
  field.maxLength = kind === "position" ? 120 : LIMITS.text;
  field.required = true;
  field.value = existing?.text || "";
  field.name = "note";
  label.append(field);
  form.append(label);
  form.append(
    paragraph(
      kind === "position"
        ? "Até 120 caracteres."
        : "Até 4.000 caracteres. O texto completo fica neste painel.",
      "help",
    ),
  );
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "primary wide";
  submit.textContent = "Guardar nota";
  form.append(submit);
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!field.value.trim()) return;
    const id = existing?.instanceId || newId();
    const card = session().cards.find((c) => c.instanceId === cardInstanceId);
    execute({
      type: "note",
      note: existing
        ? { ...existing, text: field.value }
        : {
            instanceId: id,
            kind,
            text: field.value,
            position: card
              ? { x: card.position.x, z: Math.max(-5.2, card.position.z - 2) }
              : { x: 0, z: -3.7 },
            rotation: 0,
            stackingOrder: 0,
            ...(cardInstanceId ? { cardInstanceId } : {}),
          },
    });
    selected = id;
    render();
    closeModal();
    setPanel(true);
    announce("Nota guardada.");
  };
  showModal(
    existing
      ? "Editar nota"
      : kind === "position"
        ? "Nomear posição"
        : "Uma nova reflexão",
    form,
  );
  field.focus();
}
function exportCurrent() {
  if (!history) {
    notice("Abra uma mesa salva para exportar.");
    return;
  }
  const blob = new Blob([JSON.stringify(session(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lumina-mesa-${session().id}.json`;
  a.click();
  exportedChange = changeNumber;
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce("Mesa exportada.");
}
async function saveCopy() {
  if (!history) return;
  await saveQueue;
  const s = clone(session());
  s.id = newId();
  s.title = `${s.title.slice(0, 110)} (cópia)`;
  s.updatedAt = new Date().toISOString();
  history.state = s;
  revision = 0;
  conflicted = false;
  $("notice").hidden = true;
  scheduleSave();
  await flush();
  render();
  if (!dirty) closeModal();
}
function showConflict() {
  const box = document.createElement("div");
  box.append(
    paragraph(
      "Outra aba gravou esta mesa. Suas mudanças continuam aqui; guarde uma cópia para evitar sobrescrever a outra leitura.",
    ),
  );
  box.append(
    button("Salvar como nova mesa", () => void saveCopy(), "primary"),
    button("Exportar minha versão", exportCurrent),
  );
  showModal("Duas versões da mesma mesa", box);
}
function showRecovery() {
  const box = document.createElement("div");
  box.append(
    paragraph(
      "A mesa atual ainda não foi salva. Você pode tentar novamente, salvar com outro nome ou exportar seu arquivo.",
    ),
  );
  box.append(
    button("Tentar salvar", () => void flush()),
    button("Salvar cópia", () => void saveCopy()),
    button("Exportar", () => {
      exportCurrent();
      closeModal();
    }),
  );
  showModal("Preservar sua mesa", box);
}
async function showSessions(fromWelcome = false) {
  if (fromWelcome) {
    welcomeAfterModal = true;
    welcome.close();
  }
  const box = document.createElement("div");
  await flush();
  try {
    records = await storage.list();
  } catch (e) {
    box.append(
      paragraph(e instanceof Error ? e.message : "Armazenamento indisponível."),
    );
  }
  if (!records.length)
    box.append(paragraph("Suas mesas salvas aparecerão aqui."));
  for (const r of records) {
    const item = document.createElement("div");
    item.className = "saved-item";
    const info = document.createElement("div");
    info.append(paragraph(r.session.title));
    const meta = document.createElement("small");
    meta.textContent = `${DECKS[r.session.deckId].name} · ${r.session.cards.length} cartas · ${new Date(r.session.updatedAt).toLocaleDateString("pt-BR")}`;
    info.append(meta);
    item.append(
      info,
      button("Abrir", () => void start(r.session, r.revision)),
    );
    box.append(item);
  }
  const actions = document.createElement("div");
  actions.className = "modal-actions";
  actions.append(
    button("Nova mesa", async () => {
      await flush();
      if (dirty && exportedChange !== changeNumber) {
        showRecovery();
        return;
      }
      welcomeAfterModal = false;
      closeModal();
      welcome.showModal();
    }),
    button("Exportar atual", exportCurrent),
  );
  const label = document.createElement("label");
  label.textContent = "Importar mesa (.json, até 512 KB)";
  const file = document.createElement("input");
  file.type = "file";
  file.accept = ".json,application/json";
  file.onchange = async () => {
    const f = file.files?.[0];
    if (!f) return;
    try {
      if (f.size > LIMITS.fileBytes)
        throw new Error("Arquivo muito grande (máximo 512 KB).");
      const s = importSession(await f.text());
      await start(s);
    } catch (e) {
      notice(e instanceof Error ? e.message : "Arquivo inválido.");
    }
    file.value = "";
  };
  label.append(file);
  box.append(
    actions,
    label,
    paragraph(
      "Importações sempre criam uma nova mesa. Devolver uma carta a coloca no fundo do monte.",
      "help",
    ),
  );
  showModal("Suas mesas", box);
}
function settings() {
  const box = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = "Qualidade gráfica";
  const select = document.createElement("select");
  for (const [value, text] of [
    ["low", "Baixa · essencial"],
    ["medium", "Média · sombras suaves"],
    ["high", "Alta · detalhes e resolução"],
  ]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    select.append(option);
  }
  select.value = quality;
  select.onchange = () => {
    quality = select.value as Quality;
    table?.setQuality(quality);
    try {
      localStorage.setItem("lumina_mesa_quality", quality);
    } catch {
      /* Optional preference. */
    }
  };
  label.append(select);
  box.append(label);
  const soundLabel = document.createElement("label");
  const soundToggle = document.createElement("input");
  soundToggle.type = "checkbox";
  soundToggle.checked = shuffleSound.enabled;
  soundToggle.onchange = () => { shuffleSound.enabled = soundToggle.checked; };
  soundLabel.append(soundToggle, document.createTextNode(" Som ao embaralhar"));
  box.append(soundLabel);
  if (history) {
    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Nome da mesa";
    const input = document.createElement("input");
    input.maxLength = 120;
    input.value = session().title;
    input.onchange = () => execute({ type: "title", title: input.value });
    titleLabel.append(input);
    box.append(titleLabel);
    const snapLabel = document.createElement("label");
    snapLabel.className = "check";
    const snap = document.createElement("input");
    snap.type = "checkbox";
    snap.checked = session().preferences.snap;
    snap.onchange = () => execute({ type: "snap", enabled: snap.checked });
    snapLabel.append(
      snap,
      document.createTextNode("Encaixar em grade ao mover"),
    );
    box.append(snapLabel);
    box.append(
      button("Exportar mesa", exportCurrent),
      button("Salvar cópia", () => void saveCopy()),
    );
  }
  box.append(
    paragraph(
      "Mouse: arraste o fundo para orbitar; botão direito para deslocar; roda para zoom. Toque: um dedo move cartas e orbita no fundo; dois dedos navegam e aproximam. Um segundo dedo cancela o arraste atual.",
      "help",
    ),
    paragraph(
      "Teclado: D puxa; F vira; Delete ou Backspace descarta; R gira; Shift R inverte no Tarot. [ e ] alternam a carta selecionada. Com o canvas em foco, setas movem e Espaço ou Enter vira. Ctrl/Cmd Z desfaz; Ctrl/Cmd Shift Z refaz. Esc cancela o gesto. Consulte todos os atalhos pelo botão de teclado.",
      "help",
    ),
  );
  box.append(
    paragraph(
      "Assets: materiais Wood Table 001, Fabric Pattern 07 e HDRI Studio Small 09 da Poly Haven, CC0. Fontes Cormorant Garamond e Outfit, SIL OFL. Ambiente e ornamentos deste repositório, MIT. Verso original Lumina. Rider–Waite–Smith (Pamela Colman Smith, 1910) e Petit Lenormand (1799), domínio público. A mesa não usa áudio.",
      "help",
    ),
  );
  box.append(
    button("Ver medição da cena", () => {
      const content = document.createElement("div"),
        p = document.createElement("pre");
      const refresh = () => {
        p.textContent = JSON.stringify(
          table?.metrics() || { graphics: "indisponível" },
          null,
          2,
        );
      };
      refresh();
      content.append(p, button("Atualizar medição", refresh));
      showModal("Medição local", content);
    }),
  );
  showModal("Preferências e ajuda", box);
}
$("settings-button").onclick = settings;
$("sessions-button").onclick = () => void showSessions();
$("welcome-saved").onclick = () => void showSessions(true);
$("draw").onclick = () => execute({ type: "draw" });
$("sideways-button").onclick = () => {
  if (selected) execute({ type: "rotate", id: selected, amount: Math.PI / 2 });
};
$("return-button").onclick = () => {
  if (selected) execute({ type: "return", id: selected });
};
$("shuffle-button").onclick = () => {
  table?.cancelDrag();
  execute({ type: "shuffle" });
};
$("flip-button").onclick = () => {
  if (selected) execute({ type: "reveal", id: selected });
};
$("discard-button").onclick = () => {
  if (selected) {
    execute({ type: "discard", id: selected });
    announce("Carta descartada. Ctrl Z para desfazer.");
  }
};
function shortcuts() {
  const box = document.createElement("div");
  box.className = "shortcuts";
  for (const [keys, description] of [
    ["D", "Puxar uma carta do monte"],
    ["B", "Devolver a carta selecionada ao bolo · ou arraste até ele"],
    ["S", "Embaralhar as cartas restantes do bolo"],
    ["F / Espaço", "Virar a carta selecionada"],
    ["Delete / Backspace", "Descartar a seleção"],
    ["L", "Girar a carta 90° · deixar de lado"],
    ["R / Shift R", "Girar / inverter no Tarot"],
    ["← ↑ ↓ →", "Mover no canvas · Shift para passos maiores"],
    ["[ / ]", "Selecionar a carta anterior / seguinte"],
    ["Ctrl Z / Ctrl Shift Z", "Desfazer / refazer · Cmd no Mac"],
    ["Esc", "Cancelar o gesto ou fechar um painel"],
  ]) {
    const row = document.createElement("div"),
      kbd = document.createElement("kbd"),
      label = document.createElement("span");
    kbd.textContent = keys;
    label.textContent = description;
    row.append(kbd, label);
    box.append(row);
  }
  box.append(
    paragraph(
      "Segure uma carta no topo do monte, arraste e solte na área de leitura. Solte sobre o monte ou pressione Esc para devolver sem retirar. Os atalhos não interferem na edição de textos.",
      "help",
    ),
  );
  showModal("Seu ritual, nas mãos", box);
}
$("shortcuts-button").onclick = shortcuts;
$("add-note").onclick = () => editNote("reflection");
$("add-position").onclick = () => editNote("position");
$("undo").onclick = () => {
  if (history?.undo()) {
    scheduleSave();
    render();
    announce("Ação desfeita.");
  }
};
$("redo").onclick = () => {
  if (history?.redo()) {
    scheduleSave();
    render();
    announce("Ação refeita.");
  }
};
$("organize").onclick = () => {
  if (!history) return;
  const box = document.createElement("div");
  box.className = "modal-actions";
  for (const [layout, label] of [
    ["row", "Em linha"],
    ["column", "Em coluna"],
    ["grid", "Em grade"],
  ] as const)
    box.append(
      button(label, () => {
        execute({ type: "arrange", layout });
        table?.view("all");
        closeModal();
      }),
    );
  box.append(
    button("Embaralhar restantes", () => {
      execute({ type: "shuffle" });
      closeModal();
    }),
  );
  showModal("Organizar a leitura", box);
};
$("camera-button").onclick = () => {
  const box = document.createElement("div");
  box.className = "modal-actions";
  for (const [mode, label] of [
    ["table", "Visão da mesa"],
    ["top", "Visão superior"],
    ["all", "Ver tudo"],
  ] as const)
    box.append(
      button(label, () => {
        table?.view(mode);
        closeModal();
      }),
    );
  showModal("Seu ponto de vista", box);
};
$<HTMLFormElement>("new-session-form").onsubmit = (e) => {
  e.preventDefault();
  const deckId = (new FormData(e.currentTarget as HTMLFormElement).get(
    "deck",
  ) || "tarot") as DeckId;
  void start(
    createSession(
      deckId,
      $<HTMLInputElement>("new-title").value,
      $<HTMLInputElement>("allow-reversed").checked,
    ),
  );
};
for (const radio of document.querySelectorAll<HTMLInputElement>("[name=deck]"))
  radio.onchange = () => {
    const cigano = radio.checked && radio.value === "lenormand";
    $<HTMLInputElement>("allow-reversed").disabled = cigano;
    if (cigano) $<HTMLInputElement>("allow-reversed").checked = false;
  };
$("continue").onclick = () => {
  if (records[0]) void start(records[0].session, records[0].revision);
};
$("back").onclick = async (e) => {
  e.preventDefault();
  await flush();
  if (dirty && exportedChange !== changeNumber) {
    showRecovery();
    return;
  }
  location.href = new URL("../", document.baseURI).href;
};
document.addEventListener("keydown", (e) => {
  const target = e.target as HTMLElement;
  if (
    modal.open ||
    welcome.open ||
    target.closest(
      'input,textarea,select,[contenteditable="true"],[role="textbox"]',
    )
  )
    return;
  const key = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && key === "z") {
    e.preventDefault();
    $(e.shiftKey ? "redo" : "undo").click();
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Escape") {
    table?.cancelDrag();
    if (!$("inspector").hidden) setPanel(false);
    return;
  }
  if (!history) return;
  if (e.key === "?" && !e.repeat) {
    e.preventDefault();
    shortcuts();
    return;
  }
  if (key === "d" && !e.repeat) {
    e.preventDefault();
    table?.cancelDrag();
    execute({ type: "draw" });
    $("table-canvas").focus();
    return;
  }
  if (key === "s" && !e.repeat) {
    e.preventDefault();
    table?.cancelDrag();
    if (session().remainingCardIds.length > 1) execute({ type: "shuffle" });
    return;
  }
  if (key === "b" && selected && !e.repeat) {
    e.preventDefault();
    table?.cancelDrag();
    if (session().cards.some((c) => c.instanceId === selected)) execute({ type: "return", id: selected });
    return;
  }
  if (e.key === "[" || e.key === "]") {
    e.preventDefault();
    const cards = session().cards;
    if (!cards.length) return;
    const i = cards.findIndex((c) => c.instanceId === selected);
    selected =
      cards[(i + (e.key === "]" ? 1 : -1) + cards.length) % cards.length]
        .instanceId;
    render();
    $("table-canvas").focus();
    announce("Carta selecionada. F para virar; Delete para descartar.");
    return;
  }
  if (!selected) return;
  const o = [...session().cards, ...session().notes].find(
    (o) => o.instanceId === selected,
  );
  if (!o) return;
  const canvasFocused = target === $("table-canvas");
  if (key === "f" || (canvasFocused && (e.key === "Enter" || e.key === " "))) {
    if ("cardId" in o && !e.repeat) {
      e.preventDefault();
      table?.cancelDrag();
      execute({ type: "reveal", id: selected });
      announce("Carta virada.");
    }
    return;
  }
  if ((e.key === "Delete" || e.key === "Backspace") && !e.repeat) {
    e.preventDefault();
    table?.cancelDrag();
    execute({ type: "cardId" in o ? "discard" : "deleteNote", id: selected });
    announce("Objeto removido. Ctrl Z para desfazer.");
    return;
  }
  if (key === "l" && "cardId" in o && !e.repeat) {
    e.preventDefault();
    table?.cancelDrag();
    execute({ type: "rotate", id: selected, amount: Math.PI / 2 });
    announce("Carta girada em 90 graus.");
    return;
  }
  if (key === "r" && !e.repeat) {
    e.preventDefault();
    if (e.shiftKey && "cardId" in o && session().deckId === "tarot")
      execute({ type: "reverse", id: selected });
    else if (!e.shiftKey)
      execute({ type: "rotate", id: selected, amount: Math.PI / 12 });
    return;
  }
  if (canvasFocused && e.key.startsWith("Arrow")) {
    e.preventDefault();
    const step = e.shiftKey ? 1 : 0.25;
    execute({
      type: "move",
      id: selected,
      position: {
        x:
          o.position.x +
          (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0),
        z:
          o.position.z +
          (e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0),
      },
    });
  }
});

storage.onExternalSave = (id, incoming) => {
  if (history && id === session().id && incoming > revision) {
    conflicted = true;
    status("Alterada em outra aba");
    showConflict();
  }
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) void flush();
});
window.addEventListener("pagehide", () => {
  void flush();
  table?.dispose();
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted && history) {
    const s = clone(session());
    dirty = false;
    void start(s, revision);
  }
});
async function init() {
  // Registering does not prefetch the 3D app from the main page.
  if (import.meta.env.PROD && "serviceWorker" in navigator)
    navigator.serviceWorker
      .register(new URL("../sw.js", document.baseURI))
      .catch(() => {});
  try {
    await storage.open();
    records = await storage.list();
    $("continue").hidden = records.length === 0;
  } catch {
    notice(
      "Salvamento local indisponível. Você poderá exportar sua mesa.",
      true,
    );
  }
  welcome.showModal();
}
void init();
