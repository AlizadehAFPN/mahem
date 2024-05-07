import {
  FlatList,
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
  SelectAdsCategory,
  RowProduct,
  Button,
} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useInfiniteQuery} from 'react-query';
import {getAds} from '../../services';
import {useDispatch, useSelector} from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {setFilters} from '../../stateManager/reducers/filters';
export function SearchScreen() {
  const {navigate} = useNavigation();
  const dispatch = useDispatch();
  const [state, setState] = useState({
    mainCategory: '',
    subCategory: '',
    subsubCategory: '',
    selectCategoryModal: false,
    searchText: '',
  });
  const {mainCategory, allAds, sort, price, onlyImages, city} = useSelector(
    s => s.filter,
  );
  console.log(sort, 'sort');
  const [ads, setAds] = useState([]);
  const {data, fetchNextPage, hasNextPage, refetch} = useInfiniteQuery({
    queryKey: [
      'ads',
      state.searchText,
      mainCategory,
      // subCategory,
      // subsubCategory,
    ],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        keyword: state.searchText,
        category_id: mainCategory ? mainCategory?.id : undefined,
        per_page: 1000,
      }),
    refetchOnWindowFocus: true,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      if (
        lastPage?.data?.pagination?.current_page <
        lastPage?.data?.pagination?.total_pages
      ) {
        return lastPage?.data?.pagination?.current_page + 1;
      } else {
        return undefined;
      }
    },
    getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
  });
  useEffect(() => {
    refetch();
  }, [mainCategory]);
  const onEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const flatenData = data?.pages?.flatMap(page => page?.data?.ads);
    setAds(flatenData);
  }, [data]);
  const onRemoveFilter = () => {
    dispatch(
      setFilters({
        mainCategory: undefined,
        subCategory: undefined,
        subsubCategory: undefined,
      }),
    );
  };
  const onRemoveFilterSub = mainCategory => {
    dispatch(setFilters({mainCategory: undefined, subsubCategory: undefined}));
    if (mainCategory?.allAds === true) dispatch(setFilters({allAds: false}));
  };
  const onRemoveFilterSubSub = () => {
    dispatch(setFilters({subsubCategory: undefined}));
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

  let agahi = ads;
  if (city !== undefined)
    agahi = agahi?.filter(item => item?.city?.title === city);
  if (price !== undefined) agahi = agahi?.filter(item => item?.price <= price);
  // if (mainCategory !== undefined)
  //   agahi = agahi?.filter(
  //     item => item?.category_id?.title == mainCategory?.title,
  //   );
  if (onlyImages === true)
    agahi = agahi?.filter(
      item =>
        item?.image1?.id > 0 || item?.image3?.id > 0 || item?.image5?.id > 0,
    );

  if (sort === 'PriceMinToMax')
    agahi = agahi?.sort((a, b) => {
      // Convert price attribute to number, treating null as 0
      const priceA = a?.price ? parseInt(a?.price) : 0;
      const priceB = b?.price ? parseInt(b?.price) : 0;

      // Compare prices
      return priceA - priceB;
    });

  if (sort === 'PriceMaxToMin')
    agahi = agahi?.sort((a, b) => {
      // Convert price attribute to number, treating null as 0
      const priceA = a?.price ? parseInt(a?.price) : 0;
      const priceB = b?.price ? parseInt(b?.price) : 0;

      // Compare prices
      return priceB - priceA;
    });

  if (sort === 'new')
    agahi = agahi?.sort((a, b) => {
      // Convert price attribute to number, treating null as 0
      const priceA = a?.id ? parseInt(a?.id) : 0;
      const priceB = b?.id ? parseInt(b?.id) : 0;

      // Compare prices
      return priceB - priceA;
    });

  return (
    <Screen withoutScroll>
      <MainHeader title={mainCategory?.title} showLocation={true} />
      <FlatList
        onEndReached={onEndReached}
        data={
          allAds != true
            ? agahi
            : agahi?.filter(item => item?.category_id?.id > 35)
        }
        style={{paddingHorizontal: 4, paddingVertical: 8}}
        ItemSeparatorComponent={<View style={{height: 4}} />}
        renderItem={({item}) => (
          <RowProduct
            product={item}
            onPress={() => navigate('singleProduct', {ads: item})}
          />
        )}
        ListHeaderComponent={
          <>
            <Row style={{paddingHorizontal: 8, paddingVertical: 10}}>
              <Ionicons size={25} name="search" />
              <View style={{flex: 1}}>
                <UnderlineTextField
                  style={{flex: 1}}
                  placeholder="جست جو برای"
                  onChangeText={text =>
                    setState(s => ({...s, searchText: text}))
                  }
                />
              </View>
              <TouchableOpacity
                onPress={() => navigate('filter')}
                // onPress={() => setState(s => ({ ...s, selectCategoryModal: true }))}
              >
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
                  <Text>{mainCategory.title}</Text>
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
                  <Text>{city}</Text>
                </View>
              )}
            </ScrollView>
          </>
        }
        ListFooterComponent={<Divider height={40} />}
      />
      <SelectAdsCategory
        showTitle={false}
        onSelect={(m, sc, ssc) =>
          setState(s => ({
            ...s,
            mainCategory: m,
            subCategory: sc,
            subsubCategory: ssc,
          }))
        }
        onClose={() => setState(s => ({...s, selectCategoryModal: false}))}
        visible={state.selectCategoryModal}
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
