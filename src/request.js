import * as GLOBALVARIABLES from './constants/global';
import axios from 'axios';
import * as storage from './storage';
import { Alert } from "react-native";
import I18n from 'react-native-i18n';
import packageJson from '../package.json';

const client = axios.create({
    baseURL: GLOBALVARIABLES.Constants.API_BASE_URL,
    timeout: 20000,
    headers: {
        'X-Api-Key': GLOBALVARIABLES.Constants.API_KEY,
        'X-Auth-Token': "",
        'X-version': "",
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

    return Promise.all([storage.loadLoginId(), storage.loadFulfillment(), storage.loadAuthToken(), I18n.currentLocale(), storage.loadBarcode(), storage.loadShift()])
        .then(function (values) {
            if (typeof options.headers === 'undefined') options.headers = {};

            let task = { reference: "" };
            try { task = JSON.parse(values[1]); } catch (e) {}

            let shift = {value: ""};
            try { shift = JSON.parse(values[5]); } catch (e) {}

            // ID injection part
            if (values[0] !== null) {
                options.url = options.url.replace('{account_id}', values[0]);
            }

            if (task && task.reference) {
                options.url = options.url.replace('{task_id}',    task.reference);
            }

            if (values[4]) {
                options.url = options.url.replace('{barcode}',    values[4]);
            }

            // auth token injection part
            if (values[2] !== null) {
                options.headers['X-Auth-Token'] = values[2];
            }

            if (shift && shift.value) {
                let shiftEnds = shift.value.split('-');

                if (shiftEnds.length === 2) {
                    options.url = options.url.replace('{shift_start}', shiftEnds[0]);
                    options.url = options.url.replace('{shift_end}',   shiftEnds[1]);
                }
            }

            // LANG injection part
            options.headers['X-language'] = values[3];
            options.headers['X-version'] = packageJson.version;

            // inject the baseURL like this now
            options.baseURL = GLOBALVARIABLES.Constants.getApiBaseUrl();

            return client(options)
                .then(onSuccess)
                .catch(onError);
        })
        .catch(onError);
}