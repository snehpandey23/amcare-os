/** Replace Web Audio with a silent stub so QA browsers do not play the tour bed. */
const SILENCE = `(() => {
  function param() {
    const p = {
      value: 0,
      setValueAtTime() { return p; },
      linearRampToValueAtTime() { return p; },
      exponentialRampToValueAtTime() { return p; },
      setTargetAtTime() { return p; },
      cancelScheduledValues() { return p; },
    };
    return p;
  }
  function node() {
    const n = {
      connect() { return n; },
      disconnect() {},
      start() {},
      stop() {},
      gain: param(),
      frequency: param(),
      detune: param(),
      Q: param(),
      delayTime: param(),
    };
    return n;
  }
  function AudioStub() {
    const rate = 48000;
    return {
      state: 'running',
      currentTime: 0,
      sampleRate: rate,
      destination: node(),
      listener: {},
      resume() { return Promise.resolve(); },
      suspend() { return Promise.resolve(); },
      close() { return Promise.resolve(); },
      createGain: node,
      createOscillator() { const o = node(); o.type = 'sine'; return o; },
      createBiquadFilter() { const f = node(); f.type = 'lowpass'; return f; },
      createDelay: node,
      createConvolver() { return { buffer: null, connect() { return this; }, disconnect() {} }; },
      createBuffer(ch, len) {
        const data = [];
        for (let i = 0; i < ch; i++) data.push(new Float32Array(len || 1));
        return { length: len, numberOfChannels: ch, sampleRate: rate, getChannelData: (i) => data[i] || data[0] };
      },
      createBufferSource() { const s = node(); s.buffer = null; return s; },
      createAnalyser: node,
      createDynamicsCompressor: node,
      decodeAudioData() { return Promise.resolve({}); },
    };
  }
  window.AudioContext = AudioStub;
  window.webkitAudioContext = AudioStub;
})();`;

export function withSilence(browserType) {
  return {
    launch: async (...args) => {
      const browser = await browserType.launch(...args);
      const orig = browser.newContext.bind(browser);
      browser.newContext = async (...ctxArgs) => {
        const ctx = await orig(...ctxArgs);
        await ctx.addInitScript(SILENCE);
        return ctx;
      };
      return browser;
    },
  };
}
