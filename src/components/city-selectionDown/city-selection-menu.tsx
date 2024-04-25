import { View, FlatList, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect } from 'react'
import { Menu, MenuDivider, MenuItem } from 'react-native-material-menu'
import { cities } from '../../utiles'
import { Text, Row } from '../'
import { colors } from '../../theme'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setUserCity } from '../../stateManager/reducers/user'
import { useMutation, useQuery } from 'react-query'
import { getCities, updateUser } from '../../services'
import { NativeModules } from "react-native";
const { height } = Dimensions.get('window')
export function CitySelectionMenu({ visible, onClose }) {
    const dispatch = useDispatch()
    const user = useSelector(s => s.user)
    const { data } = useQuery(["cities"], getCities)

    const { mutate } = useMutation(updateUser)

    const onSelectCity = (city) => {
        const data = { city_id: city.id }
        mutate(data, {
            onSuccess: () => {
                
            }
        })
        dispatch(setUserCity({ city: city.title, cityId: city.id }))
        onClose()
        setTimeout(() => {
            NativeModules.DevSettings.reload();
        }, 200);
        
    }

    useEffect(() => {
        if (!user.city && user.cityId && data) {
            const userCity = data.data.find(item => item.id === user.cityId)
            dispatch(setUserCity({ cityId: user.cityId, city: userCity?.title }))
        }
    }, [data])
    return (
        <Menu visible={visible} onRequestClose={onClose}>
            <View style={sytles.container}>
                <FlatList
                    data={data?.data || []}
                    renderItem={({ item }) =>
                        <>
                            <MenuItem onPress={() => onSelectCity(item)} style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: user.cityId == item.id ? colors.main : 'transparent' }}>
                                <Row style={{ flex: 1, justifyContent: 'center' }}>
                                    <Text style={{ textAlign: 'center' }}>{item.title}</Text>
                                </Row>
                            </MenuItem>
                            <MenuDivider color="white" />
                        </>
                    }
                />
            </View>

        </Menu>
    )
}
const sytles = StyleSheet.create({
    container: {
        // width: 150,
        borderWidth: 1,
        backgroundColor: colors.pallete.gray1,
        borderColor: colors.pallete.gray2,
        borderRadius: 4,
        maxHeight: height * .7
    }
})