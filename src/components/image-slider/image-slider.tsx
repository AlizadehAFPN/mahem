import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Carousel from 'react-native-reanimated-carousel';
import {Row} from '../row/row';
import {Text} from '../text/text';
import {scaled} from '../../theme';

const {width} = Dimensions.get('screen');
// `onPressImage` is what turns the slider from a passive banner into a
// tappable gallery: the ad-detail screen passes it so a tap opens the photo
// full-screen (ImageViewerModal, the same viewer the chat thread uses).
// Banner sliders (home) carry a `link` per item instead and keep their
// open-the-link behaviour — an item never has both.
export interface ImageSliderProps {
  images?: any;
  onPressImage?: any;
  prp?: any;
  // Everything else is forwarded verbatim to the component underneath
  // (a `...prp` rest parameter, or the underlying library's own props).
  // Declaring that here is what lets callers keep passing style,
  // zoomEnabled, radius and the rest — they were never this component's
  // props to begin with.
  [key: string]: any;
}

export function ImageSlider({images, onPressImage, ...prp}: ImageSliderProps) {
  const hasImages = images?.length > 0;
  const data = hasImages ? images : [require('../../assets/images/empty.webp')];
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
        // `item` is deliberately loose: this slider is handed either bare
        // url strings (ad photos) or objects carrying uri/link (banners), and
        // the branches below test for each. The carousel types it as {}.
        renderItem={({item, index}: {item: any; index: number}) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              // Tested for being a string, not just truthy: an item can be a
              // bare url string, and every string carries a `link` method
              // inherited from String.prototype (the legacy <a> helper), so a
              // plain `item?.link` check treats every ad photo as a banner
              // and hands that function to Linking.openURL.
              if (typeof item?.link === 'string') {
                Linking.openURL(item.link);
                return;
              }
              // Only real images can be opened full-screen — the
              // empty-state fallback is a bundled asset with no uri.
              if (hasImages) {
                onPressImage?.(item?.uri || item, index);
              }
            }}
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            {/* Banners are authored to fill the slot, so real images stretch.
                The empty-state fallback is a square with the ماهم mark centred
                on it — stretching that to 3:2 would visibly squash the logo, so
                it covers instead (the crop only ever eats flat grey). */}
            <Image
              resizeMode={hasImages ? 'stretch' : 'cover'}
              style={{width: '100%', height: '100%'}}
              source={hasImages ? {uri: item?.uri || item} : item}
            />
            {hasMultiple && (
              <View style={styles.guider}>
                <Row>
                  <Text color="white">{index + 1}</Text>
                  <Image
                    style={{width: scaled(20), marginEnd: scaled(5)}}
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
    right: scaled(8),
    bottom: scaled(8),
    zIndex: 1000,
    height: scaled(22),
    borderRadius: scaled(4),
    backgroundColor: 'rgba(0,0,0,.4)',
    minWidth: scaled(20),
    paddingHorizontal: scaled(5),
  },
});
