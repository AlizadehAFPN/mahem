import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {MainHeader, Screen, Text} from '../../components';
import {colors, scaled} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {setFilters} from '../../stateManager/reducers/filters';
import {removeUser} from '../../stateManager/reducers/user';
import {RootState} from '../../stateManager';
import {useAdsCategories} from '../../hooks/use-cached-categories';
import {SocialShare} from '../../components/social-share/social-share';
import {APP_STORE_URL} from '../../navigation/deep-links';
const {width} = Dimensions.get('window');

export function MenuScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const user = useSelector((s: RootState) => s.user);
  const {data: categoriesData} = useAdsCategories();

  const menu = [
    {
      title: t('home.jobsBank'),
      icon: require('../../assets/images/icons/jobsBank.png'),
      name: 'jobsBank',
    },
    {
      title: t('home.discountFinder'),
      icon: require('../../assets/images/icons/offerfinder.png'),
      name: 'offerDetection',
    },
    {
      title: t('menu.welcome', {username: user?.username ?? ''}),
      icon: require('../../assets/images/icons/novinfar.png'),
    },
    {
      title: t('menu.rules'),
      icon: require('../../assets/images/icons/tearms.png'),
      name: 'privacy',
    },
    {
      title: t('home.ads'),
      icon: require('../../assets/images/icons/ads.png'),
      name: 'search',
      // Distinguishes this "all ads" shortcut from the استخدامی one below
      // (both navigate to `search`) without relying on the display title,
      // which changes with the app language.
      isAllAdsShortcut: true,
    },
    {
      title: t('home.hiring'),
      icon: require('../../assets/images/icons/employee.png'),
      name: 'search',
      // Resolved lazily in handlePressItem (categoriesData isn't ready on
      // first render) — see the isJobsShortcut branch there.
      isJobsShortcut: true,
    },
    {
      title: t('menu.manageAds'),
      icon: require('../../assets/images/icons/adsmanagment.png'),
      name: 'userpanel',
    },
    {
      title: t('menu.share'),
      icon: require('../../assets/images/icons/sharing.png'),
      name: 'share',
    },
    {
      title: t('menu.bookmarks'),
      icon: require('../../assets/images/icons/bookmarks.png'),
      name: 'bookmark',
    },
    {
      title: t('menu.aboutUs'),
      icon: require('../../assets/images/icons/aboutus.png'),
      name: 'aboutus',
    },
    {
      title: t('settings.title'),
      icon: require('../../assets/images/icons/settings.png'),
      name: 'settings',
    },
    {
      title: t('menu.contactUs'),
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
        // Was a hardcoded Cafe Bazaar URL for `com.turner.asmajormayhem` — an
        // unrelated game left over from the template — so "معرفی به دوستان"
        // sent every user's friends to someone else's app. There is no store
        // listing to point at yet; APP_STORE_URL is the single place to add
        // one, and until it has a value the share is just the description.
        await SocialShare({
          message: t('menu.shareAppMessage'),
          link: APP_STORE_URL || undefined,
          dialogTitle: t('common.appName'),
        });
        return;
      }
      if (item.isAllAdsShortcut) {
        dispatch(
          setFilters({
            mainCategory: {title: t('menu.allAdsCategory')},
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
    <View style={{height: scaled(8), backgroundColor: colors.pallete.gray1}} />
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
    height: scaled(30),
    borderTopWidth: 8,
    borderColor: colors.pallete.gray1,
  },
});
