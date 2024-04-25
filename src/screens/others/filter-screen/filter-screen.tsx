import { StyleSheet, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import {
    Row,
    Text,
    Button,
    MainHeader,
    Screen,
    Divider,
    CommonForm,
    UnderlineTextField,
    SelectAdsCategory,
    CitySelectModal,
    AdsOptionsModal
} from '../../../components'
import { colors } from '../../../theme'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters } from '../../../stateManager/reducers/filters'

export function FilterScreen() {
    const { goBack } = useNavigation()
    const dispatch = useDispatch()
    const {mainCategory, subCategory,subsubCategory, price, onlyImages, sort } = useSelector(s=> s.filter)
    const [state, setState] = useState({
        selectCategoryModal: false,
        mainCategory,
        subCategory,
        subsubCategory,
        city: "",
        cityModal: false,
        optionType: '',
        optionModal: false,
        image: ''
    })
    const onToggleSelectCategory = () => {
        setState(s => ({ ...s, selectCategoryModal: !s.selectCategoryModal }))
    }
    const groupTitle = useMemo(() => {
        let title = ""
        if (state.mainCategory) {
            title = state.mainCategory?.title
        }
        if (state.subCategory) {
            title = title + ':' + state.subCategory?.title
        }
        if (state.subsubCategory) {
            title = title + ':' + state.subsubCategory?.title
        }
        return title
    }, [state.mainCategory, state.subCategory, state.subsubCategory])

    const handleAddFilters = () => {
        dispatch(setFilters({
            mainCategory: state.mainCategory,
            subCategory: state.subCategory,
            subSubCategory: state.subsubCategory
        }))
        goBack()
    }
    const onPressSort = (sort)=> {
        dispatch(setFilters({sort}))
    }
    return (
        <Screen withoutScroll style={{ flex: 1 }}>
            <MainHeader title="فیلتر" />
            <Row style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
                <Button onPress={()=> onPressSort("PriceMaxToMin")} style={{ ...styles.button, borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>
                    <Text style={{ lineHeight: 29 }} size={19} color={colors.main}>گران ترین</Text>
                </Button>
                <Divider style={{ width: 12 }} />
                <Button onPress={()=> onPressSort("new")} style={styles.button}>
                    <Text style={{ lineHeight: 29 }} size={19} color={colors.main}>جدید ترین</Text>
                </Button>
                <Divider style={{ width: 12 }} />
                <Button onPress={()=> onPressSort("PriceMinToMax")}  style={{ ...styles.button, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
                    <Text style={{ lineHeight: 29 }} size={19} color={colors.main}>ارزان ترین</Text>
                </Button>
            </Row>
            <Divider />

            <Button onPress={onToggleSelectCategory}>
                <UnderlineTextField
                    placeholder="انتخاب گروه"
                    editable={false}
                    value={state.mainCategory ? groupTitle : undefined}
                // value={`${state.mainCategory} ${state.subCategory&& "/"+ state.subCategory} ${state.subsubCategory && "/"+ state.subsubCategory}`}
                />
            </Button>
            <Divider />
            <Button onPress={() => setState(s => ({ ...s, cityModal: true }))}>
                <UnderlineTextField
                    onPressIn={() => setState(s => ({ ...s, cityModal: true }))}
                    placeholder="تعیین موقعیت"
                    value={state.city}
                    editable={false}
                />
            </Button>
            <Divider />
            <UnderlineTextField
                vlaue={price}
                onChange={text=> dispatch(setFilters({price: text}))}
                // onPressIn={() => setState(s => ({ ...s, cityModal: true }))}
                placeholder="قیمت"
            // value={state.city}
            // editable={false}
            />
            <Divider />
            <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'image' }))}>
                <UnderlineTextField
                    onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'image' }))}
                    placeholder="نمایش فقط اگهی های عکس دار"
                    value={state.image|| onlyImages?'بله':''}
                    editable={false}
                />
            </Button>
            <SelectAdsCategory
                onSelect={(m, sc, ssc) => setState(s => ({ ...s, mainCategory: m, subCategory: sc, subsubCategory: ssc }))}
                onClose={onToggleSelectCategory}
                visible={state.selectCategoryModal}
            />
            <CitySelectModal
                onSelect={(city) => setState(s => ({ ...s, city, cityModal: false }))}
                visible={state.cityModal}
                onClose={() => setState(s => ({ ...s, cityModal: false }))}
            />
            <AdsOptionsModal
                type={state.optionType}
                visible={state.optionModal}
                onSelect={(item) => {
                    setState(s => ({ ...s, [s.optionType]: item }))
                    dispatch(setFilters({onlyImages: item==="بله"}))
                }}
                onClose={() => setState(s => ({ ...s, optionModal: false }))}
            />
            <Button onPress={handleAddFilters} style={styles.Button}>
                <Text size={19} color='white'>اعمال</Text>
            </Button>

        </Screen>
    )
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        height: 29,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.pallete.gray2,
        backgroundColor: colors.pallete.gray1,
        marginHorizontal: 2
    },
    Button: {
        flex: undefined,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.main
    }
})