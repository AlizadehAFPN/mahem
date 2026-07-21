import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../text/text';
import {Button} from '../button/button';
import {colors} from '../../theme';

interface ErrorBoundaryState {
  hasError: boolean;
}

// Must be a class component — hooks can't catch render errors. Without this,
// any component-level exception took down the whole app with no fallback.
// Retry only resets local state; it must never call
// NativeModules.DevSettings.reload() (a dev-only API that crashes release
// builds — the exact production crash fixed elsewhere in this pass).
export class ErrorBoundary extends React.Component<
  {children: React.ReactNode},
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled error caught by ErrorBoundary:', error);
  }

  handleRetry = () => {
    this.setState({hasError: false});
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>مشکلی پیش آمد</Text>
          <Button onPress={this.handleRetry} style={styles.button}>
            <Text color="white">تلاش دوباره</Text>
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginBottom: 16,
    fontSize: 18,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.main,
  },
});
