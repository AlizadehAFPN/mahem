import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import {RowPresetsType} from './row.presets'
export interface RowProps {
  /**
   * Children components.
   */
  children?: React.ReactNode

  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  preset?: RowPresetsType

}
