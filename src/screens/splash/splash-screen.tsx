import {Image, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import {Screen} from '../../components';
const {width, height} = Dimensions.get('window');

interface SplashScreenProps {
  // Per-city splash image URL, set by an admin. Absent means this city has no
  // splash configured (or no city is selected yet), and the bundled default
  // is shown instead.
  imageUrl?: string;
}

// Purely presentational — used as SplashGate's overlay and while
// RootNavigator validates the session, not as a navigable route. The old
// version did both jobs (branding + an imperative setTimeout-based
// register/dashboard redirect); the redirect logic now lives in
// RootNavigator, driven reactively by redux state instead of a timer.
//
// Exactly one image is ever drawn. An earlier version layered the city's
// image over the bundled default and faded it in, which meant every launch in
// a city that *has* a splash showed the default photo first and then visibly
// swapped — the default acting as a placeholder for an image that doesn't
// need one, since SplashSyncBridge has already put it on disk. Rendering the
// city's image alone makes it the first and only thing on screen; the black
// background covers the frame or two before it decodes, which reads as part
// of the splash rather than as a different picture.
export function SplashScreen({imageUrl}: SplashScreenProps) {
  return (
    <Screen
      statusbarBackgroundColor="black"
      backgroundColor="black"
      withoutScroll
      unsafe
      style={styles.container}>
      <Image
        style={styles.image}
        source={
          imageUrl ? {uri: imageUrl} : require('../../assets/images/splash.png')
        }
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Screen's `fixed` preset paints its outer view white; both it and this
    // inner one are overridden to black so the instant before the image has
    // decoded reads as part of the splash rather than a white flash. (Set in
    // two places because the preset colours the outer view and `style` only
    // reaches the inner one.)
    backgroundColor: 'black',
  },
  image: {
    width,
    height,
    resizeMode: 'cover',
  },
});
