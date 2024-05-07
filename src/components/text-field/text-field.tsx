import React, {useState} from 'react';
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {colors, normalFont} from '../../theme';
import {Text} from '../text/text';
import {Row} from '../row/row';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// the base styling for the container
const CONTAINER: ViewStyle = {
  // paddingVertical: spacing[3],

  borderRadius: 16,
  // borderColor: colors.darkGray,
  // minHeight: 55,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
};

const Label: ViewStyle = {
  position: 'absolute',
  top: -10,
  right: 20,
  backgroundColor: 'white',
  paddingHorizontal: 8,
};

// the base styling for the TextInput
const INPUT: TextStyle = {
  fontFamily: normalFont,
  color: colors.text,
  paddingHorizontal: 8,
  fontSize: 18,
  // backgroundColor: colors.palette.white,
  flex: 1,
  // borderWidth: 1,
  // borderRadius: 5,
  // borderColor: colors.darkGray,
};

// currently we have no presets, but that changes quickly when you build your app.
const PRESETS: {[name: string]: ViewStyle} = {
  default: {
    borderWidth: 1,
    height: 55,
  },
  full: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'black',
  },
  underline: {
    borderBottomWidth: 1,
    borderColor: colors.pallete.red2,
  },
};

export interface TextFieldProps extends TextInputProps {
  /**
   * The placeholder i18n key.
   */

  /**
   * The Placeholder text if no placeholderTx is provided.
   */
  placeholder?: string;

  /**
   * The label i18n key.
   */

  /**
   * The label text if no labelTx is provided.
   */
  label?: string;

  /**
   * Optional container style overrides useful for margins & padding.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Optional style overrides for the input.
   */
  inputStyle?: StyleProp<TextStyle>;

  /**
   * Various look & feels.
   */
  preset?: keyof typeof PRESETS;

  forwardedRef?: any;
  labelStyle?: StyleProp<TextStyle>;
  extra?: React.ReactNode;
  error?: string;
  borderColor?: string;
  inputMode?:
    | 'none'
    | 'text'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';
}

/**
 * A component which has a label and an input together.
 */
export function TextField(props: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const {
    placeholder,
    label,
    preset = 'default',
    style: styleOverride,
    inputStyle: inputStyleOverride,
    forwardedRef,
    labelStyle,
    extra,
    error,
    borderColor,
    ...rest
  } = props;

  const containerStyles = [CONTAINER, PRESETS[preset], styleOverride];
  const inputStyles = [INPUT, inputStyleOverride];
  const actualPlaceholder = placeholder;
  const border = borderColor || colors.darkGray;
  return (
    <View>
      <View
        style={[
          containerStyles,
          {borderColor: error ? colors.error : focused ? colors.main : border},
        ]}>
        {extra}
        {label && (
          <Text
            style={[
              Label,
              labelStyle,
              {color: error ? colors.error : focused ? colors.main : 'black'},
            ]}
            preset="fieldLabel"
            text={label}
          />
        )}
        <TextInput
          placeholder={actualPlaceholder}
          placeholderTextColor={colors.pallete.gray2}
          underlineColorAndroid={colors.transparent}
          style={inputStyles}
          ref={forwardedRef}
          onFocus={() => {
            setFocused(true);
            rest.onFocus && rest.onFocus();
          }}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      {error && (
        <Row style={{marginTop: 5}}>
          <FontAwesome size={18} color={colors.error} name="warning" />
          <Text style={{paddingHorizontal: 4}} color={colors.error}>
            {error}
          </Text>
        </Row>
      )}
    </View>
  );
}
