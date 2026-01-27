'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play,
  ChevronLeft,
  Loader2,
  Video,
  CheckCircle,
  XCircle,
  BookOpen,
  Star,
  Trophy,
  Clock,
  Filter
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Script from 'next/script'
import '@/types/puter'

interface VideoItem {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  videoUrl: string
  thumbnail: string
  duration: string
  level: string
  category: string
  transcript?: string
}

interface Question {
  id: number
  question: string
  questionAr: string
  options: { id: string; text: string; textAr: string }[]
  correctAnswer: string
  explanation: string
  explanationAr: string
}

export default function VideoLearningPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [puterReady, setPuterReady] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  async function fetchVideos() {
    try {
      const res = await fetch('/api/video-learning')
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateQuestions(video: VideoItem) {
    setSelectedVideo(video)
    setLoadingQuestions(true)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)

    try {
      if (!window.puter) {
        throw new Error('AI service not ready')
      }

      const prompt = `Based on this English learning video, generate 5 multiple choice questions to test the student's understanding. The video is about "${video.title}".

Video Description:
${video.description}

Arabic Description:
${video.descriptionAr}

Generate questions in this exact JSON format (respond only with JSON, no other text):
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

      const response = await window.puter.ai.chat([
        { role: 'system', content: 'You are an English teacher creating quiz questions. Always respond with valid JSON only, no other text.' },
        { role: 'user', content: prompt }
      ], {
        model: 'gpt-4o-mini',
        stream: false
      })

      let jsonContent = ''
      if (typeof response === 'string') {
        jsonContent = response
      } else if (response && typeof response === 'object') {
        const resp = response as any
        if (resp.message?.content) {
          jsonContent = resp.message.content
        } else if (resp.text) {
          jsonContent = resp.text
        } else if (resp.content) {
          jsonContent = resp.content
        }
      }

      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setQuestions(parsed.questions || [])
      }

    } catch (error) {
      console.error('Error generating questions:', error)
      setQuestions([
        {
          id: 1,
          question: "What is the main topic of this video?",
          questionAr: "ما هو الموضوع الرئيسي لهذا الفيديو؟",
          options: [
            { id: "a", text: video.title, textAr: video.titleAr },
            { id: "b", text: "Advanced Grammar", textAr: "القواعد المتقدمة" },
            { id: "c", text: "Business English", textAr: "إنجليزي الأعمال" },
            { id: "d", text: "IELTS Preparation", textAr: "التحضير لاختبار IELTS" }
          ],
          correctAnswer: "a",
          explanation: "The video focuses on " + video.title,
          explanationAr: "يركز الفيديو على " + video.titleAr
        }
      ])
    } finally {
      setLoadingQuestions(false)
    }
  }

  function handleSelectAnswer(answerId: string) {
    if (showResult) return
    setSelectedAnswer(answerId)
    setShowResult(true)

    const currentQuestion = questions[currentQuestionIndex]
    if (answerId === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizCompleted(true)
    }
  }

  function resetQuiz() {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)
    generateQuestions(selectedVideo!)
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return <Badge variant="success">مبتدئ</Badge>
      case 'INTERMEDIATE':
        return <Badge variant="warning">متوسط</Badge>
      case 'ADVANCED':
        return <Badge variant="info">متقدم</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }

  const filteredVideos = filterLevel === 'all' 
    ? videos 
    : videos.filter(v => v.level === filterLevel)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6">
      <Script 
        src="https://js.puter.com/v2/" 
        strategy="afterInteractive"
        onLoad={() => setPuterReady(true)}
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => selectedVideo ? setSelectedVideo(null) : router.push('/dashboard/student')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#10B981]" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#10B981]">
              تعلم بالفيديو
            </h1>
            <p className="text-gray-600">
              Video Learning with AI Questions • مجاني
            </p>
          </div>
        </div>

        {!selectedVideo ? (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button
                variant={filterLevel === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterLevel('all')}
                size="sm"
              >
                الكل
              </Button>
              <Button
                variant={filterLevel === 'BEGINNER' ? 'primary' : 'outline'}
                onClick={() => setFilterLevel('BEGINNER')}
                size="sm"
              >
                مبتدئ
              </Button>
              <Button
                variant={filterLevel === 'INTERMEDIATE' ? 'primary' : 'outline'}
                onClick={() => setFilterLevel('INTERMEDIATE')}
                size="sm"
              >
                متوسط
              </Button>
              <Button
                variant={filterLevel === 'ADVANCED' ? 'primary' : 'outline'}
                onClick={() => setFilterLevel('ADVANCED')}
                size="sm"
              >
                متقدم
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=Video'
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-[#10B981]">{video.title}</h3>
                      {getLevelBadge(video.level)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{video.titleAr}</p>
                    <p className="text-sm text-gray-700 mb-4">{video.description}</p>
                    <Button 
                      onClick={() => generateQuestions(video)}
                      className="w-full flex items-center justify-center gap-2"
                      disabled={!puterReady}
                    >
                      <Play className="w-4 h-4" />
                      {puterReady ? 'شاهد وتعلم' : 'جاري التحميل...'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold text-[#10B981]">{selectedVideo.title}</h2>
                <p className="text-gray-600">{selectedVideo.titleAr}</p>
              </div>
            </Card>

            {loadingQuestions ? (
              <Card className="p-8">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-[#10B981]" />
                  <p className="text-gray-600">جاري إنشاء الأسئلة بالذكاء الاصطناعي...</p>
                  <p className="text-sm text-gray-500">Generating AI questions...</p>
                </div>
              </Card>
            ) : questions.length > 0 && !quizCompleted ? (
              <Card className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      السؤال {currentQuestionIndex + 1} من {questions.length}
                    </span>
                    <span className="text-sm font-bold text-[#10B981]">
                      النقاط: {score}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-[#10B981] rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {(() => {
                      const q = questions[currentQuestionIndex]
                      return (
                        <div>
                          <div className="bg-[#10B981] text-white p-4 rounded-lg mb-4">
                            <p className="text-lg">{q.question}</p>
                            <p className="text-sm opacity-80 mt-2">{q.questionAr}</p>
                          </div>

                          <div className="space-y-3">
                            {q.options.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleSelectAnswer(option.id)}
                                disabled={showResult}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                  showResult
                                    ? option.id === q.correctAnswer
                                      ? 'border-green-500 bg-green-50'
                                      : selectedAnswer === option.id
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200'
                                    : selectedAnswer === option.id
                                      ? 'border-[#10B981] bg-blue-50'
                                      : 'border-gray-200 hover:border-[#10B981]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                    showResult
                                      ? option.id === q.correctAnswer
                                        ? 'bg-green-500 text-white'
                                        : selectedAnswer === option.id
                                          ? 'bg-red-500 text-white'
                                          : 'bg-gray-200'
                                      : 'bg-gray-200'
                                  }`}>
                                    {option.id.toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium">{option.text}</p>
                                    <p className="text-sm text-gray-600">{option.textAr}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>

                          {showResult && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4"
                            >
                              <div className={`p-4 rounded-lg ${
                                selectedAnswer === q.correctAnswer 
                                  ? 'bg-green-100 border border-green-300' 
                                  : 'bg-red-100 border border-red-300'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  {selectedAnswer === q.correctAnswer ? (
                                    <>
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="font-bold text-green-700">إجابة صحيحة!</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-5 h-5 text-red-600" />
                                      <span className="font-bold text-red-700">إجابة خاطئة</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-sm">{q.explanation}</p>
                                <p className="text-sm text-gray-600 mt-1">{q.explanationAr}</p>
                              </div>

                              <Button onClick={handleNextQuestion} className="w-full mt-4">
                                {currentQuestionIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      )
                    })()}
                  </motion.div>
                </AnimatePresence>
              </Card>
            ) : quizCompleted ? (
              <Card className="p-8 text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#10B981] mb-2">
                  أحسنت! / Well Done!
                </h2>
                <p className="text-gray-600 mb-4">
                  لقد أكملت الاختبار بنجاح
                </p>
                <div className="text-4xl font-bold text-[#10B981] mb-2">
                  {score} / {questions.length}
                </div>
                <p className="text-gray-500 mb-6">
                  {Math.round((score / questions.length) * 100)}% صحيح
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                    العودة للفيديوهات
                  </Button>
                  <Button onClick={resetQuiz}>
                    إعادة الاختبار
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">شاهد الفيديو أولاً</h3>
                <p className="text-gray-600 mb-4">ثم ستظهر أسئلة لاختبار فهمك</p>
                <Button onClick={() => generateQuestions(selectedVideo)}>
                  ابدأ الاختبار الآن
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
