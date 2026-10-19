// Local synthesis: dry paper flicks over a soft, filtered shuffle. No downloads.
export class ShuffleSound {
  private context?: AudioContext;
  private active?: GainNode;
  get enabled() {
    try { return localStorage.getItem("lumina_mesa_sound") !== "off"; }
    catch { return true; }
  }
  set enabled(value: boolean) {
    try { localStorage.setItem("lumina_mesa_sound", value ? "on" : "off"); }
    catch { /* Audio is optional. */ }
    if (!value && this.context && this.active) {
      this.active.gain.cancelScheduledValues(this.context.currentTime);
      this.active.gain.setTargetAtTime(0, this.context.currentTime, 0.015);
    }
  }
  async play() {
    if (!this.enabled) return;
    try {
      const ctx = this.context ??= new AudioContext();
      // Called directly from a click/key gesture, including on mobile browsers.
      if (ctx.state === "suspended") await ctx.resume();
      if (!this.enabled || ctx.state !== "running") return;
      const now = ctx.currentTime;
      if (this.active) {
        this.active.gain.cancelScheduledValues(now);
        this.active.gain.setTargetAtTime(0, now, 0.015);
      }
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      this.active = master;
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.18), ctx.sampleRate);
      const samples = buffer.getChannelData(0);
      let smooth = 0;
      for (let i = 0; i < samples.length; i++) {
        smooth = smooth * 0.45 + (Math.random() * 2 - 1) * 0.55;
        samples[i] = smooth;
      }
      // Two short riffles with increasingly close paper clicks, then a soft settling tap.
      const times = [0, 0.075, 0.135, 0.185, 0.23, 0.27, 0.43, 0.5, 0.555, 0.6, 0.64, 0.675, 0.79];
      times.forEach((offset, i) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = 0.85 + (i % 5) * 0.075;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = i === times.length - 1 ? 430 : 1500 + (i % 4) * 330;
        filter.Q.value = 0.55;
        const envelope = ctx.createGain();
        const at = now + offset;
        envelope.gain.setValueAtTime(0, at);
        envelope.gain.linearRampToValueAtTime(i === times.length - 1 ? 0.7 : 1, at + 0.003);
        envelope.gain.exponentialRampToValueAtTime(0.001, at + 0.105);
        source.connect(filter).connect(envelope).connect(master);
        source.start(at);
        source.stop(at + 0.12);
        source.onended = () => {
          source.disconnect(); filter.disconnect(); envelope.disconnect();
          if (i === times.length - 1) {
            master.disconnect();
            if (this.active === master) this.active = undefined;
          }
        };
      });
    } catch { /* A blocked or unavailable audio device must never interrupt the reading. */ }
  }
}
