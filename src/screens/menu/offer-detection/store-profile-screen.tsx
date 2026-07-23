import {Dimensions, FlatList, Image, StyleSheet, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {
  GradiantHeader,
  GridOfferCard,
  ListState,
  MainHeader,
  Screen,
  Text,
} from '../../../components';
import {getAds, getStore} from '../../../services';
import {colors} from '../../../theme';
import {usePaginatedList} from '../../../hooks/use-paginated-list';

const {width} = Dimensions.get('window');

// A readable dark scrim works over any background (plain gray placeholder or
// an actual cover photo) — the lighter glass gradient only reads over a
// sufficiently dark/colorful photo, and a store may have no cover yet.
const READABLE_HEADER_GRADIENT = ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.45)'];

// Public تخفیف‌یاب store profile (store_main.png design, verified via
// get_design_context): MainHeader (logo + title + city, same as every other
// تخفیف‌یاب screen) with a translucent back bar floating over the cover
// photo, a square logo overlapping its bottom-left corner, the store name in
// red on a light strip, then the store's own currently-approved discount ads
// as a 2-column grid — reached by tapping a store's name/logo from a
// discount's detail page (see single-product.tsx's store-attribution row).
export function StoreProfileScreen() {
  const {navigate} = useNavigation<any>();
  const {params} = useRoute<any>();
  const storeId = params?.storeId;

  const {data: store, isLoading: storeLoading} = useQuery(
    ['store', storeId],
    () => getStore(storeId),
    {enabled: !!storeId},
  );

  const {
    items: offers,
    isLoading,
    isError,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['storeOffers', storeId],
    queryFn: ({pageParam = 1}) => getAds({page: pageParam, limit: 20, storeId}),
    selectItems: (page: any) => page?.data?.ads,
    enabled: !!storeId,
  });

  return (
    <Screen withoutScroll>
      <MainHeader title="تخفیف یاب" showLocation />
      <View style={{flex: 1}}>
        <View style={styles.overlayNav}>
          <GradiantHeader
            title=""
            shareText={store?.name ?? 'ماهم'}
            details={false}
            onCreatePress={undefined}
            onBookMark={undefined}
            colors={READABLE_HEADER_GRADIENT}
            iconColor="white"
          />
        </View>
        <FlatList
          data={offers}
          numColumns={2}
          onEndReached={onEndReached}
          keyExtractor={(item: any) => item.id}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 12,
          }}
          ItemSeparatorComponent={() => <View style={{height: 12}} />}
          ListHeaderComponent={
            storeLoading || !store ? null : (
              <View>
                <View style={styles.coverBox}>
                  {store.banner ? (
                    <Image
                      source={{uri: store.banner}}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : null}
                </View>
                <View style={styles.nameStrip}>
                  <View style={styles.logoBox}>
                    {store.logo ? (
                      <Image
                        source={{uri: store.logo}}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : (
                      <Ionicons
                        name="storefront-outline"
                        size={26}
                        color={colors.pallete.gray3}
                      />
                    )}
                  </View>
                  <Text
                    preset="bold"
                    size={17}
                    color={colors.main}
                    style={styles.storeName}>
                    {store.name}
                  </Text>
                </View>
              </View>
            )
          }
          renderItem={({item}) => (
            <View style={{width: width / 2 - 18}}>
              <GridOfferCard
                item={item}
                onPress={() => navigate('singleProduct', {ads: item})}
              />
            </View>
          )}
          ListEmptyComponent={
            <ListState
              isLoading={storeLoading || isLoading}
              isError={isError}
              emptyMessage="این فروشگاه هنوز تخفیفی ثبت نکرده است"
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overlayNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  coverBox: {
    width: '100%',
    aspectRatio: 360 / 156,
    backgroundColor: colors.pallete.gray1,
  },
  nameStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pallete.gray1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  logoBox: {
    width: 69,
    height: 69,
    marginTop: -46,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storeName: {
    marginRight: 12,
  },
});
