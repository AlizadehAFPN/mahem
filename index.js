/**
 * @format
 */

// First import in the app on purpose: pins the layout direction and turns off
// OS font scaling before any component is defined, let alone rendered.
import './src/bootstrap';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {initSentry} from './src/services/sentry';

// Before the component is registered, so a crash while the module graph is
// still being evaluated — the kind that shows as "the app closes instantly on
// open", and the kind hardest to reproduce on a developer's phone — is still
// captured. Sentry.init only installs handlers; it renders nothing, so it does
// not disturb bootstrap's ordering guarantee above.
initSentry();

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
