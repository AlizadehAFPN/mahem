import { View, FlatList } from 'react-native'
import React from 'react'
import { Button, Text, Row } from '../'

export function RowCategories({ title, showMoreLabel, children, onPressMore }) {
    return (
        <View>
            <Row style={{justifyContent:'space-between', paddingHorizontal: 10}}>
                <Text size={17}>{title}</Text>
                <Button onPress={onPressMore}>
                    <Text size={17}>{showMoreLabel}</Text>
                </Button>
            </Row>
            {children}
        </View>
    )
}