import {View, StyleSheet, BackHandler} from 'react-native';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {Button, Divider, MainHeader, Screen, Text} from '../../components';
import {colors, scaled} from '../../theme';

// The ad is already submitted by the time this screen appears, so "back" can't
// mean popping into the finished checkout behind it (that would re-offer a
// payment for an ad that's already in the queue). The header arrow is wired to
// the same reset as "ادامه" instead: the whole create-ads back-stack
// (details/payment/gateway/this screen) is cleared and the user lands on
// dashboard/home, which is the only place there is to go from here.
export function CreateAdsFinalScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();

  const onContinue = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'dashboard'}],
      }),
    );
  };

  // Android's hardware back would otherwise pop straight into the payment
  // step, which the header arrow above deliberately avoids — route it through
  // the same reset so both ways out behave identically.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onContinue();
        return true;
      },
    );
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen withoutScroll bottomSafeAreaColor={colors.main}>
      <MainHeader showBack onBack={onContinue} />
      <View style={{paddingHorizontal: scaled(16), flex: 1}}>
        <Divider />
        <Text size={17} style={{textAlign: 'center'}}>
          {t('createAds.finalReviewMessage')}
        </Text>
        <Divider />
        <Text size={17} style={{textAlign: 'center'}}>
          {t('createAds.queueWaitMessage')}
        </Text>
      </View>
      <Button style={styles.continueButton} onPress={onContinue}>
        <Text color="white" size={17}>
          {t('common.continue')}
        </Text>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  continueButton: {
    backgroundColor: colors.main,
    height: scaled(48),
    // Full-bleed (no side margins) so the red bottom safe-area strip below
    // it reads as one continuous block down to the screen edge, matching
    // the other wizard CTAs (پرداخت/اعمال).
    justifyContent: 'center',
    alignItems: 'center',
  },
});
