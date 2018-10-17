import React, { Component } from "react";
import { Text, TextInput, View, Image, Alert, TouchableHighlight } from "react-native";
import { colors, LOGO, LOGO_WRAPPER, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { fontSize } from '../../constants/util';
import { Select, Option } from "../Select";
import Icon from 'react-native-vector-icons/FontAwesome';
import packageJson from '../../../package.json';
import { StackActions, NavigationActions } from 'react-navigation';

class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {modalVisible: null}
    }

    goToListing = () => {
        this.setState({modalVisible: false});
        this.props.navigation.push("Dashboard");
        // this.props.navigation.push("OrdersList");
    }

    goToDispatchFinish = () => {
        this.setState({modalVisible: false});
        this.props.navigation.push("DispatchFinish");
    }

    logout = () => {
        this.setState({modalVisible: false});

        this.props.storage.saveAuthToken("");
        this.props.storage.saveLoginId("");
        this.props.storage.saveDispatcher("");

        // log out
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: "SignIn"})
            ]
        })

        this.props.navigation.dispatch(resetAction)
    }

    render() {
        return <Select
                    min={true}
                    visible={this.state.modalVisible}
                    indicatorIcon = {<Icon name="bars" size={fontSize(16)} color={colors.dark} />}
                    style = {[{ borderWidth: 0, backgroundColor: colors.backgroundColor, height: fontSize(16), padding: 0, width: fontSize(30) }]}

                    textStyle = {{ lineHeight: fontSize(16), fontSize: 0 }}
                    backdropStyle= {{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
                    optionListStyle = {{ backgroundColor : colors.screenBackground, width: "65%", height: "100%", justifyContent: 'flex-start', marginRight: "35%", marginTop: fontSize(0) }}
                    transparent={ true }>
                        <View style={[ContentCentered, {height: fontSize(210), backgroundColor: colors.screenBackground}]}>
                            <View style={LOGO_WRAPPER}>
                                <Image
                                    source={require('./../../../assets/img/logo-dark.png')}
                                    style={[LOGO, {height: '100%', marginTop: fontSize(10)}]}
                                />

                                <Text style={{textAlign: 'center', fontSize: fontSize(8), marginTop: fontSize(-3)}}>Dispatcher App v{packageJson.version}</Text>
                            </View>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {}} style={[ContentRow, {backgroundColor: colors.screenBackground, padding: 0}]}>
                                <Text></Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToListing()}} style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                <Text>Dispatch List</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.goToDispatchFinish()}} style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                <Text>Finish Dispatching</Text>
                            </TouchableHighlight>

                            <TouchableHighlight underlayColor={colors.screenBackground} onPress={() => {this.logout()}} style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                                <Text>Log Out</Text>
                            </TouchableHighlight>
                        </View>
                </Select>
    }
}

export default Menu;
