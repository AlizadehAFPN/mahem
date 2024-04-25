import { StyleSheet, TouchableOpacity, View, Image, Text as RNText } from 'react-native'
import React, { useMemo } from 'react'
import { colors } from '../../../theme'
import { OfferPriceDetails, Rate, Row, Text, } from '../../'


export function OfferCard({ item, onPress }) {
    const img = useMemo(()=>{
        console.log(item, 'item---' )
        const imgs = Object.keys(item).filter(key => key.includes('image')).filter(img=> !!item[img]).map(elem=> item[elem].path)
        if(imgs?.length>0){
            console.log(imgs, 'imsss')
            return imgs[0]
        }
        return ''
    }, [item])
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View>
                <Image
                    style={{ width: '100%', height: 250 }}
                    source={img?{uri: img}: require('../../../assets/images/empty.webp')}
                />
                <View style={styles.locationBar}>
                    <Row style={{ paddingHorizontal: 10, justifyContent: 'space-between' }}>
                        <View style={styles.badge}>
                            <Text style={{ lineHeight: 20 }} color='white'>{item.city?.title}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Rate rate={item.rate} />
                        </View>
                    </Row>
                </View>
            </View>

            <OfferPriceDetails item={item} />

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderColor: colors.pallete.gray2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    line: {
        height: 1.5,
        backgroundColor: colors.pallete.gray2,
        width: 70,
        transform: [{ rotate: '-15deg' }],
        // marginTop: -20,
        position: 'absolute',
        // top:0,
        bottom: 10,
        left: 10
    },
    locationBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 8
    },
    badge: {
        height: 18,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,.3)',
        paddingHorizontal: 5,
        alignItems: 'center'
    }
})