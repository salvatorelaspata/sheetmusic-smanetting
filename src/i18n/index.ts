import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import it from './it.json'
import en from './en.json'

/**
 * Inizializzazione i18n. L'italiano è la lingua predefinita; l'inglese è
 * predisposto. La lingua effettiva viene sincronizzata con lo store impostazioni
 * (vedi src/App.tsx).
 */
void i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
  },
  lng: 'it',
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
})

export default i18n
