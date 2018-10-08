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
});