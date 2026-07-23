import {Image, StyleSheet, View, Alert} from 'react-native';
import React, {useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button, Screen, Text} from '../../components';
import {createAdsWithImages} from '../../services';
import {colors} from '../../theme';

// "ثبت آگهی- استخدامی2" (Figma): the fee step shown only for
// استخدامی/تخفیف‌یاب ads (see Category.adFeeToman) — reached from
// CreateAdsDetailsScreen once the form is valid, carrying the already
// -validated `payload`/`images`. Same "no real payment gateway, an admin
// confirms the bank transfer manually" pattern as StoreTermsScreen: tapping
// "پرداخت" creates the ad right here (it lands with paymentStatus PENDING).
export function CreateAdsPaymentScreen() {
  const {navigate} = useNavigation<any>();
  const {params} = useRoute<any>();
  const {images, payload, mainCategory} = params ?? {};
  const [submitting, setSubmitting] = useState(false);

  const onPay = async () => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await createAdsWithImages(images ?? [], payload ?? {});
      setSubmitting(false);
      navigate('createAdsFinal');
    } catch (e) {
      setSubmitting(false);
      Alert.alert('خطا', 'ثبت آگهی با خطا مواجه شد. لطفا دوباره تلاش کنید');
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
      <View style={styles.body}>
        <Text style={styles.paragraph}>
          ثبت در زیر مجموعه استخدامی و تخفیف یاب رایگان نیست.
        </Text>
        <Text preset="bold" size={17} color={colors.main} style={styles.fee}>
          هزینه ثبت {mainCategory?.adFeeToman} تومان
        </Text>
      </View>
      <Button style={styles.payButton} onPress={onPay} loading={submitting}>
        <Text color="white" size={17}>
          پرداخت
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
