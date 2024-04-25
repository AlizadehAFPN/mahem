import { View, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { MainHeader, Screen, Text } from '../../components'
import { colors } from '../../theme'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { setFilters } from '../../stateManager/reducers/filters'
const {width} = Dimensions.get('window')
const menu = [
  {title:'بانک مشاغل', icon:  require('../../assets/images/icons/jobsBank.png'), name:'jobsBank'},
  {title:'تخفیف یاب', icon: require('../../assets/images/icons/offerfinder.png'), name:'offerDetection'},
  {title:'نوین فر', icon:require('../../assets/images/icons/novinfar.png')},
  {title:'قوانین', icon:require('../../assets/images/icons/tearms.png'), name:'privacy'},
  {title:'آگهی ها', icon:require('../../assets/images/icons/ads.png'), name:"search"},
  {title:'استخدامی', icon:require('../../assets/images/icons/employee.png'), name:"search"},
  {title:'مدیریت آگهی ها', icon:require('../../assets/images/icons/adsmanagment.png'), name:'userpanel'},
  {title:'اشتراک گزاری', icon:require('../../assets/images/icons/sharing.png')},
  {title:'آگهی نشان شده', icon:require('../../assets/images/icons/bookmarks.png'), name:'bookmark'},
  {title:'درباره ما', icon:require('../../assets/images/icons/aboutus.png'), name:"aboutus"},
  {title:'تنظیمات', icon:require('../../assets/images/icons/settings.png')},
  {title:'تماس با ما', icon:require('../../assets/images/icons/accountUs.png'), name:"callus"},

]
export function MenuScreen() {
  const {navigate} = useNavigation()
  const dispatch = useDispatch()
  const handlePressItem=(item)=>{
    if(item.name){
      if(item.title==="استخدامی"){
        dispatch(setFilters({mainCategory: {title:'استخدامی', id: 1}, subCategory:undefined, subsubCategory: undefined}))
        return navigate(item.name, )
      }
      navigate(item.name)
    }
  }
  return (
    <Screen statusbarBackgroundColor={colors.main}>
      <MainHeader showLocation={true} />
      <FlatList 
        data={menu}
        keyExtractor={(item)=> item.title}
        numColumns={3}
        ListFooterComponent={<View style={styles.footer}/>}
        // columnWrapperStyle={{width: '33.333%'}}
        ItemSeparatorComponent={<View style={{height:8, backgroundColor: colors.pallete.gray1}} />}
        renderItem={({item, index})=>
        <TouchableOpacity onPress={()=> handlePressItem(item)} style={{...styles.itemContainer, borderLeftWidth: (index-1)%3 ==0? 8:0, borderRightWidth: (index-1)%3==0 ? 8:0, width: (index-1)%3==0? width/3+10: (width/3)-5, height: width/3  }}>
          <Image source={item.icon} />
          <Text size={15} style={{textAlign:'center',}}>{item.title}</Text>
        </TouchableOpacity>
      }
      />
    </Screen>
  )
}
const styles = StyleSheet.create({
  itemContainer:{
    // width: '100%',
    // aspectRatio:1,
    alignItems:'center',
    justifyContent:'space-around',
    borderColor: colors.pallete.gray1,    
  },
  footer:{
    height: 30, 
    borderTopWidth: 8, 
    borderColor: colors.pallete.gray1
  }
})