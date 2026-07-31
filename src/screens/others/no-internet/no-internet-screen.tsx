import React from 'react';
import {Image, StyleSheet, useWindowDimensions, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Screen} from '../../../components';

// «نبود نت» (Figma 106:350) is a single 360×640 composition: the same photo the
// splash screen uses, plus a red "cut wire" pinned to one exact spot on it —
// the wifi arcs sit on the moon, the line drops from them, and the scissors cut
// it just above the wordmark. splash.png already contains the photo and the
// wordmark, so the overlay (Figma 106:353, at 107,194 within the composition)
// is the only extra asset.
const ART = {width: 360, height: 640};
const CUT = {left: 107, top: 194, width: 137, height: 412};

// Rendered by OfflineGate, not by a route — see offline-gate.tsx. There is
// deliberately no retry button and no message: the design has neither, and the
// gate takes itself down the moment the connection is back, so there is nothing
// for the user to press.
export function NoInternetScreen() {
  const {t} = useTranslation();
  const {width, height} = useWindowDimensions();

  // Scale the whole composition by one cover factor and center it, instead of
  // giving the photo `resizeMode: 'cover'` and positioning the overlay against
  // the screen. Screens are taller than 9:16, so cover crops the photo — and
  // anything positioned against the screen instead of against the photo would
  // drift off the moon by exactly that crop.
  const scale = Math.max(width / ART.width, height / ART.height);
  const art = {width: ART.width * scale, height: ART.height * scale};

  return (
    <Screen
      backgroundColor="black"
      statusbarBackgroundColor="black"
      withoutScroll
      unsafe
      style={styles.container}>
      <View style={art} accessible accessibilityLabel={t('noInternet.message')}>
        <Image
          style={[art, styles.photo]}
          source={require('../../../assets/images/splash.png')}
        />
        <Image
          style={[
            styles.cut,
            {
              left: CUT.left * scale,
              top: CUT.top * scale,
              width: CUT.width * scale,
              height: CUT.height * scale,
            },
          ]}
          source={require('../../../assets/images/no-internet-cut.png')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    // The scaled composition is wider than the screen on anything taller than
    // 9:16 — clip the sides rather than letting it paint outside.
    overflow: 'hidden',
  },
  photo: {
    resizeMode: 'cover',
  },
  cut: {
    position: 'absolute',
    resizeMode: 'contain',
  },
});
