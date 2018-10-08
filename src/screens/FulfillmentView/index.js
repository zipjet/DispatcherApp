import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import * as types   from '../../actions/types';
import { Text, TextInput, View, Alert, Image, AsyncStorage, TouchableHighlight, ScrollView } from "react-native";
import { TASK_DATA, TASK_DATA_HEADER, HEADER, BIG_ICON, GRID, GRID_ITEM } from "./../../constants/base-style.js";
import Spinner from "react-native-loading-spinner-overlay";
import CustomButton from "./../../components/Button";
import { styles } from './style';
import { translate } from '../../locale';
import { colors, HeaderStyle, ContentWithHeaderStyle, SidebarStyle, ContentSmall, hr } from "./../../constants/base-style.js";
import { NavigationActions } from 'react-navigation'
import Prompt       from "./../../components/Dialog";
import Keyboard     from "./../../components/Keyboard";
import BagsSummary  from "./../../components/BagsSummary";
import store from '../../store';
import * as storage from '../../storage';
import GridView from 'react-native-super-grid';
import { fontSize } from '../../constants/util';
import { WASH_FOLD, SEGMENTATION_WF, LOCATION_PARIS, CATEGORY_WASH_AND_FOLD, DRY_CLEANING } from "../../constants/constants";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Select, Option } from "react-native-chooser";
import * as utils from '../../utils';

class FulfillmentView extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            spinner: false,
            addFaciltyComment: false,
            itemizationData: [],
            enableKeyboardListeners: true
        };

        this._onBack       = this._onBack.bind(this);
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

    _onPrintRunsheetClick = () => {
    }

    _onPrintClick = () => {
    }

    _onMenuItemClick = () => {
    }

  render() {
    const { disabled } = this.state;
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            <View style={[ HeaderStyle, {backgroundColor: colors.teal} ]}>
                <TouchableHighlight style={{height: '100%', justifyContent: 'center'}} onPress={this._onBack} underlayColor={colors.teal}>
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

                <TouchableHighlight style={{flex: 2, height: '100%', justifyContent: 'center'}} onPress={this._onPrintRunsheetClick} underlayColor={colors.teal}>
                    <Text style={[HEADER, {backgroundColor: colors.teal}]}>
                        <Icon name="print" size={fontSize(16)} color={colors.white}/>
                        { "  " + translate("Itemization.PrintRunsheet") }
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{flex: 1, height: '100%', justifyContent: 'center'}} onPress={this._onPrintClick} underlayColor={colors.teal}>
                    <Text style={[HEADER, {backgroundColor: colors.teal}]}>
                        <Icon name="print" size={fontSize(16)} color={colors.white}/>
                        { "  " + translate("Itemization.Print") }
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{flex: 1, height: '100%', justifyContent: 'center'}} onPress={() => { this.props.navigation.navigate("Fulfillment")}} underlayColor={colors.teal}>
                    <Text style={[HEADER, {backgroundColor: colors.teal}]}>
                        <Icon name="pencil" size={fontSize(16)} color={colors.white}/>
                        { "  " + translate("Itemization.Modify") }
                    </Text>
                </TouchableHighlight>

                <Select
                    onSelect = {this._onMenuItemClick}
                    defaultText  =""
                    indicatorIcon = {<Icon name="ellipsis-v" size={fontSize(16)} color={colors.white} />}
                    style = {[{ borderWidth: 0, backgroundColor: colors.teal, height: fontSize(24) }]}

                    textStyle = {{ lineHeight: fontSize(24), fontSize: 0}}
                    backdropStyle= {{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
                    optionListStyle = {{ backgroundColor : colors.teal, width: fontSize(0, 240), height: fontSize(0, 40), justifyContent: 'center', marginRight: fontSize(10), marginTop: fontSize(42) }}
                    selected= {<Icon name="ellipsis-v" size={fontSize(16)} color={colors.white} />}
                    transparent={ true }>
                        <Option key="menu.0" value="" styleText={{ color: colors.white }}>
                            { translate("settings.resetPrinters") }
                        </Option>
                </Select>
            </View>

            <View style={ ContentWithHeaderStyle }>
                <View style={ ContentSmall }>
                    <ScrollView style={{ width: '100%'}}>
                        <View style={{flexDirection: 'column', justifyContent: "space-between"}}>
                            <View style={[styles.content]}>
                                <BagsSummary
                                    itemizationData={JSON.stringify(Object.keys(this.state.itemizationData).map(key => this.state.itemizationData[key]))}
                                />
                            </View>

                            <View style={hr} />

                            <View style={[styles.content, {flexDirection: 'column', justifyContent: "space-between"}]}>
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
                                                { (bag.type == WASH_FOLD ? "WF " : "DC ") + translate("task.bag") + " " + bag.code }
                                            </Text>
                                        </View>
                                    </View>
                                })
                                }
                            </View>

                            { this.props.task.itemization.items.map((item, index) =>
                                { return item.quantity > 0 &&
                                    <View key={index} style={[GRID_ITEM, { height: fontSize(28), padding: fontSize(3), justifyContent: 'center', flexDirection: "row" }]}>
                                        <Text style={[TASK_DATA_HEADER, {flex: 1, alignContent: 'center', width: '100%'}]}>
                                            {item.name}
                                        </Text>

                                        <Text style={[TASK_DATA_HEADER, {width: fontSize(50), fontSize: fontSize(12), alignContent: 'center'}]}>
                                            {item.quantity}
                                        </Text>
                                    </View>
                                })
                            }
                        </View>
                    </ScrollView>
                </View>

                <Keyboard
                    showSpinner={() => {this.setState({spinner: true})}}
                    hideSpinner={() => {this.setState({spinner: false})}}

                    eventListener="onKeyDown"
                    navigation={this.props.navigation}
                />
            </View>

            <Prompt
                isDialogVisible={ this.state.addFaciltyComment }
                title={"Add comment"}
                message={""}
                hintInput={"Message"}
                submitInput={ (inputText) => { this._onAddFacilityComment(inputText) } }
                closeDialog={ () => {
                    this.setState({ addFaciltyComment: false})
                }}
                style={{ width: '50%', height: '50%' }}
            />
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
      addFacilityComment: (comment) => {
          return dispatch(actions.sendFacilityComment(comment));
      },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FulfillmentView);


