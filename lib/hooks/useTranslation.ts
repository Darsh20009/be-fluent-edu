import { useTheme } from '../contexts/ThemeContext'
import { translations, TranslationKey } from '../translations'

export function useTranslation() {
  const { language } = useTheme()
  
  const t = (key: TranslationKey): string => {
    const lang = language as 'ar' | 'en'
    const langTranslations = translations[lang] || translations.ar
    return (langTranslations as any)[key] || key
  }
  
  return { t, language }
}
