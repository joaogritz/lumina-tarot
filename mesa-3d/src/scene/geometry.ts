import { CreateTube } from "@babylonjs/core/Meshes/Builders/tubeBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { SubMesh } from "@babylonjs/core/Meshes/subMesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
export function outline(width: number, depth: number, radius: number, y = 0) {
  const points: Vector3[] = [];
  for (let corner = 0; corner < 4; corner++) {
    const angle = (corner * Math.PI) / 2,
      cx = (corner === 0 || corner === 3 ? 1 : -1) * (width / 2 - radius),
      cz = (corner < 2 ? 1 : -1) * (depth / 2 - radius);
    for (let step = 0; step <= 8; step++) {
      const a = angle + (step * Math.PI) / 16;
      points.push(
        new Vector3(cx + Math.cos(a) * radius, y, cz + Math.sin(a) * radius),
      );
    }
  }
  return points;
}
// Shared smooth rim geometry, with a shallow bevel catching the environment light.
export function roundedBox(
  name: string,
  width: number,
  depth: number,
  height: number,
  radius: number,
  scene: Scene,
) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [],
    normals: number[] = [];
  const bevel = Math.min(height * 0.22, 0.12);
  const sections = [
    { w: width - bevel * 2, d: depth - bevel * 2, y: height / 2 },
    { w: width, d: depth, y: height / 2 - bevel },
    { w: width, d: depth, y: -height / 2 + bevel },
    { w: width - bevel * 2, d: depth - bevel * 2, y: -height / 2 },
  ];
  const rings = sections.map((s) => outline(s.w, s.d, radius, s.y)),
    n = rings[0].length;
  rings.forEach((ring) =>
    ring.forEach((p) => {
      positions.push(p.x, p.y, p.z);
      uvs.push(p.x / width + 0.5, p.z / depth + 0.5);
    }),
  );
  for (let ring = 0; ring < 3; ring++)
    for (let i = 0; i < n; i++) {
      const a = ring * n + i,
        b = ring * n + ((i + 1) % n),
        c = a + n,
        d = b + n;
      indices.push(a, b, c, b, d, c);
    }
  for (const [ring, sign] of [
    [0, 1],
    [3, -1],
  ]) {
    // Flat caps must not share normals with the bevel: shared vertices create a diagonal fan highlight.
    const base = positions.length / 3;
    rings[ring].forEach((p) => {
      positions.push(p.x, p.y, p.z);
      uvs.push(p.x / width + 0.5, p.z / depth + 0.5);
    });
    const center = positions.length / 3;
    positions.push(0, sections[ring].y, 0);
    uvs.push(0.5, 0.5);
    for (let i = 0; i < n; i++) {
      const a = base + i,
        b = base + ((i + 1) % n);
      indices.push(center, sign === 1 ? b : a, sign === 1 ? a : b);
    }
  }

  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.uvs = uvs;
  VertexData.ComputeNormals(positions, indices, normals);
  data.normals = normals;
  const mesh = new Mesh(name, scene);
  data.applyToMesh(mesh);
  return mesh;
}

/** High angular resolution with a small tube cross-section for sub-pixel metal inlays. */
export function ring(
  name: string,
  diameter: number,
  thickness: number,
  scene: Scene,
  segments = 96,
) {
  const path = Array.from(
    { length: segments + 1 },
    (_, i) =>
      new Vector3(
        (Math.cos((i * Math.PI * 2) / segments) * diameter) / 2,
        0,
        (Math.sin((i * Math.PI * 2) / segments) * diameter) / 2,
      ),
  );
  return CreateTube(
    name,
    { path, radius: thickness / 2, tessellation: 6 },
    scene,
  );
}

/** Flat rounded rectangle facing +Y, with the same UV convention as CreateGround. */
export function roundedPlane(
  name: string,
  width: number,
  depth: number,
  radius: number,
  scene: Scene,
) {
  const ring = outline(width, depth, radius, 0);
  const positions: number[] = [0, 0, 0],
    uvs: number[] = [0.5, 0.5],
    normals: number[] = [0, 1, 0],
    indices: number[] = [];
  ring.forEach((p) => {
    positions.push(p.x, 0, p.z);
    uvs.push(p.x / width + 0.5, p.z / depth + 0.5);
    normals.push(0, 1, 0);
  });
  for (let i = 0; i < ring.length; i++)
    indices.push(0, 1 + i, 1 + ((i + 1) % ring.length));
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.uvs = uvs;
  data.normals = normals;
  const mesh = new Mesh(name, scene);
  data.applyToMesh(mesh);
  return mesh;
}

/**
 * Rounded slab with two sub-meshes: 0 = top and bottom faces, 1 = the edge band.
 * Cards and the deck use it so their edges can be gilded separately from the paper.
 * The band's V coordinate runs bottom to top, so striped textures read as stacked pages.
 */
export function roundedSlab(
  name: string,
  width: number,
  depth: number,
  height: number,
  radius: number,
  scene: Scene,
) {
  const top = outline(width, depth, radius, height / 2),
    bottom = outline(width, depth, radius, -height / 2),
    n = top.length;
  const positions: number[] = [],
    uvs: number[] = [],
    normals: number[] = [],
    indices: number[] = [];
  const cap = (ring: Vector3[], y: number, up: number) => {
    const center = positions.length / 3;
    positions.push(0, y, 0);
    uvs.push(0.5, 0.5);
    normals.push(0, up, 0);
    ring.forEach((p) => {
      positions.push(p.x, p.y, p.z);
      uvs.push(p.x / width + 0.5, p.z / depth + 0.5);
      normals.push(0, up, 0);
    });
    for (let i = 0; i < n; i++) {
      const a = center + 1 + i,
        b = center + 1 + ((i + 1) % n);
      // Babylon culls clockwise-from-outside faces here, so caps wind counter-clockwise.
      indices.push(center, up > 0 ? a : b, up > 0 ? b : a);
    }
  };
  cap(top, height / 2, 1);
  cap(bottom, -height / 2, -1);
  const capIndexCount = indices.length,
    sideStart = positions.length / 3;
  let length = 0;
  for (let i = 0; i <= n; i++) {
    const p = top[i % n],
      prev = top[(i + n - 1) % n];
    if (i) length += Math.hypot(p.x - prev.x, p.z - prev.z);
    // Radial normal from the nearest corner centre keeps the band smoothly lit around corners.
    const cx = Math.sign(p.x) * Math.max(0, Math.abs(p.x) - (width / 2 - radius)),
      cz = Math.sign(p.z) * Math.max(0, Math.abs(p.z) - (depth / 2 - radius));
    const len = Math.hypot(cx, cz) || 1;
    for (const [y, v] of [
      [-height / 2, 0],
      [height / 2, 1],
    ]) {
      positions.push(p.x, y, p.z);
      normals.push(cx / len, 0, cz / len);
      uvs.push(length, v);
    }
  }
  for (let i = 0; i < n; i++) {
    const a = sideStart + i * 2,
      b = a + 1,
      c = a + 2,
      d = a + 3;
    indices.push(a, c, b, b, c, d);
  }
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.uvs = uvs;
  data.normals = normals;
  const mesh = new Mesh(name, scene);
  data.applyToMesh(mesh);
  mesh.subMeshes = [];
  const total = positions.length / 3;
  new SubMesh(0, 0, sideStart, 0, capIndexCount, mesh);
  new SubMesh(1, sideStart, total - sideStart, capIndexCount, indices.length - capIndexCount, mesh);
  return mesh;
}
