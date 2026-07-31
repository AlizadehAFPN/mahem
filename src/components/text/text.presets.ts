import {TextStyle} from 'react-native';
import {boldFont, mediumFont, normalFont, scaled} from '../../theme';

/**
 * All text will start off looking like this.
 *
 * Every fontSize below goes through `scaled()`. On a device the size of the Figma
 * artboard or larger that returns the number unchanged, so these presets are
 * literally the same objects they have always been; below it they shrink in
 * step with the boxes they sit in, which is the point — text that shrank while
 * its container didn't (or the reverse) would overflow harder, not less.
 */
const BASE: TextStyle = {
  fontFamily: normalFont,
  color: 'black',
  fontSize: scaled(13),
  textAlign: 'right',
  // lineHeight: 20
};

/**
 * All the variations of text styling within the app.
 *
 * You want to customize these to whatever you need in your app.
 */
export const presets = {
  /**
   * The default text styles.
   */
  default: BASE,

  /**
   * A bold version of the default text.
   */
  bold: {...BASE, fontFamily: boldFont} as TextStyle,

  /**
   * Large headers.
   */
  header: {...BASE, fontSize: scaled(30), fontFamily: boldFont} as TextStyle,

  /**
   * Field labels that appear on forms above the inputs.
   */

  /**
   * A smaller piece of secondard information.
   */
  checkBoxLabel: {
    ...BASE,
    // paddingHorizontal: 8
  } as TextStyle,
  secondary: {...BASE, fontSize: scaled(9)} as TextStyle,
  caption: {...BASE, fontSize: scaled(9)} as TextStyle,

  button: {...BASE, color: 'white'},

  badgeLabel: {...BASE, fontSize: scaled(12)} as TextStyle,
  description: {...BASE} as TextStyle,
  productname: {...BASE} as TextStyle,
  medium: {...BASE, fontSize: scaled(12), fontFamily: mediumFont} as TextStyle,
  price: {...BASE, fontFamily: mediumFont, fontSize: scaled(14)} as TextStyle,
};

/**
 * A list of preset names.
 */
export type TextPresets = keyof typeof presets;
