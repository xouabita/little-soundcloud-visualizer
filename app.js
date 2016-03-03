import 'babel-polyfill'
import 'soundcloud'

import store from './store'
import {play, setPlaying, pause, setUrl} from './actions'

// Fix soundcloud on Firefox
if (navigator.userAgent.indexOf("Firefox") != -1) {
  var script = document.createElement('script');
  script.src = 'https://connect.soundcloud.com/sdk/sdk-3.0.0.js';
  document.body.appendChild(script);
}

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

    var barWidth = 20;
    var barCount = viz.width / barWidth;

    function getPoints(i) {
      var x = barWidth * i;
      var y = viz.height - viz.height * fbc_array[(i + barWidth) * 2] / 300;
      return [x, y];
    }

    var [x0, y0] = getPoints(0);
    canvasCtx.beginPath();
    canvasCtx.moveTo(x0, y0);

    // Style
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, .5)';
    canvasCtx.fillStyle = 'rgba(255, 255, 255, .2)';

    // Draw the bezier curve
    for (var i = 1; i < barCount + 2; i++) {
      var [x, y]         = getPoints(i);
      var [nextX, nextY] = getPoints(i + 1);

      var xc = (x + nextX) / 2;
      var yc = (y + nextY) / 2;

      canvasCtx.quadraticCurveTo(x, y, xc, yc);
    }
    canvasCtx.lineTo(viz.width, viz.height);
    canvasCtx.lineTo(0, viz.height);
    canvasCtx.stroke();
    canvasCtx.fill();
    requestAnimationFrame(loop);
  }

  loop();
}
