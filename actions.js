const clientId = "ed71764c7b01828286e701366fa84cd1"
import SC from 'soundcloud'

function setPlaying(playing) {
  return {
    type: 'SET_PLAYING',
    playing
  }
}

export function setUrl(url) {
  return async (dispatch, getState) => {
    SC.initialize({ client_id: clientId });
    try {
      var sound = await SC.get('/resolve', {url});
    } catch (e) {
      return;
    }
    dispatch({
      type: 'SET_URL',
      url: sound.stream_url + `?client_id=${clientId}`
    });
    dispatch(play());
  }
}

export function play() {
  return setPlaying(true);
}

export function pause() {
  return setPlaying(false);
}
