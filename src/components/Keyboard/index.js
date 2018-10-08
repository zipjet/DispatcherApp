import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, Image, Alert, TouchableHighlight } from "react-native";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentStyle, KeyboardStyle, Table, TableRow, TableCell, hr } from "./../../constants/base-style.js";
import { TASK_DATA, TASK_DATA_HEADER, GRID, GRID_ITEM } from "./../../constants/base-style.js";
import { styles } from './style';
import { translate } from '../../locale';
import CustomButton from "./../../components/Button";
import { fontSize } from '../../constants/util';
import KeyEvent from 'react-native-keyevent';
import store from '../../store';
import * as storage from '../../storage';
import * as types from '../../actions/types';
import { STATE_ITEMIZING, STATE_CLEANING } from "./../../constants/constants";

const ON_KEY_UP     = "onKeyUp";
const ON_KEY_DOWN   = "onKeyDown";

class Keyboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            barcode: "",
            eventListener: props.eventListener
        }
    }

    // add the listener
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                if (this.props.eventListener === ON_KEY_UP) {
                    KeyEvent.onKeyUpListener((keyEvent) => {
                        let keyEventCode = keyEvent.keyCode.toString();

                        if (keyEventCode.length < 2) {
                            this._onKeyboardInput(keyEventCode);
                        }
                    });
                }

                if (this.props.eventListener === ON_KEY_DOWN) {
                    KeyEvent.onKeyDownListener((keyEvent) => {
                        let keyEventCode = keyEvent.keyCode.toString();

                        if (keyEventCode.length < 2) {
                            this._onKeyboardInput(keyEventCode);
                        }
                    });
                }
            }
        );

        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                if (this.props.eventListener === ON_KEY_UP) {
                    // if you are listening to keyUp
                    KeyEvent.removeKeyUpListener();
                }

                if (this.props.eventListener === ON_KEY_DOWN) {
                    // if you are listening to keyDown
                    KeyEvent.removeKeyDownListener();
                }
            }
        );
    }

    _onClear = () => {
        this.setState({barcode: ""})
    }

    _onKeyboardInput = (text) => {
        let barcode = this.state.barcode + text;
        if (barcode.length <= 8) {
            this.setState({barcode: barcode})
        }

        if (barcode.length === 8) {
            this.props.showSpinner && this.props.showSpinner();

            this._onSearchByCode(barcode);
        };
    }

    _onKeyboardDeletePress = () => {
        if (this.state.barcode.length > 0) {
            this.setState({barcode: this.state.barcode.substring(0, this.state.barcode.length - 1)})
        }
    }

    _onSearchByCode = (barcode) => {
        this.props
            .searchBarcodeRequest(barcode)
            .then(response => {
                this.props.hideSpinner && this.props.hideSpinner();

                this._onClear();

                if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('reference')) {
                    if (response && response.hasOwnProperty('errors') && response.errors.length) {
                        Alert.alert(response.errors[0].userTitle, response.errors[0].userMessage);
                    }

                    store.dispatch({type: types.SAVE_TASK, task:response.data});
                    storage.saveFulfillment(response.data);

                    if (response.data.state === STATE_ITEMIZING) {
                        this.props.navigation.push("Fulfillment");
                    } else {
                        this.props.navigation.push("FulfillmentView");
                    }
                } else {
                    if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
                        Alert.alert(response.errors[0].userTitle, response.errors[0].userMessage);
                    } else {
                        Alert.alert("", translate("bag.search.fail"));
                    }
                }
            }
        );
    }

    render() {
        return (
            <View style={[ KeyboardStyle, {} ]}>
                <View style={[styles.content, {alignItems: 'center', marginTop: fontSize(10)}]}>
                    <Text
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                        value={this.state.barcode}
                        underlineColorAndroid="transparent"
                        style={[styles.input, {width: 120}]}
                    >{this.state.barcode}</Text>

                    <Image
                        source={require('./../../../assets/img/dashed-input-underline.png')}
                        style={{ width: 120, height: 6, resizeMode: 'contain' }}
                    />
                </View>

                <View style={ Table }>
                    <View style={ TableRow }>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="1" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="2" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="3" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                    </View>
                    <View style={ TableRow }>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="4" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="5" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="6" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                    </View>
                    <View style={ TableRow }>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="7" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="8" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="9" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                    </View>
                    <View style={ TableRow }>
                        <CustomButton disabled style={ TableCell } backgroundColor={ colors.white }></CustomButton>
                        <CustomButton  backgroundColor={ colors.white } color={ colors.blueGrey } text="0" height={fontSize(50)} fontSize={12} onSubmit={this._onKeyboardInput}></CustomButton>
                        <TouchableHighlight style={[ TableCell, { alignItems: 'center'} ]} onPress={this._onKeyboardDeletePress}  underlayColor="white">
                            <Image
                                source={require('./../../../assets/icons/backspace.png')}
                                style={{ width: 20, height: 20, resizeMode: 'contain', marginTop: fontSize(12) }}
                            />
                        </TouchableHighlight>
                    </View>
                </View>

                <View style={[styles.content, { marginTop: fontSize(20)} ]}>
                    <View style={styles.clearButtonWrapper}>
                        <CustomButton
                            color={ colors.blueGrey }
                            backgroundColor={ colors.white }
                            text={translate("Keyboard.Clear")}
                            onSubmit={this._onClear}/>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = ({ dashboardData }) => {
    return { };
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchBarcodeRequest: (barcode) => {
            return dispatch(actions.searchBarcodeRequest(barcode));
        },
        searchReferenceRequest: (reference) => {
            return dispatch(actions.searchReferenceRequest(reference));
        },
        loadTasksRequest: (timespan) => {
            return dispatch(actions.loadTasksRequest(timespan));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Keyboard);
