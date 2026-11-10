// Local synthesis for the card case: a soft leather creak when it opens and a muffled,
// satisfying thock when the lid lands. No downloads; follows the table's sound preference.
export class CaseSound {
  private context?: AudioContext;
  private get enabled() {
    try { return localStorage.getItem("lumina_mesa_sound") !== "off"; }
    catch { return true; }
  }
  async play(opening: boolean) {
    if (!this.enabled) return;
    try {
      const ctx = this.context ??= new AudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state !== "running") return;
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
      const noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.4), ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const burst = (at: number, length: number, type: BiquadFilterType, from: number, to: number, level: number) => {
        const source = ctx.createBufferSource();
        source.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.Q.value = 2.2;
        filter.frequency.setValueAtTime(from, at);
        filter.frequency.exponentialRampToValueAtTime(to, at + length);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(level, at + 0.012);
        env.gain.exponentialRampToValueAtTime(0.001, at + length);
        source.connect(filter).connect(env).connect(master);
        source.start(at);
        source.stop(at + length + 0.02);
      };
      const knock = (at: number, freq: number, level: number) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * 1.6, at);
        osc.frequency.exponentialRampToValueAtTime(freq, at + 0.05);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(level, at + 0.004);
        env.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
        osc.connect(env).connect(master);
        osc.start(at);
        osc.stop(at + 0.18);
      };
      if (opening) {
        knock(now, 340, 0.35);                              // latch releases
        burst(now + 0.03, 0.24, "bandpass", 380, 1100, 0.5); // leather hinge creak
      } else {
        burst(now, 0.12, "bandpass", 900, 420, 0.3);         // lid swings down
        knock(now + 0.11, 120, 0.9);                         // lid lands
        burst(now + 0.11, 0.08, "lowpass", 900, 300, 0.45);  // muffled leather
      }
      setTimeout(() => master.disconnect(), 700);
    } catch {
      /* Audio is optional. */
    }
  }
}
