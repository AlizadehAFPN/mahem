import * as React from "react"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Text } from "../text/text"
import { colors, } from "../../theme"
import { CheckboxProps } from "./checkbox.props"
import IonIcon from 'react-native-vector-icons/Ionicons'


const ROOT: ViewStyle = {
  flexDirection: "row-reverse",
  marginVertical: 4,
  alignSelf: "flex-end",
  alignItems:'center'
}

const DIMENSIONS = { width: 20, height: 20 }

const OUTLINE: ViewStyle = {
  ...DIMENSIONS,
  marginTop: 2, // finicky and will depend on font/line-height/baseline/weather
  justifyContent: "center",
  alignItems: "center",
  borderColor: colors.text,
  borderRadius: 10,
  overflow:"hidden"
}

const FILL: ViewStyle = {
  width: DIMENSIONS.width,
  height: DIMENSIONS.height,
  backgroundColor: colors.main,
  justifyContent: 'center',
  alignItems: 'center'
}

const LABEL: TextStyle = { paddingHorizontal: 8, fontSize: 17 }

export function Checkbox(props: CheckboxProps) {
  const numberOfLines = props.multiline ? 0 : 1

  const rootStyle = [ROOT, props.style]
  const outlineStyle = [OUTLINE, { borderColor: props.disabled ? colors.darkGray : props.value ? colors.main : colors.darkGray, }, props.outlineStyle]
  const fillStyle = [FILL, props.fillStyle, { backgroundColor: props.value ? props.checkedColor|| colors.main : colors.pallete.gray2 , }]
  const textStyle = [LABEL, props.labelStyle]
  const onPress = props.disabled ? null : props.onToggle ? () => props.onToggle && props.onToggle(!props.value) : null

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!props.onToggle}
      onPress={onPress}
      style={rootStyle}
    >
      <View style={outlineStyle}>
        <View style={fillStyle}>
          {props.value &&<IonIcon name='checkmark' color='white' size={16} />}
        </View>
      </View>
      <Text numberOfLines={numberOfLines} style={textStyle}>
        {props.text}
      </Text>
    </TouchableOpacity>
  )
}
