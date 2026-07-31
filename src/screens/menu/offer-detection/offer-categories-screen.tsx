import {FlatList, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {CategroyItem, Divider, MainHeader, Screen} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {scaled} from '../../../theme';

// "دسته‌بندی" from the تخفیف‌یاب hub sheet: "همه تخفیف‌ها" (categories.png
// design) plus the list of تخفیف‌یاب subcategories (تخفیف آخر هفته، رستوران و
// کافی‌شاپ...). Tapping a subcategory opens OfferListScreen filtered to it;
// tapping "همه تخفیف‌ها" opens the same all-discounts feed as the landing
// screen (OfferDetectionScreen).
export function OfferCategoriesScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const {data} = useAdsCategories();

  const rows = useMemo(() => {
    const offerCategory = data?.data?.find(
      (category: any) => category.title === 'تخفیف یاب',
    );
    const allDiscountsItem = {id: 'all', title: t('offers.allDiscounts')};
    return [allDiscountsItem, ...(offerCategory?.sub_categories ?? [])];
  }, [data, t]);

  return (
    <Screen withoutScroll>
      <MainHeader title={t('home.discountFinder')} showLocation showBack />
      <FlatList
        data={rows}
        style={{paddingHorizontal: scaled(8)}}
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
    height: scaled(8),
  },
});
