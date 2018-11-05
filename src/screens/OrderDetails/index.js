import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow, divider } from "./../../constants/base-style.js";
import { SUBMIT, HEADER, NO_INTERNET_BAR, NO_INTERNET_MESSAGE, BAG, BAG_SHADOW } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import moment from 'moment';
import Button from "./../../components/Button";
import Menu from "./../../components/Menu";
import {fontSize, getShift, hasItemizationIssues, isBagScannedAtHub, isTaskDispatched, isNotCompleted} from '../../constants/util';
import { WASH_FOLD, DRY_CLEANING } from "./../../constants/constants";
import * as storage from '../../storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const WASH_FOLD_ALIAS    = "1";
const DRY_CLEANING_ALIAS = "2";

class OrderDetails extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            task: null,
            spinner: false,
            shift: null,
            bagsSummary: [],
            showConfirmation: false
        };

        Promise
            .all([storage.loadFulfillment()])
            .then(values => {
                let task = JSON.parse(values[0]);
                let bagsSummary = {};

                this.setState(
                    {
                        task: task,
                        shift: getShift(moment(task.cleaningDueDate, 'DD.MM.YYYY HH:mm'))
                    }
                );

                let bags = task.meta.bags.sort((bag1, bag2) => { return bag1.type === DRY_CLEANING });

                for (let i = 0; i < bags.length; i++) {
                    let bag = bags[i];
                    let bagTypeKeys = (bag.type === DRY_CLEANING) ? DRY_CLEANING_ALIAS : WASH_FOLD_ALIAS;

                    if (bagsSummary.hasOwnProperty(bagTypeKeys) === false) {
                        bagsSummary[bagTypeKeys] = {category: bag.type, bags: [], itemization: []};
                    }

                    bagsSummary[bagTypeKeys].bags[bag.code] = {code: bag.code, dispatcherComments: [], scannedAtHub: false};
                }

                for (let i = 0; i < task.meta.scannedAtHub.length; i++) {
                    let bag = task.meta.scannedAtHub[i];
                    let bagTypeKeys = (bag.type === DRY_CLEANING) ? DRY_CLEANING_ALIAS : WASH_FOLD_ALIAS;

                    if (bagsSummary.hasOwnProperty(bagTypeKeys)) {
                        if (bagsSummary[bagTypeKeys].bags.hasOwnProperty(bag.code)) {
                            bagsSummary[bagTypeKeys].bags[bag.code].scannedAtHub = true;
                            bagsSummary[bagTypeKeys].bags[bag.code].dispatcherComments = bag.dispatcherComments;
                        }
                    }
                }

                if (bagsSummary[DRY_CLEANING_ALIAS] !== undefined) {
                    bagsSummary[DRY_CLEANING_ALIAS].itemization = task.itemization ? task.itemization.items : [];
                }

                this.setState({bagsSummary: bagsSummary})
            })
    }

    getDispatcherItemizationCount = (productReference, task) => {
        let count = 0;

        for (let i = 0; i < task.meta.scannedAtHub.length; i++) {
            for (let j = 0; j < task.meta.scannedAtHub[i].dispatcherItemizationItems.length; j++) {
                if (task.meta.scannedAtHub[i].dispatcherItemizationItems[j].productReference === productReference) {
                    count += task.meta.scannedAtHub[i].dispatcherItemizationItems[j].quantity;
                }
            }
        }

        return count;
    }

    _itemizationEdit = (barcode) => {
        storage.saveBarcode(barcode);

        this.props.navigation.push("OrderBagItemization");
    }

    renderBagsSummary = (bagsSummary) => {
        let index = 1;

        return Object.values(this.state.bagsSummary).map((bagsData) => {
            return <View style={BAG} key={bagsData.category}>
                        <Text style={{ color: colors.dark, fontSize: fontSize(8) }}>Bag {index++}</Text>
                            { Object.values(bagsData.bags).map(
                                (bag, categoryIndex) => {
                                    return  <View key={index} style={{ color: colors.blueGrey, flexDirection: 'column' }}>
                                                {categoryIndex > 0 && <View style={divider}></View>}
                                                {categoryIndex > 0 && <Text style={{ color: colors.dark, fontSize: fontSize(8) }}>Bag {index++}</Text>}

                                                <TouchableHighlight onPress={() => { this._itemizationEdit(bag.code) }} underlayColor="white">
                                                    <View style={{ color: colors.blueGrey, justifyContent: 'space-between', flexDirection: 'row' }}>
                                                        <Text style={{fontSize: fontSize(18)}}>{bagsData.category === WASH_FOLD ? "WF" : "DC"} {bag.code}</Text>
                                                        { bag.scannedAtHub && <Icon name='check-circle' size={fontSize(18)} color={colors.teal} /> }
                                                    </View>
                                                </TouchableHighlight>

                                                {bag.dispatcherComments && bag.dispatcherComments.map(
                                                    (comment, index) => {
                                                        return  <Text key={bag.code + "comment" + index} style={{fontSize: fontSize(8)}}>{comment}</Text>
                                                    }
                                                )}
                                            </View>
                                }
                            )}

                            { bagsData.category !== WASH_FOLD &&
                                <View>
                                    <View style={divider}/>

                                    { bagsData.itemization.map(
                                        (itemizationItem) => {
                                            let dispatcherItemizationCount = this.getDispatcherItemizationCount(itemizationItem.productReference, this.state.task);

                                            return  <View key={itemizationItem.reference} style={{ paddingTop: 5, paddingBottom: 5, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={{ width: '60%'}}>
                                                            {itemizationItem.quantity} X {itemizationItem.name}
                                                        </Text>

                                                        { dispatcherItemizationCount !== itemizationItem.quantity && dispatcherItemizationCount > 0 &&
                                                            <Text style={{color: colors.errorColor}}>Found {dispatcherItemizationCount}</Text>
                                                        }

                                                        { dispatcherItemizationCount !== itemizationItem.quantity && dispatcherItemizationCount > 0 &&
                                                            <Icon size={fontSize(12)} name="times-circle" color={colors.errorColor} />
                                                        }

                                                        { dispatcherItemizationCount === itemizationItem.quantity &&
                                                            <Icon size={fontSize(12)} name="check-circle" color={colors.teal} />
                                                        }
                                                    </View>
                                        }
                                    )}
                                </View>
                            }
                    </View>
        })
    }

    getShiftColor = (dayLabel, shiftLabel) => {
        if (shiftLabel === translate("Menu.Morning")) {
            return colors.teal;
        }

        if (shiftLabel === translate("Menu.Evening")) {
            return colors.blue;
        }

        return colors.green;
    }

    dispatch = () => {
        this.props
            .dispatchRequest(this.state.task.reference)
            .then((response) => {
                let task = response.data;

                // save the new data and go to dispatch screen
                storage.saveFulfillment(response.data);
                this.props.navigation.push("Dispatch");
            })
    }

    prepareDispatch = () => {
        if (this.state.task.meta.dispatched) {
            this.dispatch();
            return;
        }

        if (hasItemizationIssues(this.state.task) === false && isNotCompleted(this.state.task) === false) {
            this.dispatch();
            return;
        }

        this.setState({showConfirmation: true});
    }

  render() {
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            { this.state.showConfirmation === false &&
                <View style={ HeaderStyle }>
                    <View style={{width: fontSize(60)}}>
                        <Menu
                            indicatorColor={colors.dark}
                            navigation={this.props.navigation}
                            storage={storage}
                        />
                    </View>

                    <View style={HEADER}>
                        <Text style={{fontSize: fontSize(13)}}>{this.state.task !== null && this.state.task.reference.substring(0, this.state.task.reference.length - 2)}</Text>
                    </View>

                    {this.state.shift &&
                        <View style={{width: fontSize(60), height: fontSize(30), alignItems: 'center', justifyContent: 'center', backgroundColor: this.getShiftColor(this.state.shift.dayLabel, this.state.shift.shiftLabel)}}>

                            {this.state.shift.dayLabel !== "" && this.state.shift.shiftLabel === translate("Menu.Morning") &&
                                <Icon name="sun-o" size={fontSize(16)} color={colors.white} />
                            }

                            {this.state.shift.dayLabel !== "" && this.state.shift.shiftLabel === translate("Menu.Evening") &&
                                <Icon name="moon-o" size={fontSize(16)} color={colors.white} />
                            }

                            {this.state.shift.dayLabel === "" &&
                                <Icon name="archive" size={fontSize(16)} color={colors.white} />
                            }
                        </View>
                    }
                </View>
            }

            { this.state.showConfirmation &&
                <View style={ HeaderStyle }></View>
            }

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={[ ContentWithHeaderStyle ]}>

                { this.state.showConfirmation === false &&
                    <View style={ContentCentered}>
                        <View style={{flex: 1}}>
                            <ScrollView>
                                { this.state.task !== null &&
                                    <View>
                                        <View style={[ContentRow, {backgroundColor: colors.screenBackground, marginTop: fontSize(6), padding: fontSize(3)}]}>
                                            <Text>
                                                <Text style={{fontWeight: 'bold', color: colors.dark}}>
                                                    Customer Name: {"  "}
                                                </Text>
                                                <Text style="">
                                                    {this.state.task.customer.name}
                                                </Text>
                                            </Text>
                                        </View>

                                        <View style={[ContentRow, {backgroundColor: colors.screenBackground, marginTop: fontSize(0), padding: fontSize(3)}]}>
                                            <Text>
                                                <Text style={{fontWeight: 'bold', color: colors.dark}}>
                                                    Cleaning Due: {"  "}
                                                </Text>
                                                <Text style="">
                                                    {this.state.task.cleaningDueDate}
                                                </Text>
                                            </Text>
                                        </View>

                                        <View style={[ContentRow, {backgroundColor: colors.screenBackground, marginTop: fontSize(0), padding: fontSize(3)}]}>
                                            <Text>
                                                <Text style={{fontWeight: 'bold', color: colors.dark}}>
                                                    Shift: {"  "}
                                                </Text>
                                                <Text style="">
                                                    {this.state.shift.dayLabel + " " + this.state.shift.shiftLabel}
                                                </Text>
                                            </Text>
                                        </View>

                                        <View style={[ContentRow, {backgroundColor: colors.screenBackground, marginTop: fontSize(0), padding: fontSize(3)}]}>
                                            <Text>
                                                <Text style={{fontWeight: 'bold', color: colors.dark}}>
                                                    Total Bags: {"  "}
                                                </Text>
                                                <Text style="">
                                                    {this.state.task.meta.bags.length}
                                                </Text>
                                            </Text>
                                        </View>

                                        <View>
                                            {this.renderBagsSummary(this.state.bagsSummary)}
                                        </View>
                                    </View>
                                }
                        </ScrollView>
                    </View>

                    { this.state.task && isTaskDispatched(this.state.task) === false && this.state.task.meta.scannedAtHub.length > 0 &&
                        <View style={SUBMIT}>
                            <Button text={translate("Dispatch.Dispatch")} onSubmit={() => { this.prepareDispatch() }} height={fontSize(45)} fontSize={fontSize(15)}/>
                        </View>
                    }

                    { this.state.task && isTaskDispatched(this.state.task) === false && this.state.task.meta.scannedAtHub.length === 0 &&
                        <View style={SUBMIT}>
                            <Button disabled text="NOTHING TO DISPATCH" height={fontSize(45)} fontSize={fontSize(15)} backgroundColor={colors.itemizationColor}/>
                        </View>
                    }

                    { this.state.task && isTaskDispatched(this.state.task) &&
                        <View style={SUBMIT}>
                            <Button disabled text="DISPATCHED" height={fontSize(45)} fontSize={fontSize(15)} backgroundColor={colors.itemizationColor} />
                        </View>
                    }
                </View>
            }

            { this.state.showConfirmation &&
                <View style={ContentCentered}>
                    <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        { isNotCompleted(this.state.task) &&
                            <Text style={{padding: fontSize(6), fontSize: fontSize(16), textAlign: 'center', color: colors.dark}}>Not all bags have been scanned</Text>
                        }

                        { hasItemizationIssues(this.state.task) &&
                            <Text style={{padding: fontSize(6), fontSize: fontSize(16), textAlign: 'center', color: colors.dark}}>Not all items have been found</Text>
                        }
                    </View>

                    <View style={[SUBMIT, {height: fontSize(55), paddingBottom: fontSize(10)}]}>
                        <Button text="Move to Incomplete Rack" onSubmit={() => { this.props.navigation.push("Dispatch") }} height={fontSize(45)} fontSize={fontSize(15)} backgroundColor={colors.screenBackground} color={colors.dark} borderWidth={1} borderColor={colors.dark}/>
                    </View>

                    <View style={SUBMIT}>
                        <Button text={translate("Dispatch.Dispatch")} onSubmit={() => { this.dispatch() }} height={fontSize(45)} fontSize={fontSize(15)}/>
                    </View>
                </View>
            }
        </View>
    </View>
    );
  }
}

const mapStateToProps = ({ dashboardData }) => {
  return { dashboardMode: dashboardData.dashboardMode };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatchRequest: (reference) => {
            return dispatch(actions.dispatchRequest(reference));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetails);


