import {Platform, View, StyleSheet, Image, Linking} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {MainModal} from './mainModal';
import {colors} from '../../theme';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {Divider} from '../divider/divider';
import {Button} from '../button/button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// `email`/`hideEmail` come straight from ContactInfoCard's collected values
// (see ads.ts's attributes flattening) — only shown here when the poster
// actually provided an email and didn't opt to hide it from viewers.
export function CallInfo({visible, onClose, phone, email, hideEmail}) {
  const {t} = useTranslation();
  const showEmail = !!email && !hideEmail;
  function openUrl(url: string): Promise<any> {
    return Linking.openURL(url);
  }
  function openSmsUrl(phone: string, body: string): Promise<any> {
    return openUrl(`sms:${phone}${getSMSDivider()}body=${body}`);
  }
  function getSMSDivider(): string {
    return Platform.OS === 'ios' ? '&' : '?';
  }
  return (
    <MainModal onClose={onClose} visible={visible}>
      <View style={styles.card}>
        <Text size={20} preset="bold" color={colors.pallete.red2}>
          {t('callInfo.title')}
        </Text>
        <Divider />
        <View style={styles.card2}>
          <Button onPress={() => Linking.openURL(`tel:${phone}`)}>
            <Row>
              <Image source={require('../../assets/images/phone.png')} />
              <Text style={styles.textItem}>{t('callInfo.callWith', {phone})}</Text>
            </Row>
          </Button>

          <Divider />
          <Button onPress={() => openSmsUrl(phone, '')}>
            <Row>
              <Image source={require('../../assets/images/chat2.png')} />
              <Text style={styles.textItem}>{t('callInfo.sendSms')}</Text>
            </Row>
          </Button>

          {showEmail && (
            <>
              <Divider />
              <Button onPress={() => Linking.openURL(`mailto:${email}`)}>
                <Row>
                  <MaterialCommunityIcons size={25} name="email-outline" />
                  <Text style={styles.textItem}>
                    {t('callInfo.emailTo', {email})}
                  </Text>
                </Row>
              </Button>
            </>
          )}
          <Divider />
          <Text size={15} color="rgba(0,0,0,.5)">
            {t('callInfo.policeWarning')}
          </Text>
          <Divider />
          <Button onPress={onClose} style={{alignSelf: 'flex-start'}}>
            <Text color={colors.pallete.red2}>{t('common.neverMind')}</Text>
          </Button>
        </View>
        <Divider />
      </View>
    </MainModal>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    paddingHorizontal: 8,
    paddingTop: 16,
    backgroundColor: colors.pallete.gray1,
  },
  textItem: {
    paddingHorizontal: 10,
  },
  card2: {
    paddingHorizontal: 16,
  },
});
