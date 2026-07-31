import {useQuery} from 'react-query';
import {getAppSettings, AppSettingsData} from '../services/app-settings';

// Shared query key so every screen that reads the app content (About Us /
// Contact Us) hits the same react-query cache entry.
export const APP_SETTINGS_QUERY_KEY = ['app-settings'];

// The content rarely changes, so once fetched it's treated as fresh forever
// (staleTime/cacheTime: Infinity) instead of refetching on every mount/
// app-foreground. AppSettingsSyncBridge keeps this cache honest: it primes it
// from the persisted copy on launch and refreshes it in the background only
// when the backend's /app-settings/version counter has moved.
export function useAppSettings() {
  return useQuery(APP_SETTINGS_QUERY_KEY, getAppSettings, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}

// Reads a single content field from the cache, falling back to the app's
// bundled default when the admin hasn't set it (empty string / not loaded yet).
export function useAppSetting(
  key: keyof AppSettingsData,
  fallback: string,
): string {
  const {data} = useAppSettings();
  const value = data?.data?.[key];
  return value && value.trim() !== '' ? value : fallback;
}
