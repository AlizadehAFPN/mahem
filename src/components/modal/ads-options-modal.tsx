import { View, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text, Row, Divider, Button } from '..'
import LinearGradient from 'react-native-linear-gradient'
const {height} = Dimensions.get("window")
export const optionsTypes = {
    adsType : [
        { title: "فروشی" },
        { title: "اجاره ای" },
        { title:"درخواستی" },
    ],
    contractType :[
        { title: "تمام وقت" },
        { title: "پاره وقت" },
        { title: "مشاوره ای" },
        { title: "پروژه ای" },
    ],
    education : [
        { title: 'زیر دیپلم' },
        { title: 'دیپلم' },
        { title: 'کاردانی' },
        { title: 'کارشناسی' },
        { title: 'کارشناسی ارشد' },
        { title: 'دکتری و بالاتر' },
    ],
    adsCreator:[
        {title:'شخصی'},
        {title:'املاک'}
    ],
    suburb:[
        {title:'هست'},
        {title:'نیست'}
    ],
    elevator:[
        {title:'دارد'},
        {title:'ندارد'}
    ],
    parking:[
        {title:'دارد'},
        {title:'ندارد'}
    ],
    floor:[
        {title:'زیرزمین'},
        {title:'همکف'},
        {title:'یک'},
        {title:'دو'},
        {title:'سه'},
        {title:'چهار'},
        {title:'پنج یا بیشتر'},
    ],
    price:[
        {title:'قیمت مورد نظر'},
        {title:'مجانی'},
        {title:'توافقی (تماس بگیرید)'},
    ],
    brand:[
        {title:"آیودی"},
        {title:"آریسان"},
        {title:"آریو(زوتی)"},
        {title:"آلفا رومیو"},
        {title:"اپل"},
        {title:"ام جی"},
        {title:"ام وی ام"},
        {title:"ایسوزو"},
        {title:"بایک"},
        {title:"برلیانس"},
        {title:"بسترن"},
        {title:"بنز"},
        {title:"بی ام و"},
        {title:"بی وای دی"},
        {title:"پاژن"},
        {title:"پراید"},
        {title:"پرتون"},
        {title:"پژو"},
        {title:"پورشه"},
        {title:"پیکان"},
        {title:"تویوتا"},
        {title:"تیبا"},
        {title:"جک"},
        {title:"جیپ"},
        {title:"جیلی"},
        {title:"چانگان"},
        {title:"چری"},
        {title:"دانگ فنگ (اچ سی کراس)"},
        {title:"دنا"},
        {title:"دوو"},
        {title:"دی اس"},
        {title:"رانا"},
        {title:"رنو"},
        {title:"سانگ یانگ"},
        {title:"ساینا"},
        {title:"سمند"},
        {title:"سوبارو"},
        {title:"سوزوکی"},
        {title:"سیتروین"},
        {title:"فاو"},
        {title:"فولکس واگن"},
        {title:"فیات"},
        {title:"کاپرا"},
        {title:"کارا"},
        {title:"کیا"},
        {title:"گریت وال"},
        {title:"لکسوس"},
        {title:"لند مارک"},
        {title:"لندور"},
        {title:"لیفان"},
        {title:"مازراتی"},
        {title:"مزدا"},
        {title:"میتسوبیشی"},
        {title:"نیسان"},
        {title:"ولوو"},
        {title:"هایما"},
        {title:"هوندا"},
        {title:"هیوندای"},
        {title:"دیگر"},
    ],
    chassi:[
        {title:'سدان(سواری)'},
        {title:'هاچ بک'},
        {title:'شاسی بلند'},
        {title:'وانت'},
        {title:'ون'},
        {title:'کوپه/کروک'},
        {title:'استیشن'},
        {title:'دیگر'},
    ],
    payType:[
        {title:'نقدی'},
        {title:'اقساطی'},
    ],
    carAdsCreator:[
        {title:'شخصی'},
        {title:'شرکتی'},
    ],
    image:[
        {title:'بله'},
        {title:'خیر'},
    ]


}
export function AdsOptionsModal({ visible, onClose, onSelect, type }) {
    const onSelectItem = (item)=>{
        onSelect(item.title)
        onClose()
    }
    return (
        <MainModal onClose={onClose} visible={visible}>
            <View style={styles.card}>
                <View>
                    <FlatList
                        data={optionsTypes[type]||[]}
                        ItemSeparatorComponent={<View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <LinearGradient style={{ height: 1, width: '100%' }} colors={[colors.pallete.gray1, "white", "white", "white", colors.pallete.gray1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                        </View>}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={()=> onSelectItem(item)} style={{ paddingVertical: 8, alignItems: 'center' }}>
                                <Text>{item.title}</Text>
                            </TouchableOpacity>
                        }
                    />
                </View>
            </View>
        </MainModal>
    )
}
const styles = StyleSheet.create({
    card: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderColor: colors.pallete.gray2,
        paddingHorizontal: 8,
        paddingTop: 16,
        backgroundColor: colors.pallete.gray1,
        maxHeight: height*.75
    },
    textItem: {
        paddingHorizontal: 10
    },
    card2: {
        paddingHorizontal: 16
    }
})