import { Alert, FlatList, StyleSheet, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { AdsOptionsModal, Button, Checkbox, CitySelectModal, CreateAdsHeader, Divider, DurationModal, MainHeader, Row, Screen, SelectLocation, Text, TextField, UnderlineTextField } from '../../components'
import { colors } from '../../theme'
import { useNavigation } from '@react-navigation/native'
import { SelectAdsCategory } from '../../components'

export function OfferForm({ send, onSend }) {
    const { navigate } = useNavigation()
    const [state, setState] = useState({
        title: "",
        price: '',
        discount: '',
        features: '',
        description: '',
        contact_info: '',
        duration: {
            minutes: '',
            houres: '',
            days: ''
        },
        city: '',
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
                const { title, description, duration, price, discount, features, contact_info, city } = state
                const tempDuration = duration.days * 24 * 60 * 60 + duration.houres * 60 * 60 + duration.minutes * 60
                const price_with_discount = price * discount / 100
                onSend({ title, description, features, contact_info, city_id: city?.id, duration: tempDuration, price_with_discount, price, })
            } else {
                onSend(false)
            }
        }
    }, [send])
    const handleValidation = () => {
        let isValid = true
        const { title, city, contact_info, price, discount, duration } = state
        if (!title) {
            isValid = false
            Alert.alert("عنوان را وارد کنید")
        } else if (!price) {
            isValid = false
            Alert.alert("قیمت را وارد کنید")
        } else if (!discount) {
            isValid = false
            Alert.alert("درصد تخفیف را وارد کنید")
        } else if (!duration) {
            isValid = false
            Alert.alert("مدت زمان تخفیف را وارد کنید")
        } else if (!city) {
            isValid = false
            Alert.alert("شهر را وارد کنید")
        } else if (!contact_info) {
            isValid = false
            Alert.alert("اطلاعات تماس را وارد کنید")
        }
        return isValid
    }

    const handleToggleDurationModal = () => {
        setState(s => ({ ...s, durationModal: !s.durationModal }))
    }
    const handleChangeDuration = (text, label) => {
        setState(s => ({ ...s, duration: { ...s.duration, [label]: text } }))
    }

    return (
        <>
            <View>

                <UnderlineTextField
                    value={state.title}
                    onChangeText={text => setState(s => ({ ...s, title: text }))}
                    placeholder="عنوان آگهی (حداقل ۱۰ حرف)"
                />
                <Divider />
                <UnderlineTextField
                    value={state.discount}
                    onChangeText={text => setState(s => ({ ...s, discount: text }))}
                    placeholder="درصد تخفیف"
                    keyboardType="number-pad"
                />
                <Divider />
                <UnderlineTextField
                    value={state.price}
                    onChangeText={text => setState(s => ({ ...s, price: text }))}
                    placeholder="قیمت اصلی"
                    keyboardType="number-pad"
                />
                <Divider />
                <Button onPress={handleToggleDurationModal}>
                    {!state.duration.minutes && !state.duration.houres && !state.duration.days ? <UnderlineTextField
                        editable={false}
                        placeholder="مدت زمان تخفیف"
                    /> :
                        <Row style={styles.duration}>
                            <Text>{state.duration.days || "0"} روز</Text>
                            <View style={{ width: 10 }} />
                            <Text>{state.duration.houres || "0"} ساعت</Text>
                            <View style={{ width: 10 }} />
                            <Text>{state.duration.minutes || "0"} دقیقه</Text>
                        </Row>
                    }
                </Button>
                <Divider />
                <UnderlineTextField
                    value={state.features}
                    onChangeText={text => setState(s => ({ ...s, features: text }))}
                    placeholder="ویژگی ها"
                />
                <Divider />
                <UnderlineTextField
                    value={state.contact_info}
                    onChangeText={text => setState(s => ({ ...s, contact_info: text }))}
                    placeholder="اطلاعات تماس"
                    keyboardType="number-pad"
                />
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
                    onChangeText={text => setState(s => ({ ...s, description: text }))}
                    placeholder="توضیحات"
                />

            </View>

            <DurationModal
                visible={state.durationModal}
                onClose={handleToggleDurationModal}
                onChangeText={handleChangeDuration}
            />
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