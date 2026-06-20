(function () {
  window.initializePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var cover = document.getElementById('playerCover');
    var hls = null;
    var loaded = false;

    if (!video) {
      return;
    }

    function loadAndPlay() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
        }
      }
      video.play().catch(function () {});
    }

    function start() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      loadAndPlay();
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
}());
