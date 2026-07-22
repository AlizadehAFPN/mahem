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
import {getAds, getAdsCategories, getAllJobs, getBanner} from '../../services';
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
  const handleJobPress = (item: any) => {
    //@ts-ignore
    navigate('singleJob', {job: item});
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

  // تخفیف‌یاب ads are Advertisements tagged with one of its subcategories,
  // never the parent category itself — resolve the parent's id first so
  // parentCategoryId can pull every subcategory's ads in one query.
  const {data: adsCategories} = useQuery(['adsCategories'], getAdsCategories);
  const discountCategory = adsCategories?.data?.find(
    (category: any) => category.title === 'تخفیف یاب',
  );
  const {data: discountAds, isFetching: isDiscountsFetching} = useQuery(
    ['ads', 'discounts', user.cityId],
    () =>
      getAds({
        limit: 100,
        cityId: user.cityId,
        parentCategoryId: discountCategory?.id,
      }),
    {enabled: !!user.cityId && !!discountCategory?.id},
  );

  const {data: jobs, isFetching: isJobsFetching} = useQuery(
    ['jobs', 'home', user.cityId],
    () => getAllJobs({limit: 100, cityId: user.cityId}),
    {enabled: !!user.cityId},
  );

  const onRefresh = () => {
    queryClient.invalidateQueries(['banners', user.cityId]);
    queryClient.invalidateQueries(['ads', user.cityId]);
    queryClient.invalidateQueries(['ads', 'discounts', user.cityId]);
    queryClient.invalidateQueries(['jobs', 'home', user.cityId]);
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
            refreshing={
              isBannersFetching ||
              isAdsFetching ||
              isDiscountsFetching ||
              isJobsFetching
            }
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
        {discountAds?.data?.ads?.length > 0 && (
          <RowCategories
            onPressMore={() =>
              navigate('menuStack' as never, {screen: 'offerDetection'} as never)
            }
            title={translate('findingDiscount')}
            showMoreLabel={translate('listContinue')}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={SeparatorComponent}
              data={discountAds?.data?.ads?.slice(0, 5)}
              ListHeaderComponent={<View style={{width: 4}} />}
              ListFooterComponent={<View style={{width: 4}} />}
              inverted
              renderItem={({item}) => (
                <GridProduct product={item} onPress={() => handlePress(item)} />
              )}
            />
          </RowCategories>
        )}
        {jobs?.data?.jobs?.length > 0 && (
          <RowCategories
            onPressMore={() =>
              navigate('menuStack' as never, {screen: 'jobsBank'} as never)
            }
            title={translate('jobsBank')}
            showMoreLabel={translate('listContinue')}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={SeparatorComponent}
              data={jobs?.data?.jobs?.slice(0, 5)}
              ListHeaderComponent={<View style={{width: 4}} />}
              ListFooterComponent={<View style={{width: 4}} />}
              inverted
              renderItem={({item}) => (
                <GridProduct product={item} onPress={() => handleJobPress(item)} />
              )}
            />
          </RowCategories>
        )}
      </ScrollView>
    </Screen>
  );
}
