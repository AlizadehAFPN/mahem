import React from 'react';
import {CityPicker} from '../picker/city-picker';

// Thin backward-compatible wrapper: every existing screen imports
// `CitySelectModal` from here with the same {visible, onClose, onSelect}
// props — the actual list-rendering now lives in the shared Picker.
export interface CitySelectModalProps {
  visible?: any;
  onClose?: any;
  onSelect?: any;
}

export function CitySelectModal({
  visible,
  onClose,
  onSelect,
}: CitySelectModalProps) {
  return <CityPicker visible={visible} onClose={onClose} onSelect={onSelect} />;
}
