import {Dimensions, FlatList, View} from 'react-native';
import React from 'react';
import {GridOfferCard, ListState, MainHeader, Screen} from '../../../components';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {getAds} from '../../../services';
import {usePaginatedList} from '../../../hooks/use-paginated-list';

const {width} = Dimensions.get('window');

// Lists advertisements under a تخفیف‌یاب subcategory — same city-scoped
// getAds every other category browses with, just pre-filtered to whatever
// subcategory the user tapped in OfferDetectionScreen, and rendered with
// the rich discount card (circle chart/timer/before-after price) instead
// of the generic product card.
export function OfferListScreen() {
  const {navigate} = useNavigation();
  const {params} = useRoute();
  const category = params?.category;
  const cityId = useSelector(s => s.user.cityId);

  const {
    items: offers,
    isLoading,
    isError,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['ads', 'offers', category?.id, cityId],
    queryFn: ({pageParam = 1}) =>
      getAds({page: pageParam, limit: 20, categoryId: category?.id, cityId}),
    selectItems: page => page?.data?.ads,
    enabled: !!category?.id && !!cityId,
  });

  return (
    <Screen withoutScroll>
      <MainHeader title={category?.title ?? 'تخفیف یاب'} showLocation />
      <FlatList
        data={offers}
        numColumns={2}
        onEndReached={onEndReached}
        style={{paddingHorizontal: 8, paddingTop: 8}}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        ItemSeparatorComponent={() => <View style={{height: 8}} />}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={{width: width / 2 - 12}}>
            <GridOfferCard
              item={item}
              onPress={() => navigate('singleProduct', {ads: item})}
            />
          </View>
        )}
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage="تخفیفی در این دسته ثبت نشده است"
          />
        }
      />
    </Screen>
  );
}
