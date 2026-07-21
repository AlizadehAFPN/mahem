import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  Pressable,
  Linking,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Carousel from 'react-native-reanimated-carousel';
import {Row} from '../row/row';
import {Text} from '../text/text';

const {width} = Dimensions.get('screen');
export function ImageSlider({images, ...prp}) {
  const data =
    images?.length > 0 ? images : [require('../../assets/images/empty.webp')];
  // A single image (real or the empty-state fallback) has nothing to loop
  // or auto-play between — doing so anyway is what reads as the banner
  // "changing" on its own, and the counter overlay is meaningless with only
  // one item.
  const hasMultiple = data.length > 1;
  return (
    <View>
      <Carousel
        loop={hasMultiple}
        width={width}
        height={width / 1.5}
        style={{width: '100%', justifyContent: 'flex-end'}}
        autoPlayReverse={hasMultiple}
        autoPlay={hasMultiple}
        data={data}
        autoPlayInterval={3000}
        scrollAnimationDuration={1000}
        {...prp}
        renderItem={({item, index}) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              if (item?.link) {
                Linking.openURL(item?.link);
              }
            }}
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Image
              resizeMode="stretch"
              style={{width: '100%', height: '100%', resizeMode: 'stretch'}}
              source={images?.length > 0 ? {uri: item?.uri || item} : item}
            />
            {hasMultiple && (
              <View style={styles.guider}>
                <Row>
                  <Text color="white">{index + 1}</Text>
                  <Image
                    style={{width: 20, marginEnd: 5}}
                    source={require('../../assets/images/guider.png')}
                  />
                </Row>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  guider: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    zIndex: 1000,
    height: 22,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,.4)',
    minWidth: 20,
    paddingHorizontal: 5,
  },
});
