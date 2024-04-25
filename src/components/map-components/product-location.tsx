import { View, Text, StyleSheet, Platform, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';


export function ProductLocation({lat, lng, ...prp }) {
    const [region, setRegion] = useState({
        latitude: 36.841746,
        longitude: 54.432560,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    })
    useEffect(()=>{
        if(lat&& lng){
            setRegion(s=>({...s, latitude: parseFloat(lat), longitude: parseFloat(lng)}))
        }
    }, [lat, lng])
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
    return (
        <MapView
            // provider={PROVIDER_GOOGLE}
            style={styles.container}
            region={region}
            {...prp}
        >
            <Marker onPress={onPress} coordinate={region} />

        </MapView>
    )
}
const styles = StyleSheet.create({
    container: {
        width: "100%",
        aspectRatio: 1,

    }
})