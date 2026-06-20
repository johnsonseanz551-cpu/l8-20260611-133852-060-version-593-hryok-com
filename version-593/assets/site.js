(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var index = Number(thumb.getAttribute('data-hero-thumb'));
                showSlide(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterPanel && filterList) {
        var keywordInput = filterPanel.querySelector('[data-list-search]');
        var categorySelect = filterPanel.querySelector('[data-category-filter]');
        var yearSelect = filterPanel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region')
                ].join(' ').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (category && cardCategory !== category) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                card.classList.toggle('is-filtered-out', !matched);
            });
        }

        [keywordInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage && window.SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = searchPage.querySelector('[data-search-input]');
        var results = searchPage.querySelector('[data-search-results]');
        var note = searchPage.querySelector('[data-search-note]');

        if (input) {
            input.value = query;
        }

        function makeCard(movie) {
            return [
                '<article class="movie-card movie-card-standard">',
                '<a href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '<div class="poster-box">',
                '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<div class="poster-glow"></div>',
                '<div class="poster-meta"><span>' + escapeHtml(movie.score) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
                '</div>',
                '<div class="card-content">',
                '<div class="card-tags"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<h3>' + escapeHtml(movie.title) + '</h3>',
                '<p>' + escapeHtml(movie.one_line) + '</p>',
                '<div class="card-foot"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderSearch(value) {
            var keyword = String(value || '').trim().toLowerCase();
            var pool = window.SEARCH_INDEX;
            var matched = keyword
                ? pool.filter(function (movie) {
                    return [
                        movie.title,
                        movie.one_line,
                        movie.year,
                        movie.genre,
                        movie.region,
                        movie.type,
                        movie.category,
                        movie.tags
                    ].join(' ').toLowerCase().indexOf(keyword) !== -1;
                })
                : pool.slice(0, 60);

            results.innerHTML = matched.slice(0, 120).map(makeCard).join('');

            if (note) {
                note.textContent = keyword && matched.length === 0
                    ? '没有找到匹配内容，可以尝试更换关键词。'
                    : keyword
                        ? '搜索结果已更新。'
                        : '热门内容已为你展示，也可以输入关键词继续查找。';
            }
        }

        renderSearch(query);

        if (input) {
            input.addEventListener('input', function () {
                renderSearch(input.value);
            });
        }
    }

    var playerStage = document.querySelector('.player-stage');

    if (playerStage) {
        var video = playerStage.querySelector('.player-video');
        var trigger = playerStage.querySelector('.play-trigger');
        var message = playerStage.querySelector('.player-message');
        var streamUrl = playerStage.getAttribute('data-stream');
        var hlsInstance = null;
        var started = false;

        function setMessage(value) {
            if (message) {
                message.textContent = value || '';
            }
        }

        function hideTrigger() {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        }

        function startPlayback() {
            if (!video || !streamUrl) {
                setMessage('播放暂时不可用，请稍后再试。');
                return;
            }

            if (started) {
                video.play().catch(function () {});
                hideTrigger();
                return;
            }

            started = true;
            setMessage('正在加载视频');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                    setMessage('');
                }, { once: true });
                hideTrigger();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                    setMessage('');
                    hideTrigger();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        setMessage('视频加载失败，请稍后再试。');
                    }
                });
                return;
            }

            setMessage('播放暂时不可用，请稍后再试。');
        }

        if (trigger) {
            trigger.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
