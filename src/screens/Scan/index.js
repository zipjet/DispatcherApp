import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, PermissionsAndroid } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT } from "./../../constants/base-style.js";
import {dimensions, fontSize, hasItemizationIssues, isReadyToStock} from '../../constants/util';
import Keyboard     from "./../../components/Keyboard";
import * as storage from '../../storage';
import { styles } from './style';
import * as types   from '../../actions/types';
import { translate } from '../../locale';
import { BarcodePicker, ScanditModule, Barcode, ScanSettings } from 'scandit-react-native';
import Menu from "./../../components/Menu";
import DispatchButton from "./../../components/DispatchButton";
import {WASH_FOLD} from "../../constants/constants";
import store from '../../store';
import { DropDownHolder } from './../../components/DropdownHolder';

ScanditModule.setAppKey('AaIMq7uBL6ZFJPWcXi3seBwrfLlcDxzthUWDKykZ7KnwJzUfqxOg5PdYL+btWv9CDntWkuhYC4oQaiDbswyrJoFaEnUKQ11oGQ6fAh1rmCL+M9YTl2flb9BJlqCnB35l8DlQZeAb4ATfIX3aStqEOMO+PDOcaiVDgjq8dBZ9Zq63e+lGvybMS/epdQ6+Cu8rP2iiEW0fI7MSGcmocVh7w8+ZXJN1LjCdk5GJNFt9Ct6AI0j0sQlE4LT1zuL/MiJf9BlTB0PcBKmk8hDeg9BLSrJVMob2a7vYcsfk+jWsdhXBASrCNsqLK9q97TyCvLS1yadU/dX0qAOMW/IkCYW7bNCpu75eeDQvsdGOffe7z6n+NLD93r5J8CU8TxxDqN8T0t6q+T+vjuSNnPtOTH+oeI+iP00ikyaLfc6lVDio+N3LFtAldvJkpOiR+yarq1PkoZ2KhPyn6B/TICvzmvXLjiSNAdL9PZkUtlx4K3qaOn7lce7qWn8bXIOAGIdlSrrMmnGGxb6R3dHzLf8Y958UOTW43zBsUM4YWS/VQm+VGeQpTIgTbaoIZeqwxAXoGde/BOj7JWm23wUPDxKR4U6nho7H6PSH7fTGd0zSjBGzHNQgK2vn8zVUjYalgfvyYMW/6suyVfR27++GUH2cpIgozhBkGC+6JydaaAuaf3trDUVR9x4BByq0W1TUYPrZJeG12c8bXIqASMNIt05sT9rrAuD3RbbYECR2OJ4ijOW8gySpKfISul/bYEUwzrcLA2DLxVKwwc22DUyQPR2azlQC14ktvoa0uQhhRpVbdTcLfwd5urPTmgrO');

