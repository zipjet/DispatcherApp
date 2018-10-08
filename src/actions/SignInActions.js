import * as types from "./types";
import * as request from "./../request";
import * as storage from "./../storage";

import { Text, TextInput, View, Alert, Image } from "react-native";

export const sendAutoLoginRequest = () => async dispatch => {

    return request
        .request({
            url: "/account/{account_id}",
            method: "GET"
        })
        .then(
            function (response) {
                if (response.data) {
                    dispatch({ type: types.SIGN_IN_SEND_OTP_SUCCESS, payload: response.data });
                }

                return response;
            }
        )
        .catch(
            function (response) {
                return response;
            }
        );
};

export const sendLoginRequest = (email, password) => async dispatch => {
  dispatch({ type: types.SIGN_IN_SEND_OTP_REQUESTED });

  return request
      .request({
          url: "/login",
          method: "POST",
          data: { email: email, password: password }
      })
      .then(
        function (response) {
          if (!response.data) {
              dispatch({ type: types.SIGN_IN_SEND_OTP_FAILURE });
          } else {
              dispatch({ type: types.SIGN_IN_SEND_OTP_SUCCESS, payload: response.data });
          }

          return response;
        }
      )
      .catch(
        function (response) {
            dispatch({ type: types.SIGN_IN_SEND_OTP_FAILURE });

            return response;
        }
      );
};
