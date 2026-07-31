import {
  View,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import {scaled} from '../../theme';

interface MainModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: object;
}

export function MainModal({visible, onClose, children, style}: MainModalProps) {
  return (
    <Modal transparent onRequestClose={onClose} visible={visible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{flex: 1, minHeight: scaled(60)}} />
      </TouchableWithoutFeedback>
      <SafeAreaView
        style={{width: '100%', paddingHorizontal: scaled(8), ...style}}>
        {children}
      </SafeAreaView>
    </Modal>
  );
}
