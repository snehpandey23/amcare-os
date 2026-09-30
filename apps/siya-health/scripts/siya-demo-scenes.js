/**
 * Scenes for the employer tour, after the intro.
 * Same idea as the opening: one clock, a path, a delay, then a lock.
 * The words stay in the HTML. The pictures only show what the words say.
 */
(function (global) {
  var raf = 0;
  var reduce = global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function clamp(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }
  function stop() {
    global.cancelAnimationFrame(raf);
    raf = 0;
  }
  function hourAng(hour) {
    return (hour / 12) * Math.PI * 2 - Math.PI / 2;
  }

  function lockTick() {
    var mute = document.getElementById('demo-mute');
    if (reduce || (mute && mute.getAttribute('aria-pressed') === 'true')) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    try {
      var ac = new AC();
      var o = ac.createOscillator();
      var g = ac.createGain();
      var now = ac.currentTime;
      o.type = 'sine';
      o.frequency.value = 784;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.035, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      o.connect(g);
      g.connect(ac.destination);
      o.start(now);
      o.stop(now + 0.24);
      global.setTimeout(function () { ac.close(); }, 500);
    } catch (err) { /* sound is optional */ }
  }

  function fit(canvas) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 280;
    var h = canvas.clientHeight || 120;
    var nextW = Math.max(1, Math.round(w * dpr));
    var nextH = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawMiss(canvas, T) {
    var box = fit(canvas);
    var ctx = box.ctx;
    var w = box.w;
    var h = box.h;
    var cx = w / 2;
    var cy = h * 0.52;
    var r = Math.min(w, h) * 0.38;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#001878';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 24, 120, 0.28)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.arc(cx, cy, r - 8, hourAng(9), hourAng(5), false);
    ctx.stroke();
    var e = ease(clamp(T / 1.45));
    var a0 = hourAng(9);
    var a1 = hourAng(7.67);
    var delta = a1 - a0;
    if (delta < 0) delta += Math.PI * 2;
    var a = a0 + delta * e;
    var hx = cx + Math.cos(a) * r * 0.62;
    var hy = cy + Math.sin(a) * r * 0.62;
    if (e > 0.92) {
      var glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 16);
      glow.addColorStop(0, 'rgba(216, 16, 136, 0.35)');
      glow.addColorStop(1, 'rgba(216, 16, 136, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hx, hy, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(hx, hy);
    ctx.strokeStyle = '#D81088';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#001878';
    ctx.fill();
  }

  function drawWait(canvas, T) {
    var box = fit(canvas);
    var ctx = box.ctx;
    var w = box.w;
    var h = box.h;
    var bw = Math.min(w * 0.78, 168);
    var bh = 52;
    var x = (w - bw) / 2;
    var y = h * 0.18;
    var enter = ease(clamp(T / 0.45));
    ctx.globalAlpha = enter;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#001878';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, bw, bh, 16);
    ctx.fill();
    ctx.stroke();
    var dots = 1 - clamp((T - 0.55) / 0.35);
    if (dots > 0) {
      var i;
      ctx.globalAlpha = enter * dots;
      ctx.fillStyle = '#0A246B';
      for (i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(x + bw * 0.36 + i * 16, y + bh / 2, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    var stamp = ease(clamp((T - 0.85) / 0.55));
    if (stamp > 0) {
      ctx.globalAlpha = stamp;
      ctx.fillStyle = '#D81088';
      ctx.font = '600 13px Poppins, ui-sans-serif, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Seen · 3 days', w / 2, y + bh + 18);
    }
    ctx.globalAlpha = 1;
  }

  function drawApps(canvas, T) {
    var box = fit(canvas);
    var ctx = box.ctx;
    var w = box.w;
    var h = box.h;
    var pts = [];
    var i;
    for (i = 0; i < 5; i += 1) {
      var ang = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      var e = ease(clamp((T - i * 0.08) / 1.25));
      var u = 1 - e;
      var outer = Math.min(w, h) * 0.42;
      var miss = outer * 0.58;
      var sx = w / 2 + Math.cos(ang) * outer;
      var sy = h * 0.5 + Math.sin(ang) * outer * 0.7;
      var tx = w / 2 + Math.cos(ang) * miss;
      var ty = h * 0.5 + Math.sin(ang) * miss * 0.7;
      var side = i % 2 ? 1 : -1;
      var cx = (sx + w / 2) / 2 + side * 26;
      var cy = (sy + h * 0.5) / 2 - 16;
      pts.push({
        x: u * u * sx + 2 * u * e * cx + e * e * tx,
        y: u * u * sy + 2 * u * e * cy + e * e * ty
      });
    }
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = '#001878';
    for (i = 0; i < pts.length; i += 1) {
      var a = pts[i];
      var b = pts[(i + 2) % pts.length];
      var fade = clamp((T - 0.3) / 0.8) * (0.25 + 0.12 * Math.sin(T * 2.4 + i));
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * 0.4, a.y + (b.y - a.y) * 0.4);
      ctx.stroke();
    }
    for (i = 0; i < pts.length; i += 1) {
      ctx.globalAlpha = 0.92;
      roundRect(ctx, pts[i].x - 8, pts[i].y - 8, 16, 16, 4);
      ctx.fillStyle = i === 0 ? '#D81088' : '#001878';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function playProblem(slide) {
    var miss = slide.querySelector('[data-scene="miss"]');
    var wait = slide.querySelector('[data-scene="wait"]');
    var apps = slide.querySelector('[data-scene="apps"]');
    if (!miss || !wait || !apps) return;
    if (reduce) {
      drawMiss(miss, 9);
      drawWait(wait, 9);
      drawApps(apps, 9);
      return;
    }
    var t0 = performance.now();
    function frame(now) {
      var T = (now - t0) / 1000;
      drawMiss(miss, T);
      drawWait(wait, Math.max(0, T - 0.2));
      drawApps(apps, Math.max(0, T - 0.4));
      if (T < 2.8) raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);
  }

  function playSweep(cells, pick, seconds) {
    cells.forEach(function (el) {
      el.classList.remove('is-pick', 'is-sweep');
      el.style.opacity = '';
      el.style.transform = '';
    });
    if (reduce) {
      if (pick) pick.classList.add('is-pick');
      return;
    }
    var t0 = performance.now();
    var locked = false;
    function frame(now) {
      var T = (now - t0) / 1000;
      var u = ease(clamp(T / seconds));
      var idx = Math.min(cells.length - 1, Math.floor(u * cells.length));
      var i;
      for (i = 0; i < cells.length; i += 1) {
        var el = cells[i];
        var shown = ease(clamp((T - i * 0.05) / 0.28));
        el.style.opacity = String(0.28 + 0.72 * shown);
        el.style.transform = 'translateY(' + ((1 - shown) * 8) + 'px)';
        el.classList.toggle('is-sweep', i === idx && T < seconds);
      }
      if (T >= seconds && !locked) {
        locked = true;
        for (i = 0; i < cells.length; i += 1) cells[i].classList.remove('is-sweep');
        if (pick) pick.classList.add('is-pick');
        lockTick();
      }
      if (T < seconds + 0.35) raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);
  }

  function onSlide(slide) {
    stop();
    if (!slide) return;
    if (slide.id === 'problem') playProblem(slide);
    else if (slide.id === 'end-cal') {
      playSweep(
        Array.prototype.slice.call(slide.querySelectorAll('.demo-cal-grid span')),
        slide.querySelector('[data-pick]'),
        1.15
      );
    } else if (slide.id === 'end-time') {
      playSweep(
        Array.prototype.slice.call(slide.querySelectorAll('.demo-times span')),
        slide.querySelector('[data-pick]'),
        0.95
      );
    }
  }

  global.SiyaScenes = { onSlide: onSlide };
})(window);
