/**
 * /employers/demo presentation. One slide on screen.
 * Event params are a slide number only. No names, emails, free text, or query strings.
 * GTM and siya-tracking.js are inserted by the page only on siya.health.
 */
(function () {
  document.documentElement.classList.add('demo-js');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.demo-slide'));
  var back = document.getElementById('demo-back');
  var next = document.getElementById('demo-next');
  var play = document.getElementById('demo-play');
  var counter = document.getElementById('demo-counter');
  var progress = document.getElementById('demo-progress');
  var fill = document.getElementById('demo-progress-fill');
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
    slides.forEach(function (slide, i) {
      var on = i === index;
      slide.classList.toggle('is-active', on);
      slide.hidden = !on;
      slide.classList.remove('is-in');
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

  paint(indexFromHash());
  writeHash(current, true);

  window.addEventListener('popstate', function () {
    pause();
    paint(indexFromHash());
  });

  if (back) {
    back.addEventListener('click', function (event) {
      event.stopPropagation();
      pause();
      show(current - 1, false);
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
      if (reduce || introSeen()) show(1, false);
      else beginIntro();
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
    show(event.key === 'ArrowRight' || event.key === 'ArrowDown' ? current + 1 : current - 1, false);
  });

  var intro = document.getElementById('demo-intro');
  var introSkip = document.getElementById('demo-intro-skip');
  var introName = document.getElementById('demo-intro-name');
  var introCanvas = document.getElementById('demo-intro-dots');
  var muteBtn = document.getElementById('demo-mute');
  var muted = false;
  var introRunning = false;
  var introFrame = 0;
  var introClock = 0;
  var chimeTimer = 0;
  var nameTimer = 0;
  var SEEN_KEY = 'siya_demo_intro_seen';
  var NAME = 'Siya Health';
  var DOT_COLORS = ['#D81088', '#A81490', '#7B2D8E', '#001878'];

  function introSeen() {
    try { return localStorage.getItem(SEEN_KEY) === '1'; }
    catch (err) { return false; }
  }

  function markIntroSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); }
    catch (err) { /* private mode */ }
  }

  function stopChimeTimers() {
    window.clearTimeout(chimeTimer);
    window.clearTimeout(nameTimer);
    window.clearTimeout(introClock);
    chimeTimer = 0;
    nameTimer = 0;
    introClock = 0;
  }

  function playChime() {
    if (muted || !introRunning || !window.AudioContext) return;
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
    introRunning = false;
    window.cancelAnimationFrame(introFrame);
    introFrame = 0;
    stopChimeTimers();
    if (intro) {
      intro.hidden = true;
      intro.classList.remove('is-cream', 'is-line');
    }
    if (advance) show(1, false);
  }

  function beginIntro() {
    if (!intro || !introCanvas) {
      show(1, false);
      return;
    }
    markIntroSeen();
    introRunning = true;
    intro.hidden = false;
    intro.classList.remove('is-cream', 'is-line');
    if (introName) introName.textContent = '';
    var dots = [];
    var i;
    for (i = 0; i < 22; i += 1) {
      dots.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.018,
        vy: (Math.random() - 0.5) * 0.014,
        r: 5 + Math.random() * 9,
        color: DOT_COLORS[i % DOT_COLORS.length],
        alpha: 0.28 + (i % 4) * 0.16
      });
    }
    var ctx = introCanvas.getContext('2d');
    var started = performance.now();
    var chimed = false;
    function frame(now) {
      if (!introRunning) return;
      var t = now - started;
      var w = intro.clientWidth;
      var h = intro.clientHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (introCanvas.width !== Math.round(w * dpr) || introCanvas.height !== Math.round(h * dpr)) {
        introCanvas.width = Math.round(w * dpr);
        introCanvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var gather = t < 1500 ? 0 : Math.min(1, (t - 1500) / 900);
      gather = gather * gather * (3 - 2 * gather);
      var fade = t < 2900 ? 1 : Math.max(0, 1 - (t - 2900) / 500);
      if (t >= 2000) intro.classList.add('is-cream');
      dots.forEach(function (dot) {
        if (gather <= 0) {
          dot.x += dot.vx * 0.35;
          dot.y += dot.vy * 0.35;
          if (dot.x < 0.05 || dot.x > 0.95) dot.vx *= -1;
          if (dot.y < 0.08 || dot.y > 0.92) dot.vy *= -1;
        }
        var x = (dot.x + (0.5 - dot.x) * gather) * w;
        var y = (dot.y + (0.5 - dot.y) * gather) * h;
        ctx.beginPath();
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = dot.alpha * fade;
        ctx.shadowColor = dot.color;
        ctx.shadowBlur = 18;
        ctx.arc(x, y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (!chimed && gather >= 1) {
        chimed = true;
        playChime();
      }
      if (t < 4700) introFrame = window.requestAnimationFrame(frame);
    }
    introFrame = window.requestAnimationFrame(frame);
    nameTimer = window.setTimeout(function () {
      var step = 0;
      function typeName() {
        if (!introRunning || !introName) return;
        step += 1;
        introName.textContent = NAME.slice(0, step);
        if (step < NAME.length) nameTimer = window.setTimeout(typeName, 64);
        else {
          intro.classList.add('is-line');
          introClock = window.setTimeout(function () {
            if (introRunning) closeIntro(true);
          }, 1500);
        }
      }
      typeName();
    }, 2700);
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
      markIntroSeen();
      closeIntro(true);
    });
  }
  if (intro) {
    intro.addEventListener('click', function (event) {
      event.stopPropagation();
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
      show(dx < 0 ? current + 1 : current - 1, false);
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') pause();
  });

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
