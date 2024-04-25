import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {Row, Text} from '../../'
import { colors } from '../../../theme'

export function CategroyItem({item, onPress}) {
  return (
    <TouchableOpacity onPress={onPress}>
        <Row style={styles.container}>
            <Text size={17}>{item.title}</Text>
            <View/>
        </Row>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container:{
        height: 52,
        backgroundColor: colors.pallete.gray1,
        borderWidth:1,
        borderColor: colors.pallete.gray2,
        borderRadius: 8,
        paddingHorizontal: 16,
        alignItems:'center'
    }
})