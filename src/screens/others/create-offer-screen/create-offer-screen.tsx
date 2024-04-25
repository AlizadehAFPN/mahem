import { FlatList, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Button, Checkbox, CitySelectModal, CreateAdsHeader, Divider, DurationModal, MainHeader, Row, Screen, SelectLocation, Text, TextField, UnderlineTextField } from '../../../components'
import { offerCategories } from '../../../utiles/data'
import { CategroyItem } from '../../../components/custom/category-Item/category-item'
import { colors } from '../../../theme'
import { useNavigation } from '@react-navigation/native'

export function CreateOfferScreen() {
    const {navigate} = useNavigation()
    const [state, setState] = useState({
        step: '1',
        category: '',
        images: ["", "", "", "", ""],
        durationModal: false,
        duration: {
            minutes: '',
            houres: '',
            days: ''
        },
        city: '',
        cityModal: false,
        acceptance:false

    })
    const handleSelectImage = (image, index) => {
        const images = state.images
        images[index] = image
        setState(s => ({ ...s, images }))
    }
    const handleToggleDurationModal = () => {
        setState(s => ({ ...s, durationModal: !s.durationModal }))
    }
    const handleChangeDuration = (text, label) => {
        setState(s => ({ ...s, duration: { ...s.duration, [label]: text } }))
    }
    const onSendPress = ()=>{
        navigate("createAddsPay")
    }
    return (
        <Screen withoutScroll>

            {state.step == "1" ?
                <>
                    <MainHeader title="تخفیف یاب" />
                    <FlatList
                        ListHeaderComponent={<Divider height={8} />}
                        ListFooterComponent={<Divider />}
                        data={offerCategories}
                        style={{ paddingHorizontal: 8 }}
                        ItemSeparatorComponent={<View style={{ height: 4 }} />}
                        renderItem={({ item }) =>
                            <CategroyItem
                                item={item}
                                onPress={() => setState(s => ({ ...s, category: item.title, step: '2' }))}
                            />
                        }
                    />
                </>
                :
                <>
                    <CreateAdsHeader
                        onCreatePress={onSendPress}
                        onSelectImage={handleSelectImage}
                    />
                    <Screen unsafe>
                        <View style={styles.form}>
                            <Button onPress={() => setState(s => ({ ...s, step: "1" }))}>
                                <UnderlineTextField
                                    editable={false}
                                    value={state.category}
                                    onPressIn={() => setState(s => ({ ...s, step: "1" }))}
                                />
                            </Button>
                            <Divider />
                            <UnderlineTextField
                                placeholder="عنوان آگهی (حداقل ۱۰ حرف)"
                            />
                            <Divider />
                            <UnderlineTextField
                                placeholder="درصد تخفیف"
                                keyboardType="number-pad"
                            />
                            <Divider />
                            <UnderlineTextField
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
                                placeholder="اطلاعات تماس"
                                keyboardType="number-pad"
                            />
                            <Divider />
                            <Button onPress={() => setState(s => ({ ...s, cityModal: true }))}>
                                <UnderlineTextField
                                    placeholder="تعیین موقعیت"
                                    value={state.city}
                                    editable={false}
                                    onPressIn={() => setState(s => ({ ...s, cityModal: true }))}
                                />
                            </Button>
                            <Divider />
                            <UnderlineTextField
                                placeholder="ویژگی ها"
                            />
                            <Divider />
                            <UnderlineTextField
                                placeholder="توضیحات"
                            />
                            <Divider/>
                            <View >
                                <Checkbox
                                    value={state.acceptance}
                                    onToggle={() => setState(s => ({ ...s, acceptance: !s.acceptance }))}
                                    style={{ flexDirection: 'row', alignSelf: 'center' }}
                                    text='با قوانین و شرایط موافقم'
                                />
                            </View>

                            <SelectLocation />
                        </View>


                    </Screen>
                </>
            }

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
        </Screen>
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