import { View, StyleSheet, Image, TouchableOpacity, FlatList, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text, CategroyItem, MainHeader, Screen } from '../'
import { cities } from '../../utiles'
import LinearGradient from 'react-native-linear-gradient'
import { adsCategory } from '../../utiles/data'
import { useQuery } from 'react-query'
import { getAdsCategories } from '../../services'
export function SelectAdsCategory({ visible, onClose, onSelect, showTitle=true, ...prp }) {
    const [state, setState] = useState({
        mainCategory: null,
        subCategory: null,
        subsubCategory: null,
    })

    const {data, } = useQuery(["addsCategory"], getAdsCategories)
    const onPressMainCategory = (item) => {
        if (item.sub_categories.length==0) {
            onSelect(item)
            onClose()
        } else {
            setState(s => ({ ...s, mainCategory: item }))
        }
    }

    const onPressSubCategory = (item) => {
        if (item.sub_categories.length==0) {
            onSelect(state.mainCategory, item)
            onClose()
        } else {
            setState(s => ({ ...s, subCategory: item }))
        }
    }
    const onPressSubSubCategory = (item) => {
        onClose()
        onSelect(state.mainCategory, state.subCategory, item)
    }
    useEffect(() => {
        if (!visible) {
            setState(s => ({ ...s, mainCategory: null, subCategory: null, subsubCategory: null }))
        }
    }, [visible])
    return (
        <Modal onRequestClose={onClose} visible={visible}{...prp}>
            <Screen withoutScroll>
            <MainHeader title={showTitle?"ثبت آگهی":""} />
            <View style={styles.card}>
                {!state.mainCategory && !state?.mainCategory?.subCategories ?
                    <FlatList
                        ItemSeparatorComponent={<View style={{ height: 4 }} />}
                        data={data?.data}
                        renderItem={({ item }) =>
                            <CategroyItem item={item}
                                onPress={() => onPressMainCategory(item)}
                            />
                        }
                    /> :
                    !state.subCategory && !state.subCategory?.subCategories ?
                        <View style={{flex:1}}>
                            <FlatList
                                ListFooterComponent={<View style={{ height: 4 }} />}
                                ListHeaderComponent={<View style={{ height: 10 }} />}
                                ItemSeparatorComponent={<View style={{ height: 4 }} />}
                                data={state?.mainCategory?.sub_categories || []}
                                renderItem={({ item }) =>
                                    <CategroyItem
                                        item={item}
                                        onPress={() => onPressSubCategory(item)}
                                    />
                                }
                            />
                        </View> :
                        <View style={{flex:1}}>
                            <FlatList
                                ListFooterComponent={<View style={{ height: 4 }} />}
                                ItemSeparatorComponent={<View style={{ height: 4 }} />}
                                data={state?.subCategory?.sub_categories || []}
                                renderItem={({ item }) =>
                                    <CategroyItem
                                        item={item}
                                        onPress={() => onPressSubSubCategory(item)}
                                    />
                                }
                            />
                        </View>
                }

            </View>
            </Screen>
        </Modal>
    )
}
const styles = StyleSheet.create({
    card: {
        // borderWidth: 1,
        // marginBottom: 4,
        // borderColor: colors.pallete.gray2,
        paddingHorizontal: 8,
        paddingTop: 16,
        backgroundColor: "white",
        flex: 1,
        justifyContent: "flex-end",
    },
    item: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    divider: {
        height: 1,
        backgroundColor: 'white',
        width: '70%'
    }

})