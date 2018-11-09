import * as request from "./../request";
import { Text, TextInput, View, Alert, Image } from "react-native";

export const loadStockTasksRequest = () => async dispatch => {
  return request
      .request({
          url: "/account/{account_id}/task/stock",
          method: "GET",
      })
      .then(
          function (response) {
              return response;
          }
      )
      .catch(
          function (response) {
              return response;
          }
      );
};
