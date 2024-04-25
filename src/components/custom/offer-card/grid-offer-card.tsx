import { StyleSheet, TouchableOpacity, View, Image, Text as RNText, Dimensions } from 'react-native'
import React, { useMemo } from 'react'
import { colors } from '../../../theme'
import { CirleSlider, OfferPriceDetails, Rate, Row, Text, } from '../../'
import { numberWithCommas } from '../../../utiles'

const {width} = Dimensions.get('window')
export function GridOfferCard({ item, onPress }) {
  const img = useMemo(() => {
    if (!!item) {
        const imgs = Object.keys(item).filter(key => key.includes('image')).filter(elem => !!item[elem]).map(elem => item[elem].path)
        if(imgs?.length>0){
          return imgs[0]
        }else{
          return null
        }
    } else {
        return null
    }
}, [item])

const offerPersent = useMemo(()=>{
  if(!!item){
      return Math.round((1-(item.price-item.price_with_discount)/item.price)* 100)
  }
  return 0
}, [item])
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
        <Image
          style={{width:width/2,height:105, marginLeft: -8, resizeMode:"cover", ...styles.shadow }}
          source={img?{uri: img}: require('../../../assets/images/empty.webp')}
        />
        <View style={{paddingHorizontal: 8}}>
          <Text size={15}>{item.title}</Text>
        </View>
      <Row style={{justifyContent:"space-around", paddingBottom: 8}}>
        <Text style={{textDecorationLine:'line-through'}}>{numberWithCommas(item.mainPrice)}</Text>
        <CirleSlider radius={32} value={offerPersent} activeStrokeColor={colors.main}
          activeStrokeSecondaryColor={colors.pallete.lightRed} inActiveStrokeColor={colors.pallete.lightRed}>
          <Text style={{ lineHeight: 20 }}>{offerPersent}%</Text>
          <Text color="rgba(0,0,0,.5)" style={{ lineHeight: 20 }}>تخفیف</Text>
        </CirleSlider>
        <Text  >{numberWithCommas(item.price)}</Text>
      </Row>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
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
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
})