import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CubicEase, EasingFunction } from "@babylonjs/core/Animations/easing";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Material } from "@babylonjs/core/Materials/material";
const ease = new CubicEase();
ease.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
type Flight = {
  mesh: Mesh;
  from: Vector3;
  to: Vector3;
  started: number;
  duration: number;
  arc: number;
  rotation: number;
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
  baseY: number;
  started: number;
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
    options: {
      duration?: number;
      arc?: number;
      exit?: boolean;
      done?: () => void;
    } = {},
  ) {
    this.finish(id);
    if (this.reduced()) {
      mesh.position.copyFrom(to);
      options.done?.();
      return;
    }
    this.flights.set(id, {
      mesh,
      from: from.clone(),
      to: to.clone(),
      started: performance.now(),
      duration: options.duration || 620,
      arc: options.arc ?? 1.3,
      rotation: mesh.rotation.y,
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
      baseY: mesh.position.y,
      started: performance.now(),
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
      flip.baseY = position.y;
      flip.mesh.position.x = position.x;
      flip.mesh.position.z = position.z;
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
      flip.mesh.position.y = flip.baseY;
      this.flips.delete(id);
    }
  }
  update(now: number) {
    for (const [id, f] of this.flights) {
      const t = Math.min(1, (now - f.started) / f.duration),
        u = ease.ease(t);
      Vector3.LerpToRef(f.from, f.to, u, f.mesh.position);
      f.mesh.position.y += Math.sin(t * Math.PI) * f.arc;
      f.mesh.rotation.z = Math.sin(t * Math.PI) * 0.065;
      f.mesh.rotation.y = f.rotation + Math.sin(t * Math.PI) * 0.12;
      if (f.exit) {
        f.mesh.visibility = 1 - t * 0.65;
        f.mesh.getChildMeshes().forEach((m) => (m.visibility = 1 - t * 0.65));
      }
      if (t >= 1) this.finish(id);
    }
    for (const [id, f] of this.flips) {
      const t = Math.min(1, (now - f.started) / 480);
      f.mesh.rotation.z = t < 0.5 ? -t * Math.PI : (1 - t) * Math.PI;
      f.mesh.position.y = f.baseY + Math.sin(t * Math.PI) * 1.05;
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
