import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Row } from '../'
import IonIcons from 'react-native-vector-icons/Ionicons'
import { colors } from '../../theme'

export function Rate({rate=0}) {
  return (
    <Row style={{flexDirection:'row'}} >
      {[1,2,3,4,5].map((item, index)=>
      <IonIcons style={{marginHorizontal: 2}} size={18} color={index<rate? colors.pallete.yellow:"white"} name={index<rate?"moon":"moon-outline"} />
       )}

    </Row>
  )
}

const styles = StyleSheet.create({})