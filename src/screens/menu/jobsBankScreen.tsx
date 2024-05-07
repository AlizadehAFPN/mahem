import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {Divider, MainHeader, Screen, Text} from '../../components';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {getJobsCategories} from '../../services/job';

const {width} = Dimensions.get('window');

export function JobsBankScreen() {
  const {navigate} = useNavigation();
  const {data} = useQuery([`jobBank`], getJobsCategories);
  const handleNavigation = (item: any) => {
    //@ts-ignore
    navigate('singleJobCategory', {category: item});
  };
  const ItemSeperator = () => <View style={{height: 8}} />;
  return (
    <Screen withoutScroll>
      <MainHeader showLocation={true} title={''} />
      <Divider />
      <FlatList
        data={data?.data || []}
        numColumns={4}
        ItemSeparatorComponent={ItemSeperator}
        renderItem={({item, index}) => (
          <TouchableOpacity
            onPress={() => handleNavigation(item)}
            style={styles.itemContainer}>
            <Image style={styles.img} source={{uri: item.logo}} />
            <Text size={12} style={{textAlign: 'center'}}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
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
