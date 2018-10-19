import React, { Component } from "react";
import { Text, View, StyleSheet, TouchableHighlight } from "react-native";
import { colors, SUBMIT } from './../../constants/base-style.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';
import { fontSize } from '../../constants/util';
import { translate } from '../../locale';

export default class DispatchButton extends Component {

  constructor(props) {
    super(props);

    this.state = {
        disabled: this.props.disabled || false,
    };
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.disabled !== this.props.disabled) {
          this.setState({ disabled: nextProps.disabled });
      }
  }

  goToDispatchFinish = () => {
      this.props.navigation.push("DispatchFinish");
  }

  render() {
    return (
        <Swipeout style={[SUBMIT, {width: this.props.width}]} right={[{text: translate("Scan.Finish"), onPress: () => { this.goToDispatchFinish() }}]} buttonWidth={this.props.width}>
            <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", width: this.props.width, height: "100%" }}>
                <Text style={{ width: fontSize(8)}}> </Text>
                <Text style={{ justifyContent: "center", alignItems: "center" }}>{translate("Scan.Finish")}</Text>
                <Icon name="ellipsis-v" size={fontSize(16)} style={{width: fontSize(8)}} color={colors.white} />
            </View>
        </Swipeout>
    );
  }
}