import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {
    Divider,
    MainHeader,
    Screen,
    Text
} from '../../components'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { getJobsCategories } from '../../services/job'

const { width } = Dimensions.get('window')
const menu = [
    { title: "بهداشت و درمان", icon:require("../../assets/images/icons/health.png"), name: '' },
    { title: "بازرگانی و تجارت", icon:require("../../assets/images/icons/bazargani.png"), name: '' },
    { title: "اتومبیل", icon:require("../../assets/images/icons/auto.png"), name: '' },
    { title: "آرایش و پیرایش", icon:require("../../assets/images/icons/beauti.png"), name: '' },
    { title: "مراکز تحصیلی", icon:require("../../assets/images/icons/education.png"), name: '' },
    { title: "آموزشگاه هنری", icon:require("../../assets/images/icons/artlearning.png"), name: '' },
    { title: "آموزشگاه ورزشی", icon:require("../../assets/images/icons/sportlearning.png"), name: '' },
    { title: "آموزش و پژوهش", icon:require("../../assets/images/icons/learning.png"), name: '' },
    { title: "خدمات مجلس", icon:require("../../assets/images/icons/majlesi.png"), name: '' },
    { title: "کامپیوتر و موبایل", icon:require("../../assets/images/icons/it.png"), name: '' },
    { title: "جواهرات و بدلیجات", icon:require("../../assets/images/icons/javaherat.png"), name: '' },
    { title: "پوشاک", icon:require("../../assets/images/icons/clouth.png"), name: '' },
    { title: "ساختمان", icon:require("../../assets/images/icons/building.png"), name: '' },
    { title: "کشاورزی دامپروری", icon:require("../../assets/images/icons/agriculture.png"), name: '' },
    { title: "خدمات اجتماعی", icon:require("../../assets/images/icons/social.png"), name: '' },
    { title: "چاپ و تبلیغات", icon:require("../../assets/images/icons/advertisment.png"), name: '' },
    { title: "سایر خدمات", icon:require("../../assets/images/icons/other.png"), name: '' },
    { title: "صنعت", icon:require("../../assets/images/icons/sanat.png"), name: '' },
    { title: "صنایع غذایی", icon:require("../../assets/images/icons/foods.png"), name: '' },
    { title: "دکوراسیون داخلی", icon:require("../../assets/images/icons/decor.png"), name: '' },
]
export function JobsBankScreen() {
    const {navigate} = useNavigation()
    const {data} = useQuery([`jobBank`], getJobsCategories)

    const handleNavigation = (item)=>{
        navigate("singleJobCategory", {category: item })
    }
    return (
        <Screen >
            <MainHeader
                showLocation={true}
            />
            <Divider />
            <FlatList
                data={data?.data||[]}
                numColumns={4}
                ItemSeparatorComponent={<View style={{ height: 8 }} />}
                renderItem={({ item, index }) =>
                    <TouchableOpacity onPress={()=>handleNavigation(item)} style={styles.itemContainer}>
                        <Image style={styles.img} source={{uri: item.logo}} />
                        <Text size={12} style={{textAlign:'center'}} >{item.title}</Text>
                    </TouchableOpacity>
                }
            />
            <Divider />
        </Screen>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        borderWidth: 1,
        borderRadius: 4,
        overflow: 'hidden',
        marginHorizontal: 4,
        width: (width - 32) / 4,
        aspectRatio: .9,
        alignItems:'center',
    justifyContent:'space-around',
    },
    img:{
        width: 60,
        height: 60
    }
})