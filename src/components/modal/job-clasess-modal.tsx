import React from 'react';
import {useQuery} from 'react-query';
import {getJobsCategories} from '../../services/job';
import {Picker} from '../picker/picker';

// Thin backward-compatible wrapper: create-job-screen imports
// `JobClasessModal` from here with the same {visible, onClose, onSelect}
// props — the actual list-rendering now lives in the shared Picker.
export function JobClasessModal({visible, onClose, onSelect}) {
  const {data} = useQuery(['jobBank'], getJobsCategories);

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      data={data?.data || []}
    />
  );
}
