import {FlatList, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import {CategroyItem, Divider, MainHeader, Screen} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {getAdsCategories} from '../../services';

// Landing page of the employee tab — general-ad browsing by category, as
// actual pushed pages (not a modal), mirroring OfferDetectionScreen's
// category -> subcategory -> list flow. تخفیف‌یاب has its own tab/section,
// so it's excluded here; بانک مشاغل is naturally excluded too since Jobs
// aren't part of the GENERAL category tree getAdsCategories fetches.
export function EmployeeScreen() {
  const {navigate} = useNavigation();
  const {data} = useQuery(['adsCategories'], getAdsCategories);

  const categories = useMemo(
    () => (data?.data ?? []).filter((c: any) => c.title !== 'تخفیف یاب'),
    [data],
  );

  const onPressCategory = (item: any) => {
    if (item.sub_categories?.length > 0) {
      navigate('employeeCategory' as never, {node: item} as never);
    } else {
      navigate('employeeAds' as never, {
        categoryIds: [item.id],
        title: item.title,
      } as never);
    }
  };

  return (
    <Screen withoutScroll>
      <MainHeader title="آگهی‌ها" showLocation={true} />
      <FlatList
        data={categories}
        style={{paddingHorizontal: 8}}
        ListHeaderComponent={
          <View>
            <Divider height={8} />
            <CategroyItem
              item={{title: 'همه موارد'}}
              onPress={() =>
                navigate('employeeAds' as never, {
                  title: 'همه موارد',
                } as never)
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
    height: 8,
  },
});
