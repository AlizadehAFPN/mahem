import {FlatList, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import {CategroyItem, Divider, MainHeader, Screen} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {getAdsCategories} from '../../../services';

// تخفیف‌یاب is browsed by category (تخفیف آخر هفته، رستوران و کافی‌شاپ...),
// same as every other ad category — see prisma/seed.ts, where "تخفیف یاب"
// is seeded as a top-level GENERAL category with these exact subcategories.
export function OfferDetectionScreen() {
  const {navigate} = useNavigation();
  const {data} = useQuery(['adsCategories'], getAdsCategories);

  const subCategories = useMemo(() => {
    const offerCategory = data?.data?.find(
      (category: any) => category.title === 'تخفیف یاب',
    );
    return offerCategory?.sub_categories ?? [];
  }, [data]);

  return (
    <Screen withoutScroll>
      <MainHeader title="تخفیف یاب" showLocation={true} />
      <FlatList
        data={subCategories}
        style={{paddingHorizontal: 8}}
        ListHeaderComponent={<Divider height={8} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item: any) => item.id}
        renderItem={({item}) => (
          <CategroyItem
            item={item}
            onPress={() => navigate('offerList' as never, {category: item})}
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
