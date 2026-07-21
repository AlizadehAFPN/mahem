import {StyleSheet, View} from 'react-native';
import React from 'react';
import {MainHeader, Screen, StoryBar} from '../../../components';
import {colors} from '../../../theme';

// Only the store story-bar is backed by real data (`getAllStore`). There is
// no "discount ad" concept in the backend schema — Advertisement has no
// storeId/offer relation — so this screen no longer fetches a fake
// category-17 ad list; browsing a store's own items happens via StoryBar →
// offerMarket/userOfferMarketScreen.
export function OfferDetectionScreen() {
  return (
    <Screen>
      <MainHeader title="تخفیف یاب" showLocation={true} />
      <Screen>
        <StoryBar />
        <View style={styles.line} />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.pallete.gray2,
  },
});
