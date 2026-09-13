import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locales/en/translation.json';
import es from '../../public/locales/es/translation.json';
import de from '../../public/locales/de/translation.json';
import fr from '../../public/locales/fr/translation.json';
import zh from '../../public/locales/zh/translation.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('mechmind_lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    de: { translation: de },
    fr: { translation: fr },
    zh: { translation: zh },
  },
  lng: stored || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function changeLanguage(lang) {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem('mechmind_lang', lang);
  } catch {
    /* storage unavailable */
  }
}

export default i18n;