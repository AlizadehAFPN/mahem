import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {MainHeader, Screen} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

export function NewsComp() {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 10,
      }}>
      <View
        style={{
          paddingVertical: 12,
          width: '100%',
          paddingHorizontal: 10,
          borderRadius: 4,
          backgroundColor: '#D0D0D0D0',
          borderWidth: 1,
        }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Image
            style={{
              width: 35,
              height: 35,
              resizeMode: 'contain',
              borderRadius: 2,
            }}
            source={require('../../../assets/images/logo.png')}
          />
          <Text style={{textAlign: 'right'}} numberOfLines={2}>
            سلام سلام سلا مسلاس لامسلامس لامسلامس سلام سلام سلا مسلام سلامسلام
            لامسلامس لام
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#D0D0D0',
            width: '50%',
            borderTopRightRadius: 100,
            borderWidth: 1,
            borderColor: '#707070',
            marginTop: 6,
            paddingHorizontal: 4,
            paddingRight: 20,
            paddingVertical: 2,
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          <Text>۱۱:۵۶</Text>
          <Text>۱۳۹۹/۱۱/۱۶</Text>
        </View>
      </View>
    </View>
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
