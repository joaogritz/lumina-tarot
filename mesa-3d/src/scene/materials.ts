import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
export function material(
  scene: Scene,
  name: string,
  hex: string,
  specular = 0.08,
) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.specularColor = new Color3(specular, specular, specular);
  return m;
}
export function painted(
  scene: Scene,
  name: string,
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D) => void,
) {
  const texture = new DynamicTexture(name, { width, height }, scene, true);
  paint(texture.getContext() as CanvasRenderingContext2D);
  texture.update();
  texture.anisotropicFilteringLevel = 4;
  return texture;
}
export const assetUrl = (path: string) =>
  new URL(`../mesa-3d/${path}`, document.baseURI).href;
function finish(m: PBRMaterial) {
  const look = new ImageProcessingConfiguration();
  look.toneMappingEnabled = true;
  look.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
  look.exposure = 1.12;
  look.contrast = 1.08;
  m.imageProcessingConfiguration = look;
  m.enableSpecularAntiAliasing = true;
  return m;
}
export function metal(
  scene: Scene,
  name: string,
  hex: string,
  roughness = 0.3,
) {
  const m = finish(new PBRMaterial(name, scene));
  m.albedoColor = Color3.FromHexString(hex);
  m.metallic = 0.88;
  m.roughness = roughness;
  return m;
}
export function wood(scene: Scene) {
  const m = finish(new PBRMaterial("Nogueira · Poly Haven", scene));
  m.metallic = 0;
  m.roughness = 0.85;
  m.albedoColor = Color3.FromHexString("#946f51");
  m.albedoTexture = new Texture(assetUrl("textures/walnut-color.jpg"), scene);
  m.bumpTexture = new Texture(assetUrl("textures/walnut-normal.jpg"), scene);
  m.bumpTexture.level = 0.38;
  const rough = new Texture(assetUrl("textures/walnut-roughness.jpg"), scene);
  rough.gammaSpace = false;
  m.metallicTexture = rough;
  m.useRoughnessFromMetallicTextureGreen = true;
  m.useRoughnessFromMetallicTextureAlpha = false;
  m.useMetallnessFromMetallicTextureBlue = false;
  m.clearCoat.isEnabled = true;
  m.clearCoat.intensity = 0.22;
  m.clearCoat.roughness = 0.65;
  return m;
}
export function cloth(scene: Scene) {
  const m = finish(new PBRMaterial("Veludo de meia-noite", scene));
  m.metallic = 0;
  m.roughness = 0.88;
  m.sheen.isEnabled = true;
  m.sheen.intensity = 0.28;
  m.sheen.color = Color3.FromHexString("#405880");
  const normal = new Texture(assetUrl("textures/fabric-normal.jpg"), scene);
  normal.uScale = 7;
  normal.vScale = 5;
  normal.level = 0.16;
  m.bumpTexture = normal;
  m.albedoTexture = painted(scene, "Tecido e mapa celeste", 2048, 1536, (c) => {
    c.scale(2048 / 1536, 1536 / 1024);
    c.fillStyle = "#101d30";
    c.fillRect(0, 0, 2048, 1536);
    for (let i = 0; i < 1536; i += 3) {
      c.fillStyle = i % 2 ? "#ffffff05" : "#0000000c";
      c.fillRect(i, 0, 1, 1024);
    }
    for (let i = 0; i < 1024; i += 3) {
      c.fillStyle = "#ffffff03";
      c.fillRect(0, i, 1536, 1);
    }
    c.strokeStyle = "#cfb97bba";
    c.lineWidth = 2;
    c.strokeRect(34, 34, 1468, 956);
    c.strokeStyle = "#bda06b40";
    c.strokeRect(43, 43, 1450, 938);
    c.save();
    c.translate(768, 512);
    c.strokeStyle = "#c3a66e2d";
    for (const r of [270, 290, 340]) {
      c.beginPath();
      c.arc(0, 0, r, 0, Math.PI * 2);
      c.stroke();
    }
    for (let i = 0; i < 12; i++) {
      c.save();
      c.rotate((i * Math.PI) / 6);
      c.beginPath();
      c.moveTo(0, -295);
      c.lineTo(0, -332);
      c.stroke();
      c.restore();
    }
    c.font = "80px Georgia";
    c.textAlign = "center";
    c.fillStyle = "#bda06b28";
    c.fillText("✧", 0, 26);
    c.font = "17px Georgia";
    c.fillStyle = "#c3a66e66";
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 - Math.PI / 2;
      c.fillText(
        [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
          "XII",
        ][i],
        Math.cos(a) * 365,
        Math.sin(a) * 365 + 6,
      );
    }
    c.restore();
    c.strokeStyle = "#c5aa7770";
    c.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const x = 100 + i * 58;
      c.beginPath();
      c.moveTo(x - 7, 55);
      c.lineTo(x, 65);
      c.lineTo(x + 7, 55);
      c.moveTo(x - 7, 969);
      c.lineTo(x, 959);
      c.lineTo(x + 7, 969);
      c.stroke();
    }
    for (const [x, y] of [
      [80, 80],
      [1456, 80],
      [80, 944],
      [1456, 944],
    ]) {
      c.fillStyle = "#c5ab78";
      c.font = "38px Georgia";
      c.textAlign = "center";
      c.fillText("✦", x, y + 12);
    }
  });
  return m;
}
export function cardBack(scene: Scene) {
  const m = material(scene, "Verso original · Lumina", "#ffffff", 0.1);
  m.diffuseTexture = new Texture(
    new URL("../tarot/backs/lumina-observatory.svg", document.baseURI).href,
    scene,
    false,
    true, // Match the upright UV orientation of the canvas-painted card fronts.
  );
  m.diffuseTexture.anisotropicFilteringLevel = 8;
  m.fogEnabled = false;
  m.disableLighting = true;
  m.emissiveColor = Color3.White();
  return m;
}
