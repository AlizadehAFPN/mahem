import React from 'react';
import {TextField, TextFieldProps} from './text-field';
import {colors, scaled} from '../../theme';

/**
 * TextField with the forms' underline styling baked in.
 *
 * Typed as TextFieldProps rather than left to inference: the props were spread
 * straight through from an untyped rest parameter, so every
 * `onChangeText={text => ...}` written against this component — the ad forms
 * use it for nearly every input — got an implicitly-`any` `text`, and none of
 * TextField's own prop names or types were checked at the call site either. A
 * typo in a prop name here silently did nothing.
 */
export function UnderlineTextField(props: TextFieldProps) {
  return (
    <TextField
      borderColor={colors.pallete.red2}
      inputStyle={{
        paddingVertical: scaled(4),
        textAlign: 'right',
        textDecorationColor: colors.main,
        flex: 1,
      }}
      preset={'underline'}
      {...props}
    />
  );
}
