import { AsyncStorage, Alert } from "react-native";

const LOGIN_EMAIL        = 'Login:email';
const LOGIN_AUTH_TOKEN   = 'Login:auth_token';
const LOGIN_ID           = 'Login:login_id';
const LOGIN_DISPATCHER   = 'Login:dispatcher';

const FULFILLMENT        = 'Fulfillment';
const SHIFT              = 'Shift';

const TASKS              = 'Tasks';
const BARCODE            = 'Barcode';


export const saveEmail = async function (email) {
    saveData(LOGIN_EMAIL, email);
}

export const saveAuthToken = async function (token) {
    saveData(LOGIN_AUTH_TOKEN, token);
}

export const saveLoginId = async function (id) {
    saveData(LOGIN_ID, id);
}

export const saveDispatcher = async function (dispatcher) {
    saveData(LOGIN_DISPATCHER, JSON.stringify(dispatcher));
}

export const saveBarcode = async function (barcode) {
    saveData(BARCODE, barcode);
}

export const saveFulfillment = async function (facility) {
    saveData(FULFILLMENT, JSON.stringify(facility));
}

export const saveShift = async function (shift) {
    saveData(SHIFT, JSON.stringify(shift));
}

export const saveTasks = async function (tasks) {
    saveData(TASKS, JSON.stringify(tasks));
}




export const loadEmail = async function () {
    return loadData(LOGIN_EMAIL);
}

export const loadAuthToken = async function () {
    return loadData(LOGIN_AUTH_TOKEN);
}

export const loadLoginId = async function () {
    return loadData(LOGIN_ID);
}

export const loadDispatcher = async function () {
    return loadData(LOGIN_DISPATCHER);
}

export const loadFulfillment = async function () {
    return loadData(FULFILLMENT);
}

export const loadBarcode = async function () {
    return loadData(BARCODE);
}

export const loadShift = async function () {
    return loadData(SHIFT);
}

export const loadTasks = async function () {
    return loadData(TASKS);
}







saveData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
    }
}

loadData = async (key) => {
    try {
        var value = await AsyncStorage.getItem(key);

        if (value !== null) return value;
    } catch (error) {
    }

    return null;
}