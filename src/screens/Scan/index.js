import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, PermissionsAndroid, AppState } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT } from "./../../constants/base-style.js";
import {dimensions, fontSize, hasItemizationIssues, isReadyToStock} from '../../constants/util';
import Keyboard     from "./../../components/Keyboard";
import * as storage from '../../storage';
import { styles } from './style';
import * as types   from '../../actions/types';
import { translate } from '../../locale';
import Menu from "./../../components/Menu";
import DispatchButton from "./../../components/DispatchButton";
import {WASH_FOLD} from "../../constants/constants";
import store from '../../store';
import { DropDownHolder } from './../../components/DropdownHolder';
import { RNCamera } from 'react-native-camera';
import navigator from '../../navigator';

class Scan extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
        showScanner: true,
        scannerEnabled: false,

        shift: null,
    };

    this.barcode = '';
  }

  componentDidMount() {
      AppState.addEventListener('change', (state) => {
          if (state === 'active') {
          }

          if(state === 'background'){
              this.pauseScanning();
          }
      });

      storage.loadShift()
          .then(
              (shift) => {
                  this.setState({shift: JSON.parse(shift)});
              }
          );

      if (this.props.navigation) {
          this.willFocusSubscription = this.props.navigation.addListener(
              'willFocus',
              () => {
                  this.resumeScanning();

                  store.dispatch({type: types.SAVE_HOMEPAGE, page: "Scan"});
              }
          );

          this.willBlurSubscription = this.props.navigation.addListener(
              'willBlur',
              () => {
                  this.pauseScanning();
              }
          );
      }
  }

  // to remove the listener
  componentWillUnmount() {
    this.willFocusSubscription && this.willFocusSubscription.remove();
    this.willBlurSubscription && this.willBlurSubscription.remove();

    AppState.removeAllListeners('change');
  }

  pauseScanning() {
      this.barcode = '';

      this.setState({scannerEnabled: false});
  }

  resumeScanning() {
      this.setState({scannerEnabled: true});

      store.dispatch({type: types.SAVE_HOMEPAGE, page: "Scan"});
  }

    _onSearchByCode = (barcode) => {
        this.props
            .searchBarcodeRequest(barcode)
            .then(response => {
                    this.setState({spinner: false});

                    if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('reference')) {
                        let task = response.data;

                        if (response && response.hasOwnProperty('errors') && response.errors.length) {
                            DropDownHolder.alert('info', response.errors[0].userTitle, response.errors[0].userMessage);
                        }

                        storage.saveBarcode(barcode);
                        storage.saveFulfillment(task);

                        // no need to itemize the wash and fold
                        for (let i = 0; i < task.meta.scannedAtHub.length; i++) {
                            if (task.meta.scannedAtHub[i].code === barcode) {
                                if (task.meta.scannedAtHub[i].type === WASH_FOLD) {
                                    // Alert.alert("Scan", "Dispatch WF");

                                    this.pauseScanning();

                                    navigator.push("Dispatch");

                                    return;
                                }
                            }
                        }

                        // no need to itemize the stock orders
                        if (isReadyToStock(task, this.state.shift)) {
                            // Alert.alert("Scan", "Dispatch Stock");

                            this.pauseScanning();

                            navigator.push("Dispatch");

                            return;
                        }

                        // Alert.alert("Scan", "Dispatch Bag Itemization");

                        this.pauseScanning();
                        navigator.push("OrderBagItemization");
                    } else {
                        if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
                            DropDownHolder.alert('error', response.errors[0].userTitle, response.errors[0].userMessage);
                        } else {
                            DropDownHolder.alert('error', 'Error', translate("bag.search.fail"));
                        }
                    }
                }
            );
    }

  render() {
    if (this.state.scannerEnabled === false) {
        return <View style={{ height: 0}}></View>
    }

    return (
      <View style={{ top: 0, bottom: 0, left: 0, right: 0, position: 'absolute'}}>
          <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />
              <View style={[this.state.showScanner ? {flex: 1} : {height: 0}]}>
                  { this.state.scannerEnabled &&
                    <RNCamera
                          ref={ref => {
                              this.camera = ref;
                          }}
                          autoFocus={true}
                          focusDepth={0.4}
                          captureAudio={false}
                          type={RNCamera.Constants.Type.back}
                          flashMode={RNCamera.Constants.FlashMode.torch}
                          permissionDialogTitle={'Permission to use camera'}
                          permissionDialogMessage={'We need your permission to use your camera phone'}
                          onGoogleVisionBarcodesDetected={({ barcodes }) => {
                                if (this.state.scannerEnabled && this.state.showScanner) {
                                    if (barcodes[0].data !== this.barcode) {
                                          this.barcode = barcodes[0].data;

                                          this._onSearchByCode(barcodes[0].data);
                                    }
                                }
                          }}
                          style={{ position: 'absolute', top: 0, left: 0, height: fontSize(0, dimensions.height), width: fontSize(0, dimensions.width)}}
                      />
                  }

                  <Menu
                      indicatorColor={colors.screenBackground}
                      navigation={navigator}
                      storage={storage}
                      style={{ position: 'absolute', top: fontSize(-20), left: fontSize(50) }}
                  />
              </View>

              <View style={[this.state.showScanner ? {flex: 0} : {flex: 1}]}>
                  <Keyboard
                      showSpinner={() => {this.setState({spinner: true})}}
                      hideSpinner={() => {this.setState({spinner: false})}}

                      eventListener="onKeyDown"
                      navigation={this.props.navigation}
                      onCode={this._onSearchByCode}
                    />
              </View>

          <View style={SUBMIT}>
              <Button text={this.state.showScanner ? translate("Scan.Enter") : translate("Scan.Scan")}
                      onSubmit={
                          () => {
                              this.setState({showScanner: !this.state.showScanner});
                          }
                      }
                      height={fontSize(45)} fontSize={fontSize(15)}
              />
              <DispatchButton
                  navigation={navigator}
                  width={dimensions.width / 2}
                  onClick={() => {this.pauseScanning()}}
                  />
          </View>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return {
        searchBarcodeRequest: (barcode) => {
            return dispatch(actions.searchBarcodeRequest(barcode));
        },
    };
};

let ScanContainer = connect(null, mapDispatchToProps, null, { withRef: true, copyMethods: ['resumeScanning', 'pauseScanning']})(Scan);
export default ScanContainer;


