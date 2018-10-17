import * as request from "./../request";
import { Text, TextInput, View, Alert, Image } from "react-native";
import { SAVE_TASK, SAVE_TASKS } from "../actions/types";

export const stockRequest = (reference) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/stock",
            method: "POST",
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

export const dispatchRequest = (reference) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/dispatch",
            method: "POST",
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