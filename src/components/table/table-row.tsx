import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Row, Text } from '../'
import { colors } from '../../theme'
export function TableRow({ onPress, item, header = false }) {

    return (
        <TouchableOpacity onPress={onPress}>
            <Row style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                <View style={{ ...styles.cell1, }}>
                    <Text style={styles.text} size={15}>{item[0]}</Text>
                </View>
                <View style={{ ...styles.cell2, flex: 2, alignItems: header ? 'center' : 'flex-end' }}>
                    <Text style={styles.text} size={15}>{item[1]}</Text>
                </View>
                <View style={{ ...styles.cell2, flex: 1.5, alignItems: header ? 'center' : 'flex-end' }}>
                    <Text style={styles.text} size={15}>{item[2]}</Text>
                </View>
                <View style={{ ...styles.cell2, flex: 1, alignItems: header ? 'center' : 'flex-end', marginLeft: 0 }}>
                    <Text style={styles.text} size={15}>{item[3]}</Text>
                </View>
            </Row>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    cell1: {
        width: 35,
        height: 25,
        backgroundColor: colors.pallete.gray1,
        borderRadius: 4,
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cell2: {
        height: 25,
        backgroundColor: colors.pallete.gray1,
        borderRadius: 4,
        marginLeft: 8,
        justifyContent: 'center',
    },
    text:{
        lineHeight: 20,
    }
})