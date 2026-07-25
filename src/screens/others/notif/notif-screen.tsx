import {FlatList} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {ListFooter, ListState, MainHeader, Screen} from '../../../components';
import {useMutation, useQueryClient} from 'react-query';
import {getNotifications, markNotificationRead} from '../../../services';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {NewsComp} from './NewsComp';
import {useNavigation} from '@react-navigation/native';

export function NotifScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const queryClient = useQueryClient();
  const {
    items: notifications,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['notifications'],
    queryFn: ({pageParam = 1}) =>
      getNotifications({page: pageParam, limit: 20}),
    selectItems: page => page?.data?.notifications,
  });

  const {mutate: markReadMutate} = useMutation(markNotificationRead, {
    onSuccess: () => queryClient.invalidateQueries('notifications'),
  });

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title={t('notif.title')} showBack />
      <FlatList
        data={notifications}
        onEndReached={onEndReached}
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage={t('notif.empty')}
          />
        }
        renderItem={({item}) => (
          <NewsComp
            item={item}
            onPress={() => {
              if (!item.isRead) {
                markReadMutate(item.id);
              }
              navigate('notifDetail', {item});
            }}
          />
        )}
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemCount={notifications.length}
          />
        }
      />
    </Screen>
  );
}
