import 'babel-polyfill'

import store from './store'
import {play, setPlaying, pause, setUrl} from './actions'

function updatePlayer() {
  var player = document.getElementById('player');
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


window.onload = function UI() {
  store.dispatch(setUrl('https://soundcloud.com/else-official/else-mirage'));
  updatePlayer();

  var loadUrl = document.getElementById('load-url');
  var url     = document.getElementById('url');
  loadUrl.onclick = function playUrl () {
    store.dispatch(setUrl(url.value));
    url.value = "";
  }
}
