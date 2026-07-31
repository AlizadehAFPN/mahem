import {useCallback, useRef} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

// A detail screen can be opened for something that no longer exists: a پیام‌ها
// notification outlives the ad/job it announced (the owner deleted it, or an
// admin did), and a stale list can do the same. The backend answers 404, and
// without this the screen just sits there permanently blank with an error only
// in the console — so say what happened once, then hand the user back where
// they came from.
//
// Returns `onError` and `retry` to spread into the useQuery that fetches the
// entity. `retry` matters as much as the alert: react-query would otherwise
// retry a 404 three times before reporting it, delaying the message for no
// reason — a missing row will not appear on the second attempt.
export function useMissingEntityGuard(bodyKey: string) {
  const {t} = useTranslation();
  const {goBack} = useNavigation<any>();
  // A query can error more than once (refetch on app focus, for instance);
  // without this the alerts stack up behind each other.
  const alerted = useRef(false);

  const onError = useCallback(
    (error: any) => {
      if (error?.response?.status !== 404 || alerted.current) {
        return;
      }
      alerted.current = true;
      Alert.alert(t('common.error'), t(bodyKey), [
        {text: t('common.ok'), onPress: () => goBack()},
      ]);
    },
    [bodyKey, goBack, t],
  );

  const retry = useCallback(
    (failureCount: number, error: any) =>
      error?.response?.status !== 404 && failureCount < 3,
    [],
  );

  return {onError, retry};
}
