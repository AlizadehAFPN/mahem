import React from 'react';
import {
  HomeScreen,
  SearchScreen,
  EmployeeStack,
  MenuStack,
  CreateAdsStack,
} from '../screens';
import {MainTabBar} from '../components';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();
export function Dashboard() {
  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => <MainTabBar {...props} />}
      initialRouteName="home"
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="menuStack" component={MenuStack} />
      <Tab.Screen
        options={{unmountOnBlur: true}}
        name="newAdvertising"
        component={CreateAdsStack}
      />
      <Tab.Screen name="search" component={SearchScreen} />
      <Tab.Screen
        name="employee"
        options={{unmountOnBlur: true}}
        component={EmployeeStack}
      />
    </Tab.Navigator>
  );
}
