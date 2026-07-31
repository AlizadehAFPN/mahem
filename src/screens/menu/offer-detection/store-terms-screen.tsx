import {Alert, Image, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useMutation} from 'react-query';
import {Button, Row, Screen, Text} from '../../../components';
import {createStore, upload} from '../../../services';
import {colors, scaled} from '../../../theme';
import {useAdsCategories} from '../../../hooks/use-cached-categories';

const STORE_FEE_TOMAN = 300000;

// Terms + monthly fee (store_v2.png design, "فروشگاه – 2", verified
// word-for-word via get_design_context) — the step AFTER the store details
// form (CreateStoreScreen, "فروشگاه – 1"), not before it. There's still no
// real payment provider behind this (see PaymentStatus in mahem-backend —
// the store lands paymentStatus PENDING until an admin confirms the bank
// transfer by hand in mahem-admin either way), but tapping "پرداخت" now
// sends the user through the fake bank gateway (BankGatewayScreen) first
// instead of submitting the store on the spot.
export function StoreTermsScreen() {
  const {t} = useTranslation();
  const {navigate, goBack} = useNavigation<any>();
  const {params} = useRoute<any>();
  const {name, cover, logo} = params ?? {};
  const userCityId = useSelector((s: any) => s.user.cityId);

  const {data: cats} = useAdsCategories();
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

  const onPay = () => {
    if (!discountCategoryId) {
      Alert.alert(t('common.error'), t('store.discountCategoryNotFound'));
      return;
    }
    navigate('bankGateway', {
      amount: STORE_FEE_TOMAN,
      description: t('store.createStoreDescription', {name: name ?? ''}),
      onSuccess: async () => {
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
          goBack();
          navigate('myStore', {storeId: store.id});
        } catch (e) {
          Alert.alert(t('common.error'), t('store.createStoreError'));
        }
      },
    });
  };

  return (
    <Screen withoutScroll bottomSafeAreaColor={colors.main}>
      <View style={styles.header}>
        <Row style={styles.headerRow}>
          <Button onPress={goBack}>
            <Row style={{alignItems: 'center'}}>
              <MaterialIcons
                color="white"
                size={scaled(25)}
                name="keyboard-arrow-right"
              />
              <Text color="white" size={17}>
                {t('home.discountFinder')}
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
        <Text style={styles.paragraph}>{t('store.termsParagraph1')}</Text>
        <Text style={styles.paragraph}>{t('store.termsParagraph2')}</Text>
        <Text preset="bold" size={17} color={colors.main} style={styles.fee}>
          {t('store.feeAmount', {
            amount: STORE_FEE_TOMAN.toLocaleString('en-US'),
          })}
        </Text>
      </View>
      <Button style={styles.payButton} onPress={onPay}>
        <Text color="white" size={16} preset="bold">
          {t('createAds.pay')}
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
    paddingHorizontal: scaled(8),
    paddingVertical: scaled(10),
  },
  logo: {
    width: scaled(32),
    height: scaled(32),
  },
  body: {
    flex: 1,
    padding: scaled(20),
  },
  paragraph: {
    textAlign: 'right',
    lineHeight: scaled(26),
    marginBottom: scaled(16),
  },
  fee: {
    textAlign: 'center',
    marginTop: scaled(24),
  },
  payButton: {
    backgroundColor: colors.main,
    paddingVertical: scaled(16),
    alignItems: 'center',
  },
});
