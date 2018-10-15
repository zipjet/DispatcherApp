import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Platform, Text, TextInput, View, Alert, Image, AsyncStorage, PermissionsAndroid } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "./../../components/Button";
import { colors, SUBMIT } from "./../../constants/base-style.js";
import { dimensions, fontSize } from '../../constants/util';
import Keyboard     from "./../../components/Keyboard";
import { styles } from './style';
import { translate } from '../../locale';
import { BarcodePicker, ScanditModule, Barcode, ScanSettings } from 'scandit-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';

ScanditModule.setAppKey('AV7M8wCiHB4AO8A7TgBiY2kQyTwrDPsA2lsWdnVRncV+cpOnp1zUyT0EfE3qDlG3v3dovDx8xwjncqaKFnpAkLR7WVkmIGEVKjasGYlKvJOhMKmB3k/ceZJXZEvvAxYaqA+IOioHqvgcQxHNratCaOCRQabanfS4w1KKKGRnoXaAvn65W/qbQ7EthALKnznHNCdVbZMjJ8rj9O+awa1YhKtK5kTwz6m/h6Js9axez65usE72XLwyPEHr5TeO9HB3+F9iaM6i1wftTxBbX99Xw9JjK6pSMRbOZzcP8YJzhWPzHo8f9xnLqs3zZ1cPTBfFikgE15hslAUOmA68OAbSh0/ZarTzunUR8gQ65+NeJujbLg/q70yb3ZWr0bPUutH13vAVANv2TGakDSohLXFsyuyU+0++VXZgYOXSbxgW9049u6sIQanxdAnUCvE066UbhEKhtockXUufS6nP2Mg/CORp/nmlYwa7KDpw6BOlbMZf+97pZbWeYINUg06URIZBNWDsGrSXCWKY+A8W5qoSfYHL1VnEGGuduj7CPRVCQsZffYXxgqiobS0fYh+KehMEGMvJLvM061sJiQx4rYIn2AaQvsrUEmWxRluiacr69l7hYq0AN0wsacjVJ9ZbMoMnQIUFCjpI3lyIXSsAiwDcMecOPHwkvC2WzDzQKon+YDYz19wzfD72I4TBreckx2LYB7kEIHquXX32xJYAJEJmLF+0FWXNZathU+5kSCytVl/AhB1ZPMUw/raWz+UiovwoTV291OkvsagGsBa/RrcB7DzvsTF6+eTa7dzU+JcKIPqI0zq1wwXj');

class Scan extends React.Component {
    static navigationOptions = {
        header: null,
    };

  constructor(props) {
    super(props);

    this.state = {
        showScanner: true,
        barcodeKey: 1
    };

    this.settings = new ScanSettings();
    this.settings.setSymbologyEnabled(Barcode.Symbology.EAN13, true);
    this.settings.setSymbologyEnabled(Barcode.Symbology.EAN8, true);
    this.settings.setSymbologyEnabled(Barcode.Symbology.UPCA, true);
  }

  componentDidMount() {
      this.requestCameraPermission();
  }

  requestCameraPermission() {
      if (Platform.OS === 'ios') {
          this.scanner.startScanning();
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
            })

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.scanner.startScanning();
            }
        } catch (err) {
            console.warn(err)
        }
      }
  }

    // Pause on a detected barcode (camera video is shown, but not parsed for barcodes).
    // Comparison: stop - startScanning() would freeze the camera image up on detection.
    onScan = (code) => {
        this.scanner && this.scanner.pauseScanning();

        this._onSearchByCode(code.newlyRecognizedCodes[0].data);
    };

    _onSearchByCode = (barcode) => {
        this.props
            .searchBarcodeRequest(barcode)
            .then(response => {
                    this.setState({spinner: false});
                    this.scanner && this.scanner.resumeScanning();

                    if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('reference')) {
                        if (response && response.hasOwnProperty('errors') && response.errors.length) {
                            Alert.alert(response.errors[0].userTitle, response.errors[0].userMessage);
                        }

                        store.dispatch({type: types.SAVE_TASK, task:response.data});
                        storage.saveFulfillment(response.data);

                        this.props.navigation.push("OrderDetails");
                    } else {
                        if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
                            Alert.alert(response.errors[0].userTitle, response.errors[0].userMessage);
                        } else {
                            Alert.alert("", translate("bag.search.fail"));
                        }
                    }
                }
            );
    }



  render() {
    return (
      <View style={styles.container}>
          <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

          { this.state.showScanner &&
              <BarcodePicker
                  key={this.state.barcodeKey}
                  ref={(scan) => { this.scanner = scan }}
                  scanSettings={ this.settings }
                  onScan={(session) => { this.onScan(session) }}
                  style={{ flex: 1 }}
                />
          }

          { this.state.showScanner === false &&
              <Keyboard
                  showSpinner={() => {this.setState({spinner: true})}}
                  hideSpinner={() => {this.setState({spinner: false})}}

                  eventListener="onKeyDown"
                  navigation={this.props.navigation}
                  onCode={this._onSearchByCode}
                />
          }

          <View style={SUBMIT}>
              <Button text={this.state.showScanner ? translate("Scan.Enter") : translate("Scan.Scan")}
                      onSubmit={
                          () => {
                              this.setState({showScanner: !this.state.showScanner});

                              if (this.state.showScanner) {
                                this.scanner.resumeScanning();
                              }
                          }
                      }
                      height={fontSize(45)} fontSize={fontSize(15)}
              />
              <Swipeout style={[SUBMIT, {width: '50%'}]} right={[{text: translate("Scan.Finish")}]} buttonWidth={dimensions.width / 2}>
                  <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", width: "100%", height: "100%" }}>
                      <Text style={{ justifyContent: "center", alignItems: "center" }}>{translate("Scan.Finish")}    </Text>
                      <Icon name="ellipsis-v" size={fontSize(16)} color={colors.white} />
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
        searchBarcodeRequest: (barcode) => {
            return dispatch(actions.searchBarcodeRequest(barcode));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Scan);


