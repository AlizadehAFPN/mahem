import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  Button,
  Divider,
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
import {useNavigation, useRoute} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import {getAllJobs} from '../../../services/job';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {getJobCategoryIcon} from '../../../utiles';

const {width} = Dimensions.get('window');
export function SingleJobCategoryScreen() {
  const {goBack, navigate} = useNavigation();
  const {params} = useRoute();
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState(params?.category);
  const {
    items: jobs,
    isLoading,
    isError,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['categoryJobs', params?.category?.id],
    queryFn: ({pageParam = 1}) =>
      getAllJobs({page: pageParam, categoryId: params?.category?.id}),
    selectItems: page => page?.data?.jobs,
  });
  const handlePressItem = item => {
    navigate('singleJob', {job: item});
  };

  const result = useMemo(() => {
    if (searchText) {
      return jobs.filter(item =>
        JSON.stringify(item).includes(searchText.toLowerCase()),
      );
    }
    return jobs;
  }, [jobs, searchText]);

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
        <Text style={{textAlign: 'center'}} size={17}>
          {category?.title}
        </Text>
        <Divider />
        <Row
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Button onPress={goBack}>
            <MaterialIcons size={25} name="keyboard-arrow-right" />
          </Button>
          <TextField
            onChangeText={text => setSearchText(text)}
            inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            style={{flex: 1, height: 20, width: width - 172}}
            placeholder="جستجو برای"
            preset="underline"
            borderColor={colors.pallete.red2}
          />
          <Fontisto size={25} name="search" />
        </Row>
      </View>
      <FlatList
        onEndReached={onEndReached}
        style={{paddingTop: 4}}
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage="هیچ موردی پیدا نشد"
          />
        }
        data={result}
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
          <TableRow header item={['ردیف', 'نام واحد', 'مدیریت', 'تلفن']} />
        }
        ListFooterComponent={<Divider height={40} />}
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
