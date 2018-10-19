import React, { Component } from "react";
import { Text, TextInput, View, TouchableHighlight } from "react-native";
import { colors, itemizationItem } from "./../../constants/base-style.js";
import { TASK_DATA, TASK_DATA_HEADER, GRID, GRID_ITEM, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { fontSize } from '../../constants/util';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class ItemizationCard extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            itemQuantity:   this.props.itemQuantity,
            itemName:       this.props.itemName,
            itemReference:  this.props.itemReference,
            itemExpectedQuantity: this.props.itemExpectedQuantity,
        }
    }

    onPlus = () => {
        this.setState({itemQuantity: this.state.itemQuantity + 1});
        this.props.onPlusClick(this.props.itemReference)
    }

    onMinus = () => {
        if (this.state.itemQuantity - 1 < 0) {
            return;
        }

        this.setState({itemQuantity: this.state.itemQuantity - 1});
        this.props.onMinusClick(this.props.itemReference)
    }


    render() {
        return <TouchableHighlight onPress={this.onPlus} underlayColor="white">
            <View style={[GRID_ITEM, { flexDirection: 'row', height: fontSize(30), padding: 0, backgroundColor: colors.white, justifyContent: 'space-between' }]}>
                <View style={{flex: 1, alignContent: 'flex-start', justifyContent: 'center', width: '78%'}}>
                    <Text style={[itemizationItem]}>
                        <Text style={{fontWeight: 'bold'}}>{this.state.itemName} </Text>
                        (Expected {this.state.itemExpectedQuantity})
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '20%'}}>
                    <TouchableHighlight onPress={this.onMinus} underlayColor={colors.white}>
                        <Icon name="minus-circle" style={[{fontSize: fontSize(16), lineHeight: fontSize(16), color: colors.itemizationColor}]} />
                    </TouchableHighlight>

                    <Text style={[TASK_DATA_HEADER, {fontSize: 14}]}>{this.state.itemQuantity}</Text>

                    <TouchableHighlight onPress={this.onPlus} underlayColor={colors.white}>
                        <Icon name="plus-circle" style={[{fontSize: fontSize(16), lineHeight: fontSize(16), color: colors.itemizationColor}]} />
                    </TouchableHighlight>
                </View>
            </View>
        </TouchableHighlight>
    }
}