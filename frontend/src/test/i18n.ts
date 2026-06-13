import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/i18n/locales/en.json'
import it from '@/i18n/locales/it.json'

/** Isolated i18next instance for tests: English, no browser detection. */
export const createTestI18n = () => {
  const instance = createInstance()
  void instance.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      it: { translation: it },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })
  return instance
}
