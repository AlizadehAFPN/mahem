import {Dimensions, FlatList, StyleSheet, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {
  ListFooter,
  ListState,
  MainHeader,
  Row,
  Screen,
  TableRow,
  TextField,
} from '../../../components';
import {colors, scaled} from '../../../theme';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {getAllJobs} from '../../../services/job';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
import {useDebouncedValue} from '../../../hooks/use-debounced-value';
import {useBrowseCity} from '../../../hooks/use-browse-city';

const {width} = Dimensions.get('window');

// "همه موارد" tile in the Jobs Bank grid (JobsBankScreen) — the entire job
// bank of the account's currently-selected city, with no صنف/category filter.
// Kept as its own screen (rather than reusing SingleJobCategoryScreen with an
// empty category) because it scopes by cityId — which the per-category screen
// deliberately does not — so the header's city switcher (MainHeader
// showLocation) re-scopes the list live, and because this view is expected to
// grow heavier filters/sorting later. Performance-wise it's the same
// backend-paginated FlatList every list screen uses (usePaginatedList +
// onEndReached), just tuned for a potentially very long list.
export function AllJobsScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const {cityIdParam: browseCityId, cityKey: browseCityKey} = useBrowseCity();
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebouncedValue(searchText);

  const {
    items: jobs,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    onEndReached,
  } = usePaginatedList({
    queryKey: ['allCityJobs', browseCityKey, debouncedSearchText],
    queryFn: ({pageParam = 1}) =>
      getAllJobs({
        page: pageParam,
        cityId: browseCityId,
        search: debouncedSearchText || undefined,
      }),
    selectItems: page => page?.data?.jobs,
  });

  const renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => (
      <TableRow
        onPress={() => navigate('singleJob', {job: item})}
        item={[index + 1, item?.title, item?.manager, item?.phone]}
      />
    ),
    [navigate],
  );

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader showLocation showBack title={t('home.jobsBank')} />
      <View style={styles.searchBar}>
        <Row style={{alignItems: 'center'}}>
          <Fontisto
            size={scaled(20)}
            name="search"
            color={colors.pallete.gray2}
          />
          <TextField
            onChangeText={setSearchText}
            inputStyle={{padding: 0, fontSize: scaled(12), textAlign: 'right'}}
            style={{
              flex: 1,
              height: scaled(20),
              marginHorizontal: scaled(8),
              width: width - 72,
            }}
            placeholder={t('jobs.searchPlaceholder')}
            preset="underline"
            borderColor={colors.pallete.red2}
          />
        </Row>
      </View>
      <FlatList
        data={jobs}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        keyExtractor={item => String(item?.id)}
        style={{paddingTop: scaled(4)}}
        removeClippedSubviews
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={11}
        renderItem={renderItem}
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
        ListEmptyComponent={
          <ListState
            isLoading={isLoading}
            isError={isError}
            emptyMessage={t('jobs.noResults')}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: colors.pallete.gray1,
    paddingHorizontal: scaled(16),
    paddingVertical: scaled(10),
  },
});
