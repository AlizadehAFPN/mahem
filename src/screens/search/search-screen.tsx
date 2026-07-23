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
  Divider,
  RowProduct,
  Button,
  ListState,
} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {getAds} from '../../services';
import {numberWithCommas} from '../../utiles';
import {useDispatch, useSelector} from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {setFilters} from '../../stateManager/reducers/filters';
import {RootState} from '../../stateManager';
import {usePaginatedList} from '../../hooks/use-paginated-list';
import {useDebouncedValue} from '../../hooks/use-debounced-value';
export function SearchScreen() {
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
        categoryId: effectiveCategory?.id,
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
    dispatch(setFilters({mainCategory: undefined, subSubCategory: undefined}));
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

  // `sort`/`onlyImages` are applied server-side (see FindAdvertisementsDto)
  // so they cover the full result set, not just the currently-loaded page.
  const agahi = ads;

  return (
    <Screen withoutScroll>
      <MainHeader title={mainCategory?.title ?? 'جست و جو'} showLocation={true} />
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
            emptyMessage="آگهی‌ای یافت نشد"
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
                  placeholder="جست جو برای"
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
              {mainCategory && (
                <View style={styles.badge}>
                  <Button onPress={() => onRemoveFilterSub(mainCategory)}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>{effectiveCategory?.title}</Text>
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
                      ? `قیمت ${numberWithCommas(minPrice)} تا ${numberWithCommas(maxPrice)}`
                      : minPrice !== undefined
                      ? `قیمت از ${numberWithCommas(minPrice)}`
                      : `قیمت تا ${numberWithCommas(maxPrice)}`}
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
                  <Text>فقط عکس دارها</Text>
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
                  <Text>نزدیک موقعیت انتخابی</Text>
                </View>
              )}
            </ScrollView>
          </>
        }
        ListFooterComponent={<Divider height={40} />}
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
