import { Image, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native'
import React, { useState } from 'react'
import { Screen, Row, Text, Divider, ChatItem } from '../../../components'
import { colors } from '../../../theme'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'
import Entypo from 'react-native-vector-icons/Entypo'
import { useQuery } from 'react-query'
import { getMyAds } from '../../../services'
import moment from 'moment-jalaali'
export function UserPanelScreen() {
    const [state, setState] = useState({
        adsMode: true
    })
    const { goBack, navigate } = useNavigation()

    const {data: myAds} = useQuery('myAds', getMyAds)
    return (
        <Screen withoutScroll>
            <Row style={styles.header}>
                <TouchableOpacity onPress={goBack}>
                    <MaterialIcons size={25} color="white" name="arrow-forward-ios" />
                </TouchableOpacity>
            </Row>
            <View style={styles.avatarCon}>
                <View style={styles.avatar}>
                    <Image style={{ width: '100%', height: "100%" }} source={require("../../../assets/images/userav1.png")} />
                </View>
                <Text size={20}>پنل مدیریت کاربر</Text>
            </View>
            {state.adsMode ?
                <FlatList
                    data={myAds?.data.ads}
                    ItemSeparatorComponent={<Divider height={4} />}
                    renderItem={({ item }) =>
                        <TouchableOpacity onPress={() => navigate("singleProduct", {ads: item})} style={{ paddingHorizontal: 8 }}>
                            <Image style={{ width: '100%', height: 80, resizeMode: 'contain' }} source={require("../../../assets/images/adlist.png")} />
                            <View style={{ position: 'absolute', left: 10, right: 10, top: 0, bottom: 0, paddingHorizontal: 8, paddingTop: 7, justifyContent: 'space-between' }}>
                                <Text style={{ paddingHorizontal: 8 }} size={17}>{item.title}</Text>
                                <Row style={{ marginBottom: 2 }}>
                                    <View style={{ flex: 1.1 }} />
                                    <Row style={{ flex: .9, justifyContent: "space-between", paddingHorizontal: 10, }} >
                                        <Text size={12} color={colors.main}>3 دقیقه پیش</Text>
                                        <Text size={12} color={colors.main}>1399/02/15</Text>
                                    </Row>
                                </Row>
                            </View>
                        </TouchableOpacity>
                    }
                    ListHeaderComponent={<Divider height={10} />}
                    ListFooterComponent={<Divider height={120} />}
                /> :
                <FlatList
                    style={{ paddingHorizontal: 8 }}
                    data={[1, 2, 3, 4]}
                    renderItem={({ item }) =>
                        <ChatItem />
                    }
                    ListFooterComponent={<Divider height={120} />}
                    ListHeaderComponent={<Divider height={10} />}
                    ItemSeparatorComponent={<Divider height={8} />}
                />
            }

            <View style={styles.absButtons}>
                <TouchableOpacity onPress={() => setState(s => ({ ...s, adsMode: !s.adsMode }))} style={styles.circle}>
                    {state.adsMode ? <Image style={{ width: 30, height: 30 }} source={require('../../../assets/images/chatwhite.png')} /> :
                        <Image style={{ width: 30, height: 30 }} source={require('../../../assets/images/speaker.png')} />}
                </TouchableOpacity>
                <Divider height={10} />
                <TouchableOpacity onPress={() => navigate("newAdvertising")} style={styles.circle}>
                    <Entypo name="plus" color="white" size={40} />
                </TouchableOpacity>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    header: {
        height: 77,
        backgroundColor: colors.main
    },
    avatarCon: {
        height: 83,
        backgroundColor: colors.pallete.gray1,
        alignItems: 'center'
    },
    avatar: {
        height: 94,
        width: 94,
        borderRadius: 50,
        marginTop: -47,
        overflow: 'hidden',
        borderWidth: 1
    },
    absButtons: {
        position: 'absolute',
        bottom: 20,
        right: 20
    },
    circle: {
        height: 50,
        width: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.main
    }
})