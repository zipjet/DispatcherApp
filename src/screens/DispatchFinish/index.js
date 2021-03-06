import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, PermissionsAndroid, FlatList } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT, hr } from "./../../constants/base-style.js";
import {dimensions, fontSize, isReadyToStock, getTaskIssues} from '../../constants/util';
import { styles } from './style';
import { translate } from '../../locale';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';
import OrderIssuesCard from "../../components/OrderIssuesCard";
import OrderCard from "../../components/OrderCard";
import * as storage from '../../storage';

class Dispatch extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
        spinner: false,
        success: false
    }
  }

  _getErrors = () => {
      let issues = {};

      for (let i = 0; i < this.props.tasks.length; i++) {
          let task = this.props.tasks[i];

          issues[task.reference] = task;
          issues[task.reference].issues = getTaskIssues(task);

          // search for not dispatched stuff
          if (task.meta.dispatched === false && issues[task.reference] === undefined) {
              issues[task.reference].issues.push('Not dispatched !');
          }
      }

      let orderIssues = Object.values(issues)
          .filter(
              (task) => { return task.meta.dispatched === false }
          );

      return orderIssues;
  }

  _allDispatch = () => {
      let issues = this._getErrors();
      let issuesRefs = issues.map((issue) => { return issue.reference; }).join(',');

      this.setState({spinner: true});

      this.props.dispatchBulkRequest(issuesRefs)
          .then(() => {
                this.setState({spinner: false});
                this.setState({success: true});
          });
  }

  keyExtractor = (item) => item.reference;

  render() {
      let tableContentData = this._getErrors();
      tableContentData.unshift({reference: "0"}, {reference: "1"});

      return (
        <View style={{flex: 1, padding: 0}}>
            { this._getErrors().length > 0 && this.state.success === false &&
              <View style={styles.container}>
                  <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', alignContent: 'center', backgroundColor: colors.screenBackground }}>
                      <FlatList
                          style={{flex: 1, width: '100%'}}
                          stickyHeaderIndices={[0, 1]}
                          ItemSeparatorComponent={
                              () => { return <View style={hr} /> }
                          }
                          data={tableContentData}
                          keyExtractor={this.keyExtractor}
                          renderItem={
                              (item, index) => <View key={item.reference} style={{width: '100%'}}>
                                    { item.item.reference === "0" &&
                                        <View style={{width: '100%', height: fontSize(68), backgroundColor: colors.screenBackground, justifyContent: 'center', flexDirection: 'column', alignContent: 'center', padding: fontSize(30)}}>
                                            <Text style={{ textAlign: 'center', width: '100%', fontSize: fontSize(12), color: colors.dark }}>Do you really want to finish?</Text>
                                            <Text style={{ textAlign: 'center', width: '100%', fontSize: fontSize(7), marginBottom: fontSize(5) }}>Overview incomplete orders</Text>
                                        </View>
                                    }

                                    { item.item.reference === "1" &&
                                        <View style={{ height: fontSize(28), backgroundColor: colors.screenBackground, flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                                            <View style={[styles.headingLeftItems, {flex: 0.2, alignItems: 'center', justifyContent: 'center'}]}>
                                                <Text style={{ fontSize: fontSize(8), color: colors.dark }}>Order</Text>
                                            </View>

                                            <View style={[styles.headingLeftItems, { flex: 0.5, height: '100%', alignItems: 'center', justifyContent: 'center'}]}>
                                                <Text style={{ fontSize: fontSize(8), color: colors.dark }}>Location</Text>
                                            </View>

                                            <View style={[styles.headingLeftItems, { flex: 0.3, height: '100%', alignItems: 'center', justifyContent: 'center'}]}>
                                                <Text style={[{fontSize: fontSize(8), color: colors.dark}]}>Missing/Bag</Text>
                                            </View>
                                        </View>
                                    }

                                    { item.item.reference.length > 1 &&
                                        <OrderIssuesCard
                                          item={item.item}
                                          navigation={this.props.navigation}
                                        />
                                    }
                              </View>
                          }
                      />
                  </View>

                  <View style={SUBMIT}>
                      <Button text="No" style={{flex: 1}} onSubmit={() => { this.props.navigation.navigate('DashboardOrders') }} height={fontSize(45)} fontSize={fontSize(15)}/>

                      <Swipeout style={[SUBMIT, {width: dimensions.width / 2}]} right={[{text: "Yes", onPress: () => this._allDispatch()}]} buttonWidth={dimensions.width / 2}>
                          <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", width: dimensions.width / 2, height: "100%" }}>
                              <Text style={{ width: fontSize(8)}}> </Text>
                              <Text style={{ justifyContent: "center", alignItems: "center" }}>Yes</Text>
                              <Icon name="ellipsis-v" size={fontSize(16)} style={{width: fontSize(8)}} color={colors.white} />
                          </View>
                      </Swipeout>
                  </View>
              </View>
          }

          { (this._getErrors().length === 0 || this.state.success === true) &&
              <View style={styles.container}>
                  <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', alignContent: 'center', backgroundColor: colors.screenBackground }}>

                      <Text style={{ fontSize: fontSize(12) }}>Thank you!</Text>
                      <Text style={{ fontSize: fontSize(12) }}>Dispatching has been finalized</Text>

                      { this._getErrors().length > 0 &&
                          <Text style={{ fontSize: fontSize(7), marginBottom: fontSize(5) }}>
                              {this._getErrors().length} have been reported automatically
                          </Text>
                      }

                      <Icon name="check-circle" size={fontSize(60)} color={colors.teal} style={{ marginTop: fontSize(30) }}/>
                  </View>

                  <View style={SUBMIT}>
                      <Button text="START NEW SHIFT" style={{flex: 1}} onSubmit={() => { this.props.navigation.navigate('DashboardOrders') }} height={fontSize(45)} fontSize={fontSize(15)}/>
                  </View>
              </View>
          }
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
        dispatchBulkRequest: (references) => {
            return dispatch(actions.dispatchBulkRequest(references));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dispatch);


