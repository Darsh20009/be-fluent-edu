export interface PlacementQuestion {
  id: string
  type: 'READING' | 'VOCABULARY' | 'GRAMMAR'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  question: string
  questionAr: string
  options: string[]
  correctAnswer: string
  passage?: string
  passageAr?: string
  points: number
}

export const PLACEMENT_TEST_QUESTIONS: PlacementQuestion[] = [
  // A1 Level (4 questions)
  {
    id: 'R1',
    type: 'READING',
    level: 'A1',
    question: "Read: 'The cat is on the table.' Where is the cat?",
    questionAr: "اقرأ: 'القطة على الطاولة.' أين القطة؟",
    passage: "The cat is on the table.",
    options: ['Under the table', 'On the table', 'Next to the table', 'Behind the table'],
    correctAnswer: 'On the table',
    points: 1
  },
  {
    id: 'G1',
    type: 'GRAMMAR',
    level: 'A1',
    question: "Choose the correct form: 'She _____ a teacher.'",
    questionAr: "اختر الصيغة الصحيحة: 'هي _____ معلمة.'",
    options: ['am', 'is', 'are', 'be'],
    correctAnswer: 'is',
    points: 1
  },
  {
    id: 'V1',
    type: 'VOCABULARY',
    level: 'A1',
    question: "What is the meaning of 'happy'?",
    questionAr: "ما معنى كلمة 'happy'؟",
    options: ['حزين', 'سعيد', 'غاضب', 'متعب'],
    correctAnswer: 'سعيد',
    points: 1
  },
  {
    id: 'G2',
    type: 'GRAMMAR',
    level: 'A1',
    question: "Choose the correct form: 'I _____ coffee every morning.'",
    questionAr: "اختر الصيغة الصحيحة: 'أنا _____ القهوة كل صباح.'",
    options: ['drinks', 'drink', 'drinking', 'drank'],
    correctAnswer: 'drink',
    points: 1
  },
  // A2 Level (4 questions)
  {
    id: 'R3',
    type: 'READING',
    level: 'A2',
    question: "Read the passage and answer: What does Sarah do every morning?",
    questionAr: "اقرأ المقطع وأجب: ماذا تفعل سارة كل صباح؟",
    passage: "Sarah wakes up at 6 AM every day. She goes for a run in the park near her house. After running, she takes a shower and has breakfast with her family.",
    options: ['She goes swimming', 'She goes for a run', 'She reads a book', 'She watches TV'],
    correctAnswer: 'She goes for a run',
    points: 2
  },
  {
    id: 'V3',
    type: 'VOCABULARY',
    level: 'A2',
    question: "Choose the correct word: 'I need to _____ my homework before dinner.'",
    questionAr: "اختر الكلمة الصحيحة: 'أحتاج أن _____ واجبي قبل العشاء.'",
    options: ['make', 'do', 'create', 'build'],
    correctAnswer: 'do',
    points: 2
  },
  {
    id: 'G3',
    type: 'GRAMMAR',
    level: 'A2',
    question: "Choose the correct form: 'They _____ to the cinema yesterday.'",
    questionAr: "اختر الصيغة الصحيحة: 'هم _____ إلى السينما أمس.'",
    options: ['go', 'goes', 'went', 'going'],
    correctAnswer: 'went',
    points: 2
  },
  {
    id: 'R4',
    type: 'READING',
    level: 'A2',
    question: "According to the text, when does the store close on Sundays?",
    questionAr: "وفقاً للنص، متى يغلق المتجر أيام الأحد؟",
    passage: "Our store is open from 9 AM to 8 PM on weekdays. On Saturdays, we close at 6 PM. On Sundays, the store is open from 10 AM to 4 PM.",
    options: ['6 PM', '8 PM', '4 PM', '5 PM'],
    correctAnswer: '4 PM',
    points: 2
  },
  // B1 Level (4 questions)
  {
    id: 'R5',
    type: 'READING',
    level: 'B1',
    question: "What is the main purpose of this email?",
    questionAr: "ما الهدف الرئيسي من هذا البريد الإلكتروني؟",
    passage: "Dear Mr. Johnson, I am writing to inquire about the marketing position advertised on your website. I have five years of experience in digital marketing and I am very interested in joining your team. Please find my CV attached. I look forward to hearing from you.",
    options: ['To complain about service', 'To apply for a job', 'To request a refund', 'To schedule a meeting'],
    correctAnswer: 'To apply for a job',
    points: 3
  },
  {
    id: 'V5',
    type: 'VOCABULARY',
    level: 'B1',
    question: "Choose the synonym for 'intelligent':",
    questionAr: "اختر المرادف لكلمة 'intelligent':",
    options: ['Stupid', 'Smart', 'Slow', 'Lazy'],
    correctAnswer: 'Smart',
    points: 3
  },
  {
    id: 'G5',
    type: 'GRAMMAR',
    level: 'B1',
    question: "Choose the correct form: 'If I _____ rich, I would travel the world.'",
    questionAr: "اختر الصيغة الصحيحة: 'لو كنت _____ غنياً، لسافرت حول العالم.'",
    options: ['am', 'was', 'were', 'be'],
    correctAnswer: 'were',
    points: 3
  },
  {
    id: 'R6',
    type: 'READING',
    level: 'B1',
    question: "What can be inferred about the restaurant from this review?",
    questionAr: "ما الذي يمكن استنتاجه عن المطعم من هذه المراجعة؟",
    passage: "The food was excellent and the service was friendly, although the wait time was a bit long. The prices are reasonable considering the quality. I would recommend making a reservation, especially on weekends.",
    options: ['It is expensive', 'It is popular', 'It has bad service', 'It is rarely busy'],
    correctAnswer: 'It is popular',
    points: 3
  },
  // B2 Level (4 questions)
  {
    id: 'R7',
    type: 'READING',
    level: 'B2',
    question: "What is the author's main argument in this passage?",
    questionAr: "ما الحجة الرئيسية للكاتب في هذا المقطع؟",
    passage: "While technology has revolutionized education, making information accessible to anyone with an internet connection, it cannot replace the value of face-to-face interaction with teachers. Studies show that students who engage directly with instructors develop stronger critical thinking skills and are better at collaborative problem-solving.",
    options: ['Technology is harmful to education', 'Online learning is superior', 'Direct interaction with teachers remains valuable', 'Schools should eliminate technology'],
    correctAnswer: 'Direct interaction with teachers remains valuable',
    points: 4
  },
  {
    id: 'V7',
    type: 'VOCABULARY',
    level: 'B2',
    question: "Choose the correct word: 'The company's _____ has increased by 20% this year.'",
    questionAr: "اختر الكلمة الصحيحة: 'ارتفعت _____ الشركة بنسبة 20٪ هذا العام.'",
    options: ['revenue', 'revise', 'reveal', 'reverse'],
    correctAnswer: 'revenue',
    points: 4
  },
  {
    id: 'G7',
    type: 'GRAMMAR',
    level: 'B2',
    question: "Choose the correct form: 'By the time she arrives, we _____ the meeting.'",
    questionAr: "اختر الصيغة الصحيحة: 'بحلول وقت وصولها، سنكون قد _____ الاجتماع.'",
    options: ['finish', 'finished', 'will finish', 'will have finished'],
    correctAnswer: 'will have finished',
    points: 4
  },
  {
    id: 'R8',
    type: 'READING',
    level: 'B2',
    question: "What does the phrase 'a double-edged sword' imply in this context?",
    questionAr: "ماذا تعني عبارة 'سيف ذو حدين' في هذا السياق؟",
    passage: "Social media has become a double-edged sword for businesses. On one hand, it offers unprecedented opportunities for marketing and customer engagement. On the other hand, a single negative post can go viral and damage a company's reputation within hours.",
    options: ['It is purely beneficial', 'It has both advantages and disadvantages', 'It is too dangerous to use', 'It is outdated'],
    correctAnswer: 'It has both advantages and disadvantages',
    points: 4
  },
  // C1 Level (4 questions)
  {
    id: 'R9',
    type: 'READING',
    level: 'C1',
    question: "What underlying assumption does the author make about scientific progress?",
    questionAr: "ما الافتراض الأساسي الذي يضعه الكاتب عن التقدم العلمي؟",
    passage: "The notion that scientific progress is linear and cumulative has been challenged by philosophers of science. Thomas Kuhn argued that science progresses through paradigm shifts rather than gradual accumulation of knowledge. These revolutionary changes fundamentally alter how scientists perceive their field.",
    options: ['Science always progresses steadily', 'Scientific revolutions are rare', 'Science progresses through revolutionary changes', 'All scientific theories are equally valid'],
    correctAnswer: 'Science progresses through revolutionary changes',
    points: 5
  },
  {
    id: 'V9',
    type: 'VOCABULARY',
    level: 'C1',
    question: "Choose the word that best completes: 'The politician's _____ remarks were criticized for being offensive.'",
    questionAr: "اختر الكلمة الأنسب: 'تعرضت تصريحات السياسي _____ للانتقاد لكونها مسيئة.'",
    options: ['diplomatic', 'incendiary', 'benevolent', 'ambivalent'],
    correctAnswer: 'incendiary',
    points: 5
  },
  {
    id: 'G9',
    type: 'GRAMMAR',
    level: 'C1',
    question: "Choose the correct form: 'Hardly _____ the door when the phone rang.'",
    questionAr: "اختر الصيغة الصحيحة: 'بالكاد _____ الباب حتى رن الهاتف.'",
    options: ['I had opened', 'had I opened', 'I opened', 'did I open'],
    correctAnswer: 'had I opened',
    points: 5
  },
  {
    id: 'R10',
    type: 'READING',
    level: 'C1',
    question: "What is the rhetorical purpose of the metaphor used in this passage?",
    questionAr: "ما الغرض البلاغي من الاستعارة المستخدمة في هذا المقطع؟",
    passage: "The economy is not a machine with predictable outputs based on inputs. Rather, it is more akin to a living organism, constantly adapting to its environment, with interconnected systems that can exhibit unexpected behaviors when stressed. This organic view suggests that economic policies must be flexible and responsive.",
    options: ['To simplify a complex concept', 'To criticize economic policies', 'To explain why economies are unpredictable', 'To argue for deregulation'],
    correctAnswer: 'To explain why economies are unpredictable',
    points: 5
  }
]

