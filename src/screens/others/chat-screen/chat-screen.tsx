import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'
import { ChatHeader, Divider, Message, MessageSender, Screen } from '../../../components'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


const messages = [
    {
        me: false,
        text:'سلام مشخصات گوشی فروشی رو می فرستید کجا میتونم تحویل بگیرم و شماره تماس لطفا بفرستید ممنون'
    },
    {
        me: true,
        text:'سلام ولنجک ۰۹۱۲۳۴۵۶۷۸۹ لطفا قبل مراجعه هماهنگ کنید'
    }
]
export function ChatScreen() {
    const insents = useSafeAreaInsets()
  return (
    <Screen withoutScroll style={{paddingBottom: insents.bottom}}>
        <ChatHeader />
        <View style={{flex:1}}>
            {/* <Divider /> */}
            <FlatList 
                // style={{paddingTop: 20}}
                data={messages}
                ItemSeparatorComponent={<Divider height={10} />}
                renderItem={({item, index})=> <Message message={item} index={index} />}
            />
        </View>
        <MessageSender />
    </Screen>
  )
}

const styles = StyleSheet.create({})