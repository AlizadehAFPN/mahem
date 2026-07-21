import {Image, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import {Screen} from '../../components';
const {width, height} = Dimensions.get('window');

interface SplashScreenProps {
  // Per-city splash image URL, set by an admin. Falls back to the bundled
  // default when absent (no per-city image configured yet, still loading,
  // or — during PersistGate's rehydration — the user's city isn't even
  // known yet).
  imageUrl?: string;
}

// Purely presentational now — used as PersistGate's loading view and while
// RootNavigator validates the session, not as a navigable route. The old
// version did both jobs (branding + an imperative setTimeout-based
// register/dashboard redirect); the redirect logic now lives in
// RootNavigator, driven reactively by redux state instead of a timer.
export function SplashScreen({imageUrl}: SplashScreenProps) {
  return (
    <Screen
      statusbarBackgroundColor="black"
      withoutScroll
      unsafe
      style={{flex: 1}}>
      <Image
        style={styles.image}
        source={
          imageUrl
            ? {uri: imageUrl}
            : require('../../assets/images/splash.png')
        }
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  image: {
    width,
    height,
    resizeMode: 'cover',
  },
});
