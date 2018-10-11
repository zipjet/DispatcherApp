import {Dimensions} from 'react-native'
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
    return tasks.filter((task) => { return task.meta.skockedAtHub === true });
}

export const getNewOrders = (tasks) => {
    return tasks.filter((task) => {
        return task.meta.skockedAtHub === false
            && (task.meta.scannedAtHub.length === 0 || task.meta.bags.length === task.meta.scannedAtHub.length)
    )
}

export const isTaskDispatched = (task) => {
    return task.meta.bags.length === task.meta.scannedAtHub.length;
}