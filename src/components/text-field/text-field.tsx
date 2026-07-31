import React, {useState} from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {colors, normalFont, scaled} from '../../theme';
import {Text} from '../text/text';
import {Row} from '../row/row';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  formatThousandSeparators,
  stripThousandSeparators,
  toEnglishDigits,
} from '../../utiles/utiles_funcs';

const NUMERIC_KEYBOARD_TYPES = [
  'number-pad',
  'numeric',
  'decimal-pad',
  'phone-pad',
];
const NUMERIC_INPUT_MODES = ['numeric', 'decimal', 'tel'];
// The error row is normally added to the layout only once there is an error,
// which shoves everything under the field downwards the moment validation
// fails. `reserveErrorSpace` keeps this much room set aside from the start so
// the message just appears in place — one line's worth, sized off the 18px
// warning icon rather than the 13pt text since the icon is the taller of the
// two. minHeight rather than height because a message long enough to wrap
// should still grow into a second line instead of spilling over whatever sits
// underneath it; single-line messages (all of the validation ones) never move
// anything.
const ERROR_ROW_MIN_HEIGHT = scaled(22);
const ERROR_ROW_MARGIN_TOP = scaled(5);
// the base styling for the container
const CONTAINER: ViewStyle = {
  // paddingVertical: spacing[3],

  borderRadius: scaled(16),
  // borderColor: colors.darkGray,
  // minHeight: 55,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: scaled(8),
};

const Label: ViewStyle = {
  position: 'absolute',
  top: scaled(-10),
  right: scaled(20),
  backgroundColor: 'white',
  paddingHorizontal: scaled(8),
};

// the base styling for the TextInput
const INPUT: TextStyle = {
  fontFamily: normalFont,
  color: colors.text,
  paddingHorizontal: scaled(8),
  fontSize: scaled(18),
  // backgroundColor: colors.palette.white,
  flex: 1,
  // borderWidth: 1,
  // borderRadius: 5,
  // borderColor: colors.darkGray,
};

// Where a field's text sits vertically, and why only Android needs telling.
//
// Every number here is read off IRANSansMobile itself rather than guessed. The
// font reserves a 0.717em descent for deep Persian descenders (ج reaches
// -0.34em) against a 0.870em ascent, while the ink of digits and Latin runs from
// the baseline to +0.73em and so centres at +0.343em above it. Android draws a
// single line by centring its *line box* in the input, which puts that ink above
// the middle of the field — the text looks stuck to the top, worst of all in the
// phone fields, where every glyph is a digit.
//
// Two boxes are possible and they are not the same distance out:
//
//   includeFontPadding: true (Android's default) → box from the glyph bounding
//     box (+1.063em/-0.689em), centred at +0.187em → text 0.156em high.
//   includeFontPadding: false → box from ascent/descent, centred at +0.076em
//     → text 0.267em high.
//
// So the correction pins the box to the second, known one and then moves the
// text down by exactly that 0.267em: the result is arithmetic rather than a
// magic number, and it centres the *body* of the text — baseline to cap height —
// which is what the eye reads as its mass. Persian descenders then hang below
// the middle, which is where they belong.
//
// iOS is deliberately left alone. It places a single line optically and already
// looked right; correcting it as well pushed its text visibly low. This is a
// difference in how the two text engines lay out a line, not in the design, so
// the platform check belongs here in the one component every field goes through.
const INK_CENTERING_EM = 0.267;
const DEFAULT_FONT_SIZE = scaled(18);

function androidInkCentering(
  inputStyle: StyleProp<TextStyle>,
): TextStyle | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  const {fontSize = DEFAULT_FONT_SIZE} = StyleSheet.flatten([
    INPUT,
    inputStyle,
  ]);
  const shift = fontSize * INK_CENTERING_EM;
  return {
    // Pins the line box to ascent/descent, so the offset corrected below is the
    // exact figure above and not one that varies with how much extra leading the
    // platform decides to reserve.
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    // A margin pair, not padding: Android's single-line EditText centres its
    // text in the box, so vertical padding moves nothing. This is plain flexbox
    // — the box that gets centred moves down by `shift` and hands the same
    // amount back at the bottom, so the field's own height is untouched.
    marginTop: shift,
    marginBottom: -shift,
  };
}

// Phone numbers are read left-to-right whatever the language around them is, so
// they sit against the left edge of the field rather than following the RTL copy
// — an app-wide rule, opted into with the `phoneNumber` prop. Applied after the
// caller's inputStyle so it also wins over UnderlineTextField, which hard-codes
// textAlign: 'right' for every field it wraps.
const PHONE_INPUT: TextStyle = {
  textAlign: 'left',
  writingDirection: 'ltr',
};

