import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, Image, Alert, TouchableHighlight } from "react-native";
import { colors, HeaderStyle, HEADER, ContentWithHeaderStyle, ContentStyle, KeyboardStyle, Table, TableRow, TableCell, hr } from "./../../constants/base-style.js";
import { TASK_DATA, TASK_DATA_HEADER, GRID, GRID_ITEM } from "./../../constants/base-style.js";
import { styles } from './style';
import { translate } from '../../locale';
import * as storage from '../../storage';
import CustomButton from "./../../components/Button";
import { fontSize } from '../../constants/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import Menu from "./../../components/Menu";

class Keyboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            barcode: "",
            eventListener: props.eventListener
        }
    }

    // remove the listeners
    componentWillUnmount() {
        this.willFocusSubscription &&
            this.willFocusSubscription.remove();

        this.willBlurSubscription &&
            this.willBlurSubscription.remove();
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
            this._onClear();

            this.props.showSpinner && this.props.showSpinner();
            this.props.onCode(barcode);
        };
    }

    _onKeyboardDeletePress = () => {
        if (this.state.barcode.length > 0) {
            this.setState({barcode: this.state.barcode.substring(0, this.state.barcode.length - 1)})
        }
    }

    render() {
        return (
            <View style={[ KeyboardStyle, {} ]}>
                <View style={ HeaderStyle }>
                    <Menu
                        navigation={this.props.navigation}
                        storage={storage}
                    />

                    <View style={{width: fontSize(30)}}/>
                    <View style={{width: fontSize(30)}}/>
                </View>

                <View style={{flex: 0.2}}/>

                <View style={[styles.content, {alignItems: 'center', marginTop: fontSize(10)}]}>
                    <Text
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                        value={this.state.barcode}
                        underlineColorAndroid="transparent"
                        style={[styles.input, {width: fontSize(120)}]}
                    >{this.state.barcode}</Text>
                </View>

                <View style={ Table }>
                    <View style={ TableRow }>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="1" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="2" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="3" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                    </View>
                    <View style={ TableRow }>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="4" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="5" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="6" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                    </View>
                    <View style={ TableRow }>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="7" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="8" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="9" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                    </View>
                    <View style={ TableRow }>
                        <CustomButton disabled style={ TableCell } backgroundColor={ colors.white }></CustomButton>
                        <CustomButton style={ TableCell } backgroundColor={ colors.white } color={ colors.blueGrey } text="0" height={fontSize(50)} fontSize={16} onSubmit={this._onKeyboardInput}></CustomButton>
                        <TouchableHighlight style={[ TableCell, { alignItems: 'center', justifyContent: 'center'} ]} onPress={this._onKeyboardDeletePress}  underlayColor="white">
                            <Icon name="arrow-left" size={fontSize(16)} color={colors.blueGrey} />
                        </TouchableHighlight>
                    </View>
                </View>

                <View style={[styles.content, { marginTop: fontSize(20)} ]}>
                    <TouchableHighlight onPress={this._onClear} style={[styles.clearButtonWrapper, { backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }]} underlayColor="white">
                        <Icon name="remove" size={fontSize(16)} color={colors.blueGrey} onPress={this._onClear} />
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}

export default Keyboard;
