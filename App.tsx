/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {MainNavigator} from './src/navigation';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/stateManager';
import {QueryClient, QueryClientProvider} from 'react-query';
import {LanguageProvider} from './src/Context/LanguageContext';

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <MainNavigator />
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}
