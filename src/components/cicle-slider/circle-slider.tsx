import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import CircularProgress,{CircularProgressWithChild} from 'react-native-circular-progress-indicator';
export const CirleSlider = ({value,radius=40, children, ...res}) => {
    return (
        <View>
            <CircularProgressWithChild radius={radius} value={value} {...res} >
                {children}
            </CircularProgressWithChild>
        </View>
    );
};

const styles = StyleSheet.create({});