import {ActivityIndicator, FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import Slider from '@react-native-community/slider';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useQuery} from 'react-query';
import {
  DiscountMenuSheet,
  ListState,
  MainHeader,
  OfferCard,
  Screen,
  Text,
} from '../../../components';
import {
  getAdsCategories,
  getNearbyDiscounts,
  updateMyLocation,
} from '../../../services';
import {getCurrentPosition} from '../../../utiles';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {colors} from '../../../theme';

// "تخفیف‌های نزدیک من" (screenshots 7/8/10): a km radius slider over a vertical
// feed of discount cards, centered on the device's current location.
export function NearbyDiscountsScreen() {
  const {navigate} = useNavigation<any>();
  const cityId = useSelector((s: any) => s.user.cityId);
  const [menu, setMenu] = useState(false);
  // sliderValue tracks the thumb live; radiusKm only commits on release so the
  // list doesn't refetch on every tick.
  const [sliderValue, setSliderValue] = useState(5);
  const [radiusKm, setRadiusKm] = useState(5);
  const [coords, setCoords] = useState<{lat: number; lng: number} | null>(null);
  const [locError, setLocError] = useState(false);

  const {data: cats} = useQuery(['adsCategories'], getAdsCategories);
  const discountParentId = useMemo(
    () => cats?.data?.find((c: any) => c.title === 'تخفیف یاب')?.id,
    [cats],
  );

  useEffect(() => {
    getCurrentPosition()
      .then(c => {
        setCoords(c);
        updateMyLocation(c.lat, c.lng).catch(() => {});
      })
      .catch(() => setLocError(true));
  }, []);

  const {items, isLoading, isError, onEndReached} = usePaginatedList({
    queryKey: [
      'discounts',
      'nearby',
      coords?.lat,
      coords?.lng,
      radiusKm,
      discountParentId,
      cityId,
    ],
    queryFn: ({pageParam = 1}) =>
      getNearbyDiscounts({
        page: pageParam,
        limit: 10,
        lat: coords!.lat,
        lng: coords!.lng,
        radiusKm,
        parentCategoryId: discountParentId,
        cityId,
      }),
    selectItems: (page: any) => page?.data?.ads,
    enabled: !!coords && !!discountParentId && !!cityId,
  });

  return (
    <Screen withoutScroll>
      <MainHeader
        title="تخفیف‌های نزدیک من"
        showLocation
        onMenuPress={() => setMenu(true)}
      />
      <View style={styles.sliderBar}>
        <Text style={{textAlign: 'center', marginBottom: 4}}>
          شعاع جستجو: {sliderValue} کیلومتر
        </Text>
        <Slider
          minimumValue={1}
          maximumValue={30}
          step={1}
          value={radiusKm}
          onValueChange={setSliderValue}
          onSlidingComplete={setRadiusKm}
          minimumTrackTintColor={colors.main}
          maximumTrackTintColor={colors.pallete.gray3}
          thumbTintColor={colors.main}
        />
      </View>

      {locError ? (
        <ListState
          isError
          emptyMessage="برای نمایش تخفیف‌های نزدیک، دسترسی به موقعیت مکانی لازم است"
        />
      ) : !coords ? (
        <ActivityIndicator style={{marginTop: 40}} color={colors.main} />
      ) : (
        <FlatList
          data={items}
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
              emptyMessage="تخفیفی در این محدوده یافت نشد"
            />
          }
        />
      )}

      <DiscountMenuSheet visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sliderBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.pallete.gray1,
  },
});
