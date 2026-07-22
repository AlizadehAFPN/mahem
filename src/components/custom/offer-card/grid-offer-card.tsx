import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import React, {useMemo} from 'react';
import {colors} from '../../../theme';
import {CirleSlider} from '../../cicle-slider/circle-slider';
import {Row} from '../../row/row';
import {Text} from '../../text/text';
import {numberWithCommas} from '../../../utiles';
import {getLegacyImagePaths} from '../../../utiles/utiles_funcs';

// Grid card for browsing تخفیف‌یاب by category (see OfferListScreen) — the
// richer OfferPriceDetails (timer, "پرداختی شما" breakdown) lives on the ad
// detail page; this is the compact 2-column version, just enough to compare
// offers at a glance: image, title, discount ring, discounted price, and
// the struck-through original.
export function GridOfferCard({item, onPress}) {
  const img = useMemo(() => getLegacyImagePaths(item)[0], [item]);
  const offerPersent = item?.discountPercent ?? 0;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        <Image
          style={styles.image}
          source={
            img ? {uri: img} : require('../../../assets/images/empty.webp')
          }
        />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} preset="bold" size={15}>
          {item.title}
        </Text>
        <Row style={styles.priceRow}>
          <CirleSlider
            radius={24}
            value={offerPersent}
            activeStrokeColor={colors.main}
            activeStrokeSecondaryColor={colors.pallete.lightRed}
            inActiveStrokeColor={colors.pallete.lightRed}>
            <Text size={11} preset="bold" color={colors.main}>
              ٪{offerPersent}
            </Text>
          </CirleSlider>
          <View style={styles.priceTexts}>
            <Text size={14} preset="bold" color={colors.main}>
              {numberWithCommas(item.price)} تومان
            </Text>
            {!!item.originalPrice && (
              <Text
                size={11}
                color={colors.pallete.gray2}
                style={styles.strikePrice}>
                {numberWithCommas(item.originalPrice)} تومان
              </Text>
            )}
          </View>
        </Row>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.pallete.gray1,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.pallete.gray1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  body: {
    padding: 8,
  },
  priceRow: {
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  priceTexts: {
    marginRight: 8,
    alignItems: 'flex-end',
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
});
