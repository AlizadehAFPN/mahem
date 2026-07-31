import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  DiscountMenuSheet,
  ListFooter,
  ListState,
  MainHeader,
  OfferCard,
  Screen,
  Text,
} from '../../../components';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {getAds, getMyStore, getStores} from '../../../services';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {useBrowseCity} from '../../../hooks/use-browse-city';
import {colors, scaled} from '../../../theme';

// Landing screen for تخفیف‌یاب: a horizontal row of the city's storefronts
// (main_entry.png design) above the vertical feed of every discount in the
// current city, rendered with the full-width discount card. The header menu
// button opens DiscountMenuSheet for the other entry points (نزدیک من /
// دسته‌بندی / نقشه / اطلاع‌رسانی).
export function OfferDetectionScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const [menu, setMenu] = useState(false);
  // The header's browse city (or «کل استان» → whole province) scopes both the
  // storefront row and the discount feed.
  const {cityIdParam: browseCityId, cityKey: browseCityKey} = useBrowseCity();
  const {data: cats} = useAdsCategories();

  // تخفیف‌یاب is a top-level GENERAL category; the feed shows every ad under
  // any of its subcategories at once, so filter by the parent id.
  const discountParentId = useMemo(
    () => cats?.data?.find((c: any) => c.title === 'تخفیف یاب')?.id,
    [cats],
  );

  const {data: storesData} = useQuery(['stores', browseCityKey], () =>
    getStores({cityId: browseCityId, limit: 20}),
  );
  const stores = storesData?.items ?? [];
  const {data: myStore} = useQuery(['myStore'], getMyStore);

  const {
    items: offers,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['discounts', 'all', discountParentId, browseCityKey],
    queryFn: ({pageParam = 1}) =>
      getAds({
        page: pageParam,
        limit: 10,
        parentCategoryId: discountParentId,
        cityId: browseCityId,
      }),
    selectItems: (page: any) => page?.data?.ads,
    enabled: !!discountParentId,
  });

  return (
    <Screen withoutScroll>
      <MainHeader
        title={t('home.discountFinder')}
        showLocation
        showBack
        onMenuPress={() => setMenu(true)}
      />
      <FlatList
        data={offers}
        onEndReached={onEndReached}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{padding: scaled(12)}}
        ItemSeparatorComponent={() => <View style={{height: scaled(12)}} />}
        ListHeaderComponent={
          <FlatList
            horizontal
            inverted
            data={stores}
            keyExtractor={(item: any) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesRow}
            style={{marginBottom: scaled(12)}}
            ListHeaderComponent={
              <TouchableOpacity
                style={styles.storeItem}
                onPress={() => navigate(myStore ? 'myStore' : 'createStore')}>
                <View style={[styles.storeAvatar, styles.storeAddAvatar]}>
                  <Ionicons name="add" size={scaled(28)} color={colors.main} />
                </View>
                <Text size={11} numberOfLines={1} style={styles.storeName}>
                  {myStore
                    ? t('discountMenu.myStore')
                    : t('store.createStoreShort')}
                </Text>
              </TouchableOpacity>
            }
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.storeItem}
                onPress={() => navigate('storeProfile', {storeId: item.id})}>
                <View style={styles.storeAvatar}>
                  {item.logo ? (
                    <Image
                      source={{uri: item.logo}}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : (
                    <Ionicons
                      name="storefront-outline"
                      size={scaled(22)}
                      color={colors.pallete.gray3}
                    />
                  )}
                </View>
                <Text size={11} numberOfLines={1} style={styles.storeName}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        }
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
            emptyMessage={t('offers.noDiscountsPosted')}
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
      <DiscountMenuSheet visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  storesRow: {
    paddingHorizontal: scaled(12),
    paddingTop: scaled(12),
  },
  storeItem: {
    alignItems: 'center',
    width: scaled(64),
    marginHorizontal: scaled(6),
  },
  storeAvatar: {
    width: scaled(61),
    height: scaled(61),
    borderRadius: scaled(30.5),
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray1,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeAddAvatar: {
    backgroundColor: 'white',
    borderColor: colors.main,
    borderStyle: 'dashed',
  },
  storeName: {
    marginTop: scaled(4),
    textAlign: 'center',
  },
});
