import type { Engine } from "@babylonjs/core/Engines/engine";
/** Keep at most one submitted GPU frame pending, without blocking the UI thread. */
export class FramePacer {
  private pending?: WebGLSync;
  blockedFrames = 0;
  constructor(private engine: Engine) {}
  ready() {
    if (!this.pending) return true;
    const gl = this.engine._gl,
      status = gl.clientWaitSync(this.pending, 0, 0);
    if (status === gl.TIMEOUT_EXPIRED) {
      this.blockedFrames++;
      return false;
    }
    gl.deleteSync(this.pending);
    this.pending = undefined;
    return true;
  }
  submitted() {
    if (this.engine.webGLVersion < 2) return;
    const gl = this.engine._gl;
    this.pending = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) || undefined;
    gl.flush();
  }
  reset(contextLost = false) {
    if (this.pending && !contextLost) this.engine._gl.deleteSync(this.pending);
    this.pending = undefined;
  }
}
