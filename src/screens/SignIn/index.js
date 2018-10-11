import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, Alert, Image, AsyncStorage, TouchableHighlight } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, LOGO, LOGO_WRAPPER, SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { API_BASE_URL } from "./../../constants/global.js";
import { styles } from './singin-style';
import { translate } from '../../locale';
import * as storage from '../../storage';
import Keyboard from '../../keyboard';
import { fontSize } from '../../constants/util';
import packageJson from '../../../package.json';

class SignIn extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
        noInternet: false,
        email: "d@example.com",
        password: "123123",
        disabled: true,
        spinner: false
    };
    
    this._onConfirm = this._onConfirm.bind(this);

    // enable autologin
    storage
        .loadAuthToken()
        .then(authToken => {
            if (authToken.length > 0) {
                this.setState({ spinner: true });
                this.setState({ noInternet: false });

                this.props
                    .sendAutoLoginRequest()
                    .then(response => {
                        if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('authToken')) {
                            storage.saveAuthToken(response.data.authToken);
                            storage.saveLoginId(response.data.user.id);
                            storage.saveDispatcher(response.data.user);

                            this.setState({ spinner: false });
                            this.props.navigation.navigate("Dashboard");
                        } else {
                            this.setState({ spinner: false });

                            if (response === undefined) {
                                this.setState({ noInternet: true });
                            }
                        }
                    })
                    .catch(() => {});
                }
            }
        )
        .catch(() => {});

    // populate the email
    storage.loadEmail().then(email => {this.setState({ email: email })});
  }

  _onConfirm() {
    this.setState({ spinner: true });
    this.setState({ noInternet: false });
    const { email, password } = this.state;

    // store the email
    storage.saveEmail(email);

    this.props
        .sendLoginRequest(email, password)
        .then(response => {
          if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('authToken')) {
              storage.saveAuthToken(response.data.authToken);
              storage.saveLoginId(response.data.user.id);
              storage.saveDispatcher(response.data.facility);

              this.setState({ spinner: false });
              this.props.navigation.navigate("Dashboard");
          } else {
              this.setState({ spinner: false });

              if (response == undefined) {
                  this.setState({ noInternet: true });
              }

              if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
                  Alert.alert(response.errors.userTitle, response.errors.userMessage);
              } else {
                  Alert.alert("", translate("Login.LoginFailed"));
              }
          }
        })
        .catch(() => {
            this.setState({ spinner: false })
        });
  }

  render() {
    const { disabled } = this.state;
    return (
          <View style={styles.container}>
              <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
              </View>

              <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

              <View style={styles.form}>
                    <TouchableHighlight onLongPress={() => {}} style={LOGO_WRAPPER} underlayColor={colors.white}>
                      <Image
                          source={require('./../../../assets/img/logo-dark.png')}
                          style={LOGO}
                          on
                          />
                    </TouchableHighlight>

                    <Text style={[styles.vertical_label]}>Dispatcher App{"\n"} v{packageJson.version}</Text>

                    <View style={styles.content}>
                        <TextInput
                            value={this.state.email}
                            underlineColorAndroid="transparent"
                            onChangeText={(email) => this.setState({email})}
                            placeholder={ translate('Login.Username') }
                            style={[styles.input]}
                            />
                    </View>

                    <View style={styles.content}>
                        <TextInput
                            secureTextEntry={true}
                            underlineColorAndroid="transparent"
                            onChangeText={(password) => this.setState({password: password})}
                            placeholder={ translate('Login.Password') }
                            style={[styles.input]}
                            />
                    </View>
              </View>

              <View style={SUBMIT}>
                  <Button text={translate("Login.Login")} onSubmit={this._onConfirm} height={fontSize(45)} fontSize={fontSize(15)}/>
              </View>
          </View>
    );
  }
}

const mapStateToProps = ({ signInDetails }) => {
  return { email: signInDetails.email };
};

const mapDispatchToProps = (dispatch) => {
  return {
      sendAutoLoginRequest: () => {
          return dispatch(actions.sendAutoLoginRequest());
      },

      sendLoginRequest: (email, password) => {
        return dispatch(actions.sendLoginRequest(email, password));
      },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);


