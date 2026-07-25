import {FlatList, RefreshControl, View} from 'react-native';
import React, {useState} from 'react';
import {
  ListFooter,
  ListState,
  MainHeader,
  Row,
  RowProduct,
  Screen,
  UnderlineTextField,
} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {getAds} from '../../services';
import {RootState} from '../../stateManager';
import {usePaginatedList} from '../../hooks/use-paginated-list';
import {useDebouncedValue} from '../../hooks/use-debounced-value';
import {localizeCategory} from '../../i18n/display-maps';

// Final step of the employee category browse — plain ads list for whichever
// branch the user stopped at (params.categoryIds is undefined for "همه
// موارد" picked at the very top, meaning no category filter at all).
export function EmployeeAdsScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation();
  const {params} = useRoute();
  const categoryIds: string[] | undefined = params?.categoryIds;
  const title: string = params?.title ?? t('search.adsTitle');
  const user = useSelector((s: RootState) => s.user);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebouncedValue(searchText);

  const {
    items: ads,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    onEndReached,
    refetch,
  } = usePaginatedList({
    queryKey: [
      'ads',
      'employee',
      categoryIds?.join(',') ?? '',
      debouncedSearchText,
      user.cityId,
    ],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 20,
        search: debouncedSearchText || undefined,
        categoryIds: categoryIds?.join(','),
        cityId: user.cityId,
      }),
    selectItems: page => page?.data?.ads,
  });

  return (
    <Screen withoutScroll>
      <MainHeader title={localizeCategory(title)} showLocation={true} showBack />
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
            onPress={() =>
              navigate('singleProduct' as never, {ads: item} as never)
            }
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
                placeholder={t('search.searchFor')}
                onChangeText={setSearchText}
              />
            </View>
          </Row>
        }
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemCount={ads.length}
          />
        }
      />
    </Screen>
  );
}
