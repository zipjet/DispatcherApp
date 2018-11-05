import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight, StatusBar } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE, HEADER, hr } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import Button from "./../../components/Button";
import Menu from "./../../components/Menu";
import moment       from "moment";
import * as types   from '../../actions/types';
import store from '../../store';
import { dimensions, fontSize, getShift, getStockOrders, getNewOrders, getNotCompleteOrders, isTaskDispatched } from '../../constants/util';
import timer from 'react-native-timer';
import { Select, Option } from "./../../components/Select";
import Icon from 'react-native-vector-icons/FontAwesome';
import DispatchButton from "./../../components/DispatchButton";
import OrderCard from "./../../components/OrderCard";
import * as storage from '../../storage';

const STOCK         = 'STOCK';
const NEW           = 'NEW';
const INCOMPLETE    = 'INCOMPLETE';

class DashboardOrders extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            tasks: [],
            modalVisible: false,

            shifts:     [],
            shiftValue: "",
            shiftLabel: ""
        };
    }

    // add the listener
    componentWillMount() {
        this._calculateShifts();
        this._onShiftSelect   = this._onShiftSelect.bind(this);

        store.dispatch({type: types.SAVE_HOMEPAGE, page: "DashboardOrders"});

        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                storage.loadShift().then((shift) => {
                    let shiftObject = JSON.parse(shift);

                    if (shiftObject) {
                        this.setState({spinner: true});

                        this._loadTasks(shiftObject.value);
                    }

                    timer.setInterval(
                        "refreshDashboard",
                        () => {
                            storage.loadShift().then((shift) => {
                                let shiftObject = JSON.parse(shift);

                                if (shiftObject) {
                                    this._loadTasks(shiftObject.value);
                                }
                            })
                        },
                        60000
                    );
                })
            }
        );

        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                if (timer.intervalExists("refreshDashboard")) {
                    timer.clearInterval("refreshDashboard");
                }
            }
        );
    }

    // to remove the listener
    componentWillUnmount() {
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    _onShiftSelect(value, label) {
        if (value !== undefined && label !== undefined) {
            let valueTokens = value.split('-');

            if (valueTokens.length !== 2) {
                return;
            }

            this.setState({ spinner: true });
            this.setState({ shiftValue: value, shiftLabel: label });

            storage.saveShift({value: value, label: label});

            this._loadTasks(value);
        }
    }

    _loadTasks = (timespan) => {
        this.setState({ noInternet: false });

        this.props
            .loadTasksRequest(timespan)
            .then(response => {
                this.setState({ spinner: false });

                if (response && response.hasOwnProperty('data')) {
                    this.setState({tasks: response.data});
                    store.dispatch({type: types.SAVE_TASKS, tasks: response.data});
                } else {
                    if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
                        Alert.alert(response.errors.userTitle, response.errors.userMessage);
                    } else {
                        if (response === undefined) {
                            this.setState({ noInternet: true });
                            this.setState({ refreshing: false});
                        }
                    }
                }
            });
    }

    _showTasks = (mode, tasksCount) => {
        if (tasksCount === 0) {
            return;
        }

        if (this.props.mode === mode) {
            store.dispatch({type: types.DASHBOARD_MODE, mode: ''})
        } else {
            store.dispatch({type: types.DASHBOARD_MODE, mode: mode})
        }
    }

    _calculateShifts = () => {
        let shifts = [12, 23];
        let todayMoment = moment().startOf('day');
        let tomorrowMoment = moment().startOf('day').add(1, 'day');

        let options = [];

        for (i = 0; i < shifts.length; i++) {
            let shift = getShift(moment(todayMoment).add(shifts[i], 'hours'));

            options.push({start: shift.start, end:shift.end, label:shift.dayLabel + " " + shift.shiftLabel});
        }

        for (i = 0; i < shifts.length; i++) {
            let shift = getShift(moment(tomorrowMoment).add(shifts[i], 'hours'));

            options.push({start: shift.start, end:shift.end, label:shift.dayLabel + " " + shift.shiftLabel});
        }

        this.setState({ shifts: options.map(
                (option, index) =>  <TouchableHighlight key={index} onPress={() => { this._onShiftSelect(option.start.unix() + "-" + option.end.unix(), option.label) }} underlayColor={colors.white}>
                                        <Option style={[ContentRow, {justifyContent: 'space-between', backgroundColor: colors.white}]} optionText={{ color: colors.dark }}>
                                            {option.label}
                                        </Option>
                                    </TouchableHighlight>
            )
        });

        storage.loadShift()
            .then((shift) => {

            try {
                let shiftObj = JSON.parse(shift);
                let shiftTokens = shiftObj.value.split("-");

                for (let i = 0; i < options.length; i++) {
                    if (parseInt(options[i].start.unix()) === parseInt(shiftTokens[0])) {
                        // why I do this ? In case you selected yesterday - tomorrow shift.. today it should say Today
                        this.setState({shiftValue: shiftObj.value, shiftLabel: options[i].label});
                        storage.saveShift({value: shiftObj.value, label: options[i].label});

                        this._loadTasks(shiftObj.value);

                        return;
                    }
                }

                throw "Old shift";
            } catch (e) {
                let optionValue = options[0].start.unix() + "-" + options[0].end.unix();
                let optionLabel = options[0].label;

                this.setState({shiftValue: optionValue, shiftLabel: optionLabel});
                storage.saveShift({value: optionValue, label: optionLabel});

                this._loadTasks(optionValue);
            }
        })
    }

    keyExtractor = (item) => { return item.reference + item.meta.dispatched; }


















  render() {
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            <View style={ HeaderStyle }>
                <Menu
                    indicatorColor={colors.dark}
                    navigation={this.props.navigation}
                    storage={storage}
                />

                { this.props.mode !== '' &&
                    <View style={HEADER}>
                        <Text style={{fontSize: fontSize(13)}}>{this.state.tasks.length} Total Orders</Text>
                    </View>
                }

                <View style={{ width: fontSize(30) }}></View>
            </View>

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={[ ContentWithHeaderStyle ]}>
                <View style={ContentCentered}>
                    <ScrollView
                        contentContainerStyle={{flexGrow: 1}}
                        >
                        { this.props.mode !== "XXX" &&
                            <View style={[ContentRow, {justifyContent: 'center', backgroundColor: colors.screenBackground}]}>
                                {this.state.shiftLabel !== "" &&  <Select
                                    min={true}
                                    visible={this.state.modalVisible}
                                    onSelect = {this._onShiftSelect}
                                    defaultText = {this.state.shiftLabel}
                                    indicatorSize={ fontSize(0) }
                                    style = {[{ height: '100%', borderWidth: 0, height: fontSize(24), justifyContent: 'center' }]}
                                    textStyle = {{ lineHeight: fontSize(16), fontSize: fontSize(14), width: '100%', textAlign: 'center' }}
                                    optionListStyle = {{ height: '100%', backgroundColor: colors.screenBackground, width: "100%", marginRight: "0%" }}
                                    selected= {<Text style={{ fontSize: fontSize(14)}}>{ this.state.shiftLabel }</Text>}
                                    >
                                        <View style={[ContentRow, {justifyContent: 'center',  backgroundColor : colors.screenBackground}]}>
                                            <Text styleText={{ color: colors.dark }} style={{ fontSize: fontSize(14), marginTop: fontSize(10), marginLeft: fontSize(10) }}>
                                                Choose a Shift
                                            </Text>
                                        </View>

                                        { this.state.shifts }

                                        <TouchableHighlight onPress={() => { this.setState({modalVisible: false}) }} underlayColor={colors.screenBackground}>
                                            <View style={[SUBMIT, {marginTop: dimensions.height - StatusBar.currentHeight - fontSize(244) }]}>
                                                <Button text="View" onSubmit={() => { this.setState({modalVisible: false}) }} height={fontSize(45)} fontSize={fontSize(15)} backgroundColor={colors.blueGrey} />
                                            </View>
                                        </TouchableHighlight>
                                    </Select>
                                }
                            </View>
                        }

                        <View>
                            <TouchableHighlight onPress={
                                    () => {
                                        this._showTasks(STOCK, getStockOrders(this.state.tasks).length)
                                    }
                                }
                                underlayColor={colors.white}>

                                <View style={ContentRow}>
                                    <Text style={{ fontSize: fontSize(14) }}>Stock</Text>
                                    <Text style={{ fontSize: fontSize(14) }}>
                                        {getStockOrders(this.state.tasks).filter((task) => {return isTaskDispatched(task); }).length}
                                        /
                                        {getStockOrders(this.state.tasks).length}
                                    </Text>
                                </View>
                            </TouchableHighlight>

                            <View style={this.props.mode === STOCK ? {} : {height: 0}}>
                                <View style={hr} />

                                <FlatList
                                    ItemSeparatorComponent={
                                        () => <View style={hr} />
                                    }
                                    style={{flex: 1, width: '80%', marginLeft: '10%'}}
                                    data={ getStockOrders(this.state.tasks) }
                                    keyExtractor={this.keyExtractor}
                                    renderItem={
                                        ({item}) => <OrderCard
                                            item={item}
                                            key={item.reference + item.meta.dispatched}
                                            navigation={this.props.navigation}
                                        />
                                    }
                                />
                            </View>
                        </View>

                        <View>
                            <TouchableHighlight onPress={() => { this._showTasks(NEW, getNewOrders(this.state.tasks).length) }} underlayColor={colors.white}>
                                <View style={ContentRow}>
                                    <Text style={{ fontSize: fontSize(14) }}>New</Text>
                                    <Text style={{ fontSize: fontSize(14) }}>
                                        {getNewOrders(this.state.tasks).filter((task) => {return isTaskDispatched(task)}).length}
                                        /
                                        {getNewOrders(this.state.tasks).length}
                                    </Text>
                                </View>
                            </TouchableHighlight>

                            <View style={this.props.mode === NEW ? {} : {height: 0}}>
                                <View style={hr} />

                                <FlatList
                                    ItemSeparatorComponent={
                                        () => <View style={hr} />
                                    }
                                    style={{width: '80%', marginLeft: '10%'}}
                                    data={getNewOrders(this.state.tasks)}
                                    keyExtractor={this.keyExtractor}
                                    renderItem={
                                        ({item}) => <OrderCard
                                            item={item}
                                            key={item.reference + item.meta.dispatched}
                                            navigation={this.props.navigation}
                                        />
                                    }
                                />
                            </View>
                        </View>

                        <View>
                            <TouchableHighlight onPress={() => { this._showTasks(INCOMPLETE, getNotCompleteOrders(this.state.tasks).filter((task) => {return !isTaskDispatched(task)}).length) }} underlayColor={colors.white}>
                                <View style={ContentRow}>
                                    <Text style={{ fontSize: fontSize(14) }}>Incomplete</Text>
                                    <Text style={{ fontSize: fontSize(14) }}>
                                        {getNotCompleteOrders(this.state.tasks).filter((task) => {return !isTaskDispatched(task)}).length}
                                    </Text>
                                </View>
                            </TouchableHighlight>

                            <View style={this.props.mode === INCOMPLETE ? {} : {height: 0}}>
                                <View style={hr} />

                                <FlatList
                                    ItemSeparatorComponent={
                                        () => <View style={hr} />
                                    }
                                    style={{width: '80%', marginLeft: '10%'}}
                                    data={getNotCompleteOrders(this.state.tasks).filter((task) => {return !isTaskDispatched(task)})}
                                    keyExtractor={this.keyExtractor}
                                    renderItem={
                                        ({item}) => <OrderCard
                                            item={item}
                                            key={item.reference + item.meta.dispatched}
                                            navigation={this.props.navigation}
                                        />
                                    }
                                />
                            </View>
                        </View>

                        { this.props.mode === '' &&
                            <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                <Text style={{ fontSize: fontSize(14) }}>Total Orders</Text>
                                <Text style={{ fontSize: fontSize(14) }}>
                                    {this.state.tasks.length}
                                </Text>
                            </View>
                        }
                    </ScrollView>

                    <View style={SUBMIT}>
                        <Button text={translate("Scan.Start")} onSubmit={() => { this.props.navigation.navigate('Scan') }} height={fontSize(45)} fontSize={fontSize(15)}/>
                    </View>
                </View>

            </View>
        </View>
    );
  }
}

const mapStateToProps = ({ dashboardData }) => {
  return {
      mode: dashboardData.mode === undefined ? '' : dashboardData.mode
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(DashboardOrders);


