import * as request from "./../request";
import { Text, TextInput, View, Alert, Image } from "react-native";
import { SAVE_TASK, SAVE_TASKS } from "../actions/types";

export const searchBarcodeRequest = (barcode) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/search?barcode=" + barcode,
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
}

export const searchReferenceRequest = (reference) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/" + reference,
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


export const loadTasksRequest = (timespan) => async dispatch => {
    if (!timespan) { return null; }

    let timespanLimits = timespan.split("-");

    if (timespanLimits.length == 2) {
      return request
          .request({
              url: "/account/{account_id}/task/list?full=1&start=" + timespanLimits[0] + '&end=' + timespanLimits[1],
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
    }
};
