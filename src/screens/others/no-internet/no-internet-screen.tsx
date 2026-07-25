import {Image, StyleSheet, View, Dimensions} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';
import {Button, Screen, Text} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

// "نبود نت" (Figma 106:350) — same full-bleed splash photo as
// SplashScreen, with a broken-wifi glyph overlay instead of the plain
// wordmark. Purely presentational for now (no live connectivity check is
// wired anywhere in the app yet — see NetInfo note below); a screen a
// caller can navigate to when it already knows a request failed with a
// network error, or push to once connectivity monitoring is added.
export function NoInternetScreen() {
  const {t} = useTranslation();
  const {goBack} = useNavigation();
  return (
    <Screen statusbarBackgroundColor="black" withoutScroll unsafe style={{flex: 1}}>
      <Image style={styles.image} source={require('../../../assets/images/splash.png')} />
      <View style={styles.overlay}>
        <MaterialCommunityIcons name="wifi-off" size={72} color={colors.pallete.red2} />
        <Text color="white" size={18} preset="bold" style={styles.text}>
          {t('noInternet.message')}
        </Text>
        <Button style={styles.retryButton} onPress={() => goBack()}>
          <Text color="white" size={16}>
            {t('common.tryAgain')}
          </Text>
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: {
    width,
    height,
    resizeMode: 'cover',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  text: {
    marginTop: 16,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.main,
  },
});
