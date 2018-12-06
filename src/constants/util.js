import {Dimensions, Alert} from 'react-native';
import { translate } from '../locale';
import moment       from "moment";
import {WASH_FOLD, DRY_CLEANING, FR_PARIS, DATE_FORMAT} from "./constants";

const { width, height } = Dimensions.get('window');

const baseWidth = 270;
const baseHeight = 480;

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

export const dimensions = {width: width, height: height};
export const fontSize = (size, fixedSize) => Math.ceil(size * scale + (fixedSize === undefined ? 0 : fixedSize));

/**
 * @param {moment} timestamp
 *
 * @returns {Shift}
 */
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
};

/**
 * @param {Array<Fulfillment>} tasks
 *
 * @return {Array<Fulfillment>}
 */
export const getStockOrders = (tasks) => {
    return tasks.filter((task) => {
        let itemizationNotStarted = task.meta.scannedAtHub.length === 0;
        let itemizationCompleted = false;

        if (task.meta.bags.length === task.meta.scannedAtHub.length) {
            itemizationCompleted = hasItemizationIssues(task) === false;
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
};

/**
 * @param {Array<Fulfillment>} tasks
 *
 * @return {Array<Fulfillment>}
 */
export const getNewOrders = (tasks) => {
    return tasks.filter((task) => {
        let itemizationNotStarted = task.meta.scannedAtHub.length === 0;
        let itemizationCompleted = false;

        if (task.meta.bags.length === task.meta.scannedAtHub.length) {
            itemizationCompleted = hasItemizationIssues(task) === false;
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
};

/**
 * @param {Array<Fulfillment>} tasks
 *
 * @return {Array<Fulfillment>}
 */
export const getNotCompleteOrders = (tasks) => {
    return tasks.filter((task) => {
        let itemizationIsStarted = task.meta.scannedAtHub.length !== 0;
        let itemizationNotCompleted = task.meta.scannedAtHub.length !== task.meta.bags.length;
        let itemizationNotCorrect = false;

        if (task.meta.bags.length === task.meta.scannedAtHub.length) {
            itemizationNotCorrect = hasItemizationIssues(task);
        } else {
            itemizationNotCorrect = true;
        }

        return task.meta.scannedAtHub.length > 0
            && task.meta.dispatched === false
            && itemizationIsStarted
            && (itemizationNotCompleted || itemizationNotCorrect)
    })
};

/**
 * @param {Fulfillment} task
 *
 * @returns {boolean}
 */
export const isTaskDispatched = (task) => {
    return task.meta.dispatched === true;
};

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
};

/**
 * @param {Fulfillment} task
 * @param {Shift}       shift
 *
 * @returns {boolean}
 */
export const isReadyToStock = (task, shift) => {
    let taskMoment = moment(task.cleaningDueDate, DATE_FORMAT);
    let shiftTimes = shift.value && shift.value.split('-');

    if (shiftTimes.length !== 2) {
        return true;
    }

    if (parseInt(taskMoment.unix()) < parseInt(shiftTimes[0])) {
        return true;
    }

    return parseInt(taskMoment.unix()) > parseInt(shiftTimes[1]);
};

/**
 * @param {Fulfillment} task
 *
 * @returns {boolean}
 */
export const isNotCompleted = (task) => {
    if (task.meta.dispatched) {
        return false;
    }

    return task.meta.bags.length !== task.meta.scannedAtHub.length;
};

/**
 * @param {Fulfillment} task
 *
 * @returns {boolean}
 */
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
    );

    return hasMissingItems;
};

/**
 * @param {Fulfillment} task
 * @param {boolean}     showBagType
 *
 * @returns {boolean}
 */
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
    );

    return issues;
};

export const getMissingBagsBarcodes = (task) => {
    let scannedBagCodes = task.meta.scannedAtHub.map((bag) => {return bag.code});

    return task.meta.bags
        .filter(
            (bag) => { return scannedBagCodes.indexOf(bag.code) === -1; }
        )
        .map(
            (bag) => { return (bag.type === DRY_CLEANING ? "DC" : "WF") + "  " + bag.code + "\n" }
        )
};

/**
 * @param {Fulfillment} task
 * @param {Shift}       shift
 * @param {Dispatcher}  dispatcher
 *
 * @returns {boolean}
 */
export const isDispatchingForMultipleShifts = (task, shift, dispatcher) => {

    if (shift === null || shift === undefined || shift.value === undefined) {
        return true;
    }

    let shiftTokens = shift.value.split('-');

    if (shiftTokens.length < 2) {
        return false
    }

    if (isReadyToStock(task, shift)) {
        return false;
    }

    if (dispatcher.locationId !== FR_PARIS) {
        return false;
    }

    return parseInt(shiftTokens[1]) - parseInt(shiftTokens[0]) > 3600 * 20;
};