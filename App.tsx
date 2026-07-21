/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Alert} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MainNavigator} from './src/navigation';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/stateManager';
import {QueryClient, QueryClientProvider} from 'react-query';
import {LanguageProvider} from './src/Context/LanguageContext';
import {getErrorMessage} from './src/utiles';
import {ErrorBoundary} from './src/components/error-boundary/error-boundary';
import {SocketBridge} from './src/components/socket-bridge/socket-bridge';
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

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <PersistGate loading={<SplashScreen />} persistor={persistor}>
                <SocketBridge />
                <MainNavigator />
              </PersistGate>
            </Provider>
          </QueryClientProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
