import {View, StyleSheet, Image} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  GradiantHeader,
  ImageSlider,
  MainHeader,
  Screen,
  Row,
  Button,
  Divider,
  Text,
  ProductLocation,
  CallInfo,
  ReportProblem,
  OfferPriceDetails,
  Rate,
  optionsTypes,
} from '../../../components';
import {colors} from '../../../theme';
import Entypo from 'react-native-vector-icons/Entypo';
import {numberWithCommas, translations} from '../../../utiles';
import {useQuery} from 'react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getSingleAds} from '../../../services';
const images = [require('../../../assets/images/products/productSlider1.png')];
const productProps = [
  {label: 'متراژ(متر مربع)', value: '120'},
  {label: 'رهن', value: 100000000, type: 'price'},
  {label: 'اجاره ماهیانه', value: 1000000, type: 'price'},
  {label: 'نوع', value: 'ارایه'},
  {label: 'آگهی دهنده', value: 'مشاور املاک'},
  {label: 'تعداد اتاق', value: '3'},
  {label: 'محل', value: 'گنبد کاووس'},
];
const singleProduct = {
  img: require('../../../assets/images/offerbanner1.png'),
  location: 'مینودشت',
  title: 'فروش کیبورد ارنجر یاماها',
  offerPercent: 45,
  mainPrice: '1000000',
  price: '910000',
  rate: 4,
  time: 12000,
  features: ['امکان اقساطی کردن کالا در صورت خرید ملزومات'],
  description:
    'تاریخ استفاده از 25/5/1402  تا 31/5/1402 \nامکان تست تا ۴۸ ساعت امکان پذیر است',
};
export function SingleOfferScreen() {
  const {navigate} = useNavigation();

  const [state, setState] = useState({
    callInfoModal: false,
    reportModal: false,
  });
  const {params} = useRoute();
  const {data} = useQuery(
    [`singleAd-${params?.ads?.id}`, params?.ads?.id],
    () => getSingleAds(params?.ads?.id),
  );

  const images = useMemo(() => {
    if (!!data?.data) {
      const imgs = Object.keys(data.data)
        .filter(item => item.includes('image'))
        .filter(item => !!data.data[item])
        .map(item => data.data[item].path);
      return imgs;
    } else {
      return [];
    }
  }, [data]);

  const toggleCallInfoModal = () => {
    setState(s => ({...s, callInfoModal: !s.callInfoModal}));
  };
  const toggleReportModal = () => {
    setState(s => ({...s, reportModal: !s.reportModal}));
  };

  // console.log(data, 'data chat');
  return (
    <Screen
      style={{backgroundColor: 'transparent'}}
      withoutScroll
      statusbarBackgroundColor={colors.main}>
      <MainHeader />
      <View style={styles.nav}>
        <GradiantHeader title="تخفیف یاب" />
      </View>
      <Screen unsafe>
        <View>
          <View>
            <ImageSlider images={images} autoPlay={false} loop={false} />
            <View style={styles.rateBar}>
              <View style={styles.badge}>
                <Rate rate={singleProduct.rate} />
              </View>
              <View />
            </View>
          </View>

          <View style={{paddingHorizontal: 12, paddingVertical: 8}}>
            <Text preset="bold">{data?.data?.title}</Text>
          </View>
          <OfferPriceDetails style={styles.card} item={data?.data} />
          <Divider />
          <View style={{...styles.card, paddingHorizontal: 8}}>
            <View style={styles.badge1}>
              <Text style={{lineHeight: 20}} size={15} color="white">
                ویژگی ها
              </Text>
            </View>

            <Text>{data?.data?.features}</Text>
          </View>
          <Divider />
          <View style={{...styles.card, paddingHorizontal: 8}}>
            <View style={styles.badge1}>
              <Text style={{lineHeight: 20}} size={15} color="white">
                توضیحات
              </Text>
            </View>
            <Text>{data?.data?.description}</Text>
          </View>
          <Divider />
        </View>

        <ProductLocation
          zoomEnabled={false}
          scrollEnabled={false}
          lat={data?.data?.lat}
          lng={data?.data?.lng}
        />
        <CallInfo
          visible={state.callInfoModal}
          onClose={toggleCallInfoModal}
          phone={data?.data?.contact_info}
        />
        <ReportProblem
          visible={state.reportModal}
          onClose={toggleReportModal}
        />
      </Screen>
      <Row style={styles.buttons}>
        <Button style={styles.button} onPress={toggleCallInfoModal}>
          <Row style={{alignItems: 'center'}}>
            <Image source={require('../../../assets/images/phone.png')} />
            <Divider style={{width: 5}} />
            <Text size={20} preset="bold">
              اطلاعات تماس
            </Text>
          </Row>
        </Button>
        <Divider style={{width: 30}} />
        <Button
          style={styles.button}
          onPress={() =>
            navigate('chat', {
              title: data?.data?.title,
              id: data?.data?.id,
              receiver: data?.data?.contact_info,
            })
          }>
          <Row style={{alignItems: 'center'}}>
            <Image source={require('../../../assets/images/chat.png')} />
            <Divider style={{width: 5}} />
            <Text size={20} preset="bold">
              چت
            </Text>
          </Row>
        </Button>
      </Row>
    </Screen>
  );
}
const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: 50,
  },
  topDetail: {
    backgroundColor: colors.pallete.gray1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
  },
  button: {
    paddingHorizontal: 8,
    flex: 1,
    height: 37,
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
  buttons: {
    paddingHorizontal: 16,
    zIndex: 10001,
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    borderRadius: 8,
    marginHorizontal: 8,
    backgroundColor: colors.pallete.gray1,
    paddingVertical: 10,
  },
  rateBar: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  badge: {
    height: 18,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,.3)',
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  badge1: {
    height: 25,
    borderRadius: 4,
    backgroundColor: colors.pallete.gray2,
    paddingHorizontal: 5,
    alignItems: 'center',
    position: 'absolute',
    top: -15,
    right: 0,
  },
});
