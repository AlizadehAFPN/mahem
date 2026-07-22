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
} from '../../../components';
import {colors} from '../../../theme';
import {numberWithCommas} from '../../../utiles';
import {getLegacyImagePaths} from '../../../utiles/utiles_funcs';
import {useRoute} from '@react-navigation/native';

export function SingleOfferScreen() {
  const {params} = useRoute();
  const offer = params?.offer;

  const [state, setState] = useState({
    callInfoModal: false,
  });

  const images = useMemo(() => getLegacyImagePaths(offer), [offer]);

  const discountedPrice = useMemo(() => {
    if (offer?.originalPrice && offer?.discountPercent) {
      return Number(offer.originalPrice) * (1 - offer.discountPercent / 100);
    }
    return undefined;
  }, [offer]);

  const toggleCallInfoModal = () => {
    setState(s => ({...s, callInfoModal: !s.callInfoModal}));
  };

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
          <ImageSlider images={images} autoPlay={false} loop={false} />
          <View style={{paddingHorizontal: 12, paddingVertical: 8}}>
            <Text preset="bold" size={18}>
              {offer?.title}
            </Text>
          </View>
          <Row style={{...styles.card, paddingHorizontal: 12}}>
            {!!offer?.discountPercent && (
              <View style={styles.percentBadge}>
                <Text color="white" size={16}>
                  ٪{offer.discountPercent}
                </Text>
              </View>
            )}
            <View style={{marginHorizontal: 12}}>
              {!!offer?.originalPrice && (
                <Text
                  size={13}
                  color={colors.pallete.grayText}
                  style={{textDecorationLine: 'line-through'}}>
                  {numberWithCommas(offer.originalPrice)} تومان
                </Text>
              )}
              {discountedPrice !== undefined && (
                <Text size={15} color={colors.main}>
                  {numberWithCommas(Math.round(discountedPrice))} تومان
                </Text>
              )}
            </View>
          </Row>
          <Divider />
          {!!offer?.description && (
            <View style={{...styles.card, paddingHorizontal: 8}}>
              <View style={styles.badge1}>
                <Text style={{lineHeight: 20}} size={15} color="white">
                  توضیحات
                </Text>
              </View>
              <Text>{offer.description}</Text>
            </View>
          )}
          <Divider />
        </View>

        <ProductLocation
          zoomEnabled={false}
          scrollEnabled={false}
          lat={undefined}
          lng={undefined}
        />
        <CallInfo
          visible={state.callInfoModal}
          onClose={toggleCallInfoModal}
          phone={offer?.contactInfo}
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
    alignItems: 'center',
  },
  percentBadge: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: colors.main,
    justifyContent: 'center',
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
