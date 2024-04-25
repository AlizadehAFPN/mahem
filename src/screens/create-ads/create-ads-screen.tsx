import { Alert, FlatList, StyleSheet, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { AdsOptionsModal, Button, CarForm, Checkbox, CitySelectModal, CommonForm, CreateAdsHeader, Divider, DurationModal, EmployeeForm, EstateForm, MainHeader, OfferForm, Row, Screen, SelectLocation, Text, TextField, UnderlineTextField } from '../../components'
import { colors } from '../../theme'
import { useNavigation } from '@react-navigation/native'
import { SelectAdsCategory } from '../../components'
import { useMutation, useQuery } from 'react-query'
import { createAds, getMyStore, upload } from '../../services'

export function CreateAdsScreen() {
    const { navigate } = useNavigation()
    const [state, setState] = useState({
        step: '1',
        mainCategory: '',
        subCategory: '',
        subsubCategory: '',
        images: ["", "", "", "", ""],
        education: '',
        contractType: '',
        adsType: '',
        adsCreator: '',
        floor: '',
        elevator: '',
        parking: '',
        suburb: '',
        price: '',
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
        optionModal: false,
        send:'no'

    })

    const { mutate } = useMutation(upload)
    const { mutate: createAdsMutate } = useMutation(createAds)
    const {data: myStores} = useQuery('myStore', getMyStore)
    const handleSelectImage = (image, index) => {
        // const images = state.images
        // images[index] = image
        // // setState(s => ({ ...s, images }))
        const { fileName, type, uri } = image
        const doc = { name: fileName, type, uri }
        const form = new FormData()
        form.append("file", doc)
        const images = state.images
        mutate(form, {
            onSuccess: (data) => {
                images[index] = data?.data
                setState(s => ({ ...s, images }))
            }
        })
    }




    const onSendPress = () => {
        setState(s=>({...s, send:`send-${new Date()}`}))
        // if(state?.mainCategory?.title == "استخدامی"|| state?.mainCategory?.title=="تخفیف یاب"){
        //     navigate("createAddsPay")
        // }else{
        //     navigate("createAdsFinal")
        // }
        
    }
    const onToggleSelectCategory = () => {
        setState(s => ({ ...s, selectCategoryModal: !s.selectCategoryModal, send:'no' }))
    }

    const hanldeCreateAd = (data)=>{
        if(data){
            const {images, mainCategory, lat, lng} = state
            if(mainCategory?.title?.includes("تخفیف")&& (myStores?.data?.length ===0|| !myStores)){
                return Alert.alert("برای ایجاد تخفیف ابتدا باید یک فروشگاه تخفیف بسازید!")
            }
            if(!mainCategory){
                return Alert.alert("دسته بندی را انتخاب کنید")
            
            }else if (!lat|| !lng){
                return Alert.alert("موقعیت را از روی نقشه انتخاب کنید")
            }
            let imageData = {}
            images.forEach((item, index)=> {
                if(!!item){
                    imageData[`image_${index+1}`]= item.id
                }
            })
            const payload = {category_id: mainCategory.id, ...imageData, ...data, lat, lng}
            // return console.log(payload )
            if(mainCategory?.title?.includes("تخفیف")){
                payload.store= myStores?.data?.[0]?.id
            }
            createAdsMutate(payload, {
                onSuccess:data=>{
                    console.log(data)
                    navigate("createAdsFinal")
                }
            })
        }
    }

    const groupTitle = useMemo(() => {
        let title = ""
        if (state.mainCategory) {
            title = state?.mainCategory?.title
        }
        if (state.subCategory) {
            title = title + ':' + state?.subCategory?.title
        }
        if (state.subsubCategory) {
            title = title + ':' + state?.subsubCategory?.title
        }
        return title
    }, [state.mainCategory, state.subCategory, state.subsubCategory])
    return (
        <Screen withoutScroll>
            <CreateAdsHeader
                onBack = {()=> navigate("home")}
                onCreatePress={onSendPress}
                onSelectImage={handleSelectImage}
            />
            <Screen unsafe>
                <View style={styles.form}>
                    <Button onPress={onToggleSelectCategory}>
                        <UnderlineTextField
                            placeholder="انتخاب گروه"
                            editable={false}
                            value={state.mainCategory ? groupTitle : undefined}
                        // value={`${state.mainCategory} ${state.subCategory&& "/"+ state.subCategory} ${state.subsubCategory && "/"+ state.subsubCategory}`}
                        />
                    </Button>
                    <Divider />

                    {state?.mainCategory?.title?.includes("استخدامی") ? <EmployeeForm send={state.send}  onSend={hanldeCreateAd} /> :
                        state?.mainCategory?.title?.includes("تخفیف یاب") ? <OfferForm send={state.send}  onSend={hanldeCreateAd}  /> :
                            state?.mainCategory?.title?.includes("وسایل نقلیه") ? <CarForm send={state.send}  onSend={hanldeCreateAd} subCategory={state.subCategory} /> :
                                state?.mainCategory?.title?.includes("املاک") ? <EstateForm send={state.send}  onSend={hanldeCreateAd}
                                    subCategory={state.subCategory}
                                    subsubCategory={state.subsubCategory}
                                /> :
                                    <CommonForm send={state.send}  onSend={hanldeCreateAd}  mainCategory={state.mainCategory} />
                    }


                    <Divider />
                    <View >
                        <Checkbox
                            value={state.acceptance}
                            onToggle={() => setState(s => ({ ...s, acceptance: !s.acceptance }))}
                            style={{ flexDirection: 'row', alignSelf: 'center' }}
                            text='با قوانین و شرایط موافقم'
                        />
                    </View>

                    <SelectLocation 
                     onSelect={(lat, lng) => setState(s => ({ ...s, lat, lng }))}
                    />
                </View>


            </Screen>


            <SelectAdsCategory
                onSelect={(m, sc, ssc) => setState(s => ({ ...s, mainCategory: m, subCategory: sc, subsubCategory: ssc }))}
                onClose={onToggleSelectCategory}
                visible={state.selectCategoryModal}
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