import {StyleProp, TouchableOpacity, ViewStyle} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

interface HeaderBackButtonProps {
  // Overrides the default navigation.goBack() — for screens where "back" has
  // to mean something else (e.g. the create-ads final screen, which resets
  // the stack instead of popping back into a finished checkout).
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

// The same right-pointing chevron MainHeader/GradiantHeader/ChatHeader use,
// pulled out on its own for the screens that draw their own red band instead
// of taking one of those headers (auth, edit-profile, the payment steps).
// Every screen that is pushed onto a stack needs a visible way back, and
// hand-rolling the arrow per screen is how several of them ended up without
// one.
export function HeaderBackButton({
  onPress,
  color = 'white',
  size = 26,
  style,
}: HeaderBackButtonProps) {
  const {goBack} = useNavigation<any>();
  return (
    <TouchableOpacity
      onPress={onPress ?? goBack}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
      style={style}>
      <MaterialIcons name="keyboard-arrow-right" size={size} color={color} />
    </TouchableOpacity>
  );
}
