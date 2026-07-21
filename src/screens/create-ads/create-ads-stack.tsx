import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CreateAdsScreen} from './create-ads-screen';
import {CreateAdsFinalScreen} from './create-ads-final-screen';

const Stack = createNativeStackNavigator();
export function CreateAdsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="createAds" component={CreateAdsScreen} />
      <Stack.Screen name="createAdsFinal" component={CreateAdsFinalScreen} />
    </Stack.Navigator>
  );
}
