import { FlatList, ScrollView, View } from 'react-native'
import React from 'react'
import { Divider, GridProduct, ImageSlider, MainHeader, RowCategories, Screen } from '../../components'
import { colors } from '../../theme'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { getAds, getAdsCategories, getBanner } from '../../services'
import { useDispatch } from 'react-redux'
import { setFilters } from '../../stateManager/reducers/filters'
const images = [
  require('../../assets/images/slider1.png'),
  require('../../assets/images/slider2.png'),
  require('../../assets/images/slider3.png'),
  // require('../../assets/images/slider4.png')
]
const data1 = [
  require('../../assets/images/products/product1.png'),
  require('../../assets/images/products/product2.png'),
  require('../../assets/images/products/product3.png'),
  require('../../assets/images/products/product4.png')
]
const data2 = [
  require('../../assets/images/products/product6.png'),
  require('../../assets/images/products/product7.png'),
  require('../../assets/images/products/product8.png'),
  require('../../assets/images/products/product9.png')
]
const data3 = [
  require('../../assets/images/products/product10.png'),
  require('../../assets/images/products/product11.png'),
  require('../../assets/images/products/product12.png'),
  require('../../assets/images/products/product13.png')
]
export function HomeScreen() {
  const { navigate } = useNavigation()
  const dispatch = useDispatch()
  const handlePress = (item) => {
    navigate('singleProduct', {ads: item})
  }
  const {data, } = useQuery(["banners"], getBanner)
  const {data: employeeAds} = useQuery('employee', ()=>getAds({category_id: 1}))
  const {data: offerAds} = useQuery('offerAds', ()=>getAds({category_id: 17}))
  const {data: estateAds} = useQuery('estateAds', ()=> getAds({category_id: 35}))
  
  const onPressMore = (mainCategory)=>{
    dispatch(setFilters({mainCategory, subCategory: undefined, subSubCategory: undefined}))
    navigate("search")
  }
  return (
    <Screen withoutScroll >
      <MainHeader showLocation={true}  />
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}  >
        <ImageSlider images={data?.data?.map(item=> ({uri: item?.imageDetail?.path, link: item.link}))} />
        {employeeAds?.data?.ads?.length>0&& <RowCategories onPressMore={()=> onPressMore({title: "استخدامی", id:1})}  title="استخدامی" showMoreLabel="ادامه لیست">
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={<View style={{ width: 8 }} />}
            data={employeeAds?.data?.ads}
            ListHeaderComponent={<View style={{ width: 4 }} />}
            ListFooterComponent={<View style={{ width: 4 }} />}
            inverted
            renderItem={({ item }) =>
              <GridProduct
                product={item}
                onPress={()=> handlePress(item)}
              />}
          />
        </RowCategories>}
        {offerAds?.data?.ads?.length>0&& <RowCategories onPressMore={()=> onPressMore({title: "تخفیف یاب", id:17})} title="تخفیف یاب" showMoreLabel="ادامه لیست">
          <FlatList
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={<View style={{ width: 8 }} />}
            data={offerAds?.data?.ads}
            ListHeaderComponent={<View style={{ width: 4 }} />}
            ListFooterComponent={<View style={{ width: 4 }} />}
            inverted
            renderItem={({ item }) =>
              <GridProduct
                product={item}
                onPress={()=> handlePress(item)}
              />}
          />
        </RowCategories>}
        {estateAds?.data?.ads?.length>0&&<RowCategories onPressMore={()=> onPressMore()} title="آگهی" showMoreLabel="ادامه لیست">
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={<View style={{ width: 8 }} />}
            data={estateAds?.data?.ads}
            ListHeaderComponent={<View style={{ width: 4 }} />}
            ListFooterComponent={<View style={{ width: 4 }} />}
            inverted
            renderItem={({ item }) =>
              <GridProduct
                product={item}
                onPress={()=> handlePress(item)}
              />
            }
          />
        </RowCategories>}
      </ScrollView>
    </Screen>
  )
}