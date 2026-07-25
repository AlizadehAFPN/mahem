import {FlatList, StyleSheet, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {CategroyItem, Divider, MainHeader, Screen} from '../../components';
import {useNavigation, useRoute} from '@react-navigation/native';
import {collectLeafCategoryIds} from '../../services';
import {localizeCategory} from '../../i18n/display-maps';

// Recursive step of the employee category browse — pushed again (same
// route, new params) for every extra level a branch has, since category
// tree depth varies (e.g. املاک goes a level deeper than استخدامی).
export function EmployeeCategoryScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation();
  const {params} = useRoute();
  const node = params?.node;
  const subCategories = node?.sub_categories ?? [];

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
      <MainHeader title={localizeCategory(node?.title)} showLocation={true} showBack />
      <FlatList
        data={subCategories}
        style={{paddingHorizontal: 8}}
        ListHeaderComponent={
          <View>
            <Divider height={8} />
            <CategroyItem
              item={{title: t('common.allItems')}}
              onPress={() =>
                navigate('employeeAds' as never, {
                  categoryIds: collectLeafCategoryIds(node),
                  title: node?.title,
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
