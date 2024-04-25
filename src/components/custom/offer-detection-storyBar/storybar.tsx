import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { colors } from '../../../theme'
import Entypo from 'react-native-vector-icons/Entypo'
import { Divider, Text } from '../../'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { getAllStore, getMyStore } from '../../../services'

export function StoryBar() {
    const { navigate } = useNavigation()
    const [state, setState] = useState({
        click: false
    })

    const { data } = useQuery(['stores',], getAllStore)
    const { data: myStores } = useQuery(['myStores',], getMyStore)

    const onPressNew = () => {
        return navigate("createOfferMarket")
    }
    const isInMyStores = useCallback((store) => {
        return !!myStores?.data?.find(elem => elem.id === store.id)
    }, [myStores])

    const onPressStore = (store) => {
        const isMyStore = myStores?.data?.find(elem => elem.id === store.id)
        if (isMyStore) {
            return navigate("userOfferMarketScreen", { store })
        } else {
            navigate("offerMarket", { store: store })
        }
    }
    return (
        <FlatList
            showsHorizontalScrollIndicator={false}
            data={['add'].concat(data?.data?.stores.sort((a, b) => !isInMyStores(a)))}
            inverted
            horizontal
            ListHeaderComponent={<Divider style={{ width: 10 }} />}
            ListFooterComponent={<Divider style={{ width: 10 }} />}
            style={{ paddingVertical: 8 }}
            renderItem={({ item }) => {
                if (typeof (item) == "string") {
                    return (
                        <TouchableOpacity style={styles.itemContainer} onPress={onPressNew}>
                            <View style={styles.circle}>
                                <Entypo name="plus" color={colors.main} size={50} />
                            </View>
                            <Text size={12}>ایجاد فروشگاه</Text>
                        </TouchableOpacity>
                    )
                } else {
                    return (
                        <TouchableOpacity onPress={() => onPressStore(item)} style={styles.itemContainer}>
                            <View style={styles.circle}>
                                <Image style={{ width: '100%', height: '100%' }} source={{ uri: item?.logo?.path }} />
                            </View>
                            <Text style={{ textAlign: "center", width: '100%' }} numberOfLines={1} size={12}>{item?.title}</Text>
                        </TouchableOpacity>)
                }
            }
            }
        />
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        alignItems: 'center',
        width: 80
    },
    circle: {
        width: 61,
        height: 61,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: colors.main,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    }
})