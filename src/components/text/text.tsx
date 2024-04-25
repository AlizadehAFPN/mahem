import * as React from "react"
import { Text as ReactNativeText } from "react-native"
import { presets } from "./text.presets"
import { TextProps } from "./text.props"
// import { translate } from "../../i18n"
import { colors } from "../../theme"

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function Text(props: TextProps) {
  // grab the props
  const { preset = "default", text, children, style: styleOverride, ...rest } = props

  // figure out which content to use
  // const i18nText = tx //&& translate(tx, txOptions)
  // const i18nChild = children&& typeof children == 'string'? translate(children, txOptions):children
  const content =  text || children

  const style = presets[preset] || presets.default
  const styles = [style,{color: props.color? props.color: colors.text, fontSize: props.size}, styleOverride, ]

  return (
    <ReactNativeText {...rest} style={styles}>
      {content}
    </ReactNativeText>
  )
}
