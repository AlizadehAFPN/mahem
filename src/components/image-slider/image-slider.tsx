import { View, Dimensions, Image, StyleSheet, Pressable, Linking, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { Row, Text } from '../';

const { width, } = Dimensions.get('screen')
export function ImageSlider({ images, ...prp }) {


    return (
        <View>
            <Carousel
                loop
                width={width}
                height={width / 1.5}
                style={{ width: '100%', justifyContent: 'flex-end' }}
                autoPlayReverse
                autoPlay={true}
                data={images?.length > 0 ? images : [require('../../assets/images/empty.webp')]}
                autoPlayInterval={3000}
                scrollAnimationDuration={1000}
                {...prp}
                // onSnapToItem={(index) => console.log('current index:', index)}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                    activeOpacity={1}
                        onPress={() => {
                            if (item?.link) {
                                Linking.openURL(item?.link)
                            }
                        }}
                        style={{
                            flex: 1,
                            // marginRight: '2.5%',
                            justifyContent: 'center',
                        }}
                    >
                            <Image style={{ width: '100%', height: '100%', resizeMode: "cover" }} source={images?.length > 0 ? { uri: item?.uri || item } : item} />
                            <View style={styles.guider}>
                                <Row>
                                    <Text color='white'>{index + 1}</Text>
                                    <Image style={{ width: 20, marginEnd: 5 }} source={require('../../assets/images/guider.png')} />
                                </Row>
                            </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    guider: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        zIndex: 1000,
        height: 22,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,.4)',
        minWidth: 20,
        paddingHorizontal: 5
    }
})