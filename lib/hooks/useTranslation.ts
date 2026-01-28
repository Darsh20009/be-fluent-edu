import { useTheme } from '../contexts/ThemeContext'
import { translations, TranslationKey } from '../translations'

export function useTranslation() {
  const { language } = useTheme()
  
  const t = (key: TranslationKey): string => {
    const langTranslations = translations[language as keyof typeof translations]
    return (langTranslations as any)[key] || key
  }
  
  return { t, language }
}
