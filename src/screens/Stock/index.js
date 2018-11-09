import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight, StatusBar } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE, HEADER, hr } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import Button from "./../../components/Button";
import Menu from "./../../components/Menu";
import moment       from "moment";
import * as types   from '../../actions/types';
import store from '../../store';
import { dimensions, fontSize, getShift, getStockOrders, getNewOrders, getNotCompleteOrders, isTaskDispatched } from '../../constants/util';
import timer from 'react-native-timer';
import { Select, Option } from "./../../components/Select";
import Icon from 'react-native-vector-icons/FontAwesome';
import DispatchButton from "./../../components/DispatchButton";
import OrderCard from "./../../components/OrderCard";
import * as storage from '../../storage';

class Stock extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            tasks: [],
            modalVisible: false
        };
    }

    // add the listener
    componentWillMount() {
        store.dispatch({type: types.SAVE_HOMEPAGE, page: "Stock"});

        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                timer.setInterval(
                    "refreshStock",
                    () => {
                        this._loadStockTasks();
                    },
                    60000
                );

                this._loadStockTasks();
            }
        );

        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                if (timer.intervalExists("refreshStock")) {
                    timer.clearInterval("refreshStock");
                }
            }
        );
    }

    // to remove the listener
    componentWillUnmount() {
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    _loadStockTasks = (timespan) => {
        this.setState({ noInternet: false });

        this.props
            .loadStockTasksRequest()
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

    keyExtractor = (item) => { return item.reference + item.meta.dispatched; }


















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

                    <View style={HEADER}>
                        <Text style={{fontSize: fontSize(13)}}>{this.state.tasks.length} Stock Orders</Text>
                    </View>

                    <View style={{ width: fontSize(30) }}></View>
                </View>

                <View style={[NO_INTERNET_BAR]}>
                    {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
                </View>

                <View style={[ ContentWithHeaderStyle ]}>
                    <View style={ContentCentered}>
                        <FlatList
                            ItemSeparatorComponent={
                                () => <View style={hr} />
                            }
                            style={{flex: 1, width: '80%', marginLeft: '10%'}}
                            data={ this.state.tasks }
                            keyExtractor={this.keyExtractor}
                            renderItem={
                                ({item}) => <OrderCard
                                    item={item}
                                    key={item.reference + item.meta.dispatched}
                                    navigation={this.props.navigation}
                                />
                            }
                        />

                        <View style={SUBMIT}>
                            <Button text={translate("Scan.Start")} onSubmit={() => { this.props.navigation.navigate('Scan') }} height={fontSize(45)} fontSize={fontSize(15)}/>
                        </View>
                    </View>

                </View>
            </View>
        );
    }
}

const mapStateToProps = ({ stockData }) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchReferenceRequest: (reference) => {
            return dispatch(actions.searchReferenceRequest(reference));
        },
        loadStockTasksRequest: () => {
            return dispatch(actions.loadStockTasksRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Stock);


