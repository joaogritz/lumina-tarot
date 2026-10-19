import { RegisterRay } from "@babylonjs/core/Culling/ray.pure";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import type { Scene } from "@babylonjs/core/scene";
import type { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
RegisterRay();
const plane = new Plane(0, 1, 0, -0.08);
export function readingPoint(
  scene: Scene,
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  event: PointerEvent,
) {
  const rect = canvas.getBoundingClientRect();
  // Babylon applies hardware scaling internally; coordinates here must stay in CSS pixels.
  const ray = scene.createPickingRay(
    event.clientX - rect.left,
    event.clientY - rect.top,
    null,
    camera,
  );
  const distance = ray.intersectsPlane(plane);
  return distance === null
    ? null
    : ray.origin.add(ray.direction.scale(distance));
}
