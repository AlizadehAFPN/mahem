import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useQuery} from 'react-query';
import {DiscountMenuSheet, MainHeader, Screen, Text} from '../../../components';
import {getAds, getAdsCategories} from '../../../services';
import {getCurrentPosition} from '../../../utiles';
import {colors} from '../../../theme';

const DEFAULT_REGION = {
  latitude: 35.6892,
  longitude: 51.389,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// "تخفیف‌های روی نقشه" (screenshots 1/3): discounts as category-colored pins on
// a full map, with a collapsible category filter panel on the side.
export function DiscountMapScreen() {
  const {navigate} = useNavigation<any>();
  const cityId = useSelector((s: any) => s.user.cityId);
  const [menu, setMenu] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [selected, setSelected] = useState<string[]>([]);

  const {data: cats} = useQuery(['adsCategories'], getAdsCategories);
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

  // Center on the device first; if that's unavailable, fall back to the first
  // discount, else the default region.
  useEffect(() => {
    let cancelled = false;
    getCurrentPosition()
      .then(c => {
        if (!cancelled) {
          setRegion(r => ({...r, latitude: c.lat, longitude: c.lng}));
        }
      })
      .catch(() => {
        if (!cancelled && ads[0]) {
          setRegion(r => ({
            ...r,
            latitude: Number(ads[0].lat),
            longitude: Number(ads[0].lng),
          }));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads.length]);

  const visibleAds = useMemo(
    () => ads.filter((a: any) => selected.includes(a.category_id?.id)),
    [ads, selected],
  );

  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );

  return (
    <Screen withoutScroll>
      <MainHeader
        title="تخفیف روی نقشه"
        showLocation
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
                ad.discountPercent ? `${ad.discountPercent}٪ تخفیف` : undefined
              }
              onCalloutPress={() => navigate('singleProduct', {ads: ad})}
            />
          ))}
        </MapView>

        {panelOpen ? (
          <View style={styles.panel}>
            <TouchableOpacity
              onPress={() => setPanelOpen(false)}
              style={styles.panelHeader}>
              <Ionicons name="chevron-forward" size={22} color={colors.main} />
              <Text preset="bold" style={{flex: 1, textAlign: 'right'}}>
                دسته‌ها
              </Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                      color={active ? colors.pallete.green : colors.pallete.gray3}
                    />
                    <Text
                      size={13}
                      numberOfLines={1}
                      style={{flex: 1, textAlign: 'right', marginRight: 6}}>
                      {cat.title}
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
        ) : (
          <TouchableOpacity
            onPress={() => setPanelOpen(true)}
            style={styles.collapsedTab}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <DiscountMenuSheet visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 8,
    right: 0,
    bottom: 8,
    width: 210,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.pallete.gray1,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 6,
  },
  collapsedTab: {
    position: 'absolute',
    top: 16,
    right: 0,
    backgroundColor: colors.main,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});
