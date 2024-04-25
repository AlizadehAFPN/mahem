
import { FlatList, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MainHeader, Screen, Row, Text, UnderlineTextField, Divider, SelectAdsCategory, RowProduct } from '../../components'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'
import { useNavigation } from '@react-navigation/native'
import { useInfiniteQuery } from 'react-query'
import { getAds } from '../../services'
const ads = [
  { title: 'استخدام منشی', time: '', img: require("../../assets/images/products/ads1.png") },
  { title: 'استخدام منشی', time: '', img: require("../../assets/images/products/ads2.png") },
  { title: 'استخدام منشی', time: '', img: require("../../assets/images/products/ads3.png") },
  { title: 'استخدام منشی', time: '', img: require("../../assets/images/products/ads4.png") },
]
export function EmployeeScreen() {
  const { navigate, goBack} = useNavigation()
  const [state, setState] = useState({
    mainCategory: '',
    subCategory: '',
    subsubCategory: "",
    selectCategoryModal: true,
    searchText:''
  })
  const [ads, setAds] = useState([])
  const {
    data,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["ads", state.searchText, state.mainCategory],
    queryFn: ({ pageParam = 1, }) => getAds({page: pageParam, keyword: state.searchText, category_id: state.mainCategory?.id}),
    getNextPageParam: (lastPage, allPages) => {
        if (!lastPage) return undefined;
        if(lastPage?.data?.pagination?.current_page< lastPage?.data?.pagination?.total_pages){
            return lastPage?.data?.pagination?.current_page + 1
        }else{
            return undefined
        }
    },
    getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
  })

const onEndReached = ()=>{
    if(hasNextPage){
        fetchNextPage()
    }
}

useEffect(()=>{
    const flatenData = data?.pages?.flatMap(page=> page?.data?.ads)
    setAds(flatenData)
}, [data])
  return (
    <Screen withoutScroll>
      <MainHeader showLocation={true} />
      <FlatList
        data={ads}
        style={{ paddingHorizontal: 4, paddingVertical: 8 }}
        ItemSeparatorComponent={<View style={{ height: 4 }} />}
        renderItem={({ item }) => <RowProduct
          product={item}
          onPress={() => navigate("singleProduct")}
        />}
        ListHeaderComponent={<Row style={{ paddingHorizontal: 8, paddingVertical: 10 }} >
          <Ionicons size={25} name="search" />
          <View style={{ flex: 1 }}>
            <UnderlineTextField
              style={{ flex: 1 }}
              placeholder="جست جو برای"
              onChangeText= {text=> setState(s=>({...s, searchText: text}))}
            />
          </View>
          <TouchableOpacity onPress={() => setState(s => ({ ...s, selectCategoryModal: true }))}>
            <Feather size={25} name="filter" style={{ transform: [{ rotateY: '180deg' }] }} />
          </TouchableOpacity>
        </Row>}
        ListFooterComponent={<Divider height={40} />}
      />
      <SelectAdsCategory
        showTitle={false}
        onRequestClose={()=>{
          setState(s => ({ ...s, selectCategoryModal: false }))
          navigate("home")
        } }
        onSelect={(m, sc, ssc) => setState(s => ({ ...s, mainCategory: m, subCategory: sc, subsubCategory: ssc }))}
        onClose={() => setState(s => ({ ...s, selectCategoryModal: false }))}
        visible={state.selectCategoryModal}
      />

    </Screen>
  )
}

