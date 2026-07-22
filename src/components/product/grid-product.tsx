import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import React, {useMemo} from 'react';
import {getLegacyImagePaths, numberWithCommas} from '../../utiles/utiles_funcs';
import {colors} from '../../theme';
const {width} = Dimensions.get('window');
export function GridProduct({product, onPress}) {
  // Advertisements carry images via the synthesized image1/image2... fields
  // (see getLegacyImagePaths); Jobs have no such thing, just plain
  // banner/logo URLs, so fall back to those for بانک مشاغل's home-screen row.
  const img = useMemo(
    () => getLegacyImagePaths(product)[0] ?? product?.banner ?? product?.logo,
    [product],
  );
  // Jobs use `salary` instead of `price`, and it's commonly left blank —
  // omit the line entirely rather than showing "0 تومان" or a dash.
  const price = product?.price ?? product?.salary;
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          style={{width: '100%', height: '100%'}}
          source={img ? {uri: img} : require('../../assets/images/empty.webp')}
        />
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {product?.title}
      </Text>
      {!!price && (
        <Text numberOfLines={1} style={styles.price}>
          {numberWithCommas(price)} تومان
        </Text>
      )}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    width: width / 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#efefef',
  },
  title: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'right',
  },
  price: {
    marginTop: 2,
    fontSize: 11,
    color: colors.pallete.green,
    textAlign: 'right',
  },
});
