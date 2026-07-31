import * as React from 'react';
import {Text as ReactNativeText} from 'react-native';
import {presets} from './text.presets';
import {TextProps} from './text.props';
// import { translate } from "../../i18n"
import {colors, scaled} from '../../theme';

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function Text(props: TextProps) {
  // grab the props
  const {
    preset = 'default',
    text,
    children,
    style: styleOverride,
    ...rest
  } = props;

  // figure out which content to use
  // const i18nText = tx //&& translate(tx, txOptions)
  // const i18nChild = children&& typeof children == 'string'? translate(children, txOptions):children
  const content = text || children;

  const style = presets[preset] || presets.default;
  const styles = [
    style,
    {
      color: props.color ? props.color : colors.text,
      // `size` is the app's usual way of setting a font size — there are ~260
      // `<Text size={17}>` call sites — so scaling it here is what carries the
      // change across the app without editing any of them. Left strictly
      // undefined when the caller passed nothing, so an absent `size` keeps
      // falling through to the preset's own fontSize exactly as before rather
      // than resolving to a number.
      fontSize: props.size === undefined ? undefined : scaled(props.size),
    },
    // Not scaled here on purpose: a fontSize written into a style object is
    // already scaled where it is declared (every style object in the app runs
    // its measurements through `scaled()`), and scaling it a second time on
    // the way through this component would compound.
    styleOverride,
  ];

  return (
    <ReactNativeText {...rest} style={styles}>
      {content}
    </ReactNativeText>
  );
}
