import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../text/text';
import {colors, scaled} from '../../theme';

// Shared loading/empty/error placeholder for list screens — none of these
// existed before, so a failed or still-loading request just rendered a
// blank list with no feedback.
export function ListState({
  isLoading,
  isError,
  emptyMessage,
  errorMessage,
  loadingMessage,
}: {
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}) {
  const {t} = useTranslation();
  const empty = emptyMessage ?? t('common.emptyList');
  const error = errorMessage ?? t('common.errorLoading');
  const loading = loadingMessage ?? t('common.loading');
  return (
    <View style={{padding: scaled(24), alignItems: 'center'}}>
      <Text color={colors.pallete.grayText}>
        {isLoading ? loading : isError ? error : empty}
      </Text>
    </View>
  );
}
