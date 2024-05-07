import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import React, {useMemo} from 'react';
const {width} = Dimensions.get('window');
export function GridProduct({product, onPress}) {
  const img = useMemo(() => {
    if (!!product) {
      const imgs = Object.keys(product)
        .filter(item => item.includes('image'))
        .filter(item => !!product[item])
        .map(item => product[item].path);
      return imgs[0];
    } else {
      return [];
    }
  }, [product]);
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
