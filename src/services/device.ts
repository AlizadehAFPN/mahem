import {Platform} from 'react-native';
import axiosInstance from './axios-config';

// Registers this device's FCM token so the backend can push nearby-discount
// alerts to it. Safe to call repeatedly (backend upserts on the token).
export const registerDeviceToken = (token: string) =>
  axiosInstance.post('/device-tokens', {
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
  });

export const unregisterDeviceToken = (token: string) =>
  axiosInstance.delete(`/device-tokens/${encodeURIComponent(token)}`);

// Stores the device's last known location so the backend knows whether a
// newly-approved discount is within this user's alert radius.
export const updateMyLocation = (lat: number, lng: number) =>
  axiosInstance.patch('/users/me/location', {lat, lng});

export const updateAlertRadius = (alertRadiusKm: number) =>
  axiosInstance.patch('/users/me/alert-radius', {alertRadiusKm});
