import { StyleSheet } from 'react-native';
import { colors, FontFamily } from './../../constants/base-style.js';
import { fontSize } from '../../constants/util';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFC",
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    form: {
        width: '80%',
        height: '40%',

        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center',
    },

    content: {
        flex: 0.75,
        alignItems: "flex-start",
        flexDirection: "column",
        width: '100%',
    },

    vertical_label: {
        width: '100%',
        marginBottom: '3%',
        textAlign: "center"
    },

    input: {
        backgroundColor: colors.white,
        fontFamily: "WorkSans-Regular",
        fontSize: 14,
        paddingVertical: 0,

        height: '40%',
        width: '100%',
    },

    email: {
        paddingLeft: 10,
    },

    password: {
        paddingLeft: 10,
    },

    logoWrapper: {
        width: '60%',
        height: '25%',
    },

    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});