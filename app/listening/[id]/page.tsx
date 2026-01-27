'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Headphones, ArrowRight, Play, Pause, Volume2, VolumeX, 
  RotateCcw, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Gauge, Music, Video
} from 'lucide-react'

interface Exercise {
  id: string
  type: string
  order: number
  question: string
  questionAr: string | null
  options: string | null
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
  points: number
  timestamp: number | null
}

interface ListeningContent {
  id: string
  title: string
  titleAr: string
  description: string | null
  descriptionAr: string | null
  mediaType: 'AUDIO' | 'VIDEO'
  mediaUrl: string
  thumbnailUrl: string | null
  duration: number | null
  level: string
  category: string | null
  categoryAr: string | null
  transcript: string | null
  transcriptAr: string | null
  exercises: Exercise[]
}

interface AttemptResult {
  isCorrect: boolean
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
}

export default function ListeningDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [content, setContent] = useState<ListeningContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [showExercises, setShowExercises] = useState(false)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({})
  const [exerciseResults, setExerciseResults] = useState<Record<string, AttemptResult>>({})
  const [visitorId, setVisitorId] = useState<string>('')
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    let storedVisitorId = localStorage.getItem('listening_visitor_id')
    if (!storedVisitorId) {
      storedVisitorId = 'visitor_' + Math.random().toString(36).substring(2) + Date.now()
      localStorage.setItem('listening_visitor_id', storedVisitorId)
    }
    setVisitorId(storedVisitorId)
    fetchContent()
  }, [id])

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/listening/${id}`)
      if (!res.ok) throw new Error('Content not found')
      const data = await res.json()
      setContent(data)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMediaRef = () => {
    return content?.mediaType === 'VIDEO' ? videoRef.current : audioRef.current
  }

  const togglePlay = () => {
    const media = getMediaRef()
    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    const media = getMediaRef()
    if (media) {
      setCurrentTime(media.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    const media = getMediaRef()
    if (media) {
      setDuration(media.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = getMediaRef()
    if (media) {
      const time = parseFloat(e.target.value)
      media.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = getMediaRef()
    const newVolume = parseFloat(e.target.value)
    if (media) {
      media.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    const media = getMediaRef()
    if (media) {
      media.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    const media = getMediaRef()
    if (media) {
      media.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }

  const restart = () => {
    const media = getMediaRef()
    if (media) {
      media.currentTime = 0
      setCurrentTime(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleExerciseAnswer = (exerciseId: string, answer: string) => {
    setExerciseAnswers(prev => ({ ...prev, [exerciseId]: answer }))
  }

  const submitExercise = async (exerciseId: string) => {
    if (!exerciseAnswers[exerciseId]) return

    try {
      const res = await fetch('/api/listening/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          visitorId,
          answer: exerciseAnswers[exerciseId]
        })
      })
      const result = await res.json()
      setExerciseResults(prev => ({ ...prev, [exerciseId]: result }))
    } catch (error) {
      console.error('Error submitting exercise:', error)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-700'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700'
      case 'ADVANCED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'مبتدئ'
      case 'INTERMEDIATE': return 'متوسط'
      case 'ADVANCED': return 'متقدم'
      default: return level
    }
  }

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#10B981] border-t-transparent"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-600 mb-4">المحتوى غير موجود</h2>
          <Link href="/listening" className="text-[#10B981] hover:underline">
            العودة إلى قائمة الاستماع
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Headphones className="w-8 h-8 text-[#10B981]" />
            <span className="text-xl font-bold text-[#10B981]">Youspeak</span>
          </Link>
          <Link 
            href="/listening" 
            className="flex items-center gap-2 text-gray-600 hover:text-[#10B981]"
          >
            <span>العودة للقائمة</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {content.mediaType === 'VIDEO' && content.mediaUrl.includes('youtube.com') ? (
            <div className="aspect-video bg-black relative">
              <iframe
                src={content.mediaUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={content.title}
              />
            </div>
          ) : content.mediaType === 'VIDEO' ? (
            <div className="aspect-video bg-black relative">
              <video
                ref={videoRef}
                src={content.mediaUrl}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                poster={content.thumbnailUrl || undefined}
                controls
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-[#10B981] to-[#0066B8] relative flex items-center justify-center">
              {content.thumbnailUrl ? (
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              ) : null}
              <div className="relative z-10 text-center">
                <Music className="w-24 h-24 text-white/50 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">{content.titleAr}</h2>
              </div>
              <audio
                ref={audioRef}
                src={content.mediaUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          {!content.mediaUrl.includes('youtube.com') && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                />
                <span className="text-sm text-gray-600 min-w-[80px] text-left">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={restart}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="إعادة التشغيل"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="p-3 bg-[#10B981] text-white rounded-full hover:bg-[#003A6A] transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>

                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={toggleMute} className="p-2 rounded-full hover:bg-gray-200">
                      {isMuted ? <VolumeX className="w-5 h-5 text-gray-600" /> : <Volume2 className="w-5 h-5 text-gray-600" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">السرعة:</span>
                  <div className="flex gap-1">
                    {speedOptions.map(speed => (
                      <button
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed)}
                        className={`px-2 py-1 text-sm rounded transition-colors ${
                          playbackSpeed === speed 
                            ? 'bg-[#10B981] text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {content.mediaUrl.includes('youtube.com') && (
            <div className="p-4 bg-gray-50 border-t text-center text-gray-600">
              <p>استخدم أدوات التحكم في مشغل YouTube لتغيير السرعة ومستوى الصوت</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 text-right">
                {content.titleAr}
              </h1>
              <p className="text-gray-500 text-right">
                {content.title}
              </p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full ${getLevelColor(content.level)}`}>
              {getLevelText(content.level)}
            </span>
          </div>

          {(content.descriptionAr || content.description) && (
            <p className="text-gray-600 text-right mb-4">
              {content.descriptionAr || content.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {content.categoryAr && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">{content.categoryAr}</span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(content.duration || 0)}
            </span>
            <span className="flex items-center gap-1">
              {content.mediaType === 'VIDEO' ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              {content.mediaType === 'VIDEO' ? 'فيديو' : 'صوت'}
            </span>
          </div>
        </div>

        {(content.transcript || content.transcriptAr) && (
          <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-4 flex items-center justify-between text-gray-800 hover:bg-gray-50"
            >
              <span className="font-semibold">النص المكتوب</span>
              {showTranscript ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showTranscript && (
              <div className="p-4 pt-0 border-t">
                <div className="text-right leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {content.transcriptAr || content.transcript}
                </div>
              </div>
            )}
          </div>
        )}

        {content.exercises.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowExercises(!showExercises)}
              className="w-full p-4 flex items-center justify-between text-gray-800 hover:bg-gray-50"
            >
              <span className="font-semibold flex items-center gap-2">
                التمارين
                <span className="bg-[#10B981] text-white text-sm px-2 py-0.5 rounded-full">
                  {content.exercises.length}
                </span>
              </span>
              {showExercises ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showExercises && (
              <div className="p-4 pt-0 border-t space-y-6">
                {content.exercises.map((exercise, index) => {
                  const result = exerciseResults[exercise.id]
                  const options = exercise.options ? JSON.parse(exercise.options) : []

                  return (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="bg-[#10B981] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-gray-800 mb-1">
                            {exercise.questionAr || exercise.question}
                          </p>
                          {exercise.questionAr && (
                            <p className="text-sm text-gray-500">{exercise.question}</p>
                          )}
                        </div>
                      </div>

                      {exercise.type === 'MULTIPLE_CHOICE' || exercise.type === 'TRUE_FALSE' ? (
                        <div className="space-y-2 mb-4">
                          {(exercise.type === 'TRUE_FALSE' ? ['True', 'False'] : options).map((option: string, i: number) => (
                            <label
                              key={i}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                exerciseAnswers[exercise.id] === option
                                  ? 'border-[#10B981] bg-blue-50'
                                  : 'border-gray-200 hover:bg-gray-50'
                              } ${
                                result && option === result.correctAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : result && exerciseAnswers[exercise.id] === option && !result.isCorrect
                                  ? 'border-red-500 bg-red-50'
                                  : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={`exercise-${exercise.id}`}
                                value={option}
                                checked={exerciseAnswers[exercise.id] === option}
                                onChange={(e) => handleExerciseAnswer(exercise.id, e.target.value)}
                                disabled={!!result}
                                className="accent-[#10B981]"
                              />
                              <span className="text-gray-700">{option}</span>
                              {result && option === result.correctAnswer && (
                                <CheckCircle className="w-5 h-5 text-green-500 mr-auto" />
                              )}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4">
                          <input
                            type="text"
                            value={exerciseAnswers[exercise.id] || ''}
                            onChange={(e) => handleExerciseAnswer(exercise.id, e.target.value)}
                            disabled={!!result}
                            placeholder="اكتب إجابتك هنا..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                          />
                        </div>
                      )}

                      {!result ? (
                        <button
                          onClick={() => submitExercise(exercise.id)}
                          disabled={!exerciseAnswers[exercise.id]}
                          className="w-full py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#003A6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          تحقق من الإجابة
                        </button>
                      ) : (
                        <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {result.isCorrect ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-700">إجابة صحيحة!</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="font-semibold text-red-700">إجابة خاطئة</span>
                              </>
                            )}
                          </div>
                          {!result.isCorrect && (
                            <p className="text-gray-700 mb-2">
                              الإجابة الصحيحة: <strong>{result.correctAnswer}</strong>
                            </p>
                          )}
                          {(result.explanationAr || result.explanation) && (
                            <p className="text-gray-600 text-sm">
                              {result.explanationAr || result.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-[#10B981] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Youspeak. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
