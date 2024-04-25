import { Alert, FlatList, StyleSheet, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { AdsOptionsModal, Button, Checkbox, CitySelectModal, CreateAdsHeader, Divider, DurationModal, MainHeader, Row, Screen, SelectLocation, Text, TextField, UnderlineTextField, optionsTypes } from '../../components'
import { colors } from '../../theme'
import { useNavigation } from '@react-navigation/native'
import { SelectAdsCategory } from '../../components'

export function EstateForm({ subCategory, subsubCategory, send, onSend }) {
    const { navigate } = useNavigation()
    const [state, setState] = useState({
        title: '',
        contact_info: '',
        area: '',
        adsType: '',
        adsCreator: '',
        description:'',
        floor: '',
        elevator: '',
        parking: '',
        suburb: '',
        price: '',
        features: '',
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
                const { title,suburb, parking, floor, elevator, description, price, adsType, contact_info, city, adsCreator } = state
                const ad_type = optionsTypes.adsType.findIndex(item => item.title === adsType)
                const suburbs = suburb == "هست"
                const tempParking = optionsTypes.parking.findIndex(item => item.title === parking)
                const tempFloor = optionsTypes.floor.findIndex(item => item.title === floor)
                const tempEelevator = optionsTypes.elevator.findIndex(item => item.title === elevator)
                const by_person = adsCreator=="شخصی"
                onSend({ title, suburbs, parking: tempParking, floor: tempFloor, elevator: tempEelevator, by_person, description, price, contact_info, city_id: city?.id, ad_type})
            } else {
                onSend(false)
            }
        }
    }, [send])
    const handleValidation = () => {
        let isValid = true
        const { title, city, contact_info, } = state
        if (!title) {
            isValid = false
            Alert.alert("عنوان را وارد کنید")
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
            <View>
                <UnderlineTextField
                    value={state.title}
                    onChangeText={text => setState(s => ({ ...s, title: text }))}
                    placeholder="عنوان آگهی (حداقل ۱۰ حرف)"
                />

                {!subCategory?.title?.includes("عقد مشارکت") && <>
                    <Divider />
                    <UnderlineTextField
                    value={state.area}
                    onChangeText={text => setState(s => ({ ...s, area: text }))}
                        keyboardType="number-pad"
                        placeholder="متراژ (متر مربع)"
                    />
                    <Divider />
                    {/* <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'price' }))}> */}
                        <UnderlineTextField
                            // onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'price' }))}
                            value={state.price}
                    onChangeText={text => setState(s => ({ ...s, price: text }))}
                            keyboardType="number-pad"
                            placeholder="قیمت"
                            // editable={false}
                        />
                    {/* </Button> */}
                    <Divider />
                    <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'adsType' }))}>
                        <UnderlineTextField
                            onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'adsType' }))}
                            editable={false}
                            placeholder="نوع آگهی"
                            value={state.adsType}
                        />
                    </Button>
                    <Divider />
                    <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'adsCreator' }))}>
                        <UnderlineTextField
                            onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'adsCreator' }))}
                            editable={false}
                            placeholder="نوع آگهی دهنده"
                            value={state.adsCreator}
                        />
                    </Button>
                </>
                }

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
                        onPressIn={() => setState(s => ({ ...s, cityModal: true }))}
                        placeholder="تعیین موقعیت"
                        value={state?.city?.title}
                        editable={false}
                    />
                </Button>

                <Divider />
                <UnderlineTextField
                value={state.description}
                onChangeText={text => setState(s => ({ ...s, description: text }))}
                    placeholder="توضیحات"
                />
                {
                    !subCategory?.title?.includes("عقد مشارکت") && <>
                        {!subsubCategory?.title?.includes("زمین") &&
                            <>
                                <Divider />
                                <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'floor' }))}>
                                    <UnderlineTextField
                                        onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'floor' }))}
                                        editable={false}
                                        placeholder="طبقه"
                                        value={state.floor}
                                    />
                                </Button>
                                <Divider />
                                <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'elevator' }))}>
                                    <UnderlineTextField
                                        onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'elevator' }))}
                                        editable={false}
                                        placeholder="آسانسور"
                                        value={state.elevator}
                                    />
                                </Button>
                                <Divider />
                                <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'parking' }))}>
                                    <UnderlineTextField
                                        onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'parking' }))}
                                        editable={false}
                                        placeholder="پارکینگ"
                                        value={state.parking}
                                    />
                                </Button>

                            </>
                        }
                        <Divider />
                        <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'suburb' }))}>
                            <UnderlineTextField
                                onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'suburb' }))}
                                editable={false}
                                placeholder="حومه شهر"
                                value={state.suburb}
                            />
                        </Button>
                    </>
                }
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