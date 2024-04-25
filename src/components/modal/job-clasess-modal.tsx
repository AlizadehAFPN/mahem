import { View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text, Row, Divider, Button } from '../'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { jobsClasess } from '../../utiles/data'
import { useQuery, useQueryClient } from 'react-query'
import { getJobsCategories } from '../../services/job'
export function JobClasessModal({ visible, onClose, onSelect }) {
    const {data} = useQuery(["jobBank"], getJobsCategories)
    return (
        <MainModal onClose={onClose} visible={visible}>
            <View style={styles.card}>
                <FlatList
                    data={data.data}
                    keyExtractor={item=> item.id}
                    ItemSeparatorComponent={
                        <View style={{ justifyContent: 'center', alignItems: 'center', width:'100%' }}>
                            <View style={styles.divider} />
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