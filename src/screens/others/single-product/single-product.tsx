import { View, StyleSheet, Image, Platform } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import {
    GradiantHeader,
    ImageSlider,
    MainHeader,
    Screen,
    Row,
    Button,
    Divider,
    Text,
    ProductLocation,
    CallInfo,
    ReportProblem,
    optionsTypes
} from '../../../components'
import { colors } from '../../../theme'
import Entypo from 'react-native-vector-icons/Entypo'
import { numberWithCommas, translations } from '../../../utiles'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { getSingleAds } from '../../../services'
import { useDispatch, useSelector } from 'react-redux'
import { setBookmarks } from '../../../stateManager/reducers/user'

const images = [
    require("../../../assets/images/products/productSlider1.png")
]
const productProps = [
    { label: 'متراژ(متر مربع)', value: '120' },
    { label: 'رهن', value: 100000000, type: "price" },
    { label: 'اجاره ماهیانه', value: 1000000, type: "price" },
    { label: 'نوع', value: 'ارایه' },
    { label: 'آگهی دهنده', value: 'مشاور املاک' },
    { label: 'تعداد اتاق', value: '3' },
    { label: 'محل', value: 'گنبد کاووس' },

]
export function SinlgeProduct() {
    const [state, setState] = useState({
        callInfoModal: false,
        reportModal: false,
        ads: undefined
    })
    const { params } = useRoute()
    const [ad, setAd] = useState(params.ads)
    const { bookmarks } = useSelector(s => s.user)
    const dispatch = useDispatch()
    const { data } = useQuery([`singleAd-${params?.ads?.id}`, params?.ads?.id], () => getSingleAds(params?.ads?.id))
    const { navigate } = useNavigation()
    const insets = useSafeAreaInsets();
    const toggleCallInfoModal = () => {
        setState(s => ({ ...s, callInfoModal: !s.callInfoModal }))
    }
    const toggleReportModal = () => {
        setState(s => ({ ...s, reportModal: !s.reportModal }))
    }
    const adsProps = useMemo(() => {
        if (!!ad) {
            const arr = []
            Object.keys(ad).forEach(item => {

                if (ad[item] !== null && !!translations[item]) {
                    let value
                    if (item === "ad_type") {
                        value = optionsTypes.adsType[ad[item]].title
                    } else if (item == "contract_type") {
                        value = optionsTypes.contractType[ad[item]].title
                    } else if (item == "degree") {
                        value = optionsTypes.education[ad[item]].title
                    } else if (item == "brand") {
                        value = optionsTypes.brand[ad[item]].title
                    } else if (item == "floor") {
                        value = optionsTypes.floor[ad[item]].title
                    } else if (item == "parking") {
                        value = ad[item] == 0 ? "دارد" : "ندارد"
                    } else if (item == "is_cash") {
                        value = ad[item] ? "قسطی" : "نقد"
                    } else if (item == "by_person") {
                        value = ad[item] ? "شخصی" : "بنگاه"
                    }else if(item == "suburbs"){
                        value = ad[item]? 'بله': "خیر"
                    }else if(item == "elevator"){
                        value = ad[item]? 'دارد': "ندارد"
                    }
                    else {
                        value = ad[item]
                    }
                    arr.push({ label: translations[item], value })
                }
            })
            return arr
        }
        return []
    }, [])
    useEffect(() => {
        if (!!data) {
            setAd(data?.data)
        }

    }, [data])
    const images = useMemo(() => {
        if (ad) {
            // setAd(data?.data)
            const imgs = Object.keys(ad).filter(item => item.includes('image')).filter(item => !!ad[item]).map(item => ad[item].path)
            return imgs
        } else {
            return []
        }
    }, [ad])
    const isBookmarked = useMemo(() => {
        return !!bookmarks?.find(item => item.id === params?.ads?.id)
    }, [bookmarks])

    const onBookMark = () => {
        if (isBookmarked) {
            dispatch(setBookmarks(bookmarks?.filter(item => item.id !== params?.ads?.id)))
        } else {
            dispatch(setBookmarks(bookmarks?.concat(params?.ads)))
        }
    }
    return (
        <Screen style={{ backgroundColor: 'transparent' }} withoutScroll statusbarBackgroundColor={colors.main}>
            <MainHeader />
            <View style={styles.nav}>
                <GradiantHeader
                    isBookmarked={isBookmarked}
                    onBookMark={onBookMark}
                    title={data?.data?.category_id?.title}
                />
            </View>
            <Screen unsafe>
                <View>

                    <ImageSlider
                        images={images}
                        autoPlay={false}
                        loop={false}
                    />
                    <View style={styles.topDetail}>
                        <Text preset='bold' size={20}>{ad?.title}</Text>
                        <Divider />
                        <Row style={{ justifyContent: 'space-between' }}>
                            <Text color={colors.main}>لحظاتی پیش</Text>

                            <Button onPress={toggleReportModal} >
                                <Row>
                                    <Text>گزارش مشکل آگهی</Text>
                                    <Entypo size={20} name="attachment" />
                                </Row>
                            </Button>
                        </Row>
                    </View>
                    <View style={{ padding: 16 }}>
                        {adsProps.map((item, index) => {
                            return <Row key={index} style={{ marginVertical: 2 }}>
                                <Text size={17} style={{ width: 120, textAlign: 'left' }}>{item.label}:</Text>
                                <Divider style={{ width: 40 }} />
                                <Text size={17}>{item.type == "price" ? `${numberWithCommas(item.value)} تومان` : item.value}</Text>
                            </Row>
                        })}
                    </View>
                </View>

                <ProductLocation
                    lat={ad?.lat}
                    lng={ad?.lng}
                    zoomEnabled={false}
                    scrollEnabled={false}

                />
                <CallInfo
                    phone={ad?.contact_info}
                    visible={state.callInfoModal}
                    onClose={toggleCallInfoModal}
                />
                <ReportProblem
                    visible={state.reportModal}
                    onClose={toggleReportModal}
                />
            </Screen>
            <Row style={{ ...styles.buttons, bottom: Platform.OS == "ios" ? insets.bottom : 10 }}>
                <Button style={styles.button} onPress={toggleCallInfoModal}>
                    <Row style={{ alignItems: 'center' }}>
                        <Image source={require('../../../assets/images/phone.png')} />
                        <Divider style={{ width: 5 }} />
                        <Text size={20} preset='bold'>اطلاعات تماس</Text>
                    </Row>
                </Button>
                <Divider style={{ width: 30 }} />
                <Button onPress={() => navigate("chat")} style={styles.button}>
                    <Row style={{ alignItems: 'center' }}>
                        <Image source={require('../../../assets/images/chat.png')} />
                        <Divider style={{ width: 5 }} />
                        <Text size={20} preset='bold'>چت</Text>
                    </Row>
                </Button>
            </Row>
        </Screen>
    )
}
const styles = StyleSheet.create({
    nav: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1000,
        top: 50
    },
    topDetail: {
        backgroundColor: colors.pallete.gray1,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: 16
    },
    button: {
        paddingHorizontal: 8,
        flex: 1,
        height: 37,
        backgroundColor: colors.main,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.pallete.gray2

    },
    buttons: {
        paddingHorizontal: 16,
        zIndex: 10001,
        backgroundColor: 'transparent',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 10
    }
})