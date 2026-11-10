// Local synthesis for the candles: a match-like spark when they light, a soft puff with a last
// crackle when they go out. No downloads; follows the table's sound preference.
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
        // Spark: a quick scatter of bright crackles, then the flame catching with a soft whoomp.
        [0, 0.018, 0.041, 0.07, 0.095, 0.13].forEach((t, i) => burst(now + t, 0.03, "highpass", 3200 + i * 500, 0.9 - i * 0.08));
        burst(now + 0.08, 0.38, "lowpass", 520, 0.55, 0.06);
        [0.28, 0.41].forEach((t) => burst(now + t, 0.025, "highpass", 4200, 0.35));
      } else {
        // Out: a breathy puff and one last tiny crackle of the wick.
        burst(now, 0.22, "lowpass", 700, 0.7, 0.02);
        burst(now + 0.02, 0.16, "bandpass", 1600, 0.25, 0.02);
        burst(now + 0.24, 0.02, "highpass", 3800, 0.4);
      }
      setTimeout(() => master.disconnect(), 900);
    } catch {
      /* Audio is optional. */
    }
  }
}
