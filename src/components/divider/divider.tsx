import React, {FunctionComponent} from 'react';
import {ViewStyle, StyleProp, View} from 'react-native';
interface DividerProps {
  style?: StyleProp<ViewStyle>;
  height?: number;
}

export const Divider: FunctionComponent<DividerProps> = ({style, height}) => {
  return <View style={[{width: '100%', height: height || 20}, style]} />;
};
