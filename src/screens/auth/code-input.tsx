import { View, StyleSheet } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Screen, Text, CodeFields, Divider, Button } from '../../components'
import { colors } from '../../theme'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from 'react-query'
import { sendActivationCode } from '../../services'
import { setUser } from '../../stateManager/reducers/user'

export function CodeInput() {
    const {replace} = useNavigation()
    const dispatch = useDispatch()
    const {params} = useRoute()
    const user = useSelector(s=> s.user)
    const [state,setState] = useState({
        code:""
    })

    const {mutate, isLoading} = useMutation(sendActivationCode)

    const handleNext = ()=>{
        const isValid = handleValidation()
        if(isValid){
            const data = {mobile: params.mobile, activation_code: state.code}
            mutate(data, {
                onSuccess: (data)=>{
                    console.log(data, 'date')
                    dispatch(setUser(data.data))
                    replace("citySelection")
                }
            })
        }
        
    }
    const handleValidation = ()=>{
        if(state.code.length<4){
            return false
        }
        return true
    }
    const enableButton = useCallback(handleValidation, [state.code])
    return (
        <Screen style={{ flex: 1 }} statusbarBackgroundColor={colors.main}>
            <View style={sytles.topColor}>
                <Text style={{ textAlign: 'center' }} preset='default' size={20} color="white">لطفا برای تکمیل ثبت نام در ماهم کد چهار رقمی فعال سازی را وارد نمایید.</Text>
            </View>
            <View style={sytles.formContainer}>
                <Divider />
                <View style={sytles.codeContainer}>
                    <CodeFields
                        cellcount={4}
                        value={state.code}
                        setValue={(value)=> setState(s=>({...s, code: value})) }
                    />
                </View>
                <Divider height={100} />
                <Button loading={isLoading} disabled={!enableButton()|| isLoading} onPress={handleNext} style={{...sytles.button, backgroundColor: enableButton()? colors.main: colors.pallete.gray1}}>
                    <Text color={enableButton()? "white": "black"} size={20}>تایید نهایی</Text>
                </Button>
            </View>
        </Screen>
    )
}
const sytles = StyleSheet.create({
    topColor: {
        backgroundColor: colors.main,
        height: 137,
        padding: 16
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
        paddingHorizontal: 16,
        paddingTop: 16
    },
    button: {
        height: 50,
        width: '50%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: colors.pallete.gray2,
        backgroundColor: colors.pallete.gray1,
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: 8
    },
    codeContainer:{
        alignItems:'center',

    }
})