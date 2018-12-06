import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import * as styles from "./style";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight, StatusBar } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE, HEADER, hr, GRID_ITEM } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import { FR_PARIS } from '../../constants/constants';
import Button from "./../../components/Button";
import Menu from "./../../components/Menu";
import moment       from "moment";
import * as types   from '../../actions/types';
import store from '../../store';
import { dimensions, fontSize, getShift } from '../../constants/util';
import { Select, Option } from "./../../components/Select";
import * as storage from '../../storage';

class DriversList extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,

            shifts:     [],
            shiftValue: "",
            shiftLabel: ""
        };

    }

    // add the listener
    componentWillMount() {
        storage.loadDispatcher()
            .then(
                (dispatcherJSON) => {
                    let dispatcherObj = JSON.parse(dispatcherJSON);
                    let locationId    = dispatcherObj !== undefined ? dispatcherObj.locationId : ''

                    this._calculateShifts(locationId);
                    this._onShiftSelect   = this._onShiftSelect.bind(this);
                }
            );
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

    _calculateShifts = (locationId) => {
        let shifts = [12, 23];
        let todayMoment = moment().startOf('day');
        let tomorrowMoment = moment().startOf('day').add(1, 'day');

        let options = [];

        for (let i = 0; i < shifts.length; i++) {
            let shift = getShift(moment(todayMoment).add(shifts[i], 'hours'));

            options.push({start: shift.start, end:shift.end, label:shift.dayLabel + " " + shift.shiftLabel});
        }

        if (locationId === FR_PARIS) {
            // add this shift for Paris
            let lastShiftToday = getShift(moment(todayMoment).add(shifts[shifts.length - 1], 'hours'));
            let firstShiftTomorrow = getShift(moment(tomorrowMoment).add(shifts[0], 'hours'));
            options.push({start: lastShiftToday.start, end:firstShiftTomorrow.end, label:lastShiftToday.dayLabel + " " + lastShiftToday.shiftLabel + " + " + firstShiftTomorrow.dayLabel + " " + firstShiftTomorrow.shiftLabel});
        }

        for (let i = 0; i < shifts.length; i++) {
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
                    if (parseInt(options[i].start.unix()) === parseInt(shiftTokens[0]) && parseInt(options[i].end.unix()) === parseInt(shiftTokens[1])) {
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

    _getDriverNames = () => {
        let drivers = [];

        for (let i = 0; i < this.props.tasks.length; i++) {
            let task = this.props.tasks[i];

            if (drivers.indexOf(task.rack) === -1) {
                drivers.push(task.rack);
            }
        }

        return drivers;
    }

    keyExtractor = (item) => { return item }


















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

                <View style={[HEADER, {justifyContent: 'center', backgroundColor: colors.screenBackground}]}>
                    {this.state.shiftLabel !== "" &&  <Select
                        min={true}
                        visible={this.state.modalVisible}
                        onSelect = {this._onShiftSelect}
                        defaultText = {this.state.shiftLabel}
                        indicatorSize={ fontSize(0) }
                        style = {[{ height: '100%', borderWidth: 0, height: fontSize(34), justifyContent: 'center' }]}
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

                        <View>
                            <TouchableHighlight onPress={() => {}} underlayColor={colors.white}>
                                <View style={[ContentRow, {backgroundColor: colors.screenBackground, justifyContent: 'center'}]}>
                                    <Text style={{ fontSize: fontSize(14) }}>Drivers</Text>
                                </View>
                            </TouchableHighlight>

                            <View style={hr} />

                            <FlatList
                                ItemSeparatorComponent={
                                    () => <View style={hr} />
                                }
                                style={{flex: 1, width: '80%', marginLeft: '10%'}}
                                data={ this._getDriverNames() }
                                keyExtractor={this.keyExtractor}
                                renderItem={
                                    ({item}) => <View key={item} style={[GRID_ITEM, { height: fontSize(30), backgroundColor: colors.white, paddingTop: fontSize(10), paddingBottom: fontSize(10) }]}>
                                                    <View style={{ width: '100%', paddingLeft: fontSize(6), paddingRight: fontSize(6), flexDirection: 'row', justifyContent: "center", alignItems: 'center' }}>
                                                        <Text style={{ fontSize: fontSize(8) }}>{item}</Text>
                                                    </View>
                                                </View>
                                }
                            />
                        </View>
                    </ScrollView>
                </View>

            </View>
        </View>
    );
  }
}

const mapStateToProps = ({ dashboardData }) => {
    return { tasks: dashboardData.tasks };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadTasksRequest: (timespan) => {
            return dispatch(actions.loadTasksRequest(timespan));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DriversList);


