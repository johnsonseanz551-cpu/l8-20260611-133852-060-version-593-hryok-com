(function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer) {
      clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      startHeroTimer();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showHero(heroIndex - 1);
      startHeroTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showHero(heroIndex + 1);
      startHeroTimer();
    });
  }

  startHeroTimer();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".js-search"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var activeFilter = "";

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function applyFilters(root) {
    var scope = root || document;
    var input = scope.querySelector(".js-search") || document.querySelector(".js-search");
    var query = normalize(input ? input.value : "");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-movie-card"));

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-filter-text"));
      var type = normalize(card.getAttribute("data-type"));
      var matchesText = !query || text.indexOf(query) !== -1;
      var matchesFilter = !activeFilter || text.indexOf(activeFilter) !== -1 || type.indexOf(activeFilter) !== -1;
      card.classList.toggle("is-hidden", !(matchesText && matchesFilter));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilters(document);
    });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      button.classList.add("active");
      activeFilter = normalize(button.getAttribute("data-filter-value"));
      applyFilters(document);
    });
  });

  var player = document.querySelector("[data-player]");

  if (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var stream = player.getAttribute("data-stream");
    var hlsInstance = null;
    var prepared = false;

    function prepareVideo() {
      if (!video || !stream || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      prepareVideo();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.setAttribute("controls", "controls");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.setAttribute("controls", "controls");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
