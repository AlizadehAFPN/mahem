import { Alert, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import {
    Divider, GradiantHeader,
    MainHeader,
    Screen,
    Row,
    Text,
    ProductLocation,
    FilePickerModal,
    TextField,
    JobClasessModal,
    SelectLocation,
    Checkbox,
    CitySelectModal
} from '../../../components'
import { colors } from '../../../theme'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import { useMutation } from 'react-query'
import { upload } from '../../../services'
import { createJob } from '../../../services/job'
import { useNavigation } from '@react-navigation/native'


const { width } = Dimensions.get('window')
export function CreateJobScreen() {
    const [state, setState] = useState({
        title:'',
        banner: '',
        avatar: '',
        tempSelect: '',
        filePickerModal: false,
        jobClassModal: false,
        category: '',
        acceptance: false,
        telegram: '',
        instagram: '',
        fax: '',
        phone: '',
        mobile: '',
        description: '',
        address: '',
        register_code: '',
        email: '',
        manager: '',
        city: '',
        citySelectModal: false,
        uploadedBanner: undefined,
        uploadedLogo: undefined,
        lat: '',
        lng: ''
    })
    const { goBack } = useNavigation()

    const { mutate } = useMutation(upload)
    const { mutate: jobMutate, isLoading } = useMutation(createJob)

    const handleValidation = () => {
        const { manager, title, category, register_code, phone, mobile, fax, address, telegram, instagram, city, lat, lng } = state
        if (!title){
            Alert.alert("عنوان را وارد کنید")
            return false
        }else if (!manager){
            Alert.alert("مدیریت را وارد کنید")
            return false
        }else if (!category){
            Alert.alert("نوع صنف را انتخاب کنید")
            return false
        }else if(!register_code){
            Alert.alert("شماره ثبت را وارد کنید")
            return false
        }else if(!phone){
            Alert.alert("شماره تلفن را وارد کنید")
            return false
        }else if(!mobile){
            Alert.alert("شماره موبایل را وارد کنید")
            return false
        }else if(!address){
            Alert.alert("آدرس را وارد کنید")
            return false
        }else if(!city){
            Alert.alert("شهر را وارد کنید")
            return false
        }else if(!lat|| !lng){
            Alert.alert("موقعیت را از روی نقشه انتخاب کنید")
            return false
        }
        return true
    }

    const handleCreateJob = () => {
        if (handleValidation()) {
            const { title, manager, category, phone, register_code, mobile, fax, address, telegram, instagram, email, description, city, lat, lng, uploadedBanner, uploadedLogo } = state
            const data = { title, manager, job_category_id: category?.id, phone, register_code, mobile, fax, address, telegram, instagram, email, description, city_id: city?.id, lat, lng, banner: uploadedBanner?.id, logo: uploadedLogo?.id }
            jobMutate(data, {
                onSuccess: () => {
                    goBack()
                }
            })
        }
    }

    const onPressBanner = () => {
        setState(s => ({ ...s, filePickerModal: true, tempSelect: 'banner' }))
    }

    const onPressAvatar = () => {
        setState(s => ({ ...s, filePickerModal: true, tempSelect: 'avatar' }))
    }
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
    const onSelectCity = (city) => {
        setState(s => ({ ...s, city, citySelectModal: false }))
    }

    const onChangeField = (field, value) => {
        setState(s => ({ ...s, [field]: value }))
    }
    return (
        <Screen withoutScroll>
            <MainHeader title="پزشکی" />
            <View style={styles.nav}>
                <GradiantHeader
                    details={false}
                    create
                    onCreatePress={handleCreateJob}
                />
            </View>
            <Screen unsafe>
                <TouchableOpacity onPress={onPressBanner} style={styles.bannerContaier}>
                    {state.banner ? <Image style={{ width: '100%', height: '100%' }} source={{ uri: state?.banner?.uri }} /> :
                        <SimpleLineIcons name="camera" color="black" size={60} />
                    }

                </TouchableOpacity>
                <View style={styles.grayCard}>
                    <TouchableOpacity onPress={onPressAvatar} style={styles.circle}>
                        {state.avatar ? <Image style={{ height: '100%', width: '100%' }} source={{ uri: state.avatar?.uri }} /> :
                            <SimpleLineIcons name="camera" color="black" size={40} />
                        }
                    </TouchableOpacity>
                </View>
                <Divider height={8} />
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>عنوان</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.title}
                            onChangeText={(text) => onChangeField("title", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>مدیریت</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.manager}
                            onChangeText={(text) => onChangeField("manager", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>نوع صنف</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <TouchableOpacity onPress={() => setState(s => ({ ...s, jobClassModal: true }))} style={{ ...styles.detailItem, flex: 1 }}>
                        <Text style={{ ...styles.itemText, textAlign: 'right' }}>{state?.category?.title}</Text>
                    </TouchableOpacity>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>شماره ثبت</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.register_code}
                            onChangeText={text => onChangeField("register_code", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>تلفن ثابت</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.phone}
                            onChangeText={text => onChangeField("phone", text)}
                            inputMode='tel'
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>تلفن</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.mobile}
                            onChangeText={text => onChangeField("mobile", text)}
                            inputMode='tel'
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>فکس</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.fax}
                            onChangeText={text => onChangeField("fax", text)}
                            inputMode='tel'
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>آدرس</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.address}
                            onChangeText={text => onChangeField("address", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>تلگرام</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.telegram}
                            onChangeText={text => onChangeField("telegram", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>اینستاگرام</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.instagram}
                            onChangeText={text => onChangeField("instagram", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>ایمیل</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.email}
                            onChangeText={text => onChangeField("email", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>توضیحات</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <View style={{ ...styles.detailItem, flex: 1 }}>
                        <TextField
                            value={state.description}
                            onChangeText={text => onChangeField("description", text)}
                            style={{ borderWidth: 0, height: 30, }}
                            inputStyle={{ padding: 0, fontSize: 12, textAlign: 'right' }}
                        />
                    </View>
                </Row>
                <Row style={{ paddingHorizontal: 8 }}>
                    <View style={{ ...styles.detailItem, width: 70 }}>
                        <Text style={{ ...styles.itemText }}>موقعیت</Text>
                    </View>
                    <Divider style={{ width: 10 }} />
                    <TouchableOpacity onPress={() => setState(s => ({ ...s, citySelectModal: true }))} style={{ ...styles.detailItem, flex: 1 }}>
                        <Text>{state?.city?.title}</Text>
                    </TouchableOpacity>
                </Row>
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
            </Screen>
            <FilePickerModal
                visible={state.filePickerModal}
                handleClose={() => setState(s => ({ ...s, filePickerModal: false }))}
                onSelectFile={onSelectFile}
            />
            <JobClasessModal
                onSelect={(item) => setState(s => ({ ...s, category: item, jobClassModal: false }))}
                visible={state.jobClassModal}
                onClose={() => setState(s => ({ ...s, jobClassModal: false }))}
            />
            <CitySelectModal
                onSelect={onSelectCity}
                visible={state.citySelectModal}
                onClose={() => setState(s => ({ ...s, citySelectModal: false }))}
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
        backgroundColor: colors.pallete.gray1
    },
    circle: {
        height: 94,
        width: 94,
        borderRadius: 50,
        marginTop: -47,
        borderWidth: 1,
        marginLeft: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: colors.pallete.gray4
    },
    detailItem: {
        height: 30,
        backgroundColor: colors.pallete.gray1,
        borderRadius: 4,
        justifyContent: 'center',
        marginVertical: 4,
        paddingHorizontal: 4
    },
    itemText: {
        lineHeight: 19
    }
})