import {FlatList, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {CategroyItem, Divider, MainHeader, Screen} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {useAdsCategories} from '../../hooks/use-cached-categories';
import {scaled} from '../../theme';

// Landing page of the employee tab — general-ad browsing by category, as
// actual pushed pages (not a modal), mirroring OfferDetectionScreen's
// category -> subcategory -> list flow. تخفیف‌یاب has its own tab/section,
// so it's excluded here; بانک مشاغل is naturally excluded too since Jobs
// aren't part of the GENERAL category tree useAdsCategories fetches.
export function EmployeeScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const {data} = useAdsCategories();

  const categories = useMemo(
    () => (data?.data ?? []).filter((c: any) => c.title !== 'تخفیف یاب'),
    [data],
  );

  const onPressCategory = (item: any) => {
    if (item.sub_categories?.length > 0) {
      navigate('employeeCategory' as never, {node: item} as never);
    } else {
      navigate(
        'employeeAds' as never,
        {
          categoryIds: [item.id],
          title: item.title,
        } as never,
      );
    }
  };

  return (
    <Screen withoutScroll>
      <MainHeader title={t('search.adsTitle')} showLocation={true} />
      <FlatList
        data={categories}
        style={{paddingHorizontal: scaled(8)}}
        ListHeaderComponent={
          <View>
            <Divider height={8} />
            <CategroyItem
              item={{title: t('common.allItems')}}
              onPress={() =>
                navigate(
                  'employeeAds' as never,
                  {
                    title: t('common.allItems'),
                  } as never,
                )
              }
            />
            <View style={styles.separator} />
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item: any) => item.id}
        renderItem={({item}) => (
          <CategroyItem item={item} onPress={() => onPressCategory(item)} />
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
