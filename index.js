/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Background/quit-state FCM handler must be registered before the app
// component. Wrapped defensively so the bundle still loads if the native
// messaging module isn't linked yet (e.g. before a native rebuild).
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async () => {
    // Nothing to do in JS — the system tray notification is shown by FCM.
    // The tap is handled when the app opens.
  });
} catch {}

AppRegistry.registerComponent(appName, () => App);
