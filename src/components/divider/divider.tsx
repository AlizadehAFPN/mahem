import React, {FunctionComponent} from 'react';
import {ViewStyle, StyleProp, View} from 'react-native';
import {scaled} from '../../theme';
interface DividerProps {
  style?: StyleProp<ViewStyle>;
  height?: number;
}

// The app's vertical spacer — `<Divider height={16} />` between rows rather
// than a margin on each of them, in some fifty places. Scaling the height here
// instead of at those call sites is what makes the gaps between things shrink
// in step with the things themselves: left alone they would be the one
// measurement holding at full size while everything around them came in, and on
// a 533pt-tall screen that is what pushes the last field of a form off the
// bottom. `scaled` returns the number untouched at the design size, so spacing
// on an ordinary phone is exactly what it was.
export const Divider: FunctionComponent<DividerProps> = ({style, height}) => {
  return (
    <View style={[{width: '100%', height: scaled(height || 20)}, style]} />
  );
};
