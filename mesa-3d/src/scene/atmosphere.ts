import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { ring } from "./geometry";
import { CreateLineSystem } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { material, painted, metal } from "./materials";
export function atmosphere(scene: Scene) {
  const floor = CreateGround(
    "Piso do observatório",
    { width: 150, height: 150 },
    scene,
  );
  floor.position.y = -1.34;
  floor.isPickable = false;
  const stone = material(scene, "Pedra noturna", "#22202d", 0.15);
  stone.diffuseTexture = painted(scene, "Névoa mineral", 1024, 1024, (c) => {
    const g = c.createRadialGradient(512, 512, 0, 512, 512, 720);
    g.addColorStop(0, "#91806a");
    g.addColorStop(0.32, "#3d3a4c");
    g.addColorStop(1, "#171624");
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 1024);
    c.strokeStyle = "#beb4ce0a";
    for (let i = 0; i < 40; i++) {
      c.beginPath();
      c.moveTo(0, i * 27);
      c.bezierCurveTo(300, i * 20 + 150, 600, i * 30 - 80, 1024, i * 22);
      c.stroke();
    }
  });
  floor.material = stone;
  floor.receiveShadows = true;
  const gold = metal(scene, "Latão do observatório", "#8e7148", 0.5);
  for (const diameter of [31, 32, 37, 37.2]) {
    const orbit = ring(
      "Órbita do piso",
      diameter,
      diameter > 35 ? 0.018 : 0.035,
      scene,
      128,
    );
    orbit.position.y = -1.28;
    orbit.material = gold;
    orbit.isPickable = false;
  }
  const markers: Vector3[][] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI) / 24;
    markers.push([
      new Vector3(Math.sin(a) * 16.1, -1.27, Math.cos(a) * 16.1),
      new Vector3(
        Math.sin(a) * (i % 4 ? 16.3 : 16.6),
        -1.27,
        Math.cos(a) * (i % 4 ? 16.3 : 16.6),
      ),
    ]);
  }
  const marks = CreateLineSystem("Marcas celestes", { lines: markers }, scene);
  marks.color = Color3.FromHexString("#897452");
  marks.isPickable = false;
  // A distant celestial instrument gives the scene a horizon instead of a black void.
  for (const [diameter, thickness] of [
    [8, 0.065],
    [9, 0.025],
    [11, 0.035],
  ]) {
    const arch = ring("Arco celeste", diameter, thickness, scene, 96);
    arch.rotation.x = Math.PI / 2;
    arch.position.set(0, 2.5, 17);
    arch.material = gold;
    arch.isPickable = false;
  }
  const moon = CreateSphere(
    "Lua do observatório",
    { diameter: 1.4, segments: 32 },
    scene,
  );
  moon.position.set(0, 1.4, 12.6);
  moon.isPickable = false;
  const moonMat = material(scene, "Alabastro lunar", "#ded5b8");
  moonMat.emissiveColor = new Color3(0.25, 0.23, 0.18);
  moonMat.diffuseTexture = painted(scene, "Mares lunares", 512, 256, (c) => {
    c.fillStyle = "#d5cbb1";
    c.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 180; i++) {
      const x = (Math.sin(i * 157.73) * 0.5 + 0.5) * 512,
        y = (Math.cos(i * 91.17) * 0.5 + 0.5) * 256,
        r = 2 + (i % 14);
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "#716c5d24");
      g.addColorStop(0.6, "#8b81651a");
      g.addColorStop(1, "#d5cbb100");
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
  moon.material = moonMat;
  return { moon };
}
