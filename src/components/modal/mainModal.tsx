import { View, Text, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import React from 'react'

export function MainModal({ visible, onClose, children, style }) {
    return (
        <Modal transparent onRequestClose={onClose} visible={visible}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1, minHeight: 60 }} />
            </TouchableWithoutFeedback>
            <View style={{ width: "100%", paddingHorizontal: 8, ...style }}>
                {children}
            </View>
        </Modal>
    )
}
const style = StyleSheet.create({
    cart: {

    }
})