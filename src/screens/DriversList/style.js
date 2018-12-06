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
        fontSize: fontSize(13),
        lineHeight: fontSize(13),
        letterSpacing: 0.4,
        flex: 1,
    },
});