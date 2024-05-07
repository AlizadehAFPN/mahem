import {FlatList, ScrollView, View} from 'react-native';
import React from 'react';
import {
  GridProduct,
  ImageSlider,
  MainHeader,
  RowCategories,
  Screen,
} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {getAds, getBanner} from '../../services';
import {useDispatch, useSelector} from 'react-redux';
import {setFilters} from '../../stateManager/reducers/filters';
import {firebase} from '@react-native-firebase/database';
import {RootState} from '../../stateManager';
import {useLanguage} from '../../Context/LanguageContext';

export function HomeScreen() {
  const {navigate} = useNavigation();
  const user = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();
  const {translate, changeLanguage, language} = useLanguage();
  const handlePress = (item: any) => {
    //@ts-ignore
    navigate('singleProduct', {ads: item});
  };
  const {data} = useQuery(['banners'], getBanner);
  const {data: employeeAds} = useQuery('employee', () =>
    getAds({category_id: 1, per_page: 1000}),
  );
  const {data: offerAds} = useQuery('offerAds', () =>
    getAds({category_id: 17, per_page: 1000}),
  );
  const {data: estateAds} = useQuery('ads', () => getAds({per_page: 1000}));

  const onPressMore = (mainCategory: {
    title?: string;
    id?: number;
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

  firebase
    .app()
    .database(
      'https://mahem-45019-default-rtdb.europe-west1.firebasedatabase.app/',
    )
    .ref();

  console.log(estateAds, 'estateAds?.data?.ads');

  const SeparatorComponent = () => <View style={{width: 8}} />;
  return (
    <Screen withoutScroll>
      <MainHeader showLocation={true} title={''} showNews={true} />
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <ImageSlider
          images={data?.data?.map((item: any) => ({
            uri: item?.imageDetail?.path,
            link: item.link,
          }))}
        />
        {employeeAds?.data?.ads?.filter(
          (item: any) => item?.city?.id === user?.cityId,
        )?.length > 0 && (
          <RowCategories
            onPressMore={() => onPressMore({title: 'استخدامی', id: 1})}
            title={translate('hiring')}
            showMoreLabel={translate('listContinue')}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={SeparatorComponent}
              data={employeeAds?.data?.ads
                ?.filter((item: any) => item?.city?.id === user?.cityId)
                ?.slice(0, 5)}
              ListHeaderComponent={<View style={{width: 4}} />}
              ListFooterComponent={<View style={{width: 4}} />}
              renderItem={({item}) => (
                <GridProduct product={item} onPress={() => handlePress(item)} />
              )}
            />
          </RowCategories>
        )}
        {offerAds?.data?.ads?.filter(
          (item: any) => item?.city?.id === user?.cityId,
        )?.length > 0 && (
          <RowCategories
            onPressMore={() => onPressMore({title: 'تخفیف یاب', id: 17})}
            title={translate('findingDiscount')}
            showMoreLabel={translate('listContinue')}>
            <FlatList
              horizontal
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={SeparatorComponent}
              data={offerAds?.data?.ads
                ?.filter((item: any) => item?.city?.id === user?.cityId)
                ?.slice(0, 5)}
              ListHeaderComponent={<View style={{width: 4}} />}
              ListFooterComponent={<View style={{width: 4}} />}
              inverted
              renderItem={({item}) => (
                <GridProduct product={item} onPress={() => handlePress(item)} />
              )}
            />
          </RowCategories>
        )}
        {estateAds?.data?.ads?.filter(
          (item: {city: {id: string | undefined}}) =>
            item?.city?.id === user?.cityId,
        )?.length > 0 && (
          <RowCategories
            onPressMore={() => onPressMore({title: 'کل آگهی ها', allAds: true})}
            title={translate('ads')}
            showMoreLabel={translate('listContinue')}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={SeparatorComponent}
              data={estateAds?.data?.ads
                ?.filter((item: any) => item?.city?.id === user?.cityId)
                ?.slice(0, 5)}
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
