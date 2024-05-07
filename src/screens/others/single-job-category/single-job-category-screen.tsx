import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Button,
  Divider,
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
import {useInfiniteQuery, useQuery} from 'react-query';
import {getAllJobs} from '../../../services/job';

// const data = [
//     { title: 'داروخانه ماهم', manager: 'خانم ماهم نوین فر', phone: '3352522222' },
//     { title: 'مطب ماهم', manager: 'خانم نوین فر', phone: '3352522222' }
// ]
const {width} = Dimensions.get('window');
export function SingleJobCategoryScreen() {
  const {goBack, navigate} = useNavigation();
  const {params} = useRoute();
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState(params?.category);
  const [jobs, setJobs] = useState([]);
  //   const {data} = useQuery(['categoryJobs'], getAllJobs);
  const {data, fetchNextPage, hasNextPage, isLoading} = useInfiniteQuery({
    queryKey: [`categoryJobs-${params?.category?.id}`, params?.category?.id],
    queryFn: ({pageParam = 1}) =>
      getAllJobs({page: pageParam, category_id: params?.category?.id}),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      if (
        lastPage?.data?.pagination?.current_page <
        lastPage?.data?.pagination?.total_pages
      ) {
        return lastPage?.data?.pagination?.current_page + 1;
      } else {
        return undefined;
      }
    },
    getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
  });
  //   const getData = useCallback(() => {
  //     let temp = data;
  //     if (data.length < 10) {
  //       for (var i = 0; temp.length < 20; i++) {
  //         temp.push({title: '', manager: '', phone: ''});
  //       }
  //     }
  //     return temp;
  //   }, [data]);
  const handlePressItem = item => {
    navigate('singleJob', {job: item});
  };

  const onEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const flatenData = data?.pages?.flatMap(page => page?.data?.jobs);
    setJobs(flatenData);
  }, [data]);

  const result = useMemo(() => {
    if (searchText) {
      return jobs.filter(item =>
        JSON.stringify(item).includes(searchText.toLowerCase()),
      );
    }
    return jobs?.filter(
      item => item?.job_category_id?.id === params?.category?.id,
    );
  }, [jobs, searchText]);

  console.log(result?.length);

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <View style={styles.headerCard}></View>
      <View style={styles.iconContainer}>
        <Image
          style={{width: '80%', height: '80%'}}
          source={{uri: category?.logo}}
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
          <Text style={{textAlign: 'center', marginTop: 16, color: 'red'}}>
            {result?.length === 0 && isLoading == false && 'هیچ موردی پیدا نشد'}
          </Text>
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
          onPress={() => navigate('createJob')}>
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
