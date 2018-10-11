import React, { Component } from "react";
import { Text, TextInput, View, Image, Alert, TouchableHighlight } from "react-native";
import { colors, LOGO, LOGO_WRAPPER, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { fontSize } from '../../constants/util';
import { Select, Option } from "react-native-chooser";
import Icon from 'react-native-vector-icons/FontAwesome';
import packageJson from '../../../package.json';

class Menu extends React.Component {

    render() {
        return <Select
            onSelect = {this._onShiftSelect}
            indicatorIcon = {<Icon name="bars" size={fontSize(16)} color={colors.dark} />}
            style = {[{ borderWidth: 0, backgroundColor: colors.backgroundColor, height: fontSize(24), width: fontSize(30) }]}

            textStyle = {{ lineHeight: fontSize(16), fontSize: 0 }}
            backdropStyle= {{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
            optionListStyle = {{ backgroundColor : colors.screenBackground, width: "65%", height: "100%", justifyContent: 'center', marginRight: "35%", marginTop: fontSize(0) }}
            selected= {<Icon name="bars" size={fontSize(16)} color={colors.dark} />}
            transparent={ true }>
                <View style={ContentCentered}>
                    <TouchableHighlight onPress={() => {}} style={LOGO_WRAPPER}>
                        <View>
                            <Image
                                source={require('./../../../assets/img/logo-dark.png')}
                                style={[LOGO, {height: '60%'}]}
                            />

                            <Text>Dispatcher App v{packageJson.version}</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight onPress={() => {}}>
                        <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                            <Text>Dispatch List</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight onPress={() => {}}>
                        <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                            <Text>Finish Dispatching</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight onPress={() => {}}>
                        <View style={[ContentRow, {backgroundColor: colors.screenBackground}]}>
                            <Text>Log Out</Text>
                        </View>
                    </TouchableHighlight>
                </View>
        </Select>
    }
}

export default Menu;
