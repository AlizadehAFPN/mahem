import {Alert, Image, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button, Screen, Text} from '../../components';
import {TextField} from '../../components/text-field/text-field';
import {colors} from '../../theme';

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2
    ? digits
    : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// mahem has no real payment provider wired up — every ad/store still lands
// paymentStatus PENDING until an admin confirms the bank transfer by hand in
// mahem-admin (see CreateAdsPaymentScreen/StoreTermsScreen). This screen just
// gives the user something that *looks* like a bank card gateway (a
// Zarinpal-sandbox-style form) in front of that: nothing typed here is
// checked against a real bank, "پرداخت" always succeeds after a short fake
// delay and then runs whatever the caller passed as `onSuccess` — the actual
// ad/store submission. Header/body/button styling deliberately mirrors
// CreateAdsPaymentScreen ("ثبت آگهی- استخدامی2" in Figma) instead of an
// invented "real bank" look, so it reads as part of the same flow. Callers
// are expected to pop this screen off (goBack) themselves from inside
// onSuccess before navigating on, so it doesn't linger in the back-stack
// under the next screen.
export function BankGatewayScreen() {
  const {t} = useTranslation();
  const {goBack} = useNavigation<any>();
  const {params} = useRoute<any>();
  const {amount, description, onSuccess} = params ?? {};

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [dynamicPassword, setDynamicPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onConfirm = async () => {
    if (submitting) {
      return;
    }
    if (cardNumber.replace(/\D/g, '').length !== 16) {
      Alert.alert(t('common.error'), t('payment.enterCardNumber'));
      return;
    }
    if (expiry.replace(/\D/g, '').length !== 4) {
      Alert.alert(t('common.error'), t('payment.enterExpiry'));
      return;
    }
    if (cvv2.length < 3) {
      Alert.alert(t('common.error'), t('payment.enterCvv2'));
      return;
    }
    if (!dynamicPassword) {
      Alert.alert(t('common.error'), t('payment.enterDynamicPassword'));
      return;
    }
    setSubmitting(true);
    // Fake bank processing delay — nothing is actually sent anywhere, this
    // is only so the screen doesn't resolve instantly and feel obviously fake.
    await new Promise(resolve => setTimeout(resolve, 1200));
    try {
      await onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen withoutScroll>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.sandboxBanner}>
        <Text size={12} color={colors.pallete.gray2}>
          {t('payment.sandboxNotice')}
        </Text>
      </View>
      <View style={styles.body}>
        {!!description && <Text style={styles.paragraph}>{description}</Text>}
        <Text preset="bold" size={17} color={colors.main} style={styles.fee}>
          {t('payment.payableAmount', {
            amount: Number(amount ?? 0).toLocaleString('en-US'),
          })}
        </Text>

        <TextField
          label={t('payment.cardNumber')}
          placeholder="XXXX XXXX XXXX XXXX"
          value={cardNumber}
          onChangeText={text => setCardNumber(formatCardNumber(text))}
          keyboardType="number-pad"
          textAlign="left"
          style={styles.field}
        />
        <View style={styles.row}>
          <View style={styles.halfField}>
            <TextField
              label={t('payment.expiry')}
              placeholder="MM/YY"
              value={expiry}
              onChangeText={text => setExpiry(formatExpiry(text))}
              keyboardType="number-pad"
              textAlign="left"
            />
          </View>
          <View style={styles.halfField}>
            <TextField
              label="CVV2"
              placeholder="XXX"
              value={cvv2}
              onChangeText={text => setCvv2(text.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              textAlign="left"
            />
          </View>
        </View>
        <TextField
          label={t('payment.dynamicPassword')}
          placeholder={t('payment.dynamicPasswordPlaceholder')}
          value={dynamicPassword}
          onChangeText={text =>
            setDynamicPassword(text.replace(/\D/g, '').slice(0, 6))
          }
          keyboardType="number-pad"
          secureTextEntry
          textAlign="left"
          style={styles.field}
        />
      </View>
      <View style={styles.footer}>
        <Button
          style={styles.payButton}
          onPress={onConfirm}
          loading={submitting}>
          <Text color="white" size={17}>
            {t('createAds.pay')}
          </Text>
        </Button>
        <Button
          style={styles.cancelButton}
          onPress={goBack}
          disabled={submitting}>
          <Text color={colors.pallete.gray2} size={15}>
            {t('payment.cancelPayment')}
          </Text>
        </Button>
      </View>
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
  sandboxBanner: {
    backgroundColor: colors.pallete.gray1,
    paddingVertical: 6,
    alignItems: 'center',
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
    marginTop: 8,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfField: {
    flex: 1,
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  payButton: {
    backgroundColor: colors.main,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 12,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
