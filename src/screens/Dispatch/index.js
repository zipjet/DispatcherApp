import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, TouchableHighlight, PermissionsAndroid } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT, HeaderStyle, HEADER } from "./../../constants/base-style.js";
import { dimensions, fontSize, isReadyToStock, isNotCompleted, isTaskDispatched, hasItemizationIssues, getTaskIssues, getShift, isDispatchingForMultipleShifts } from '../../constants/util';
import { styles } from './style';
import { translate } from '../../locale';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';
import Menu from "./../../components/Menu";
import * as storage from '../../storage';
import moment from 'moment';
import { DropDownHolder } from './../../components/DropdownHolder';
import { DATE_FORMAT } from "../../constants/constants";

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
        dispatcher: null,

        errorOverwrite: false
    };
  }

  componentDidMount() {
    Promise.all([storage.loadFulfillment(), storage.loadShift(), storage.loadBarcode(), storage.loadDispatcher()])
        .then(
            (values) => {
                this.setState({
                    task: JSON.parse(values[0]),
                    shift: JSON.parse(values[1]),
                    barcode: values[2],
                    dispatcher: JSON.parse(values[3])
                })
            }
        )
  }

  _dispatch = () => {
      let redirectPage = this.props.page !== undefined ? this.props.page : 'Scan';

      if (this.state.task) {
          if (isReadyToStock(this.state.task, this.state.shift)) {
              this.props
                  .stockRequest(this.state.task.reference)
                  .then(
                        () => {
                            DropDownHolder.alert('success', 'Success', 'The dispatch has completed successfully');

                            this.props.navigation.navigate(redirectPage);
                        }
                    );
          } else if (isNotCompleted(this.state.task)) {
              DropDownHolder.alert('success', 'Success', 'The dispatch has completed successfully');

              this.props.navigation.push(redirectPage);
          } else if (hasItemizationIssues(this.state.task)) {
              DropDownHolder.alert('success', 'Success', 'The dispatch has completed successfully');

              this.props.navigation.push(redirectPage);
          } else {
              this.props
                  .dispatchRequest(this.state.task.reference)
                  .then(
                      () => {
                          DropDownHolder.alert('success', 'Success', 'The dispatch has completed successfully');

                          this.props.navigation.push(redirectPage);
                      }
                  );
          }
      }
  }

  render() {
    let correctShift = this.state.task && getShift(moment(this.state.task.cleaningDueDate, DATE_FORMAT));

    return (
      <View style={[styles.container]}>
          <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

          <View style={ HeaderStyle }>
              <Menu
                  indicatorColor={colors.dark}
                  navigation={this.props.navigation}
                  storage={storage}
              />

              <View style={HEADER}>
                  <Text style={{fontSize: fontSize(13)}}>{this.state.task !== null && this.state.task.reference.substring(0, this.state.task.reference.length - 2)}</Text>
              </View>

              <View style={{width: fontSize(30)}}>
                  <TouchableHighlight onPress={() => { this.props.navigation.push("OrderDetails") }} underlayColor={colors.screenBackground}>
                    <Icon name="info-circle" size={fontSize(20)} color={colors.teal} />
                  </TouchableHighlight>
              </View>
          </View>

          <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', alignContent: 'center', backgroundColor: colors.screenBackground }}>

              {this.state.task &&
                  <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', alignContent: 'center' }}>
                      <Text style={{ fontSize: fontSize(14), textAlign: 'center' }}>Rack</Text>

                      <Text style={{ fontSize: fontSize(14) }}>{"\n"}</Text>

                        <Text style={{ textAlign: 'center', fontSize: fontSize(20), color: colors.dark }}>
                            { isReadyToStock(this.state.task, this.state.shift) &&
                                'Stock'
                            }

                            { isReadyToStock(this.state.task, this.state.shift) === false && isDispatchingForMultipleShifts(this.state.task, this.state.shift, this.state.dispatcher) &&
                                <Text style={{ textAlign: 'center', fontSize: fontSize(20), color: colors.dark }}>
                                    { correctShift.dayLabel + " " + correctShift.shiftLabel + "\n"}
                                </Text>
                            }

                            { isReadyToStock(this.state.task, this.state.shift) === false && isTaskDispatched(this.state.task) === false && (isNotCompleted(this.state.task) || hasItemizationIssues(this.state.task)) &&
                                'Incomplete \n'
                            }

                            { isReadyToStock(this.state.task, this.state.shift) === false &&
                                <Text style={{ textAlign: 'center', fontSize: fontSize(26), color: colors.dark }}>
                                    {(this.state.task.rack !== undefined) ? this.state.task.rack : 'N/A'}
                                </Text>
                            }

                            { this.state.task && this.state.task.corporate !== undefined && this.state.task.corporate.name !== undefined &&
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: fontSize(14), color: colors.dark }}>
                                    {"\n"} !! CORPORATE !!
                                </Text>
                            }
                        </Text>
                  </View>
              }
          </View>

          { this.state.task && getTaskIssues(this.state.task) &&
                <View style={{ width: '100%', alignContent: 'center', justifyContent: "center", alignItems: 'center', flexDirection: 'column', marginBottom: fontSize(10) }}>

                    <Text style={{ fontSize: fontSize(12), fontWeigth: 'bold' }}>Missing Items</Text>

                    { getTaskIssues(this.state.task, true).map(
                        (issue) => {
                            return <Text key={issue} style={[{fontSize: fontSize(8)}]}>{issue}</Text>
                        }
                    )}
                </View>
          }

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

const mapStateToProps = ({ scanData }) => {
    return {
        page: scanData.page
    };
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


