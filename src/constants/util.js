import {Dimensions, Alert} from 'react-native'
import { translate } from '../locale';
import moment       from "moment";

const { width, height } = Dimensions.get('window');

const baseWidth = 270;
const baseHeight = 480;

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

export const dimensions = {width: width, height: height};

export const fontSize = (size, fixedSize) => Math.ceil(size * scale + (fixedSize === undefined ? 0 : fixedSize));

export const getShift = (timestamp) => {
    let shifts = [0, 15, 24];
    let shiftsLabel = ["", translate("Menu.Morning"), translate("Menu.Evening")];

    let tomorrowMoment = moment().startOf('day').add(1, 'day');
    let plus2daysMoment = moment().startOf('day').add(2, 'day');

    let shift = {dayLabel: "", shiftLabel: "", start: 0, end: 0};

    if (moment(timestamp).startOf('day') < plus2daysMoment) {
        shift.dayLabel = translate("Menu.Tomorrow");
    }

    if (moment(timestamp).startOf('day') < tomorrowMoment) {
        shift.dayLabel = translate("Menu.Today");
    }

    let shiftHour = parseFloat(timestamp.format("H"));
    for (let i = shifts.length - 1; i > 0; i--) {
        if (shiftHour < shifts[i]) {
            shift.start = moment(timestamp).startOf('day').add(shifts[i - 1], 'hours');
            shift.end = moment(timestamp).startOf('day').add(shifts[i], 'hours');
            shift.shiftLabel = shiftsLabel[i];
        }
    }

    return shift;
}

export const getStockOrders = (tasks) => {
    return tasks.filter((task) => {
        return task.meta.dispatched === false
            && task.meta.stockedAtHub === true
            && task.meta.bags.length !== task.meta.scannedAtHub.length;
    });
}

export const getNewOrders = (tasks) => {
    return tasks.filter((task) => {
        return task.meta.dispatched === false
            && task.meta.stockedAtHub === false
            && (task.meta.scannedAtHub.length === 0 || task.meta.bags.length === task.meta.scannedAtHub.length)
    })
}

export const getNotCompleteOrders = (tasks) => {
    return tasks.filter((task) => {
        return task.meta.dispatched === false
            && task.meta.stockedAtHub === false
            && task.meta.scannedAtHub.length > 0
            && task.meta.scannedAtHub.length !== task.meta.bags.length
    })
}


export const isTaskDispatched = (task) => {
    return task.meta.bags.length === task.meta.scannedAtHub.length;
}

export const getItemizationData = (taskItemization, bagItemization) => {
    let data = [];

    for (let i = 0; i < taskItemization.length; i++) {
        data[taskItemization[i].productReference] = {
            quantity: 0,
            productName: taskItemization[i].name,
            productReference: taskItemization[i].productReference
        }
    }

    for (let i = 0; i < bagItemization.length; i++) {
        if (data[bagItemization[i].productReference] !== undefined) {
            data[bagItemization[i].productReference].quantity = bagItemization[i].quantity;
        }
    }

    return data;
}

export const isReadyToDispatch = (task) => {
    if (task.meta.dispatched) {
        return false;
    }

    if (task.meta.bags.length !== task.meta.scannedAtHub.length) {
        return false;
    }

    return true;
}

export const isReadyToStock = (task, shift) => {
    let taskMoment = moment(task.cleaningDueDate, 'DD.MM.YYYY HH:mm').unix();
    let shiftTimes = shift.value && shift.value.split('-');

    if (shiftTimes.length !== 2) {
        return false;
    }

    if (taskMoment < parseInt(shiftTimes[0])) {
        return false;
    }

    if (taskMoment > parseInt(shiftTimes[1])) {
        return false;
    }

    return true;
}

export const isNotCompleted = (task) => {
    if (task.meta.bags.length !== task.meta.scannedAtHub.length) {
        return true;
    }

    return false;
}