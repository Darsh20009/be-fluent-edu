export type Language = 'ar' | 'en'

export function localeText(language: Language, arabic: string, english: string) {
  return language === 'ar' ? arabic : english
}

export function localeDirection(language: Language) {
  return language === 'ar' ? 'rtl' : 'ltr'
}