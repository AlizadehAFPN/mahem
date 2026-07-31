/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Alert, AppState, StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MainNavigator} from './src/navigation';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/stateManager';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from 'react-query';
import {LanguageProvider} from './src/Context/LanguageContext';
import {getErrorMessage} from './src/utiles';
import {ErrorBoundary} from './src/components/error-boundary/error-boundary';
import {SocketBridge} from './src/components/socket-bridge/socket-bridge';
import {NotificationsBridge} from './src/components/notifications-bridge/notifications-bridge';
import {CategoriesSyncBridge} from './src/components/categories-sync-bridge/categories-sync-bridge';
import {AttributeOptionsSyncBridge} from './src/components/attribute-options-sync-bridge/attribute-options-sync-bridge';
import {CitiesSyncBridge} from './src/components/cities-sync-bridge/cities-sync-bridge';
import {AppSettingsSyncBridge} from './src/components/app-settings-sync-bridge/app-settings-sync-bridge';
import {SplashSyncBridge} from './src/components/splash-sync-bridge/splash-sync-bridge';
import {SplashGate} from './src/components/splash-gate/splash-gate';
import {OfflineGate} from './src/components/offline-gate/offline-gate';
import {DeepLinkBridge} from './src/components/deep-link-bridge/deep-link-bridge';
import {SentryUserBridge} from './src/components/sentry-user-bridge/sentry-user-bridge';

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

// Same story for react-query's online check: it reads `navigator.onLine`, which
// doesn't exist in React Native, so it considers the app permanently online —
// retries keep firing into a dead connection and nothing reloads once it comes
// back. Bridged to NetInfo, every active query refetches on its own the moment
// the connection returns, so the app the user lands back on behind «نبود نت»
// (see OfflineGate) isn't showing data from before it dropped.
onlineManager.setEventListener(setOnline =>
  NetInfo.addEventListener(state => setOnline(!!state.isConnected)),
);

// Fills the gap between the native launch screen and the first frame redux
// can inform — a plain black field, so whichever splash SplashGate then shows
// appears to fade up from the same background rather than replacing a picture.
function RehydratingScreen() {
  return <View style={styles.rehydrating} />;
}

const styles = StyleSheet.create({
  rehydrating: {flex: 1, backgroundColor: 'black'},
  root: {flex: 1},
});

// react-native-gesture-handler needs this at the root for its gestures to
// receive touches on Android (iOS wires itself up natively). Without it the
// swipe-to-delete rows in پیام‌ها silently never respond there.
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* Outside ErrorBoundary and PersistGate on purpose: the offline screen
            must still appear when the tree below has crashed or hasn't
            rehydrated yet — both are states the user can sit in with no
            connection. It needs nothing from redux, react-query or i18n's
            provider. */}
        <OfflineGate />
        <ErrorBoundary>
          <LanguageProvider>
            <QueryClientProvider client={queryClient}>
              <Provider store={store}>
                {/* Black, not the default splash. Which city's splash to show
                    is stored in redux, so during rehydration it isn't known
                    yet — and rendering the bundled default meanwhile is
                    exactly what made every launch in a city that has its own
                    splash start on the wrong image and then visibly swap.
                    SplashGate below picks up the moment this resolves. */}
                <PersistGate
                  loading={<RehydratingScreen />}
                  persistor={persistor}>
                  <SocketBridge />
                  <NotificationsBridge />
                  <DeepLinkBridge />
                  <SentryUserBridge />
                  <CategoriesSyncBridge />
                  <AttributeOptionsSyncBridge />
                  <CitiesSyncBridge />
                  <AppSettingsSyncBridge />
                  <SplashSyncBridge />
                  {/* Wraps the navigator rather than sitting beside the other
                      bridges: it renders the splash *over* the whole app, which
                      is the only way to cover both a cold launch (no screen
                      mounted yet) and a city switch (no navigation at all). */}
                  <SplashGate>
                    <MainNavigator />
                  </SplashGate>
                </PersistGate>
              </Provider>
            </QueryClientProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
