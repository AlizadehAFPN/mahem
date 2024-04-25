import { View, StyleSheet, Image, Touchable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { CitySelectionMenu, Row, Text } from '../'
import { colors } from '../../theme'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useSelector } from 'react-redux'
export function MainHeader({ showLocation, title }) {
    const user = useSelector(s => s.user)
    const [state, setState] = useState({
        modalVisible: false
    })
    const toggleModalVisible = () => {
        setState(s => ({ ...s, modalVisible: !s.modalVisible }))
    }
    return (
        <Row style={styles.container}>
            <Row style={{ alignItems: 'flex-end' }}>
                <Image source={require('../../assets/images/logo.png')} />
                <Text size={15} style={{paddingHorizontal: 8}} color="white">
                    {title}
                </Text>

            </Row>
            {showLocation ? <TouchableOpacity onPress={toggleModalVisible}>
                <Row style={{ alignItems: 'flex-end' }}>
                    <Text color="white">
                        {user.city}
                    </Text>
                    <Ionicons color={"white"} name="location" size={30} />
                </Row>
                <CitySelectionMenu
                    onClose={toggleModalVisible}
                    visible={state.modalVisible}
                />
            </TouchableOpacity> :
                <View />}


        </Row>
    )
}
const styles = StyleSheet.create({
    container: {
        height: 48,
        backgroundColor: colors.main,
        justifyContent: "space-between",
        paddingHorizontal: 10
    }
})