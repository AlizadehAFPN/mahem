import React from 'react';
import {Picker} from '../picker/picker';
import {useJobCategories} from '../../hooks/use-cached-categories';

// Thin backward-compatible wrapper: create-job-screen imports
// `JobClasessModal` from here with the same {visible, onClose, onSelect}
// props — the actual list-rendering now lives in the shared Picker.
export function JobClasessModal({visible, onClose, onSelect}) {
  const {data} = useJobCategories();

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      data={data?.data || []}
    />
  );
}
