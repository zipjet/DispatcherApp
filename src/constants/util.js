import {Dimensions, Alert} from 'react-native'
import { translate } from '../locale';
import moment       from "moment";
import { WASH_FOLD, DRY_CLEANING } from "./constants";

const { width, height } = Dimensions.get('window');

const baseWidth = 270;
const baseHeight = 480;

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

export const dimensions = {width: width, height: height};
export const fontSize = (size, fixedSize) => Math.ceil(size * scale + (fixedSize === undefined ? 0 : fixedSize));

export const getShift = (timestamp) => {
    let shifts = [0, 13, 24];
    let shiftsLabel = ["", translate("Menu.Morning"), translate("Menu.Evening")];

    let todayMoment = moment().startOf('day');
    let tomorrowMoment = moment().startOf('day').add(1, 'day');
    let plus2daysMoment = moment().startOf('day').add(2, 'day');

    let shift = {dayLabel: "", shiftLabel: "", start: 0, end: 0};

    if (moment(timestamp).startOf('day').unix() < plus2daysMoment.unix()) {
        shift.dayLabel = translate("Menu.Tomorrow");
    }

    if (moment(timestamp).startOf('day').unix() < tomorrowMoment.unix()) {
        shift.dayLabel = translate("Menu.Today");
    }

    if (moment(timestamp).startOf('day').unix() < todayMoment.unix()) {
        shift.dayLabel = "";
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
        let itemizationNotStarted = task.meta.scannedAtHub.length === 0;
        let itemizationCompleted = false;

        if (task.meta.bags.length === task.meta.scannedAtHub.length) {
            if (hasItemizationIssues(task)) {
                itemizationCompleted = false;
            } else {
                itemizationCompleted = true;
            }
        } else {
            itemizationCompleted = false;
        }

        return task.meta.stockedAtHub === true
            && (
                itemizationNotStarted
                || itemizationCompleted
                || task.meta.dispatched === true
            );
    });
}

export const getNewOrders = (tasks) => {
    return tasks.filter((task) => {
        let itemizationNotStarted = task.meta.scannedAtHub.length === 0;
        let itemizationCompleted = false;

        if (task.meta.bags.length === task.meta.scannedAtHub.length) {
            if (hasItemizationIssues(task)) {
                itemizationCompleted = false;
            } else {
                itemizationCompleted = true;
            }
        } else {
            itemizationCompleted = false;
        }

        return task.meta.stockedAtHub === false
            && (
                itemizationNotStarted
                || itemizationCompleted
                || task.meta.dispatched === true
            )
    })
}

export const getNotCompleteOrders = (tasks) => {
    return tasks.filter((task) => {
        let itemizationIsStarted = task.meta.scannedAtHub.length !== 0;
        let itemizationNotCompleted = task.meta.scannedAtHub.length !== task.meta.bags.length;
        let itemizationNotCorrect = false;

        if (task.meta.bags.length === task.meta.scannedAtHub.length) {
            if (hasItemizationIssues(task)) {
                itemizationNotCorrect = true;
            } else {
                itemizationNotCorrect = false;
            }
        } else {
            itemizationNotCorrect = true;
        }

        return task.meta.scannedAtHub.length > 0
            && task.meta.dispatched === false
            && itemizationIsStarted
            && (itemizationNotCompleted || itemizationNotCorrect)
    })
}


export const isTaskDispatched = (task) => {
    return task.meta.dispatched === true;
}

export const getItemizationData = (taskItemization, bagItemization, scannedBags) => {
    let data = [];

    for (let i = 0; i < taskItemization.length; i++) {
        data[taskItemization[i].productReference] = {
            quantity: 0,
            productName: taskItemization[i].name,
            productReference: taskItemization[i].productReference,
            initialExpectedQuantity: taskItemization[i].quantity,
            expectedQuantity: taskItemization[i].quantity,
        }
    }

    for (let i = 0; i < bagItemization.length; i++) {
        if (data[bagItemization[i].productReference] !== undefined) {
            data[bagItemization[i].productReference].quantity = bagItemization[i].quantity;
            data[bagItemization[i].productReference].expectedQuantity += bagItemization[i].quantity;
        }
    }

    for (let j = 0; j < scannedBags.length; j++) {
        let bagItemization = scannedBags[j].dispatcherItemizationItems;

        for (let i = 0; i < bagItemization.length; i++) {
            if (data[bagItemization[i].productReference] !== undefined) {
                data[bagItemization[i].productReference].expectedQuantity -= bagItemization[i].quantity;
            }
        }
    }

    return data;
}

