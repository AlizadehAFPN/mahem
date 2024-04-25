import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Button, Divider, MainHeader, Screen, Text } from '../../../components'
import { numberWithCommas } from '../../../utiles'
import { colors } from '../../../theme'

export function CreateOfferMarketPay() {
    return (
        <Screen style={{flex:1}}>
            <MainHeader title="تخفیف یاب" />
            <Divider />
            <View style={{paddingHorizontal: 12}}>
                <Text size={17} style={{ textAlign: 'center' }} >ثبت فروشگاه تخفیف یاب رایگان نیست و بصورت اشتراک ماهانه است.</Text>
                <Divider />
                <Text size={17}>هر فروشگاه فقط می تواند توی یک صنف فعالیت کند درغیر اینصورت شرکت ماهم می تواند فروشگاه اش رو ببندد.</Text>
                <Divider height={50} />
                <Text color={colors.main} size={17} style={{ textAlign: 'center' }}>هزینه ثبت فروشگاه {numberWithCommas(300000)} تومان</Text>
            </View>
            <Button style={styles.button}>
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