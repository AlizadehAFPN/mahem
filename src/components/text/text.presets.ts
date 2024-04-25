import { TextStyle } from "react-native"
import { boldFont, colors, mediumFont, normalFont } from "../../theme"

/**
 * All text will start off looking like this.
 */
const BASE: TextStyle = {
  fontFamily: normalFont,
  color: 'black',
  fontSize: 13,
  textAlign:'right'
  // lineHeight: 20
}

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
  bold: { ...BASE, fontFamily: boldFont } as TextStyle,

  /**
   * Large headers.
   */
  header: { ...BASE, fontSize: 30, fontFamily: boldFont } as TextStyle,

  /**
   * Field labels that appear on forms above the inputs.
   */

  /**
   * A smaller piece of secondard information.
   */
  checkBoxLabel:{
    ...BASE,
    // paddingHorizontal: 8
  }as TextStyle,
  secondary: { ...BASE, fontSize: 9, } as TextStyle,
  caption: { ...BASE, fontSize: 9, } as TextStyle,

  button:{...BASE, color: "white"},

  badgeLabel:{...BASE, fontSize: 12} as TextStyle,
  description:{...BASE} as TextStyle,
  productname:{ ...BASE} as TextStyle,
  medium: {...BASE, fontSize: 12, fontFamily: mediumFont} as TextStyle,
  price:{...BASE, fontFamily: mediumFont, fontSize: 14 } as TextStyle
}

/**
 * A list of preset names.
 */
export type TextPresets = keyof typeof presets
