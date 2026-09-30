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

  paint(0);
  if (reduce) writeHash(0, true);

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
    var gate = document.getElementById('demo-intro');
    if (gate && !gate.hidden) return;
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
  var muteBtn = document.getElementById('demo-mute');

  function beginTour() {
    if (intro) intro.hidden = true;
    pause();
    track('tour_start');
    var hashed = indexFromHash();
    show(hashed > 0 ? hashed : 1, false);
  }

  if (intro && window.SiyaIntro) {
    window.SiyaIntro.mount(intro, {
      skipButton: introSkip,
      muteButton: muteBtn,
      onStart: beginTour
    });
  } else if (intro) {
    intro.hidden = true;
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
