// Local synthesis for the candles: the soft whoomp of a flame catching when they light, and a
// breathy puff when they go out. No downloads; follows the table's sound preference.
export class CandleSound {
  private context?: AudioContext;
  private get enabled() {
    try { return localStorage.getItem("lumina_mesa_sound") !== "off"; }
    catch { return true; }
  }
  async play(lighting: boolean) {
    if (!this.enabled) return;
    try {
      const ctx = this.context ??= new AudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state !== "running") return;
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.3;
      master.connect(ctx.destination);
      const noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.5), ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const burst = (at: number, length: number, type: BiquadFilterType, freq: number, level: number, attack = 0.002) => {
        const source = ctx.createBufferSource();
        source.buffer = noise;
        source.playbackRate.value = 0.8 + Math.random() * 0.4;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = 1.2;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(level, at + attack);
        env.gain.exponentialRampToValueAtTime(0.001, at + length);
        source.connect(filter).connect(env).connect(master);
        source.start(at, Math.random() * 0.3);
        source.stop(at + length + 0.02);
      };
      if (lighting) {
        // Just the fire: a warm, rounded whoomp as the flame catches, settling into a low hush.
        burst(now, 0.45, "lowpass", 480, 0.75, 0.08);
        burst(now + 0.05, 0.6, "lowpass", 260, 0.35, 0.15);
      } else {
        // Out: a short breathy puff.
        burst(now, 0.22, "lowpass", 700, 0.7, 0.02);
        burst(now + 0.02, 0.16, "bandpass", 1400, 0.2, 0.02);
      }
      setTimeout(() => master.disconnect(), 900);
    } catch {
      /* Audio is optional. */
    }
  }
}
