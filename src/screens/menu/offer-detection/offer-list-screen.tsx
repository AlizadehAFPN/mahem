import {FlatList, View} from 'react-native';
import React from 'react';
import {
  ListFooter,
  ListState,
  MainHeader,
  OfferCard,
  Screen,
} from '../../../components';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {getAds} from '../../../services';
import {usePaginatedList} from '../../../hooks/use-paginated-list';

// Lists the discounts under one تخفیف‌یاب subcategory the user tapped in
// OfferCategoriesScreen, as the same full-width discount cards the main feed
// uses. If the tapped node still has children (a non-leaf category), match
// everything beneath it via parentCategoryId instead of its own id.
export function OfferListScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const {params} = useRoute<any>();
  const category = params?.category;
  const cityId = useSelector((s: any) => s.user.cityId);
  const hasChildren = (category?.sub_categories?.length ?? 0) > 0;

  const {
    items: offers,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['discounts', 'category', category?.id, cityId],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 10,
        ...(hasChildren
          ? {parentCategoryId: category?.id}
          : {categoryId: category?.id}),
        cityId,
      }),
    selectItems: (page: any) => page?.data?.ads,
    enabled: !!category?.id && !!cityId,
  });

  return (
    <Screen withoutScroll>
      <MainHeader title={t('home.discountFinder')} showLocation showBack />
      <FlatList
        data={offers}
        onEndReached={onEndReached}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{padding: 12}}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        renderItem={({item}) => (
          <OfferCard
            item={item}
            onPress={() => navigate('singleProduct', {ads: item})}
          />
        )}
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage={t('offers.noDiscountsInCategory')}
          />
        }
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemCount={offers.length}
          />
        }
      />
    </Screen>
  );
}

