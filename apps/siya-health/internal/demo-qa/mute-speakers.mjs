/** Send Web Audio to a zero gain so gate browsers stay silent. The clock still runs. */
export const MUTE_SPEAKERS = `(() => {
  const Orig = window.AudioContext || window.webkitAudioContext;
  if (!Orig || Orig.__siyaMuted) return;
  const origConnect = AudioNode.prototype.connect;
  const sinks = new WeakMap();
  AudioNode.prototype.connect = function (node) {
    const rest = Array.prototype.slice.call(arguments, 1);
    const sink = node && sinks.get(node);
    if (sink) return origConnect.call(this, sink, ...rest);
    return origConnect.apply(this, arguments);
  };
  function MuteCtx() {
    const ac = new Orig();
    const sink = ac.createGain();
    sink.gain.value = 0;
    origConnect.call(sink, ac.destination);
    sinks.set(ac.destination, sink);
    return ac;
  }
  MuteCtx.prototype = Orig.prototype;
  MuteCtx.__siyaMuted = true;
  window.AudioContext = MuteCtx;
  if (window.webkitAudioContext) window.webkitAudioContext = MuteCtx;
})();`;
