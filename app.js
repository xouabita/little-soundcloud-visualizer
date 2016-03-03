import 'babel-polyfill'

import store from './store'
import {play, setPlaying, pause, setUrl} from './actions'

var AudioContext = window.AudioContext || window.webkitAudioContext

function setupPlayer() {
  var player = document.getElementById('player');
  player.style.zIndex = 10;
  player.crossOrigin = 'anonymous';
  let oldUrl = null;

  // Update the view from store
  store.subscribe(() => {
    var {url, playing} = store.getState();

    if (oldUrl !== url) {
      player.src   = url;
      oldUrl = url;
    }

    if (player.paused && playing) {
      player.play();
    }

    if (!player.paused && !playing) {
      player.pause();
    }
  });


  // Update the store from the player
  player.onpause = () => store.dispatch(pause());
  player.onplay  = () => store.dispatch(play());

  return player;
}

function setupViz() {
  var viz = document.getElementById('viz');
  viz.style.position = 'fixed';
  viz.style.top = 0;
  viz.style.left = 0;

  function resizeViz() {
    viz.height = window.innerHeight;
    viz.width = window.innerWidth;
  }

  window.addEventListener('resize', resizeViz, false);
  resizeViz();

  return viz;
}


window.onload = function UI() {
  store.dispatch(setUrl('https://soundcloud.com/else-official/else-mirage'));

  var loadUrl = document.getElementById('load-url');
  var url     = document.getElementById('url');
  loadUrl.onclick = function playUrl () {
    store.dispatch(setUrl(url.value));
    url.value = "";
  }

  var MAX = 0;

  var player = setupPlayer();
  var viz    = setupViz();

  var canvasCtx = viz.getContext('2d');
  var audioCtx  = new AudioContext();

  // Set up audio
  var analyser  = audioCtx.createAnalyser();
  var source    = audioCtx.createMediaElementSource(player);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  function loop() {
    var fbc_array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(fbc_array);
    canvasCtx.clearRect(0, 0, viz.width, viz.height);
    canvasCtx.fillStyle = 'rgb(255, 255, 255)';

    var barWidth = 15;
    var barCount = viz.width / barWidth;
    for (var i = 0; i < barCount; i++) {
      var x = barWidth * i;
      var height = - (viz.height * fbc_array[(i + 10) * 2] / 300);

      canvasCtx.fillRect(x, viz.height, barWidth, height);
    }
    requestAnimationFrame(loop);
  }

  loop();
}
