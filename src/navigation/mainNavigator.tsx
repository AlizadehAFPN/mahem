import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {RootNavigator} from './root-navigator';
import {flushPendingTarget, navigationRef} from './navigation-ref';

export function MainNavigator() {
  return (
    // The ref is what lets a tapped push notification (NotificationsBridge)
    // and an opened deep link (DeepLinkBridge) reach the navigator from
    // outside the React tree. onReady replays anything they asked for while
    // the container was still mounting — the cold-start case, where the
    // request always arrives first.
    <NavigationContainer ref={navigationRef} onReady={flushPendingTarget}>
      <RootNavigator />
    </NavigationContainer>
  );
}
