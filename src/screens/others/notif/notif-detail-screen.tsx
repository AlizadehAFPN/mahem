import {ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {MainHeader, Screen, Text} from '../../../components';
import {colors, scaled} from '../../../theme';
import {useRoute} from '@react-navigation/native';
import {formatNotificationDate} from './notification-date';

// "متن نوتیفیکشن" (Figma 106:624) — the notification list only shows a
// 2-line-truncated preview (NewsComp); this is the full-text view reached
// by tapping one.
export function NotifDetailScreen() {
  const {t} = useTranslation();
  const {params} = useRoute<any>();
  const item = params?.item;

  return (
    <Screen withoutScroll>
      <MainHeader title={item?.title ?? t('notif.messageFallback')} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text size={13} color={colors.pallete.grayText} style={styles.date}>
          {formatNotificationDate(item?.createdAt)}
        </Text>
        <Text size={16} style={styles.body}>
          {item?.body}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: scaled(16),
  },
  date: {
    textAlign: 'left',
    marginBottom: scaled(12),
  },
  body: {
    textAlign: 'right',
    lineHeight: scaled(28),
  },
});
