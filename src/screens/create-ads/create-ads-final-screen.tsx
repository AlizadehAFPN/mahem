import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Divider, MainHeader, Screen, Text } from '../../components'

export function CreateAdsFinalScreen() {
    return (
        <Screen>
            <MainHeader />
            <View style={{paddingHorizontal: 16}}>
                <Divider />
                <Text size={17} style={{textAlign:'center'}}>پس از بررسی تیم پشتیبانی ماهم ،تایید نهایی شده و نتیجه ان در ماهم به شما اطلاع داده خواهد شد.</Text>
                <Divider />
                <Text size={17} style={{textAlign:'center'}}>زمان انتظار در صف حداکثر ۵ ساعت خواهد بود.</Text>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({})