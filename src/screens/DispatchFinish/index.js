import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, PermissionsAndroid, FlatList } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT, hr } from "./../../constants/base-style.js";
import {dimensions, fontSize, isReadyToStock, isNotCompleted} from '../../constants/util';
import { styles } from './style';
import { translate } from '../../locale';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';
import OrderIssuesCard from "../../components/OrderIssuesCard";
import * as storage from '../../storage';

class Dispatch extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
        spinner: false
    }
  }

  _getErrors = () => {
      let issues = {};

      for (let i = 0; i < this.props.tasks.length; i++) {
          let task = this.props.tasks[i];

          issues[task.reference] = task;
          issues[task.reference].issues = [];

          // search for missing bags
          for (let j = 0; j < task.meta.bags.length; j++) {
              let bagFound = false;

              for (let k = 0; k < task.meta.scannedAtHub.length; k++) {
                  if (task.meta.bags[j].code === task.meta.scannedAtHub[k].code) {
                      bagFound = true;
                  }
              }

              if (bagFound === false) {
                  issues[task.reference].issues.push('Missing: ' + task.meta.bags[j].code);
              }
          }

          // search for missing items
          let taskItemization = [];

          for (let j = 0; j < task.itemization.items.length; j++) {
              let itemizationItem = task.itemization.items[j];

              taskItemization[itemizationItem.name] = itemizationItem.quantity;
          }

          for (let k = 0; k < task.meta.scannedAtHub.length; k++) {
              for (let j = 0; j < task.meta.scannedAtHub[k].dispatcherItemizationItems.length; j++) {
                  let itemizationItem = task.meta.scannedAtHub[k].dispatcherItemizationItems[j];

                  taskItemization[itemizationItem.productName] -= itemizationItem.quantity;
              }
          }

          Object.keys(taskItemization).map(
              (key) => {
                  if (taskItemization[key] > 0) {
                      issues[task.reference].issues.push('Missing: ' + taskItemization[key] + " " + key);
                  }
              }
          )

          // search for not dispatched stuff

          if (task.meta.dispatched === false && issues[task.reference] === undefined) {
              issues[task.reference].issues.push('Not dispatched !');
          }
      }

      return Object.values(issues).filter(
          (task) => { return task.issues.length > 0 }
      );
  }

  _allDispatch = () => {
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

  keyExtractor = (item) => item.reference;

  render() {
    return (
      <View style={styles.container}>
          <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

          <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', alignContent: 'center', backgroundColor: colors.screenBackground }}>
              <Text style={{ fontSize: fontSize(12) }}>Do you really want to finish?</Text>
              <Text style={{ fontSize: fontSize(7), marginBottom: fontSize(5) }}>Overview incomplete orders</Text>

              { this._getErrors().length > 0 &&
                  <View style={{height: '60%', width: '80%'}}>
                      <View style={{ height: fontSize(28), paddingLeft: fontSize(10), paddingRight: fontSize(10), flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                          <View style={[styles.headingLeftItems, {flex: 0.2}]}>
                              <Text style={{ fontSize: fontSize(8), color: colors.dark }}>Order</Text>
                          </View>

                          <View style={[styles.headingLeftItems, { flex: 0.5, height: '100%', alignItems: 'center', justifyContent: 'center'}]}>
                              <Text style={{ fontSize: fontSize(8), color: colors.dark }}>Location</Text>
                          </View>

                          <View style={[styles.headingLeftItems, { flex: 0.3, height: '100%', alignItems: 'center', justifyContent: 'center'}]}>
                              <Text style={[{fontSize: fontSize(8), color: colors.dark}]}>Issues</Text>
                          </View>
                      </View>

                      <FlatList
                          ItemSeparatorComponent={
                              () => <View style={hr} />
                          }
                          data={this._getErrors()}
                          keyExtractor={this.keyExtractor}
                          renderItem={
                              ({item}) => <OrderIssuesCard
                                  item={item}
                                  key={item.reference}
                                  navigation={this.props.navigation}
                              />
                          }
                      />
                  </View>
              }
          </View>

          <View style={SUBMIT}>
              <Button text="No" style={{flex: 1}} onSubmit={() => { this.props.navigation.push('Dashboard') }} height={fontSize(45)} fontSize={fontSize(15)}/>

              <Swipeout style={[SUBMIT, {width: dimensions.width / 2}]} right={[{text: "Yes", onPress: () => this._allDispatch()}]} buttonWidth={dimensions.width / 2}>
                  <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", width: dimensions.width / 2, height: "100%" }}>
                      <Text style={{ width: fontSize(8)}}> </Text>
                      <Text style={{ justifyContent: "center", alignItems: "center" }}>Yes</Text>
                      <Icon name="ellipsis-v" size={fontSize(16)} style={{width: fontSize(8)}} color={colors.white} />
                  </View>
              </Swipeout>
          </View>
      </View>
    );
  }
}

const mapStateToProps = ({ dashboardData }) => {
    return { tasks: dashboardData.tasks };
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


