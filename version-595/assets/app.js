(function () {
  function toggleMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var keyword = scope.querySelector('[data-filter-keyword]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      if (!keyword || !year || !type || !cards.length) {
        return;
      }

      var years = [];
      var types = [];
      cards.forEach(function (card) {
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        if (cardYear && years.indexOf(cardYear) === -1) {
          years.push(cardYear);
        }
        if (cardType && types.indexOf(cardType) === -1) {
          types.push(cardType);
        }
      });
      years.sort().reverse();
      types.sort();

      years.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });

      types.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        type.appendChild(option);
      });

      function apply() {
        var query = keyword.value.trim().toLowerCase();
        var yearValue = year.value;
        var typeValue = type.value;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matched = (!query || text.indexOf(query) !== -1) &&
            (!yearValue || card.getAttribute('data-year') === yearValue) &&
            (!typeValue || card.getAttribute('data-type') === typeValue);
          card.style.display = matched ? '' : 'none';
        });
      }

      keyword.addEventListener('input', apply);
      year.addEventListener('change', apply);
      type.addEventListener('change', apply);
    });
  }

  function setupSearchPage() {
    var container = document.getElementById('searchResults');
    if (!container || !window.MOVIES_INDEX) {
      return;
    }
    var title = document.getElementById('searchTitle');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('.big-search input[name="q"]');
    if (input) {
      input.value = query;
    }

    function card(movie) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + movie.file + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta-line">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</div>' +
        '<h2><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h2>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="pill-row"><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    var results = window.MOVIES_INDEX;
    if (query) {
      var lower = query.toLowerCase();
      results = results.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(lower) !== -1;
      });
      if (title) {
        title.textContent = '“' + query + '”相关影片';
      }
    }

    container.innerHTML = results.slice(0, 120).map(card).join('') || '<div class="empty-result">没有找到相关影片</div>';
  }

  toggleMenu();
  setupHero();
  setupFilters();
  setupSearchPage();
}());
