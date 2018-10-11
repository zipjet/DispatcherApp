/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import { Provider } from "react-redux";
import store from "./src/store";

import { createStackNavigator } from "react-navigation";
import { colors } from "./src/constants/base-style.js";

import SignIn    from "./src/screens/SignIn";
import Dashboard from "./src/screens/Dashboard";
import Error from "./src/screens/Error";
import Fulfillment from "./src/screens/Fulfillment";
import FulfillmentView from "./src/screens/FulfillmentView";
import Scan from "./src/screens/Scan";

type Props = {};
export default class App extends Component<Props> {
  state = {
    isLoadingComplete: false,
    fontLoaded: false
  };

  async componentDidMount() {
    // await Font.loadAsync({
    //   "WorkSans-Light": require("./assets/fonts/WorkSans-Light.ttf"),
    //   "WorkSans-Bold": require("./assets/fonts/WorkSans-Bold.ttf"),
    //   "WorkSans-Medium": require("./assets/fonts/WorkSans-Medium.ttf"),
    //   "WorkSans-SemiBold": require("./assets/fonts/WorkSans-SemiBold.ttf"),
    //   "WorkSans-Regular": require("./assets/fonts/WorkSans-Regular.ttf")
    // });
    this.setState({ fontLoaded: true });
  }

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  render() {
    if (!this.state.isLoadingComplete) {
      return (
        <Provider store={store}>
          <RootStack />
        </Provider>
      );
    }
  }
}

const RootStack = createStackNavigator(
  {
    SignIn: {
        screen: SignIn
    },
    Dashboard: {
        screen: Dashboard
    },
    Error: {
        screen: Error
    },
    Fulfillment: {
        screen: Fulfillment
    },
    FulfillmentView: {
        screen: FulfillmentView
    },
    Scan: {
        screen: Scan
    }
  },

  {
    initialRouteName: "Dashboard", //"SignIn",

    /* The header config from HomeScreen is now here */
    navigationOptions: {
      headerStyle: {
          backgroundColor: colors.greenBlue
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold"
      }
    }
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  nav: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },

  navItem: {
    flex: 1,
    padding: 5
  },

  subNavItem: {
    padding: 2
  }
});
