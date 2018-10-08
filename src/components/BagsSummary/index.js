import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, TextInput, View, Alert, Image, AsyncStorage, TouchableHighlight, ScrollView } from "react-native";
import { TASK_DATA, TASK_DATA_HEADER, HEADER, BIG_ICON, GRID, GRID_ITEM } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import { fontSize } from '../../constants/util';
import {SEGMENTATION_WF, LOCATION_PARIS, CATEGORY_WASH_AND_FOLD, WASH_FOLD, DRY_CLEANING} from "../../constants/constants";

class BagsSummary extends React.Component {

    constructor(props) {
        super(props);

        try {
            this.state = {itemizationData: JSON.parse(this.props.itemizationData)};
        } catch (e) {
            this.state = {itemizationData: []};
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let currentPropsHash = this.props.itemizationData;
        let prevPropsHash = JSON.stringify(this.state.itemizationData);

        if (currentPropsHash !== prevPropsHash) {
            try {
                this.setState({itemizationData: JSON.parse(this.props.itemizationData)});
            } catch (e) {
                this.setState({itemizationData: []});
            }
        }
    }

    getItemizationTotal = () => {
        let itemizationCounts = this.state.itemizationData
            .filter(item => { return item.productSegmentation !== SEGMENTATION_WF })
            .map(item => {
                let quantity       = parseInt(item.quantity);
                let numberOfPieces = parseInt(item.productNumberOfPieces);

                if (isNaN(quantity) || isNaN(numberOfPieces)) {
                    return 0;
                }

                return quantity * numberOfPieces;
            });

        let itemizationCount = 0;
        for (let i = 0; i < itemizationCounts.length; i++) {
            itemizationCount += itemizationCounts[i];
        }

        return itemizationCount;
    }

    getItemizationTotalByDriver = () => {
        return this.props.task.summary.dcItems;
    }

    getItemizationWFBagsCount = () => {
        let bagsCount = 0;
        let itemizationItems = this.state.itemizationData;

        for (let i = 0; i < itemizationItems.length; i++) {
            if (itemizationItems[i].productSegmentation === SEGMENTATION_WF) {
                if (this.props.task.locationIdentifier === LOCATION_PARIS) {
                    bagsCount += Math.ceil(0.125 * itemizationItems[i].quantity);
                } else if (itemizationItems[i].productCategory === CATEGORY_WASH_AND_FOLD) {
                    bagsCount += itemizationItems[i].quantity;
                }
            }
        }

        return bagsCount;
    }

    render() {
        return <View style={{flexDirection: 'column', alignItems: "flex-start", width: '100%'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(40)}}>
                <View style={{flex: 0.3, flexDirection: "row", alignItems: "center"}}>
                    <Text> </Text>
                </View>

                <View style={[TASK_DATA, {flex: 0.35}]}>
                    <Image
                        source={require('./../../../assets/icons/facility.png')}
                        style={BIG_ICON}
                    />
                </View>

                <View style={[TASK_DATA, {flex: 0.35}]}>
                    <Image
                        source={require('./../../../assets/icons/driver.png')}
                        style={BIG_ICON}
                    />
                </View>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(40)}}>
                <View style={{flex: 0.3, flexDirection: "row", alignItems: "center"}}>
                    <Image
                        source={require('./../../../assets/icons/dc.png')}
                        style={[BIG_ICON]}
                        />

                    <Text style={[TASK_DATA_HEADER, {width: 30}]}>DC</Text>
                </View>

                <Text key={this.props.itemizationData} style={[TASK_DATA, {flex: 0.35}]}>
                    {this.getItemizationTotal()} {translate("task.pieces")}
                    {"\n"}
                    {this.props.task.meta.scannedBags && this.props.task.meta.scannedBags.filter((bag) => { return bag.type === DRY_CLEANING}).length}  {translate("task.bags")}
                </Text>

                <Text style={[TASK_DATA, {flex: 0.35}]}>
                    {this.getItemizationTotalByDriver()} {translate("task.pieces")}
                    {"\n"}
                    {this.props.task.summary.dcBags}  {translate("task.bags")}
                </Text>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(40)}}>
                <View style={{flex: 0.3, flexDirection: "row", alignItems: "center"}}>
                    <Image
                        source={require('./../../../assets/icons/wf.png')}
                        style={[BIG_ICON]}
                    />
                    <Text style={[TASK_DATA_HEADER, {width: 30}]}>WF</Text>
                </View>

                <Text style={[TASK_DATA, {flex: 0.35}]}>
                    {this.getItemizationWFBagsCount()} {translate("task.bags")}
                </Text>

                <Text style={[TASK_DATA, {flex: 0.35}]}>
                    {this.props.task.summary.wfBags} {translate("task.bags")}
                </Text>
            </View>
        </View>
    }
}

const mapStateToProps = ({ dashboardData }) => {
    return {
        task: dashboardData.task
    };
};

const mapDispatchToProps = (dispatch) => {
    return { };
};

export default connect(mapStateToProps, mapDispatchToProps)(BagsSummary);
