import React from 'react';
import {View} from 'react-native';
import {Text} from '../text/text';
import {colors} from '../../theme';

// Shared loading/empty/error placeholder for list screens — none of these
// existed before, so a failed or still-loading request just rendered a
// blank list with no feedback.
export function ListState({
  isLoading,
  isError,
  emptyMessage = 'موردی یافت نشد',
  errorMessage = 'خطا در دریافت اطلاعات',
  loadingMessage = 'در حال بارگذاری...',
}: {
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}) {
  return (
    <View style={{padding: 24, alignItems: 'center'}}>
      <Text color={colors.pallete.grayText}>
        {isLoading ? loadingMessage : isError ? errorMessage : emptyMessage}
      </Text>
    </View>
  );
}
