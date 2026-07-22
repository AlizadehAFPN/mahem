import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useQuery} from 'react-query';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {colors} from '../../theme';
import {
  formatRelativeTime,
  getLegacyImagePaths,
  numberWithCommas,
} from '../../utiles/utiles_funcs';
import {findMainCategory, getAdsCategories} from '../../services';

const {width} = Dimensions.get('window');
const imageSize = width / 3.4;

// General-purpose list card for advertisements (search tab, employee tab,
// home screen's general row) — تخفیف‌یاب ads land in this same list, so it
// also renders the discount badge/strike-through when discountPercent is
// present, instead of needing a separate card just for that. استخدامی ads
// use `price` for a proposed salary rather than a sale price (see
// CommonForm), which is often left blank — labeled/handled distinctly so it
// doesn't read like an unpriced item.
export function RowProduct({product, onPress}) {
  const img = useMemo(() => getLegacyImagePaths(product)[0], [product]);
  const {data: categoriesData} = useQuery(['adsCategories'], getAdsCategories);
  const mainCategory = useMemo(
    () =>
      findMainCategory(categoriesData?.data ?? [], product?.category_id?.id),
    [categoriesData, product?.category_id?.id],
  );
  const isJobListing = mainCategory?.title === 'استخدامی';
  const hasDiscount = !!product?.discountPercent;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      <View>
        <Image
          style={styles.img}
          source={img ? {uri: img} : require('../../assets/images/empty.webp')}
        />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text size={11} color="white">
              ٪{product.discountPercent}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View>
          <Text numberOfLines={1} preset="bold" size={16}>
            {product?.title}
          </Text>
          {(!!mainCategory?.title || !!product?.city?.title) && (
            <Row style={styles.metaRow}>
              {!!product?.city?.title && (
                <Row style={styles.metaItem}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.pallete.gray2}
                  />
                  <Text
                    size={12}
                    color={colors.pallete.gray2}
                    style={styles.metaText}>
                    {product.city.title}
                  </Text>
                </Row>
              )}
              {!!mainCategory?.title && (
                <Text numberOfLines={1} size={12} color={colors.pallete.gray2}>
                  {mainCategory.title}
                </Text>
              )}
            </Row>
          )}
        </View>
        <View>
          {hasDiscount ? (
            <Row>
              <Text size={15} preset="bold" color={colors.main}>
                {numberWithCommas(product.price)} تومان
              </Text>
              {!!product?.originalPrice && (
                <Text size={12} color={colors.pallete.gray2} style={styles.strikePrice}>
                  {numberWithCommas(product.originalPrice)}
                </Text>
              )}
            </Row>
          ) : product?.price ? (
            <Text size={15} preset="bold" color={colors.pallete.green}>
              {isJobListing ? 'حقوق پیشنهادی: ' : ''}
              {numberWithCommas(product.price)} تومان
            </Text>
          ) : isJobListing ? (
            <Text size={13} color={colors.pallete.gray2}>
              حقوق توافقی
            </Text>
          ) : null}
          <Row style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.pallete.blue} />
            <Text size={11} color={colors.pallete.blue} style={styles.metaText}>
              {product?.createdAt ? formatRelativeTime(product.createdAt) : ''}
            </Text>
          </Row>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.pallete.gray1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  img: {
    height: imageSize,
    width: imageSize,
    borderRadius: 8,
    backgroundColor: colors.pallete.gray1,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.main,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  content: {
    flex: 1,
    height: imageSize,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  metaRow: {
    marginTop: 4,
  },
  metaItem: {
    marginLeft: 8,
  },
  metaText: {
    marginRight: 2,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
});
