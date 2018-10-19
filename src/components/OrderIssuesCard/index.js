import React, { Component } from "react";
import { Text, TextInput, View, FlatList, ScrollView, Alert, Image, AsyncStorage, TouchableHighlight } from "react-native";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentStyle, KeyboardStyle, Table, TableRow, TableCell } from "./../../constants/base-style.js";
import { styles } from './style';
import {dimensions, fontSize} from '../../constants/util';
import store from '../../store';
import * as storage from '../../storage';
import * as types from '../../actions/types';

class OrderIssuesCard extends React.Component {

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        return (nextProps.item.reference !== this.props.item.reference);
    }

    _onSelect = () => {
        store.dispatch({type: types.SAVE_TASK, task:this.props.item});
        storage.saveFulfillment(this.props.item);

        this.props.navigation.push("OrderDetails");
    }

    render() {
        return <TouchableHighlight onPress={this._onSelect}  underlayColor="white">
                   <View style={[{ height: fontSize(58), flexDirection: 'row', justifyContent: 'space-between',backgroundColor: colors.white, paddingTop: fontSize(10), paddingBottom: fontSize(10) }]}>
                       <View style={{ width: '100%', paddingLeft: fontSize(10), paddingRight: fontSize(10), flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                           <View style={[styles.headingLeftItems, {flex: 0.2}]}>
                                <Text style={{ fontSize: fontSize(8) }}>{this.props.item.reference.substring(0, this.props.item.reference.length - 2)}</Text>
                           </View>

                           <View style={[styles.headingLeftItems, { flex: 0.5, height: '100%', alignItems: 'center', justifyContent: 'center'}]}>
                                <Text style={{ fontSize: fontSize(8) }}>{this.props.item.customer.name}</Text>
                           </View>

                           <View style={{width: Math.floor(dimensions.width / 3.5)}}>
                               <ScrollView
                                   vertical
                                   style={[{ paddingTop: 5, paddingBottom: 5, flexDirection: 'column' }]}>
                                   { this.props.item.issues.map(
                                       (issue) => {
                                            return <Text key={issue} style={[{fontSize: fontSize(8)}]}>{issue}</Text>
                                       }
                                   )}
                               </ScrollView>
                           </View>
                       </View>
                   </View>
               </TouchableHighlight>
    }
}

export default OrderIssuesCard;