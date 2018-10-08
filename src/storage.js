import { AsyncStorage } from "react-native";

const LOGIN_EMAIL        = 'Login:email';
const LOGIN_AUTH_TOKEN   = 'Login:auth_token';
const LOGIN_ID           = 'Login:login_id';
const LOGIN_DISPATCHER   = 'Login:dispatcher';

const FULFILLMENT        = 'Fulfillment';
const SHIFT              = 'Shift';



export const saveEmail = async function (email) {
    saveData(LOGIN_EMAIL, email);
}

export const saveAuthToken = async function (token) {
    saveData(LOGIN_AUTH_TOKEN, token);
}

export const saveLoginId = async function (id) {
    saveData(LOGIN_ID, id);
}

export const saveDispatcher = async function (facility) {
    saveData(LOGIN_DISPATCHER, JSON.stringify(facility));
}

export const saveFulfillment = async function (facility) {
    saveData(FULFILLMENT, JSON.stringify(facility));
}

export const saveShift = async function (shift) {
    saveData(SHIFT, JSON.stringify(shift));
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

export const loadShift = async function () {
    return loadData(SHIFT);
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