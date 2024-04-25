import { Alert, FlatList, StyleSheet, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { AdsOptionsModal, Button, Checkbox, CitySelectModal, CreateAdsHeader, Divider, DurationModal, MainHeader, Row, Screen, SelectLocation, Text, TextField, UnderlineTextField, optionsTypes } from '../../components'
import { colors } from '../../theme'
import { useNavigation } from '@react-navigation/native'
import { SelectAdsCategory } from '../../components'

export function CommonForm({ mainCategory, send, onSend }) {
    const { navigate } = useNavigation()
    const [state, setState] = useState({
        title: '',
        description: '',
        contact_info: '',
        city: '',
        adsType: '',
        price: '',
        cityModal: false,
        acceptance: false,
        selectCategoryModal: false,
        durationModal: false,
        optionType: '',
        optionModal: false
    })

    useEffect(() => {
        if (send?.includes("send")) {
            const isValid = handleValidation()
            if (isValid) {
                const { title, description, price, adsType, contact_info, city } = state
                const degree = optionsTypes.adsType.findIndex(item => item.title === adsType)
                
                onSend({ title, description, price, contact_info, city_id: city?.id })
            } else {
                onSend(false)
            }
        }
    }, [send])
    const handleValidation = () => {
        let isValid = true
        const { title, city, contact_info, price, } = state
        if (!title) {
            isValid = false
            Alert.alert("عنوان را وارد کنید")
        }else if (!price) {
            isValid = false
            Alert.alert("قیمت را وارد کنید")
        } else if (!city) {
            isValid = false
            Alert.alert("شهر را وارد کنید")
        } else if (!contact_info) {
            isValid = false
            Alert.alert("اطلاعات تماس را وارد کنید")
        }
        return isValid
    }

    return (
        <>
            <View >
                <UnderlineTextField
                    value={state.title}
                    onChangeText={text => setState(s => ({ ...s, title: text }))}
                    placeholder="عنوان آگهی (حداقل ۱۰ حرف)"
                />
                <Divider />
                <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'adsType' }))}>
                    <UnderlineTextField
                        onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'adsType' }))}
                        editable={false}
                        placeholder="نوع آگهی"
                        value={state.adsType}
                    />
                </Button>
                {mainCategory && <>
                    <Divider />
                    <UnderlineTextField
                    value={state.price}
                    onChangeText = {text=> setState(s=>({...s, price: text}))}
                        placeholder='قیمت'
                        value={state.price}
                    />
                    <Divider />
                    <UnderlineTextField
                    value={state.contact_info}
                    onChangeText = {text=> setState(s=>({...s, contact_info: text}))}
                        placeholder="اطلاعات تماس"
                        keyboardType="number-pad"
                    />
                </>}
                <Divider />
                <Button onPress={() => setState(s => ({ ...s, cityModal: true }))}>
                    <UnderlineTextField
                        placeholder="تعیین موقعیت"
                        value={state?.city?.title}
                        editable={false}
                        onPressIn={() => setState(s => ({ ...s, cityModal: true }))}
                    />
                </Button>

                <Divider />
                <UnderlineTextField
                value={state.description}
                onChangeText = {text=> setState(s=>({...s, description: text}))}
                    placeholder="توضیحات"
                />
            </View>
            <CitySelectModal
                onSelect={(city) => setState(s => ({ ...s, city, cityModal: false }))}
                visible={state.cityModal}
                onClose={() => setState(s => ({ ...s, cityModal: false }))}
            />
            <AdsOptionsModal
                type={state.optionType}
                visible={state.optionModal}
                onSelect={(item) => setState(s => ({ ...s, [s.optionType]: item }))}
                onClose={() => setState(s => ({ ...s, optionModal: false }))}
            />

        </>
    )
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.main
    },
    form: {
        paddingHorizontal: 12,
        paddingVertical: 10
    },
    duration: {
        borderBottomWidth: 1,
        borderColor: colors.pallete.red2,
        marginHorizontal: 10,
        height: 30,
        paddingHorizontal: 5
    }
})