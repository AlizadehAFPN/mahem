import React from 'react';
import {useQuery} from 'react-query';
import {getAdsCategories} from '../../services';
import {Picker} from './picker';

// Tree-mode category picker. `onSelect` is called once with whichever node
// is deepest (main, sub?, subSub?) — the same shape every existing caller
// (ad creation, filters, store category) already expects.
export function CategoryPicker({visible, onClose, onSelect, showTitle = true}) {
  const {data} = useQuery(['addsCategory'], getAdsCategories);

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      data={data?.data || []}
      title={showTitle ? 'ثبت آگهی' : undefined}
      getChildren={item => item.sub_categories}
    />
  );
}
