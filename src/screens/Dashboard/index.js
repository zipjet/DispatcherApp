import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import * as storage from '../../storage';
import Button from "./../../components/Button";
import Prompt       from "./../../components/Dialog";
import moment       from "moment";
import * as types   from '../../actions/types';
import store from '../../store';
import { fontSize } from '../../constants/util';
import timer from 'react-native-timer';
import { Select, Option } from "react-native-chooser";
import { STATE_ITEMIZING, STATE_CLEANING } from "./../../constants/constants";
import Icon from 'react-native-vector-icons/FontAwesome';
import DashboardCard from "../../components/DashboardCard/index";

const ALL       = translate("Menu.Dashboard");
const NEW       = translate("Menu.Itemizing");
const PROGRESS  = translate("Menu.Cleaning");
const ERROR     = translate("Menu.Error");

class Dashboard extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.dashboardMode = '';
        this.tasks = [];
        this.isLoading = false;

        this.state = {
            nextPage: 1,
            numColumns: 3,
            posts: [],
            showFooter: false,
            dashboardMode: '',
            refreshing: false,

            noInternet: false,
            spinner: true,
            tasks: [],
            filteredTasks: [],
            searchByReferencePrompt: false,

            shifts:     [],
            shiftValue: "",
            shiftLabel: translate("Menu.Today") + " 12:00"
        };
    }

    onEndReached() {
        this.loadData(true, false);
    }

    loadData(append, reset) {
        if (this.isLoading) return;

        let pagesToLoad = this.state.nextPage;
        let stateTasksPlusOne = 0;

        if (append) {
            this.setState({ loadingMore: true, nextPage: this.state.nextPage + 1 });
            pagesToLoad = this.state.nextPage + 1;
        }

        if (reset) {
            this.setState({ nextPage: 1 });
            pagesToLoad = 1;
        }

        try {
            this.isLoading = true;

            let stateTasks = this.tasks
                .filter(
                    (item) => {
                        return this.dashboardMode === ALL ||
                            (this.dashboardMode === NEW      && item.state === STATE_ITEMIZING) ||
                            (this.dashboardMode === PROGRESS && item.state === STATE_CLEANING) ||
                            (this.dashboardMode === ERROR    && item.state === STATE_CLEANING && item.meta.missingBags.length > 0)
                    }
                )
                .sort(
                    (a, b) => {
                        if (a.serviceClass && a.serviceClass.id && a.serviceClass.id.toLowerCase().indexOf('-express-') > 0) {
                            return -1;
                        }

                        if (b.serviceClass && b.serviceClass.id && b.serviceClass.id.toLowerCase().indexOf('-express-') > 0) {
                            return 1;
                        }

                        return 0;
                    }
                );

            let refreshTasks = stateTasks.filter((item, index) => { return index < pagesToLoad * 15 });
            stateTasksPlusOne = stateTasks.filter((item, index) => { return index < pagesToLoad * 15 + 1 }).length;

            // should I show the footer?
            if (refreshTasks.length < stateTasksPlusOne) {
                this.setState({ showFooter: true });
            }

            this.setState({ loadingMore: false, posts: refreshTasks });

            // should I show the footer?
            if (refreshTasks.length >= stateTasksPlusOne) {
                this.setState({ showFooter: false });
            }
        } catch (error) {
            Alert.alert("er", error.message);

        } finally {
            this.isLoading = false;
            this.setState({ loadingMore: false, refreshing: false });
        }
    }


    // add the listener
    componentDidMount() {
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

    _modeChange = (mode, doNotReloadData) => {
        let modeTokens = mode.split(" (");

        store.dispatch({type: types.DASHBOARD_MODE, mode:modeTokens[0]});
        this.dashboardMode = modeTokens[0];

        if (doNotReloadData !== true) {
            this.loadData(false, true);
        }
    }

    _onShiftSelect(value, label) {
        this.setState({ spinner: true });
        this.setState({ shiftValue: value, shiftLabel: label });

        storage.saveShift({value: value, label: label});

        this._loadTasks(value);
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

                    if (response.data.state === STATE_ITEMIZING) {
                        this.props.navigation.push("Fulfillment");
                    } else {
                        this.props.navigation.push("FulfillmentView");
                    }
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
                    this.tasks = response.data;
                    this.loadData(false, false);
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

    _calculateShifts = () => {
        let shifts = [15, 23];
        let shiftsLabel = [translate("Menu.Morning"), translate("Menu.Evening")];

        let currentHour = parseFloat(moment().format("HH"));
        let options = [];

        let todayMoment = moment().startOf('day');
        let yesterdayMoment = moment().startOf('day').subtract(1, 'day');
        let tomorrowMoment = moment().startOf('day').add(1, 'day');

        let lastShiftIndex = shifts.length - 1;
        let previousMoment = moment(yesterdayMoment).add(shifts[lastShiftIndex], 'hours');

        for (i = 0; i < shifts.length; i++) {
            let hour = Math.floor(shifts[i]);
            let minutes = Math.floor(shifts[i] * 60 - hour * 60);
            let dateString = translate("Menu.Today") + " " + shiftsLabel[i];

            options.push({start: previousMoment, end:moment(todayMoment).add(shifts[i], 'hours'), label:dateString});
            previousMoment = moment(todayMoment).add(shifts[i], 'hours');
        }

        for (i = 0; i < shifts.length; i++) {
            let hour = Math.floor(shifts[i]);
            let minutes = Math.floor(shifts[i] * 60 - hour * 60);
            let dateString = translate("Menu.Tomorrow") + " " + shiftsLabel[i];

            options.push({start: previousMoment, end:moment(tomorrowMoment).add(shifts[i], 'hours'), label:dateString});
            previousMoment = moment(tomorrowMoment).add(shifts[i], 'hours');
        }

        this.setState({ shifts: options.map((option, index) => <Option key={index} value={option.start.unix() + "-" + option.end.unix()} styleText={{ color: colors.dark }}>{option.label}</Option>) });

        storage.loadShift()
            .then((shift) => {

            try {
                let shiftObj = JSON.parse(shift);
                let shiftTokens = shiftObj.value.split("-");

                for (let i = 0; i < options.length; i++) {
                    if (options[i].start.unix() == shiftTokens[0]) {
                        this.setState({shiftValue: shiftObj.value, shiftLabel: options[i].label});
                        storage.saveShift({value: shiftObj.value, label: shiftObj.label});

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
                <Select
                    onSelect = {this._onShiftSelect}
                    defaultText  =""
                    indicatorIcon = {<Icon name="bars" size={fontSize(16)} color={colors.dark} />}
                    style = {[{ borderWidth: 0, backgroundColor: colors.backgroundColor, height: fontSize(24), width: fontSize(30) }]}

                    textStyle = {{ lineHeight: fontSize(26), fontSize: 0 }}
                    backdropStyle= {{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
                    optionListStyle = {{ backgroundColor : colors.white, width: "70%", height: "100%", justifyContent: 'center', marginRight: "30%", marginTop: fontSize(0) }}
                    selected= {<Icon name="bars" size={fontSize(16)} color={colors.dark} />}
                    transparent={ true }>
                        <Text styleText={{ color: colors.dark, size: fontSize(18) }} style={{ marginTop: fontSize(10), marginLeft: fontSize(10) }}>
                            Select Shift
                        </Text>
                        { this.state.shifts }
                </Select>
            </View>

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={[ ContentWithHeaderStyle ]}>
                <View style={ContentCentered}>
                    <View></View>

                    <View>
                        <View style={[ContentRow, {justifyContent: 'center', backgroundColor: colors.screenBackground}]}>
                            <Text>{ this.state.shiftLabel }</Text>
                        </View>

                        <View style={ContentRow}>
                            <Text style="">Stock</Text>
                            <Text style="">Stock</Text>
                        </View>

                        <View style={ContentRow}>
                            <Text style="">New</Text>
                            <Text style="">Stock</Text>
                        </View>

                        <View style={ContentRow}>
                            <Text style="">Incomplete</Text>
                            <Text style="">Stock</Text>
                        </View>

                        <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                            <Text style="">Total Orders</Text>
                            <Text style="">Stock</Text>
                        </View>
                    </View>

                    <View style={SUBMIT}>
                        <Button text={translate("Dashboard.Scan")} onSubmit={() => { this.props.navigation.push('Scan') }} height={fontSize(45)} fontSize={fontSize(15)}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);


