import {StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Row} from '../../row/row';
import {Text} from '../../text/text';
import {colors, scaled} from '../../../theme';

export interface TimerProps {
  /** Remaining time in seconds. */
  time?: number;
}

const SECONDS_PER_DAY = 24 * 60 * 60;
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_MINUTE = 60;

/** Two digits, so a countdown doesn't jump between "9" and "10" widths. */
const pad = (value: number) => String(value).padStart(2, '0');

export function Timer({time = 0}: TimerProps) {
  const {t} = useTranslation();
  const [remaining, setRemaining] = useState(time);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRemaining(s => Math.max(0, s - 60));
    }, 60000);
    return () => clearTimeout(timeout);
  }, []);

  // The minutes figure was `rem1 % 60`, which is the leftover *seconds* within
  // a minute, not minutes within the hour — so a listing with 1 day 1 hour
  // 30 minutes left displayed «۰ دقیقه». Derived rather than held in state,
  // which also removes the second setState-in-an-effect render pass.
  const withinDay = remaining % SECONDS_PER_DAY;
  const days = Math.floor(remaining / SECONDS_PER_DAY);
  const houres = Math.floor(withinDay / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (withinDay % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  return (
    <View>
      <Row style={{flexDirection: 'row'}}>
        <View style={styles.itemContainer}>
          <Text
            color={colors.pallete.grayText}
            style={{lineHeight: scaled(20)}}>
            {days}
          </Text>
          <Text style={{lineHeight: scaled(20)}}>{t('common.day')}</Text>
        </View>
        <View style={styles.itemContainer}>
          <Text
            color={colors.pallete.grayText}
            style={{lineHeight: scaled(20)}}>
            {pad(houres)}
          </Text>
          <Text style={{lineHeight: scaled(20)}}>{t('common.hour')}</Text>
        </View>
        <View style={styles.itemContainer}>
          <Text
            color={colors.pallete.grayText}
            style={{lineHeight: scaled(20)}}>
            {pad(minutes)}
          </Text>
          <Text style={{lineHeight: scaled(20)}}>{t('common.minute')}</Text>
        </View>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingHorizontal: scaled(8),
    alignItems: 'center',
  },
});
