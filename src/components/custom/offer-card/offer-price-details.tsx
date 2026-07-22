import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text as RNText,
} from 'react-native';
import React, {useMemo} from 'react';
import {colors} from '../../../theme';
import {CirleSlider} from '../../cicle-slider/circle-slider';
import {Rate} from '../../rating/rate';
import {Row} from '../../row/row';
import {Text} from '../../text/text';
import {Timer} from '../timer/timer';
import {numberWithCommas} from '../../../utiles';

export function OfferPriceDetails({item, ...prp}) {
  const offerPersent = item?.discountPercent ?? 0;
  // expiresAt is an absolute ISO timestamp; Timer wants a countdown in
  // seconds, and counts down locally from there rather than re-reading the
  // clock, so it only needs the remaining duration once on mount.
  const secondsRemaining = useMemo(() => {
    if (!item?.expiresAt) {
      return undefined;
    }
    return Math.max(
      0,
      Math.round((new Date(item.expiresAt).getTime() - Date.now()) / 1000),
    );
  }, [item?.expiresAt]);
  if (!item) {
    return null;
  }
  return (
    <Row style={styles.container} {...prp}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 70,
          paddingTop: 8,
        }}>
        <Text
          size={15}
          style={{textAlign: 'center', width: '100%'}}
          numberOfLines={1}>
          {item.title}
        </Text>
        <View>
          <RNText>
            <Text size={12} color={colors.pallete.grayText}>
              قیمت
            </Text>
            <Text
              style={{
                marginHorizontal: 8,
                textDecorationLine: 'line-through',
                textDecorationColor: colors.pallete.grayText,
              }}
              size={12}
              color={colors.pallete.green}>
              {numberWithCommas(item.originalPrice)}
            </Text>
            <Text size={12} color={colors.pallete.grayText}>
              تومان
            </Text>
          </RNText>
          <View style={styles.line} />
        </View>
      </View>
      <View style={{flex: 0.5}}>
        <CirleSlider
          radius={32}
          value={offerPersent}
          activeStrokeColor={colors.main}
          activeStrokeSecondaryColor={colors.pallete.lightRed}
          inActiveStrokeColor={colors.pallete.lightRed}>
          <Text style={{lineHeight: 20}}>{offerPersent}%</Text>
          <Text color="rgba(0,0,0,.5)" style={{lineHeight: 20}}>
            تخفیف
          </Text>
        </CirleSlider>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          height: 70,
          justifyContent: 'space-between',
        }}>
        {secondsRemaining ? <Timer time={secondsRemaining} /> : <View />}
        <RNText>
          <Text>پرداختی شما</Text>
          <Text
            style={{paddingHorizontal: 10}}
            size={12}
            color={colors.pallete.green}>
            {numberWithCommas(item.price)}
          </Text>
          <Text>تومان</Text>
        </RNText>
      </View>
    </Row>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.pallete.gray1,
    borderTopWidth: 1,
    borderColor: colors.pallete.gray2,
    paddingVertical: 10,
  },
  line: {
    height: 1.5,
    backgroundColor: colors.pallete.gray2,
    width: 70,
    transform: [{rotate: '-15deg'}],
    // marginTop: -20,
    position: 'absolute',
    // top:0,
    bottom: 10,
    left: 10,
  },
});
