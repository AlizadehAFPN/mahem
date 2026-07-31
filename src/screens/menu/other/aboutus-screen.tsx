import {Image, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text} from '../../../components';
import {colors, scaled} from '../../../theme';
import {useAppSetting} from '../../../hooks/use-cached-app-settings';

export function AboutUsScreen() {
  const {t} = useTranslation();
  // Admin-editable via the panel; falls back to the bundled copy when unset.
  const aboutText = useAppSetting('aboutText', t('info.aboutText'));
  return (
    <Screen withoutScroll>
      <MainHeader title={t('menu.aboutUs')} showBack />
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
      <Screen unsafe style={{paddingHorizontal: scaled(15), flex: 1}}>
        <Text size={17} style={{}}>
          {aboutText}
        </Text>
        <View style={{flex: 1}} />
        <View style={{alignItems: 'center'}}>
          <Text size={17} style={{textAlign: 'center'}}>
            {t('info.aboutTagline')}
          </Text>
          <Image
            source={require('../../../assets/images/version.png')}
            style={{width: scaled(69), height: scaled(27)}}
            resizeMode="contain"
          />
        </View>
        <Divider height={50} />
      </Screen>
    </Screen>
  );
}