export const isReadyToStock = (task, shift) => {
    let taskMoment = moment(task.cleaningDueDate, 'DD.MM.YYYY HH:mm');
    let shiftTimes = shift.value && shift.value.split('-');

    if (shiftTimes.length !== 2) {
        return true;
    }

    if (parseInt(taskMoment.unix()) < parseInt(shiftTimes[0])) {
        return true;
    }

    if (parseInt(taskMoment.unix()) > parseInt(shiftTimes[1])) {
        return true;
    }

    return false;
}

export const isNotCompleted = (task) => {
    if (task.meta.dispatched) {
        return false;
    }

    if (task.meta.bags.length !== task.meta.scannedAtHub.length) {
        return true;
    }

    return false;
}

export const hasItemizationIssues = (task) => {
    let taskItemization = [];
    let hasMissingItems = false;

    for (let j = 0; j < task.itemization.items.length; j++) {
        let itemizationItem = task.itemization.items[j];

        taskItemization[itemizationItem.name] = itemizationItem.quantity;
    }

    for (let k = 0; k < task.meta.scannedAtHub.length; k++) {
        for (let j = 0; j < task.meta.scannedAtHub[k].dispatcherItemizationItems.length; j++) {
            let itemizationItem = task.meta.scannedAtHub[k].dispatcherItemizationItems[j];

            taskItemization[itemizationItem.productName] -= itemizationItem.quantity;
        }
    }

    Object.keys(taskItemization).map(
        (key) => {
            if (taskItemization[key] !== 0) {
                hasMissingItems = true;
            }
        }
    )

    return hasMissingItems;
}

export const isBagScannedAtHub = (task, barcode) => {
    for (let k = 0; k < task.meta.scannedAtHub.length; k++) {
        if (task.meta.scannedAtHub[k].code === barcode) {
            return true;
        }
    }

    return false;
}

export const getTaskIssues = (task, showBagType) => {
    let issues = [];

    // search for missing bags
    for (let j = 0; j < task.meta.bags.length; j++) {
        let bagFound = false;

        for (let k = 0; k < task.meta.scannedAtHub.length; k++) {
            if (task.meta.bags[j].code === task.meta.scannedAtHub[k].code) {
                bagFound = true;
            }
        }

        if (bagFound === false) {
            if (showBagType === true) {
                issues.push((task.meta.bags[j].type === WASH_FOLD ? "WF" : "DC") + " " + task.meta.bags[j].code);
            } else {
                issues.push('Missing: ' + task.meta.bags[j].code);
            }
        }
    }

    // search for missing items
    let taskItemization = [];

    for (let j = 0; j < task.itemization.items.length; j++) {
        let itemizationItem = task.itemization.items[j];

        taskItemization[itemizationItem.name] = itemizationItem.quantity;
    }

    for (let k = 0; k < task.meta.scannedAtHub.length; k++) {
        for (let j = 0; j < task.meta.scannedAtHub[k].dispatcherItemizationItems.length; j++) {
            let itemizationItem = task.meta.scannedAtHub[k].dispatcherItemizationItems[j];

            taskItemization[itemizationItem.productName] -= itemizationItem.quantity;
        }
    }

    Object.keys(taskItemization).map(
        (key) => {
            if (taskItemization[key] > 0) {
                issues.push('Missing: ' + taskItemization[key] + " " + key);
            }
        }
    )

    return issues;
}

export const getMissingBagsBarcodes = (task) => {
    let scannedBagCodes = task.meta.scannedAtHub.map((bag) => {return bag.code});

    return task.meta.bags
        .filter(
            (bag) => { return scannedBagCodes.indexOf(bag.code) === -1; }
        )
        .map(
            (bag) => { return (bag.type === DRY_CLEANING ? "DC" : "WF") + "  " + bag.code + "\n" }
        )
}