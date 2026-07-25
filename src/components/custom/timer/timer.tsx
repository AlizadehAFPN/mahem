import {StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Row} from '../../row/row';
import {Text} from '../../text/text';
import {colors} from '../../../theme';

export function Timer({time}) {
  const {t} = useTranslation();
  const [state, setState] = useState({
    time: time,
    days: '',
    houres: '',
    minutes: '',
  });
  useEffect(() => {
    const timeout = setTimeout(() => {
      setState(s => ({...s, time: s.time - 60}));
    }, 60000);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const days = Math.floor(state.time / (24 * 60 * 60));
    const rem1 = state.time % (24 * 60 * 60) || '00';
    const houres = Math.floor(rem1 / (60 * 60)) || '00';
    const minutes = rem1 % 60;
    setState(s => ({...s, days, houres, minutes}));
  }, [state.time]);
  return (
    <View>
      <Row style={{flexDirection: 'row'}}>
        <View style={styles.itemContainer}>
          <Text color={colors.pallete.grayText} style={{lineHeight: 20}}>
            {state.days}
          </Text>
          <Text style={{lineHeight: 20}}>{t('common.day')}</Text>
        </View>
        <View style={styles.itemContainer}>
          <Text color={colors.pallete.grayText} style={{lineHeight: 20}}>
            {state.houres}
          </Text>
          <Text style={{lineHeight: 20}}>{t('common.hour')}</Text>
        </View>
        <View style={styles.itemContainer}>
          <Text color={colors.pallete.grayText} style={{lineHeight: 20}}>
            {state.minutes}
          </Text>
          <Text style={{lineHeight: 20}}>{t('common.minute')}</Text>
        </View>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
});
