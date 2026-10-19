export const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
export const button = (text: string, action: () => void, className = "") => {
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.action =
    (
      {
        Revelar: "reveal",
        "Fechar carta": "reveal",
        Inverter: "reverse",
        "Deixar normal": "reverse",
      } as Record<string, string>
    )[text] || text;
  b.textContent = text;
  b.className = className;
  b.onclick = action;
  return b;
};
export const paragraph = (text: string, className = "") => {
  const p = document.createElement("p");
  p.textContent = text;
  p.className = className;
  return p;
};
