import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
import {useQuery} from 'react-query';
import {getAds, getAdsCategories} from '../../services';
import {useDispatch, useSelector} from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {setFilters} from '../../stateManager/reducers/filters';
import {RootState} from '../../stateManager';
import {usePaginatedList} from '../../hooks/use-paginated-list';
export function SearchScreen() {
  const {navigate} = useNavigation();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const {
    mainCategory,
    subCategory,
    subSubCategory,
    sort,
    price,
    onlyImages,
    city,
  } = useSelector((s: RootState) => s.filter);
  const userCityId = useSelector((s: RootState) => s.user.cityId);
  // No explicit filter override picked yet → default to the globally
  // selected city, so results are always city-scoped rather than showing
  // every city until the user opens the filter screen.
  const effectiveCityId = city?.id ?? userCityId;
  const effectiveCategory = subSubCategory || subCategory || mainCategory;

  // Browsing without a specific category (e.g. "همه آگهی‌ها") would
  // otherwise mix تخفیف‌یاب's ads into the general list — it has its own
  // dedicated section now, so exclude its subcategories here.
  const {data: adsCategories} = useQuery(['adsCategories'], getAdsCategories);
  const discountCategoryId = adsCategories?.data?.find(
    (category: any) => category.title === 'تخفیف یاب',
  )?.id;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchText(searchText), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

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
      effectiveCityId,
      sort,
      onlyImages,
      discountCategoryId,
    ],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 20,
        search: debouncedSearchText || undefined,
        categoryId: effectiveCategory?.id,
        excludeParentCategoryId: !effectiveCategory ? discountCategoryId : undefined,
        cityId: effectiveCityId,
        maxPrice: price,
        sort: sort || undefined,
        onlyImages: onlyImages || undefined,
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
    dispatch(setFilters({price: undefined}));
  };

  const onRemoveFilterCity = () => {
    dispatch(setFilters({city: undefined}));
  };
  const onRemoveFilterOnlyImages = () => {
    dispatch(setFilters({onlyImages: false}));
  };

  // `sort`/`onlyImages` are applied server-side (see FindAdvertisementsDto)
  // so they cover the full result set, not just the currently-loaded page.
  const agahi = ads;

  return (
    <Screen withoutScroll>
      <MainHeader title={mainCategory?.title} showLocation={true} />
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

              {price !== undefined && (
                <View style={styles.badge}>
                  <Button onPress={onRemoveFilterPrice}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>{price} قیمت کمتر از </Text>
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
              {city !== undefined && (
                <View style={styles.badge}>
                  <Button onPress={onRemoveFilterCity}>
                    <AntDesign
                      size={20}
                      style={{marginRight: 5}}
                      name="closecircleo"
                    />
                  </Button>
                  <Text>{city?.title}</Text>
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
