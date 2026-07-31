import axiosInstance from './axios-config';

export interface AppSettingsData {
  aboutText?: string;
  contactText?: string;
  telegram?: string;
  instagram?: string;
  email?: string;
  phone?: string;
}

// Global, app-wide editable content (درباره ما / تماس با ما pages + contact
// links), edited from the admin panel. Cached locally and only refetched when
// getAppSettingsVersion() moves — see AppSettingsSyncBridge, same scheme as
// categories.
export const getAppSettings = (): Promise<{data: AppSettingsData}> => {
  return axiosInstance
    .get('/app-settings')
    .then(res => ({data: res.data as AppSettingsData}));
};

// Cheap poll target for AppSettingsSyncBridge — the content rarely changes, so
// the app compares this counter against its cached value and only refetches
// the full content when it has moved.
export const getAppSettingsVersion = (): Promise<number> => {
  return axiosInstance
    .get('/app-settings/version')
    .then(res => res.data.version);
};
