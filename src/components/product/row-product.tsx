import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {colors, scaled} from '../../theme';
import {
  formatRelativeTime,
  getLegacyImagePaths,
  numberWithCommas,
} from '../../utiles/utiles_funcs';
import {findMainCategory} from '../../services';
import {useAdsCategories} from '../../hooks/use-cached-categories';

const {width} = Dimensions.get('window');
const imageSize = width / 3.4;

// General-purpose list card for advertisements (search tab, employee tab,
// home screen's general row) — تخفیف‌یاب ads land in this same list, so it
// also renders the discount badge/strike-through when discountPercent is
// present, instead of needing a separate card just for that. استخدامی ads
// use `price` for a proposed salary rather than a sale price (see
// CommonForm), which is often left blank — labeled/handled distinctly so it
// doesn't read like an unpriced item.
export interface RowProductProps {
  product?: any;
  onPress?: any;
}

export function RowProduct({product, onPress}: RowProductProps) {
  const {t} = useTranslation();
  const img = useMemo(() => getLegacyImagePaths(product)[0], [product]);
  const {data: categoriesData} = useAdsCategories();
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
                    size={scaled(13)}
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
                {numberWithCommas(product.price)} {t('common.toman')}
              </Text>
              {!!product?.originalPrice && (
                <Text
                  size={12}
                  color={colors.pallete.gray2}
                  style={styles.strikePrice}>
                  {numberWithCommas(product.originalPrice)}
                </Text>
              )}
            </Row>
          ) : product?.price ? (
            <Text size={15} preset="bold" color={colors.pallete.green}>
              {isJobListing ? t('product.proposedSalary') : ''}
              {numberWithCommas(product.price)} {t('common.toman')}
            </Text>
          ) : isJobListing ? (
            <Text size={13} color={colors.pallete.gray2}>
              {t('product.negotiableSalary')}
            </Text>
          ) : null}
          <Row style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={scaled(12)}
              color={colors.pallete.blue}
            />
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
    borderRadius: scaled(12),
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.pallete.gray1,
    padding: scaled(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  img: {
    height: imageSize,
    width: imageSize,
    borderRadius: scaled(8),
    backgroundColor: colors.pallete.gray1,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: scaled(4),
    left: scaled(4),
    backgroundColor: colors.main,
    borderRadius: scaled(4),
    paddingHorizontal: scaled(4),
    paddingVertical: 2,
  },
  content: {
    flex: 1,
    height: imageSize,
    marginLeft: scaled(10),
    justifyContent: 'space-between',
  },
  metaRow: {
    marginTop: scaled(4),
  },
  metaItem: {
    marginLeft: scaled(8),
  },
  metaText: {
    marginRight: 2,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    marginRight: scaled(6),
  },
});
