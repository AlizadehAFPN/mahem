import { View, Text, Dimensions, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { Row } from '../row/row';
import { color } from '../../theme';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
const { width, } = Dimensions.get('screen')
const PAGE_WIDTH = width;
export function ProductImageSlider({product, selectedSlide}) {
    const [state, setState] = useState({
        active: 0
    })
    const carouselRef = useRef(null)
    const pressAnim = useSharedValue<number>(0);
    const animationStyle = React.useCallback(
        (value: number) => {
            'worklet';

            const zIndex = interpolate(value, [-1, 0, 1], [-1000, 0, 1000]);
            const translateX = interpolate(
                value,
                [-1, 0, 1],
                [-PAGE_WIDTH, 0, PAGE_WIDTH]
            );

            return {
                transform: [{ translateX }],
                zIndex,
            };
        },
        []
    );

    useEffect(()=>{
        const index = product.gallery.findIndex(item=> item.id == selectedSlide.id)
        carouselRef.current.scrollTo({index})
        setState(s=>({...s, active:index}))
    }, [selectedSlide])
    return (
        <View style={{width:"100%"}}>
            <Carousel
                ref={carouselRef}
                loop={true}
                width={width}
                height={width}
                autoPlayInterval={3000}
                // style={{ width: '100%', justifyContent: 'flex-end' }}
                // autoPlayReverse
                autoPlay={false}
                data={product.gallery||[]}
                // scrollAnimationDuration={1000}
                onSnapToItem={(index) => setState(s => ({ ...s, active: index }))}
                renderItem={({item, index }) => (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                        }}
                    >
                        <Image style={{ width: '100%', height: '100%', resizeMode: "cover" }} source={{uri: item.path}} />
                    </View>
                )}
            />
           {product.gallery.length>1&& <View>
                <Row style={{ position: 'absolute', bottom: 18, left: 0, right: 0, justifyContent:'center' }}>
                    {[...new Array(product.gallery.length).keys()].map((item, index) => <View style={{ width: state.active== index? 30: 5, height: 5, borderRadius: 8, backgroundColor:state.active== index? color.palette.orange: color.palette.gray6, marginHorizontal: 4 }} />)}
                </Row>
            </View>}

        </View>
    )
}