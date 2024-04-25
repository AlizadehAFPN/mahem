import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuScreen } from './menu-screen';
import { JobsBankScreen } from './jobsBankScreen';
import { CreateAdsScreen, OfferDetectionScreen, OfferMarketScreen } from './';
import { CreateAdsFinalScreen } from './create-ads-final-screen';

const Stack = createNativeStackNavigator();
export function CreateAdsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="createAds" component={CreateAdsScreen} />
            <Stack.Screen name="createAdsFinal" component={CreateAdsFinalScreen} />
        </Stack.Navigator>
    )
}