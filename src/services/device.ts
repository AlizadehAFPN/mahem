import {Platform} from 'react-native';
import axiosInstance from './axios-config';

// The backend caps each metadata field, and rejects the whole registration if
// one overflows. Trim + clamp everything here so a chatty OEM value can never
// cost us the push token.
const clamp = (value: unknown, max: number): string =>
  String(value).trim().slice(0, max);

// Best-effort device metadata so the admin panel can show a human-readable
// device list per user. Everything is wrapped defensively (lazy require +
// try/catch) so a not-yet-installed native module never breaks registration —
// the token still registers, just with less metadata.
function getDeviceMeta(): Record<string, string> {
  const meta: Record<string, string> = {};

  try {
    // expo-device (optional): friendly name + model. Run
    // `npx expo install expo-device` and rebuild to populate these.
    const Device = require('expo-device');
    if (Device?.deviceName) meta.deviceName = clamp(Device.deviceName, 200);
    if (Device?.modelName) meta.deviceModel = clamp(Device.modelName, 200);
    if (Device?.osVersion) meta.osVersion = clamp(Device.osVersion, 50);
  } catch {
    // expo-device not installed — fall back to Platform below.
  }

  // Deliberately not using expo-device's `osName`: on Android API >= 23 it
  // returns Build.VERSION.BASE_OS, which most OEM ROMs fill with the full build
  // fingerprint ("Xiaomi/vayu/vayu:11/RKQ1…:user/release-keys") rather than
  // "Android". Platform.OS is the value the admin list actually wants.
  meta.osName = Platform.OS === 'ios' ? 'iOS' : 'Android';
  if (!meta.osVersion && Platform.Version != null) {
    meta.osVersion = clamp(Platform.Version, 50);
  }

  try {
    const Application = require('expo-application');
    if (Application?.nativeApplicationVersion) {
      meta.appVersion = clamp(Application.nativeApplicationVersion, 50);
    }
  } catch {
    // expo-application unavailable — skip app version.
  }

  // Drop anything that clamped down to an empty string — the backend requires
  // a minimum length of 1 on every optional field.
  return Object.fromEntries(Object.entries(meta).filter(([, v]) => v.length));
}

// Registers this device's FCM token so the backend can push notifications to
// it. Safe to call repeatedly (backend upserts on the token) and also refreshes
// the stored device metadata each time.
export const registerDeviceToken = (token: string) =>
  axiosInstance.post('/device-tokens', {
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    ...getDeviceMeta(),
  });

export const unregisterDeviceToken = (token: string) =>
  axiosInstance.delete(`/device-tokens/${encodeURIComponent(token)}`);

// Stores the device's last known location so the backend knows whether a
// newly-approved discount is within this user's alert radius.
export const updateMyLocation = (lat: number, lng: number) =>
  axiosInstance.patch('/users/me/location', {lat, lng});

export const updateAlertRadius = (alertRadiusKm: number) =>
  axiosInstance.patch('/users/me/alert-radius', {alertRadiusKm});
