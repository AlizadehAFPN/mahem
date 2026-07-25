import {Image, View, Linking} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text, Row} from '../../../components';
import {colors} from '../../../theme';

export function CallUsScreen() {
  const {t} = useTranslation();
  return (
    <Screen withoutScroll>
      <MainHeader title={t('menu.contactUs')} showBack />
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
      <Screen unsafe style={{paddingHorizontal: 15}}>
        <Text size={17}>{t('info.contactIntro')}</Text>
        <Divider />
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.telegramId')}</Text>
          <Text
            size={17}
            onPress={() => Linking.openURL('http://t.me/Mahem_App')}>
            Mahem_App
          </Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.emailAddress')}</Text>
          <Text
            size={17}
            onPress={() =>
              Linking.openURL(
                'mailto:Mahem_App@gmail.com?subject=SendMail&body=',
              )
            }>
            Mahem_App@gmail.com
          </Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.instagramId')}</Text>
          <Text
            size={17}
            onPress={() =>
              Linking.openURL('instagram://user?username=Mahem_App').catch(
                () => {
                  Linking.openURL('https://www.instagram.com/Mahem.App');
                },
              )
            }>
            Mahem_App
          </Text>
        </Row>
        <Divider />
        <Text size={17}>{t('info.officeNotice')}</Text>
        <Text size={17}> {t('info.cyberpoliceNotice')}</Text>
        <Divider />
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.cyberpoliceGonbad')}</Text>
          <Text size={17}>017-21833453</Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.cyberpoliceGorgan')}</Text>
          <Text size={17}>017-21822972</Text>
        </Row>
        <Divider height={50} />
      </Screen>
    </Screen>
  );
}
