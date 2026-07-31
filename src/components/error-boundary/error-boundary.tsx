import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../text/text';
import {Button} from '../button/button';
import {colors, scaled} from '../../theme';
// Class component — can't use the useTranslation hook, so read from the i18n
// instance directly. This screen only renders on a caught error, so live
// language switching here isn't a concern.
import i18n from '../../i18n';
import {reportError} from '../../services/sentry';

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

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error);
    // Reported explicitly. Catching the error here is what stops it from
    // reaching the native crash handler, so without this call the most
    // visible failure the app has — the whole tree replaced by «مشکلی پیش
    // آمد» — would be the one class of failure Sentry never heard about.
    // componentStack is what says *which* screen died; the stack trace alone
    // often points only at a shared component several levels down.
    reportError(error, {componentStack: errorInfo?.componentStack});
  }

  handleRetry = () => {
    this.setState({hasError: false});
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>{i18n.t('common.somethingWrong')}</Text>
          <Button onPress={this.handleRetry} style={styles.button}>
            <Text color="white">{i18n.t('common.tryAgain')}</Text>
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
    padding: scaled(24),
  },
  message: {
    marginBottom: scaled(16),
    fontSize: scaled(18),
  },
  button: {
    paddingHorizontal: scaled(24),
    paddingVertical: scaled(12),
    borderRadius: scaled(8),
    backgroundColor: colors.main,
  },
});
