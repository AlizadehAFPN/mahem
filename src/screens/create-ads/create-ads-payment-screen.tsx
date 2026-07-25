import {Image, StyleSheet, View, Alert} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button, Screen, Text} from '../../components';
import {createAdsWithImages} from '../../services';
import {colors} from '../../theme';
import {localizeCategory} from '../../i18n/display-maps';

// "ثبت آگهی- استخدامی2" (Figma): the fee step shown only for
// استخدامی/تخفیف‌یاب ads (see Category.adFeeToman) — reached from
// CreateAdsDetailsScreen once the form is valid, carrying the already
// -validated `payload`/`images`. There's still no real payment provider
// behind this (mahem-backend just wants the ad to land paymentStatus
// PENDING for an admin to confirm by hand — see BankGatewayScreen), but
// tapping "پرداخت" now sends the user through that fake bank gateway first
// instead of creating the ad on the spot, so the flow at least looks like a
// real checkout.
export function CreateAdsPaymentScreen() {
  const {t} = useTranslation();
  const {navigate, goBack} = useNavigation<any>();
  const {params} = useRoute<any>();
  const {images, payload, mainCategory} = params ?? {};

  const onPay = () => {
    navigate('bankGateway', {
      amount: mainCategory?.adFeeToman,
      description: t('createAds.payDescription', {
        category: localizeCategory(mainCategory?.title ?? ''),
      }),
      onSuccess: async () => {
        try {
          await createAdsWithImages(images ?? [], payload ?? {});
          goBack();
          navigate('createAdsFinal');
        } catch (e) {
          Alert.alert(t('common.error'), t('createAds.submitErrorRetry'));
        }
      },
    });
  };

  return (
    <Screen withoutScroll bottomSafeAreaColor={colors.main}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.paragraph}>
          {t('createAds.feeNotFree')}
        </Text>
        <Text preset="bold" size={17} color={colors.main} style={styles.fee}>
          {t('createAds.feeAmount', {amount: mainCategory?.adFeeToman})}
        </Text>
      </View>
      <Button style={styles.payButton} onPress={onPay}>
        <Text color="white" size={17}>
          {t('createAds.pay')}
        </Text>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    backgroundColor: colors.main,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  logo: {
    width: 72,
    height: 34,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  paragraph: {
    textAlign: 'center',
  },
  fee: {
    textAlign: 'center',
    marginTop: 24,
  },
  payButton: {
    backgroundColor: colors.main,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
