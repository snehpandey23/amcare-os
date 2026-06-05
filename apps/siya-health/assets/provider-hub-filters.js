(function () {
  var root = document.getElementById('provider-hub-filters');
  if (!root) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll('.provider-index-card'));
  var statusEl = document.getElementById('provider-filter-status');
  var active = { state: 'all', service: 'all' };

  function setActiveChip(group, value) {
    var chips = root.querySelectorAll('[data-filter-group="' + group + '"]');
    chips.forEach(function (chip) {
      chip.classList.toggle('is-active', chip.getAttribute('data-filter-value') === value);
    });
  }

  function matches(card) {
    var states = (card.getAttribute('data-states') || '').split(',').filter(Boolean);
    var services = (card.getAttribute('data-services') || '').split(',').filter(Boolean);
    var stateOk = active.state === 'all' || states.indexOf(active.state) !== -1;
    var serviceOk = active.service === 'all' || services.indexOf(active.service) !== -1;
    return stateOk && serviceOk;
  }

  function applyFilters() {
    var visible = 0;
    cards.forEach(function (card) {
      var show = matches(card);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (statusEl) {
      var parts = [];
      if (active.state !== 'all') parts.push('licensed in ' + active.state);
      if (active.service !== 'all') parts.push(active.service.replace(/-/g, ' '));
      var suffix = parts.length ? ' (' + parts.join(' · ') + ')' : '';
      statusEl.textContent = 'Showing ' + visible + ' of ' + cards.length + ' clinicians' + suffix;
    }
  }

  root.addEventListener('click', function (e) {
    var chip = e.target.closest('.provider-filter-chip');
    if (!chip) return;
    var group = chip.getAttribute('data-filter-group');
    var value = chip.getAttribute('data-filter-value');
    if (!group || !value) return;
    active[group] = value;
    setActiveChip(group, value);
    applyFilters();
  });

  applyFilters();
})();
