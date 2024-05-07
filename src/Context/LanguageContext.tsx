import React, {createContext, useContext, useState, ReactNode} from 'react';
import {i18n as fa} from '../i18n/fa';
import {i18n as en} from '../i18n/en';
type LanguageContextType = {
  language: string;
  changeLanguage: (newLanguage: string) => void;
  translate: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState('fa');

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const translate = (key: string): string => {
    //@ts-ignore
    return language === 'fa' ? fa[key] || key : en[key] || key;
  };

  const contextValue: LanguageContextType = {
    language,
    changeLanguage,
    translate,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
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
