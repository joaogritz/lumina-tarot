import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CARD_ARTWORK } from "../../../src/data/cardArtwork.js";
import { material, painted } from "../scene/materials";
import type { Quality } from "../session/model";

// Canvas resampling limits GPU memory and preserves the artwork's physical aspect ratio.
export function createCardFront(
  scene: Scene,
  cardId: string,
  quality: Quality,
  onReady: () => void,
  onError: (message: string) => void,
) {
  const m = material(scene, cardId, "#ffffff", 0);
  m.disableLighting = true;
  m.fogEnabled = false;
  m.emissiveColor = Color3.White();
  const art = CARD_ARTWORK[cardId as keyof typeof CARD_ARTWORK];
  const width = quality === "high" ? 512 : 256,
    height = width * 2;
  const texture = painted(scene, `Arte ${cardId}`, width, height, (c) => {
    c.fillStyle = "#eee4cd";
    c.fillRect(0, 0, width, height);
  });
  m.diffuseTexture = texture;
  const image = new Image();
  let cancelled = false;
  const loaded = new Promise<void>((resolve) => {
    m!.onDisposeObservable.add(() => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      resolve();
    });
    image.onload = () => {
      if (cancelled || scene.isDisposed) {
        resolve();
        return;
      }
      const c = texture.getContext() as CanvasRenderingContext2D;
      const ratio = image.naturalWidth / image.naturalHeight,
        cardRatio = 1.72 / 3;
      let w = width - 8,
        h = height - 8;
      if (ratio > cardRatio) h = (((w / width) * cardRatio) / ratio) * height;
      else w = (((h / height) * ratio) / cardRatio) * width;
      c.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
      texture.update();
      onReady();
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      resolve();
    };
    image.onerror = () => {
      if (!cancelled && !scene.isDisposed) {
        const c = texture.getContext() as CanvasRenderingContext2D;
        c.fillStyle = "#413829";
        c.font = `${width / 15}px Georgia`;
        c.textAlign = "center";
        c.fillText("Arte indisponível", width / 2, height / 2);
        texture.update();
        onError(
          "Uma arte não carregou. A lista e os significados continuam disponíveis. Recarregue para tentar novamente.",
        );
        onReady();
      }
      resolve();
    };
  });
  image.src = new URL(`../${art.thumbnail}`, document.baseURI).href;
  return { material: m, ready: loaded };
}
