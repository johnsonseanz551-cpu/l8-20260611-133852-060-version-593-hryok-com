(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var searchForms = document.querySelectorAll('.js-search-form');
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function resetCarousel() {
    if (timer) {
      window.clearInterval(timer);
    }
    startCarousel();
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      resetCarousel();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      resetCarousel();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      resetCarousel();
    });
  });

  showSlide(0);
  startCarousel();

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter(root, keyword, year, region) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('.js-card'));
    var empty = root.querySelector('.js-empty-state');
    var matched = 0;
    var words = normalize(keyword).split(/\s+/).filter(Boolean);
    var yearValue = normalize(year);
    var regionValue = normalize(region);

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var ok = words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });

      if (yearValue && haystack.indexOf(yearValue) === -1) {
        ok = false;
      }

      if (regionValue && regionValue !== 'all' && haystack.indexOf(regionValue) === -1) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
      if (ok) {
        matched += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', matched === 0);
    }
  }

  var urlParams = new URLSearchParams(window.location.search);
  var initialQuery = urlParams.get('q') || '';
  var searchInput = document.querySelector('.js-site-search-input');
  var yearSelect = document.querySelector('.js-year-filter');
  var regionSelect = document.querySelector('.js-region-filter');
  var searchRoot = document.querySelector('.js-search-root');

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  function refreshSearch() {
    if (!searchRoot) {
      return;
    }
    applyFilter(searchRoot, searchInput ? searchInput.value : '', yearSelect ? yearSelect.value : '', regionSelect ? regionSelect.value : '');
  }

  if (searchRoot) {
    [searchInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', refreshSearch);
        control.addEventListener('change', refreshSearch);
      }
    });
    refreshSearch();
  }

  var localFilter = document.querySelector('.js-local-filter');
  var localRoot = document.querySelector('.js-local-root');

  if (localFilter && localRoot) {
    localFilter.addEventListener('input', function () {
      applyFilter(localRoot, localFilter.value, '', '');
    });
  }

  function attachSource(video, src) {
    if (!video || !src || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = src;
    }

    video.setAttribute('data-ready', '1');
  }

  function startPlayer(wrapper) {
    if (!wrapper) {
      return;
    }

    var video = wrapper.querySelector('video');
    var src = wrapper.getAttribute('data-play');
    var overlay = wrapper.querySelector('.play-overlay');

    attachSource(video, src);

    if (overlay) {
      overlay.classList.add('hidden');
    }

    if (video) {
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }
  }

  document.querySelectorAll('.player-wrap').forEach(function (wrapper) {
    var overlay = wrapper.querySelector('.play-overlay');
    var video = wrapper.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(wrapper);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startPlayer(wrapper);
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }
  });
})();
