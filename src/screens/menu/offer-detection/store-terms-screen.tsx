import {Alert, Image, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useMutation, useQuery} from 'react-query';
import {Button, Row, Screen, Text} from '../../../components';
import {createStore, getAdsCategories, upload} from '../../../services';
import {colors} from '../../../theme';

// Terms + monthly fee (store_v2.png design, "فروشگاه – 2", verified
// word-for-word via get_design_context) — the step AFTER the store details
// form (CreateStoreScreen, "فروشگاه – 1"), not before it. There's no payment
// gateway (see PaymentStatus in mahem-backend), so tapping "پرداخت" doesn't
// open one either: it submits the store right here and moves straight to
// the store page: same as accepting the payment on the spot. The store
// still comes back paymentStatus PENDING until an admin confirms the bank
// transfer in mahem-admin — this only skips a fake gateway screen, not that
// admin confirmation step.
export function StoreTermsScreen() {
  const {navigate, goBack} = useNavigation<any>();
  const {params} = useRoute<any>();
  const {name, cover, logo} = params ?? {};
  const userCityId = useSelector((s: any) => s.user.cityId);
  const [submitting, setSubmitting] = useState(false);

  const {data: cats} = useQuery(['adsCategories'], getAdsCategories);
  const discountCategoryId = useMemo(
    () => cats?.data?.find((c: any) => c.title === 'تخفیف یاب')?.id,
    [cats],
  );

  const {mutateAsync} = useMutation(createStore);

  const uploadImage = async (image: any) => {
    const form = new FormData();
    form.append('file', {
      name: image.fileName,
      type: image.type,
      uri: image.uri,
    } as any);
    const uploaded = await upload(form);
    return uploaded?.data?.id as string;
  };

  const onPay = async () => {
    if (submitting) {
      return;
    }
    if (!discountCategoryId) {
      Alert.alert('خطا', 'دسته‌بندی تخفیف‌یاب یافت نشد');
      return;
    }
    setSubmitting(true);
    try {
      const [logoUrl, bannerUrl] = await Promise.all([
        logo?.uri ? uploadImage(logo) : Promise.resolve(undefined),
        cover?.uri ? uploadImage(cover) : Promise.resolve(undefined),
      ]);

      const store = await mutateAsync({
        name,
        categoryId: discountCategoryId,
        cityId: userCityId,
        logo: logoUrl,
        banner: bannerUrl,
      });
      setSubmitting(false);
      navigate('myStore', {storeId: store.id});
    } catch (e) {
      setSubmitting(false);
      Alert.alert('خطا', 'ثبت فروشگاه با خطا مواجه شد. لطفا دوباره تلاش کنید');
    }
  };

  return (
    <Screen withoutScroll>
      <View style={styles.header}>
        <Row style={styles.headerRow}>
          <Button onPress={goBack}>
            <Row style={{alignItems: 'center'}}>
              <MaterialIcons
                color="white"
                size={25}
                name="keyboard-arrow-right"
              />
              <Text color="white" size={17}>
                تخفیف یاب
              </Text>
            </Row>
          </Button>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Row>
      </View>
      <View style={styles.body}>
        <Text style={styles.paragraph}>
          ثبت فروشگاه تخفیف یاب رایگان نیست و بصورت اشتراک ماهانه است.
        </Text>
        <Text style={styles.paragraph}>
          هر فروشگاه فقط میتواند توی یک صنف فعالیت کند در غیر اینصورت شرکت ماهم
          میتواند فروشگاه اش را ببندد.
        </Text>
        <Text preset="bold" size={17} color={colors.main} style={styles.fee}>
          هزینه ثبت فروشگاه 300/000 تومان
        </Text>
      </View>
      <Button style={styles.payButton} onPress={onPay} loading={submitting}>
        <Text color="white" size={16} preset="bold">
          پرداخت
        </Text>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.main,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  paragraph: {
    textAlign: 'right',
    lineHeight: 26,
    marginBottom: 16,
  },
  fee: {
    textAlign: 'center',
    marginTop: 24,
  },
  payButton: {
    backgroundColor: colors.main,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
