import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import Button from "./../../components/Button";
import Menu from "./../../components/Menu";
import Prompt       from "./../../components/Dialog";
import moment       from "moment";
import * as types   from '../../actions/types';
import store from '../../store';
import { dimensions, fontSize, getShift, getStockOrders, getNewOrders, isTaskDispatched } from '../../constants/util';
import timer from 'react-native-timer';
import { Select, Option } from "react-native-chooser";
import { STATE_ITEMIZING, STATE_CLEANING } from "./../../constants/constants";
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';
import * as storage from '../../storage';

class OrderDetails extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            task: null,
        };

        storage
            .loadFulfillment()
            .then((task) => {
                this.setState({task: task});
            });
    }

  render() {
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            <View style={ HeaderStyle }>
                <Menu
                    navigation={this.props.navigation}
                    storage={storage}
                />
            </View>

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={[ ContentWithHeaderStyle ]}>
                <View style={ContentCentered}>
                    <View>
                        <View style={[ContentRow, {justifyContent: 'center', backgroundColor: colors.screenBackground}]}>
                            {this.state.shiftLabel !== "" &&  <Select
                                onSelect = {this._onShiftSelect}
                                defaultText = {this.state.shiftLabel}
                                indicatorSize={ fontSize(0) }
                                style = {[{ borderWidth: 0, backgroundColor: colors.white, height: fontSize(24), justifyContent: 'center' }]}
                                textStyle = {{ lineHeight: fontSize(16), fontSize: fontSize(14), alignContent: 'center' }}
                                optionListStyle = {{ backgroundColor : colors.screenBackground, width: "100%", height: "100%", justifyContent: 'center', marginRight: "0%", marginTop: fontSize(0) }}
                                selected= {<Text style={{ fontSize: fontSize(14)}}>Shift: { this.state.shiftLabel }</Text>}
                                transparent={ true }>

                                    <View style={[ContentRow, {justifyContent: 'center', backgroundColor: colors.screenBackground}]}>
                                        <Text styleText={{ color: colors.dark }} style={{ fontSize: fontSize(14), marginTop: fontSize(10), marginLeft: fontSize(10) }}>
                                            Choose a Shift
                                        </Text>
                                    </View>

                                    { this.state.shifts }
                                </Select>
                            }
                        </View>

                        <TouchableHighlight onPress={() => { this._showTasks("Stock Orders", getStockOrders(this.state.tasks)) }} underlayColor={colors.white}>
                            <View style={ContentRow}>
                                <Text style="">Stock</Text>
                                <Text style="">
                                    {getStockOrders(this.state.tasks).filter((task) => {return isTaskDispatched(task)}).length}
                                    /
                                    {getStockOrders(this.state.tasks).length}
                                </Text>
                            </View>
                        </TouchableHighlight>

                        <TouchableHighlight onPress={() => { this._showTasks("New Orders", getNewOrders(this.state.tasks)) }} underlayColor={colors.white}>
                            <View style={ContentRow}>
                                <Text style="">New</Text>
                                <Text style="">
                                    {getNewOrders(this.state.tasks).filter((task) => {return isTaskDispatched(task)}).length}
                                    /
                                    {getNewOrders(this.state.tasks).length}
                                </Text>
                            </View>
                        </TouchableHighlight>

                        <TouchableHighlight onPress={() => { this._showTasks("Incomplete Orders", getNewOrders(this.state.tasks).filter((task) => {return !isTaskDispatched(task)})) }} underlayColor={colors.white}>
                            <View style={ContentRow}>
                                <Text style="">Incomplete</Text>
                                <Text style="">
                                    {getNewOrders(this.state.tasks).filter((task) => {return !isTaskDispatched(task)}).length}
                                </Text>
                            </View>
                        </TouchableHighlight>

                        <TouchableHighlight onPress={() => { this._showTasks("Total Orders", this.state.tasks) }} underlayColor={colors.white}>
                            <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                <Text style="">Total Orders</Text>
                                <Text style="">
                                    {this.state.tasks.length}
                                </Text>
                            </View>
                        </TouchableHighlight>
                    </View>

                    <View style={SUBMIT}>
                        <Button text={translate("Scan.Scan")} onSubmit={() => { this.props.navigation.push('Scan') }} height={fontSize(45)} fontSize={fontSize(15)}/>
                        <Swipeout style={[SUBMIT, {width: '50%'}]} right={[{text: translate("Scan.Finish")}]} buttonWidth={dimensions.width / 2}>
                            <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", width: "100%", height: "100%" }}>
                                <Text style={{ justifyContent: "center", alignItems: "center" }}>{translate("Scan.Finish")}    </Text>
                                <Icon name="ellipsis-v" size={fontSize(16)} color={colors.white} />
                            </View>
                        </Swipeout>
                    </View>
                </View>

            </View>

            <Prompt
                isDialogVisible={ this.state.searchByReferencePrompt }
                title={"Enter reference"}
                message={""}
                hintInput={"Reference"}
                submitInput={ (inputText) => { this._onSearchByReference(inputText) } }
                closeDialog={ () => {
                    this.setState({ searchByReferencePrompt: false})
                }}
                style={{ width: '50%', height: '50%' }}
            />
        </View>
    );
  }
}

const mapStateToProps = ({ dashboardData }) => {
  return { dashboardMode: dashboardData.dashboardMode };
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchReferenceRequest: (reference) => {
            return dispatch(actions.searchReferenceRequest(reference));
        },
        loadTasksRequest: (timespan) => {
            return dispatch(actions.loadTasksRequest(timespan));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetails);


