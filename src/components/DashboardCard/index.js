import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, TextInput, View, FlatList, Alert, Image, AsyncStorage, TouchableHighlight } from "react-native";
import { colors, HeaderStyle, ContentWithHeaderStyle, ContentStyle, KeyboardStyle, Table, TableRow, TableCell, hr } from "./../../constants/base-style.js";
import { TASK_DATA, TASK_DATA_HEADER, GRID, GRID_ITEM, NO_INTERNET_BAR, NO_INTERNET_MESSAGE } from "./../../constants/base-style.js";
import { styles } from './style';
import { translate } from '../../locale';
import { fontSize } from '../../constants/util';
import { STATE_ITEMIZING, STATE_CLEANING } from "./../../constants/constants";
import store from '../../store';
import * as storage from '../../storage';
import * as types from '../../actions/types';
import * as actions from "../../actions";

class DashboardCard extends React.Component {

    shouldComponentUpdate(nextProps) {
        return (nextProps.item.reference !== this.props.item.reference);
    }

    _onTaskSelect = () => {
        // debug full objects vs testing
        if (this.props.item.itemization !== undefined) {
            store.dispatch({type: types.SAVE_TASK, task:this.props.item});
            storage.saveFulfillment(this.props.item);

            if (this.props.item.state === STATE_ITEMIZING) {
                this.props.navigation.push("Fulfillment");
            } else {
                this.props.navigation.push("FulfillmentView");
            }
        } else {
            this.props
                .searchReferenceRequest(this.props.item.reference)
                .then(response => {
                        this.setState({ spinner: false });
                        if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('reference')) {
                            store.dispatch({type: types.SAVE_TASK, task:response.data});
                            storage.saveFulfillment(response.data);

                            if (response.data.state === STATE_ITEMIZING) {
                                this.props.navigation.push("Fulfillment");
                            } else {
                                this.props.navigation.push("FulfillmentView");
                            }
                        } else {
                            if (response && response.hasOwnProperty('errors') && response.errors.length > 0) {
                                Alert.alert(response.errors.userTitle, response.errors.userMessage);
                            } else {
                                Alert.alert("", translate("bag.search.fail"));
                            }
                        }
                    }
                );
        }
    }

    render() {
        let error      = this.props.item.state === STATE_CLEANING && this.props.item.meta.missingBags.length > 0;
        let stateColor = this.props.item.state === STATE_CLEANING ? colors.cleaningColor : colors.itemizationColor;

        return <TouchableHighlight onPress={this._onTaskSelect}  underlayColor="white">
                       <View style={[GRID_ITEM, { backgroundColor: colors.white, paddingTop: fontSize(10), paddingBottom: fontSize(10) }]}>

                           <View style={{ paddingLeft: fontSize(10), paddingRight: fontSize(10), flexDirection: 'column', justifyContent: "space-between", height: fontSize(20) }}>
                               <View style={{ flexDirection: 'row', alignItems: 'center', height: fontSize(12) }}>
                                   <Text style={[styles.headingLeftItems, {flex: 1}]}>{this.props.item.reference}</Text>

                                   <View style={{alignItems: 'center' }}>
                                       <Text style={[TASK_DATA_HEADER, {color: colors.white, backgroundColor: (error ? colors.errorColor : stateColor) }]}>
                                           {this.props.item.state}
                                       </Text>
                                   </View>
                               </View>

                               { this.props.item.serviceClass && this.props.item.serviceClass.id && this.props.item.serviceClass.id.toLowerCase().indexOf('-express-') > 0 &&
                                   <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(16), justifyContent: "flex-start"}}>
                                       <Image
                                           source={{uri: "data:image/png;base64,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\n"}}
                                           style={{height: fontSize(14), width: fontSize(60), resizeMode: 'contain'}}
                                       />
                                   </View>
                               }
                           </View>

                           <View style={hr}/>

                           <View style={{ paddingLeft: fontSize(10), paddingRight: fontSize(10), flexDirection: 'column', justifyContent: "space-between", flex: 1 }}>

                               <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(20), justifyContent: "flex-start"}}>
                                   <Image
                                       source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAB3RJTUUH4gkGBgAyc3kAtgAAA2tJREFUeNrt2E1oXFUUwPH/ue++eVNNtUz9SAQltqiFBlzEFoQodaNFxI0EHaXiophFipqFuhxCN36UInahBESpQcQsFBHc1tYKLiJKQa2mVgW1xjY2AcnMm3fvcZGFKEXNEDPT5zn7yzx+c+/5ElXF4o9wRmAgBmIgBmIgBmIgBmIgBmIgBmIgpQvfrR8WRDg8XiN1Q+CuxUkVWCbqd/jqCR19ZrEr39WNfYjMjqXMZXXa+W5UBpHkKoQUtIXGeTR+Q1Z9j63b39bhR9ulBpF3JjaxrM9R5HeQVraiyAWuj9LOvyZJ30V1vz704lIpQeT9Qxnnv5qC5H4g+8cDGhcQeR1fe0pHG3n5kuriqTFivPtfYQCIqxGKeykW6qWrMjI9NkDRvA+XXrG6tJ8OElr3yMxjV5brhsiG28ENrPqcIqhsoSXD5Sq7iW4j+s2d/W2+Hxe3lAskxj5wWWe3y10C9JXryTjJQYuOzmrM0dgqWZVx3xJjZ92nhrP49KdygWj6MTE/0yHI90j6WblABvo+x284jsbfVnUuFPMk2XE4PVcqEN3VKBB5FvTkKiZARfQTpPKyjr4VStepav2Fn8nSh4nhBOjfJ0nVZWL7KL76uNYPnC33tPvaeD9VN0ne3olLribxNUQqKDmxOEcszpBWP6Ld2q97Xpov/fgPIFNjKZdnw6iMENqDaMhwvgl+jjT9UEcPzP5v9iG9HLZCNJBemWX+VE0Rpif68fF6cNcgcSNoBaVFZAnnfqCdnmbP878orOubXrccIm9ODEK8DdwIIR8mxMtwkoF4IFlxQoGwMrtoTpIsIJVZVI+RhGP6wKEfL2oQmRnvI1buRMNeoowgsrGzBkYjoucRjhDdFPniB/rIq82LBkQO79tMRe4i6j7E37rG703RcJQQDiL+yFovoNcURCYnHTf+OoQWT+N8/YIb9bWEifkrJNlBvtx0UhuN2HtVZtvSTjS8gfgH/1MMWFktSmUvoT3FTedu7rmyKzNPXEfRbCDJ9vUtWckOQnhSpicGeuuGRN0N3NKFIp4RdQcJu3oMhCGcv7Qr3VTiaxBu6LEcItUudr4JQtZjIIGuhor0GIjNMn+9tZ+C1pC4/vOR0AT3he1DbPw3EAMxEAMxEAMxEAMxEAMxEAsDMRADMRADMRADWd/4HaNOSiejq0GYAAAAAElFTkSuQmCC\n"}}
                                       style={{height: fontSize(20), width: fontSize(20), resizeMode: 'contain'}}
                                       />

                                   <Text style={TASK_DATA_HEADER}>
                                       {this.props.item.customer.returning === false && <Text style={{color: colors.greenBlue}}>{translate("task.customer.new")}</Text>}
                                       {this.props.item.customer.name}

                                       {this.props.item.corporate && this.props.item.corporate.name &&
                                           <Text style={TASK_DATA}>
                                               {"\n"}
                                               {translate("corporate") + ": " + this.props.item.corporate.name}
                                           </Text>
                                       }
                                   </Text>
                               </View>

                               <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(20)}}>
                                   <Image
                                       source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAB3RJTUUH4gkGBgEKQmCJaQAACOFJREFUeNrtm3twXVUVh7919jnn5tU2fZE+eNSBOrQgggN1eAilYgdFUBhT6MspKDCCRNtpGXk1RJgqtNNCq6PWUbGxlBKGh8DUMXUoHUAQAREsluElQqEvkiahyT137738IyX3Jq2UpLc3KXP3n3fOWWef76y99vqtva6oKsWRHUERQRFIEUgRSBFIEUgRSBFIEUgRSBHIoTDCgTAJ2VAX8l5rJaEtI5O0Ep3dotXVrl/m0h/iTu6/cjTp0i8DZ6BJFdYNAi2BwIBakDQmbMFEW4ANGPe4Vi/f/qkCIo9cWUZL6XmIm461nyMwlQRmUKeXitnHLQ7VBG9bUf8BYfQchH+g0j6mX12ePmSByMorIypKT0WT6zHxOSim78ZI4+0fIVrEmMqXdXKtPWSASF1dwPgPjkYy10A8Bxi0j8syeLsL1QT1CYgCBpEQkZjADAGJ9nFfM2p/hnW/1G//4t0BD0QaphnsYZNweiMm+tpeEFzyFt5uIYzfRKLnMbKVtN1KHOzGaQXGVIGrwvlJ2ORIAjMGEx2xFxyXNJAquQXe2aTV97oBCUQ21IVsab4AtQsJzOe7xQSXbEb1aeK4kaD0Ka3+6dv7tbf22qPx6TNwmXNQJhHF41Gk6wLvn0VlIYcPW5+PJZRXIALCPfO+iWZWgBmbM+kdYP+CMQ9gokaqlzYp6Ce3K8JdV1URm6lo5iIIzyQwQ7P27UsQz2fm0sbe2D34QNbUnIVzizHRKTlu/TZi7kbNXaROf+1A8ovOfKVpIj75LirTMFEVAKoZfOYxJL5RZ97x7IAAImvnTiBpX4RJnYfsWes2eRMjd5KwVuf8/P38xagfHknGzsLrXEw0Yo+XtOIy9xGW36ozlr7Rr0BkQ13Iu9tuhuCqLlf2tgmR5ags1ZnLWz52OTxyRSmZwRWdEF0r1Us79uf6ctfcSmK7EIIfINIpQVzmPURuJ962oq9BNj9aZkvTaXh/drd1HQR/wpUs/jgYANTPL2NXOIe2tmdoa3uGpONCGuqi/T1S5yxrpqKsFljf9aOJRqNuKu2jTug3cScN80rRjq8Tpk7Jme5OBpdfrbMXf7hfAyW7Be9LCVPjCFPjOlP4Tzb0gttaicx00OasOkudg8lMkXU1qf7xEGsnocHpQNS1vSIL9byfNBVCEmj10g+A2zqfCygRKlNpMhMKDkQaphm8+yxBNDE7Q/cPKv1vCqsW/SrUbcounfAkfHqc1NUFhfWQtlHD8HYCIpU532zVwRRf+xwVSTOq9+W81kiU45nYPqiwQCJ/BIE5McvC70LlsYLXE54b04F3T6DamvUaORW/e0ShY8hwMEfneMeLdLS/W2geWlvricveQf2/cna5Y3GmwB6SSVIEZmR2ZrIZ0Uy/lN3S+iHqX896SFBF8mFUMCDSMM0QymCgNCegvo8N+6X0h7MJsCPn45SiZlBvA+sBeMjhMTC0R967lXSqf4BUpBNgZ04KHBAHIxm9xRQGSOlgQQLpqQTysIceRfv2QQLSu/uGQtBDh4iXwsWQCkmAHsmXVJFK965E2FGmBJKg2t6ZQ6QWYuRu1tScKatrBn/yBLEpwrlh3WOcbue9Ma4gQHRyrcVqC0JuzlFFaHsHpGRSB2HqSdSuwSavoeoIzFQkWIf4Wrmn5iRpuLpiv3ba4xjJCfDQjvoWra31hdtlwrAD1R05e/94dEivIrtWVzu9eNnzxKkFxPEt2I6H8XYHSikSzsNrPRl/mayZd5ysvPL/2y4JypHgM9kf/FbiKFO4JQMQxk14+3qOuS9Qlozusya5+M56goobEL8En/lrJ2RzHIQ/xnXcSkV0idxzzZie8UXq6gK8H4uYE3KqdJvxqbbCAlH/X1zmhRwPqQQ5q8/mUNWZSzYRlSwnMNdh07eDfx8xQwjjb+DdTTh3E6trugu3ibtSBHoaItlETPVpbI73FgTI6KE7MeG/QVtyJjJLGuriA1Sw7Tp9+eOE5Yvx/nJc+j4Ui0mNR2UCIqU9krJKkItyPtQOCF6i/LTWggLRybUWiTbjMlmlKeHJuOZZeUnJpy/ZQbxtHRpei3c1oM8g5mHaOl7pdqFxFyNBznLJvAj6Zl/qtwdeD6ko+Tv4pxA+eniEt7XS8KMh+al33OuYveIt4hG/JdTzgV/rFb/a3cX/0euGgi7IObPJIMF6UvErfcqC8lJTrZ87BdoXEZZ8MSfKr2L08O8cjOPGruc+tzLi1U0PAtnDMJtuJEjd0Nfqe35qqkdUbiQIN3aT396fz5ad10rDvNKDAqN+QTmbX74F1XOzz7Q7CMP1jB36Ql/t5gWITq61xHE9vuOJrlJeEA7FZS4lSc+SVd8fnl8Y3zuMoP1yvLu0q+Kuvh21jYTR/Qfilfk9qFpdMxW1P8XEJ2VVaPIGEvyeuLSeTRX/6W3muJfCTo85BnGXoX42Jvoo53HYZCOBuUlnrnjygN4h70eZa+fOwLolBMGorCu7rXj7KGoewEdP6Jxlzb2zK8LvrhlBpGeC+xZBOBUJhuUslVcIouuZvuyhAXWUCXv6QSpLZpD4+RhzfG7FApv+JxJsxMQbEPs3vWTFlv3au3v+UZj0JKybgudLhPGxkNNjou4FVBYxdviDA+6wu0f0n4xLL8CkvtKztoVLv4qzbxGmXseEL5Px24hkJz7YjdpygnAkoiNxmRNxmXEEZhwmNZ7sUccez0g/RFByG6Mrn83XbnbwGmYaphnSo44nSK6C1PRuaXWuInXJdpQO0AT1dk+zTAoNSgijw4B9HTi1oJmVEK5kxp2vHegyKQiQLtF1zM4KRM5A7TxMNPmAWqogjcusIzRLyTQ/z+z63Up+X6BwTXd/XlBOc+ZCrJ8DejIEZQQSdmt+2TuaKl4t6C4CeRrVlaSHNeqcmzsO2jz7pS1zdc3hhHIuXqegbgzODUY17syLxCOkCaMWkLcxUSPONer0O7YWZG4D4U+IsqEupKltGJZywvYW7LbmfPWMHZJABtIo9roXgRSBFIEUgRSBFIEUgRSBFIEUgRSBFIF8Csb/APX46d9PvALBAAAAAElFTkSuQmCC\n"}}
                                       style={{height: fontSize(20), width: fontSize(20), resizeMode: 'contain'}}
                                   />
                                   <Text style={TASK_DATA_HEADER}>
                                       { translate('task.cleaningDueDate') }
                                       {"\n"}
                                       {this.props.item.cleaningDueDate}
                                       </Text>
                               </View>
                           </View>

                           <View style={hr}/>

                           <View style={{ paddingLeft: fontSize(10), paddingRight: fontSize(10), flexDirection: 'column', justifyContent: "space-between", height: fontSize(45) }}>
                               <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(20)}}>
                                   <Image
                                       source={{uri: "data:image/png;base64,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\n"}}
                                       style={{height: fontSize(20), width: fontSize(20), resizeMode: 'contain'}}
                                   />
                                   <Text style={[TASK_DATA_HEADER, {width: 30}]}>{"\nWF"}</Text>

                                   <Text style={TASK_DATA}>
                                       {this.props.item.summary.wfBags} {translate("task.bags")}
                                   </Text>
                               </View>

                               <View style={{flexDirection: 'row', alignItems: 'center', height: fontSize(20)}}>
                                   <Image
                                       source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAB3RJTUUH4gkFCB0lF+1riQAABYJJREFUeNrt239sXWUZwPHv877nx721K3VD1y5zQzGyUDezP0aMBl3GHwgGsql3rMsgkBCqQDqY4oyLKSVRiUsLdECyxcCY0IkVdAuELAQYgmHWRIQhRKZEZZss2o6tQO8957zvwx8Xthj8Yw1dW9r3/e/mnDzn3E/e9znP+5x7RVUJ4+QwgSCABJAAEkACSAAJIAEkgASQAPIRHNFkXFS6uw2th0s02pRMUozklJN3qNxWVSZ3tznhM0T2dkd85ugyGuydSHyAUnyYyLxIVtzBgxuWCMjMWjIHh8/DuHuxyRU4N0pRewn1BmuuxuU72Lnh3MkEkYnsh8jAakt1zm+xyYX4fBBrH0TjfyHZ2Ti/DhsvwWe7SVZUtFJxM2CGLFxAnH4dlx8kiu4hOnK3ru3dResn+jD2PnxxFJuuhMEFM2PJuKwVRdDiMNgntfIrB6DLuwri+Dm8fwtFcMXCmfGUsdW/kMebiJO/0dJ88H+x3DkYW66vLXd0RswQrWw9Rqx9NJtduryrABAQ6V9/MXntOow9E/QlzJxXZkRS/WCS7U4ohjvw7rtI9CkMDvwFuqbvmRlXqQoIxdCF+KIDE80H/yqilcnEmNzS/ZGOMq5YjInb8MU+YtvOZX27Z+5eZqQ8C/wn68nFP8to/vpkl+2TBiK7N85C8vNRFgPgfRvIebL95tJkg0x4UpWBmz5NXl2HL1YSpUtPHMhr+0ji3+DNDm2//ci0B5HubsPZQxdBdiUmWYFIGZc9BewDVmDTL6P+GD7bg2nYztreJxR0WoLIzhvmIr6TPL+UOG3DFUdAtoP8gqR2CJ+eheNq0Msxtoki+xNR8jBpsVVX3Tk0bUAEhP71y/HZTUj0RYz9OOr2o/pDksZnqNx6XEHr513bjEYXYOQ2lHmoG0bdU0RpD2tuH5yo2XLaQGTgB2dQjHbgim9j4oUIBvReIvs9Xj7jTe3q8v93WX1uZDZa24LYNQiKLw5gbQ9Z8oBevvntjxyIbOuIaWr8PG50Izb5FqoF6v6BpJu0veehU4rxWGfKcVmL85vALEAENLsPW97M3KbX3i/7pzyIbL+uhRJfw5uNGHsOeXYQI49TKm/mmz1/HUudIQOrLW7+UlxtA8pyorgF7/fj9Ra87tUrTk9uGRcQ2dYR05guxWVXEZeuwvkMLf5MbO/HxL/WSu+wPNaZ4mr2lIOOziu00pXJwPdbyEfbUbcGiRZjjKGo3kWU3E/LnP3jPVs+NIiAsPOGb+DdjzD2C/j8ddQ/gk37GRn9g16zNZed17fh8q+AfmwMnYk3icu/08t6XpWB1QnFvK/iqu2Y6BIkOhMtnsXbH7Pujj3jmXA/PMjDN7byTrYLGy/DF39E/M+JS49qpffQiXP6O29FuRZjZp1yYF8cwUivtm/52Yk4v7zxLHx+Kco1GLsIV+whtVdqpe8/U6dBlOt8VFvqd2yfxpaep5A50r++gXj2v7XS9RaqCzBmbGW5iZpA5wHIA51NJKYVjVOsPofqIlTa8G4uRUMrMIVAkvifFNlIvetVu4ii+qX6F7KvkQ9tAQYRBGXsLxj8+9NXllGrfQc/2lr/aGZjU4+RY5TiQ1Orhbiq8b/05zcD24hKbSdbgnmMs43j02qLmtFiEXF6Mr66v0Opl1U/HYafTB0QpcvLge6HOPfYEzhdgvcN9ch2hCx/eVzuMq3+HpdcfyJ2rG8TRy/wQvPx8W4ZjEuT+b2qcxjYezpqA63c9QbwxgcOrJxODaIpOgJIAAkgASSABJAAEkCmOYjkyBh3dqq+/vJ7YsfE/D7EMkhW/SwiY9nsDRGnL05PkIIdmPQVhDGAyFHK6fMTDSLhT4ghqQaQABJAAkgACSABJIAEkAASQAJIAJnu410FaUq4gakh+gAAAABJRU5ErkJggg==\n"}}
                                       style={{height: fontSize(20), width: fontSize(20), resizeMode: 'contain'}}
                                   />
                                   <Text style={[TASK_DATA_HEADER, {width: 30}]}>DC</Text>

                                   <Text style={TASK_DATA}>
                                       {this.props.item.summary.dcItems} {translate("task.pieces")}
                                       {"\n"}
                                       {this.props.item.summary.dcBags}  {translate("task.bags")}
                                   </Text>
                               </View>
                           </View>
                   </View>
               </TouchableHighlight>
    }
}

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchReferenceRequest: (reference) => {
            return dispatch(actions.searchReferenceRequest(reference));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardCard);