/**
 * Client-side keyword search for /blog hub.
 */
(function () {
  if (!/\/blog\/?$/.test(window.location.pathname)) return;

  var input = document.getElementById('blog-search-input');
  var results = document.getElementById('blog-search-results');
  var status = document.getElementById('blog-search-status');
  if (!input || !results) return;

  var articles = [];
  var timer = null;
  var hubPaths = {
    'https://siya.health/blog': true,
    'https://siya.health/blog/adhd': true,
    'https://siya.health/blog/weight-loss': true,
    'https://siya.health/blog/telehealth': true,
  };

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

  function scoreArticle(article, query) {
    var haystack = normalize(
      [article.title, article.description, article.category, article.topics].join(' '),
    );
    var tokens = query.split(' ').filter(Boolean);
    if (!tokens.length) return 0;
    var score = 0;
    for (var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      if (haystack.indexOf(token) === -1) return 0;
      if (normalize(article.title).indexOf(token) !== -1) score += 3;
      if (normalize(article.category).indexOf(token) !== -1) score += 2;
      score += 1;
    }
    return score;
  }

  function render(matches) {
    results.innerHTML = '';
    if (!matches.length) {
      results.hidden = true;
      if (status) {
        status.textContent = 'No articles matched. Try sleep, ADHD, weight loss, or telehealth.';
        status.hidden = false;
      }
      return;
    }

    var list = document.createElement('ul');
    list.className = 'blog-search-results-list';
    matches.slice(0, 12).forEach(function (article) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      link.href = article.path;
      link.className = 'blog-search-result';
      var title = document.createElement('span');
      title.className = 'blog-search-result__title';
      title.textContent = article.title;
      var meta = document.createElement('span');
      meta.className = 'blog-search-result__meta';
      meta.textContent = article.category || '';
      link.appendChild(title);
      link.appendChild(meta);
      if (article.description) {
        var desc = document.createElement('span');
        desc.className = 'blog-search-result__desc';
        desc.textContent = article.description;
        link.appendChild(desc);
      }
      item.appendChild(link);
      list.appendChild(item);
    });
    results.appendChild(list);
    results.hidden = false;
    if (status) {
      status.textContent = matches.length + ' article' + (matches.length === 1 ? '' : 's') + ' found';
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
    var matches = articles
      .map(function (article) {
        return { article: article, score: scoreArticle(article, query) };
      })
      .filter(function (entry) {
        return entry.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.article.title.localeCompare(b.article.title);
      })
      .map(function (entry) {
        return entry.article;
      });
    render(matches);
  }

  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 120);
  });

  fetch('/article-index.json', { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) throw new Error('index missing');
      return response.json();
    })
    .then(function (data) {
      articles = (data.articles || [])
        .filter(function (entry) {
          return entry.url && entry.url.indexOf('https://siya.health/blog/') === 0 && !hubPaths[entry.url];
        })
        .map(function (entry) {
          var topics = (entry.topics || []).join(', ');
          return {
            title: decodeHtml(entry.title),
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
