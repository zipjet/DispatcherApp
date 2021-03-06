import React, { Component } from "react";
import { Text, TextInput, View, FlatList, Alert, Image, AsyncStorage, TouchableHighlight } from "react-native";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentStyle, KeyboardStyle, Table, TableRow, TableCell, hr } from "./../../constants/base-style.js";
import { TASK_DATA, TASK_DATA_HEADER, GRID, GRID_ITEM, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { styles } from './style';
import { fontSize, getMissingBagsBarcodes } from '../../constants/util';
import { WASH_FOLD, DRY_CLEANING } from "./../../constants/constants";
import Icon from 'react-native-vector-icons/FontAwesome';
import store from '../../store';
import * as storage from '../../storage';
import * as types from '../../actions/types';
import * as actions from "../../actions";

class OrderCard extends React.Component {

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        return (nextProps.item.reference !== this.props.item.reference);
    }

    getWFBagsCount = (item) => {
        return item.meta.bags
            .filter(
                (bag) => { return bag.type === WASH_FOLD; }
            )
            .length
    }

    getDCBagsCount = (item) => {
        return item.meta.bags
            .filter(
                (bag) => { return bag.type === DRY_CLEANING; }
            )
            .length
    }

    _onSelect = () => {
        store.dispatch({type: types.SAVE_TASK, task:this.props.item});
        storage.saveFulfillment(this.props.item).then();

        this.props.navigation.push("OrderDetails");
    }

    render() {
        return <TouchableHighlight onPress={this._onSelect}  underlayColor="white">
                   <View style={[GRID_ITEM, { backgroundColor: colors.white, paddingTop: fontSize(10), paddingBottom: fontSize(10) }]}>
                       <View style={{ width: '100%', paddingLeft: fontSize(6), paddingRight: fontSize(6), flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                           { this.props.item.meta.dispatched &&
                                <Icon name="check-circle" size={fontSize(16)} color={colors.teal}/>
                           }

                           { this.props.item.meta.dispatched === false && this.props.item.meta.stockedAtHub &&
                                <Icon name="archive" size={fontSize(16)} color={colors.teal}/>
                           }

                           <View style={[styles.headingLeftItems, {flex: 0.3}]}>
                                <Text style={{ fontSize: fontSize(8) }}>{this.props.item.reference.substring(0, this.props.item.reference.length - 2)}</Text>
                           </View>

                           <View style={[styles.headingLeftItems, { flex: 0.5, height: '100%', alignItems: 'center', justifyContent: 'center'}]}>
                                <Text style={{ fontSize: fontSize(8) }}>{this.props.item.customer.name}</Text>
                           </View>

                           { this.props.showMissingBags && getMissingBagsBarcodes(this.props.item).length > 0 &&
                                <View style={{ width: fontSize(60), flexDirection: 'column', justifyContent: 'center' }}>
                                    { getMissingBagsBarcodes(this.props.item).map(
                                       (bagDetails) => {
                                           return <View style={{ width: fontSize(60), flexDirection: 'column', justifyContent: 'center' }}>
                                                    <Text style={[{fontSize: fontSize(8)}]}>{ bagDetails }</Text>
                                                  </View>
                                       }
                                    )}
                                </View>
                           }

                           { this.props.showMissingBags === undefined &&
                                <View style={{ width: fontSize(20), flexDirection: 'column', justifyContent: 'center' }}>
                                   { this.getWFBagsCount(this.props.item) > 0 &&
                                       <View>
                                            <Text style={[{fontSize: fontSize(8)}]}>{this.getWFBagsCount(this.props.item)} WF</Text>
                                       </View>
                                   }

                                   { this.getDCBagsCount(this.props.item) > 0 &&
                                        <View>
                                            <Text style={[{fontSize: fontSize(8)}]}>{this.getDCBagsCount(this.props.item)} DC</Text>
                                        </View>
                                   }
                                </View>
                           }
                       </View>
                   </View>
               </TouchableHighlight>
    }
}

export default OrderCard;