import { View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text,} from '../'
import { cities } from '../../utiles'
import LinearGradient from 'react-native-linear-gradient'
import { useQuery } from 'react-query'
import { getCities } from '../../services'
export function CitySelectModal({ visible, onClose, onSelect }) {
    
    const {data} = useQuery(["cities"], getCities)
    
    return (
        <MainModal onClose={onClose} visible={visible}>
            <View style={styles.card}>
                <FlatList
                    data={data?.data}
                    ItemSeparatorComponent={
                        <View style={{ justifyContent: 'center', alignItems: 'center', width:'100%' }}>
                            <LinearGradient style={{ height: 1, width: '100%' }} colors={[colors.pallete.gray1, "white", "white", "white", colors.pallete.gray1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                        </View>
                    }
                    renderItem={({ item }) =>
                        <TouchableOpacity onPress={()=> onSelect(item)} style={styles.item}>
                            <Text>{item.title}</Text>
                        </TouchableOpacity>
                    }
                    ListFooterComponent={<View style={{height: 100}} />}
                />
            </View>
        </MainModal>
    )
}
const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 4,
        borderColor: colors.pallete.gray2,
        paddingHorizontal: 8,
        paddingTop: 16,
        backgroundColor: colors.pallete.gray1

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