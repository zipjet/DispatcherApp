import { StyleSheet } from 'react-native';
import { colors } from './../../constants/base-style.js';
import { fontSize } from './../../constants/util'

export const styles = StyleSheet.create({
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