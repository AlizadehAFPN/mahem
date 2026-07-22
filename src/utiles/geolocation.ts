import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coords {
  lat: number;
  lng: number;
}

// Asks for foreground location permission. On iOS the native prompt is driven
// by Geolocation itself (backed by the Info.plist usage string); on Android we
// request ACCESS_FINE_LOCATION explicitly. Returns whether permission is granted.
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'دسترسی به موقعیت مکانی',
          message:
            'برای نمایش تخفیف‌های نزدیک شما، به موقعیت مکانی‌تان نیاز داریم.',
          buttonPositive: 'باشه',
          buttonNegative: 'انصراف',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  // iOS: authorization is requested implicitly on first getCurrentPosition;
  // ask upfront so the prompt appears before we need a fix.
  return new Promise(resolve => {
    try {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
    } catch {
      resolve(true);
    }
  });
}

// Resolves the device's current position, requesting permission first. Rejects
// if permission is denied or the fix times out, so callers can fall back to
// the city center or a default region.
export async function getCurrentPosition(): Promise<Coords> {
  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('LOCATION_PERMISSION_DENIED');
  }
  return new Promise<Coords>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({lat: pos.coords.latitude, lng: pos.coords.longitude}),
      err => reject(err),
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 60000},
    );
  });
}
