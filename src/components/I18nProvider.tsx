'use client';

import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize language from localStorage or browser settings
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de')) {
      i18n.changeLanguage(savedLanguage);
    }

    // Update HTML lang attribute when language changes
    const updateHtmlLang = () => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = i18n.language;
      }
    };

    // Set initial lang
    updateHtmlLang();

    // Listen for language changes
    i18n.on('languageChanged', updateHtmlLang);

    // Cleanup
    return () => {
      i18n.off('languageChanged', updateHtmlLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;