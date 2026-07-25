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
import {collectLeafCategoryIds, getAds, getAllJobs, getBanner} from '../../services';
import {useDispatch, useSelector} from 'react-redux';
import {setFilters} from '../../stateManager/reducers/filters';
import {RootState} from '../../stateManager';
import {useLanguage} from '../../Context/LanguageContext';
import {useAdsCategories} from '../../hooks/use-cached-categories';

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
  // تخفیف‌یاب and استخدامی ads are Advertisements tagged with one of their
  // subcategories, never the parent category itself — resolve each parent's
  // id first so parentCategoryId/excludeParentCategoryId can address every
  // subcategory at once instead of one exact category.
  const {data: adsCategories} = useAdsCategories();
  const discountCategory = adsCategories?.data?.find(
    (category: any) => category.title === 'تخفیف یاب',
  );
  const employmentCategory = adsCategories?.data?.find(
    (category: any) => category.title === 'استخدامی',
  );

  // Waits on both categories so a تخفیف‌یاب/استخدامی ad is never briefly (or
  // permanently, if this never refetched) shown in the general row too.
  const {data: estateAds, isFetching: isAdsFetching} = useQuery(
    ['ads', user.cityId, discountCategory?.id, employmentCategory?.id],
    () =>
      getAds({
        limit: 100,
        cityId: user.cityId,
        excludeParentCategoryId: [discountCategory?.id, employmentCategory?.id]
          .filter(Boolean)
          .join(','),
      }),
    {
      enabled:
        !!user.cityId && !!discountCategory?.id && !!employmentCategory?.id,
    },
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

  const {data: employmentAds, isFetching: isEmploymentFetching} = useQuery(
    ['ads', 'employment', user.cityId],
    () =>
      getAds({
        limit: 100,
        cityId: user.cityId,
        parentCategoryId: employmentCategory?.id,
      }),
    {enabled: !!user.cityId && !!employmentCategory?.id},
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
    queryClient.invalidateQueries(['ads', 'employment', user.cityId]);
    queryClient.invalidateQueries(['jobs', 'home', user.cityId]);
  };

  const onPressEmploymentMore = () => {
    navigate('employee' as never, {
      screen: 'employeeAds',
      params: {
        categoryIds: collectLeafCategoryIds(employmentCategory),
        title: employmentCategory?.title,
      },
    } as never);
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
              isEmploymentFetching ||
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
        {employmentAds?.data?.ads?.length > 0 && (
          <RowCategories
            onPressMore={onPressEmploymentMore}
            title={translate('home.hiring')}
            showMoreLabel={translate('common.seeMore')}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={SeparatorComponent}
              data={employmentAds?.data?.ads?.slice(0, 5)}
              ListHeaderComponent={<View style={{width: 4}} />}
              ListFooterComponent={<View style={{width: 4}} />}
              inverted
              renderItem={({item}) => (
                <GridProduct product={item} onPress={() => handlePress(item)} />
              )}
            />
          </RowCategories>
        )}
        {estateAds?.data?.ads?.length > 0 && (
          <RowCategories
            onPressMore={() =>
              onPressMore({title: translate('home.allAds'), allAds: true})
            }
            title={translate('home.ads')}
            showMoreLabel={translate('common.seeMore')}>
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
              navigate(
                'menuStack' as never,
                {screen: 'offerDetection'} as never,
              )
            }
            title={translate('home.discountFinder')}
            showMoreLabel={translate('common.seeMore')}>
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
            title={translate('home.jobsBank')}
            showMoreLabel={translate('common.seeMore')}>
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
