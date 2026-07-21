import React from 'react';
import {useQuery} from 'react-query';
import {getCities} from '../../services';
import {Picker} from './picker';

// Single source of truth for city selection — replaces the 3 previously
// separate implementations (element-dropdown in Settings, material-menu in
// the header, Modal+FlatList in forms/filter).
export function CityPicker({visible, onClose, onSelect}) {
  const {data} = useQuery(['cities'], getCities);

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      data={data?.data || []}
      searchable
    />
  );
}
