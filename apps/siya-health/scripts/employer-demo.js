/**
 * /employers/demo presentation. One slide on screen.
 * Event params are a slide number only. No names, emails, free text, or query strings.
 * GTM and siya-tracking.js are inserted by the page only on siya.health.
 */
(function () {
  document.documentElement.classList.add('demo-js');
  var allSlides = Array.prototype.slice.call(document.querySelectorAll('.demo-slide:not(.demo-parked)'));
  var activePath = 'website';
  function sequence() {
    return allSlides.filter(function (slide) {
      var path = slide.getAttribute('data-path');
      return !path || path === 'shared' || path === activePath;
    });
  }
  var slides = sequence();
  var back = document.getElementById('demo-back');
  var next = document.getElementById('demo-next');
  var play = document.getElementById('demo-play');
  var counter = document.getElementById('demo-counter');
  var progress = document.getElementById('demo-progress');
  var fill = document.getElementById('demo-progress-fill');
  var scrub = document.getElementById('demo-scrub');
  var scrubTip = document.getElementById('demo-scrub-tip');
  var stage = document.getElementById('demo-stage');
  var startTour = document.getElementById('demo-start-tour');
  var seen = Object.create(null);
  var current = 0;
  var playing = false;
  var timer = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 900px)');

  function track(name, params) {
    var payload = { event: name };
    if (params && params.slide != null) payload.slide = params.slide;
    if (typeof window.siyaTrack === 'function') {
      window.siyaTrack(name, payload.slide != null ? { slide: payload.slide } : {});
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function indexFromHash() {
    var match = String(location.hash || '').match(/^#\/(\d+)$/);
    if (!match) return 0;
    var n = Number(match[1]);
    if (!n || n < 1 || n > slides.length) return 0;
    return n - 1;
  }

  function paint(index) {
    current = index;
    allSlides.forEach(function (slide) {
      slide.classList.remove('is-active', 'is-in');
      slide.hidden = true;
    });
    slides.forEach(function (slide, i) {
      if (i !== index) return;
      slide.hidden = false;
      slide.classList.add('is-active');
    });
    var slide = slides[index];
    if (reduce) {
      slide.classList.add('is-in');
    } else {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          slide.classList.add('is-in');
        });
      });
    }
    var n = index + 1;
    if (counter) counter.textContent = n + ' / ' + slides.length;
    if (progress) progress.setAttribute('aria-valuenow', String(n));
    if (fill) fill.style.width = (n / slides.length) * 100 + '%';
    if (scrub) {
      scrub.max = String(slides.length);
      scrub.value = String(n);
      scrub.setAttribute('aria-valuemax', String(slides.length));
      scrub.setAttribute('aria-valuenow', String(n));
      var title = slides[index].getAttribute('data-title') || '';
      scrub.setAttribute('aria-valuetext', title);
    }
    if (back) back.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
    if (!seen[n]) {
      seen[n] = true;
      track('employer_demo_slide_view', { slide: n });
    }
    playChat(slide);
  }

  var chatTimer = 0;
  function playChat(slide) {
    window.clearInterval(chatTimer);
    chatTimer = 0;
    var thread = slide && slide.querySelector('.demo-thread');
    if (!thread) return;
    var items = thread.querySelectorAll('.demo-bubble, .demo-note');
    items.forEach(function (item) { item.classList.remove('is-shown'); });
    function revealAll() {
      items.forEach(function (item) { item.classList.add('is-shown'); });
      thread.scrollTop = thread.scrollHeight;
    }
    if (reduce) {
      revealAll();
      return;
    }
    var step = 0;
    function tick() {
      if (step >= items.length) {
        window.clearInterval(chatTimer);
        chatTimer = 0;
        thread.scrollTop = thread.scrollHeight;
        return;
      }
      items[step].classList.add('is-shown');
      thread.scrollTop = thread.scrollHeight;
      step += 1;
    }
    tick();
    chatTimer = window.setInterval(tick, 650);
  }

  function writeHash(index, replace) {
    var url = '#/' + (index + 1);
    if (location.hash === url) return;
    if (replace) history.replaceState({ slide: index }, '', url);
    else history.pushState({ slide: index }, '', url);
  }

  function show(index, fromHistory) {
    if (index < 0 || index >= slides.length) return;
    paint(index);
    if (!fromHistory) writeHash(index, false);
  }

  function stepBack() {
    var slide = slides[current];
    var path = slide && slide.getAttribute('data-path');
    var first = -1;
    var i;
    for (i = 0; i < slides.length; i += 1) {
      if (slides[i].getAttribute('data-path') === activePath) { first = i; break; }
    }
    if (path && path !== 'shared' && current === first) {
      activePath = 'website';
      slides = sequence();
      var chooser = 0;
      for (i = 0; i < slides.length; i += 1) if (slides[i].id === 'chooser') chooser = i;
      show(chooser, false);
      return;
    }
    show(current - 1, false);
  }

  function pause() {
    playing = false;
    window.clearInterval(timer);
    timer = 0;
    if (play) {
      play.setAttribute('aria-pressed', 'false');
      play.textContent = 'Play';
    }
  }

  function playOn() {
    if (playing) return;
    playing = true;
    if (play) {
      play.setAttribute('aria-pressed', 'true');
      play.textContent = 'Pause';
    }
    track('autoplay_on');
    timer = window.setInterval(function () {
      if (current >= slides.length - 1) {
        pause();
        return;
      }
      show(current + 1, false);
    }, 8000);
  }

  if (reduce) {
    var gate = document.getElementById('demo-intro');
    if (gate) gate.hidden = true;
    paint(0);
    writeHash(0, true);
  } else {
    paint(0);
  }

  window.addEventListener('popstate', function () {
    pause();
    paint(indexFromHash());
  });

  if (back) {
    back.addEventListener('click', function (event) {
      event.stopPropagation();
      pause();
      stepBack();
    });
  }
  if (next) {
    next.addEventListener('click', function (event) {
      event.stopPropagation();
      pause();
      show(current + 1, false);
    });
  }
  if (play) {
    play.addEventListener('click', function (event) {
      event.stopPropagation();
      if (playing) pause();
      else playOn();
    });
  }
  if (startTour) {
    startTour.addEventListener('click', function (event) {
      event.stopPropagation();
      pause();
      track('tour_start');
      show(current === 0 ? 1 : current + 1, false);
    });
  }
  if (stage) {
    stage.addEventListener('click', function (event) {
      if (event.target.closest('a, button')) return;
      pause();
      show(current + 1, false);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (!desktop.matches) return;
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    var tag = (event.target && event.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    event.preventDefault();
    pause();
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') show(current + 1, false);
    else stepBack();
  });

  var intro = document.getElementById('demo-intro');
  var introSkip = document.getElementById('demo-intro-skip');
  var introCanvas = document.getElementById('demo-intro-dots');
  var muteBtn = document.getElementById('demo-mute');
  var muted = false;
  var introRunning = false;
  var introFrame = 0;
  var soundOn = false;
  var stars = [];
  var starLinksReady = 0;
  var pointerX = 0.5;
  var pointerY = 0.5;
  var assembleAt = 0;
  var chimed = false;

  function stopStarfield() {
    window.cancelAnimationFrame(introFrame);
    introFrame = 0;
    introRunning = false;
    soundOn = false;
  }

  function playChime() {
    if (muted || !soundOn || !window.AudioContext) return;
    var ctx = new window.AudioContext();
    var now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var start = now + i * 0.09;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.75);
    });
    window.setTimeout(function () { ctx.close(); }, 1600);
  }

  function closeIntro(advance) {
    stopStarfield();
    chimed = false;
    if (intro) {
      intro.hidden = true;
      intro.classList.remove('is-lock', 'is-tag', 'is-bloom', 'is-gate');
    }
    if (advance) show(0, false);
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function makeStars(w, h) {
    var phone = Math.min(w, h) < 700;
    var count = phone ? 350 : 800;
    var cloud = phone ? 36 : 64;
    var accents = ['#D81088', '#A81490', '#7B2D8E'];
    stars = [];
    var i;
    for (i = 0; i < count; i += 1) {
      var layer = i % 7 === 0 ? 2 : (i % 3 === 0 ? 1 : 0);
      var accent = Math.random() < 0.15;
      var nebula = i >= count - cloud;
      var star = {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (0.12 + layer * 0.08),
        vy: (Math.random() - 0.5) * (0.08 + layer * 0.05),
        layer: layer,
        r: layer === 0 ? 0.7 + Math.random() * 0.6 : (layer === 1 ? 1.15 + Math.random() * 0.7 : 1.8 + Math.random() * 1.1),
        base: layer === 0 ? 0.18 + Math.random() * 0.22 : (layer === 1 ? 0.35 + Math.random() * 0.25 : 0.55 + Math.random() * 0.35),
        phase: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 0.9,
        color: accent ? accents[i % 3] : '#F4EFE7',
        links: [],
        letter: false,
        nebula: nebula,
        released: false
      };
      if (nebula) {
        star.x = w / 2 + (Math.random() - 0.5) * w * 0.26;
        star.y = h * 0.46 + (Math.random() - 0.5) * h * 0.16;
        star.r = 0.55 + Math.random() * 0.7;
        star.base = 0.8 + Math.random() * 0.2;
        star.color = '#F4EFE7';
        star.vx *= 0.35;
        star.vy *= 0.35;
      }
      stars.push(star);
    }
  }

  function rebuildLinks() {
    var cell = 78;
    var map = Object.create(null);
    var i;
    var p;
    var key;
    for (i = 0; i < stars.length; i += 1) {
      p = stars[i];
      p.links.length = 0;
      key = ((p.x / cell) | 0) + ':' + ((p.y / cell) | 0);
      if (!map[key]) map[key] = [];
      map[key].push(i);
    }
    for (i = 0; i < stars.length; i += 1) {
      p = stars[i];
      var cx = (p.x / cell) | 0;
      var cy = (p.y / cell) | 0;
      var oy;
      var ox;
      for (oy = -1; oy <= 1; oy += 1) {
        for (ox = -1; ox <= 1; ox += 1) {
          var list = map[(cx + ox) + ':' + (cy + oy)];
          if (!list) continue;
          var j;
          for (j = 0; j < list.length; j += 1) {
            if (p.links.length >= 2) break;
            var o = list[j];
            if (o <= i) continue;
            var dx = stars[o].x - p.x;
            var dy = stars[o].y - p.y;
            var dist = dx * dx + dy * dy;
            if (dist < 64 * 64 && dist > 36) p.links.push(o);
          }
        }
      }
    }
  }

  var inkPath = [];
  var clickX = 0;
  var clickY = 0;

  function densify(points, step) {
    var out = [];
    var i;
    for (i = 0; i < points.length - 1; i += 1) {
      var a = points[i];
      var b = points[i + 1];
      var dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var n = Math.max(1, Math.round(dist / step));
      var k;
      for (k = 0; k < n; k += 1) {
        var u = k / n;
        out.push({ x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u });
      }
    }
    if (points.length) out.push({ x: points[points.length - 1][0], y: points[points.length - 1][1] });
    return out;
  }

  function buildInk(w, h) {
    var glyphs = {
      S: [[[0.92, 0.22], [0.5, 0.04], [0.1, 0.18], [0.12, 0.4], [0.55, 0.5], [0.9, 0.62], [0.78, 0.9], [0.16, 0.92]]],
      i: [[[0.5, 0.4], [0.5, 0.92]], [[0.5, 0.16], [0.5, 0.22]]],
      y: [[[0.12, 0.4], [0.48, 0.74]], [[0.88, 0.4], [0.48, 0.74], [0.4, 1.08]]],
      a: [[[0.82, 0.58], [0.45, 0.4], [0.16, 0.62], [0.22, 0.9], [0.78, 0.88], [0.82, 0.62], [0.82, 0.94]]],
      H: [[[0.16, 0.08], [0.16, 0.92]], [[0.84, 0.08], [0.84, 0.92]], [[0.16, 0.5], [0.84, 0.5]]],
      e: [[[0.78, 0.62], [0.18, 0.62], [0.16, 0.46], [0.5, 0.38], [0.86, 0.52], [0.74, 0.9], [0.2, 0.92]]],
      l: [[[0.42, 0.06], [0.42, 0.86], [0.72, 0.94]]],
      t: [[[0.48, 0.16], [0.48, 0.86], [0.74, 0.94]], [[0.16, 0.46], [0.84, 0.46]]],
      h: [[[0.18, 0.06], [0.18, 0.92]], [[0.18, 0.52], [0.5, 0.38], [0.84, 0.55], [0.84, 0.92]]]
    };
    var widths = { S: 0.78, i: 0.36, y: 0.7, a: 0.68, ' ': 0.38, H: 0.78, e: 0.66, l: 0.42, t: 0.58, h: 0.74 };
    var text = 'Siya Health';
    var total = 0;
    var c;
    for (c = 0; c < text.length; c += 1) total += widths[text.charAt(c)] || 0.5;
    var size = Math.min(w * 0.78 / total, h * 0.22);
    var origin = (w - total * size) / 2;
    var baseline = h * 0.48;
    inkPath = [];
    var cursor = origin;
    for (c = 0; c < text.length; c += 1) {
      var ch = text.charAt(c);
      var adv = (widths[ch] || 0.5) * size;
      var strokes = glyphs[ch] || [];
      var s;
      for (s = 0; s < strokes.length; s += 1) {
        var world = strokes[s].map(function (p) {
          return [cursor + p[0] * size * 0.92, baseline + (p[1] - 0.92) * size];
        });
        inkPath = inkPath.concat(densify(world, 4.5));
      }
      cursor += adv;
    }
    var writers = [];
    var i;
    for (i = 0; i < stars.length; i += 1) if (!stars[i].nebula) writers.push(stars[i]);
    var want = Math.min(inkPath.length, Math.floor(writers.length * 0.62));
    var stride = Math.max(1, Math.floor(inkPath.length / Math.max(1, want)));
    var chosen = [];
    for (i = 0; i < inkPath.length && chosen.length < want; i += stride) chosen.push(inkPath[i]);
    var nPath = Math.max(1, inkPath.length - 1);
    for (i = 0; i < stars.length; i += 1) {
      var star = stars[i];
      star.ox = star.x;
      star.oy = star.y;
      var dx = star.x - clickX;
      var dy = star.y - clickY;
      var dist = Math.hypot(dx, dy) || 1;
      star.ripple = Math.min(420, dist * 0.22);
      star.rvx = dx / dist;
      star.rvy = dy / dist;
      star.letter = false;
      star.released = false;
    }
    for (i = 0; i < chosen.length; i += 1) {
      var starW = writers[i];
      var src = chosen[i];
      var along = 0;
      var j;
      for (j = 0; j < inkPath.length; j += 1) {
        if (inkPath[j] === src) { along = j / nPath; break; }
      }
      starW.letter = true;
      starW.tx = src.x;
      starW.ty = src.y;
      starW.arrive = along * 2500;
      starW.released = false;
    }
  }

  function penAt(t) {
    if (!inkPath.length) return null;
    var u = Math.min(1, Math.max(0, t / 2500));
    var idx = u * (inkPath.length - 1);
    var i0 = idx | 0;
    var i1 = Math.min(inkPath.length - 1, i0 + 1);
    var f = idx - i0;
    return {
      x: inkPath[i0].x + (inkPath[i1].x - inkPath[i0].x) * f,
      y: inkPath[i0].y + (inkPath[i1].y - inkPath[i0].y) * f
    };
  }

  function drawStars(now) {
    if (!intro || !introCanvas || intro.hidden) return;
    var w = intro.clientWidth;
    var h = intro.clientHeight;
    if (w < 2 || h < 2) {
      introFrame = window.requestAnimationFrame(drawStars);
      return;
    }
    var phone = Math.min(w, h) < 700;
    var dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.25 : 1.5);
    if (!stars.length || stars._w !== w || stars._h !== h) {
      makeStars(w, h);
      stars._w = w;
      stars._h = h;
      rebuildLinks();
    }
    if (introCanvas.width !== Math.round(w * dpr) || introCanvas.height !== Math.round(h * dpr)) {
      introCanvas.width = Math.round(w * dpr);
      introCanvas.height = Math.round(h * dpr);
    }
    var ctx = introCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var grd = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h) * 0.48);
    grd.addColorStop(0, 'rgba(10, 36, 107, 0.55)');
    grd.addColorStop(1, 'rgba(10, 36, 107, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    var cloudT = now / 1000;
    var cloudX = w / 2 + Math.sin(cloudT * 0.22) * 16;
    var cloudY = h * 0.46 + Math.cos(cloudT * 0.18) * 10;
    var cloudR = Math.min(w, h) * 0.42;
    var neb = ctx.createRadialGradient(cloudX, cloudY, cloudR * 0.08, cloudX, cloudY, cloudR);
    neb.addColorStop(0, 'rgba(244, 239, 231, 0.18)');
    neb.addColorStop(0.42, 'rgba(244, 239, 231, 0.12)');
    neb.addColorStop(1, 'rgba(244, 239, 231, 0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, w, h);
    var core = ctx.createRadialGradient(w / 2, h * 0.46, 8, w / 2, h * 0.46, Math.min(w, h) * 0.16);
    core.addColorStop(0, 'rgba(5, 10, 36, 0.82)');
    core.addColorStop(1, 'rgba(5, 10, 36, 0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);

    var t = introRunning ? now - assembleAt : 0;
    var gather = introRunning ? easeInOut(Math.min(1, t / 2500)) : 0;
    var bloom = !introRunning || t < 6500 ? 0 : Math.min(1, (t - 6500) / 1500);
    var sec = now / 1000;

    if (introRunning && t >= 2500 && !chimed) {
      chimed = true;
      playChime();
      intro.classList.add('is-lock');
    }
    if (introRunning && t >= 3000) intro.classList.add('is-tag');
    if (introRunning && t >= 6500) intro.classList.add('is-bloom');

    var i;
    for (i = 0; i < stars.length; i += 1) {
      var s = stars[i];
      if (!introRunning) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;
      } else if (s.letter && t < 2500) {
        var rip = 0;
        if (t > s.ripple && t < s.ripple + 260) {
          rip = Math.sin(((t - s.ripple) / 260) * Math.PI) * 16;
        }
        var u = 0;
        if (t >= s.arrive) u = easeInOut(Math.min(1, (t - s.arrive) / 260));
        else u = Math.min(0.08, t / 2500);
        s.x = s.ox + (s.tx - s.ox) * u + s.rvx * rip;
        s.y = s.oy + (s.ty - s.oy) * u + s.rvy * rip;
      } else if (s.letter && t >= 2500) {
        if (!s.released) {
          s.released = true;
          var ang = Math.atan2(s.y - h * 0.46, s.x - w / 2);
          s.rvx = Math.cos(ang) * (0.55 + Math.random() * 0.7);
          s.rvy = Math.sin(ang) * (0.4 + Math.random() * 0.5);
        }
        s.x += s.rvx;
        s.y += s.rvy;
        s.rvx *= 0.992;
        s.rvy *= 0.992;
      } else if (introRunning && t < 700) {
        if (t > s.ripple && t < s.ripple + 260) {
          var push = Math.sin(((t - s.ripple) / 260) * Math.PI) * 0.85;
          s.x += s.rvx * push;
          s.y += s.rvy * push;
        }
        s.x += s.vx * 0.4;
        s.y += s.vy * 0.4;
      } else {
        s.x += s.vx;
        s.y += s.vy;
      }
    }
    void gather;

    starLinksReady += 1;
    if (starLinksReady % 5 === 0) rebuildLinks();

    var px = (pointerX - 0.5);
    var py = (pointerY - 0.5);
    ctx.lineWidth = 1;
    for (i = 0; i < stars.length; i += 1) {
      var a = stars[i];
      var k;
      for (k = 0; k < a.links.length; k += 1) {
        var b = stars[a.links[k]];
        var ax = a.x + px * (8 + a.layer * 10);
        var ay = a.y + py * (6 + a.layer * 8);
        var bx = b.x + px * (8 + b.layer * 10);
        var by = b.y + py * (6 + b.layer * 8);
        ctx.strokeStyle = 'rgba(244, 239, 231, 0.08)';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    var particleFade = 1 - bloom;
    for (i = 0; i < stars.length; i += 1) {
      var star = stars[i];
      var tw = 0.55 + 0.45 * Math.sin(sec * star.tw + star.phase);
      var alpha = star.base * tw * particleFade;
      if (introRunning && star.letter && star.released) alpha *= Math.max(0.05, 1 - (t - 2500) / 1600);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x + px * (8 + star.layer * 10), star.y + py * (6 + star.layer * 8), star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (introRunning && t < 2550) {
      var pen = penAt(t);
      if (pen) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#FF5CB8';
        ctx.beginPath();
        ctx.arc(pen.x, pen.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#F4EFE7';
        ctx.beginPath();
        ctx.arc(pen.x, pen.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (bloom > 0) {
      var light = ctx.createRadialGradient(w / 2, h * 0.46, 10, w / 2, h * 0.46, Math.max(w, h) * 0.72);
      light.addColorStop(0, 'rgba(244, 239, 231, ' + (0.2 + bloom * 0.8) + ')');
      light.addColorStop(1, 'rgba(244, 239, 231, ' + (bloom * 0.95) + ')');
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, w, h);
    }

    if (introRunning && t >= 8000) {
      closeIntro(true);
      return;
    }
    introFrame = window.requestAnimationFrame(drawStars);
  }

  function beginIntro() {
    if (!intro || !introCanvas || introRunning) return;
    introRunning = true;
    soundOn = true;
    chimed = false;
    assembleAt = performance.now();
    intro.classList.remove('is-gate');
    if (!stars.length) makeStars(intro.clientWidth, intro.clientHeight);
    buildInk(intro.clientWidth, intro.clientHeight);
  }

  if (!reduce && intro && introCanvas) {
    intro.addEventListener('pointermove', function (event) {
      var rect = intro.getBoundingClientRect();
      if (!rect.width) return;
      pointerX = (event.clientX - rect.left) / rect.width;
      pointerY = (event.clientY - rect.top) / rect.height;
    });
    window.addEventListener('deviceorientation', function (event) {
      if (event.gamma == null) return;
      pointerX = Math.max(0, Math.min(1, 0.5 + event.gamma / 40));
      pointerY = Math.max(0, Math.min(1, 0.5 + (event.beta || 0) / 70));
    });
    introFrame = window.requestAnimationFrame(drawStars);
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      muted = !muted;
      muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      muteBtn.textContent = muted ? 'Muted' : 'Mute';
      muteBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    });
  }
  if (introSkip) {
    introSkip.addEventListener('click', function (event) {
      event.stopPropagation();
      closeIntro(true);
    });
  }
  if (intro) {
    intro.addEventListener('click', function (event) {
      if (event.target.closest('#demo-intro-skip, #demo-mute')) return;
      event.stopPropagation();
      if (!intro.classList.contains('is-gate') || introRunning) return;
      var box = intro.getBoundingClientRect();
      clickX = event.clientX - box.left;
      clickY = event.clientY - box.top;
      beginIntro();
    });
  }

  var touchX = 0;
  var touchY = 0;
  if (stage) {
    stage.addEventListener('touchstart', function (event) {
      var t = event.changedTouches && event.changedTouches[0];
      if (!t) return;
      touchX = t.clientX;
      touchY = t.clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (event) {
      var t = event.changedTouches && event.changedTouches[0];
      if (!t) return;
      var dx = t.clientX - touchX;
      var dy = t.clientY - touchY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      pause();
      if (dx < 0) show(current + 1, false);
      else stepBack();
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') pause();
  });

  document.querySelectorAll('[data-door]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      pause();
      activePath = button.getAttribute('data-door') || 'website';
      slides = sequence();
      var idx = 0;
      var i;
      for (i = 0; i < slides.length; i += 1) {
        if (slides[i].getAttribute('data-path') === activePath) { idx = i; break; }
      }
      show(idx, false);
    });
  });
  if (scrub) {
    scrub.addEventListener('input', function (event) {
      event.stopPropagation();
      pause();
      show(Number(scrub.value) - 1, false);
    });
    var wrap = document.getElementById('demo-scrub-wrap');
    if (wrap) {
      wrap.addEventListener('pointermove', function (event) {
        if (!scrubTip) return;
        var rect = scrub.getBoundingClientRect();
        var ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0;
        var idx = Math.min(slides.length - 1, Math.max(0, Math.round(ratio * (slides.length - 1))));
        scrubTip.hidden = false;
        scrubTip.textContent = slides[idx].getAttribute('data-title') || '';
      });
      wrap.addEventListener('pointerleave', function () { if (scrubTip) scrubTip.hidden = true; });
    }
  }

  var startChoices = document.querySelectorAll('[data-start-choice]');
  startChoices.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var id = button.getAttribute('data-start-choice');
      startChoices.forEach(function (other) {
        var on = other === button;
        other.classList.toggle('is-selected', on);
        other.classList.toggle('is-dim', !on);
        other.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      document.querySelectorAll('[data-start-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-start-panel') !== id;
      });
      var same = document.getElementById('demo-start-same');
      if (same) same.hidden = false;
    });
  });
})();
