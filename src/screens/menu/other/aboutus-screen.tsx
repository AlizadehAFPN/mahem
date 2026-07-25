import {Image, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text} from '../../../components';
import {colors} from '../../../theme';

export function AboutUsScreen() {
  const {t} = useTranslation();
  return (
    <Screen withoutScroll>
      <MainHeader title={t('menu.aboutUs')} showBack />
      <View
        style={{
          width: '100%',
          paddingVertical: 20,
          backgroundColor: colors.pallete.gray1,
        }}>
        <Image
          style={{width: '100%'}}
          source={require('../../../assets/images/hlogo.png')}
        />
      </View>
      <Screen unsafe style={{paddingHorizontal: 15, flex: 1}}>
        <Text size={17} style={{}}>
          {t('info.aboutText')}
        </Text>
        <View style={{flex: 1}} />
        <View style={{alignItems: 'center'}}>
          <Text size={17} style={{textAlign: 'center'}}>
            {t('info.aboutTagline')}
          </Text>
          <Image source={require('../../../assets/images/version.png')} />
        </View>
        <Divider height={50} />
      </Screen>
    </Screen>
  );
}
