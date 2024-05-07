import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {Screen, Row, Text, Divider, RowProduct} from '../../../components';
import {colors} from '../../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useSelector} from 'react-redux';
const ads = [
  {
    title: 'استخدام منشی',
    time: '',
    img: require('../../../assets/images/products/ads1.png'),
  },
  {
    title: 'استخدام منشی',
    time: '',
    img: require('../../../assets/images/products/ads2.png'),
  },
  {
    title: 'استخدام منشی',
    time: '',
    img: require('../../../assets/images/products/ads3.png'),
  },
  {
    title: 'استخدام منشی',
    time: '',
    img: require('../../../assets/images/products/ads4.png'),
  },
];
export function BookmarkScreen() {
  const [state, setState] = useState({
    adsMode: true,
  });
  const {bookmarks} = useSelector(s => s.user);
  const {goBack, navigate} = useNavigation();
  return (
    <Screen withoutScroll>
      <Row style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <MaterialIcons size={25} color="white" name="arrow-forward-ios" />
        </TouchableOpacity>
      </Row>
      <View style={styles.avatarCon}>
        <View style={styles.avatar}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={require('../../../assets/images/userav1.png')}
          />
        </View>
        <Text size={20}>پنل نشان شده کاربر</Text>
      </View>

      <FlatList
        data={bookmarks}
        style={{paddingHorizontal: 4}}
        ItemSeparatorComponent={<Divider height={8} />}
        renderItem={({item}) => (
          <RowProduct
            onPress={() => navigate('singleProduct', {ads: item})}
            product={item}
          />
        )}
        ListHeaderComponent={<Divider height={10} />}
        ListFooterComponent={<Divider height={120} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 77,
    backgroundColor: colors.main,
  },
  avatarCon: {
    height: 83,
    backgroundColor: colors.pallete.gray1,
    alignItems: 'center',
  },
  avatar: {
    height: 94,
    width: 94,
    borderRadius: 50,
    marginTop: -47,
    overflow: 'hidden',
    borderWidth: 1,
  },
  absButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  circle: {
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
