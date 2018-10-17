import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import { Text, TextInput, View, FlatList, Alert, ScrollView, Image, AsyncStorage, TouchableHighlight } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentCentered, ContentRow } from "./../../constants/base-style.js";
import { hr, SUBMIT, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { translate } from '../../locale';
import * as storage from '../../storage';
import Button from "./../../components/Button";
import Menu from "./../../components/Menu";
import { dimensions, fontSize, getShift } from '../../constants/util';
import Icon from 'react-native-vector-icons/FontAwesome';
import OrderCard from "../../components/OrderCard/index";
import Swipeout from 'react-native-swipeout';
import {HEADER} from "../../constants/base-style";

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

    keyExtractor = (item) => item.reference;

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
                    <Text style={{fontSize: fontSize(13)}}>{this.state.title && this.state.tasks.length} {this.state.title}</Text>
                </View>

                <View style={{width: fontSize(30)}}/>
            </View>

            <View style={[NO_INTERNET_BAR]}>
                {this.state.noInternet && <Text style={NO_INTERNET_MESSAGE}>{translate("NO_INTERNET")}</Text>}
            </View>

            <View style={[ ContentWithHeaderStyle ]}>
                <View style={ContentCentered}>

                    <FlatList
                        ItemSeparatorComponent={
                            () => <View style={hr} />
                        }
                        style={{flex: 1, width: '80%', marginLeft: '10%'}}
                        data={this.state.tasks}
                        keyExtractor={this.keyExtractor}
                        renderItem={
                            ({item}) => <OrderCard
                                            item={item}
                                            key={item.reference}
                                            navigation={this.props.navigation}
                                            />
                        }
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
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OrdersList);


