import {
  BackHandler,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useQuery} from 'react-query';
import {DiscountMenuSheet, MainHeader, Screen, Text} from '../../../components';
import {getAds} from '../../../services';
import {colors} from '../../../theme';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {useCities} from '../../../hooks/use-cached-cities';
import {localizeCategory} from '../../../i18n/display-maps';

// Gorgan (this app only serves Golestan province — see src/utiles/cities.ts —
// so a fallback centered on Tehran, ~750km away, would show an empty map
// with none of the app's content anywhere in view). Only used if the
// current city is somehow missing from the cached list or has no
// coordinates yet — every seeded city has lat/lng (see mahem-backend's
// City model), so this should only ever be a defensive fallback.
const DEFAULT_REGION = {
  latitude: 36.8452,
  longitude: 54.4288,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// "تخفیف‌های روی نقشه" (screenshots 1/3): discounts as category-colored pins on
// a full map, with a collapsible category filter panel on the side.
export function DiscountMapScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const cityId = useSelector((s: any) => s.user.cityId);
  const [menu, setMenu] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // Cached locally (see CitiesSyncBridge) so this is available synchronously
  // on first render — the map must open on the user's current city from the
  // very first frame, not jump there after ads/GPS resolve.
  const {data: citiesData} = useCities();
  const currentCity = useMemo(
    () => citiesData?.data?.find((c: any) => c.id === cityId),
    [citiesData, cityId],
  );
  const cityRegion = useMemo(() => {
    if (currentCity?.lat != null && currentCity?.lng != null) {
      return {
        latitude: Number(currentCity.lat),
        longitude: Number(currentCity.lng),
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    return DEFAULT_REGION;
  }, [currentCity]);
  const [region, setRegion] = useState(cityRegion);

  // Re-anchor on the city's region if it resolves after mount (cache not
  // primed yet) or the user switches city — but not on every pan/zoom, since
  // cityRegion is only recomputed when currentCity itself changes.
  useEffect(() => {
    setRegion(cityRegion);
  }, [cityRegion]);

  const {data: cats} = useAdsCategories();
  const parent = useMemo(
    () => cats?.data?.find((c: any) => c.title === 'تخفیف یاب'),
    [cats],
  );
  const subCategories: any[] = parent?.sub_categories ?? [];
  const parentId = parent?.id;

  // Default the filter to every subcategory (all pins visible).
  useEffect(() => {
    if (subCategories.length && selected.length === 0) {
      setSelected(subCategories.map((c: any) => c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategories.length]);

  const {data} = useQuery(
    ['discounts', 'map', parentId, cityId],
    () => getAds({parentCategoryId: parentId, cityId, limit: 100}),
    {enabled: !!parentId && !!cityId},
  );

  const ads = useMemo(
    () =>
      (data?.data?.ads ?? []).filter(
        (a: any) => a.lat != null && a.lng != null,
      ),
    [data],
  );

  const visibleAds = useMemo(
    () => ads.filter((a: any) => selected.includes(a.category_id?.id)),
    [ads, selected],
  );

  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );

  useEffect(() => {
    if (!filterOpen) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setFilterOpen(false);
        return true;
      },
    );
    return () => subscription.remove();
  }, [filterOpen]);

  return (
    <Screen withoutScroll>
      <MainHeader
        title={t('home.discountFinder')}
        showLocation
        showBack
        onMenuPress={() => setMenu(true)}
      />
      <View style={{flex: 1}}>
        <MapView
          style={StyleSheet.absoluteFill}
          region={region}
          onRegionChangeComplete={setRegion}>
          {visibleAds.map((ad: any) => (
            <Marker
              key={ad.id}
              coordinate={{
                latitude: Number(ad.lat),
                longitude: Number(ad.lng),
              }}
              pinColor={ad.category_id?.color || colors.main}
              title={ad.title}
              description={
                ad.discountPercent
                  ? t('offers.percentOff', {percent: ad.discountPercent})
                  : undefined
              }
              onCalloutPress={() => navigate('singleProduct', {ads: ad})}
            />
          ))}
        </MapView>

        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => setFilterOpen(true)}>
          <Text size={15} color="#030303">
            {selected.length === subCategories.length
              ? t('offers.allDiscounts')
              : t('offers.categoriesSelected', {value: selected.length})}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#030303" />
        </TouchableOpacity>
      </View>

      {filterOpen && (
        // A same-tree overlay instead of RN's <Modal>: on Android, <Modal>
        // opens a separate native Window, and the MapView above (a
        // SurfaceView) draws above other Windows regardless of JS z-index,
        // so it would punch through a real Modal. Staying in the screen's
        // own Window keeps normal view stacking in effect.
        <View style={styles.filterOverlay}>
          <TouchableWithoutFeedback onPress={() => setFilterOpen(false)}>
            <View style={styles.sheetBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text preset="bold" style={{textAlign: 'center', marginBottom: 8}}>
              {t('offers.categoriesSheetTitle')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.filterRow}
                onPress={() =>
                  setSelected(
                    selected.length === subCategories.length
                      ? []
                      : subCategories.map((c: any) => c.id),
                  )
                }>
                <Ionicons
                  name={
                    selected.length === subCategories.length
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={18}
                  color={
                    selected.length === subCategories.length
                      ? colors.pallete.green
                      : colors.pallete.gray3
                  }
                />
                <Text
                  size={14}
                  preset="bold"
                  style={{flex: 1, textAlign: 'right', marginRight: 6}}>
                  {t('offers.allDiscounts')}
                </Text>
              </TouchableOpacity>
              {subCategories.map((cat: any) => {
                const active = selected.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.filterRow}
                    onPress={() => toggle(cat.id)}>
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={
                        active ? colors.pallete.green : colors.pallete.gray3
                      }
                    />
                    <Text
                      size={13}
                      numberOfLines={1}
                      style={{flex: 1, textAlign: 'right', marginRight: 6}}>
                      {localizeCategory(cat.title)}
                    </Text>
                    <View
                      style={[
                        styles.colorDot,
                        {backgroundColor: cat.color || colors.main},
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      <DiscountMenuSheet visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterPill: {
    position: 'absolute',
    bottom: 8,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168,161,161,0.5)',
    borderWidth: 1,
    borderColor: colors.pallete.gray3,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.pallete.gray3,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.pallete.gray1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 6,
  },
});
