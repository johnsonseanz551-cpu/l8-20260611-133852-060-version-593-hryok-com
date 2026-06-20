const ready = (fn) => {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

const escapeHtml = (value) => String(value || "").replace(/[&<>"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;"
})[char]);

const initMenu = () => {
  const header = document.querySelector(".site-header");
  const button = document.querySelector("[data-menu-button]");
  if (!header || !button) {
    return;
  }
  button.addEventListener("click", () => {
    header.classList.toggle("is-open");
  });
};

const initHero = () => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length <= 1) {
    return;
  }
  let current = 0;
  let timer = null;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };
  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5200);
  };
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      start();
    });
  });
  hero.addEventListener("mouseenter", () => window.clearInterval(timer));
  hero.addEventListener("mouseleave", start);
  start();
};

const initFilters = () => {
  document.querySelectorAll("[data-filter-wrap]").forEach((wrap) => {
    const textInput = wrap.querySelector("[data-filter-text]");
    const yearSelect = wrap.querySelector("[data-filter-year]");
    const typeSelect = wrap.querySelector("[data-filter-type]");
    const cards = Array.from(wrap.querySelectorAll(".movie-card"));
    const apply = () => {
      const keyword = (textInput?.value || "").trim().toLowerCase();
      const year = yearSelect?.value || "";
      const type = typeSelect?.value || "";
      cards.forEach((card) => {
        const indexText = (card.dataset.index || "").toLowerCase();
        const yearText = card.dataset.year || "";
        const typeText = card.dataset.type || "";
        const matchedKeyword = !keyword || indexText.includes(keyword);
        const matchedYear = !year || yearText === year;
        const matchedType = !type || typeText === type;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear && matchedType));
      });
    };
    textInput?.addEventListener("input", apply);
    yearSelect?.addEventListener("change", apply);
    typeSelect?.addEventListener("change", apply);
  });
};

let hlsLoader = null;

const getHls = () => {
  if (!hlsLoader) {
    hlsLoader = import("./hls-dru42stk.js").then((module) => module.H);
  }
  return hlsLoader;
};

const initPlayers = () => {
  document.querySelectorAll(".player-shell").forEach((shell) => {
    const video = shell.querySelector("video");
    const button = shell.querySelector(".player-overlay");
    const stream = shell.dataset.stream;
    if (!video || !stream) {
      return;
    }
    let bound = false;
    let starting = false;
    const requestPlay = () => {
      shell.classList.add("is-playing");
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          shell.classList.remove("is-playing");
        });
      }
    };
    const bindNative = () => {
      video.src = stream;
      video.addEventListener("loadedmetadata", requestPlay, { once: true });
      video.load();
    };
    const bindHls = async () => {
      const Hls = await getHls();
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, requestPlay);
        shell.hls = hls;
      } else {
        bindNative();
      }
    };
    const start = async () => {
      if (starting) {
        return;
      }
      starting = true;
      if (!bound) {
        bound = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          bindNative();
        } else {
          await bindHls();
        }
      } else {
        requestPlay();
      }
      starting = false;
    };
    button?.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", () => shell.classList.add("is-playing"));
    video.addEventListener("ended", () => shell.classList.remove("is-playing"));
  });
};

const resultCard = (item) => `
<article class="movie-card">
  <a class="poster-wrap" href="${escapeHtml(item.url)}">
    <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}封面" loading="lazy">
    <span class="year-badge">${escapeHtml(item.year)}</span>
    <span class="play-badge">▶</span>
  </a>
  <div class="card-body">
    <a class="card-title" href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a>
    <p class="card-line">${escapeHtml(item.line)}</p>
    <div class="card-meta">
      <span>${escapeHtml(item.region)}</span>
      <span>${escapeHtml(item.type)}</span>
    </div>
    <div class="tag-row">
      ${(item.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  </div>
</article>`;

const initSearchPage = () => {
  const results = document.getElementById("searchResults");
  const input = document.querySelector("[data-search-input-main]");
  if (!results || !window.SEARCH_DATA) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  if (input) {
    input.value = query;
  }
  if (!query) {
    return;
  }
  const normalized = query.toLowerCase();
  const matched = window.SEARCH_DATA.filter((item) => {
    return String(item.index || "").toLowerCase().includes(normalized);
  }).slice(0, 120);
  if (!matched.length) {
    results.innerHTML = '<p class="empty-state">没有找到匹配影片</p>';
    return;
  }
  results.innerHTML = matched.map(resultCard).join("");
};

ready(() => {
  initMenu();
  initHero();
  initFilters();
  initPlayers();
  initSearchPage();
});
