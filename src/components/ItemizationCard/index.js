import React, { Component } from "react";
import { Text, TextInput, View, TouchableHighlight } from "react-native";
import { colors, itemizationItem } from "./../../constants/base-style.js";
import { TASK_DATA, TASK_DATA_HEADER, GRID, GRID_ITEM, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { fontSize } from '../../constants/util';

export default class ItemizationCard extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            itemQuantity:   this.props.itemQuantity,
            itemName:       this.props.itemName,
            itemReference:  this.props.itemReference,
        }
    }

    onPlus = () => {
        this.setState({itemQuantity: this.state.itemQuantity + 1});
        this.props.onPlusClick(this.props.itemReference)
    }

    onMinus = () => {
        this.setState({itemQuantity: this.state.itemQuantity - 1});
        this.props.onMinusClick(this.props.itemReference)
    }


    render() {
        return <TouchableHighlight onPress={this.onPlus} underlayColor="white">
            <View style={[GRID_ITEM, { flexDirection: 'column', height: fontSize(80), padding: 0, backgroundColor: colors.white, justifyContent: 'center' }]}>
                <View style={{flex: 1, alignContent: 'center', justifyContent: 'center', width: '100%'}}>
                    <Text style={[itemizationItem]}>
                        {this.state.itemName}
                    </Text>
                </View>

                { this.state.itemQuantity > 0 &&
                <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center', alignContent: 'flex-end', height: fontSize(42) }}>
                    <Text style={[TASK_DATA_HEADER, {fontSize: fontSize(12), alignContent: 'center'}]}>
                        {this.state.itemQuantity}
                    </Text>

                    <View style={{ flexDirection: 'row', backgroundColor: colors.coral, justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                        <TouchableHighlight onPress={this.onMinus} underlayColor={colors.coral}>
                            <Text style={[TASK_DATA_HEADER, {fontSize: fontSize(16), lineHeight: fontSize(16), color: colors.white}]}>+</Text>
                        </TouchableHighlight>

                        <Text style={[TASK_DATA_HEADER, {fontSize: 14}]}>     </Text>

                        <TouchableHighlight onPress={this.onMinus} underlayColor={colors.coral}>
                            <Text style={[TASK_DATA_HEADER, {fontSize: fontSize(16), lineHeight: fontSize(16), width: fontSize(16), color: colors.white}]}>-</Text>
                        </TouchableHighlight>
                    </View>
                </View>
                }
            </View>
        </TouchableHighlight>
    }
}