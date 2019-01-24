import * as request from "./../request";
import { Text, TextInput, View, Alert, Image } from "react-native";
import { SAVE_TASK, SAVE_TASKS } from "../actions/types";

export const stockRequest = (reference, shiftValue, rack) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/stock",
            method: "POST",
            data: {shift: shiftValue, rack: rack}
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

export const dispatchRequest = (reference, shiftValue, rack) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/dispatch",
            method: "POST",
            data: {shift: shiftValue, rack: rack}
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

export const dispatchBulkRequest = (references) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/dispatch",
            method: "POST",
            data: {tasks: references}
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