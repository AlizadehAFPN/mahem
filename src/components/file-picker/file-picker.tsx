import React, { FunctionComponent } from 'react'
import { Modal, View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Button, Divider, Row, Text } from '..';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../../theme';
const { width, height } = Dimensions.get('window')

interface FilePickerModalProps {
    visible?: boolean,
    handleClose?: () => void,
    onSelectFile?: (photo: any) => void
    multiple?: boolean
    onPreviewImages?: () => any
}

export const FilePickerModal: FunctionComponent<FilePickerModalProps> = ({ visible, handleClose, onSelectFile, multiple = false, onPreviewImages }) => {

    const lounchcamera = async () => {
        const result = await launchCamera({ cameraType: 'front', maxHeight: height, maxWidth: height, mediaType: 'photo' })
        if (result.assets) {
            if (multiple) {
                onSelectFile(result.assets)
            } else {
                onSelectFile && onSelectFile(result.assets[0]);
            }
            handleClose()
        }
    }
    const lounchMedia = async () => {
        const result = await launchImageLibrary({ selectionLimit: 0 })
        if (result.assets) {
            if (multiple) {
            } else {
                onSelectFile && onSelectFile(result.assets[0]);
            }
            handleClose()
        }
    }
    return (
        <Modal visible={visible} transparent onRequestClose={handleClose}>
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.background} />
            </TouchableWithoutFeedback>
            <View style={{ position:'absolute', bottom:0, left:0, right:0}} >
                <View style={styles.cart}>
                    <Divider />
                    <Row style={{ paddingHorizontal: 16 }}>
                        <Button
                            style={styles.button}
                            onPress={lounchMedia}
                        >
                            <Text>گالری</Text>
                        </Button>
                        <Divider style={{ width: 30 }} />
                        <Button
                            style={styles.button}
                            onPress={lounchcamera}
                        >
                            <Text>دوربین</Text>
                        </Button>

                    </Row>
                    <Divider />
                </View>
            </View>
            
        </Modal>
    );
}

const styles = StyleSheet.create({
    cart: {
        width: '100%',
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        // borderRadius: 20,
        // borderWidth: 1,
        // borderColor: colors.pallete.gray1,
        zIndex: 100,
        
    },
    background: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,.8)',
        position: 'absolute',
        zIndex: -1
    },
    button: {
        paddingHorizontal: 8,
        flex: 1,
        height: 37,
        backgroundColor: colors.main,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:8,
        borderWidth:1,
        borderColor: colors.pallete.gray2

    }
})