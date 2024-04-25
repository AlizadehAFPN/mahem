import { View, Text, StyleSheet, Platform, Linking } from 'react-native'
import React, { useState } from 'react'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';


export function SelectLocation({onSelect,  ...prp }) {
    const [region, setRegion] = useState({
        latitude: 36.841746,
        longitude: 54.432560,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    })
    const [state,setState] = useState({
        lat:"",
        lng:"",
    })
    const onPress = () => {
        const scheme = Platform.select({ ios: 'maps:?q=', android: 'geo:0,0?q=' });
        const latLng = `${region.latitude},${region.longitude}`;
        const label = '';
        const url = Platform.select({
            ios: `${scheme}${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });
        //  
        Linking.openURL(url);
    };
    const handleMapPress = ({nativeEvent}) => {
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
                longitude: 54.432560,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }}
            {...prp}
        >
            {state.lat && state.lng &&<Marker onPress={onPress} coordinate={{latitude: state.lat, longitude: state.lng}} />}

        </MapView>
    )
}
const styles = StyleSheet.create({
    container: {
        width: "100%",
        aspectRatio: 1,

    }
})