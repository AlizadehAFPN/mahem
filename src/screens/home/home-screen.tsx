import {FlatList, RefreshControl, ScrollView, View} from 'react-native';
import React from 'react';
import {
  GridProduct,
  ImageSlider,
  MainHeader,
  RowCategories,
  Screen,
} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useQueryClient} from 'react-query';
import {getAds, getBanner} from '../../services';
import {useDispatch, useSelector} from 'react-redux';
import {setFilters} from '../../stateManager/reducers/filters';
import {RootState} from '../../stateManager';
import {useLanguage} from '../../Context/LanguageContext';

export function HomeScreen() {
  const {navigate} = useNavigation();
  const user = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const {translate, changeLanguage, language} = useLanguage();
  const handlePress = (item: any) => {
    //@ts-ignore
    navigate('singleProduct', {ads: item});
  };
  const {data, isFetching: isBannersFetching} = useQuery(
    ['banners', user.cityId],
    () => getBanner(user.cityId),
    {enabled: !!user.cityId},
  );
  const {data: estateAds, isFetching: isAdsFetching} = useQuery(
    ['ads', user.cityId],
    () => getAds({limit: 100, cityId: user.cityId}),
    {enabled: !!user.cityId},
  );

  const onRefresh = () => {
    queryClient.invalidateQueries(['banners', user.cityId]);
    queryClient.invalidateQueries(['ads', user.cityId]);
  };

  const onPressMore = (mainCategory: {
    title: string;
    id?: string;
    allAds?: boolean;
  }) => {
    dispatch(
      setFilters({
        mainCategory,
        subCategory: undefined,
        subSubCategory: undefined,
        allAds: mainCategory?.allAds,
      }),
    );
    navigate('search' as never);
  };

  const SeparatorComponent = () => <View style={{width: 8}} />;
  return (
    <Screen withoutScroll>
      <MainHeader showLocation={true} title={''} showNews={true} />
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isBannersFetching || isAdsFetching}
            onRefresh={onRefresh}
          />
        }>
        <ImageSlider
          images={data?.data?.map((item: any) => ({
            uri: item?.imageDetail?.path,
            link: item.link,
          }))}
        />
        {estateAds?.data?.ads?.length > 0 && (
          <RowCategories
            onPressMore={() => onPressMore({title: 'کل آگهی ها', allAds: true})}
            title={translate('ads')}
            showMoreLabel={translate('listContinue')}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={SeparatorComponent}
              data={estateAds?.data?.ads?.slice(0, 5)}
              ListHeaderComponent={<View style={{width: 4}} />}
              ListFooterComponent={<View style={{width: 4}} />}
              inverted
              renderItem={({item}) => (
                <GridProduct product={item} onPress={() => handlePress(item)} />
              )}
            />
          </RowCategories>
        )}
      </ScrollView>
    </Screen>
  );
}