class Scan extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
        showScanner: true,
        barcodeKey: 1,
        shift: null
    };

    this.settings = new ScanSettings();
    this.settings.setSymbologyEnabled(Barcode.Symbology.EAN13, true);
    this.settings.setSymbologyEnabled(Barcode.Symbology.EAN8, true);
    this.settings.setSymbologyEnabled(Barcode.Symbology.UPCA, true);

    this.settings.workingRange = ScanSettings.WorkingRange.STANDARD;

    this.barcode = '';
    this.scannerEnabled = true;
  }

  componentDidMount() {
      store.dispatch({type: types.SAVE_HOMEPAGE, page: "Scan"});

      storage.loadShift()
          .then(
              (shift) => {
                  this.setState({shift: JSON.parse(shift)});
              }
          );

      this.requestCameraPermission();

      this.willFocusSubscription = this.props.navigation.addListener(
          'willFocus',
          () => {
              if (this.state.barcodeKey > 1) {
                  this.scannerEnabled = true;
                  this.barcode = '';
                  // this.scanner && this.scanner.resumeScanning();

                  this.setState({barcodeKey: this.state.barcodeKey++});
              }
          }
      );

      this.willBlurSubscription = this.props.navigation.addListener(
          'willBlur',
          () => {
              if (this.state.barcodeKey > 1) {
                  this.scannerEnabled = false;
                  this.barcode = '';
                  // this.scanner && this.scanner.pauseScanning();
              }

              let instance = this;

              // I hate this
              setTimeout(
                  function () {
                      try { instance.setState({showScanner: true}); } catch (e) {}
                  },
                  200
              );
          }
      );
  }

  // to remove the listener
  componentWillUnmount() {
    this.willFocusSubscription.remove();
    this.willBlurSubscription.remove();
  }

  requestCameraPermission() {
      if (Platform.OS === 'ios') {
          this.scanner.startScanning();
          this.scanner.setTorchButtonMarginsAndSize(dimensions.width - 50, 20, 30, 30);
      } else {
        try {
            const granted = PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    'title': 'Camera Permission',
                    'message': 'Dispatcher App needs access to your camera'
                }
            ).then((granted) => {
                this.setState({barcodeKey: this.state.barcodeKey++});
                this.scanner.startScanning();
                this.scanner.setTorchButtonMarginsAndSize(dimensions.width - 50, 20, 30, 30);

                this.scannerEnabled = true;
            })

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.setState({barcodeKey: this.state.barcodeKey++});

                this.scanner.startScanning();
                this.scanner.setTorchButtonMarginsAndSize(dimensions.width - 50, 20, 30, 30);

                this.scannerEnabled = true;
            }
        } catch (err) {
            console.warn(err)
        }
      }
  }

    // Pause on a detected barcode (camera video is shown, but not parsed for barcodes).
    // Comparison: stop - startScanning() would freeze the camera image up on detection.
    onScan = (code) => {
      if (this.scannerEnabled) {
          if (code.newlyRecognizedCodes[0].data !== this.barcode) {
                this.barcode = code.newlyRecognizedCodes[0].data;

                this._onSearchByCode(code.newlyRecognizedCodes[0].data);
          }
      }
    };

    _onSearchByCode = (barcode) => {
        this.props
            .searchBarcodeRequest(barcode)
            .then(response => {
                    this.setState({spinner: false});

                    if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('reference')) {
                        let task = response.data;

                        if (response && response.hasOwnProperty('errors') && response.errors.length) {
                            DropDownHolder.alert('error', response.errors[0].userTitle, response.errors[0].userMessage);
                        }

                        storage.saveBarcode(barcode);
                        storage.saveFulfillment(task);

                        // no need to itemize the wash and fold
                        for (let i = 0; i < task.meta.scannedAtHub.length; i++) {
                            if (task.meta.scannedAtHub[i].code === barcode) {
                                if (task.meta.scannedAtHub[i].type === WASH_FOLD) {
                                    this.props.navigation.push("Dispatch");

                                    return;
                                }
                            }
                        }

                        // no need to itemize the stock orders
                        if (isReadyToStock(task, this.state.shift)) {
                            this.props.navigation.push("Dispatch");

                            return;
                        }

                        this.props.navigation.push("OrderBagItemization");
                    } else {
                        this.scanner && this.scanner.resumeScanning();

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
    return (
      <View style={styles.container}>
          <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />
              <View style={[this.state.showScanner ? {flex: 1} : {height: 0}]}>
                  <BarcodePicker
                      key={this.state.barcodeKey}
                      ref={(scan) => { this.scanner = scan }}
                      scanSettings={ this.settings }
                      onScan={(session) => { this.onScan(session) }}
                      style={{ position: 'absolute', top: 0, left: 0, height: fontSize(0, dimensions.height), width: fontSize(0, dimensions.width)}}
                  />

                  <Menu
                      indicatorColor={colors.screenBackground}
                      navigation={this.props.navigation}
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
                  navigation={this.props.navigation}
                  width={dimensions.width / 2}
                  />
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
        searchBarcodeRequest: (barcode) => {
            return dispatch(actions.searchBarcodeRequest(barcode));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Scan);


