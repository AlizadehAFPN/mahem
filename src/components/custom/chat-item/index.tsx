import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import React from 'react';
import {colors, scaled} from '../../../theme';
import {Text} from '../../text/text';
import {Row} from '../../row/row';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import type {TFunction} from 'i18next';

function formatRelativeTime(t: TFunction, iso?: string) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return t('time.fewMinutesAgo');
  if (hours < 24) return t('time.hoursAgo', {value: hours});
  return t('time.daysAgo', {value: Math.floor(hours / 24)});
}

export interface ChatItemProps {
  item?: any;
}

export function ChatItem({item}: ChatItemProps) {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const user = useSelector(s => s.user);
  const isBuyer = item?.buyerId === user?.id;
  const counterparty = isBuyer ? item?.seller : item?.buyer;

  return (
    <TouchableOpacity
      onPress={() =>
        navigate('chat', {
          title: item?.advertisement?.title,
          conversationId: item?.id,
          avatar: counterparty?.avatar,
        })
      }
      style={styles.container}>
      <Text size={22}>{item?.advertisement?.title}</Text>
      <Row style={{width: '100%', justifyContent: 'space-between'}}>
        <View />
        <Row style={{}}>
          <Text style={{marginLeft: scaled(8)}} size={17}>
            {counterparty?.username || counterparty?.mobile}
          </Text>
          <Image
            style={{
              resizeMode: counterparty?.avatar ? 'cover' : 'contain',
              marginLeft: scaled(-30),
              height: scaled(45),
              width: scaled(45),
              borderRadius: scaled(12),
            }}
            source={
              counterparty?.avatar
                ? {uri: counterparty.avatar}
                : require('../../../assets/images/logo.png')
            }
          />
        </Row>
      </Row>
      <Text
        style={{marginBottom: scaled(10)}}
        size={12}
        color={colors.pallete.blue}>
        {formatRelativeTime(t, item?.lastMessageAt)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: scaled(8),
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    marginLeft: scaled(23),
    paddingHorizontal: scaled(8),
  },
});
