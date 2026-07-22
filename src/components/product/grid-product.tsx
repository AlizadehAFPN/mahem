import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import React, {useMemo} from 'react';
import {getLegacyImagePaths} from '../../utiles/utiles_funcs';
const {width} = Dimensions.get('window');
export function GridProduct({product, onPress}) {
  const img = useMemo(() => getLegacyImagePaths(product)[0], [product]);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        style={{width: '100%', height: '100%'}}
        source={img ? {uri: img} : require('../../assets/images/empty.webp')}
      />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    width: width / 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#efefef',
  },
});
