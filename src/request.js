import * as GLOBALVARIABLES from './constants/global';
import axios from 'axios';
import * as storage from './storage';
import { Alert } from "react-native";
import I18n from 'react-native-i18n';
import store from './store';

const client = axios.create({
    baseURL: GLOBALVARIABLES.API_BASE_URL,
    timeout: 20000,
    headers: {
        'X-Api-Key': GLOBALVARIABLES.API_KEY,
        'X-Auth-Token': ""
    }
});

/**
 * Request Wrapper with default success/error actions
 */
export const request = function(options) {
    const onSuccess = function(response) {
        return response.data;
    }

    const onError = function(error) {

        // Alert.alert(error.message);

        if (error.response) {
            // Request was made but server responded with something
            // other than 2xx
            // console.error('Status:',  error.response.status);
            // console.error('Data:',    error.response.data);
            // console.error('Headers:', error.response.headers);

        } else {
            // Something else happened while setting up the request
            // triggered the error
            // console.error('Error Message:', error.message);
        }

        return Promise.reject(error.response || error.message);
    }

    return Promise.all([storage.loadLoginId(), storage.loadFulfillment(), storage.loadAuthToken(), I18n.currentLocale()])
        .then(function (values) {
            if (typeof options.headers === 'undefined') options.headers = {};

            let task = { reference: "" };
            try {
                task = JSON.parse(values[1]);
            } catch (e) {
                task = { reference: "" };
            }

            // ID injection part
            if (values[0] !== null) {
                options.url = options.url.replace('{account_id}', values[0]);
            }

            if (task && task.reference) {
                options.url = options.url.replace('{task_id}',    task.reference);
            }

            // auth token injection part
            if (values[2] !== null) {
                options.headers['X-Auth-Token'] = values[2];
            }

            // LANG injection part
            options.headers['X-language'] = values[3];

            return client(options)
                .then(onSuccess)
                .catch(onError);
        })
        .catch(onError);
}