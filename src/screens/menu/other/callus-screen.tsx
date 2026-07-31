import {Image, View, Linking} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text, Row} from '../../../components';
import {colors, scaled} from '../../../theme';
import {useAppSetting} from '../../../hooks/use-cached-app-settings';

// Admins may paste an @handle or a full URL; the screen wants just the
// username to display and to build the deep link from.
const handleOnly = (value: string) =>
  value
    .trim()
    .replace(/^@/, '')
    .replace(
      /^https?:\/\/(t\.me|telegram\.me|www\.instagram\.com|instagram\.com)\//i,
      '',
    )
    .replace(/\/+$/, '');

export function CallUsScreen() {
  const {t} = useTranslation();
  // All admin-editable via the panel; each falls back to its bundled default
  // when unset (see useAppSetting / AppSettingsSyncBridge).
  const contactText = useAppSetting('contactText', t('info.contactIntro'));
  const telegram = handleOnly(useAppSetting('telegram', 'Mahem_App'));
  const instagram = handleOnly(useAppSetting('instagram', 'Mahem_App'));
  const email = useAppSetting('email', 'Mahem_App@gmail.com');
  const phone = useAppSetting('phone', '');
  return (
    <Screen withoutScroll>
      <MainHeader title={t('menu.contactUs')} showBack />
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
        <Text size={17}>{contactText}</Text>
        <Divider />
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.telegramId')}</Text>
          <Text
            size={17}
            onPress={() => Linking.openURL(`https://t.me/${telegram}`)}>
            {telegram}
          </Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.emailAddress')}</Text>
          <Text
            size={17}
            onPress={() =>
              Linking.openURL(`mailto:${email}?subject=SendMail&body=`)
            }>
            {email}
          </Text>
        </Row>
        <Row style={{justifyContent: 'space-between'}}>
          <Text size={17}>{t('info.instagramId')}</Text>
          <Text
            size={17}
            onPress={() =>
              Linking.openURL(`instagram://user?username=${instagram}`).catch(
                () => {
                  Linking.openURL(`https://www.instagram.com/${instagram}`);
                },
              )
            }>
            {instagram}
          </Text>
        </Row>
        {phone !== '' && (
          <Row style={{justifyContent: 'space-between'}}>
            <Text size={17}>{t('info.phoneNumber')}</Text>
            <Text size={17} onPress={() => Linking.openURL(`tel:${phone}`)}>
              {phone}
            </Text>
          </Row>
        )}
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
