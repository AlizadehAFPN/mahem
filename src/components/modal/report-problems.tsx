import { View, StyleSheet, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text, Row, Divider, Button, Checkbox, TextField, Screen } from '../'

import { } from 'react-native-gesture-handler'
const checkOptions = [
    { title: 'دسته بندی نامناسب', value: 'category_problems' },
    { title: 'محتوی آگهی نامناسب', value: 'content_problems' },
    { title: 'قیمت آگهی نامناسب', value: 'price_problems' },
    { title: 'شماره تماس نادرست', value: 'call_info_problems' },
    { title: 'محصول دیگر موجود نیست', value: 'existency_problems' },
    { title: 'دیگر', value: 'others_problems' },
]

export function ReportProblem({ visible, onClose }) {
    const [state, setState] = useState({
        checkProb: ''
    })
    return (
        <MainModal onClose={onClose} visible={visible}>

            <View style={styles.card}>
                <ScrollView>


                    <View style={styles.card2}>
                        {checkOptions.map(item =>
                            <Checkbox
                                checkedColor={colors.pallete.green}
                                value={state.checkProb == item.value}
                                onToggle={() => setState(s => ({ ...s, checkProb: item.value }))}
                                text={item.title}
                                style={{ marginVertical: 12 }}
                            />
                        )}
                        <TextField
                        inputStyle={{textAlign:'right'}}
                            preset='underline'
                            placeholder='موبایل'
                            inputMode='tel'
                            borderColor={colors.pallete.red2}
                        />
                        <Divider />
                        <TextField
                            preset='underline'
                            placeholder='ایمیل'
                            inputMode='email'
                            borderColor={colors.pallete.red2}
                        />
                        <Divider />
                        <TextField
                            preset='underline'
                            placeholder='توضیحات'
                            borderColor={colors.pallete.red2}
                        />
                        <Divider />
                        <Row style={{justifyContent:'space-between'}}>
                            <Button onPress={onClose} >
                                <Text color={colors.pallete.red2}>ارسال</Text>
                            </Button>
                            <Button onPress={onClose} >
                                <Text color={colors.pallete.red2}>بیخیال</Text>
                            </Button>
                        </Row>

                    </View>
                    <Divider />
                </ScrollView>
            </View>
        </MainModal>
    )
}
const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 4,
        borderColor: colors.pallete.gray2,
        paddingHorizontal: 8,
        paddingTop: 16,
        backgroundColor: colors.pallete.gray1

    },
    textItem: {
        paddingHorizontal: 10
    },
    card2: {
        paddingHorizontal: 16
    }
})