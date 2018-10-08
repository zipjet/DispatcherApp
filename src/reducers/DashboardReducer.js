import {DASHBOARD_MODE, SAVE_TASK, SAVE_TASKS} from "../actions/types";
import { Alert} from 'react-native';

const INITIAL_STATE = { task: {} };

export default function(state = INITIAL_STATE, action) {

  switch (action.type) {
    case SAVE_TASK: {
      return { ...state, task: action.task };
    }

    case SAVE_TASKS: {
      return { ...state, tasks: action.tasks };
    }

    case DASHBOARD_MODE: {
        return { ...state, dashboardMode: action.mode };
    }

    default:
      return state;
  }
}
