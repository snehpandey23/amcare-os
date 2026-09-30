/**
 * Siya intro — one file, any page.
 *
 * Full screen on that page:
 *   <div data-siya-intro data-start-href="/employers/demo"></div>
 *   <script src="/scripts/siya-intro.js"></script>
 *
 * Or mount it yourself:
 *   SiyaIntro.mount(element, { onStart, skipButton, muteButton, startHref })
 *   Set data-siya-intro="manual" to skip auto-mount.
 *
 * "Start the tour" and a click on the welcome screen fire `siya-intro-start`.
 */
(function (global) {
  var STYLE_ID = 'siya-intro-style';
  var CSS = [
    '.siya-intro{position:fixed;inset:0;z-index:30;background:#050A24;color:#F4EFE7;font-family:Inter,ui-sans-serif,system-ui,sans-serif;overflow:hidden}',
    '.siya-intro-stage{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:pointer}',
    '.siya-intro-hint{position:absolute;left:50%;bottom:calc(9vh + env(safe-area-inset-bottom,0px));transform:translateX(-50%);margin:0;',
    'font:500 13px/1 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:rgba(244,239,231,.7);',
    'animation:siya-intro-pulse 2.6s ease-in-out infinite;pointer-events:none;transition:opacity .4s;z-index:2}',
    '@keyframes siya-intro-pulse{0%,100%{opacity:.35}50%{opacity:.85}}',
    '.siya-intro-tagline{position:absolute;left:50%;transform:translate(-50%,8px);text-align:center;width:min(92vw,900px);margin:0;',
    'font:500 clamp(16px,2.1vw,26px)/1.3 Poppins,ui-sans-serif,system-ui,sans-serif;color:#F4EFE7;opacity:0;',
    'transition:opacity 1s ease,transform 1s ease;pointer-events:none;letter-spacing:.01em;z-index:2}',
    '.siya-intro-tagline.on{opacity:1;transform:translate(-50%,0)}',
    '.siya-intro-tagline em{font-style:normal;background:linear-gradient(90deg,#FF5CB8,#E12193 45%,#C9A0FF);-webkit-background-clip:text;background-clip:text;color:transparent}',
    '.siya-intro-ctrl{position:absolute;top:calc(16px + env(safe-area-inset-top,0px));display:flex;gap:8px;z-index:6}',
    '.siya-intro-ctrl.left{left:16px}.siya-intro-ctrl.right{right:16px}',
    '.siya-intro-ctrl button{font:500 12px/1 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,239,231,.75);',
    'background:rgba(244,239,231,.06);border:1px solid rgba(244,239,231,.18);border-radius:999px;padding:9px 14px;cursor:pointer}',
    '.siya-intro-ctrl button:hover{color:#F4EFE7;border-color:rgba(244,239,231,.4)}',
    '.siya-intro-ctrl button:focus-visible,.siya-intro-start:focus-visible{outline:2px solid #FF5CB8;outline-offset:3px}',
    '.siya-intro-bloom{position:absolute;inset:0;pointer-events:none;opacity:0;z-index:3;',
    'background:radial-gradient(circle at 50% 46%,#F4EFE7 0%,#F4EFE7 30%,rgba(244,239,231,0) 62%);',
    'transform:scale(.2);transition:transform 1.5s cubic-bezier(.6,0,.2,1),opacity 1.5s ease}',
    '.siya-intro-bloom.on{opacity:1;transform:scale(3.2)}',
    '.siya-intro-welcome{position:absolute;inset:0;background:#F4EFE7;color:#0A246B;display:grid;place-items:center;',
    'padding-inline:16px;opacity:0;pointer-events:none;transition:opacity .9s ease;z-index:4;cursor:pointer}',
    '.siya-intro-welcome.on{opacity:1;pointer-events:auto}',
    '.siya-intro-card{text-align:center;display:grid;gap:18px;justify-items:center;max-width:640px}',
    '.siya-intro-brand{font:600 15px/1 Poppins,ui-sans-serif,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#0A246B;opacity:.7}',
    '.siya-intro-card h1{margin:0;font:600 clamp(28px,4.2vw,46px)/1.15 Poppins,ui-sans-serif,system-ui,sans-serif;text-wrap:balance;color:#0A246B}',
    '.siya-intro-card h1 em{font-style:normal;background:linear-gradient(90deg,#D81088,#A81490 35%,#0A246B 75%,#001878);-webkit-background-clip:text;background-clip:text;color:transparent}',
    '.siya-intro-card p{margin:0;font:400 16px/1.5 Inter,ui-sans-serif,system-ui,sans-serif;color:rgba(10,36,107,.72)}',
    '.siya-intro-start{margin-top:8px;font:600 15px/1 Poppins,ui-sans-serif,system-ui,sans-serif;color:#fff;border:0;border-radius:999px;padding:16px 30px;cursor:pointer;',
    'background:linear-gradient(90deg,#D81088,#7B2D8E 55%,#001878);box-shadow:0 10px 30px rgba(123,45,142,.25)}',
    '.siya-intro.is-welcome .demo-intro-skip{color:#0A246B}',
    '@media (prefers-reduced-motion:reduce){.siya-intro-hint{animation:none}}'
  ].join('');

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function mount(root, options) {
    if (!root || root.getAttribute('data-siya-intro-mounted') === '1') return null;
    options = options || {};
    ensureStyle();
    root.classList.add('siya-intro');
    root.setAttribute('data-siya-intro-mounted', '1');

    var canvas = document.createElement('canvas');
    canvas.className = 'siya-intro-stage';
    canvas.setAttribute('aria-label', 'Animated starfield intro for Siya Health');
    var hint = document.createElement('p');
    hint.className = 'siya-intro-hint';
    hint.textContent = 'Click to begin';
    var tag = document.createElement('p');
    tag.className = 'siya-intro-tagline';
    tag.innerHTML = 'Integrated care for <em>busy professionals</em>';
    var bloom = document.createElement('div');
    bloom.className = 'siya-intro-bloom';
    var welcome = document.createElement('section');
    welcome.className = 'siya-intro-welcome';
    welcome.setAttribute('aria-live', 'polite');
    welcome.innerHTML = [
      '<div class="siya-intro-card">',
      '<div class="siya-intro-brand">Siya Health</div>',
      '<h1>An integrated care experience for <em>busy professionals</em></h1>',
      '<p>A 2-minute tour for HR and benefits leaders.</p>',
      '<button class="siya-intro-start" type="button">Start the tour</button>',
      '</div>'
    ].join('');
    root.appendChild(canvas);
    root.appendChild(hint);
    root.appendChild(tag);
    root.appendChild(bloom);
    root.appendChild(welcome);

    var skipBtn = options.skipButton || null;
    var muteBtn = options.muteButton || null;
    if (!skipBtn) {
      var skipWrap = document.createElement('div');
      skipWrap.className = 'siya-intro-ctrl left';
      skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.textContent = 'Skip intro';
      skipWrap.appendChild(skipBtn);
      root.appendChild(skipWrap);
    }
    if (!muteBtn) {
      var muteWrap = document.createElement('div');
      muteWrap.className = 'siya-intro-ctrl right';
      muteBtn = document.createElement('button');
      muteBtn.type = 'button';
      muteBtn.setAttribute('aria-pressed', 'false');
      muteBtn.textContent = 'Sound on';
      muteWrap.appendChild(muteBtn);
      root.appendChild(muteWrap);
    }
    var externalMute = !!options.muteButton;

    var ctx = canvas.getContext('2d');
    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = 0;
    var H = 0;
    var DPR = 1;
    var stars = [];
    var letters = [];
    var phase = 'idle';
    var t0 = 0;
    var textBox = null;
    var muted = false;
    var audio = null;
    var timers = [];
    var raf = 0;
    var started = false;
    var ACC = ['#D81088', '#A81490', '#7B2D8E', '#FF5CB8'];
    var startHref = options.startHref || root.getAttribute('data-start-href') || '';

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function resize() {
      var box = root.getBoundingClientRect();
      var nextW = box.width || global.innerWidth;
      var nextH = box.height || global.innerHeight;
      DPR = Math.min(global.devicePixelRatio || 1, W < 700 ? 1.5 : 2);
      W = Math.round(nextW);
      H = Math.round(nextH);
      canvas.width = Math.max(1, Math.round(W * DPR));
      canvas.height = Math.max(1, Math.round(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function makeStar(layer) {
      var depth = [0.35, 0.65, 1][layer];
      return {
        x: rnd(0, W), y: rnd(0, H),
        vx: rnd(-0.06, 0.06) * depth, vy: rnd(-0.04, 0.04) * depth,
        r: rnd(0.35, 0.9) + depth * 0.7,
        a: rnd(0.25, 0.7) * (0.5 + depth * 0.5),
        tw: rnd(0, Math.PI * 2), ts: rnd(0.6, 1.6),
        c: Math.random() < 0.14 ? ACC[(Math.random() * ACC.length) | 0] : '#F4EFE7',
        depth: depth
      };
    }

    function sampleText() {
      var fs = Math.min(W * 0.13, 170);
      var off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(W));
      off.height = Math.max(1, Math.round(H));
      var o = off.getContext('2d');
      o.fillStyle = '#fff';
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.font = '600 ' + fs + 'px Poppins, ui-sans-serif, system-ui, sans-serif';
      var cy = H * 0.44;
      o.fillText('Siya Health', W / 2, cy);
      var m = o.measureText('Siya Health');
      textBox = { cx: W / 2, cy: cy, fs: fs, w: m.width };
      var d = o.getImageData(0, 0, off.width, off.height).data;
      var pts = [];
      var step = Math.max(3, Math.round(fs / 34));
      var y;
      var x;
      for (y = 0; y < H; y += step) {
        for (x = 0; x < W; x += step) {
          if (d[(y * off.width + x) * 4 + 3] > 140) pts.push({ x: x + rnd(-0.6, 0.6), y: y + rnd(-0.6, 0.6) });
        }
      }
      return pts;
    }

    function build() {
      resize();
      if (W < 2 || H < 2) return;
      var n = W < 700 ? 320 : 720;
      stars = [];
      var i;
      for (i = 0; i < n; i += 1) stars.push(makeStar(i % 3));
      var pts = sampleText();
      letters = pts.map(function (p) {
        var s = makeStar(1 + (Math.random() < 0.5 ? 1 : 0));
        var dist = Math.hypot(s.x - p.x, s.y - p.y);
        var side = Math.random() < 0.5 ? -1 : 1;
        s.sx = s.x;
        s.sy = s.y;
        s.tx = p.x;
        s.ty = p.y;
        s.delay = rnd(0, 0.55) + (p.x - (W / 2 - textBox.w / 2)) / textBox.w * 0.35;
        s.dur = rnd(1.35, 1.75);
        s.cx = (s.x + p.x) / 2 + side * dist * rnd(0.18, 0.34);
        s.cy = (s.y + p.y) / 2 - dist * rnd(0.1, 0.3);
        s.lit = 0;
        return s;
      });
      tag.style.top = (textBox.cy + textBox.fs * 0.72) + 'px';
    }

    function makeAudio() {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      var ac = new AC();
      var master = ac.createGain();
      master.gain.value = muted ? 0 : 0.9;
      var len = ac.sampleRate * 3.2;
      var imp = ac.createBuffer(2, len, ac.sampleRate);
      var c;
      for (c = 0; c < 2; c += 1) {
        var b = imp.getChannelData(c);
        var i;
        for (i = 0; i < len; i += 1) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      var verb = ac.createConvolver();
      verb.buffer = imp;
      var wet = ac.createGain();
      wet.gain.value = 0.55;
      verb.connect(wet);
      wet.connect(master);
      master.connect(ac.destination);
      return { ac: ac, master: master, verb: verb };
    }

    function swell(A) {
      var ac = A.ac;
      var master = A.master;
      var verb = A.verb;
      var now = ac.currentTime;
      var f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(260, now);
      f.frequency.exponentialRampToValueAtTime(2600, now + 2.5);
      f.Q.value = 0.7;
      var g = ac.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.16, now + 2.45);
      g.gain.setTargetAtTime(0.06, now + 2.7, 0.6);
      g.gain.setTargetAtTime(0.0001, now + 4.2, 1.2);
      f.connect(g);
      g.connect(master);
      g.connect(verb);
      [130.81, 196.0, 261.63, 329.63, 392.0].forEach(function (hz, i) {
        var o = ac.createOscillator();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = hz;
        o.detune.value = rnd(-6, 6);
        var og = ac.createGain();
        og.gain.value = i === 0 ? 0.5 : 0.32;
        o.connect(og);
        og.connect(f);
        o.start(now);
        o.stop(now + 9);
      });
      var sh = ac.createOscillator();
      var shg = ac.createGain();
      sh.type = 'sine';
      sh.frequency.setValueAtTime(700, now);
      sh.frequency.exponentialRampToValueAtTime(1570, now + 2.5);
      shg.gain.setValueAtTime(0.0001, now);
      shg.gain.exponentialRampToValueAtTime(0.025, now + 2.3);
      shg.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
      sh.connect(shg);
      shg.connect(verb);
      sh.start(now);
      sh.stop(now + 3);
    }

    function bell(A) {
      var ac = A.ac;
      var master = A.master;
      var verb = A.verb;
      var now = ac.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (hz, i) {
        [1, 2.01, 3.02].forEach(function (mult, k) {
          var o = ac.createOscillator();
          var g = ac.createGain();
          o.type = 'sine';
          o.frequency.value = hz * mult;
          var peak = (k === 0 ? 0.11 : k === 1 ? 0.035 : 0.012) * (1 - i * 0.12);
          var t = now + i * 0.045;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4 - k * 0.8);
          o.connect(g);
          g.connect(master);
          g.connect(verb);
          o.start(t);
          o.stop(t + 3.6);
        });
      });
    }

    function bg() {
      var g = ctx.createRadialGradient(W / 2, H * 0.46, 0, W / 2, H * 0.46, Math.max(W, H) * 0.75);
      g.addColorStop(0, '#0B1A4A');
      g.addColorStop(0.45, '#070F33');
      g.addColorStop(1, '#050A24');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function nebula(time, strength) {
      if (strength <= 0 || !textBox) return;
      ctx.globalCompositeOperation = 'lighter';
      var blobs = [[0, 0, 1], [0.7, 0.2, 0.8], [-0.6, 0.15, 0.75], [0.25, -0.35, 0.6], [-0.3, -0.3, 0.55]];
      blobs.forEach(function (blob, i) {
        var ox = blob[0];
        var oy = blob[1];
        var s = blob[2];
        var x = W / 2 + ox * textBox.w * 0.42 + Math.sin(time * 0.00025 + i * 1.7) * 28;
        var y = textBox.cy + oy * textBox.fs + Math.cos(time * 0.0002 + i) * 18;
        var r = textBox.w * 0.42 * s;
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(244,239,231,' + (0.075 * strength) + ')');
        g.addColorStop(0.5, 'rgba(201,160,255,' + (0.03 * strength) + ')');
        g.addColorStop(1, 'rgba(244,239,231,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      var d = ctx.createRadialGradient(W / 2, textBox.cy, 0, W / 2, textBox.cy, textBox.w * 0.55);
      d.addColorStop(0, 'rgba(5,10,36,' + (0.45 * strength) + ')');
      d.addColorStop(1, 'rgba(5,10,36,0)');
      ctx.fillStyle = d;
      ctx.fillRect(0, 0, W, H);
    }

    function drawStar(s, time, alphaMul, boost) {
      if (alphaMul == null) alphaMul = 1;
      if (boost == null) boost = 0;
      var tw = 0.6 + 0.4 * Math.sin(time * 0.001 * s.ts + s.tw);
      var a = Math.min(1, s.a * tw * alphaMul + boost);
      if (a <= 0.01) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = s.c;
      var r = s.r + boost * 1.2;
      if (r > 1.1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
      }
    }

    function lines(list, maxD, alpha) {
      var cell = maxD;
      var grid = new Map();
      list.forEach(function (s, i) {
        var k = ((s.x / cell) | 0) + ',' + ((s.y / cell) | 0);
        (grid.get(k) || grid.set(k, []).get(k)).push(i);
      });
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = '#F4EFE7';
      list.forEach(function (s, i) {
        if (s.depth < 0.6) return;
        var made = 0;
        var gx = (s.x / cell) | 0;
        var gy = (s.y / cell) | 0;
        var dx;
        var dy;
        for (dx = 0; dx <= 1 && made < 2; dx += 1) {
          for (dy = -1; dy <= 1 && made < 2; dy += 1) {
            var arr = grid.get((gx + dx) + ',' + (gy + dy));
            if (!arr) continue;
            var j;
            for (j = 0; j < arr.length; j += 1) {
              var idx = arr[j];
              if (idx <= i) continue;
              var o = list[idx];
              var d = Math.hypot(s.x - o.x, s.y - o.y);
              if (d < maxD) {
                ctx.globalAlpha = alpha * (1 - d / maxD);
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(o.x, o.y);
                ctx.stroke();
                made += 1;
                if (made >= 2) break;
              }
            }
          }
        }
      });
    }

    function drift(list) {
      var i;
      for (i = 0; i < list.length; i += 1) {
        var s = list[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -5) s.x = W + 5;
        if (s.x > W + 5) s.x = -5;
        if (s.y < -5) s.y = H + 5;
        if (s.y > H + 5) s.y = -5;
      }
    }

    function frame(time) {
      if (phase === 'done') return;
      bg();
      var T = phase === 'idle' ? 0 : (time - t0) / 1000;
      drift(stars);
      var neb = phase === 'idle' ? 0 : Math.min(1, Math.max(0, (T - 1.2) / 1.6));
      if (textBox) nebula(time, neb);
      ctx.globalCompositeOperation = 'lighter';
      lines(stars, W < 700 ? 80 : 110, 0.09);
      var skyDim = phase === 'idle' ? 1 : 1 - 0.35 * Math.min(1, T / 2.5);
      var i;
      for (i = 0; i < stars.length; i += 1) drawStar(stars[i], time, skyDim);
      if (phase === 'idle') {
        drift(letters);
        for (i = 0; i < letters.length; i += 1) {
          letters[i].sx = letters[i].x;
          letters[i].sy = letters[i].y;
          drawStar(letters[i], time);
        }
      } else if (textBox) {
        var lock = 2.55;
        var sweep = T > lock ? (T - lock) / 0.9 : -1;
        var sweepX = textBox.cx - textBox.w / 2 - 60 + sweep * (textBox.w + 120);
        for (i = 0; i < letters.length; i += 1) {
          var s = letters[i];
          var p = Math.min(1, Math.max(0, (T - s.delay) / s.dur));
          var e = ease(p);
          var u = 1 - e;
          s.x = u * u * s.sx + 2 * u * e * s.cx + e * e * s.tx;
          s.y = u * u * s.sy + 2 * u * e * s.cy + e * e * s.ty;
          if (p >= 1) {
            s.x = s.tx + Math.sin(time * 0.0015 + s.tw) * 0.45;
            s.y = s.ty + Math.cos(time * 0.0013 + s.tw) * 0.45;
          }
          if (p > 0 && p < 1) {
            ctx.globalAlpha = 0.18 * (1 - Math.abs(p - 0.5) * 2);
            ctx.strokeStyle = s.c;
            ctx.lineWidth = s.r * 0.9;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            var pb = Math.max(0, e - 0.06);
            var ub = 1 - pb;
            ctx.lineTo(
              ub * ub * s.sx + 2 * ub * pb * s.cx + pb * pb * s.tx,
              ub * ub * s.sy + 2 * ub * pb * s.cy + pb * pb * s.ty
            );
            ctx.stroke();
          }
          var arrived = p >= 1 ? 1 : 0;
          var boost = arrived * 0.35;
          if (sweep >= 0 && sweep <= 1.2) boost += Math.exp(-Math.pow((s.x - sweepX) / 38, 2)) * 0.9;
          var fade = T > lock + 0.9 ? Math.max(0.28, 1 - (T - lock - 0.9) * 0.6) : 1;
          drawStar(s, time, (0.9 + arrived * 0.4) * fade, boost * fade);
        }
        if (T > lock && T < lock + 1.2) {
          var k = 1 - (T - lock) / 1.2;
          ctx.globalCompositeOperation = 'lighter';
          var g = ctx.createRadialGradient(textBox.cx, textBox.cy, 0, textBox.cx, textBox.cy, textBox.w * 0.7);
          g.addColorStop(0, 'rgba(244,239,231,' + (0.22 * k) + ')');
          g.addColorStop(1, 'rgba(244,239,231,0)');
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }
        if (T > lock + 0.15) {
          var alpha = Math.min(1, (T - lock - 0.15) / 0.9);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = alpha;
          ctx.font = '600 ' + textBox.fs + 'px Poppins, ui-sans-serif, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(244,239,231,.55)';
          ctx.shadowBlur = 24 * alpha;
          ctx.fillStyle = '#F7F2EC';
          ctx.fillText('Siya Health', textBox.cx, textBox.cy);
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (phase !== 'done') raf = global.requestAnimationFrame(frame);
    }

    function at(ms, fn) { timers.push(global.setTimeout(fn, ms)); }

    function finish() {
      timers.forEach(clearTimeout);
      timers = [];
      welcome.classList.add('on');
      root.classList.add('is-welcome');
      tag.classList.remove('on');
      global.setTimeout(function () {
        phase = 'done';
        global.cancelAnimationFrame(raf);
      }, 900);
    }

    function play() {
      if (phase !== 'idle') return;
      phase = 'play';
      t0 = performance.now();
      hint.style.opacity = '0';
      try {
        audio = audio || makeAudio();
        if (audio) {
          audio.ac.resume();
          audio.master.gain.value = muted ? 0 : 0.9;
          swell(audio);
        }
      } catch (err) { /* audio is optional */ }
      at(2550, function () { try { if (audio) bell(audio); } catch (err) { /* ignore */ } });
      at(3300, function () { tag.classList.add('on'); });
      at(6600, function () { bloom.classList.add('on'); });
      at(7700, finish);
    }

    function beginTour() {
      if (started) return;
      if (!welcome.classList.contains('on')) return;
      started = true;
      var event;
      try {
        event = new CustomEvent('siya-intro-start', { bubbles: true });
      } catch (err) {
        event = document.createEvent('Event');
        event.initEvent('siya-intro-start', true, true);
      }
      root.dispatchEvent(event);
      if (typeof options.onStart === 'function') options.onStart();
      else if (startHref) global.location.href = startHref;
    }

    canvas.addEventListener('click', play);
    global.addEventListener('keydown', function (event) {
      if (root.hidden || phase !== 'idle') return;
      if (event.target && event.target.closest && event.target.closest('button, a, input, textarea')) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    });
    skipBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      if (phase === 'idle') phase = 'play';
      finish();
    });
    welcome.addEventListener('click', function (event) {
      event.stopPropagation();
      beginTour();
    });
    muteBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      muted = !muted;
      muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      if (externalMute) {
        muteBtn.textContent = muted ? 'Muted' : 'Mute';
        muteBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
      } else {
        muteBtn.textContent = muted ? 'Sound off' : 'Sound on';
      }
      if (audio) audio.master.gain.setTargetAtTime(muted ? 0 : 0.9, audio.ac.currentTime, 0.05);
    });

    var rt = 0;
    global.addEventListener('resize', function () {
      global.clearTimeout(rt);
      rt = global.setTimeout(function () {
        if (phase === 'idle') build();
      }, 200);
    });

    function boot() {
      build();
      if (reduce) {
        phase = 'done';
        welcome.classList.add('on');
        root.classList.add('is-welcome');
        bg();
        return;
      }
      if (!stars.length) {
        raf = global.requestAnimationFrame(function retry() {
          if (phase === 'done') return;
          build();
          if (!stars.length) raf = global.requestAnimationFrame(retry);
          else raf = global.requestAnimationFrame(frame);
        });
        return;
      }
      raf = global.requestAnimationFrame(frame);
    }

    var fonts = document.fonts;
    (fonts && fonts.load ? fonts.load('600 100px Poppins').catch(function () { return null; }) : Promise.resolve()).then(boot);
    return { play: play, finish: finish };
  }

  function auto() {
    var nodes = document.querySelectorAll('[data-siya-intro]');
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].getAttribute('data-siya-intro') === 'manual') continue;
      mount(nodes[i]);
    }
  }

  global.SiyaIntro = { mount: mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto);
  else auto();
})(window);
