import { StyleSheet } from 'react-native';
import { colors } from './../../constants/base-style.js';
import { fontSize } from './../../constants/util'

export const styles = StyleSheet.create({

    content: {
        flex: 0.4,
        alignItems: "center",
        flexDirection: "column",
        width: '100%',
        height: '25%'
    },

    input: {
        backgroundColor: colors.white,
        fontFamily: "WorkSans-Regular",
        paddingVertical: 0,
        height: 33,
        width: '100%',
        textAlign: "left",
        fontSize: 25,
        lineHeight: 33,
        marginLeft: 9,
    },

    searchButton: {
        width: '100%',
        height: 20,
    },

    clearButtonWrapper: {
        width: '80%',
        height: 30,
        borderWidth: 2,
        borderColor: colors.blueGrey,
    },

    itemName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    itemCode: {
        fontWeight: '600',
        fontSize: 12,
        color: '#fff',
    },

    headingLeftItems: {
        color: colors.dark,
        fontSize: 9,
        lineHeight: fontSize(9),
        letterSpacing: 0.4,
        flex: 1,
    },
});