import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import i18n, {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from '../i18n';

/**
 * Backwards-compatible language context.
 *
 * The app used to ship a hand-rolled `translate(key)` context; it is now a thin
 * shim over i18next so existing call sites (`useLanguage().translate/…`) keep
 * working while new code can use `useTranslation()` directly. This provider also
 * owns persistence: it restores the saved language on mount and writes it back
 * whenever the language changes.
 */
type LanguageContextType = {
  language: AppLanguage;
  changeLanguage: (newLanguage: AppLanguage) => void;
  translate: (key: string, options?: Record<string, unknown>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

type LanguageProviderProps = {
  children: ReactNode;
};

const isSupported = (value: string | null): value is AppLanguage =>
  !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // Subscribing via useTranslation ensures every consumer re-renders on a
  // language switch (t/translate below then resolve against the new language).
  const {t} = useTranslation();
  const [language, setLanguage] = useState<AppLanguage>(
    (i18n.language as AppLanguage) || DEFAULT_LANGUAGE,
  );

  // Restore the persisted language once on startup.
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (isSupported(saved) && saved !== i18n.language) {
          await i18n.changeLanguage(saved);
          setLanguage(saved);
        }
      } catch {
        // Persisted preference is best-effort; fall back to the default.
      }
    })();
  }, []);

  const changeLanguage = useCallback((newLanguage: AppLanguage) => {
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage).catch(() => {});
  }, []);

  const translate = useCallback(
    (key: string, options?: Record<string, unknown>): string =>
      t(key, options as never) as unknown as string,
    [t],
  );

  return (
    <LanguageContext.Provider value={{language, changeLanguage, translate}}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
