/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Font} from 'react-native';
import { Provider } from "react-redux";
import store from "./src/store";

import { createStackNavigator } from "react-navigation";
import { colors } from "./src/constants/base-style.js";

import SignIn    from "./src/screens/SignIn";
import Dashboard from "./src/screens/Dashboard";
import DashboardOrders from "./src/screens/DashboardOrders";
import Error from "./src/screens/Error";
import Scan from "./src/screens/Scan";
import OrderDetails from "./src/screens/OrderDetails";
import OrdersList from "./src/screens/OrdersList";
import Dispatch from "./src/screens/Dispatch";
import DispatchFinish from "./src/screens/DispatchFinish";
import DriversList from "./src/screens/DriversList";
import OrderBagItemization from "./src/screens/OrderBagItemization";
import Stock from "./src/screens/Stock";
import Search from "./src/screens/Search";

import DropdownAlert from 'react-native-dropdownalert';
import { DropDownHolder } from './src/components/DropdownHolder';

type Props = {};
export default class App extends Component<Props> {
  state = {
    isLoadingComplete: false,
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  render() {
    if (!this.state.isLoadingComplete) {
      return (
          <View style={{height : '100%', width: '100%'}}>
            <Provider store={store}>
              <RootStack />
            </Provider>

            <DropdownAlert
                successImageSrc={require("./assets/img/check.png")}

                ref={ref => DropDownHolder.setDropDown(ref)}
                closeInterval={3000}
            />
          </View>
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
    DashboardOrders: {
        screen: DashboardOrders
    },
    Dispatch: {
        screen: Dispatch
    },
    DispatchFinish: {
        screen: DispatchFinish
    },
    DriversList: {
        screen: DriversList
    },
    Scan: {
        screen: Scan
    },
    Search: {
        screen: Search
    },
    OrderDetails: {
        screen: OrderDetails
    },
    OrdersList: {
        screen: OrdersList
    },
    OrderBagItemization: {
        screen: OrderBagItemization
    },
    Stock: {
        screen: Stock
    },
    Error: {
        screen: Error
    },
  },

  {
    initialRouteName: "SignIn",

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
