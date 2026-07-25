import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../text/text';
import {colors} from '../../theme';

// Shared ListFooterComponent for every backend-paginated FlatList (the ones
// wired to usePaginatedList + onEndReached). While the next page is loading it
// shows a spinner at the bottom of the list; once every page has been fetched
// it shows an "end of list" caption; on an empty list it renders only the
// bottom spacer (the empty state — ListEmptyComponent — owns that case).
export function ListFooter({
  isFetchingNextPage,
  hasNextPage,
  itemCount,
  bottomSpacing = 40,
  endMessage,
}: {
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  itemCount?: number;
  bottomSpacing?: number;
  endMessage?: string;
}) {
  const {t} = useTranslation();
  if (isFetchingNextPage) {
    return (
      <View style={{paddingVertical: 16, alignItems: 'center'}}>
        <ActivityIndicator size="small" color={colors.main} />
      </View>
    );
  }

  // Only caption a non-empty, fully-loaded list. A list still loading its
  // first page (itemCount 0) shouldn't claim it has ended, and an empty
  // result is handled by ListEmptyComponent instead.
  if (!hasNextPage && (itemCount ?? 0) > 0) {
    return (
      <View
        style={{
          paddingTop: 16,
          paddingBottom: bottomSpacing,
          alignItems: 'center',
        }}>
        <Text size={12} color={colors.pallete.grayText}>
          {endMessage ?? t('common.endOfList')}
        </Text>
      </View>
    );
  }

  return <View style={{height: bottomSpacing}} />;
}
