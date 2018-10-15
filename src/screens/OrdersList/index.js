import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import * as storage from '../../storage';
import Button from "./../../components/Button";
import Menu from "./../../components/Menu";
import Prompt       from "./../../components/Dialog";
import moment       from "moment";
import * as types   from '../../actions/types';
import store from '../../store';
import { dimensions, fontSize, getShift } from '../../constants/util';
import timer from 'react-native-timer';
import { Select, Option } from "react-native-chooser";
import { STATE_ITEMIZING, STATE_CLEANING } from "./../../constants/constants";
import Icon from 'react-native-vector-icons/FontAwesome';
import DashboardCard from "../../components/DashboardCard/index";
import Swipeout from 'react-native-swipeout';
import {HEADER} from "../../constants/base-style";

const ALL       = translate("Menu.Dashboard");
const NEW       = translate("Menu.Itemizing");
const PROGRESS  = translate("Menu.Cleaning");
const ERROR     = translate("Menu.Error");

class OrdersList extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.dashboardMode = '';
        this.tasks = [];
        this.isLoading = false;

        this.state = {
            title: "",
            tasks: [],

            nextPage: 1,
            numColumns: 1,
            posts: [],
            showFooter: false,
            refreshing: false,
        };

        storage
            .loadTasks(true)
            .then((tasksData) => {
                tasksData = JSON.parse(tasksData);

                this.setState({title: tasksData.title, tasks: tasksData.tasks})
            })
    }

    loadData(append, reset) {
        if (this.isLoading) return;

        let pagesToLoad = this.state.nextPage;

        if (append) {
            this.setState({ loadingMore: true, nextPage: this.state.nextPage + 1 });
            pagesToLoad = this.state.nextPage + 1;
        }

        if (reset) {
            this.setState({ nextPage: 1 });
            pagesToLoad = 1;
        }

        try {
            this.isLoading = true;
            let refreshTasks      = this.state.tasks.filter((item, index) => { return index < pagesToLoad * 15 });
            let stateTasksPlusOne = this.state.tasks.filter((item, index) => { return index < pagesToLoad * 15 + 1 }).length;

            // should I show the footer?
            if (refreshTasks.length < stateTasksPlusOne) {
                this.setState({ showFooter: true });
            } else {
                this.setState({ showFooter: false });
            }

            this.setState({ loadingMore: false, posts: refreshTasks });
        } catch (error) {
        } finally {
            this.isLoading = false;
            this.setState({ loadingMore: false, refreshing: false });
        }
    }



















  render() {
    return (
        <View style={{flex: 1, padding: 0}}>
            <Spinner visible={this.state.spinner} textContent={""} textStyle={{ color: colors.white }} />

            <View style={[ HeaderStyle ]}>
                <Menu
                    navigation={this.props.navigation}
                    storage={storage}
                />

                <View style={HEADER}>
                    <Text>{this.state.tasks.length} {this.state.title}</Text>
                </View>
            </View>

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={[ ContentWithHeaderStyle ]}>
                <View style={ContentCentered}>

                    <FlatList
                        style={{flex: 1, width: '100%'}}
                        data={this.state.tasks}
                        renderItem={({item}) => <Text>{item.item.reference}</Text>}
                    />

                    <View style={SUBMIT}>
                        <Button text={translate("Scan.Start")} onSubmit={() => { this.props.navigation.push('Scan') }} height={fontSize(45)} fontSize={fontSize(15)}/>
                    </View>
                </View>

            </View>
        </View>
    );
  }
}

const mapStateToProps = ({ dashboardData }) => {
  return { dashboardMode: dashboardData.dashboardMode };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(OrdersList);


