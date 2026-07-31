import {StyleSheet, Platform, Linking} from 'react-native';
import React, {useEffect, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';

export interface ProductLocationProps {
  lat?: any;
  lng?: any;
  prp?: any;
  // Everything else is forwarded verbatim to the component underneath
  // (a `...prp` rest parameter, or the underlying library's own props).
  // Declaring that here is what lets callers keep passing style,
  // zoomEnabled, radius and the rest — they were never this component's
  // props to begin with.
  [key: string]: any;
}

export function ProductLocation({lat, lng, ...prp}: ProductLocationProps) {
  const [region, setRegion] = useState({
    latitude: 36.841746,
    longitude: 54.43256,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  useEffect(() => {
    if (lat && lng) {
      setRegion(s => ({
        ...s,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      }));
    }
  }, [lat, lng]);
  const onPress = () => {
    const scheme = Platform.select({ios: 'maps:?q=', android: 'geo:0,0?q='});
    const latLng = `${region.latitude},${region.longitude}`;
    const label = '';
    const url = Platform.select({
      ios: `${scheme}${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    //
    Linking.openURL(url);
  };
  return (
    <MapView
      // provider={PROVIDER_GOOGLE}
      style={styles.container}
      region={region}
      {...prp}>
      <Marker onPress={onPress} coordinate={region} />
    </MapView>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
});
