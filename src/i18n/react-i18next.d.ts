/**
 * TypeScript configuration for i18next / react-i18next.
 *
 * At runtime we init i18next with `returnNull: false` (see index.ts), so `t()`
 * always returns a string. This augmentation teaches the compiler the same
 * thing — without it, i18next types `t()` as `string | null` (its default is
 * `returnNull: true`), which fails to assign to the many `string` /
 * `string | undefined` props (placeholder, title, Alert.alert, …) the app
 * passes translations into.
 */
import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}
