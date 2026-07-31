import {ActivityIndicator, FlatList, StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Slider from '@react-native-community/slider';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {
  DiscountMenuSheet,
  ListFooter,
  ListState,
  MainHeader,
  OfferCard,
  Screen,
  Text,
} from '../../../components';
import {getNearbyDiscounts, updateMyLocation} from '../../../services';
import {getCurrentPosition} from '../../../utiles';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {useBrowseCity} from '../../../hooks/use-browse-city';
import {colors, scaled} from '../../../theme';

// The km-radius slider, isolated into its own memoized component so that the
// live thumb/label updates (which fire on every drag tick) re-render only this
// small subtree — not the parent screen and its FlatList of discount cards,
// which is what made dragging janky. It keeps the label value in local state
// and only tells the parent the final radius via onCommit (on release).
const RadiusSlider = React.memo(function RadiusSlider({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const {t} = useTranslation();
  const [display, setDisplay] = useState(value);
  return (
    <View style={styles.sliderBar}>
      <Text style={{textAlign: 'center', marginBottom: 2}} size={15}>
        {t('offers.distanceKilometers', {value: display})}
      </Text>
      <Slider
        style={{height: scaled(24)}}
        minimumValue={1}
        maximumValue={30}
        step={1}
        value={value}
        onValueChange={setDisplay}
        onSlidingComplete={onCommit}
        minimumTrackTintColor={colors.main}
        maximumTrackTintColor={colors.pallete.gray3}
        thumbTintColor={colors.main}
      />
    </View>
  );
});

// "تخفیف‌های نزدیک من" (screenshots 7/8/10): a km radius slider over a vertical
// feed of discount cards, centered on the device's current location.
export function NearbyDiscountsScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  // In «کل استان» mode cityIdParam is undefined, so nearby discounts aren't
  // capped to a single city — the km radius alone bounds the results.
  const {cityIdParam: browseCityId, cityKey: browseCityKey} = useBrowseCity();
  const [menu, setMenu] = useState(false);
  // radiusKm is the committed value that drives the query; the live thumb value
  // stays inside RadiusSlider so dragging doesn't re-render this screen.
  const [radiusKm, setRadiusKm] = useState(5);
  const [coords, setCoords] = useState<{lat: number; lng: number} | null>(null);
  const [locError, setLocError] = useState(false);

  // Commit the new radius (which changes the query key and triggers a refetch)
  // only after the drag settles for a beat — so a flurry of quick adjustments
  // fires a single API call for the final value instead of one per release.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitRadius = useCallback((v: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => setRadiusKm(Math.round(v)), 350);
  }, []);
  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  const {data: cats} = useAdsCategories();
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

  const {
    items,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    onEndReached,
  } = usePaginatedList({
    queryKey: [
      'discounts',
      'nearby',
      coords?.lat,
      coords?.lng,
      radiusKm,
      discountParentId,
      browseCityKey,
    ],
    queryFn: ({pageParam = 1}) =>
      getNearbyDiscounts({
        page: pageParam,
        limit: 10,
        lat: coords!.lat,
        lng: coords!.lng,
        radiusKm,
        parentCategoryId: discountParentId,
        cityId: browseCityId,
      }),
    selectItems: (page: any) => page?.data?.ads,
    enabled: !!coords && !!discountParentId,
  });

  const keyExtractor = useCallback((item: any) => item.id, []);
  const renderSeparator = useCallback(
    () => <View style={{height: scaled(12)}} />,
    [],
  );
  const renderItem = useCallback(
    ({item}: any) => (
      <OfferCard
        item={item}
        onPress={() => navigate('singleProduct', {ads: item})}
      />
    ),
    [navigate],
  );

  return (
    <Screen withoutScroll>
      <MainHeader
        title={t('home.discountFinder')}
        showLocation
        showBack
        onMenuPress={() => setMenu(true)}
      />
      <View style={{flex: 1}}>
        <RadiusSlider value={radiusKm} onCommit={commitRadius} />

        {/* Refetch indicator: keepPreviousData keeps the old list visible while
            the new radius loads, so this pill is the only signal a fresh call
            is in flight. isLoading (first-ever load) is handled by the list's
            empty state below instead. */}
        {isFetching && !isLoading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <View style={styles.loadingPill}>
              <ActivityIndicator size="small" color={colors.main} />
            </View>
          </View>
        )}

        {locError ? (
          <ListState
            isError
            errorMessage={t('offers.locationPermissionNeeded')}
          />
        ) : !coords ? (
          <ActivityIndicator
            style={{marginTop: scaled(40)}}
            color={colors.main}
          />
        ) : (
          <FlatList
            data={items}
            onEndReached={onEndReached}
            keyExtractor={keyExtractor}
            contentContainerStyle={{
              padding: scaled(12),
              paddingTop: scaled(44),
            }}
            ItemSeparatorComponent={renderSeparator}
            renderItem={renderItem}
            ListEmptyComponent={
              <ListState
                isLoading={isLoading}
                isError={isError}
                emptyMessage={t('offers.noDiscountsInRange')}
              />
            }
            ListFooterComponent={
              <ListFooter
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                itemCount={items.length}
              />
            }
          />
        )}
      </View>

      <DiscountMenuSheet visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sliderBar: {
    position: 'absolute',
    left: scaled(3),
    right: scaled(3),
    top: scaled(3),
    zIndex: 10,
    borderRadius: scaled(5),
    borderWidth: 1,
    borderColor: colors.pallete.gray3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: scaled(12),
    paddingVertical: scaled(4),
  },
  loadingOverlay: {
    position: 'absolute',
    top: scaled(52),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  loadingPill: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: scaled(20),
    padding: scaled(8),
    borderWidth: 1,
    borderColor: colors.pallete.gray3,
  },
});
