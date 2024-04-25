import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    HomeScreen,
    MenuScreen,
    SearchScreen,
    EmployeeScreen,
    NewAdvertising,
    MenuStack,
    CreateAdsScreen,
    CreateAdsStack,
} from '../screens';
import { MainTabBar } from '../components';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();
export function Dashboard() {
    return (
        <Tab.Navigator
        tabBar={(props)=> <MainTabBar {...props} />}
            initialRouteName='home'
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="home" component={HomeScreen} />
            <Tab.Screen name="menuStack" component={MenuStack} />
            <Tab.Screen options={{unmountOnBlur: true}} name="newAdvertising" component={CreateAdsStack} />
            <Tab.Screen name="search" component={SearchScreen} />
            <Tab.Screen name="employee" options={{unmountOnBlur: true}} component={EmployeeScreen} />
        </Tab.Navigator>
    )
}