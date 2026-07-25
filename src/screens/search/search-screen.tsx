import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {
  MainHeader,
  Screen,
  Row,
  Text,
  UnderlineTextField,
  RowProduct,
  Button,
  ListState,
  ListFooter,
} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {getAds, collectLeafCategoryIds} from '../../services';
import {numberWithCommas} from '../../utiles';
import {localizeCategory} from '../../i18n/display-maps';
import {useDispatch, useSelector} from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {setFilters} from '../../stateManager/reducers/filters';
import {RootState} from '../../stateManager';
import {usePaginatedList} from '../../hooks/use-paginated-list';
import {useDebouncedValue} from '../../hooks/use-debounced-value';

// Reuses the filter screen's sort labels (filter.sort*) so the badge below the
// search bar reads exactly like the button the user tapped. Only the three
// sorts the filter UI actually exposes are mapped; any other value renders no
// badge.
const SORT_LABEL_KEYS: Record<string, string> = {
  new: 'filter.sortNewest',
  price_asc: 'filter.sortCheapest',
  price_desc: 'filter.sortPriciest',
};

export function SearchScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebouncedValue(searchText);
  const {
    mainCategory,
    subCategory,
    subSubCategory,
    sort,
    minPrice,
    maxPrice,
    onlyImages,
    lat,
    lng,
    rooms,
    minArea,
    maxArea,
    minProductYear,
    maxProductYear,
    minOperationAmount,
    maxOperationAmount,
    minRehn,
    maxRehn,
    minEjare,
    maxEjare,
    isPersonalSeller,
    hasSuburb,
    brand,
    adType,
    contractType,
    education,
  } = useSelector((s: RootState) => s.filter);
  const userCityId = useSelector((s: RootState) => s.user.cityId);
  const effectiveCategory = subSubCategory || subCategory || mainCategory;
  // Ads are only ever tagged with a leaf category, so a filter set to a
  // non-leaf (the "همه موارد" option, e.g. all of استخدامی) has to be
  // expanded to every leaf id underneath it — the backend's `categoryId` is
  // an exact match, while `categoryIds` matches "any of these". For a leaf
  // pick this is just [that id], so it stays correct either way.
  const categoryIds = effectiveCategory
    ? collectLeafCategoryIds(effectiveCategory)
    : undefined;
  // A location filter (see FilterScreen's "تعیین موقعیت") opts into
  // near-me ranking, which only ever matches ads that themselves have
  // coordinates — everything else stays scoped to the account's city
  // (see ads.ts's createAds cityId fallback), matching how ad-posting
  // dropped the per-ad city picker in favor of the account-wide city.
  const hasLocationFilter = lat !== undefined && lng !== undefined;

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
      debouncedSearchText,
      effectiveCategory?.id,
      hasLocationFilter ? lat : userCityId,
      hasLocationFilter ? lng : undefined,
      sort,
      onlyImages,
      minPrice,
      maxPrice,
      rooms,
      minArea,
      maxArea,
      minProductYear,
      maxProductYear,
      minOperationAmount,
      maxOperationAmount,
      minRehn,
      maxRehn,
      minEjare,
      maxEjare,
      isPersonalSeller,
      hasSuburb,
      brand,
      adType,
      contractType,
      education,
    ],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 20,
        search: debouncedSearchText || undefined,
        categoryIds:
          categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
        ...(hasLocationFilter
          ? {lat, lng, radiusKm: 10}
          : {cityId: userCityId}),
        minPrice,
        maxPrice,
        sort: sort || undefined,
        onlyImages: onlyImages || undefined,
        rooms,
        minArea,
        maxArea,
        minProductYear,
        maxProductYear,
        minOperationAmount,
        maxOperationAmount,
        minRehn,
        maxRehn,
        minEjare,
        maxEjare,
        isPersonalSeller,
        hasSuburb,
        brand,
        adType,
        contractType,
        education,
      }),
    selectItems: page => page?.data?.ads,
  });

  const onRemoveFilter = () => {
    dispatch(
      setFilters({
        mainCategory: undefined,
        subCategory: undefined,
        subSubCategory: undefined,
      }),
    );
  };
  const onRemoveFilterSub = mainCategory => {
    // Clear all three levels — `effectiveCategory` falls back through
    // subSubCategory → subCategory → mainCategory, so leaving `subCategory`
    // set (the old bug) kept the exact same filter active and the list never
    // refreshed after the tag was removed.
    dispatch(
      setFilters({
        mainCategory: undefined,
        subCategory: undefined,
        subSubCategory: undefined,
      }),
    );
    if (mainCategory?.allAds === true) {
      dispatch(setFilters({allAds: false}));
    }
  };
  const onRemoveFilterSubSub = () => {
    dispatch(setFilters({subSubCategory: undefined}));
  };

  const onRemoveFilterPrice = () => {
    dispatch(setFilters({minPrice: undefined, maxPrice: undefined}));
  };

  const onRemoveFilterLocation = () => {
    dispatch(setFilters({lat: undefined, lng: undefined}));
  };
  const onRemoveFilterOnlyImages = () => {
    dispatch(setFilters({onlyImages: false}));
  };
  const onRemoveFilterSort = () => {
    // Empty string is the reducer's "no sort" value — the backend treats a
    // missing sort as newest-first, so this reverts to the default ordering.
    dispatch(setFilters({sort: ''}));
  };

  // `sort`/`onlyImages` are applied server-side (see FindAdvertisementsDto)
  // so they cover the full result set, not just the currently-loaded page.
  const agahi = ads;

  return (
    <Screen withoutScroll>
      <MainHeader
        title={localizeCategory(mainCategory?.title) || t('search.title')}
        showLocation={true}
      />
      <FlatList
        onEndReached={onEndReached}
        data={agahi}
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
            onPress={() => navigate('singleProduct', {ads: item})}
          />
        )}
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage={t('search.noAdsFound')}
          />
        }
        ListHeaderComponent={
          <>
            <Row style={{paddingHorizontal: 8, paddingVertical: 10}}>
              <Ionicons size={25} name="search" />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  style={{flex: 1}}
                  value={searchText}
                  placeholder={t('search.searchFor')}
                  onChangeText={setSearchText}
                />
              </View>
              <TouchableOpacity onPress={() => navigate('filter')}>
                <Feather
                  size={25}
                  name="filter"
                  style={{transform: [{rotateY: '180deg'}]}}
                />
              </TouchableOpacity>
            </Row>
            <ScrollView horizontal>
              {!!sort && !!SORT_LABEL_KEYS[sort] && (
                <View style={styles.badge}>
                  <Button onPress={onRemoveFilterSort}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>{t(SORT_LABEL_KEYS[sort])}</Text>
                </View>
              )}
              {mainCategory && (
                <View style={styles.badge}>
                  <Button onPress={() => onRemoveFilterSub(mainCategory)}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>{localizeCategory(effectiveCategory?.title)}</Text>
                </View>
              )}

              {(minPrice !== undefined || maxPrice !== undefined) && (
                <View style={styles.badge}>
                  <Button onPress={onRemoveFilterPrice}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>
                    {minPrice !== undefined && maxPrice !== undefined
                      ? t('search.priceRange', {
                          min: numberWithCommas(minPrice),
                          max: numberWithCommas(maxPrice),
                        })
                      : minPrice !== undefined
                      ? t('search.priceFrom', {min: numberWithCommas(minPrice)})
                      : t('search.priceTo', {max: numberWithCommas(maxPrice)})}
                  </Text>
                </View>
              )}
              {onlyImages === true && (
                <View style={styles.badge}>
                  <Button onPress={onRemoveFilterOnlyImages}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>{t('search.onlyWithImages')}</Text>
                </View>
              )}
              {hasLocationFilter && (
                <View style={styles.badge}>
                  <Button onPress={onRemoveFilterLocation}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>{t('search.nearSelectedLocation')}</Text>
                </View>
              )}
            </ScrollView>
          </>
        }
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemCount={agahi.length}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 30,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 5,
    flexDirection: 'row',
    marginLeft: 5,
  },
});
