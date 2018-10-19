import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, PermissionsAndroid } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT, HeaderStyle, HEADER } from "./../../constants/base-style.js";
import {dimensions, fontSize, isReadyToStock, isNotCompleted} from '../../constants/util';
import { styles } from './style';
import { translate } from '../../locale';
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
        shift: null,
        barcode: null,
        errorOverwrite: false
    };

    Promise.all([storage.loadFulfillment(), storage.loadShift(), storage.loadBarcode()])
        .then(
            (values) => {
                this.setState({
                    task: JSON.parse(values[0]),
                    shift: JSON.parse(values[1]),
                    barcode: values[2]
                })
            }
        )
  }

  _getOtherBagsBarcodes = () => {
      return this.state.task && this.state.task.meta.scannedAtHub
          .filter(
              (bag) => { return bag.code !== this.state.barcode; }
          )
          .map(
              (bag) => { return bag.code + "\n" }
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

          <View style={ HeaderStyle }>
              <View style={{width: fontSize(60)}}/>

              <View style={HEADER}>
                  <Text style={{fontSize: fontSize(13)}}>{this.state.task !== null && this.state.task.reference.substring(0, this.state.task.reference.length - 2)}</Text>
              </View>

              <View style={{width: fontSize(60)}}/>
          </View>

          <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screenBackground }}>
              <Text style={{ fontSize: fontSize(14) }}>Rack</Text>

              <Text style={{ fontSize: fontSize(14) }}>{"\n\n"}</Text>

              {this.state.task &&
                  <View>
                    <Text style={{ fontSize: fontSize(18), color: colors.dark }}>
                        { isReadyToStock(this.state.task, this.state.shift) &&
                            'Stock'
                        }

                        { isReadyToStock(this.state.task, this.state.shift) === false && isNotCompleted(this.state.task) &&
                            'Incomplete \n' + this.state.task.rack
                        }

                        { isReadyToStock(this.state.task, this.state.shift) === false && isNotCompleted(this.state.task) === false &&
                            this.state.task.rack
                        }
                    </Text>

                    { this._getOtherBagsBarcodes().length &&
                        <View style={{ alignItems: 'center', marginTop: fontSize(20) }}>
                            <Text style={{ fontWeight: 'bold', fontSize: fontSize(14), color: colors.dark }}>Other bags {'\n'}</Text>
                            <Text style={{ textAlign: 'center', fontSize: fontSize(12), color: colors.dark }}>
                                { this._getOtherBagsBarcodes() }
                            </Text>
                        </View>
                    }
                  </View>
              }
          </View>

          <View style={SUBMIT}>
              <Swipeout style={[SUBMIT, {width: '100%'}]} right={[{text: translate("Dispatch.Dispatched"), onPress: () => this._dispatch(), backgroundColor: colors.coral}]} buttonWidth={dimensions.width}>
                  <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", width: dimensions.width, height: "100%", backgroundColor: colors.coralLight }}>
                      <Text style={{ width: fontSize(8)}}> </Text>
                      <Text style={{ justifyContent: "center", alignItems: "center" }}>{ translate("Dispatch.Dispatched") }</Text>
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


