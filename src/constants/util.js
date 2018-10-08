import {Dimensions} from 'react-native'

const { width, height } = Dimensions.get('window');

const baseWidth = 270;
const baseHeight = 480;

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

export const fontSize       = (size, fixedSize) => Math.ceil(size * scale + (fixedSize === undefined ? 0 : fixedSize));
