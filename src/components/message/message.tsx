import { Image, StyleSheet, View } from 'react-native'
import React from 'react'
import { colors } from '../../theme'
import { Text } from '../'

export function Message({message, index}) {
  return (
    <View style={{...styles.continer, marginTop: index == 0? 20:0}}>
      <View style={{...styles.message, alignSelf: message.me? "flex-end":'flex-start', backgroundColor:  message.me? colors.pallete.green1: colors.pallete.gray1,  }}>
        <Text size={17}>{message.text}</Text>
      </View>
      <View style={{...styles.avatarContainer, left: message.me? null: 16, right: message.me? 16: null}}>
        <Image style={{...styles.avatar}} source={require('../../assets/images/userMarketAvatar.png')} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    continer:{
        paddingHorizontal:32,
    },
    message:{
        width: '80%',
        padding: 16,
        borderRadius: 16
    },
    avatarContainer:{
        position:'absolute',
        top: -20,
        backgroundColor:'white',
        borderRadius: 10,
        padding: 8,
        height: 42,
        width:42,
        overflow:'hidden',
        zIndex: 1001
    },
    avatar:{
        borderRadius: 8,
        height: 28,
        width: 28,
        overflow:'hidden'
    }
})