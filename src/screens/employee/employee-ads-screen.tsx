import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
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
import {getAds} from '../../services';
import {usePaginatedList} from '../../hooks/use-paginated-list';
import {useDebouncedValue} from '../../hooks/use-debounced-value';
import {useBrowseCity} from '../../hooks/use-browse-city';
import {localizeCategory} from '../../i18n/display-maps';
import {colors, scaled} from '../../theme';

// Final step of the employee category browse — plain ads list for whichever
// branch the user stopped at (params.categoryIds is undefined for "همه
// موارد" picked at the very top, meaning no category filter at all).
export function EmployeeAdsScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const {params} = useRoute<any>();
  const categoryIds: string[] | undefined = params?.categoryIds;
  const title: string = params?.title ?? t('search.adsTitle');
  const {cityIdParam: browseCityId, cityKey: browseCityKey} = useBrowseCity();
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
      browseCityKey,
    ],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 20,
        search: debouncedSearchText || undefined,
        categoryIds: categoryIds?.join(','),
        cityId: browseCityId,
      }),
    selectItems: page => page?.data?.ads,
  });

  return (
    <Screen withoutScroll>
      <MainHeader
        title={localizeCategory(title)}
        showLocation={true}
        showBack
      />
      {/* Outside the FlatList so it stays pinned under the header while the
          results scroll (ListHeaderComponent scrolled away with them). */}
      <Row style={styles.searchBar}>
        <Ionicons size={scaled(25)} name="search" />
        {/* No `flex: 1` on the field itself — see SearchScreen: outside the
            FlatList header the parent height is definite, so it resolves to a
            zero height and the underline lands on the text. */}
        <View style={{flex: 1}}>
          <UnderlineTextField
            placeholder={t('search.searchFor')}
            onChangeText={setSearchText}
          />
        </View>
      </Row>
      <FlatList
        data={ads}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
          />
        }
        style={{paddingHorizontal: scaled(4), paddingVertical: scaled(8)}}
        ItemSeparatorComponent={<View style={{height: scaled(4)}} />}
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

const styles = StyleSheet.create({
  // Opaque so results scrolling underneath never show through the pinned bar.
  // Padding = the row's own 8/10 plus the 4/8 the FlatList's `style` used to
  // add around this while it lived in the list header, so nothing moved.
  searchBar: {
    paddingHorizontal: scaled(12),
    paddingTop: scaled(18),
    paddingBottom: scaled(10),
    backgroundColor: colors.background,
  },
});
