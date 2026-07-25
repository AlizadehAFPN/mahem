import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {
  Button,
  Divider,
  ListFooter,
  ListState,
  Row,
  Screen,
  TableRow,
  Text,
  TextField,
} from '../../../components';
import {colors} from '../../../theme';
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
  const {goBack, navigate} = useNavigation();
  const {params} = useRoute();
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebouncedValue(searchText);
  const [category, setCategory] = useState(params?.category);
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
  const handlePressItem = item => {
    navigate('singleJob', {job: item});
  };

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <View style={styles.headerCard} />
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
          <Fontisto size={20} name="search" color={colors.pallete.gray2} />
          <TextField
            onChangeText={text => setSearchText(text)}
            inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            style={{flex: 1, height: 20, width: width - 172}}
            placeholder={t('jobs.searchPlaceholder')}
            preset="underline"
            borderColor={colors.pallete.red2}
          />
          <Button onPress={goBack}>
            <MaterialIcons
              style={{transform: [{rotate: '-90deg'}]}}
              size={22}
              name="keyboard-arrow-down"
              color={colors.pallete.gray2}
            />
          </Button>
        </Row>
      </View>
      <FlatList
        onEndReached={onEndReached}
        style={{paddingTop: 4}}
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
          <Entypo name="plus" color="white" size={30} />
        </TouchableOpacity>
        <Divider height={8} />
        <TouchableOpacity
          style={styles.circle}
          onPress={() => navigate('createJobHelper')}>
          <Image source={require('../../../assets/images/headphone.png')} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    height: 75,
    backgroundColor: colors.main,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 94,
    height: 94,
    borderRadius: 50,
    position: 'absolute',
    left: 30,
    top: 19,
    zIndex: 1000001,
    backgroundColor: colors.pallete.gray1,
    borderWidth: 1,
  },
  titleBar: {
    backgroundColor: colors.pallete.gray1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingLeft: 126,
  },
  addContainer: {
    position: 'absolute',
    bottom: 8,
    right: 20,
    zIndex: 100001,
  },
  circle: {
    width: 47,
    height: 47,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
