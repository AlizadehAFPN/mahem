import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import React from 'react';
import {MainHeader, Screen, Text} from '../../components';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from 'react-query';
import {setFilters} from '../../stateManager/reducers/filters';
import {removeUser} from '../../stateManager/reducers/user';
import {RootState} from '../../stateManager';
import {getAdsCategories} from '../../services';
const {width} = Dimensions.get('window');

export function MenuScreen() {
  const {navigate} = useNavigation();
  const user = useSelector((s: RootState) => s.user);
  const {data: categoriesData} = useQuery(['adsCategories'], getAdsCategories);

  const menu = [
    {
      title: 'بانک مشاغل',
      icon: require('../../assets/images/icons/jobsBank.png'),
      name: 'jobsBank',
    },
    {
      title: 'تخفیف یاب',
      icon: require('../../assets/images/icons/offerfinder.png'),
      name: 'offerDetection',
    },
    {
      title: user?.username + ' خوش آمدید',
      icon: require('../../assets/images/icons/novinfar.png'),
    },
    {
      title: 'قوانین',
      icon: require('../../assets/images/icons/tearms.png'),
      name: 'privacy',
    },
    {
      title: 'آگهی ها',
      icon: require('../../assets/images/icons/ads.png'),
      name: 'search',
    },
    {
      title: 'استخدامی',
      icon: require('../../assets/images/icons/employee.png'),
      name: 'search',
      // Resolved lazily in handlePressItem (categoriesData isn't ready on
      // first render) — see the isJobsShortcut branch there.
      isJobsShortcut: true,
    },
    {
      title: 'مدیریت آگهی ها',
      icon: require('../../assets/images/icons/adsmanagment.png'),
      name: 'userpanel',
    },
    {
      title: 'اشتراک گزاری',
      icon: require('../../assets/images/icons/sharing.png'),
      name: 'share',
    },
    {
      title: 'آگهی نشان شده',
      icon: require('../../assets/images/icons/bookmarks.png'),
      name: 'bookmark',
    },
    {
      title: 'درباره ما',
      icon: require('../../assets/images/icons/aboutus.png'),
      name: 'aboutus',
    },
    {
      title: 'تنظمیات',
      icon: require('../../assets/images/icons/settings.png'),
      name: 'settings',
    },
    {
      title: 'تماس با ما',
      icon: require('../../assets/images/icons/accountUs.png'),
      name: 'callus',
    },
  ];

  const dispatch = useDispatch();
  const handlePressItem = async (item: any) => {
    if (item?.title === 'خروج') {
      // Clearing the token flips RootNavigator from AppStack to AuthStack
      // reactively — an explicit reset() would target 'register' inside the
      // wrong stack now that navigation is split into Auth/Onboarding/App.
      dispatch(removeUser());
      return;
    }
    if (item.name) {
      if (item.name === 'share') {
        await Share.share({
          message: 'https://cafebazaar.ir/app/com.turner.asmajormayhem?l=en',
        });
        return;
      }
      if (item.title === 'آگهی ها') {
        dispatch(
          setFilters({
            mainCategory: {title: 'تمام آگهی ها'},
            subCategory: undefined,
            subSubCategory: undefined,
            allAds: true,
          }),
        );
        return navigate(item.name as never);
      }
      if (item.isJobsShortcut) {
        const jobsCategory = (categoriesData?.data ?? []).find(
          (c: any) => c.title === 'استخدامی',
        );
        dispatch(
          setFilters({
            mainCategory: jobsCategory,
            subCategory: undefined,
            subSubCategory: undefined,
            allAds: false,
          }),
        );
        return navigate(item.name as never);
      }
      navigate(item.name as never);
    }
  };
  const SeperatorComp = () => (
    <View style={{height: 8, backgroundColor: colors.pallete.gray1}} />
  );
  return (
    <Screen withoutScroll statusbarBackgroundColor={colors.main}>
      <MainHeader showLocation={true} title={''} />
      <FlatList
        data={menu}
        keyExtractor={item => item.title}
        numColumns={3}
        ListFooterComponent={<View style={styles.footer} />}
        ItemSeparatorComponent={SeperatorComp}
        renderItem={({item, index}) => (
          <TouchableOpacity
            onPress={() => handlePressItem(item)}
            key={item.title}
            style={{
              ...styles.itemContainer,
              borderLeftWidth: (index - 1) % 3 == 0 ? 8 : 0,
              borderRightWidth: (index - 1) % 3 == 0 ? 8 : 0,
              width: (index - 1) % 3 == 0 ? width / 3 + 10 : width / 3 - 5,
              height: width / 3,
            }}>
            <Image source={item.icon} />
            <Text size={15} style={{textAlign: 'center'}}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  itemContainer: {
    // width: '100%',
    // aspectRatio:1,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderColor: colors.pallete.gray1,
  },
  footer: {
    height: 30,
    borderTopWidth: 8,
    borderColor: colors.pallete.gray1,
  },
});
