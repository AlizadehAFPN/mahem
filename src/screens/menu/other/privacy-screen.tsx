import {Image, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text} from '../../../components';
import {colors, scaled} from '../../../theme';

export function PrivacyScreen() {
  const {t} = useTranslation();
  return (
    <Screen withoutScroll>
      <MainHeader title={t('privacy.title')} showBack />
      <View
        style={{
          width: '100%',
          paddingVertical: scaled(20),
          backgroundColor: colors.pallete.gray1,
        }}>
        <Image
          style={{width: '100%'}}
          source={require('../../../assets/images/hlogo.png')}
        />
      </View>
      <Screen unsafe style={{paddingHorizontal: scaled(15)}}>
        <Text color={colors.pallete.red}>{t('privacy.welcome')}</Text>
        <Divider />
        <Text size={15}>{t('privacy.body')}</Text>
        <Divider height={40} />
      </Screen>
    </Screen>
  );
}
