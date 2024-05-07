import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {MainHeader, Screen} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {NewsComp} from './NewsComp';

export function NotifScreen() {
  const {goBack} = useNavigation();
  const dispatch = useDispatch();

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title="پیام ها" />
      <FlatList data={[1, 2, 3]} renderItem={({item}) => <NewsComp />} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    marginHorizontal: 2,
  },
  Button: {
    flex: undefined,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
