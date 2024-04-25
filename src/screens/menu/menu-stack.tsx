import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuScreen } from './menu-screen';
import { JobsBankScreen } from './jobsBankScreen';
import { AboutUsScreen, BookmarkScreen, CallUsScreen, OfferDetectionScreen, OfferMarketScreen, PrivacyScreen, UserPanelScreen } from './';

const Stack = createNativeStackNavigator();
export function MenuStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="menu" component={MenuScreen} />
            <Stack.Screen name="jobsBank" component={JobsBankScreen} />
            <Stack.Screen name="offerDetection" component={OfferDetectionScreen} />
            <Stack.Screen name="offerMarket" component={OfferMarketScreen} />
            <Stack.Screen name="privacy" component={PrivacyScreen} />
            <Stack.Screen name="aboutus" component={AboutUsScreen} />
            <Stack.Screen name="callus" component={CallUsScreen} />
            <Stack.Screen name="bookmark" component={BookmarkScreen} />
            
        </Stack.Navigator>
    )
}