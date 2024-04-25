import { StyleSheet, TextInput, View } from 'react-native'
import React from 'react'
import { Row, Button, Text } from '../'
import { colors, normalFont } from '../../theme'
import Entypo from "react-native-vector-icons/Entypo"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export function MessageSender() {
    return (
        <Row style={{paddingHorizontal:10, alignItems:'flex-end', paddingBottom:10}}>
            <Button>
                <Row style={{paddingBottom: 5}}>
                    <Text size={17} color={colors.pallete.green}>send</Text>
                    <View  style={{width:8}}/>
                    <MaterialCommunityIcons name="message-text-outline" size={25} color={colors.pallete.green1} />
                </Row>
            </Button>
            <TextInput
            multiline
                placeholder='افزودن متن'
                style={styles.textinput}
            />
            <Button style={{paddingBottom: 5}}>
                <Entypo color={colors.pallete.gray2} size={25} style={{transform: [{rotate:'180deg'}]}} name="attachment" />
            </Button>
        </Row>
    )
}

const styles = StyleSheet.create({
    textinput: {
        flex: 1,
        fontFamily: normalFont,
        textAlign:'right',
        marginHorizontal:15,
        maxHeight: 200,
        borderBottomWidth:1,
        fontSize:20,
        borderColor:colors.pallete.green
    }
})