// currently we have no presets, but that changes quickly when you build your app.
const PRESETS: {[name: string]: ViewStyle} = {
  default: {
    borderWidth: 1,
    height: scaled(55),
  },
  full: {
    width: '100%',
    height: scaled(50),
    borderWidth: 1,
    borderRadius: scaled(5),
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
  /**
   * Reserve the error message's space up-front so showing it doesn't move the
   * rest of the screen. Opt-in, because on a form where the field is followed
   * by more fields the shift is invisible anyway, and the empty row would only
   * add spacing that isn't in the design.
   */
  reserveErrorSpace?: boolean;
  /**
   * This field holds a phone number: align it (and its placeholder) to the left,
   * left-to-right, wherever it appears. Set it on every phone/mobile/fax field
   * rather than styling them one at a time.
   */
  phoneNumber?: boolean;
  /**
   * This field holds a money amount: group its digits in threes with commas
   * ("1,500,000") while the user types. Display-only — onChangeText still
   * receives the plain digits, so the screen's state, validation and request
   * body are unchanged. Set it on price/rent/mortgage fields only; never on
   * phone numbers, codes, years or counts (see stripThousandSeparators).
   */
  thousandSeparator?: boolean;
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
    reserveErrorSpace,
    phoneNumber,
    thousandSeparator,
    borderColor,
    onChangeText,
    ...rest
  } = props;

  const containerStyles = [CONTAINER, PRESETS[preset], styleOverride];
  const inputStyles = [
    INPUT,
    inputStyleOverride,
    // Only the presets whose container has a height of its own centre the input
    // inside themselves, so they're the only ones with anything to correct — an
    // underline field is as tall as its own text, and there is no box for the
    // text to be off-centre in.
    preset !== 'underline' && androidInkCentering(inputStyleOverride),
    phoneNumber && PHONE_INPUT,
  ];
  const actualPlaceholder = placeholder;
  const border = borderColor || colors.darkGray;
  // Every numeric field in the app goes through this one component, so
  // normalizing Persian/Arabic-Indic digits to English here (rather than in
  // each screen) means it's handled everywhere at once — see toEnglishDigits.
  // A money field is numeric whether or not the caller remembered to ask for a
  // numeric keyboard, since the grouping below only makes sense over digits.
  const isNumeric =
    !!thousandSeparator ||
    (!!rest.keyboardType &&
      NUMERIC_KEYBOARD_TYPES.includes(rest.keyboardType)) ||
    (!!rest.inputMode && NUMERIC_INPUT_MODES.includes(rest.inputMode));

  // What the screen gets to keep: English digits, and — for a money field —
  // without the commas this component itself drew, so `thousandSeparator` stays
  // invisible to every caller's state, validation and request body.
  const normalizeInput = (text: string) =>
    thousandSeparator
      ? stripThousandSeparators(toEnglishDigits(text))
      : toEnglishDigits(text);

  // Converting only the text handed to onChangeText fixes the value the screen
  // *stores* but not the one the user *sees*: a TextInput with no `value` prop
  // is uncontrolled and keeps rendering the raw characters that were typed, so
  // Persian digits stayed sitting in the field even though state already held
  // the English ones. Numeric fields are therefore rendered controlled off the
  // normalized text, which is what makes the conversion actually visible.
  const [numericText, setNumericText] = useState(() =>
    normalizeInput(String(props.value ?? '')),
  );
  const handleChangeText = isNumeric
    ? (text: string) => {
        const normalized = normalizeInput(text);
        setNumericText(normalized);
        onChangeText?.(normalized);
      }
    : onChangeText;
  // A caller that drives `value` itself stays the source of truth (normalized
  // for display); one that doesn't is driven by the state above.
  const numericValue =
    rest.value !== undefined ? normalizeInput(String(rest.value)) : numericText;
  // Grouping goes on last, over digits that are already normalized, so it only
  // ever affects what is rendered.
  const displayValue = thousandSeparator
    ? formatThousandSeparators(numericValue)
    : numericValue;
  // A non-editable TextInput is typically used as a fake "picker trigger"
  // wrapped in a Button/TouchableOpacity (city/category/option selects) —
  // but a TextInput still captures touches itself even when non-editable,
  // so taps landing on it never reached the wrapping Button's onPress at
  // all. Letting touches pass straight through to the parent is what makes
  // the wrapping Button's own tap-vs-scroll gesture handling actually work.
  const pointerEvents =
    rest.pointerEvents ?? (rest.editable === false ? 'none' : undefined);
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
            preset="default"
            text={label}
          />
        )}
        <TextInput
          placeholder={actualPlaceholder}
          placeholderTextColor={colors.pallete.gray2}
          underlineColorAndroid={colors.transparent}
          style={inputStyles}
          ref={forwardedRef}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={() => setFocused(false)}
          {...rest}
          // After {...rest} so it overrides the caller's own `value` with the
          // digit-normalized (and, for money fields, grouped) copy; non-numeric
          // fields are left untouched.
          {...(isNumeric ? {value: displayValue} : null)}
          onChangeText={handleChangeText}
          pointerEvents={pointerEvents}
        />
      </View>
      {(error || reserveErrorSpace) && (
        <Row
          style={[
            {marginTop: ERROR_ROW_MARGIN_TOP},
            !!reserveErrorSpace && {minHeight: ERROR_ROW_MIN_HEIGHT},
          ]}>
          {!!error && (
            <>
              <FontAwesome
                size={scaled(18)}
                color={colors.error}
                name="warning"
              />
              <Text style={{paddingHorizontal: scaled(4)}} color={colors.error}>
                {error}
              </Text>
            </>
          )}
        </Row>
      )}
    </View>
  );
}
