import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, PermissionsAndroid } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT } from "./../../constants/base-style.js";
import {dimensions, fontSize, isReadyToStock, isNotCompleted} from '../../constants/util';
import Keyboard     from "./../../components/Keyboard";
import { styles } from './style';
import { translate } from '../../locale';
import { BarcodePicker, ScanditModule, Barcode, ScanSettings } from 'scandit-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';
import * as storage from '../../storage';

class Dispatch extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
        task: null,
        shift: null
    };

    Promise.all([storage.loadFulfillment(), storage.loadShift()])
        .then(
            (values) => {
                this.setState({task: JSON.parse(values[0]), shift: JSON.parse(values[1])})
            }
        )
  }

  _dispatch = () => {
      if (this.state.task) {
          if (isReadyToStock(this.state.task, this.state.shift)) {
              this.props
                  .stockRequest(this.state.task.reference)
                  .then(
                        () => {
                            this.props.navigation.push("Scan");
                        }
                    );
          } else if (isNotCompleted(this.state.task)) {
              this.props.navigation.push("Scan");
          } else {
              this.props
                  .dispatchRequest(this.state.task.reference)
                  .then(
                      () => {
                          this.props.navigation.push("Scan");
                      }
                  );
          }
      }
  }

  render() {
    return (
      <View style={styles.container}>
          <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

          <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screenBackground }}>
              <Text style={{ fontSize: fontSize(14) }}>Do you really want to finish?</Text>
              <Text style={{ fontSize: fontSize(12) }}>{"\n"}</Text>
              <Text style={{ fontSize: fontSize(12) }}>Overview imcomplete orders</Text>

              {this.state.task &&
                <Text style={{ fontSize: fontSize(18), color: colors.dark }}>
                    { isReadyToStock(this.state.task, this.state.shift)
                        ? 'Stock'
                        : isNotCompleted(this.state.task)
                            ? 'Incomplete'
                            : this.state.task.rack
                    }
                </Text>
              }
          </View>

          <View style={SUBMIT}>
              <Swipeout style={[SUBMIT, {width: '100%'}]} right={[{text: translate("Dispatch.Dispatch"), onPress: () => this._dispatch()}]} buttonWidth={dimensions.width}>
                  <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", width: dimensions.width, height: "100%" }}>
                      <Text style={{ width: fontSize(8)}}> </Text>
                      <Text style={{ justifyContent: "center", alignItems: "center" }}>{ translate("Dispatch.Dispatch") }</Text>
                      <Icon name="ellipsis-v" size={fontSize(16)} style={{width: fontSize(8)}} color={colors.white} />
                  </View>
              </Swipeout>
          </View>
      </View>
    );
  }
}

const mapStateToProps = ({ data }) => {
    return { };
};

const mapDispatchToProps = (dispatch) => {
    return {
        stockRequest: (reference) => {
            return dispatch(actions.stockRequest(reference));
        },
        dispatchRequest: (reference) => {
            return dispatch(actions.dispatchRequest(reference));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dispatch);


