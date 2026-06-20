(function () {
  function selectAll(query, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(query));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    var search = document.querySelector(".header-search");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      if (search) {
        search.classList.toggle("is-open");
      }
    });
  }

  function initHero() {
    var slides = selectAll("[data-hero-slide]");
    var dots = selectAll("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function initSearch() {
    var mount = document.querySelector("[data-search-results]");
    if (!mount || !window.movieIndex) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-search-region]");
    var type = document.querySelector("[data-search-type]");
    var year = document.querySelector("[data-search-year]");
    var count = document.querySelector("[data-search-count]");
    var searchButton = document.querySelector("[data-search-button]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function matches(item, query, regionValue, typeValue, yearValue) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.tags].join(" ").toLowerCase();
      if (query && haystack.indexOf(query.toLowerCase()) === -1) {
        return false;
      }
      if (regionValue && item.regionGroup !== regionValue) {
        return false;
      }
      if (typeValue && item.typeGroup !== typeValue) {
        return false;
      }
      if (yearValue && item.year !== yearValue) {
        return false;
      }
      return true;
    }

    function card(item) {
      var tags = [item.regionGroup, item.typeGroup, item.year].filter(Boolean).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"poster\" href=\"" + escapeHtml(item.url) + "\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"poster-badge\">" + escapeHtml(item.year) + "</span></a>" +
        "<div class=\"movie-card-body\"><a class=\"movie-title\" href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a>" +
        "<div class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</div>" +
        "<p>" + escapeHtml(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function render() {
      var query = input ? input.value.trim() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var results = window.movieIndex.filter(function (item) {
        return matches(item, query, regionValue, typeValue, yearValue);
      });
      mount.innerHTML = results.slice(0, 240).map(card).join("");
      if (count) {
        count.textContent = "找到 " + results.length + " 部影片" + (results.length > 240 ? "，当前显示前 240 部" : "");
      }
    }

    [input, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", render);
        node.addEventListener("change", render);
      }
    });

    if (searchButton) {
      searchButton.addEventListener("click", render);
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
