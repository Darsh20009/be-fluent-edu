import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createThanarahCompletion, parseThanarahJson, ThanarahError } from '@/lib/thanarah'


const educationalVideos = [
  {
    id: '1',
    title: 'Basic Greetings in English',
    titleAr: 'التحيات الأساسية بالإنجليزية',
    description: 'Learn how to greet people in English',
    descriptionAr: 'تعلم كيفية تحية الناس بالإنجليزية',
    videoUrl: 'https://www.youtube.com/embed/tqFPRf9Ic68',
    thumbnail: 'https://img.youtube.com/vi/tqFPRf9Ic68/maxresdefault.jpg',
    duration: '5:30',
    level: 'BEGINNER',
    category: 'greetings',
    transcript: `Hello! Welcome to our English learning video. Today we will learn basic greetings.
    - Hello / Hi - مرحبا
    - Good morning - صباح الخير  
    - Good afternoon - مساء الخير
    - Good evening - مساء الخير
    - Good night - تصبح على خير
    - How are you? - كيف حالك؟
    - I'm fine, thank you - أنا بخير، شكراً
    - Nice to meet you - سعيد بلقائك
    - See you later - أراك لاحقاً
    - Goodbye - مع السلامة`
  },
  {
    id: '2',
    title: 'Numbers 1-100',
    titleAr: 'الأرقام من 1 إلى 100',
    description: 'Master counting and numbers in English',
    descriptionAr: 'أتقن العد والأرقام بالإنجليزية',
    videoUrl: 'https://www.youtube.com/embed/D0Ajq682yrA',
    thumbnail: 'https://img.youtube.com/vi/D0Ajq682yrA/maxresdefault.jpg',
    duration: '8:15',
    level: 'BEGINNER',
    category: 'numbers',
    transcript: `Let's learn numbers in English!
    1 - One - واحد
    2 - Two - اثنان
    3 - Three - ثلاثة
    10 - Ten - عشرة
    20 - Twenty - عشرون
    100 - One hundred - مائة`
  },
  {
    id: '3',
    title: 'Present Simple Tense',
    titleAr: 'زمن المضارع البسيط',
    description: 'Learn how to use the present simple tense correctly',
    descriptionAr: 'تعلم كيفية استخدام زمن المضارع البسيط بشكل صحيح',
    videoUrl: 'https://www.youtube.com/embed/L5vJdF1YJzU',
    thumbnail: 'https://img.youtube.com/vi/L5vJdF1YJzU/maxresdefault.jpg',
    duration: '12:45',
    level: 'INTERMEDIATE',
    category: 'grammar',
    transcript: `Present Simple Tense - زمن المضارع البسيط
    
    We use present simple for:
    1. Habits and routines: I wake up at 7 AM every day
    2. Facts: The sun rises in the east
    3. Permanent situations: I live in Cairo
    
    Structure:
    - Affirmative: Subject + Verb (s/es for he/she/it)
    - Negative: Subject + don't/doesn't + Verb
    - Question: Do/Does + Subject + Verb?
    
    Examples:
    - I work every day - أنا أعمل كل يوم
    - She studies English - هي تدرس الإنجليزية
    - They don't eat meat - هم لا يأكلون اللحم`
  },
  {
    id: '4',
    title: 'Common English Phrases',
    titleAr: 'العبارات الإنجليزية الشائعة',
    description: 'Essential phrases for everyday conversations',
    descriptionAr: 'عبارات أساسية للمحادثات اليومية',
    videoUrl: 'https://www.youtube.com/embed/m4hEK3eCen0',
    thumbnail: 'https://img.youtube.com/vi/m4hEK3eCen0/maxresdefault.jpg',
    duration: '10:00',
    level: 'BEGINNER',
    category: 'phrases',
    transcript: `Common English Phrases:
    - Excuse me - عفواً
    - I'm sorry - أنا آسف
    - Thank you very much - شكراً جزيلاً
    - You're welcome - عفواً / على الرحب
    - Could you help me? - هل يمكنك مساعدتي؟
    - I don't understand - لا أفهم
    - Could you repeat that? - هل يمكنك تكرار ذلك؟
    - How much is this? - كم سعر هذا؟
    - Where is...? - أين...؟`
  },
  {
    id: '5',
    title: 'Past Simple Tense',
    titleAr: 'زمن الماضي البسيط',
    description: 'Learn to talk about past events and experiences',
    descriptionAr: 'تعلم التحدث عن الأحداث والتجارب الماضية',
    videoUrl: 'https://www.youtube.com/embed/QoVpz6m3Kk0',
    thumbnail: 'https://img.youtube.com/vi/QoVpz6m3Kk0/maxresdefault.jpg',
    duration: '15:20',
    level: 'INTERMEDIATE',
    category: 'grammar',
    transcript: `Past Simple Tense - زمن الماضي البسيط
    
    We use past simple for:
    1. Completed actions: I visited Cairo last week
    2. Past habits: I played football every day when I was young
    
    Regular verbs: Add -ed (worked, played, studied)
    Irregular verbs: Change form (go→went, eat→ate, see→saw)
    
    Examples:
    - I went to school - ذهبت إلى المدرسة
    - She ate breakfast - هي أكلت الفطور
    - They didn't come - هم لم يأتوا`
  }
]

