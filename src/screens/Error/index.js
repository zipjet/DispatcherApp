import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, Alert, Image, AsyncStorage } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors } from "./../../constants/base-style.js";
import { styles } from './style';
import { translate } from '../../locale';

class Error extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      disabled: true,
      spinner: false
    };
    
    this._onConfirm = this._onConfirm.bind(this);

    // load stored data
    this._retrieveData();
  }

  _onConfirm() {
    this.setState({ spinner: true });
    const { email, password } = this.state;

    // store the email
    this._storeData(email);

    this.props
        .sendLoginRequest(email, password)
        .then(response => {
          this.setState({ spinner: false });

          if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('authToken')) {
            this.props.navigation.navigate("DashboardOrders");
          } else {
            if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
              Alert.alert(response.errors.userTitle, response.errors.userMessage);
            } else {
            }
          }
        }
    );
  }

  _clearPassword = () => {
    this.setState({ password: '' });
  }

  _storeData = async (email) => {
        try {
            await AsyncStorage.setItem('Login:email', email);
        } catch (error) {
        }
  }

  _retrieveData = async () => {
        try {
          const value = await AsyncStorage.getItem('Login:email');

          if (value !== null) {
              this.setState({ email: value });
          }
        } catch (error) {
        }
  }

  render() {
    const { disabled } = this.state;
    return (
      <View style={styles.container}>
        <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />
        <View style={styles.form}>
          <Image
              source={require('./../../../assets/img/logo-dark.png')}
              style={[styles.logo]}
              />
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({ signInDetails }) => {
  return { email: signInDetails.email, password: signInDetails.password };
};

const mapDispatchToProps = (dispatch) => {
  return {
      sendLoginRequest: (email, password) => {
        return dispatch(actions.sendLoginRequest(email, password));
      }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Error);


