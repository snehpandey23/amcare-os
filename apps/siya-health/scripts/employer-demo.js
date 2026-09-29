/**
 * /employers/demo presentation. One slide on screen.
 * Event params are a slide number only. No names, emails, free text, or query strings.
 * GTM and siya-tracking.js are inserted by the page only on siya.health.
 */
(function () {
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
      show(1, false);
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
