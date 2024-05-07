import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  NativeModules,
  Share,
} from 'react-native';
import React from 'react';
import {MainHeader, Screen, Text} from '../../components';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {setFilters} from '../../stateManager/reducers/filters';
import {removeUser} from '../../stateManager/reducers/user';
import {RootState} from '../../stateManager';
const {width} = Dimensions.get('window');

export function MenuScreen() {
  const {navigate} = useNavigation();
  const user = useSelector((s: RootState) => s.user);

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
      dispatch(removeUser());
      setTimeout(() => {
        NativeModules.DevSettings.reload();
      }, 200);
    }
    if (item.name) {
      if (item.title === 'استخدامی') {
        dispatch(
          setFilters({
            mainCategory: {title: 'استخدامی', id: 1},
            subCategory: undefined,
            subsubCategory: undefined,
          }),
        );
        return navigate(item.name as never);
      }
      if (item.name === 'share') {
        await Share.share({
          message: 'https://cafebazaar.ir/app/com.turner.asmajormayhem?l=en',
        });
        return;
      }
      if (item.title === 'استخدامی') {
        dispatch(
          setFilters({
            mainCategory: {title: 'استخدامی', id: 1},
            subCategory: undefined,
            subsubCategory: undefined,
          }),
        );
        return navigate(item.name as never);
      }
      if (item.title === 'آگهی ها') {
        dispatch(
          setFilters({
            mainCategory: {title: 'تمام آگهی ها'},
            subCategory: undefined,
            subsubCategory: undefined,
            allAds: true,
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
