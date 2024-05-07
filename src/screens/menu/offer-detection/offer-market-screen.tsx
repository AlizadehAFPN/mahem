import {Dimensions, FlatList, Image, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Divider,
  GradiantHeader,
  MainHeader,
  Screen,
  Row,
  Text,
  ProductLocation,
  GridOfferCard,
} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useInfiniteQuery, useQuery} from 'react-query';
import {getAds} from '../../../services';
const data = [
  {
    img: require('../../../assets/images/market1.png'),
    location: 'مینودشت',
    title: 'فروش کیبورد ارنجر یاماها',
    offerPercent: 45,
    mainPrice: '1000000',
    price: '910000',
    rate: 4,
    time: 12000,
  },
  {
    img: require('../../../assets/images/market2.png'),
    location: 'مینودشت',
    title: 'اداپتور تایپ سی ۲۵ امپر',
    offerPercent: 23,
    mainPrice: '720000',
    price: '680000',
    rate: 1,
    time: 25000,
  },
  {
    img: require('../../../assets/images/market3.png'),
    location: 'مینودشت',
    title: 'قاب و گلس گوشی s23',
    offerPercent: 13,
    mainPrice: '230000',
    price: '2270000',
    rate: 3,
    time: 9400,
  },
  {
    img: require('../../../assets/images/market4.png'),
    location: 'مینودشت',
    title: 'قاب و گلس گوشی s23',
    offerPercent: 13,
    mainPrice: '230000',
    price: '2270000',
    rate: 3,
    time: 9400,
  },
];
const {width} = Dimensions.get('window');
export function OfferMarketScreen() {
  const {params} = useRoute();
  const [ads, setAds] = useState([]);
  const {data, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ['ads', params?.store],
    queryFn: ({pageParam = 1}) =>
      getAds({page: pageParam, store_id: params?.store?.id, per_page: 1000}),
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
  const {navigate} = useNavigation();
  return (
    <Screen withoutScroll>
      <MainHeader title="تخفیف یاب" />
      <View style={styles.nav}>
        <GradiantHeader />
      </View>
      <Screen unsafe>
        <View style={styles.bannerContaier}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={{uri: params?.store?.image?.path}}
          />
        </View>
        <View style={styles.grayCard}>
          <View style={styles.avatar}>
            <Image
              style={{height: '100%', width: '100%'}}
              source={{uri: params?.store?.logo?.path}}
            />
          </View>
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text size={17} color={colors.main} preset="bold">
              {params?.store?.title}
            </Text>
          </View>
        </View>
        <Divider height={8} />
        <FlatList
          onEndReached={onEndReached}
          data={ads}
          contentContainerStyle={{paddingHorizontal: 10}}
          numColumns={2}
          ItemSeparatorComponent={<View style={{height: 10}} />}
          renderItem={({item, index}) => (
            <View
              style={{
                marginLeft: index % 2 ? 4 : 0,
                marginRight: index % 2 ? 0 : 4,
                width: (width - 28) / 2,
              }}>
              <GridOfferCard
                onPress={() => navigate('singleOffer', {ads: item})}
                item={item}
              />
            </View>
          )}
        />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerContaier: {
    width: '100%',
    height: width / 1.9,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: 50,
  },
  grayCard: {
    height: 55,
    backgroundColor: colors.pallete.gray1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatar: {
    height: 94,
    width: 94,
    borderRadius: 16,
    marginTop: -47,
    borderWidth: 1,
    marginLeft: 20,
    overflow: 'hidden',
  },
  detailItem: {
    height: 19,
    backgroundColor: colors.pallete.gray1,
    borderRadius: 4,
    justifyContent: 'center',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  itemText: {
    lineHeight: 19,
  },
});
