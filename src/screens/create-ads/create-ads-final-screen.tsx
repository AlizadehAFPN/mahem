import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {Button, Divider, MainHeader, Screen, Text} from '../../components';
import {colors} from '../../theme';

// Deliberately no back button (MainHeader without showBack) — the wizard is
// done and there's nothing to go back to fix. "ادامه" resets the AppStack
// straight to dashboard/home instead of navigate()+goBack(), so the whole
// create-ads back-stack (details/payment/gateway/this screen) is cleared and
// hardware back from home can't land the user here again.
export function CreateAdsFinalScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const onContinue = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'dashboard'}],
      }),
    );
  };

  return (
    <Screen withoutScroll bottomSafeAreaColor={colors.main}>
      <MainHeader />
      <View style={{paddingHorizontal: 16, flex: 1}}>
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
    height: 48,
    // Full-bleed (no side margins) so the red bottom safe-area strip below
    // it reads as one continuous block down to the screen edge, matching
    // the other wizard CTAs (پرداخت/اعمال).
    justifyContent: 'center',
    alignItems: 'center',
  },
});
