import React from 'react';
import {useTranslation} from 'react-i18next';
import {Picker} from './picker';
import {useAdsCategories} from '../../hooks/use-cached-categories';
import {localizeCategory} from '../../i18n/display-maps';

// Tree-mode category picker. `onSelect` is called once with whichever node
// is deepest (main, sub?, subSub?) — the same shape every existing caller
// (ad creation, filters, store category) already expects.
export interface CategoryPickerProps {
  visible?: any;
  onClose?: any;
  onSelect?: any;
  showTitle?: any;
}

export function CategoryPicker({
  visible,
  onClose,
  onSelect,
  showTitle = true,
}: CategoryPickerProps) {
  const {t} = useTranslation();
  const {data} = useAdsCategories();

  return (
    <Picker
      visible={visible}
      onClose={onClose}
      onSelect={onSelect}
      data={data?.data || []}
      title={showTitle ? t('createAds.postAd') : undefined}
      getChildren={item => item.sub_categories}
      localizeLabel={localizeCategory}
    />
  );
}
