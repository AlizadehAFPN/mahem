import {FlatList, RefreshControl, View} from 'react-native';
import React, {useState} from 'react';
import {
  Divider,
  ListState,
  MainHeader,
  Row,
  RowProduct,
  Screen,
  UnderlineTextField,
} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {getAds} from '../../services';
import {RootState} from '../../stateManager';
import {usePaginatedList} from '../../hooks/use-paginated-list';

// Final step of the employee category browse — plain ads list for whichever
// branch the user stopped at (params.categoryIds is undefined for "همه
// موارد" picked at the very top, meaning no category filter at all).
export function EmployeeAdsScreen() {
  const {navigate} = useNavigation();
  const {params} = useRoute();
  const categoryIds: string[] | undefined = params?.categoryIds;
  const title: string = params?.title ?? 'آگهی‌ها';
  const user = useSelector((s: RootState) => s.user);
  const [searchText, setSearchText] = useState('');

  const {
    items: ads,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    onEndReached,
    refetch,
  } = usePaginatedList({
    queryKey: [
      'ads',
      'employee',
      categoryIds?.join(',') ?? '',
      searchText,
      user.cityId,
    ],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 20,
        search: searchText || undefined,
        categoryIds: categoryIds?.join(','),
        cityId: user.cityId,
      }),
    selectItems: page => page?.data?.ads,
  });

  return (
    <Screen withoutScroll>
      <MainHeader title={title} showLocation={true} />
      <FlatList
        data={ads}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
          />
        }
        style={{paddingHorizontal: 4, paddingVertical: 8}}
        ItemSeparatorComponent={<View style={{height: 4}} />}
        renderItem={({item}) => (
          <RowProduct
            product={item}
            onPress={() => navigate('singleProduct' as never, {ads: item} as never)}
          />
        )}
        ListEmptyComponent={
          <ListState isLoading={isLoading} isError={isError} />
        }
        ListHeaderComponent={
          <Row style={{paddingHorizontal: 8, paddingVertical: 10}}>
            <Ionicons size={25} name="search" />
            <View style={{flex: 1}}>
              <UnderlineTextField
                style={{flex: 1}}
                placeholder="جست جو برای"
                onChangeText={setSearchText}
              />
            </View>
          </Row>
        }
        ListFooterComponent={<Divider height={40} />}
      />
    </Screen>
  );
}
