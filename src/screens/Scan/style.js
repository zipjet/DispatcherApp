import { StyleSheet } from 'react-native';
import { colors, FontFamily } from './../../constants/base-style.js';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafc"
    },

    content: {
        flex: 0.75,
        alignItems: "flex-start",
        flexDirection: "column",
        width: '100%',
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

    logo: {
        width: '100%',
        height: '20%',
        resizeMode: 'contain',
    },

    submitWrapper: {
        marginTop: '5%',
        width: '100%',
        height: '20%',
        flex: 0.35,
    }
});