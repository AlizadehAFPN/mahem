import React from 'react';
import {View} from 'react-native';
import {CircularProgressWithChild} from 'react-native-circular-progress-indicator';
import {scaled} from '../../theme';
// The discount percentage ring on the offer cards. Its radius is scaled here
// rather than by each caller, for the same reason the Text component scales its
// own `size`: the callers pass a Figma measurement and shouldn't have to know
// what device they're on.
export interface CircleSliderProps {
  value?: any;
  radius?: any;
  children?: React.ReactNode;
  res?: any;
  // Everything else is forwarded verbatim to the component underneath
  // (a `...prp` rest parameter, or the underlying library's own props).
  // Declaring that here is what lets callers keep passing style,
  // zoomEnabled, radius and the rest — they were never this component's
  // props to begin with.
  [key: string]: any;
}

export const CirleSlider = ({
  value,
  radius = 40,
  children,
  ...res
}: CircleSliderProps) => {
  return (
    <View>
      <CircularProgressWithChild radius={scaled(radius)} value={value} {...res}>
        {children}
      </CircularProgressWithChild>
    </View>
  );
};
