import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors, scaled} from '../../theme';
import {Text} from '../text/text';

export function Message({message, index, onPressImage}: any) {
  const hasImage = !!message.imageUrl;
  const hasText = !!message.text;
  return (
    <View style={{...styles.continer, marginTop: index == 0 ? scaled(20) : 0}}>
      <View
        style={{
          ...styles.message,
          // An image fills its bubble edge to edge, so the padding moves onto
          // the caption below it rather than framing the photo.
          padding: hasImage ? 0 : scaled(16),
          alignSelf: message.me ? 'flex-end' : 'flex-start',
          backgroundColor: message.me
            ? colors.pallete.green1
            : colors.pallete.gray1,
        }}>
        {hasImage && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPressImage?.(message.imageUrl)}>
            {/* Square crop, so one oddly-proportioned photo can't stretch the
                thread — tapping opens the whole image in ImageViewerModal. */}
            <Image
              style={styles.image}
              source={{uri: message.imageUrl}}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        {hasText && (
          <Text size={17} style={hasImage ? styles.caption : undefined}>
            {message.text}
          </Text>
        )}
      </View>
      <View
        style={{
          ...styles.avatarContainer,
          left: message.me ? null : scaled(16),
          right: message.me ? scaled(16) : null,
        }}>
        <Image
          style={{...styles.avatar}}
          resizeMode={message.avatar ? 'cover' : 'contain'}
          source={
            message.avatar
              ? {uri: message.avatar}
              : require('../../assets/images/logo.png')
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  continer: {
    paddingHorizontal: scaled(32),
  },
  message: {
    width: '80%',
    borderRadius: scaled(16),
    // Clips the photo to the bubble's rounded corners.
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    // Shows through while the photo is still downloading, so the bubble does
    // not sit there as an empty coloured box.
    backgroundColor: colors.pallete.gray1,
  },
  caption: {
    paddingHorizontal: scaled(16),
    paddingVertical: scaled(12),
  },
  avatarContainer: {
    position: 'absolute',
    top: scaled(-20),
    backgroundColor: 'white',
    borderRadius: scaled(10),
    padding: scaled(8),
    height: scaled(42),
    width: scaled(42),
    overflow: 'hidden',
    zIndex: 1001,
  },
  avatar: {
    borderRadius: scaled(8),
    height: scaled(28),
    width: scaled(28),
    overflow: 'hidden',
  },
});
