import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {TextField} from './text-field';
import {colors} from '../../theme';

export function UnderlineTextField({...prp}) {
  return (
    <TextField
      borderColor={colors.pallete.red2}
      inputStyle={{
        paddingVertical: 4,
        textAlign: 'right',
        textDecorationColor: colors.main,
        flex: 1,
      }}
      preset={'underline'}
      {...prp}
    />
  );
}

const styles = StyleSheet.create({});
