import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EmployeeScreen} from './employee-screen';
import {EmployeeCategoryScreen} from './employee-category-screen';
import {EmployeeAdsScreen} from './employee-ads-screen';

const Stack = createNativeStackNavigator();

export function EmployeeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="employeeHome" component={EmployeeScreen} />
      <Stack.Screen
        name="employeeCategory"
        component={EmployeeCategoryScreen}
      />
      <Stack.Screen name="employeeAds" component={EmployeeAdsScreen} />
    </Stack.Navigator>
  );
}
