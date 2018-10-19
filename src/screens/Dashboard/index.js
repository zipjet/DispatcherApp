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
import moment       from "moment";
import * as types   from '../../actions/types';
import store from '../../store';
import { dimensions, fontSize, getShift, getStockOrders, getNewOrders, getNotCompleteOrders, isTaskDispatched } from '../../constants/util';
import timer from 'react-native-timer';
import { Select, Option } from "react-native-chooser";
import Icon from 'react-native-vector-icons/FontAwesome';
import DispatchButton from "./../../components/DispatchButton";
import * as storage from '../../storage';

class Dashboard extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.dashboardMode = '';
        this.isLoading = false;

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
            this.setState({ spinner: true });
            this.setState({ shiftValue: value, shiftLabel: label });

            storage.saveShift({value: value, label: label});

            this._loadTasks(value);
        }
    }

    _onSearchByReference = (reference) => {
        this.setState({searchByReferencePrompt: false});
        this.setState({spinner: true});

        this.props
            .searchReferenceRequest(reference)
            .then(response => {
                this.setState({ spinner: false });
                if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('reference')) {
                    this.setState({spinner: false});

                    store.dispatch({type: types.SAVE_TASK, task:response.data});
                    storage.saveFulfillment(response.data);

                    this.props.navigation.push("OrderDetails");
                } else {
                    if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
                        Alert.alert(response.errors.userTitle, response.errors.userMessage);
                    } else {
                        Alert.alert("", translate("bag.search.fail"));
                    }
                }
            }
        );
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

    _showTasks = (title, tasks) => {
        storage.saveTasks({title: title, tasks: tasks});

        this.props.navigation.push("OrdersList");
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
                (option, index) => <Option style={[ContentRow, {justifyContent: 'center', backgroundColor: colors.white}]} key={index} value={option.start.unix() + "-" + option.end.unix()} styleText={{ color: colors.dark }}>{option.label}</Option>
            )
        });

        storage.loadShift()
            .then((shift) => {

            try {
                let shiftObj = JSON.parse(shift);
                let shiftTokens = shiftObj.value.split("-");

                for (let i = 0; i < options.length; i++) {
                    if (options[i].start.unix() === shiftTokens[0]) {
                        this.setState({shiftValue: shiftObj.value, shiftLabel: options[i].label});
                        storage.saveShift({value: shiftObj.value, label: options[i].label});

                        this._loadTasks(shiftObj.value);

                        return;
                    }
                }

                throw "Old shift";
            } catch (e) {
                this.setState({shiftValue: options[0].start.unix() + "-" + options[0].end.unix(), shiftLabel: options[0].label});
                storage.saveShift({value: options[0].start.unix() + "-" + options[0].end.unix(), label: options[0].label});

                this._loadTasks(options[0].start.unix() + "-" + options[0].end.unix());
            }
        })
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
                                min={false}
                                visible={this.state.modalVisible}
                                onSelect = {this._onShiftSelect}
                                defaultText = {this.state.shiftLabel}
                                indicatorSize={ fontSize(0) }
                                style = {[{ height: '100%', borderWidth: 0, height: fontSize(24), justifyContent: 'center' }]}
                                textStyle = {{ lineHeight: fontSize(16), fontSize: fontSize(14), width: '100%', textAlign: 'center' }}
                                optionListStyle = {{ flex: 1, backgroundColor : colors.screenBackground, width: "100%", justifyContent: 'space-between', marginRight: "0%", marginTop: fontSize(0) }}
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

                        <TouchableHighlight onPress={() => { this._showTasks("Incomplete Orders", getNotCompleteOrders(this.state.tasks).filter((task) => {return !isTaskDispatched(task)})) }} underlayColor={colors.white}>
                            <View style={ContentRow}>
                                <Text style="">Incomplete</Text>
                                <Text style="">
                                    {getNotCompleteOrders(this.state.tasks).filter((task) => {return !isTaskDispatched(task)}).length}
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
                        <DispatchButton
                            navigation={this.props.navigation}
                            width={dimensions.width / 2}
                            />
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
        searchReferenceRequest: (reference) => {
            return dispatch(actions.searchReferenceRequest(reference));
        },
        loadTasksRequest: (timespan) => {
            return dispatch(actions.loadTasksRequest(timespan));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);


