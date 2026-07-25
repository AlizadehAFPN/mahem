import React from 'react';
import {Picker} from './picker';
import {useCities} from '../../hooks/use-cached-cities';
import {localizeCity} from '../../i18n/display-maps';

// Single source of truth for city selection — replaces the 3 previously
// separate implementations (element-dropdown in Settings, material-menu in
// the header, Modal+FlatList in forms/filter).
export function CityPicker({visible, onClose, onSelect}) {
  const {data} = useCities();

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      data={data?.data || []}
      searchable
      localizeLabel={localizeCity}
    />
  );
}
