import React from "react"
import { ViewStyle } from "react-native"

const BASE: ViewStyle = {
  // justifyContent: "space-between",
  alignItems: "center",
  flexDirection:'row-reverse' //i18n.locale=='fa'? 'row-reverse': 'row' 
}

export const presets = {
    default:BASE,

    spacing:{
        ...BASE,
        paddingHorizontal: 16,
        marginVertical:8,
    } as ViewStyle,
    side:{
      ...BASE,
      justifyContent:'space-between',
      alignItems:'center'
  } as ViewStyle
}

export type RowPresetsType = keyof typeof presets