export const LEVEL_THRESHOLDS = {
  A1: { min: 0, max: 12 },
  A2: { min: 13, max: 24 },
  B1: { min: 25, max: 36 },
  B2: { min: 37, max: 48 },
  C1: { min: 49, max: 60 }
}

export function calculateLevel(score: number, totalPossible: number): string {
  const percentage = (score / totalPossible) * 100
  
  if (percentage <= 20) return 'A1'
  if (percentage <= 40) return 'A2'
  if (percentage <= 60) return 'B1'
  if (percentage <= 80) return 'B2'
  return 'C1'
}

export function getLevelDescription(level: string): { en: string; ar: string } {
  const descriptions: Record<string, { en: string; ar: string }> = {
    A1: {
      en: 'Beginner - You can understand and use basic phrases for everyday needs.',
      ar: 'مبتدئ - يمكنك فهم واستخدام العبارات الأساسية للاحتياجات اليومية.'
    },
    A2: {
      en: 'Elementary - You can communicate in simple tasks and describe your background.',
      ar: 'أساسي - يمكنك التواصل في المهام البسيطة ووصف خلفيتك.'
    },
    B1: {
      en: 'Intermediate - You can deal with most situations while traveling and describe experiences.',
      ar: 'متوسط - يمكنك التعامل مع معظم المواقف أثناء السفر ووصف التجارب.'
    },
    B2: {
      en: 'Upper Intermediate - You can interact fluently with native speakers and express viewpoints.',
      ar: 'فوق المتوسط - يمكنك التفاعل بطلاقة مع الناطقين الأصليين والتعبير عن وجهات النظر.'
    },
    C1: {
      en: 'Advanced - You can express yourself fluently and use language flexibly for various purposes.',
      ar: 'متقدم - يمكنك التعبير عن نفسك بطلاقة واستخدام اللغة بمرونة لأغراض مختلفة.'
    }
  }
  return descriptions[level] || descriptions['A1']
}

export function getQuestionsByType(type: 'READING' | 'VOCABULARY' | 'GRAMMAR'): PlacementQuestion[] {
  return PLACEMENT_TEST_QUESTIONS.filter(q => q.type === type)
}

export function getTotalPossibleScore(): number {
  return PLACEMENT_TEST_QUESTIONS.reduce((sum, q) => sum + q.points, 0)
}
