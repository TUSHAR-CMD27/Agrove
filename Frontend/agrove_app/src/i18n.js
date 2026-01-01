import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // This fetches your JSON files from /public/locales
  .use(LanguageDetector) // This remembers if the user chose Hindi or English
  .use(initReactI18next) // This connects i18next to React
  .init({
    supportedLngs: ['en', 'hi'],
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values to prevent XSS
    },
    backend: {
      // This tells the app where to look for your translation files
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export default i18n;