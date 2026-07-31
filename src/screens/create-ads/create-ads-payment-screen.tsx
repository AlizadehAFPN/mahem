import {Image, StyleSheet, View, Alert} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button, HeaderBackButton, Row, Screen, Text} from '../../components';
import {createAdsWithImages} from '../../services';
import {colors, scaled} from '../../theme';
import {localizeCategory} from '../../i18n/display-maps';

// "ثبت آگهی- استخدامی2" (Figma): the fee step shown only for استخدامی ads —
// the one root category left carrying a Category.adFeeToman, now that
// تخفیف‌یاب posts for free. Reached from
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
      {/* Arrow first in the row-reverse Row, so it lands on the right edge like
          every other back arrow in the app (MainHeader, auth, edit-profile),
          with the logo beside it. Back means "return to the ad form" — nothing
          has been submitted or charged at this point. */}
      <Row style={styles.header}>
        <Row>
          <HeaderBackButton />
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Row>
      </Row>
      <View style={styles.body}>
        <Text style={styles.paragraph}>{t('createAds.feeNotFree')}</Text>
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
    height: scaled(48),
    backgroundColor: colors.main,
    justifyContent: 'space-between',
    paddingHorizontal: scaled(8),
  },
  logo: {
    width: scaled(72),
    height: scaled(34),
  },
  body: {
    flex: 1,
    paddingHorizontal: scaled(20),
    paddingTop: scaled(24),
  },
  paragraph: {
    textAlign: 'center',
  },
  fee: {
    textAlign: 'center',
    marginTop: scaled(24),
  },
  payButton: {
    backgroundColor: colors.main,
    height: scaled(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
