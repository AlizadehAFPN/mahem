import {ViewStyle} from 'react-native';
import {scaled} from '../../theme';

const BASE: ViewStyle = {
  // justifyContent: "space-between",
  alignItems: 'center',
  // Reversed rather than RTL: the app's base layout direction is pinned to
  // left-to-right on both platforms (AppDelegate.mm / MainActivity.java), so
  // this reversal is the one and only thing deciding that rows read
  // right-to-left. It has to stay that way — on a phone set to Persian the
  // system would otherwise flip the base direction under it and this would
  // reverse a reversal, drawing every row left-to-right.
  flexDirection: 'row-reverse',
};

export const presets = {
  default: BASE,

  spacing: {
    ...BASE,
    paddingHorizontal: scaled(16),
    marginVertical: scaled(8),
  } as ViewStyle,
  side: {
    ...BASE,
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
};

export type RowPresetsType = keyof typeof presets;
