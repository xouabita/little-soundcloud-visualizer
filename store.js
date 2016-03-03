import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

const initialState = {
  url: null,
  playing: false,
}

function App(state = initialState, action) {
  switch (action.type) {
    case 'SET_URL':
      return {...state, url: action.url};
    case 'SET_PLAYING':
      return {...state, playing: action.playing};
    default:
      return state
  }
}

export default createStore(
  App,
  applyMiddleware(thunk)
);
