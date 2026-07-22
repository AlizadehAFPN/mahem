import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import React, {useMemo} from 'react';
import {Text} from '../text/text';
import {colors} from '../../theme';
import {getLegacyImagePaths} from '../../utiles/utiles_funcs';
const {width} = Dimensions.get('window');
export function RowProduct({product, onPress}) {
  const img = useMemo(() => getLegacyImagePaths(product)[0], [product]);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        style={styles.img}
        source={img ? {uri: img} : require('../../assets/images/empty.webp')}
      />
      <View style={styles.titleContainer}>
        <Text size={22}>{product.title}</Text>
        <Text color={colors.pallete.blue} size={12}>
          سه دقیقه پیش
        </Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.pallete.gray1,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    justifyContent: 'space-between',
    height: width / 3,
  },
  img: {
    height: width / 3,
    width: width / 3,
    borderRadius: 8,
    borderColor: colors.pallete.gray2,
    borderWidth: 1,
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  titleContainer: {
    height: width / 3,
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
});
