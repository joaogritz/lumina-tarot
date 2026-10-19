const paths: Record<string, string> = {
  draw: '<rect x="5" y="5" width="12" height="16" rx="1"/><path d="m9 2 11 2 2 15M9 13h4m-2-2v4"/>',
  flip: '<rect x="7" y="3" width="10" height="18" rx="1"/><path d="M4 8C0 11 1 16 5 17m-2-3 2 3-3 1M20 16c4-3 3-8-1-9m2 3-2-3 3-1"/>',
  discard: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
  return: '<path d="M9 4 4 9l5 5M4 9h10a6 6 0 0 1 0 12"/><path d="M13 3h7v12"/>',
  shuffle: '<path d="M3 5h3l12 14h3m-4-4 4 4-4 3M3 19h3l4-5m4-4 4-5h3m-4-3 4 3-4 4"/>',
  note: '<path d="M15 4H4v16h16V9M9 15l1-4L19 2l3 3-9 9-4 1Z"/>',
  position: '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/>',
  objects:
    '<rect x="3" y="3" width="5" height="5"/><rect x="3" y="10" width="5" height="5"/><rect x="3" y="17" width="5" height="5"/><path d="M12 5h9m-9 8h9m-9 7h9"/>',
  organize:
    '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><rect x="17" y="4" width="5" height="16" rx="1"/>',
  camera:
    '<circle cx="12" cy="12" r="7"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
  undo: '<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14"/>',
  redo: '<path d="m16 4 5 5-5 5m5-5H10a7 7 0 0 0 0 14"/>',
  keyboard:
    '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.1M10 9h.1M14 9h.1M18 9h.1M6 12h.1M10 12h.1M14 12h.1M18 12h.1M7 16h10"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="m9 2-.5 3-1.2.7L4.5 4.6l-3 5.2L4 11.7v1.4l-2.5 1.9 3 5.2 2.8-1.1 1.2.7.5 3h6l.5-3 1.2-.7 2.8 1.1 3-5.2-2.5-1.9v-1.4l2.5-1.9-3-5.2-2.8 1.1-1.2-.7L15 2Z"/>',
  archive: '<path d="M4 7h16v14H4zM3 3h18v4H3zM9 11h6"/>',
};
export function icon(name: string) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.position}</svg>`;
}
export function decorateTools() {
  for (const [id, name, label, key] of [
    ["draw", "draw", "Puxar carta", "D"],
    ["flip-button", "flip", "Virar", "F"],
    ["return-button", "return", "Devolver", "B"],
    ["shuffle-button", "shuffle", "Embaralhar", "S"],
    ["discard-button", "discard", "Descartar", "Del"],
    ["add-note", "note", "Nota", ""],
    ["add-position", "position", "Posição", ""],
    ["objects", "objects", "Objetos", ""],
    ["organize", "organize", "Organizar", ""],
    ["undo", "undo", "", ""],
    ["redo", "redo", "", ""],
    ["camera-button", "camera", "Câmera", ""],
    ["shortcuts-button", "keyboard", "", "?"],
    ["sessions-button", "archive", "Mesas", ""],
    ["settings-button", "settings", "", ""],
  ]) {
    const button = document.getElementById(id);
    if (!button) continue;
    button.innerHTML = `${icon(name)}${label ? `<span class="tool-label">${label}</span>` : ""}${id === "draw" ? '<small id="remaining"></small>' : ""}${key ? `<kbd>${key}</kbd>` : ""}`;
  }
}
