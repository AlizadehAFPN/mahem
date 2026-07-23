import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Text} from '../../text/text';
import {colors} from '../../../theme';

// Matches every "دسته بندی-"/"ثبت آگهی-" list-row frame in Figma: #EEEEEE
// row, #707070 1px border, 5px radius, centered text, and a left-pointing
// chevron only on rows that drill into a further level (leaf rows, e.g.
// "سایر" or the "همه موارد" pseudo-item, have none). Shared by
// EmployeeScreen/EmployeeCategoryScreen and OfferCategoriesScreen, so this
// one change keeps all of them pixel-consistent with the design.
export function CategroyItem({item, onPress}) {
  const hasChildren = (item?.sub_categories?.length ?? 0) > 0;
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {hasChildren && (
        <MaterialIcons
          name="keyboard-arrow-left"
          size={22}
          color={colors.text}
          style={styles.chevron}
        />
      )}
      <Text size={17} style={styles.text}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    backgroundColor: colors.pallete.gray1,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    borderRadius: 5,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    position: 'absolute',
    left: 8,
  },
  text: {
    flex: 1,
    textAlign: 'center',
  },
});
