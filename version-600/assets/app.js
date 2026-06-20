(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function setHero(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                setHero(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setHero(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setHero(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        restart();
    }

    var panel = document.querySelector('[data-search-panel]');
    var grid = document.querySelector('[data-search-grid]');

    if (panel && grid) {
        var input = document.getElementById('searchInput');
        var typeFilter = document.getElementById('typeFilter');
        var yearFilter = document.getElementById('yearFilter');
        var regionFilter = document.getElementById('regionFilter');
        var empty = document.querySelector('[data-empty-result]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (input) {
            input.value = initial;
        }

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
        }

        function filterCards() {
            var keyword = valueOf(input);
            var typeValue = valueOf(typeFilter);
            var yearValue = valueOf(yearFilter);
            var regionValue = valueOf(regionFilter);
            var visible = 0;

            cards.forEach(function (card) {
                var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
                var matchesType = !typeValue || (card.getAttribute('data-type') || '').toLowerCase() === typeValue;
                var matchesYear = !yearValue || (card.getAttribute('data-year') || '').toLowerCase() === yearValue;
                var matchesRegion = !regionValue || (card.getAttribute('data-region') || '').toLowerCase() === regionValue;
                var show = matchesKeyword && matchesType && matchesYear && matchesRegion;

                card.hidden = !show;

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, typeFilter, yearFilter, regionFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', filterCards);
                element.addEventListener('change', filterCards);
            }
        });

        filterCards();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-widget'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var url = player.getAttribute('data-video');
        var hls = null;
        var ready = false;

        function beginPlay() {
            if (!video || !url) {
                return;
            }

            player.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            if (!ready) {
                ready = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = url;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', beginPlay);
        }

        if (video) {
            video.addEventListener('click', beginPlay);
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
