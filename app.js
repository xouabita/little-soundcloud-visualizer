import 'babel-polyfill'

import store from './store'
import {play, setPlaying, pause, setUrl} from './actions'

function setupPlayer() {
  var player = document.getElementById('player');
  player.style.zIndex = 10;
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


  setupPlayer();
  var viz = setupViz();
}
