import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import React from 'react';
import {
  Screen,
  Row,
  Text,
  Divider,
  RowProduct,
  ListState,
} from '../../../components';
import {colors} from '../../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {getBookmarks} from '../../../services';

export function BookmarkScreen() {
  const {goBack, navigate} = useNavigation();
  const {data, isLoading, isError} = useQuery(['bookmarks'], getBookmarks);
  const bookmarks = data?.data;
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
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage="هنوز آگهی‌ای نشان نکرده‌اید"
          />
        }
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
