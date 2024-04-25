import { View, StyleSheet, Image, Linking } from 'react-native'
import React from 'react'
import { MainModal } from './mainModal'
import { colors } from '../../theme'
import { Text, Row, Divider, Button } from '../'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
export function CallInfo({ visible, onClose, phone }) {

    function openUrl(url: string): Promise<any> {
        return Linking.openURL(url);
    }
    function openSmsUrl(phone: string, body: string): Promise<any> {
        return openUrl(`sms:${phone}${getSMSDivider()}body=${body}`);
    }
    function getSMSDivider(): string {
        return Platform.OS === "ios" ? "&" : "?";
    }
    return (
        <MainModal onClose={onClose} visible={visible}>
            <View style={styles.card}>
                <Text size={20} preset='bold' color={colors.pallete.red2}>اطلاعات تماس</Text>
                <Divider />
                <View style={styles.card2}>
                    <Button onPress={() => Linking.openURL(`tel:${phone}`)}>
                        <Row>
                            <Image source={require('../../assets/images/phone.png')} />
                            <Text style={styles.textItem}>تماس با {phone}</Text>
                        </Row>
                    </Button>

                    <Divider />
                    <Button onPress={() => openSmsUrl(phone, "")}>
                        <Row>
                            <Image source={require('../../assets/images/chat2.png')} />
                            <Text style={styles.textItem}>ارسال پیامک به...</Text>
                        </Row>
                    </Button>

                    <Divider />
                    <Row>
                        <MaterialCommunityIcons size={25} name="email-outline" />
                        <Text style={styles.textItem}>ایمیل به ....</Text>
                    </Row>
                    <Divider />
                    <Text size={15} color='rgba(0,0,0,.5)' >هشدار پلیس: لطفا پس از انجام معامله و پرداخت وجه از صحت کالا یا خدمات ارایه شده به صورت حضوری اطمینان حاصل نمیایید. </Text>
                    <Divider />
                    <Button onPress={onClose} style={{ alignSelf: "flex-start" }}>
                        <Text color={colors.pallete.red2}>بیخیال</Text>
                    </Button>
                </View>
                <Divider />
            </View>
        </MainModal>
    )
}
const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
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