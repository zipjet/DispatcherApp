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
import {fontSize, getShift, getItemizationData, isReadyToDispatch, isReadyToStock, isNotCompleted} from '../../constants/util';
import { WASH_FOLD, DRY_CLEANING } from "./../../constants/constants";
import * as storage from '../../storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import ItemizationCard       from "./../../components/ItemizationCard";

import { DropDownHolder } from './../../components/DropdownHolder';

class OrderBagItemization extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            task: null,
            spinner: false,
            shift: null,
            barcode: "",
            comment: "",
            itemizationData: []
        };

        Promise
            .all([storage.loadFulfillment(), storage.loadBarcode()])
            .then(values => {
                let task = JSON.parse(values[0]);
                let barcode = values[1];
                let shift = getShift(moment(task.cleaningDueDate, 'DD.MM.YYYY HH:mm'));

                let bag = null;
                for (let i = 0; i < task.meta.bags.length; i++) {
                    if (task.meta.bags[i].code === barcode) {
                        bag = task.meta.bags[i];
                    }
                }

                let itemizationData = getItemizationData(task.itemization.items, bag.dispatcherItemizationItems);

                this.setState({task: task, shift: shift, barcode: barcode, itemizationData: itemizationData});
            })
    }

    _onItemizationIncrementItemClick = (reference) => {
        let itemizationData = this.state.itemizationData;
        itemizationData[reference].quantity++;

        this.setState({itemizationData: itemizationData});
    }

    _onItemizationDecrementItemClick = (reference) => {
        let itemizationData = this.state.itemizationData;
        if (itemizationData[reference].quantity > 0) {
            itemizationData[reference].quantity--;

            this.setState({itemizationData: itemizationData});
        }
    }

    cancelItemization = () => {
        this.props.navigation.push("Scan");
    }

    saveItemizationForBag = () => {
        this.setState({spinner: true});
        this.setState({ noInternet: false });

        this.props
            .sendItemization(
                Object.keys(this.state.itemizationData).map(
                    key => this.state.itemizationData[key]
                ),
                this.state.barcode,
                this.state.comment
            )
            .then(response => {
                this.setState({spinner: false});

                if (response && response.hasOwnProperty('data')) {
                    storage.saveFulfillment(response.data);

                    DropDownHolder.alert('success', 'Success', 'The itemization has been saved');

                    storage.loadShift().then(
                        (shiftJson) => {
                            let shift = JSON.parse(shiftJson);

                            if (isReadyToStock(response.data, shift)) {
                                this.props.navigation.push("Dispatch");
                            } else if (isReadyToDispatch(response.data)) {
                                this.props.navigation.push("OrderDetails");
                            } else if (isNotCompleted(response.data)){
                                this.props.navigation.push("Dispatch");
                            } else {
                                this.props.navigation.push("Scan");
                            }
                        }
                    )
                }

                if (response === undefined) {
                    this.setState({ noInternet: true });
                }
            })
    }

    keyExtractor = (item) => { return item.productReference }

  render() {
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            <View style={ HeaderStyle }>
                <View style={{width: fontSize(60)}}/>

                <View style={HEADER}>
                    <Text style={{fontSize: fontSize(13)}}>{this.state.task !== null && this.state.task.reference.substring(0, this.state.task.reference.length - 2)} Itemization</Text>
                </View>

                <View style={{width: fontSize(60)}}/>
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

                                <View style={ContentRow}>
                                    <FlatList
                                        data={ Object.keys(this.state.itemizationData).map(key => { return this.state.itemizationData[key]; }) }
                                        numColumns={1}
                                        keyExtractor={this.keyExtractor}

                                        renderItem={(item, index) => {
                                            return <ItemizationCard
                                                key={item.item.productReference}
                                                onPlusClick={this._onItemizationIncrementItemClick}
                                                onMinusClick={this._onItemizationDecrementItemClick}

                                                itemReference={item.item.productReference}
                                                itemQuantity={item.item.quantity}
                                                itemName={item.item.productName}
                                            />
                                        }
                                        }
                                        separatorBorderWidth={20}
                                        separatorBorderColor={colors.screenBackground}
                                    />
                                </View>

                                <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                    <TextInput style={{ width: '100%', height: fontSize(40), backgroundColor: colors.white }}
                                               autoCorrect={true}
                                               autoCapitalize="sentences"
                                               keyboardType='default'
                                               underlineColorAndroid='transparent'
                                               placeholder="Add a comment"
                                               onChangeText={(inputModal) => this.setState({comment: inputModal})}
                                               ref={this.inputRef}
                                    />
                                </View>
                            </View>
                        }
                </View>

                <View style={SUBMIT}>
                    <Button text={translate("Itemization.Cancel")} onSubmit={() => { this.cancelItemization() }} height={fontSize(45)} fontSize={fontSize(15)} backgroundColor={colors.white} color={colors.dark}/>
                    <Button text={translate("Itemization.Save")} onSubmit={() => { this.saveItemizationForBag() }} height={fontSize(45)} fontSize={fontSize(15)}/>
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
        sendItemization: (itemizationData, barcode, comment) => {
            return dispatch(actions.sendItemization(itemizationData, barcode, comment));
        },
        dispatchRequest: (reference) => {
            return dispatch(actions.dispatchRequest(reference));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderBagItemization);


