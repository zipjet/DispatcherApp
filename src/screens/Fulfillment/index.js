import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import * as types   from '../../actions/types';
import { Text, TextInput, View, Alert, Image, AsyncStorage, TouchableHighlight, ScrollView } from "react-native";
import { TASK_DATA, TASK_DATA_HEADER, HEADER, BIG_ICON, GRID, GRID_ITEM, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import Spinner from "react-native-loading-spinner-overlay";
import CustomButton from "./../../components/Button";
import BagsSummary  from "./../../components/BagsSummary";
import { styles } from './style';
import { translate } from '../../locale';
import { colors, HeaderStyle, ContentWithHeaderStyle, SidebarStyle, ContentStyleWithLeftAndRightSidebar, hr, itemizationItem } from "./../../constants/base-style.js";
import { NavigationActions } from 'react-navigation'
import ItemizationCard from "./../../components/ItemizationCard";
import store from '../../store';
import * as utils from '../../utils';
import * as storage from '../../storage';
import GridView from 'react-native-super-grid';
import GridList from 'react-native-grid-list';
import { fontSize } from '../../constants/util';
import {STATE_CLEANING, WASH_FOLD, DRY_CLEANING, SEGMENTATION_WF} from "../../constants/constants";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Select, Option } from "react-native-chooser";

