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
import { fontSize, getShift, hasItemizationIssues, isBagScannedAtHub } from '../../constants/util';
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
            bagsSummary: []
        };

        Promise
            .all([storage.loadFulfillment(), storage.loadShift()])
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
                        bagsSummary[bagTypeKeys] = {category: bag.type, codes: [], itemization: []};
                    }

                    bagsSummary[bagTypeKeys].codes.push(bag.code);
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

    renderBagsSummary = (bagsSummary) => {
        let index = 1;

        return Object.values(this.state.bagsSummary).map((bagsData) => {
            return <View style={BAG} key={bagsData.category}>
                        <Text style={{ color: colors.dark, fontSize: fontSize(8) }}>Bag {index++}</Text>
                            { bagsData.codes.map(
                                (code, categoryIndex) => {
                                    return  <View key={code} style={{ color: colors.blueGrey, justifyContent: 'space-between', flexDirection: 'row' }}>
                                                {categoryIndex > 0 && <Text style={divider}/>}
                                                {categoryIndex > 0 && <Text style={{ color: colors.dark, fontSize: fontSize(8) }}>{"\n"}Bag {index++}{"\n"}</Text>}

                                                <Text style={{fontSize: fontSize(18)}}>{bagsData.category === WASH_FOLD ? "WF" : "DC"} {code}</Text>
                                                { isBagScannedAtHub(this.state.task, code) &&
                                                    <Icon name='check-circle' size={fontSize(20)} color={colors.teal} />
                                                }
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

                                                        { dispatcherItemizationCount !== itemizationItem.quantity &&
                                                            <Text style={{color: colors.errorColor}}>Found {dispatcherItemizationCount}</Text>
                                                        }

                                                        { dispatcherItemizationCount !== itemizationItem.quantity &&
                                                            <Icon size={fontSize(14)} name="times-circle" color={colors.errorColor} />
                                                        }

                                                        { dispatcherItemizationCount === itemizationItem.quantity &&
                                                            <Icon size={fontSize(14)} name="check-circle" color={colors.teal} />
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

                if (task.meta.bags.length === task.meta.scannedAtHub.length) {
                    this.props.navigation.push("OrdersList");
                }

                this.props.navigation.push("OrdersList");
            })
    }

  render() {
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            <View style={ HeaderStyle }>
                <View style={{width: fontSize(60)}}/>

                <View style={HEADER}>
                    <Text style={{fontSize: fontSize(13)}}>{this.state.task !== null && this.state.task.reference.substring(0, this.state.task.reference.length - 2)}</Text>
                </View>

                {this.state.shift &&
                    <View style={{width: fontSize(60), height: fontSize(25), alignItems: 'center', justifyContent: 'center', backgroundColor: this.getShiftColor(this.state.shift.dayLabel, this.state.shift.shiftLabel)}}>
                        {this.state.shift.shiftLabel === translate("Menu.Morning") &&
                            <Icon name="sun-o" size={fontSize(16)} color={colors.white} />
                        }

                        {this.state.shift.shiftLabel === translate("Menu.Evening") &&
                            <Icon name="moon-o" size={fontSize(16)} color={colors.white} />
                        }

                        {this.state.shift.shiftLabel === "" &&
                            <Icon name="archive" size={fontSize(16)} color={colors.white} />
                        }
                    </View>
                }
            </View>

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={[ ContentWithHeaderStyle ]}>
                <View style={ContentCentered}>
                    <View>
                        { this.state.task !== null &&
                            <View>
                                <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                    <Text>
                                        <Text style={{fontWeight: 'bold', color: colors.dark}}>
                                            Cleaning Due: {"  "}
                                        </Text>
                                        <Text style="">
                                            {this.state.task.cleaningDueDate}
                                        </Text>
                                    </Text>
                                </View>

                                <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                    <Text>
                                        <Text style={{fontWeight: 'bold', color: colors.dark}}>
                                            Shift: {"  "}
                                        </Text>
                                        <Text style="">
                                            {this.state.shift.dayLabel + " " + this.state.shift.shiftLabel}
                                        </Text>
                                    </Text>
                                </View>

                                <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
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
                </View>

                    { this.state.task && hasItemizationIssues(this.state.task) &&
                        <View style={[SUBMIT, {padding: fontSize(20)}]}>
                            <Button text="Move to Incomplete Rack" onSubmit={() => { this.props.navigation.push('Scan') }} height={fontSize(45)} fontSize={fontSize(15)} backgroundColor={colors.itemizationColor}/>
                        </View>
                    }

                <View style={SUBMIT}>
                    <Button text={translate("Dispatch.Dispatch")} onSubmit={() => { this.dispatch() }} height={fontSize(45)} fontSize={fontSize(15)}/>
                </View>
            </View>
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


