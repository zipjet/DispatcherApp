import React, { Component } from "react";
import { Text, View, StyleSheet, TouchableHighlight } from "react-native";
import { colors } from './../../constants/base-style.js';

export default class Button extends Component {
  constructor(props) {
    super(props);

    this.state = {
        disabled: this.props.disabled || false,
        backgroundColor: this.props.backgroundColor || false,
        hoverColor: this.props.hoverColor || false,
        color: this.props.color || false,
        fontSize: this.props.fontSize || false,
        borderColor: this.props.borderColor || false,
        borderWidth: this.props.borderWidth || false,
        height: this.props.height || false,
    };

    this._onSubmit = this._onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.disabled !== this.props.disabled) {
          this.setState({ disabled: nextProps.disabled });
      }
  }

  _onSubmit() {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.props.text);
    }
  }

  render() {
    const { disabled, backgroundColor, color, fontSize, borderColor, borderWidth, height, hoverColor } = this.state;
    const { text, borderBottomWidth } = this.props;

    return (
      <View style={[styles.btnWrapper, borderColor ? {borderColor: borderColor} : '', borderBottomWidth ? {borderBottomWidth: borderBottomWidth} : '', borderWidth ? {borderWidth: borderWidth} : '', height ? {height: height + 2} : '']}>
        <TouchableHighlight
            disabled={disabled}
            style={[styles.btn,disabled ? styles.disabled : "", backgroundColor ? {backgroundColor: backgroundColor}: "", height ? {height: height} : '']}
            underlayColor={hoverColor ? hoverColor : colors.dark}
            text={text}
            onPress={this._onSubmit}>
                <Text style={[
                    styles.btnText,
                    color ? {color: color}: "",
                    fontSize ? {fontSize: fontSize, lineHeight: fontSize} : "",
                    fontSize && height ? {marginTop: (height - fontSize) / 2} : ""]}>
                    {text}
                </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  btnWrapper: {
    flex: 1,
    justifyContent: "center",
    width: '100%',
  },

  btn: {
      backgroundColor: colors.coral,
      alignItems: "center",
  },

  disabled: {
    backgroundColor: colors.blueGrey
  },

  btnText: {
      fontFamily: "WorkSans-Regular",
      fontSize: 16,
      lineHeight: 16,
      color: colors.white,
      marginTop: 5,
      marginBottom: 5,
  }
});
