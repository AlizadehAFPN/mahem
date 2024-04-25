import React from "react"
import { View} from "react-native"
import { RowProps } from "./row.props"
import { presets } from "./row.presets"

export const Row = ({ style, children, preset = "default" }: RowProps) => {
  const styles = [presets[preset], style]
  return <View style={styles}>{children}</View>
}
