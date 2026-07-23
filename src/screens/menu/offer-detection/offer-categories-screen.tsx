import {FlatList, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import {CategroyItem, Divider, MainHeader, Screen} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {getAdsCategories} from '../../../services';

const ALL_DISCOUNTS_ITEM = {id: 'all', title: 'همه تخفیف‌ها'};

// "دسته‌بندی" from the تخفیف‌یاب hub sheet: "همه تخفیف‌ها" (categories.png
// design) plus the list of تخفیف‌یاب subcategories (تخفیف آخر هفته، رستوران و
// کافی‌شاپ...). Tapping a subcategory opens OfferListScreen filtered to it;
// tapping "همه تخفیف‌ها" opens the same all-discounts feed as the landing
// screen (OfferDetectionScreen).
export function OfferCategoriesScreen() {
  const {navigate} = useNavigation<any>();
  const {data} = useQuery(['adsCategories'], getAdsCategories);

  const rows = useMemo(() => {
    const offerCategory = data?.data?.find(
      (category: any) => category.title === 'تخفیف یاب',
    );
    return [ALL_DISCOUNTS_ITEM, ...(offerCategory?.sub_categories ?? [])];
  }, [data]);

  return (
    <Screen withoutScroll>
      <MainHeader title="تخفیف یاب" showLocation showBack />
      <FlatList
        data={rows}
        style={{paddingHorizontal: 8}}
        ListHeaderComponent={<Divider height={8} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item: any) => item.id}
        renderItem={({item}) => (
          <CategroyItem
            item={item}
            onPress={() =>
              item.id === 'all'
                ? navigate('offerDetection')
                : navigate('offerList', {category: item})
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 8,
  },
});
