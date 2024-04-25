import { Image, StyleSheet, View, Text as RNText, Dimensions } from 'react-native'
import React from 'react'
import { Divider, MainHeader, Screen, Text } from '../../../components'
import { colors } from '../../../theme'
const {width} = Dimensions.get("window")
export function AboutUsScreen() {
    return (
        <Screen withoutScroll>
            <MainHeader title="درباره ما" />
            <View style={{ width: '100%', paddingVertical: 20, backgroundColor: colors.pallete.gray1 }}>
                <Image style={{ width: '100%' }} source={require('../../../assets/images/hlogo.png')} />
            </View>
            <Screen unsafe style={{paddingHorizontal:15, flex:1}}>
                <Text size={17} style={{}}>
                ماهـم، اولیـن اپلیکیشن در سطح استان گلستان فعالیت خـود را از
سال 1399 با موضوع کاریابی و نیازمندیهای آنلاین و بانک مشاغل
و تخفیف یاب شـروع کرده است و هـدف اصلی آن حذف واسطه و
تسهیل در امـر خریـد و فـروش و در ارتباط قـرار دادن خریـدار با
.فروشنده به صورت مستقیم است
در مـاهـم، خـریـد و فـروش کاربـران مستقیمـا انجـام می پذیـرد
.و از معامـلات کاربـران هیچـگـونه سـودی عاید ماهـم نمی گـردد
                </Text>
                <View style={{flex:1}}/>
                <View style={{alignItems:"center"}}>
                    <Text size={17} style={{textAlign:'center'}}>ماهم به زبان ترکمنی به معنای ماه من است</Text>
                    <Image source={require('../../../assets/images/version.png')} />
                </View>
                <Divider height={50} />
            </Screen>
        </Screen>
    )
}

const styles = StyleSheet.create({})

