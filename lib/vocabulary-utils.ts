import { COMPREHENSIVE_WORDS, getWordsByLevel } from './words-database'

export interface VocabularyWord {
  word: string
  arabic: string
  example: string
  imageUrl?: string
  audioUrl?: string
  category?: string
  level?: string
}

export function calculateNextReview(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): { newInterval: number; newEaseFactor: number; nextReviewDate: Date } {
  let newInterval: number
  let newEaseFactor = easeFactor

  if (quality < 3) {
    newInterval = 1
  } else {
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEaseFactor < 1.3) newEaseFactor = 1.3
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return { newInterval, newEaseFactor, nextReviewDate }
}

export function getDailyWords(count: number = 5, level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): VocabularyWord[] {
  const words = getWordsByLevel(level)
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  
  const shuffled = [...words].sort((a, b) => {
    const hashA = (seed * words.indexOf(a)) % 1000
    const hashB = (seed * words.indexOf(b)) % 1000
    return hashA - hashB
  })

  return shuffled.slice(0, count).map(w => ({
    word: w.word,
    arabic: w.arabic,
    example: w.example,
    level
  }))
}

export function generateQuizQuestions(
  words: VocabularyWord[],
  allWords: VocabularyWord[],
  questionType: 'multiple_choice' | 'writing' | 'mixed' = 'mixed'
): QuizQuestion[] {
  const questions: QuizQuestion[] = []

  for (const word of words) {
    if (questionType === 'writing' || (questionType === 'mixed' && Math.random() > 0.5)) {
      questions.push({
        id: `${word.word}-writing`,
        type: 'writing',
        question: `ما معنى كلمة "${word.word}" بالعربي؟`,
        questionEn: `Write the Arabic meaning of "${word.word}"`,
        correctAnswer: word.arabic,
        word: word.word,
        direction: 'en-to-ar'
      })
    } else {
      const wrongOptions = allWords
        .filter(w => w.arabic !== word.arabic)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.arabic)

      const options = [...wrongOptions, word.arabic].sort(() => Math.random() - 0.5)

      questions.push({
        id: `${word.word}-mc`,
        type: 'multiple_choice',
        question: `ما معنى كلمة "${word.word}"؟`,
        questionEn: `What is the meaning of "${word.word}"?`,
        options,
        correctAnswer: word.arabic,
        word: word.word,
        direction: 'en-to-ar'
      })
    }
  }

  return questions.sort(() => Math.random() - 0.5)
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'writing'
  question: string
  questionEn: string
  options?: string[]
  correctAnswer: string
  word: string
  direction: 'en-to-ar' | 'ar-to-en'
}

export function checkWritingAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) => str.trim().toLowerCase().replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
  return normalize(userAnswer) === normalize(correctAnswer)
}

export const WORD_CATEGORIES = [
  { id: 'daily', name: 'Daily Life', nameAr: 'الحياة اليومية' },
  { id: 'food', name: 'Food & Drinks', nameAr: 'الطعام والشراب' },
  { id: 'family', name: 'Family & People', nameAr: 'العائلة والناس' },
  { id: 'nature', name: 'Nature & Weather', nameAr: 'الطبيعة والطقس' },
  { id: 'travel', name: 'Travel & Places', nameAr: 'السفر والأماكن' },
  { id: 'work', name: 'Work & Education', nameAr: 'العمل والتعليم' },
  { id: 'health', name: 'Health & Body', nameAr: 'الصحة والجسم' },
  { id: 'emotions', name: 'Emotions & Feelings', nameAr: 'المشاعر والعواطف' },
  { id: 'home', name: 'Home & Furniture', nameAr: 'المنزل والأثاث' },
  { id: 'technology', name: 'Technology', nameAr: 'التكنولوجيا' },
]
