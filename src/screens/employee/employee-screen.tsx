import {FlatList, RefreshControl, TouchableOpacity, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  MainHeader,
  Screen,
  Row,
  Text,
  UnderlineTextField,
  Divider,
  Picker,
  RowProduct,
  ListState,
} from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {useSelector} from 'react-redux';
import {collectLeafCategoryIds, getAds, getAdsCategories} from '../../services';
import {RootState} from '../../stateManager';
import {colors} from '../../theme';
import {usePaginatedList} from '../../hooks/use-paginated-list';

// General ad browsing by category — تخفیف‌یاب and بانک مشاغل have their own
// dedicated sections/tabs, so both are excluded here to avoid the same
// content appearing in two places. Categories/subcategories come from the
// same tree ad creation uses, but unlike creation (which must always end
// on a leaf, since every ad needs one specific category), browsing lets the
// user stop at any level via "همه موارد" — including before picking
// anything at all, to just browse every ad with no category filter.
export function EmployeeScreen() {
  const {navigate} = useNavigation();
  const user = useSelector((s: RootState) => s.user);
  const [state, setState] = useState({
    categoryPath: [] as any[],
    selectCategoryModal: true,
    searchText: '',
  });

  const {data: categoriesData} = useQuery(['adsCategories'], getAdsCategories);
  const browsableCategories = useMemo(
    () => (categoriesData?.data ?? []).filter((c: any) => c.title !== 'تخفیف یاب'),
    [categoriesData],
  );

  const categoryIds = useMemo(() => {
    if (state.categoryPath.length === 0) {
      return undefined;
    }
    return collectLeafCategoryIds(state.categoryPath[state.categoryPath.length - 1]);
  }, [state.categoryPath]);

  const breadcrumb =
    state.categoryPath.length > 0
      ? state.categoryPath.map((c: any) => c.title).join(' > ')
      : 'همه موارد';

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
      state.searchText,
      categoryIds?.join(',') ?? '',
      user.cityId,
    ],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 20,
        search: state.searchText || undefined,
        categoryIds: categoryIds?.join(','),
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
          <View>
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
            <TouchableOpacity
              onPress={() => setState(s => ({...s, selectCategoryModal: true}))}
              style={{paddingHorizontal: 8, paddingBottom: 8}}>
              <Text color={colors.main}>{breadcrumb}</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={<Divider height={40} />}
      />
      <Picker
        visible={state.selectCategoryModal}
        onClose={() => setState(s => ({...s, selectCategoryModal: false}))}
        onSelect={(...path: any[]) =>
          setState(s => ({...s, categoryPath: path, selectCategoryModal: false}))
        }
        data={browsableCategories}
        getChildren={item => item.sub_categories}
        allowSelectParent
        allItemsLabel="همه موارد"
        title="انتخاب دسته‌بندی"
      />
    </Screen>
  );
}
