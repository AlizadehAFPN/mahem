import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../../theme'
import { FilePickerModal } from './file-picker'
const {width} = Dimensions.get("window")
export function AdsImageSelection({onSelectImage}) {
    const [state, setState] = useState({
        image: '',
        filepickerModal: false
    })
    const onSelectFile = (image)=>{
        onSelectImage(image);
        setState(s=> ({...s, image}))
    }
  return (
    <TouchableOpacity style={styles.container} onPress={()=> setState(s=>({...s, filepickerModal: true}))}>
      <Image 
        style={ state.image?{width:'100%', height:'100%'}:{}}
        source={ state.image? {uri: state.image.uri} :require('../../assets/images/icons/camera.png')}
      />
      <FilePickerModal
        onSelectFile={onSelectFile}
        visible={state.filepickerModal}
        handleClose={()=> setState(s=>({...s, filepickerModal: false}))}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container:{
        width: (width-40)/5,
        aspectRatio:1,
        borderRadius:8,
        backgroundColor:"white",
        borderWidth:1,
        borderColor: colors.pallete.gray2,
        justifyContent:'center',
        alignItems:"center",
        overflow:'hidden'
    }
})