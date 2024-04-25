import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Button, Divider, MainHeader, Screen, Text } from '../../../components'
import { numberWithCommas } from '../../../utiles'
import { colors } from '../../../theme'
import { useNavigation } from '@react-navigation/native'

export function CreateAddsPayScreen() {
    const {replace} = useNavigation()
    return (
        <Screen style={{flex:1}}>
            <MainHeader  />
            <Divider />
            <View style={{paddingHorizontal: 12}}>
                <Text size={17} style={{ textAlign: 'center' }} >ثبت در زیرمجموعه استخدامی و تخفیف یاب رایگان نیست.</Text>
                <Divider height={50} />
                <Text color={colors.main} size={17} style={{ textAlign: 'center' }}>هزینه ثبت  {numberWithCommas(7000)} تومان</Text>
            </View>
            <Button onPress={()=> replace("userOfferMarketScreen")} style={styles.button}>
                <Text size={17} color='white'>پرداخت</Text>
            </Button>
        </Screen>
    )
}

const styles = StyleSheet.create({
    button:{
        backgroundColor:colors.main,
        height: 48,
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        justifyContent:'center',
        alignItems:'center'
    }
})