import React from 'react';
import {Picker} from './picker';
import {useAttributeOptions} from '../../hooks/use-cached-attribute-options';
import {localizeOption} from '../../i18n/display-maps';

// Flat single-select picker backed by the admin-managed AttributeOption
// list for `type` (e.g. 'brand', 'floor') — replaces the old hardcoded
// optionsTypes lookup so an admin can add/remove/reorder values (e.g. a new
// car model) without an app release. Calls `onSelect` with the plain title
// string, matching what every existing form call site already expects.
// Every groupKey's options are fetched together and cached app-wide (see
// useAttributeOptions/AttributeOptionsSyncBridge) instead of this component
// firing its own network request per type on first open.
export interface OptionPickerProps {
  visible?: any;
  onClose?: any;
  onSelect?: any;
  type?: any;
}

export function OptionPicker({
  visible,
  onClose,
  onSelect,
  type,
}: OptionPickerProps) {
  const {data} = useAttributeOptions();
  const options = (type && data?.[type]) || [];

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={item => onSelect(item.title)}
      data={options}
      localizeLabel={localizeOption}
    />
  );
}
