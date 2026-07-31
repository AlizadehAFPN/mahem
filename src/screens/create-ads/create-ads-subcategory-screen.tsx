import {FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  MainHeader,
  Screen,
  TAB_BAR_BUTTON_CLEARANCE,
  Text,
} from '../../components';
import {colors, scaled} from '../../theme';

// Generic, reusable step matching every "ثبت آگهی – <دسته>" subcategory/
// sub-subcategory list frame in Figma (e.g. استخدامی, تخفیف یاب, وسایل
// نقلیه, and املاک's two levels) — same row styling as
// CreateAdsCategoryScreen, just rendering `path`'s last item's children.
// `path` accumulates the selected chain (main/sub/subsub) so the details
// form and payment step can resolve the full category later.
export function CreateAdsSubcategoryScreen() {
  const {navigate} = useNavigation<any>();
  const {params} = useRoute<any>();
  const path: any[] = params?.path ?? [];
  const parent = path[path.length - 1];
  const items = parent?.sub_categories ?? [];

  const onPressItem = (item: any) => {
    const nextPath = [...path, item];
    if (item.sub_categories?.length > 0) {
      navigate('createAdsSubcategory', {path: nextPath});
    } else {
      navigate('createAdsDetails', {path: nextPath});
    }
  };

  return (
    <Screen withoutScroll>
      <MainHeader title={parent?.title ?? ''} showBack />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => onPressItem(item)}>
            <MaterialIcons
              name="keyboard-arrow-left"
              size={scaled(22)}
              color={colors.text}
              style={styles.chevron}
            />
            <Text style={styles.rowText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: scaled(5),
    paddingTop: scaled(8),
    // Same clearance as CreateAdsCategoryScreen: the tab bar's «+» button
    // floats over the end of the list.
    paddingBottom: TAB_BAR_BUTTON_CLEARANCE,
  },
  row: {
    height: scaled(52),
    marginBottom: 2,
    borderRadius: scaled(5),
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaled(8),
  },
  chevron: {
    position: 'absolute',
    left: scaled(8),
  },
  rowText: {
    flex: 1,
    textAlign: 'center',
    fontSize: scaled(17),
    color: 'black',
  },
});
