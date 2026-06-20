import { H as Hls } from './hls-vendor.js';

export function setupMoviePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var button = document.getElementById('playButton');
  if (!video || !source) {
    return;
  }

  var attached = false;
  var hls = null;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachSource();
    if (button) {
      button.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('hidden');
        }
      });
    }
  }

  attachSource();

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
