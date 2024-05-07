import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import React from 'react';

export function MainModal({visible, onClose, children, style}) {
  return (
    <Modal transparent onRequestClose={onClose} visible={visible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{flex: 1, minHeight: 60}} />
      </TouchableWithoutFeedback>
      <SafeAreaView style={{width: '100%', paddingHorizontal: 8, ...style}}>
        {children}
      </SafeAreaView>
    </Modal>
  );
}
const style = StyleSheet.create({
  cart: {},
});
