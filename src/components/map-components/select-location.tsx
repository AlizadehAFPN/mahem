import {StyleSheet, Platform, Linking} from 'react-native';
import React, {useState} from 'react';
import MapView, {Marker} from 'react-native-maps';

export interface SelectLocationProps {
  onSelect?: any;
  prp?: any;
  // Everything else is forwarded verbatim to the component underneath
  // (a `...prp` rest parameter, or the underlying library's own props).
  // Declaring that here is what lets callers keep passing style,
  // zoomEnabled, radius and the rest — they were never this component's
  // props to begin with.
  [key: string]: any;
}

export function SelectLocation({onSelect, ...prp}: SelectLocationProps) {
  const [region] = useState({
    latitude: 36.841746,
    longitude: 54.43256,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [state, setState] = useState<{lat: number | null; lng: number | null}>({
    lat: null,
    lng: null,
  });
  const onPress = () => {
    const scheme = Platform.select({ios: 'maps:?q=', android: 'geo:0,0?q='});
    const latLng = `${region.latitude},${region.longitude}`;
    const label = '';
    const url = Platform.select({
      ios: `${scheme}${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    //
    if (url) {
      Linking.openURL(url);
    }
  };
  const handleMapPress = ({nativeEvent}: any) => {
    const {latitude, longitude} = nativeEvent.coordinate;
    onSelect(latitude, longitude);
    setState(s => ({...s, lat: latitude, lng: longitude}));
  };
  return (
    <MapView
      // provider={PROVIDER_GOOGLE}
      style={styles.container}
      onPress={handleMapPress}
      region={{
        latitude: 36.841746,
        longitude: 54.43256,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      {...prp}>
      {state.lat !== null && state.lng !== null && (
        <Marker
          onPress={onPress}
          coordinate={{latitude: state.lat, longitude: state.lng}}
        />
      )}
    </MapView>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
});
