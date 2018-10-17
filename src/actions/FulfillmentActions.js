import * as types from "./types";
import * as request from "./../request";
import { Text, TextInput, View, Alert, Image } from "react-native";

export const sendItemization = (itemizationData, barcode, comment) => async dispatch => {
    let reducedItemizationData = {};

    for (let i = 0; i < itemizationData.length; i++) {
        if (itemizationData[i].quantity > 0) {
            reducedItemizationData[itemizationData[i].productReference] = {
                quantity: itemizationData[i].quantity,
                productName: itemizationData[i].productName
            };
        }
    }

    let postData = {
        itemization: reducedItemizationData,
        barcode: barcode,
        comment: comment,
    };

    return request
        .request({
            url: "/account/{account_id}/task/{task_id}/barcode/{barcode}/itemization",
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