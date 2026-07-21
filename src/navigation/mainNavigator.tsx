import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {RootNavigator} from './root-navigator';

export function MainNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