interface GeneratedOption {
  id: string
  text: string
  textAr: string
}

interface GeneratedQuestion {
  id: number
  question: string
  questionAr: string
  options: GeneratedOption[]
  correctAnswer: string
  explanation: string
  explanationAr: string
}

function isGeneratedQuestion(value: unknown): value is GeneratedQuestion {
  if (!value || typeof value !== 'object') return false
  const question = value as Record<string, unknown>
  const options = question.options

  return (
    typeof question.id === 'number' &&
    Number.isInteger(question.id) &&
    typeof question.question === 'string' &&
    typeof question.questionAr === 'string' &&
    Array.isArray(options) &&
    options.length === 4 &&
    options.every((option: unknown) => {
      if (!option || typeof option !== 'object') return false
      const candidate = option as Record<string, unknown>
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.text === 'string' &&
        typeof candidate.textAr === 'string'
      )
    }) &&
    typeof question.correctAnswer === 'string' &&
    typeof question.explanation === 'string' &&
    typeof question.explanationAr === 'string'
  )
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('id')
    const level = searchParams.get('level')
    const category = searchParams.get('category')

    let videos = [...educationalVideos]

    if (videoId) {
      const video = videos.find(v => v.id === videoId)
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }
      return NextResponse.json(video)
    }

    if (level) {
      videos = videos.filter(v => v.level === level)
    }

    if (category) {
      videos = videos.filter(v => v.category === category)
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Video learning error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const videoId = body?.videoId
    const action = body?.action

    if (action === 'generate-questions') {
      const video = educationalVideos.find(v => v.id === videoId)
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }

      if (!process.env.THANARAH_API_KEY) {
        return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
      }

      const prompt = `Based on this English learning video transcript, generate 5 multiple choice questions to test the student's understanding. The video is about "${video.title}".

Transcript:
${video.transcript}

Generate questions in this JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question in English",
      "questionAr": "السؤال بالعربية",
      "options": [
        {"id": "a", "text": "Option A", "textAr": "الخيار أ"},
        {"id": "b", "text": "Option B", "textAr": "الخيار ب"},
        {"id": "c", "text": "Option C", "textAr": "الخيار ج"},
        {"id": "d", "text": "Option D", "textAr": "الخيار د"}
      ],
      "correctAnswer": "a",
      "explanation": "Explanation in English",
      "explanationAr": "التفسير بالعربية"
    }
  ]
}

Make the questions appropriate for ${video.level} level students.`

      const raw = await createThanarahCompletion([
          { role: 'system', content: 'You are an English teacher creating quiz questions. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
      ], { maxTokens: 2048 })

      const questionsData = parseThanarahJson<{ questions: unknown[] }>(raw)
      const rawQuestions = questionsData?.questions
      if (!Array.isArray(rawQuestions) || rawQuestions.length !== 5) {
        throw new ThanarahError('INVALID_RESPONSE')
      }
      const questions = rawQuestions.map((question) => {
        if (!isGeneratedQuestion(question)) {
          throw new ThanarahError('INVALID_RESPONSE')
        }
        return question
      })

      return NextResponse.json({
        video: {
          id: video.id,
          title: video.title,
          titleAr: video.titleAr
        },
        questions
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    if (error instanceof ThanarahError && error.code === 'MISSING_API_KEY') {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }
    console.error(
      'Video question generation failed',
      error instanceof ThanarahError ? { code: error.code, status: error.status } : undefined,
    )
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 502 })
  }
}
