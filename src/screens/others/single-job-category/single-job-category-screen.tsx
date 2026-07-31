import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {
  Divider,
  ListFooter,
  ListState,
  Row,
  Screen,
  TableRow,
  Text,
  TextField,
} from '../../../components';
import {colors, scaled} from '../../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import {getAllJobs} from '../../../services/job';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {useDebouncedValue} from '../../../hooks/use-debounced-value';
import {getJobCategoryIcon} from '../../../utiles';
import {localizeCategory} from '../../../i18n/display-maps';

const {width} = Dimensions.get('window');
export function SingleJobCategoryScreen() {
  const {t} = useTranslation();
  const {goBack, navigate} = useNavigation<any>();
  const {params} = useRoute<any>();
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebouncedValue(searchText);
  const [category] = useState(params?.category);
  const {
    items: jobs,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['categoryJobs', params?.category?.id, debouncedSearchText],
    queryFn: ({pageParam = 1}) =>
      getAllJobs({
        page: pageParam,
        categoryId: params?.category?.id,
        search: debouncedSearchText || undefined,
      }),
    selectItems: page => page?.data?.jobs,
  });
  const handlePressItem = (item: any) => {
    navigate('singleJob', {job: item});
  };

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <View style={styles.headerCard}>
        <TouchableOpacity
          onPress={goBack}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={scaled(26)}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <Image
          style={{width: '80%', height: '80%'}}
          source={getJobCategoryIcon(category?.title)}
        />
      </View>
      <View style={styles.titleBar}>
        <Text style={{textAlign: 'right'}} size={17}>
          {localizeCategory(category?.title)}
        </Text>
        <Divider height={12} />
        <Row
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Fontisto
            size={scaled(20)}
            name="search"
            color={colors.pallete.gray2}
          />
          <TextField
            onChangeText={text => setSearchText(text)}
            inputStyle={{padding: 0, fontSize: scaled(12), textAlign: 'right'}}
            style={{flex: 1, height: scaled(20), width: width - 162}}
            placeholder={t('jobs.searchPlaceholder')}
            preset="underline"
            borderColor={colors.pallete.red2}
          />
        </Row>
      </View>
      <FlatList
        onEndReached={onEndReached}
        style={{paddingTop: scaled(4)}}
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage={t('jobs.noResults')}
          />
        }
        data={jobs}
        keyExtractor={item => item?.id}
        renderItem={({item, index}) => {
          return (
            <TableRow
              onPress={() => handlePressItem(item)}
              key={item?.id}
              item={[index, item?.title, item?.manager, item?.phone]}
            />
          );
        }}
        ListHeaderComponent={
          <TableRow
            header
            item={[
              t('jobs.colRow'),
              t('jobs.unitName'),
              t('jobs.manager'),
              t('jobs.colPhone'),
            ]}
          />
        }
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemCount={jobs.length}
          />
        }
      />
      <View style={styles.addContainer}>
        <TouchableOpacity
          style={styles.circle}
          onPress={() => navigate('createJob', {category})}>
          <Entypo name="plus" color="white" size={scaled(30)} />
        </TouchableOpacity>
        <Divider height={8} />
        <TouchableOpacity
          style={styles.circle}
          onPress={() => navigate('createJobHelper')}>
          <Image
            source={require('../../../assets/images/headphone.png')}
            style={{width: scaled(26), height: scaled(26)}}
          />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    height: scaled(75),
    backgroundColor: colors.main,
    // Back arrow sits in the red band (like MainHeader's), not in the gray
    // title bar. Native layout is LTR, so flex-end puts it on the right.
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: scaled(10),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: scaled(94),
    height: scaled(94),
    borderRadius: scaled(50),
    position: 'absolute',
    left: scaled(30),
    top: scaled(19),
    zIndex: 1000001,
    backgroundColor: colors.pallete.gray1,
    borderWidth: 1,
  },
  titleBar: {
    backgroundColor: colors.pallete.gray1,
    paddingHorizontal: scaled(16),
    paddingVertical: scaled(8),
    paddingLeft: scaled(126),
  },
  addContainer: {
    position: 'absolute',
    bottom: scaled(8),
    right: scaled(20),
    zIndex: 100001,
  },
  circle: {
    width: scaled(47),
    height: scaled(47),
    borderRadius: scaled(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
