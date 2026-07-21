import {FlatList, RefreshControl, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {
  MainHeader,
  Screen,
  Row,
  Text,
  UnderlineTextField,
  Divider,
  SelectAdsCategory,
  RowProduct,
  ListState,
} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {getAds} from '../../services';
import {RootState} from '../../stateManager';
import {usePaginatedList} from '../../hooks/use-paginated-list';
export function EmployeeScreen() {
  const {navigate, goBack} = useNavigation();
  const user = useSelector((s: RootState) => s.user);
  const [state, setState] = useState({
    mainCategory: '',
    subCategory: '',
    subsubCategory: '',
    selectCategoryModal: true,
    searchText: '',
  });
  const {
    items: ads,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    onEndReached,
    refetch,
  } = usePaginatedList({
    queryKey: ['ads', state.searchText, state.mainCategory?.id, user.cityId],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 20,
        search: state.searchText || undefined,
        categoryId: state.mainCategory?.id,
        cityId: user.cityId,
      }),
    selectItems: page => page?.data?.ads,
  });
  return (
    <Screen withoutScroll>
      <MainHeader showLocation={true} />
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
            onPress={() => navigate('singleProduct', {ads: item})}
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
                onChangeText={text => setState(s => ({...s, searchText: text}))}
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                setState(s => ({...s, selectCategoryModal: true}))
              }>
              <Feather
                size={25}
                name="filter"
                style={{transform: [{rotateY: '180deg'}]}}
              />
            </TouchableOpacity>
          </Row>
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
