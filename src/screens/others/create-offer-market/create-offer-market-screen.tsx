import { ActivityIndicator, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import {
    Divider, GradiantHeader,
    MainHeader,
    Screen,
    FilePickerModal,
    TextField,
    Text,
} from '../../../components'
import { boldFont, colors } from '../../../theme'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import { useNavigation } from '@react-navigation/native'
import { createStore, upload } from '../../../services'
import { useMutation } from 'react-query'
const { width } = Dimensions.get('window')
export function CreateOfferMarketScreen() {
    const { navigate, goBack } = useNavigation()
    const [state, setState] = useState({
        banner: '',
        avatar: '',
        title: '',
        tempSelect: '',
        filePickerModal: false,
        uploadedBanner: undefined,
        uploadedLogo: undefined,
    })
    const { mutate: storeMutate, isLoading } = useMutation(createStore)
    const { mutate, isLoading: uploadLoading } = useMutation(upload)

    const onSelectFile = (file) => {
        console.log(file, 'file---')
        setState(s => ({ ...s, [s.tempSelect]: file }))
        const { fileName, type, uri } = file
        const doc = { name: fileName, type, uri }
        const form = new FormData()
        form.append("file", doc)
        mutate(form, {
            onSuccess: (data) => {
                const field = state.tempSelect === "banner" ? "uploadedBanner" : "uploadedLogo"
                setState(s => ({ ...s, [field]: data?.data }))
            }
        })
    }

    const onPressBanner = () => {
        if(uploadLoading) return 
        setState(s => ({ ...s, filePickerModal: true, tempSelect: 'banner' }))
    }

    const onPressAvatar = () => {
        if(uploadLoading) return 
        setState(s => ({ ...s, filePickerModal: true, tempSelect: 'avatar' }))
    }
    // const onSelectFile = (file) => {
    //     setState(s => ({ ...s, [s.tempSelect]: file }))
    // }
    const onCreatePress = () => {
        if (isValidate()) {
            const data = {logo: state?.uploadedLogo?.id, image: state.uploadedBanner.id, title: state.title}
            storeMutate(data, {
                onSuccess:()=>{
                    goBack()
                }
            })
            // navigate("createOfferMarketPay")
        }
    }
    const isValidate = () => {
        const { title, avatar, banner, uploadedBanner, uploadedLogo } = state
        return !!title && !!avatar && !!banner&& !!uploadedBanner&& !!uploadedLogo
    }
    return (
        <Screen withoutScroll>
            <MainHeader title="تخفیف یاب" />
            <View style={styles.nav}>
                <GradiantHeader
                    details={false}
                    create={true}
                    onCreatePress={onCreatePress}
                />
            </View>
            <Screen unsafe>
                <TouchableOpacity onPress={onPressBanner} style={styles.bannerContaier}>
                    {uploadLoading&& <View style={styles.abs}>
                        <ActivityIndicator />
                        </View>}
                    {state.banner ? <Image style={{ width: '100%', height: '100%' }} source={{ uri: state?.banner?.uri }} /> :
                        <SimpleLineIcons name="camera" color="black" size={60} />
                    }

                </TouchableOpacity>
                <View style={styles.grayCard}>
                    <TouchableOpacity onPress={onPressAvatar} style={styles.avatar}>
                        {state.avatar ? <Image style={{ height: '100%', width: '100%' }} source={{ uri: state.avatar?.uri }} /> :
                            <SimpleLineIcons name="camera" color="black" size={40} />
                        }
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <TextField
                            onChangeText={text => setState(s => ({ ...s, title: text }))}
                            preset="outline"
                            inputStyle={{ textAlign: 'center', fontFamily: boldFont }}
                            placeholder='نام فروشگاه را وارد کنید'
                            placeholderTextColor={colors.main}
                        />
                    </View>
                </View>


            </Screen>
            <View style={styles.remain}>
                <Text size={17} color={colors.pallete.grayText}>تعرفه فروشگاه پیش فرض ماهانه است</Text>
            </View>
            <FilePickerModal
                visible={state.filePickerModal}
                handleClose={() => setState(s => ({ ...s, filePickerModal: false }))}
                onSelectFile={onSelectFile}
            />

        </Screen>
    )
}

const styles = StyleSheet.create({
    bannerContaier: {
        width: '100%',
        height: width / 1.9,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.pallete.gray3
    },
    nav: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1000,
        top: 50
    },
    grayCard: {
        height: 55,
        backgroundColor: colors.pallete.gray1,
        flexDirection: 'row'
    },
    avatar: {
        height: 94,
        width: 94,
        borderRadius: 16,
        marginTop: -47,
        borderWidth: 1,
        marginLeft: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: colors.pallete.gray4
    },
    remain: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    abs:{
        position:'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,
        justifyContent:'center',
        alignItems:'center',
        zIndex: 1001
    }
})