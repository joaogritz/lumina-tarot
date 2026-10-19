import { CreateTube } from "@babylonjs/core/Meshes/Builders/tubeBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
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
