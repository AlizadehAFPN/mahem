import { View, StyleSheet, TouchableHighlight, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text, Row, TextField } from '../'
import { cities } from '../../utiles'

const { width, height } = Dimensions.get('window')
export function DurationModal({ visible, onClose, onSelect, onChangeText }) {
    const [state, setState] = useState({
        minutes: '',
        houres: '',
        days: ''
    })

    const handleChangeText = (text, label) => {
        onChangeText(text , label)
        setState(s => ({ ...s, [label]: text }))
    }
    return (
        <MainModal onClose={onClose} visible={visible}>
            <View >
                <View style={styles.card}>
                    <Row style={{ justifyContent: 'space-around' }}>
                        <View style={styles.item} >
                            <Text size={12} color={colors.pallete.grayText}>دقیقه</Text>
                            <TextField
                                value={state.minutes}
                                onChangeText={(text) => handleChangeText(text, "minutes")}
                                keyboardType='number-pad'
                                style={styles.textinput}
                            />
                        </View>
                        <View style={styles.item} >
                            <Text size={12} color={colors.pallete.grayText}>ساعت</Text>
                            <TextField
                                value={state.houres}
                                onChangeText={(text) => handleChangeText(text, "houres")}
                                keyboardType='number-pad'
                                style={styles.textinput}
                            />
                        </View>
                        <View style={styles.item} >
                            <Text size={12} color={colors.pallete.grayText}>روز</Text>
                            <TextField
                                value={state.days}
                                onChangeText={(text) => handleChangeText(text, "days")}
                                keyboardType='number-pad'
                                style={styles.textinput}
                            />
                        </View>
                    </Row>
                </View>
                {/* <TouchableHighlight onPress={onClose}>
                    <View style={styles.abs} />
                </TouchableHighlight> */}
            </View>
        </MainModal>
    )
}
const styles = StyleSheet.create({
    container: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 4,
        borderColor: colors.pallete.gray2,
        paddingHorizontal: 8,
        paddingVertical: 16,
        backgroundColor: colors.pallete.gray1,
        width: '100%',


    },
    item: {
        width: 50,
        alignItems: 'center'
    },
    abs: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // zIndex: -1
    },
    textinput: { width: 50, paddingHorizontal: 0 }


})