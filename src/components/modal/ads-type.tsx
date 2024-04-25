import { View, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text, Row, Divider, Button } from '..'
import LinearGradient from 'react-native-linear-gradient'
const adsType = [
    { title: "فروشی" },
    { title: "اجاره ای" },
    { title:"درخواستی" },
]
export function AdsTypeSelection({ visible, onClose, onSelect }) {
    const onSelectItem = (item)=>{
        onSelect(item.title)
        onClose()
    }
    return (
        <MainModal onClose={onClose} visible={visible}>
            <View style={styles.card}>
                <View>
                    <FlatList
                        data={adsType}
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
        backgroundColor: colors.pallete.gray1

    },
    textItem: {
        paddingHorizontal: 10
    },
    card2: {
        paddingHorizontal: 16
    }
})