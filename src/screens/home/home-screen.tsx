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
import {
  collectLeafCategoryIds,
  getAds,
  getAllJobs,
  getBanner,
} from '../../services';
import {useDispatch} from 'react-redux';
import {setFilters} from '../../stateManager/reducers/filters';
import {useLanguage} from '../../Context/LanguageContext';
import {useAdsCategories} from '../../hooks/use-cached-categories';
import {useBrowseCity} from '../../hooks/use-browse-city';
import {scaled} from '../../theme';

export function HomeScreen() {
  const {navigate} = useNavigation<any>();
  // The header dropdown drives everything on this screen. The two ids differ
  // only in what «کل استان» means: for the ad/job feeds it means "no city
  // filter" (cityIdParam is undefined, the whole province is listed), while
  // banners have no province-wide set to show, so concreteCityId keeps them
  // on the account's own city instead of leaving the strip empty.
  const {
    cityIdParam: browseCityId,
    cityKey: browseCityKey,
    concreteCityId: bannerCityId,
  } = useBrowseCity();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const {translate} = useLanguage();
  const handlePress = (item: any) => {
    //@ts-ignore
    navigate('singleProduct', {ads: item});
  };
  const handleJobPress = (item: any) => {
    //@ts-ignore
    navigate('singleJob', {job: item});
  };
  // Keyed on the browse city, not the account's home city. Banners used to
  // follow user.cityId, so picking another city from the header dropdown
  // changed every list on this screen except the banners — a city's own
  // banner was unreachable unless you made it your home city in Settings.
  // concreteCityId is what «کل استان» resolves to a real city with: banners
  // are uploaded per city and there is no province-wide set, so the account's
  // own city stands in rather than the strip going empty.
  const {data, isFetching: isBannersFetching} = useQuery(
    ['banners', bannerCityId],
    () => getBanner(bannerCityId),
    {enabled: !!bannerCityId},
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
    ['ads', browseCityKey, discountCategory?.id, employmentCategory?.id],
    () =>
      getAds({
        limit: 100,
        cityId: browseCityId,
        excludeParentCategoryId: [discountCategory?.id, employmentCategory?.id]
          .filter(Boolean)
          .join(','),
      }),
    {
      enabled: !!discountCategory?.id && !!employmentCategory?.id,
    },
  );

  const {data: discountAds, isFetching: isDiscountsFetching} = useQuery(
    ['ads', 'discounts', browseCityKey],
    () =>
      getAds({
        limit: 100,
        cityId: browseCityId,
        parentCategoryId: discountCategory?.id,
      }),
    {enabled: !!discountCategory?.id},
  );

  const {data: employmentAds, isFetching: isEmploymentFetching} = useQuery(
    ['ads', 'employment', browseCityKey],
    () =>
      getAds({
        limit: 100,
        cityId: browseCityId,
        parentCategoryId: employmentCategory?.id,
      }),
    {enabled: !!employmentCategory?.id},
  );

  const {data: jobs, isFetching: isJobsFetching} = useQuery(
    ['jobs', 'home', browseCityKey],
    () => getAllJobs({limit: 100, cityId: browseCityId}),
  );

  const onRefresh = () => {
    // Must be the same id the query above is keyed on, or pull-to-refresh
    // invalidates a key nothing is subscribed to and the banner strip silently
    // stops refreshing.
    queryClient.invalidateQueries(['banners', bannerCityId]);
    queryClient.invalidateQueries(['ads', browseCityKey]);
    queryClient.invalidateQueries(['ads', 'discounts', browseCityKey]);
    queryClient.invalidateQueries(['ads', 'employment', browseCityKey]);
    queryClient.invalidateQueries(['jobs', 'home', browseCityKey]);
  };

  const onPressEmploymentMore = () => {
    navigate(
      'employee' as never,
      {
        screen: 'employeeAds',
        params: {
          categoryIds: collectLeafCategoryIds(employmentCategory),
          title: employmentCategory?.title,
        },
      } as never,
    );
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

  const SeparatorComponent = () => <View style={{width: scaled(8)}} />;
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
              ListHeaderComponent={<View style={{width: scaled(4)}} />}
              ListFooterComponent={<View style={{width: scaled(4)}} />}
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
              ListHeaderComponent={<View style={{width: scaled(4)}} />}
              ListFooterComponent={<View style={{width: scaled(4)}} />}
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
              ListHeaderComponent={<View style={{width: scaled(4)}} />}
              ListFooterComponent={<View style={{width: scaled(4)}} />}
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
              ListHeaderComponent={<View style={{width: scaled(4)}} />}
              ListFooterComponent={<View style={{width: scaled(4)}} />}
              inverted
              renderItem={({item}) => (
                <GridProduct
                  product={item}
                  onPress={() => handleJobPress(item)}
                />
              )}
            />
          </RowCategories>
        )}
      </ScrollView>
    </Screen>
  );
}
