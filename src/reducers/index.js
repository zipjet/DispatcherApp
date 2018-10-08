import { combineReducers } from "redux";

import SignInReducer from "./SignInReducer";
import DashboardReducer from "./DashboardReducer";
import FulfillmentReducer from "./FulfillmentReducer";

export default combineReducers({
  signInDetails: SignInReducer,
  dashboardData: DashboardReducer,
  fulfillmentData: FulfillmentReducer
});
