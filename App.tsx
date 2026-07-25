/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Alert, AppState} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MainNavigator} from './src/navigation';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/stateManager';
import {QueryClient, QueryClientProvider, focusManager} from 'react-query';
import {LanguageProvider} from './src/Context/LanguageContext';
import {getErrorMessage} from './src/utiles';
import {ErrorBoundary} from './src/components/error-boundary/error-boundary';
import {SocketBridge} from './src/components/socket-bridge/socket-bridge';
import {NotificationsBridge} from './src/components/notifications-bridge/notifications-bridge';
import {CategoriesSyncBridge} from './src/components/categories-sync-bridge/categories-sync-bridge';
import {AttributeOptionsSyncBridge} from './src/components/attribute-options-sync-bridge/attribute-options-sync-bridge';
import {CitiesSyncBridge} from './src/components/cities-sync-bridge/cities-sync-bridge';
import {SplashScreen} from './src/screens/splash/splash-screen';

// Create a client. Mutations that don't set their own `onError` fall back to
// this alert so a failed request is never silently swallowed; queries and
// mutations that need a more specific message can still pass their own.
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: error => Alert.alert('خطا', getErrorMessage(error)),
    },
  },
});

// react-query's default refetch-on-focus listens for a browser `window`
// focus event, which never fires in React Native — so without this, data
// fetched before the app was backgrounded (e.g. banners/ads changed from the
// admin panel while the user had switched away) stays stale until a manual
// pull-to-refresh or a full app restart. Bridge focus to AppState instead.
focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => {
    handleFocus(state === 'active');
  });
  return () => subscription.remove();
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <PersistGate loading={<SplashScreen />} persistor={persistor}>
                <SocketBridge />
                <NotificationsBridge />
                <CategoriesSyncBridge />
                <AttributeOptionsSyncBridge />
                <CitiesSyncBridge />
                <MainNavigator />
              </PersistGate>
            </Provider>
          </QueryClientProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
