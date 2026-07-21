import React from 'react';
import {CategoryPicker} from '../picker/category-picker';

// Thin backward-compatible wrapper: every existing screen imports
// `SelectAdsCategory` from here with the same {visible, onClose, onSelect,
// showTitle} props — the actual tree-drill-down now lives in the shared
// Picker (generalized to N levels instead of a hardcoded 3).
interface SelectAdsCategoryProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (...path: any[]) => void;
  showTitle?: boolean;
}

export function SelectAdsCategory({
  visible,
  onClose,
  onSelect,
  showTitle,
}: SelectAdsCategoryProps) {
  return (
    <CategoryPicker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      showTitle={showTitle}
    />
  );
}
