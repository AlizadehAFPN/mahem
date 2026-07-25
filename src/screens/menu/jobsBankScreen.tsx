import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, MainHeader, Screen, Text} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {getJobCategoryIcon} from '../../utiles';
import {useJobCategories} from '../../hooks/use-cached-categories';
import {localizeCategory} from '../../i18n/display-maps';

const {width} = Dimensions.get('window');

// Synthetic first tile — "همه موارد" opens AllJobsScreen (the whole city's job
// bank, no category filter). Follows the id-less pseudo-category convention
// used for the "همه‌ی آگهی‌ها" entries elsewhere (see filters.ts).
const ALL_ITEMS_TILE = {id: '__all__', title: '__all__', isAllItems: true};

export function JobsBankScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const {data} = useJobCategories();
  const listData = [ALL_ITEMS_TILE, ...(data?.data || [])];
  const handleNavigation = (item: any) => {
    navigate('singleJobCategory', {category: item});
  };
  const ItemSeperator = () => <View style={{height: 8}} />;
  return (
    <Screen withoutScroll>
      <MainHeader showLocation={true} title={t('home.jobsBank')} showBack />
      <Divider />
      <FlatList
        data={listData}
        numColumns={4}
        keyExtractor={item => String(item?.id ?? item?.title)}
        ItemSeparatorComponent={ItemSeperator}
        renderItem={({item}) => {
          const isAll = item?.isAllItems;
          return (
            <TouchableOpacity
              onPress={() =>
                isAll ? navigate('allJobs') : handleNavigation(item)
              }
              style={styles.itemContainer}>
              <Image
                style={styles.img}
                source={
                  isAll
                    ? require('../../assets/images/icons/jobsBank.png')
                    : getJobCategoryIcon(item.title)
                }
              />
              <Text size={12} style={{textAlign: 'center'}}>
                {isAll ? t('common.allItems') : localizeCategory(item.title)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
      <Divider />
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 4,
    width: (width - 32) / 4,
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  img: {
    width: 60,
    height: 60,
  },
});
