import React from 'react';
import {OptionPicker} from '../picker/option-picker';

// Thin backward-compatible wrapper: every existing form call site imports
// `AdsOptionsModal` from here with the same {visible, onClose, onSelect,
// type} props — the actual list-rendering now lives in the shared Picker.
export interface AdsOptionsModalProps {
  visible?: any;
  onClose?: any;
  onSelect?: any;
  type?: any;
}

export function AdsOptionsModal({
  visible,
  onClose,
  onSelect,
  type,
}: AdsOptionsModalProps) {
  return (
    <OptionPicker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      type={type}
    />
  );
}
