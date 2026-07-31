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
import {colors, scaled} from '../../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {useSelector} from 'react-redux';
import {getBookmarks} from '../../../services';
import {RootState} from '../../../stateManager';

export function BookmarkScreen() {
  const {t} = useTranslation();
  const {goBack, navigate} = useNavigation<any>();
  const {data, isLoading, isError} = useQuery(['bookmarks'], getBookmarks);
  const bookmarks = data?.data;
  const user = useSelector((s: RootState) => s.user);
  return (
    <Screen withoutScroll>
      <Row style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <MaterialIcons
            size={scaled(25)}
            color="white"
            name="arrow-forward-ios"
          />
        </TouchableOpacity>
      </Row>
      <View style={styles.avatarCon}>
        <View style={styles.avatar}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={
              user?.avatar
                ? {uri: user.avatar}
                : require('../../../assets/images/logo.png')
            }
            resizeMode={user?.avatar ? 'cover' : 'contain'}
          />
        </View>
        <Text size={20}>{t('bookmark.title')}</Text>
      </View>

      <FlatList
        data={bookmarks}
        style={{paddingHorizontal: scaled(4)}}
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
            emptyMessage={t('bookmark.empty')}
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
    height: scaled(77),
    backgroundColor: colors.main,
  },
  avatarCon: {
    height: scaled(83),
    backgroundColor: colors.pallete.gray1,
    alignItems: 'center',
  },
  avatar: {
    height: scaled(94),
    width: scaled(94),
    borderRadius: scaled(50),
    marginTop: scaled(-47),
    overflow: 'hidden',
    borderWidth: 1,
  },
  absButtons: {
    position: 'absolute',
    bottom: scaled(20),
    right: scaled(20),
  },
  circle: {
    height: scaled(50),
    width: scaled(50),
    borderRadius: scaled(50),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
