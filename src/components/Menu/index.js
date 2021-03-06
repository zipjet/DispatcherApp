import React, { Component } from "react";
import { Text, TextInput, View, Image, Alert, TouchableHighlight } from "react-native";
import { colors, LOGO, LOGO_WRAPPER, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { fontSize } from '../../constants/util';
import { Select, Option } from "../Select";
import { Scan } from "../../screens/Scan";
import Icon from 'react-native-vector-icons/FontAwesome';
import packageJson from '../../../package.json';
import { StackActions, NavigationActions } from 'react-navigation';
import { ScannerHolder } from './../../components/ScannerHolder';
import navigator from '../../navigator';

class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {modalVisible: null}
    }

    changePage(url) {
        ScannerHolder.hideScanner();

        if (this.props.navigation) {
            this.props.navigation.navigate(url);
        } else {
            navigator.navigate(url);
        }
    }

    goToListing = () => {
        this.setState({modalVisible: false});
        this.changePage("DashboardOrders");
    }

    goToStockListing = () => {
        this.setState({modalVisible: false});
        this.changePage("Stock");
    }

    goToDispatchFinish = () => {
        this.setState({modalVisible: false});
        this.changePage("DispatchFinish");
    }

    goToScan = () => {
        ScannerHolder.showScanner();
        this.setState({modalVisible: false});
    }

    goToSearch = () => {
        this.setState({modalVisible: false});
        this.changePage("Search");
    }

    goToDriversList = () => {
        this.setState({modalVisible: false});
        this.changePage("DriversList");
    }

    logout = () => {
        this.setState({modalVisible: false});

        this.props.storage.saveAuthToken("");
        this.props.storage.saveLoginId("");
        this.props.storage.saveDispatcher("");

        // log out
        navigator.forcePush("SignIn");
    }

    render() {
        return <Select
                    min={true}
                    visible={this.state.modalVisible}
                    indicatorIcon = {<Icon name="bars" size={fontSize(16)} color={this.props.indicatorColor} />}
                    style = {[{ borderWidth: 0, backgroundColor: colors.backgroundColor, height: fontSize(36), width: fontSize(36), padding: fontSize(10) }]}

                    textStyle = {{ lineHeight: fontSize(16), fontSize: 0 }}
                    backdropStyle= {{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
                    optionListStyle = {{ borderColor: colors.blueGrey, borderWidth: 1, backgroundColor : colors.screenBackground, width: "65%", height: "100%", justifyContent: 'flex-start', marginRight: "35%", marginTop: fontSize(0) }}
                    transparent={ true }
                    >
                        <View style={[ContentCentered, {height: fontSize(350), backgroundColor: colors.screenBackground}]}>
                            <View style={LOGO_WRAPPER}>
                                <Image
                                    source={require('./../../../assets/img/logo-dark.png')}
                                    style={[LOGO, {height: '100%', marginTop: fontSize(10)}]}
                                />

                                <Text style={{textAlign: 'center', fontSize: fontSize(8), marginTop: fontSize(-10)}}>Dispatcher App v{packageJson.version}</Text>
                            </View>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground, padding: 0}]}>
                                <Text></Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToScan()}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground}]}>
                                <Text>Start Scanning</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToSearch()}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground}]}>
                                <Text>Search</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToListing()}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground}]}>
                                <Text>Dispatch List</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToDriversList()}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground}]}>
                                <Text>Drivers List</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToStockListing()}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground}]}>
                                <Text>Stock List</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToDispatchFinish()}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground}]}>
                                <Text>Finish Dispatching</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.logout()}} style={[ContentRow, {paddingTop: fontSize(4), paddingBottom: fontSize(4), backgroundColor: colors.screenBackground}]}>
                                <Text>Log Out</Text>
                            </TouchableHighlight>
                        </View>
                </Select>
    }
}

export default Menu;
