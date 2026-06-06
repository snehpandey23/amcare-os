/**
 * Siya Circle™ Phase 0 signup — analytics + optional GHL webhook (no PHI in analytics).
 */
(function () {
  var cfg = window.SIYA_CIRCLE_CONFIG || {};
  var form = document.getElementById('siya-circle-signup-form');
  if (!form) return;

  function track(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  }

  track('siya_circle_signup_view', { page_path: location.pathname });

  var successEl = document.getElementById('siya-circle-success');
  var errorEl = document.getElementById('siya-circle-error');
  var pendingNote = document.getElementById('siya-circle-pending-note');

  if (pendingNote && !cfg.integrationReady) {
    pendingNote.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorEl) errorEl.hidden = true;

    var email = (form.querySelector('[name="email"]') || {}).value || '';
    var firstName = (form.querySelector('[name="first_name"]') || {}).value || '';
    var question = (form.querySelector('[name="topic_question"]') || {}).value || '';
    var eduCheck = form.querySelector('[name="education_ack"]');

    if (!email.trim()) {
      if (errorEl) {
        errorEl.textContent = 'Please enter your email address.';
        errorEl.hidden = false;
      }
      return;
    }
    if (!eduCheck || !eduCheck.checked) {
      if (errorEl) {
        errorEl.textContent = 'Please confirm you understand Siya Circle™ is general education only.';
        errorEl.hidden = false;
      }
      return;
    }

    var topicInputs = form.querySelectorAll('[name="topics"]:checked');
    var topicIds = [];
    topicInputs.forEach(function (input) {
      var id = input.value;
      topicIds.push(id);
      var topicCfg = (cfg.topics || []).find(function (t) {
        return t.id === id;
      });
      if (topicCfg && topicCfg.analyticsEvent) {
        track(topicCfg.analyticsEvent, { page_path: location.pathname });
      }
    });

    var hasQuestion = Boolean(question.trim());
    if (hasQuestion) {
      track('siya_circle_question_submitted', {
        page_path: location.pathname,
        has_question: true,
      });
    }

    track('siya_circle_signup_submit', {
      page_path: location.pathname,
      topic_count: topicIds.length,
      has_question: hasQuestion,
    });

    var payload = {
      source: 'siya_circle_phase0',
      listTag: cfg.listTag || 'Siya Circle',
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      topics: topicIds,
      tags: [cfg.listTag || 'Siya Circle'].concat(
        topicIds.map(function (id) {
          var t = (cfg.topics || []).find(function (x) {
            return x.id === id;
          });
          return t ? t.ghlTag : null;
        }).filter(Boolean),
      ),
      topicQuestionProvided: hasQuestion,
      topicQuestion: hasQuestion ? question.trim().slice(0, 500) : undefined,
      pagePath: location.pathname,
      submittedAt: new Date().toISOString(),
    };

    var done = function () {
      form.hidden = true;
      if (successEl) successEl.hidden = false;
      form.reset();
    };

    if (cfg.ghlWebhookUrl) {
      fetch(cfg.ghlWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      })
        .then(done)
        .catch(function () {
          done();
        });
      return;
    }

    if (cfg.ghlFormId && cfg.ghlFormBase) {
      /* TODO: Map fields in GHL admin — redirect with query params as interim */
      var params = new URLSearchParams();
      params.set('email', payload.email);
      if (payload.firstName) params.set('first_name', payload.firstName);
      params.set('tags', payload.tags.join(','));
      if (payload.topicQuestion) params.set('topic_suggestion', payload.topicQuestion);
      window.open(cfg.ghlFormBase + cfg.ghlFormId + '?' + params.toString(), '_blank', 'noopener');
      done();
      return;
    }

    done();
  });
})();
