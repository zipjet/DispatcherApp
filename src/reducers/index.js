import { combineReducers } from "redux";

import SignInReducer from "./SignInReducer";
import DashboardReducer from "./DashboardReducer";
import FulfillmentReducer from "./FulfillmentReducer";
import ScanReducer from "./ScanReducer";

export default combineReducers({
  signInDetails: SignInReducer,
  dashboardData: DashboardReducer,
  fulfillmentData: FulfillmentReducer,
  scanData: ScanReducer
});
