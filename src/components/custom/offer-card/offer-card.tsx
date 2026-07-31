import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {colors, scaled} from '../../../theme';
import {OfferPriceDetails} from './offer-price-details';
import {Rate} from '../../rating/rate';
import {Row} from '../../row/row';
import {Text} from '../../text/text';
import {getLegacyImagePaths} from '../../../utiles/utiles_funcs';
import {SocialShare} from '../../social-share/social-share';
import {buildAdLink} from '../../../navigation/deep-links';

// Full-width discount card for the نزدیک‌من feed (screenshots 7/8/10): a hero
// image with the moon rating, a share button, a photo counter and the city/
// distance overlaid, followed by the shared price/discount/timer block.
export interface OfferCardProps {
  item?: any;
  onPress?: any;
}

export function OfferCard({item, onPress}: OfferCardProps) {
  const {t} = useTranslation();
  const images = useMemo(() => getLegacyImagePaths(item), [item]);
  const img = images[0];

  const onShare = () => {
    const parts = [item?.title];
    if (item?.discountPercent) {
      parts.push(t('offers.percentOff', {percent: item.discountPercent}));
    }
    // An offer is an advertisement with a discount, so it shares the same
    // deep link — the recipient lands on the same SingleProductScreen a tap
    // on this card opens.
    SocialShare({
      message: parts.filter(Boolean).join(' - '),
      link: item?.id ? buildAdLink(item.id) : undefined,
      dialogTitle: t('common.appName'),
    });
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
          <Ionicons name="share-social" size={scaled(18)} color="white" />
        </TouchableOpacity>

        {typeof item?.distanceKm === 'number' && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={scaled(12)} color="white" />
            <Text size={12} color="white" style={{marginRight: scaled(4)}}>
              {item.distanceKm < 1
                ? t('offers.distanceMeters', {
                    value: Math.round(item.distanceKm * 1000),
                  })
                : t('offers.distanceKilometers', {
                    value: item.distanceKm.toFixed(1),
                  })}
            </Text>
          </View>
        )}

        <View style={styles.overlayBottom}>
          <View style={styles.badge}>
            <Rate rate={item?.ratingAvg ?? 0} size={15} />
          </View>
          <Row>
            {images.length > 1 && (
              <View style={[styles.badge, {marginRight: scaled(6)}]}>
                <Ionicons
                  name="images-outline"
                  size={scaled(13)}
                  color="white"
                />
                <Text size={12} color="white" style={{marginRight: scaled(4)}}>
                  {images.length}
                </Text>
              </View>
            )}
            {!!item?.city?.title && (
              <View style={styles.badge}>
                <Ionicons name="location" size={scaled(13)} color="white" />
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
    borderRadius: scaled(16),
    overflow: 'hidden',
    borderColor: colors.pallete.gray2,
    backgroundColor: 'white',
  },
  hero: {
    width: '100%',
    height: scaled(220),
    resizeMode: 'cover',
  },
  shareButton: {
    position: 'absolute',
    top: scaled(8),
    left: scaled(8),
    width: scaled(32),
    height: scaled(32),
    borderRadius: scaled(16),
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    top: scaled(8),
    right: scaled(8),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaled(8),
    paddingVertical: scaled(4),
    borderRadius: scaled(12),
    backgroundColor: colors.main,
  },
  overlayBottom: {
    position: 'absolute',
    left: scaled(8),
    right: scaled(8),
    bottom: scaled(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaled(8),
    paddingVertical: scaled(4),
    borderRadius: scaled(12),
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
});
