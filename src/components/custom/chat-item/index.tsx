import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import React from 'react';
import {colors} from '../../../theme';
import {Text} from '../../text/text';
import {Row} from '../../row/row';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

function formatRelativeTime(iso?: string) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return 'چند دقیقه پیش';
  if (hours < 24) return `${hours} ساعت پیش`;
  return `${Math.floor(hours / 24)} روز پیش`;
}

export function ChatItem({item}) {
  const {navigate} = useNavigation();
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
          <Text style={{marginLeft: 8}} size={17}>
            {counterparty?.username || counterparty?.mobile}
          </Text>
          <Image
            style={{
              resizeMode: counterparty?.avatar ? 'cover' : 'contain',
              marginLeft: -30,
              height: 45,
              width: 45,
              borderRadius: 12,
            }}
            source={
              counterparty?.avatar
                ? {uri: counterparty.avatar}
                : require('../../../assets/images/logo.png')
            }
          />
        </Row>
      </Row>
      <Text style={{marginBottom: 10}} size={12} color={colors.pallete.blue}>
        {formatRelativeTime(item?.lastMessageAt)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    marginLeft: 23,
    paddingHorizontal: 8,
  },
});
