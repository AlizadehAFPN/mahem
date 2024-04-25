import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MainHeader, Screen, Row, Text, UnderlineTextField, Divider, SelectAdsCategory, RowProduct, Button } from '../../components'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'
import { useNavigation } from '@react-navigation/native'
import { useInfiniteQuery } from 'react-query'
import { getAds } from '../../services'
import { useDispatch, useSelector } from 'react-redux'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { setFilters } from '../../stateManager/reducers/filters'
export function SearchScreen() {
  const { navigate } = useNavigation()
  const dispatch = useDispatch()
  const [state, setState] = useState({
    mainCategory: '',
    subCategory: '',
    subsubCategory: "",
    selectCategoryModal: false,
    searchText: ''
  })
  const { mainCategory, subCategory, subsubCategory } = useSelector(s => s.filter)
  const [ads, setAds] = useState([])
  const {
    data,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["ads", state.searchText, mainCategory, subCategory, subsubCategory],
    queryFn: ({ pageParam = 1, }) => getAds({ page: pageParam, keyword: state.searchText, category_id: subsubCategory?subsubCategory.id: subCategory? subCategory.id: mainCategory? mainCategory?.id: undefined }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      if (lastPage?.data?.pagination?.current_page < lastPage?.data?.pagination?.total_pages) {
        return lastPage?.data?.pagination?.current_page + 1
      } else {
        return undefined
      }
    },
    getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
  })

  const onEndReached = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  useEffect(() => {
    const flatenData = data?.pages?.flatMap(page => page?.data?.ads)
    setAds(flatenData)
  }, [data])
  const onRemoveFilter = ()=>{
    dispatch(setFilters({mainCategory: undefined, subCategory:undefined, subsubCategory: undefined}))
  }
  const onRemoveFilterSub = ()=>{
    dispatch(setFilters({ subCategory:undefined, subsubCategory: undefined}))
  }
  const onRemoveFilterSubSub = ()=>{
    dispatch(setFilters({ subsubCategory: undefined}))
  }
  return (
    <Screen withoutScroll>
      <MainHeader title={mainCategory?.title} showLocation={true} />
      <FlatList
        onEndReached={onEndReached}
        data={ads}
        style={{ paddingHorizontal: 4, paddingVertical: 8 }}
        ItemSeparatorComponent={<View style={{ height: 4 }} />}
        renderItem={({ item }) => <RowProduct
          product={item}
          onPress={() => navigate("singleProduct", { ads: item })}
        />}
        ListHeaderComponent={<>
          <Row style={{ paddingHorizontal: 8, paddingVertical: 10 }} >
            <Ionicons size={25} name="search" />
            <View style={{ flex: 1 }}>
              <UnderlineTextField
                style={{ flex: 1 }}
                placeholder="جست جو برای"
                onChangeText={text => setState(s => ({ ...s, searchText: text }))}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigate("filter")}
            // onPress={() => setState(s => ({ ...s, selectCategoryModal: true }))}
            >
              <Feather size={25} name="filter" style={{ transform: [{ rotateY: '180deg' }] }} />
            </TouchableOpacity>
          </Row>
          <Row>
            {mainCategory && <View style={styles.badge}>
              <Button onPress={onRemoveFilter}><AntDesign size={20} style={{marginRight: 5}} name="closecircleo" /></Button>
              <Text>{mainCategory.title}</Text>

            </View>}
            {subCategory && <View style={styles.badge}>
              <Button onPress={onRemoveFilterSub}><AntDesign size={20} style={{marginRight: 5}} name="closecircleo" /></Button>
              <Text>{subCategory.title}</Text>

            </View>}
            {subsubCategory && <View style={styles.badge}>
              <Button onPress={onRemoveFilterSubSub}><AntDesign size={20} style={{marginRight: 5}} name="closecircleo" /></Button>
              <Text>{subsubCategory.title}</Text>

            </View>}
          </Row>
        </>}
        ListFooterComponent={<Divider height={40} />}
      />
      <SelectAdsCategory
        showTitle={false}
        onSelect={(m, sc, ssc) => setState(s => ({ ...s, mainCategory: m, subCategory: sc, subsubCategory: ssc }))}
        onClose={() => setState(s => ({ ...s, selectCategoryModal: false }))}
        visible={state.selectCategoryModal}
      />

    </Screen>
  )
}

const styles = StyleSheet.create({
  badge: {
    height: 30,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 5,
    flexDirection: 'row',
    marginLeft: 5
  }
})