import React, { FunctionComponent } from 'react'
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../../theme';
import IonIcon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import {StackActions} from 'react-navigation'
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width, height } = Dimensions.get('window')
const SCREEN_WIDTH = width
const sortObj={
    home:2,
    menuStack:1,
    newAdvertising:3,
    search:4,
    employee:5
}

export const MainTabBar: FunctionComponent = ({ state, descriptors, navigation }) => {
    // const { newRequests } = useSelector(state => state.requests)
    const insets = useSafeAreaInsets()
    const renderIcon = (route: string, isFocused: boolean) => {
        switch (route) {
            case 'home': return <SimpleLineIcons size={25} name="menu" color="white" /> 
            case 'menuStack': return <Entypo size={25} name="home" color="white" />
            case 'search': return <MaterialIcons size={25} name="search" color="white" />
            case 'employee': return <IonIcon size={25} color="white" name="grid" />
            default: return null
        }
    }
    if(state.index == 2 && !state.routes[2]?.state?.index) return null
    return (
        <View style={{ zIndex: 0, }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', justifyContent: 'space-around', paddingVertical: 10, elevation: 10, backgroundColor: colors.main, paddingBottom: Platform.OS=="ios"? insets.bottom: 10  }}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!event.defaultPrevented) {
                            const navTarget = route.name == 'home'? "menuStack": route.name=="menuStack"? "home": route.name
                                navigation.navigate({ name: navTarget, merge: true });                        
                            // The `merge: true` option makes sure that the params inside the tab screen are preserved
                            // navigation.navigate({ name: route.name, merge: true });
                            // navigation.dispatch(StackActions.popToTop());
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };
                    if(route.name=="newAdvertising")return (
                        <TouchableOpacity
                        activeOpacity={1}
                            style={{ flex:3, justifyContent:'center', alignItems:"center" }}
                            // accessibilityRole="button"
                            // accessibilityState={isFocused ? { selected: true } : {}}
                            // accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            key={index}
                        >
                            <View
                                style={{width: 73, height:73, borderRadius: 40, marginTop: -40, backgroundColor:colors.main, justifyContent:'center', alignItems:'center'}}
                            >
                                
                               <Entypo name="plus" color="white" size={40} style={{marginTop: -8}} />
                            </View>
                        </TouchableOpacity>
                    )

                    return (
                        <TouchableOpacity
                            style={{ paddingHorizontal: 20, alignItems: 'center',flex:1 }}
                            // accessibilityRole="button"
                            // accessibilityState={isFocused ? { selected: true } : {}}
                            // accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            key={index}
                        >
                            <View
                                style={{}}
                            >
                                
                                {renderIcon(route.name, isFocused)}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    indicator: {
        position: 'absolute',
        top: -20,
        width: 55,
        height: 4,
        borderBottomEndRadius: 5,
        borderBottomStartRadius: 5,
        backgroundColor: "white",
        justifyContent:'center',
        alignItems:'center'
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "white",
        marginTop:8,
        // borderRadius:2
    },
})

