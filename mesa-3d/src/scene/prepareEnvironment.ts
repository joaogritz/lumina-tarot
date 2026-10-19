// Offline asset preparation only. Never imported by either application entrypoint.
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { HDRCubeTexture } from "@babylonjs/core/Materials/Textures/hdrCubeTexture";
import { CreateEnvTextureAsync } from "@babylonjs/core/Misc/environmentTextureTools";
export async function prepareEnvironment() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  document.body.append(canvas);
  const engine = new Engine(canvas, true),
    scene = new Scene(engine);
  try {
    let texture: HDRCubeTexture;
    await new Promise<void>((resolve, reject) => {
      texture = new HDRCubeTexture(
        new URL("/assets-src/mesa-3d/studio-small-09.hdr", location.href).href,
        scene,
        128,
        false,
        true,
        false,
        true,
        resolve,
        (_, e) => reject(e),
      );
    });
    const bytes = await CreateEnvTextureAsync(texture!);
    const url = URL.createObjectURL(new Blob([bytes]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "observatory.env";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    scene.dispose();
    engine.dispose();
    canvas.remove();
  }
}
