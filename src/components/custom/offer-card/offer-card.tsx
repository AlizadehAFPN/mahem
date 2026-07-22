import {
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../../../theme';
import {OfferPriceDetails} from './offer-price-details';
import {Rate} from '../../rating/rate';
import {Row} from '../../row/row';
import {Text} from '../../text/text';
import {getLegacyImagePaths} from '../../../utiles/utiles_funcs';

// Full-width discount card for the نزدیک‌من feed (screenshots 7/8/10): a hero
// image with the moon rating, a share button, a photo counter and the city/
// distance overlaid, followed by the shared price/discount/timer block.
export function OfferCard({item, onPress}) {
  const images = useMemo(() => getLegacyImagePaths(item), [item]);
  const img = images[0];

  const onShare = () => {
    const parts = [item?.title];
    if (item?.discountPercent) {
      parts.push(`${item.discountPercent}٪ تخفیف`);
    }
    Share.share({message: parts.filter(Boolean).join(' - ')}).catch(() => {});
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.9}>
      <View>
        <Image
          style={styles.hero}
          source={
            img ? {uri: img} : require('../../../assets/images/empty.webp')
          }
        />

        <TouchableOpacity
          onPress={onShare}
          style={styles.shareButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="share-social" size={18} color="white" />
        </TouchableOpacity>

        {typeof item?.distanceKm === 'number' && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={12} color="white" />
            <Text size={12} color="white" style={{marginRight: 4}}>
              {item.distanceKm < 1
                ? `${Math.round(item.distanceKm * 1000)} متر`
                : `${item.distanceKm.toFixed(1)} کیلومتر`}
            </Text>
          </View>
        )}

        <View style={styles.overlayBottom}>
          <View style={styles.badge}>
            <Rate rate={item?.ratingAvg ?? 0} size={15} />
          </View>
          <Row>
            {images.length > 1 && (
              <View style={[styles.badge, {marginRight: 6}]}>
                <Ionicons name="images-outline" size={13} color="white" />
                <Text size={12} color="white" style={{marginRight: 4}}>
                  {images.length}
                </Text>
              </View>
            )}
            {!!item?.city?.title && (
              <View style={styles.badge}>
                <Ionicons name="location" size={13} color="white" />
                <Text size={12} color="white" style={{marginRight: 2}}>
                  {item.city.title}
                </Text>
              </View>
            )}
          </Row>
        </View>
      </View>

      <OfferPriceDetails item={item} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: colors.pallete.gray2,
    backgroundColor: 'white',
  },
  hero: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  shareButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.main,
  },
  overlayBottom: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
});
