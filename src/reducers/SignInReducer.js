import { SIGN_IN_SEND_OTP_SUCCESS, SIGN_IN_VALIDATE_OTP_SUCCESS, SAVE_PRODUCTS } from "../actions/types";

const INITIAL_STATE = {
    authToken: "",
    products: []
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
      case SIGN_IN_SEND_OTP_SUCCESS: {
          return { ...state, authToken: action.payload.authToken, user: action.payload.user };
      }

      case SAVE_PRODUCTS: {
          return { ...state, products: action.payload  };
      }

    default:
      return state;
  }
}