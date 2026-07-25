/**
 * i18next bootstrap for the app.
 *
 * Design notes for this codebase:
 * - Default language is Persian; English is opt-in via the settings screen.
 * - Layout direction is intentionally left RTL for both languages for now
 *   (we translate copy only), so we never touch I18nManager here.
 * - Persistence lives in LanguageContext (reads/writes AsyncStorage and calls
 *   changeLanguage); this module just wires up the instance and resources.
 * - `useSuspense: false` because React Native has no Suspense fallback here and
 *   resources are bundled (synchronous), so there is nothing to suspend on.
 */
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {fa} from './languages/fa';
import {en} from './languages/en';

export const SUPPORTED_LANGUAGES = ['fa', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: AppLanguage = 'fa';
export const LANGUAGE_STORAGE_KEY = '@mahem/app-language';

export const resources = {
  fa: {translation: fa},
  en: {translation: en},
};

if (!i18n.isInitialized) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: 'translation',
    // Use the pre-Intl plural format so we never depend on Intl.PluralRules,
    // which isn't guaranteed on the Hermes engine (RN 0.72).
    compatibilityJSON: 'v3',
    interpolation: {escapeValue: false},
    returnNull: false,
    returnEmptyString: false,
    react: {useSuspense: false},
  });
}

// Always (re)register the catalogs, even when the instance is already
// initialized. init() only ingests `resources` once, so during a Fast Refresh
// (init is skipped because isInitialized is true) newly-added keys would
// otherwise never reach the running instance and would render as raw keys.
// deep + overwrite keeps this idempotent and safe in production too.
i18n.addResourceBundle('fa', 'translation', fa, true, true);
i18n.addResourceBundle('en', 'translation', en, true, true);

export default i18n;
export {fa, en};
