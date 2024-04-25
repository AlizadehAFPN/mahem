import { View, StyleSheet, FlatList } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Screen, Text, Row, Checkbox, Divider, Button } from '../../components'
import { colors } from '../../theme'
import { cities } from '../../utiles'
import { useDispatch } from 'react-redux'
import { setUser } from '../../stateManager/reducers/user'
import { useNavigation } from '@react-navigation/native'
import { useMutation, useQuery } from 'react-query'
import { getCities, updateUser } from '../../services'

export function CitySelectionScreen() {
    const dispatch = useDispatch()
    const {replace} = useNavigation()
    const [state, setState] = useState({
        gender: '',
        city: ''
    })

    const {mutate} = useMutation(updateUser)
    const {data} = useQuery(["cities"], getCities)
    const handleNext = ()=>{
        const data = {city_id: state.city.id, sex: state.gender=="man"? 1:0}
        mutate(data)
        dispatch(setUser({cityId: state.city.id, city: state.city.title, gender: state.gender}))
        replace('splash')
    }
    const handleValidation = ()=>{
        const {city, gender} = state
        if(!city|| !gender)return false
        return true
    }

    const buttonEnabled = useCallback(handleValidation, [state.city, state.gender])
    return (
        <Screen style={{ flex: 1 }} statusbarBackgroundColor={colors.main}>
            <View style={sytles.topColor}>
                <Text style={{ textAlign: 'center' }} preset='default' size={20} color="white">برای سرویس دهی بهتر لطفا فرم زیر را پر کنید.</Text>
            </View>
            <View style={sytles.formContainer}>
                <Text size={18}>جنسیت:</Text>
                <Row style={{ paddingHorizontal: 32 }}>
                    <Checkbox
                        value={state.gender == "man"}
                        text="مرد"
                        onToggle={() => setState(s => ({ ...s, gender: 'man' }))}
                    />
                    <Divider style={{ width: 20 }} />
                    <Checkbox
                        value={state.gender == "woman"}
                        text="زن"
                        onToggle={() => setState(s => ({ ...s, gender: 'woman' }))}
                    />
                </Row>
                <Divider />
                <Text size={18}>شهر اقامت:</Text>
                <View style={{ paddingHorizontal: 32 }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={data?.data}
                        keyExtractor={item => item.title}
                        renderItem={({ item, index }) =>
                            <Checkbox
                                text={item.title}
                                value={state.city.id == item.id}
                                onToggle={()=> setState(s=>({...s, city: item}))}
                            />
                        }
                        ListFooterComponent={<Divider height={500} />}
                    />
                </View>
            </View>
            <Button onPress={handleNext} disabled={!buttonEnabled()} style={{...sytles.button, backgroundColor: buttonEnabled()? colors.main:colors.pallete.gray1, borderWidth: buttonEnabled()?0:1 }}>
                <Text size={17} color={buttonEnabled()? "white":'black'}>تایید</Text>
            </Button>
        </Screen>
    )
}
const sytles = StyleSheet.create({
    topColor: {
        backgroundColor: colors.main,
        height: 137,
        padding: 16,
        justifyContent: "center"
    },
    cammeraButton: {
        width: 94,
        height: 94,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -47,
        alignSelf: "center",
        backgroundColor: colors.pallete.gray1,
        overflow: 'hidden'
    },
    formContainer: {
        paddingHorizontal: 32,
        paddingTop: 16
    },
    button: {
        height: 50,
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        borderColor: colors.pallete.gray2,
        backgroundColor: colors.main,
        justifyContent: "center",
        alignItems: 'center',
    },
    codeContainer: {
        alignItems: 'center',

    }
})