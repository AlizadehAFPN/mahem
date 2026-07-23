import {ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import {MainHeader, Screen, Text} from '../../../components';
import {colors} from '../../../theme';
import {useRoute} from '@react-navigation/native';

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fa-IR');
}

// "متن نوتیفیکشن" (Figma 106:624) — the notification list only shows a
// 2-line-truncated preview (NewsComp); this is the full-text view reached
// by tapping one.
export function NotifDetailScreen() {
  const {params} = useRoute<any>();
  const item = params?.item;

  return (
    <Screen withoutScroll>
      <MainHeader title={item?.title ?? 'پیام'} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text size={13} color={colors.pallete.grayText} style={styles.date}>
          {formatDate(item?.createdAt)}
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
    padding: 16,
  },
  date: {
    textAlign: 'left',
    marginBottom: 12,
  },
  body: {
    textAlign: 'right',
    lineHeight: 28,
  },
});
