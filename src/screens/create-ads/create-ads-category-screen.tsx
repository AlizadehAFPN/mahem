import {ActivityIndicator, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {MainHeader, Screen, Text} from '../../components';
import {getAdsCategories} from '../../services';
import {colors} from '../../theme';

// "ثبت آگهی - 0" (Figma): the wizard's root step — pick one of the 10 top
// -level categories. Matches the design's row styling exactly (#EEEEEE
// background, #707070 1px border, 5px radius, 52px height, 2px gap).
export function CreateAdsCategoryScreen() {
  const {navigate} = useNavigation<any>();
  const {data} = useQuery(['addsCategory'], getAdsCategories);
  const categories = data?.data ?? [];

  const onPressCategory = (category: any) => {
    if (category.sub_categories?.length > 0) {
      navigate('createAdsSubcategory', {path: [category]});
    } else {
      navigate('createAdsDetails', {path: [category]});
    }
  };

  return (
    <Screen withoutScroll>
      <MainHeader title="ثبت آگهی" />
      {!data ? (
        <ActivityIndicator style={{marginTop: 24}} color={colors.main} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => onPressCategory(item)}>
              <MaterialIcons
                name="keyboard-arrow-left"
                size={22}
                color={colors.text}
                style={styles.chevron}
              />
              <Text style={styles.rowText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 5,
    paddingTop: 8,
  },
  row: {
    height: 52,
    marginBottom: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  chevron: {
    position: 'absolute',
    left: 8,
  },
  rowText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    color: 'black',
  },
});
