import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Material } from "@babylonjs/core/Materials/material";

// Easing curves used by every card movement. They are plain functions so the motion stays
// inside the table's own render loop (no Babylon animation groups to keep in sync).
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Shortest signed angle from a to b. */
const angleDelta = (a: number, b: number) =>
  Math.atan2(Math.sin(b - a), Math.cos(b - a));

/** Half the card width: flips pivot on the long edge, like a card turned by hand. */
const HALF_WIDTH = 0.86;

type Flight = {
  mesh: Mesh;
  from: Vector3;
  to: Vector3;
  started: number;
  duration: number;
  arc: number;
  fromRotation: number;
  rotation: number;
  tilt: number;
  done?: () => void;
  exit: boolean;
};
type Flip = {
  mesh: Mesh;
  face: Mesh;
  old: Material | null;
  next: Material | null;
  oldY: number;
  nextY: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  started: number;
  duration: number;
};
export type FlyOptions = {
  duration?: number;
  arc?: number;
  exit?: boolean;
  done?: () => void;
  /** Starting yaw; the card turns to its document rotation during the flight. */
  fromRotation?: number;
  /** How much the card banks towards its direction of travel (0 for a flat glide). */
  tilt?: number;
};
export class CardMotion {
  private flights = new Map<string, Flight>();
  private flips = new Map<string, Flip>();
  constructor(private reduced: () => boolean) {}
  fly(
    id: string,
    mesh: Mesh,
    from: Vector3,
    to: Vector3,
    options: FlyOptions = {},
  ) {
    this.finish(id);
    if (this.reduced()) {
      mesh.position.copyFrom(to);
      options.done?.();
      return;
    }
    const distance = Vector3.Distance(from, to);
    this.flights.set(id, {
      mesh,
      from: from.clone(),
      to: to.clone(),
      started: performance.now(),
      duration: options.duration || 620,
      // Longer trips arc higher; short nudges stay close to the cloth.
      arc: (options.arc ?? 1.3) * Math.min(1, 0.35 + distance / 9),
      fromRotation: options.fromRotation ?? mesh.rotation.y,
      rotation: mesh.rotation.y,
      tilt: options.tilt ?? 0.22,
      exit: !!options.exit,
      done: options.done,
    });
    mesh.position.copyFrom(from);
  }
  flip(
    id: string,
    mesh: Mesh,
    face: Mesh,
    old: Material | null,
    next: Material | null,
    oldY: number,
    nextY: number,
  ) {
    if (this.reduced()) return;
    this.finish(id);
    this.flips.set(id, {
      mesh,
      face,
      old,
      next,
      oldY,
      nextY,
      baseX: mesh.position.x,
      baseY: mesh.position.y,
      baseZ: mesh.position.z,
      started: performance.now(),
      duration: 560,
    });
    face.material = old;
    face.rotation.y = oldY;
  }
  // Commands may move/rotate a card while its arrival or reveal is still running.
  // Keep the animation's destination aligned with the latest document projection.
  retarget(
    id: string,
    position: Vector3,
    rotation: number,
    faceRotation?: number,
  ) {
    const flight = this.flights.get(id);
    if (flight) {
      flight.to.copyFrom(position);
      flight.rotation = rotation;
    }
    const flip = this.flips.get(id);
    if (flip) {
      flip.baseX = position.x;
      flip.baseY = position.y;
      flip.baseZ = position.z;
      flip.mesh.rotation.y = rotation;
      if (faceRotation !== undefined) flip.nextY = faceRotation;
    }
  }
  get active() {
    return this.flights.size + this.flips.size > 0;
  }
  has(id: string) {
    return this.flights.has(id) || this.flips.has(id);
  }
  finish(id: string) {
    const f = this.flights.get(id);
    if (f) {
      f.mesh.position.copyFrom(f.to);
      f.mesh.rotation.x = 0;
      f.mesh.rotation.z = 0;
      f.mesh.rotation.y = f.rotation;
      this.flights.delete(id);
      f.done?.();
    }
    const flip = this.flips.get(id);
    if (flip) {
      flip.face.material = flip.next;
      flip.face.rotation.y = flip.nextY;
      flip.mesh.rotation.z = 0;
      flip.mesh.position.set(flip.baseX, flip.baseY, flip.baseZ);
      this.flips.delete(id);
    }
  }
  update(now: number) {
    for (const [id, f] of this.flights) {
      const t = Math.min(1, (now - f.started) / f.duration),
        u = easeInOut(t),
        hop = Math.sin(t * Math.PI);
      Vector3.LerpToRef(f.from, f.to, u, f.mesh.position);
      f.mesh.position.y += hop * f.arc;
      // Bank into the direction of travel, then settle flat on landing.
      const dx = f.to.x - f.from.x,
        dz = f.to.z - f.from.z,
        len = Math.hypot(dx, dz) || 1;
      f.mesh.rotation.z = (-dx / len) * hop * f.tilt;
      f.mesh.rotation.x = (dz / len) * hop * f.tilt;
      f.mesh.rotation.y =
        f.fromRotation + angleDelta(f.fromRotation, f.rotation) * easeOut(t);
      if (f.exit) {
        const fade = 1 - easeInOut(t) * 0.7;
        f.mesh.visibility = fade;
        f.mesh.getChildMeshes().forEach((m) => (m.visibility = fade));
      }
      if (t >= 1) this.finish(id);
    }
    for (const [id, f] of this.flips) {
      const t = Math.min(1, (now - f.started) / f.duration);
      // The face swaps at the edge-on moment, so only one textured face is ever needed:
      // the first half rolls up to -90°, the second half comes down from +90° to 0.
      const roll = easeInOut(t);
      const angle = t < 0.5 ? -roll * Math.PI : (1 - roll) * Math.PI;
      f.mesh.rotation.z = angle;
      // Pivot on the long edge: the centre rises and slides as the card stands up,
      // plus a small lift so it clears the cloth.
      const lean = Math.abs(Math.sin(angle)),
        slide = HALF_WIDTH * (1 - Math.cos(angle)) * Math.sign(angle);
      const yaw = f.mesh.rotation.y;
      f.mesh.position.set(
        f.baseX + Math.cos(yaw) * slide * 0.5,
        f.baseY + lean * HALF_WIDTH * 0.85 + Math.sin(t * Math.PI) * 0.18,
        f.baseZ - Math.sin(yaw) * slide * 0.5,
      );
      f.face.material = t < 0.5 ? f.old : f.next;
      f.face.rotation.y = t < 0.5 ? f.oldY : f.nextY;
      if (t >= 1) this.finish(id);
    }
    return this.flights.size + this.flips.size > 0;
  }
  clear() {
    [...this.flights.keys(), ...this.flips.keys()].forEach((id) =>
      this.finish(id),
    );
  }
}
