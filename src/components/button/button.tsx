import {
  View,
  TouchableOpacity,
  ViewProps,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React from 'react';

interface ButtonProps extends ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}
export function Button({
  children,
  loading,
  style,
  disabled,
  onPress,
}: ButtonProps) {
  const handlePress = () => {
    !loading && !disabled && onPress && onPress();
  };
  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} style={style}>
      {loading && (
        <View style={styles.loadingContaier}>
          <ActivityIndicator />
        </View>
      )}
      {children}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  loadingContaier: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
