/**
 * Client-side keyword search for /answers (Health Guides) hub.
 * Mirrors blog-search.js behavior against guide-index.json.
 */
(function () {
  if (!/\/answers\/?$/.test(window.location.pathname)) return;

  var input = document.getElementById('guide-search-input');
  var results = document.getElementById('guide-search-results');
  var status = document.getElementById('guide-search-status');
  if (!input || !results) return;

  var guides = [];
  var timer = null;

  function decodeHtml(value) {
    var el = document.createElement('textarea');
    el.innerHTML = value || '';
    return el.value;
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function scoreGuide(guide, query) {
    var haystack = normalize(
      [guide.title, guide.description, guide.category, guide.topics].join(' '),
    );
    var tokens = query.split(' ').filter(Boolean);
    if (!tokens.length) return 0;
    var score = 0;
    for (var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      if (haystack.indexOf(token) === -1) return 0;
      if (normalize(guide.title).indexOf(token) !== -1) score += 3;
      if (normalize(guide.category).indexOf(token) !== -1) score += 2;
      score += 1;
    }
    return score;
  }

  function render(matches) {
    results.innerHTML = '';
    if (!matches.length) {
      results.hidden = true;
      if (status) {
        status.textContent = 'No guides matched. Try ADHD, GLP-1, thyroid, fatigue, or perimenopause.';
        status.hidden = false;
      }
      return;
    }

    var list = document.createElement('ul');
    list.className = 'blog-search-results-list';
    matches.slice(0, 12).forEach(function (guide) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      link.href = guide.path;
      link.className = 'blog-search-result';
      var title = document.createElement('span');
      title.className = 'blog-search-result__title';
      title.textContent = guide.title;
      var meta = document.createElement('span');
      meta.className = 'blog-search-result__meta';
      meta.textContent = guide.category || '';
      link.appendChild(title);
      link.appendChild(meta);
      if (guide.description) {
        var desc = document.createElement('span');
        desc.className = 'blog-search-result__desc';
        desc.textContent = guide.description;
        link.appendChild(desc);
      }
      item.appendChild(link);
      list.appendChild(item);
    });
    results.appendChild(list);
    results.hidden = false;
    if (status) {
      status.textContent = matches.length + ' guide' + (matches.length === 1 ? '' : 's') + ' found';
      status.hidden = false;
    }
  }

  function runSearch() {
    var query = normalize(input.value);
    if (!query) {
      results.hidden = true;
      if (status) status.hidden = true;
      return;
    }
    var matches = guides
      .map(function (guide) {
        return { guide: guide, score: scoreGuide(guide, query) };
      })
      .filter(function (entry) {
        return entry.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.guide.title.localeCompare(b.guide.title);
      })
      .map(function (entry) {
        return entry.guide;
      });
    render(matches);
  }

  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 120);
  });

  function cleanTitle(value) {
    // Titles are often "Question? | Siya Health" — trim the site suffix for display.
    return decodeHtml(value).replace(/\s*[|·—-]\s*Siya Health\s*$/i, '').trim();
  }

  fetch('/guide-index.json', { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) throw new Error('index missing');
      return response.json();
    })
    .then(function (data) {
      guides = (data.guides || []).map(function (entry) {
        var topics = (entry.topics || []).join(', ');
        return {
          title: cleanTitle(entry.title),
          path: entry.url.replace('https://siya.health', ''),
          description: entry.description || '',
          category: topics,
          topics: topics,
        };
      });
    })
    .catch(function () {
      if (status) {
        status.textContent = 'Search is temporarily unavailable.';
        status.hidden = false;
      }
    });
})();
