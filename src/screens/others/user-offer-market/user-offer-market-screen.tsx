import { View, FlatList, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import {
    GradiantHeader,
    ImageSlider,
    MainHeader,
    Screen,
    Row,
    Button,
    Divider,
    Text,
    GridOfferCard
} from '../../../components'
import { colors } from '../../../theme'
import Entypo from 'react-native-vector-icons/Entypo'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useInfiniteQuery, useMutation } from 'react-query'
import { getAds } from '../../../services'
const { width } = Dimensions.get("window")

const data = [
    {
        img: require('../../../assets/images/market1.png'),
        location: 'مینودشت',
        title: 'فروش کیبورد ارنجر یاماها',
        offerPercent: 45,
        mainPrice: '1000000',
        price: '910000',
        rate: 4,
        time: 12000
    },
    
]

export function UserOfferMarketScreen() {
    const {navigate} = useNavigation()
    const {params} = useRoute()
    const [state, setState] = useState({
        callInfoModal: false,
        reportModal: false
    })

    const [ads, setAds] = useState([])
    const {
        data,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ["ads", params?.store],
        queryFn: ({ pageParam = 1, }) => getAds({ page: pageParam, store_id: params?.store?.id }),
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

    return (
        <Screen style={{ backgroundColor: 'transparent' }} withoutScroll statusbarBackgroundColor={colors.main}>
            <MainHeader />
            <View style={styles.nav}>
                <GradiantHeader
                    title="تخفیف یاب"
                    details={false}
                />
            </View>
            <Screen unsafe>
                <View style={styles.bannerContaier}>
                    <Image style={{ width: '100%', height: '100%' }} source={{uri: params?.store?.image?.path}} />
                </View>
                <View style={styles.grayCard}>
                    <View style={styles.avatar}>
                        <Image style={{ height: '100%', width: '100%' }} source={{uri: params?.store?.logo?.path}} />
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text size={17} preset='bold' color={colors.main}>{params?.store?.title}</Text>
                    </View>
                </View>
                <Divider />
                <Row style={{ paddingHorizontal: 10 }}>
                    <TouchableOpacity style={{ ...styles.grid, marginLeft: 4 }}>
                        <View style={styles.icon}>
                            <Image source={require('../../../assets/images/tamdid.png')} />
                        </View>
                        <Text size={17} color={colors.main}>تمدید فروشگاه</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=> navigate("newAdvertising")} style={{ ...styles.grid, marginRight: 4 }}>
                        <View style={styles.icon}>
                            <Entypo name="plus" size={100} color={colors.main} />
                        </View>
                        <Text size={17} color={colors.main}>ثبت تخفیف</Text>
                    </TouchableOpacity>

                </Row>
                <Divider height={8} />
                <FlatList
                    data={ads}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    numColumns={2}
                    ItemSeparatorComponent={<View style={{ height: 10 }} />}
                    renderItem={({ item, index }) =>
                        <View style={{ marginLeft: index % 2 ? 4 : 0, marginRight: index % 2 ? 0 : 4, width: (width - 28) / 2 }}>
                            <GridOfferCard
                                onPress={()=> navigate("singleOffer", {ads: item})}
                                item={item}
                            />
                        </View>

                    }
                />
                <Divider />
            </Screen>

        </Screen>
    )
}
const styles = StyleSheet.create({
    bannerContaier: {
        width: '100%',
        height: width / 1.9,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.pallete.gray3
    },
    nav: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1000,
        top: 50
    },
    grayCard: {
        height: 55,
        backgroundColor: colors.pallete.gray1,
        flexDirection: 'row'
    },
    avatar: {
        height: 94,
        width: 94,
        borderRadius: 16,
        marginTop: -47,
        borderWidth: 1,
        marginLeft: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: colors.pallete.gray4
    },
    grid: {
        width: (width - 28) / 2,
        aspectRatio: .9,
        borderWidth: 1,
        borderColor: colors.main,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: '50%',
        aspectRatio: 1
    }
})