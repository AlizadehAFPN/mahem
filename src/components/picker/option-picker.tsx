import React from 'react';
import {useQuery} from 'react-query';
import {Picker} from './picker';
import {getAttributeOptions} from '../../services';

// Flat single-select picker backed by the admin-managed AttributeOption
// list for `type` (e.g. 'brand', 'floor') — replaces the old hardcoded
// optionsTypes lookup so an admin can add/remove/reorder values (e.g. a new
// car model) without an app release. Calls `onSelect` with the plain title
// string, matching what every existing form call site already expects.
export function OptionPicker({visible, onClose, onSelect, type}) {
  const {data} = useQuery(
    ['attribute-options', type],
    () => getAttributeOptions(type),
    {enabled: !!type},
  );

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={item => onSelect(item.title)}
      data={data?.data || []}
    />
  );
}
