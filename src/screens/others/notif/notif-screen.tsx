import {FlatList} from 'react-native';
import React, {useCallback, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import type {Swipeable} from 'react-native-gesture-handler';
import {ListFooter, ListState, MainHeader, Screen} from '../../../components';
import {useMutation, useQueryClient} from 'react-query';
import {
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from '../../../services';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {NewsComp} from './NewsComp';
import {resolveNotificationTarget} from './notification-target';
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
    // Flip the row's ticks to green on the tap itself. Waiting for the request
    // means they stay grey while the tapped notification's target screen is
    // already opening, and the row looks unread when the user comes back.
    // invalidateQueries below reconciles the header's unread badge.
    onMutate: (id: string) => {
      queryClient.setQueryData('notifications', (data: any) => {
        if (!data?.pages) {
          return data;
        }
        return {
          ...data,
          pages: data.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              notifications: (page.data?.notifications ?? []).map((item: any) =>
                item.id === id ? {...item, isRead: true} : item,
              ),
            },
          })),
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries('notifications'),
  });

  // Only one row stays swiped open at a time (tapping/swiping another closes
  // the previous), so a stray open panel can't be left behind off-screen.
  const openRowRef = useRef<Swipeable | null>(null);
  const rowRefs = useRef<Record<string, Swipeable | null>>({});
  const onSwipeOpen = useCallback((id: string) => {
    const previous = openRowRef.current;
    const current = rowRefs.current[id];
    if (previous && previous !== current) {
      previous.close();
    }
    openRowRef.current = current;
  }, []);

  const {mutate: deleteMutate} = useMutation(deleteNotification, {
    // Drop the row from every cached page immediately — waiting for the
    // request means the card visibly springs back shut and only then
    // disappears. The refetch below reconciles the unreadCount/pagination.
    onMutate: (id: string) => {
      queryClient.setQueryData('notifications', (data: any) => {
        if (!data?.pages) {
          return data;
        }
        return {
          ...data,
          pages: data.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              notifications: (page.data?.notifications ?? []).filter(
                (item: any) => item.id !== id,
              ),
            },
          })),
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries('notifications'),
  });

  const onPressNotification = (item: any) => {
    if (!item.isRead) {
      markReadMutate(item.id);
    }
    const {route, params} = resolveNotificationTarget(item);
    navigate(route, params);
  };

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title={t('notif.title')} showBack />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
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
            swipeableRef={ref => {
              if (ref) {
                rowRefs.current[item.id] = ref;
                return;
              }
              // Unmounted (deleted, or recycled off-screen) — drop the entry
              // rather than keeping a handle to a dead row around.
              if (openRowRef.current === rowRefs.current[item.id]) {
                openRowRef.current = null;
              }
              delete rowRefs.current[item.id];
            }}
            onSwipeOpen={() => onSwipeOpen(item.id)}
            onPress={() => onPressNotification(item)}
            onDelete={() => deleteMutate(item.id)}
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
