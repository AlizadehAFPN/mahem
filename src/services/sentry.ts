import * as Sentry from '@sentry/react-native';

/**
 * Crash and error reporting.
 *
 * Wired by hand rather than with `npx @sentry/wizard`: the wizard rewrites
 * App.tsx, build.gradle, AndroidManifest.xml and the Xcode project, and this
 * project has deliberate, load-bearing edits in all four (release signing,
 * APS_ENVIRONMENT, the adaptive icon, the portrait lock, the deep-link
 * intent-filter). Everything the wizard would have added that this app
 * actually needs is here instead.
 *
 * Not secret: the DSN ships inside the binary and can be read out of any APK.
 * It only authorizes *sending* events — it grants no read access to the
 * project. That is why it lives in source rather than in a gitignored file.
 */
const SENTRY_DSN =
  'https://efc2f3f114396a71a495558c9bc7afc1@o4508585278898176.ingest.de.sentry.io/4508585283158096';

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,

    // __DEV__ builds are excluded. A developer reloading over a half-written
    // component would otherwise fill the dashboard with errors nobody will
    // ever act on, and the first real production crash would arrive into a
    // list already too noisy to read.
    enabled: !__DEV__,
    environment: __DEV__ ? 'development' : 'production',

    // Errors only. Performance tracing samples every navigation and request,
    // which on the free plan burns the monthly quota long before a crash that
    // matters shows up — and crash visibility is the whole point here. Turn
    // this on deliberately, with a low sample rate, if performance data is
    // ever wanted.
    tracesSampleRate: 0,

    // Attaches the last 100 events (navigations, network calls, touches)
    // preceding a crash. This is what makes a report reproducible instead of
    // just a stack trace.
    maxBreadcrumbs: 100,

    beforeSend(event) {
      // The OTP code is returned in the API response while the backend runs
      // with OTP_MOCK=true, so it can reach a breadcrumb — and a breadcrumb is
      // exactly the kind of thing nobody re-reads before sharing a Sentry
      // link. Strip anything that looks like a credential before it leaves
      // the device, regardless of how it got into the payload.
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(crumb => {
          if (!crumb.data) {
            return crumb;
          }
          const data = {...crumb.data};
          [
            'code',
            'otp',
            'otpCode',
            'token',
            'accessToken',
            'refreshToken',
            'password',
          ]
            .filter(key => key in data)
            .forEach(key => {
              data[key] = '[redacted]';
            });
          return {...crumb, data};
        });
      }
      return event;
    },
  });
}

/**
 * Report an error that was caught and handled — the app kept running, so
 * Sentry never saw it as a crash, but it still describes something broken.
 * Used by ErrorBoundary.
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, context ? {extra: context} : undefined);
}

/**
 * Tie reports to the signed-in account, so a user reporting "the app closes
 * when I open my ads" can be matched to their actual crashes.
 *
 * Id only — no mobile number, no name. Enough to correlate, not enough to be
 * a copy of the user table sitting in a third-party service.
 */
export function setSentryUser(userId: string | undefined) {
  Sentry.setUser(userId ? {id: userId} : null);
}
