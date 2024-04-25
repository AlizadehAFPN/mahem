
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from './otherNavigator';
import { Dashboard } from './';

const Stack = createNativeStackNavigator();

export function MainNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="splash" 
      screenOptions={{ headerShown: false }}>
        <Stack.Screen component={Dashboard} name="dashboard" />
        {routes.map(item=>
          <Stack.Screen component={item.component} name={item.name} key={item.name} />
          )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

