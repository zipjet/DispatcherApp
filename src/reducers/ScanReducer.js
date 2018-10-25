import {SAVE_HOMEPAGE} from "../actions/types";
import { Alert } from 'react-native';

const INITIAL_STATE = { task: {} };

export default function(state = INITIAL_STATE, action) {

  switch (action.type) {
    case SAVE_HOMEPAGE: {
      return { ...state, page: action.page };
    }

    default:
      return state;
  }
}
