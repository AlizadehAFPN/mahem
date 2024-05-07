import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {MainHeader, OfferCard, Screen, StoryBar} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useInfiniteQuery} from 'react-query';
import {getAds} from '../../../services';
const data = [
  {
    img: require('../../../assets/images/offerbanner1.png'),
    location: 'مینودشت',
    title: 'فروش کیبورد ارنجر یاماها',
    offerPercent: 45,
    mainPrice: '1000000',
    price: '910000',
    rate: 4,
    time: 12000,
  },
  {
    img: require('../../../assets/images/offerbanner2.png'),
    location: 'مینودشت',
    title: 'اداپتور تایپ سی ۲۵ امپر',
    offerPercent: 23,
    mainPrice: '720000',
    price: '680000',
    rate: 1,
    time: 25000,
  },
  {
    img: require('../../../assets/images/offerbanner3.png'),
    location: 'مینودشت',
    title: 'قاب و گلس گوشی s23',
    offerPercent: 13,
    mainPrice: '230000',
    price: '2270000',
    rate: 3,
    time: 9400,
  },
];
export function OfferDetectionScreen() {
  const {navigate} = useNavigation();
  const [ads, setAds] = useState([]);
  const {data, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ['ads'],
    queryFn: ({pageParam = 1}) =>
      getAds({page: pageParam, category_id: 17, per_page: 1000}),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      if (
        lastPage?.data?.pagination?.current_page <
        lastPage?.data?.pagination?.total_pages
      ) {
        return lastPage?.data?.pagination?.current_page + 1;
      } else {
        return undefined;
      }
    },
    getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
  });

  const onEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const flatenData = data?.pages?.flatMap(page => page?.data?.ads);
    setAds(flatenData);
  }, [data]);
  return (
    <Screen>
      <MainHeader title="تخفیف یاب" showLocation={true} />
      <Screen>
        <StoryBar />
        <View style={styles.line} />
        <FlatList
          data={ads}
          ItemSeparatorComponent={<View style={{height: 8}} />}
          contentContainerStyle={{padding: 8}}
          renderItem={({item}) => (
            <OfferCard
              onPress={() => navigate('singleOffer', {ads: item})}
              item={item}
            />
          )}
        />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.pallete.gray2,
  },
});
