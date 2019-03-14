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
import { ScannerHolder } from "./../../components/ScannerHolder";
import * as types   from '../../actions/types';
import store from '../../store';
import { fontSize } from '../../constants/util';
import timer from 'react-native-timer';
import OrderCard from "./../../components/OrderCard";
import * as storage from '../../storage';
import { SearchBar } from 'react-native-elements'

class Search extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            tasks: [],
            token: '',
            modalVisible: false
        };
    }

    // add the listener
    componentWillMount() {
        store.dispatch({type: types.SAVE_HOMEPAGE, page: "Search"});

        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                timer.setInterval(
                    "refreshSearchResults",
                    () => {
                        this._loadSearchResults(this.state.token);
                    },
                    60000
                );

                this._loadSearchResults(this.state.token);
            }
        );

        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                if (timer.intervalExists("refreshSearchResults")) {
                    timer.clearInterval("refreshSearchResults");
                }
            }
        );
    }

    // to remove the listener
    componentWillUnmount() {
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    _loadSearchResults = (token) => {
        this.setState({ noInternet: false });

        if (token.length < 5) {
            return;
        }

        this.props
            .searchReferenceRequest(token)
            .then(response => {
                this.setState({ spinner: false });

                if (response && response.hasOwnProperty('data')) {
                    this.setState({tasks: response.data});
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

                    <View style={[HEADER, {flex: 1}]}>
                        <SearchBar
                            round
                            searchIcon={{ size: 24 }}
                            onChangeText={this._loadSearchResults}
                            onClear={this._loadSearchResults}
                            placeholder='Reference or barcode... 5+ chars'
                            lightTheme={true}
                            containerStyle={{backgroundColor: colors.screenBackground}}
                            clearIcon={{ color: 'red' }}
                            />
                    </View>
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
                            style={{flex: 1, width: '90%', marginLeft: '5%'}}
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
                            <Button text={translate("Scan.Start")} onSubmit={() => { ScannerHolder.showScanner() }} height={fontSize(45)} fontSize={fontSize(15)}/>
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
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);