class Fulfillment extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            noInternet: false,
            spinner: false,
            itemizationData: {}
        };

        this.willFocusSubscription = null;
        this._onBack = this._onBack.bind(this);
    }

    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                setTimeout(
                    () => {this._loadItemizationData()},
                    100
                );
            }
        );
    }

    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }

    _onBack = () => {
        return this.props.navigation.dispatch(NavigationActions.navigate({ routeName: "Dashboard" }))
    }

    _loadItemizationData() {
        let products = utils.getProductsListInItemization(this.props.task, this.props.products);
        this.setState({ itemizationData: products });
  }

  _onItemizationIncrementItemClick = (reference) => {
        let itemizationData = this.state.itemizationData;
        itemizationData[reference].quantity++;

        this.setState({itemizationData: itemizationData});
  }

    _onItemizationDecrementItemClick = (reference) => {
        let itemizationData = this.state.itemizationData;
        if (itemizationData[reference].quantity > 0) {
            itemizationData[reference].quantity--;

            this.setState({itemizationData: itemizationData});
        }
    }

    _onMenuItemClick = () => {
        this.setState({spinner: true});
        this.setState({ noInternet: false });

        this.props
            .sendItemizationAndSetStateToCleaning(Object.keys(this.state.itemizationData).map(key => this.state.itemizationData[key]))
            .then(response => {
                this.setState({spinner: false});

                if (response && response.hasOwnProperty('data')) {
                    task = response.data;
                    store.dispatch({type: types.SAVE_TASK, task:task});

                    storage
                        .saveFulfillment(task)
                        .then(() => {
                            if (task.state === STATE_CLEANING) {
                                this.props.navigation.push("FulfillmentView");
                            } else {
                                this._onBack();
                            }
                        });
                }

                if (response === undefined) {
                    this.setState({ noInternet: true });
                }
            })
    }

    _onItemizationSaveClick = () => {
        this.setState({spinner: true});
        this.setState({ noInternet: false });

        this.props
            .sendItemization(Object.keys(this.state.itemizationData).map(key => this.state.itemizationData[key]))
            .then(response => {
                this.setState({spinner: false});

                if (response && response.hasOwnProperty('data')) {
                    store.dispatch({type: types.SAVE_TASK, task:response.data});

                    storage
                        .saveFulfillment(response.data)
                        .then(() => {
                            if (response.data.state === STATE_CLEANING) {
                                this.props.navigation.push("FulfillmentView");
                            } else {
                                this._onBack();
                            }
                        });
                }

                if (response === undefined) {
                    this.setState({ noInternet: true });
                }
            })
    }

    getItemizationTotal = () => {
        return Object.keys(this.state.itemizationData)
            .map(key => { return parseInt(this.state.itemizationData[key].quantity) })
            .reduce((a, b) => a + b, 0);
    }

  render() {
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            <View style={[ HeaderStyle, {backgroundColor: colors.teal} ]}>
                <TouchableHighlight style={{ height: '100%', justifyContent: 'center'}} onPress={this._onBack} underlayColor={colors.teal}>
                    <View style={[{alignItems: 'center', height: 20, backgroundColor: colors.teal}]}>
                        <Image
                            source={require('./../../../assets/icons/back.png')}
                            style={{height: fontSize(20), width: fontSize(20), resizeMode: 'contain'}}
                        />

                        <Text style={[HEADER, {backgroundColor: colors.teal}]}>
                            {translate("Itemization.Itemization")}: {this.props.task ? this.props.task.reference : ""}
                        </Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight style={{flex: 1, height: '100%', justifyContent: 'center'}} onPress={this._onItemizationSaveClick} underlayColor={colors.teal}>
                    <Text style={[HEADER, {backgroundColor: colors.teal}]}>
                        <Icon name="check" size={fontSize(16)} color={colors.white}/>
                        { "  " + translate("Itemization.Save") }
                    </Text>
                </TouchableHighlight>

                <Select
                    onSelect = {this._onMenuItemClick}
                    indicatorIcon = {<Icon name="ellipsis-v" size={fontSize(16)} color={colors.white} />}
                    style = {[{ borderWidth: 0, backgroundColor: colors.teal, height: fontSize(24) }]}

                    textStyle = {{ lineHeight: fontSize(24), fontSize: 0}}
                    backdropStyle= {{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
                    optionListStyle = {{ backgroundColor : colors.teal, width: fontSize(0, 240), height: fontSize(0, 40), justifyContent: 'center', marginRight: fontSize(10), marginTop: fontSize(42) }}
                    selected= {<Icon name="ellipsis-v" size={fontSize(16)} color={colors.white} />}
                    transparent={ true }>
                    <Option key="menu.0" value="" styleText={{ color: colors.white }}>
                        { translate("Itemization.ForceSave") }
                    </Option>
                </Select>
            </View>

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={ ContentWithHeaderStyle }>
                <View style={ ContentStyleWithLeftAndRightSidebar }>
                    <GridList
                        showSeparator
                        data={ Object.keys(this.state.itemizationData).map(key => { return this.state.itemizationData[key]; }) }
                        numColumns={4}
                        renderItem={(item, index) => {
                            return <ItemizationCard
                                onPlusClick={this._onItemizationIncrementItemClick}
                                onMinusClick={this._onItemizationDecrementItemClick}

                                itemReference={item.item.reference}
                                itemQuantity={item.item.quantity}
                                itemName={item.item.name}
                            />
                            }
                        }
                        separatorBorderWidth={20}
                        separatorBorderColor={colors.screenBackground}
                    />
                </View>

                <View style={[ SidebarStyle, {} ]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: "center", height: fontSize(30), width: '100%'}}>
                        <Text style={[TASK_DATA_HEADER]}>{ translate('Itemization.Total')}</Text>

                        <Text style={TASK_DATA}>{this.getItemizationTotal()}</Text>
                    </View>

                    <ScrollView style={{ width: '100%'}}>
                        <View style={[styles.content, {flexDirection: 'column'}]}>

                            <BagsSummary
                                itemizationData={JSON.stringify(Object.keys(this.state.itemizationData).map(key => this.state.itemizationData[key]))}
                            />

                            <View style={hr} />

                            { this.props.task && this.props.task.meta && this.props.task.meta.missingBags && this.props.task.meta.missingBags.map((bag, index) => {
                                    return <View key={index} style={{ flexDirection: "column", width: '100%' }}>
                                        { bag.type === WASH_FOLD &&
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                <Image
                                                    source={ require('./../../../assets/icons/wf-disabled.png') }
                                                    style={BIG_ICON}
                                                />
                                                <Text style={[TASK_DATA_HEADER, { color: colors.errorColor }]}>
                                                    { "WF " + translate("task.bag") + " " + bag.code }
                                                </Text>
                                            </View>
                                        }

                                        { bag.type === DRY_CLEANING &&
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                <Image
                                                    source={ require('./../../../assets/icons/dc-disabled.png') }
                                                    style={BIG_ICON}
                                                />
                                                <Text style={[TASK_DATA_HEADER, { color: colors.errorColor }]}>
                                                    { "DC " + translate("task.bag") + " " + bag.code }
                                                </Text>
                                            </View>
                                        }

                                        { bag.items && bag.items.map((bagItem, index) => {
                                            return <View key={index} style={[{flexDirection: 'row'}]}>
                                                <Text style={[TASK_DATA, { flex: 0.1}]}></Text>
                                                <Text style={[TASK_DATA, { flex: 0.30}]}>
                                                    {translate(bagItem.type)}
                                                </Text>
                                                <Text style={[TASK_DATA, { flex: 0.2}]}>
                                                    {bagItem.quantity}
                                                </Text>
                                                <Text style={[TASK_DATA, { flex: 0.4}]}></Text>
                                            </View>
                                        })
                                        }
                                    </View>
                                })
                            }

                            { this.props.task && this.props.task.meta && this.props.task.meta.scannedBags && this.props.task.meta.scannedBags.map((bag, index) => {
                                    return <View key={index} style={{ flexDirection: "column", width: '100%' }}>
                                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                            <Image
                                                source={ bag.type === WASH_FOLD ? require('./../../../assets/icons/wf.png') : require('./../../../assets/icons/dc.png') }
                                                style={BIG_ICON}
                                            />
                                            <Text style={[TASK_DATA_HEADER, {paddingBottom: 0, lineHeight: fontSize(7) }]}>
                                                { (bag.type == WASH_FOLD ? "WF " : "DC ") + translate('task.bag') + " " + bag.code }
                                            </Text>
                                        </View>

                                        { bag.items && bag.items.map((bagItem, index) => {
                                            return <View key={index} style={[{flexDirection: 'row'}]}>
                                                    <Text style={[TASK_DATA, { flex: 0.15, padding: 0 }]}></Text>
                                                    <Text style={[TASK_DATA, { color: colors.dcItemizationColor, flex: 0.40, padding: 0 }]}>
                                                        {translate(bagItem.type)}
                                                    </Text>
                                                    <Text style={[TASK_DATA, { color: colors.dcItemizationColor, flex: 0.25, padding: 0 }]}>
                                                        {bagItem.quantity}
                                                    </Text>
                                                    <Text style={[TASK_DATA, { flex: 0.1, padding: 0 }]}>      </Text>
                                                </View>
                                            })
                                        }
                                    </View>

                                })
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
  }
}

const mapStateToProps = ({ dashboardData, signInDetails }) => {
  return {
      task:     dashboardData.task,
      products: signInDetails.products
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
      sendItemization: (itemizationData) => {
          return dispatch(actions.sendItemization(itemizationData));
      },
      sendItemizationAndSetStateToCleaning: (itemizationData) => {
          return dispatch(actions.sendItemizationAndSetStateToCleaning(itemizationData));
      },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Fulfillment);


