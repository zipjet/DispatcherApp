import * as types from "./types";
import * as request from "./../request";
import { Text, TextInput, View, Alert, Image } from "react-native";

export const sendFacilityComment = (comment) => async dispatch => {
    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/comments",
            method: "POST",
            data: {comment: comment}
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

export const sendItemization = (itemizationData, additionalData) => async dispatch => {
    let reducedItemizationData = {};

    for (let i = 0; i < itemizationData.length; i++) {
        if (itemizationData[i].quantity > 0) {
            reducedItemizationData[itemizationData[i].reference] = itemizationData[i].quantity;
        }
    }

    let postData = {itemization: reducedItemizationData};
    if (additionalData !== undefined) {
        postData['additionalData'] = additionalData;
    }

    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/itemization",
            method: "POST",
            data: postData
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

export const sendItemizationAndSetStateToCleaning = (itemizationData, additionalData) => async dispatch => {
    let reducedItemizationData = {};

    for (let i = 0; i < itemizationData.length; i++) {
        if (itemizationData[i].quantity > 0) {
            reducedItemizationData[itemizationData[i].reference] = itemizationData[i].quantity;
        }
    }

    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/itemization",
            method: "POST",
            data: {itemization: reducedItemizationData, additionalData: {finishItemization: true}}
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