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
import {useBrowseCity} from '../../hooks/use-browse-city';
import {colors, scaled} from '../../theme';

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
  const {navigate} = useNavigation<any>();
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
  // The header's browse city (or «کل استان» → no city filter), independent of
  // the account's home/posting city.
  const {cityIdParam: browseCityId, cityKey: browseCityKey} = useBrowseCity();
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
      hasLocationFilter ? lat : browseCityKey,
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
          : {cityId: browseCityId}),
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

  const onRemoveFilterSub = (mainCategory: any) => {
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
  const onRemoveFilterPrice = () => {
    dispatch(setFilters({minPrice: undefined, maxPrice: undefined}));
  };

  const onRemoveFilterLocation = () => {
    dispatch(setFilters({lat: undefined, lng: undefined}));
  };
  const onRemoveFilterOnlyImages = () => {
    // Back to "not chosen" rather than an explicit خیر, so reopening the filter
    // shows the row empty — the badge is gone either way (see filters.ts).
    dispatch(setFilters({onlyImages: undefined}));
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
      {/* showBack: this tab is normally reached from a home-screen category
          ("مشاهده همه"), so the logo gets a back arrow beside it. The tab
          navigator's default backBehavior sends it to the home tab, which is
          also where a direct tap on the search tab came from. */}
      <MainHeader
        title={localizeCategory(mainCategory?.title) || t('search.title')}
        showLocation={true}
        showBack
      />
      {/* Search box + active-filter badges live outside the FlatList so they
          stay pinned under the header while the results scroll — putting them
          in ListHeaderComponent scrolled them away with the first results. */}
      <View style={styles.searchBar}>
        <Row
          style={{paddingHorizontal: scaled(8), paddingVertical: scaled(10)}}>
          <Ionicons size={scaled(25)} name="search" />
          {/* The wrapping View is what claims the row's free width; the field
              itself must NOT take `flex: 1` as well. That resolves to
              `flexBasis: 0%`, which only behaved as "auto" while this lived
              inside the FlatList header (a parent of undefined height). Pinned
              directly under the screen's header the parent height is definite,
              the percentage resolves to 0, and the field collapsed — drawing
              its underline straight through the placeholder. */}
          <View style={{flex: 1}}>
            <UnderlineTextField
              value={searchText}
              placeholder={t('search.searchFor')}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity onPress={() => navigate('filter')}>
            <Feather
              size={scaled(25)}
              name="filter"
              style={{transform: [{rotateY: '180deg'}]}}
            />
          </TouchableOpacity>
        </Row>
        {/* flexGrow: 0 — a ScrollView defaults to growing, and this one is no
            longer inside a content-sized list header but a child of the fixed
            screen, where growing would leave a blank strip above the results
            whenever no filter badge is showing. */}
        <ScrollView horizontal style={styles.badges}>
          {!!sort && !!SORT_LABEL_KEYS[sort] && (
            <View style={styles.badge}>
              <Button onPress={onRemoveFilterSort}>
                <AntDesign
                  size={scaled(20)}
                  style={{marginRight: scaled(5)}}
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
                  size={scaled(20)}
                  style={{marginRight: scaled(5)}}
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
                  size={scaled(20)}
                  style={{marginRight: scaled(5)}}
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
                  size={scaled(20)}
                  style={{marginRight: scaled(5)}}
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
                  size={scaled(20)}
                  style={{marginRight: scaled(5)}}
                  name="closecircleo"
                />
              </Button>
              <Text>{t('search.nearSelectedLocation')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <FlatList
        onEndReached={onEndReached}
        data={agahi}
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
  // Opaque so results scrolling underneath never show through the pinned bar.
  // The padding repeats what the FlatList's own `style` used to contribute
  // while this sat in its header, so pinning it didn't move the field.
  searchBar: {
    backgroundColor: colors.background,
    paddingHorizontal: scaled(4),
    paddingTop: scaled(8),
  },
  badges: {
    flexGrow: 0,
  },
  badge: {
    height: scaled(30),
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: scaled(20),
    paddingHorizontal: scaled(10),
    alignItems: 'center',
    marginBottom: scaled(5),
    flexDirection: 'row',
    marginLeft: scaled(5),
  },
});
