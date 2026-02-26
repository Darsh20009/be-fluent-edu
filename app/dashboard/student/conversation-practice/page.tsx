'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Trash2, 
  Save,
  Volume2,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Star,
  Trophy,
  Send,
  ChevronLeft
} from 'lucide-react'
import Card from '@/components/ui/Card'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { voicePrompts, type VoicePromptItem } from '@/lib/conversation-scenarios'

type TabType = 'scenarios' | 'voice' | 'text'

interface DialogueStep {
  id: number
  speaker: 'system' | 'student'
  message: string
  messageAr: string
  options?: {
    id: number
    text: string
    textAr: string
    isCorrect: boolean
    feedback?: string
    feedbackAr?: string
  }[]
}

interface Scenario {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  category: string
  categoryAr: string
  level: string
  dialogueSteps: DialogueStep[]
  progress: {
    completed: boolean
    score: number
    currentStep: number
  } | null
}

interface TextConversation {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  level: string
  questions: {
    id: number
    question: string
    questionAr: string
    keywords: string[]
    sampleAnswer: string
    sampleAnswerAr: string
  }[]
}

interface VoiceRecording {
  id: string
  title: string
  audioData: string
  duration: number
  promptText: string
  promptTextAr: string
  createdAt: string
}

export default function ConversationPracticePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('scenarios')
  const [loading, setLoading] = useState(true)
  
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [scenarioScore, setScenarioScore] = useState(0)
  const [scenarioCompleted, setScenarioCompleted] = useState(false)
  
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentPrompt, setCurrentPrompt] = useState<VoicePromptItem | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const [textConversations, setTextConversations] = useState<TextConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<TextConversation | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [textAnswers, setTextAnswers] = useState<{ questionId: number; text: string }[]>([])
  const [currentTextAnswer, setCurrentTextAnswer] = useState('')
  const [textResults, setTextResults] = useState<any>(null)
  const [submittingText, setSubmittingText] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    try {
      if (activeTab === 'scenarios') {
        const res = await fetch('/api/conversation/scenarios')
        if (res.ok) {
          const data = await res.json()
          setScenarios(data)
        }
      } else if (activeTab === 'voice') {
        const res = await fetch('/api/conversation/voice-recordings')
        if (res.ok) {
          const data = await res.json()
          setRecordings(data)
        }
      } else if (activeTab === 'text') {
        const res = await fetch('/api/conversation/text-conversations')
        if (res.ok) {
          const data = await res.json()
          setTextConversations(data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('لا يمكن الوصول للميكروفون')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  async function saveRecording() {
    if (!audioBlob || !currentPrompt) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Audio = reader.result as string

      try {
        const res = await fetch('/api/conversation/voice-recordings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Recording - ${new Date().toLocaleString('ar-EG')}`,
            audioData: base64Audio,
            duration: recordingTime,
            promptText: currentPrompt.text,
            promptTextAr: currentPrompt.textAr
          })
        })

        if (res.ok) {
          const newRecording = await res.json()
          setRecordings([newRecording, ...recordings])
          setAudioBlob(null)
          setCurrentPrompt(null)
          setRecordingTime(0)
        }
      } catch (error) {
        console.error('Error saving recording:', error)
      }
    }
    reader.readAsDataURL(audioBlob)
  }

  function playRecording(recording: VoiceRecording) {
    if (playingId === recording.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(recording.audioData)
    audioRef.current = audio
    audio.play()
    setPlayingId(recording.id)

    audio.onended = () => setPlayingId(null)
  }

  async function deleteRecording(id: string) {
    try {
      const res = await fetch(`/api/conversation/voice-recordings?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setRecordings(recordings.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting recording:', error)
    }
  }

  function handleSelectOption(optionId: number) {
    if (showFeedback) return
    setSelectedOption(optionId)
    setShowFeedback(true)

    const currentStep = selectedScenario?.dialogueSteps[currentStepIndex]
    const option = currentStep?.options?.find(o => o.id === optionId)

    if (option?.isCorrect) {
      setScenarioScore(prev => prev + 10)
    }
  }

  async function handleNextStep() {
    if (!selectedScenario) return

    const nextIndex = currentStepIndex + 1
    const isCompleted = nextIndex >= selectedScenario.dialogueSteps.length

    await fetch('/api/conversation/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioId: selectedScenario.id,
        currentStep: nextIndex,
        score: showFeedback && selectedOption !== null ? 
          (selectedScenario.dialogueSteps[currentStepIndex].options?.find(o => o.id === selectedOption)?.isCorrect ? 10 : 0) : 0,
        completed: isCompleted
      })
    })

    if (isCompleted) {
      setScenarioCompleted(true)
    } else {
      setCurrentStepIndex(nextIndex)
      setSelectedOption(null)
      setShowFeedback(false)
    }
  }

  function resetScenario() {
    setCurrentStepIndex(0)
    setSelectedOption(null)
    setShowFeedback(false)
    setScenarioScore(0)
    setScenarioCompleted(false)
  }

  function handleAddTextAnswer() {
    if (!currentTextAnswer.trim() || !selectedConversation) return

    const question = selectedConversation.questions[currentQuestionIndex]
    setTextAnswers([...textAnswers, { questionId: question.id, text: currentTextAnswer }])
    setCurrentTextAnswer('')

    if (currentQuestionIndex < selectedConversation.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  async function submitTextConversation() {
    if (!selectedConversation || textAnswers.length === 0) return

    setSubmittingText(true)
    try {
      const res = await fetch('/api/conversation/text-conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          answers: textAnswers
        })
      })

      if (res.ok) {
        const result = await res.json()
        setTextResults(result)
      }
    } catch (error) {
      console.error('Error submitting conversation:', error)
    } finally {
      setSubmittingText(false)
    }
  }

  function resetTextConversation() {
    setCurrentQuestionIndex(0)
    setTextAnswers([])
    setCurrentTextAnswer('')
    setTextResults(null)
    setSelectedConversation(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return <Badge variant="success">مبتدئ / Beginner</Badge>
      case 'INTERMEDIATE':
        return <Badge variant="warning">متوسط / Intermediate</Badge>
      case 'ADVANCED':
        return <Badge variant="info">متقدم / Advanced</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/dashboard/student')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#10B981]" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#10B981]">
              تدريب المحادثة
            </h1>
            <p className="text-gray-600">
              Conversation Practice
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'scenarios' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('scenarios')}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>محادثات تفاعلية</span>
          </Button>
          <Button
            variant={activeTab === 'voice' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('voice')}
            className="flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            <span>تسجيل صوتي</span>
          </Button>
          <Button
            variant={activeTab === 'text' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('text')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>محادثة نصية</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === 'scenarios' && (
              <div>
                {!selectedScenario ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenarios.map(scenario => (
                      <Card key={scenario.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                        setSelectedScenario(scenario)
                        resetScenario()
                      }}>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-[#10B981]">{scenario.title}</h3>
                              <p className="text-sm text-gray-600">{scenario.titleAr}</p>
                            </div>
                            {scenario.progress?.completed && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{scenario.description}</p>
                          <div className="flex items-center justify-between">
                            {getLevelBadge(scenario.level)}
                            <span className="text-xs text-gray-500">{scenario.categoryAr}</span>
                          </div>
                          {scenario.progress && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center gap-2 text-sm">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>النقاط: {scenario.progress.score}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : scenarioCompleted ? (
                  <Card className="max-w-2xl mx-auto">
                    <div className="p-8 text-center">
                      <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-[#10B981] mb-2">
                        أحسنت! / Well Done!
                      </h2>
                      <p className="text-gray-600 mb-4">
                        لقد أكملت المحادثة بنجاح / You completed the conversation successfully
                      </p>
                      <div className="text-3xl font-bold text-[#10B981] mb-6">
                        {scenarioScore} نقطة / points
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={() => setSelectedScenario(null)}>
                          <ArrowRight className="w-4 h-4 ml-2" />
                          العودة للقائمة
                        </Button>
                        <Button onClick={resetScenario}>
                          <RefreshCw className="w-4 h-4 ml-2" />
                          إعادة المحاولة
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="max-w-3xl mx-auto">
                    <div className="p-4 border-b flex justify-between items-center">
                      <div>
                        <h2 className="font-bold text-[#10B981]">{selectedScenario.title}</h2>
                        <p className="text-sm text-gray-600">{selectedScenario.titleAr}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(null)}>
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">
                            الخطوة {currentStepIndex + 1} من {selectedScenario.dialogueSteps.length}
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-[#10B981] rounded-full transition-all"
                              style={{ width: `${((currentStepIndex + 1) / selectedScenario.dialogueSteps.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStepIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          {(() => {
                            const step = selectedScenario.dialogueSteps[currentStepIndex]
                            return (
                              <div>
                                <div className="bg-[#10B981] text-white p-4 rounded-lg mb-4">
                                  <p className="text-lg">{step.message}</p>
                                  <p className="text-sm opacity-80 mt-2">{step.messageAr}</p>
                                </div>

                                {step.options && (
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-700 mb-2">اختر الرد المناسب:</p>
                                    {step.options.map(option => (
                                      <button
                                        key={option.id}
                                        onClick={() => handleSelectOption(option.id)}
                                        disabled={showFeedback}
                                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                          showFeedback
                                            ? option.isCorrect
                                              ? 'border-green-500 bg-green-50'
                                              : selectedOption === option.id
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200'
                                            : selectedOption === option.id
                                              ? 'border-[#10B981] bg-blue-50'
                                              : 'border-gray-200 hover:border-[#10B981]'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                            showFeedback
                                              ? option.isCorrect
                                                ? 'bg-green-500 text-white'
                                                : selectedOption === option.id
                                                  ? 'bg-red-500 text-white'
                                                  : 'bg-gray-200'
                                              : 'bg-gray-200'
                                          }`}>
                                            {showFeedback && option.isCorrect && <CheckCircle className="w-4 h-4" />}
                                            {showFeedback && !option.isCorrect && selectedOption === option.id && <XCircle className="w-4 h-4" />}
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium">{option.text}</p>
                                            <p className="text-sm text-gray-600">{option.textAr}</p>
                                          </div>
                                        </div>
                                        {showFeedback && selectedOption === option.id && option.feedback && (
                                          <div className={`mt-3 p-3 rounded ${option.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <p className="text-sm">{option.feedback}</p>
                                            <p className="text-sm text-gray-600">{option.feedbackAr}</p>
                                          </div>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {showFeedback && (
                                  <div className="mt-6 flex justify-end">
                                    <Button onClick={handleNextStep}>
                                      {currentStepIndex === selectedScenario.dialogueSteps.length - 1 
                                        ? 'إنهاء المحادثة' 
                                        : 'التالي'}
                                      <ArrowLeft className="w-4 h-4 mr-2" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">
                      تسجيل الصوت / Voice Recording
                    </h3>
                    <p className="text-gray-600 mb-6">
                      اختر جملة وسجل صوتك، ثم استمع لتسجيلك لتحسين نطقك
                    </p>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">اختر جملة للتدريب:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {voicePrompts.map((category, catIndex) => (
                          <div key={catIndex}>
                            <p className="text-sm font-medium text-[#10B981] mb-2">
                              {category.category} / {category.categoryAr}
                            </p>
                            <div className="space-y-2">
                              {category.prompts.slice(0, 2).map((prompt, promptIndex) => (
                                <button
                                  key={promptIndex}
                                  onClick={() => setCurrentPrompt(prompt)}
                                  className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                                    currentPrompt?.text === prompt.text
                                      ? 'border-[#10B981] bg-blue-50'
                                      : 'border-gray-200 hover:border-[#10B981]'
                                  }`}
                                >
                                  <p className="font-medium">{prompt.text}</p>
                                  <p className="text-gray-600">{prompt.textAr}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {currentPrompt && (
                      <div className="bg-[#10B981] text-white p-4 rounded-lg mb-6">
                        <p className="text-lg mb-1">{currentPrompt.text}</p>
                        <p className="text-sm opacity-80 mb-3">{currentPrompt.textAr}</p>
                        
                        {currentPrompt.pronunciationTip && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <div className="flex items-start gap-2 mb-2">
                              <Volume2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium mb-1">Pronunciation Tip:</p>
                                <p className="text-sm opacity-90">{currentPrompt.pronunciationTip}</p>
                                {currentPrompt.pronunciationTipAr && (
                                  <p className="text-sm opacity-70 mt-1">{currentPrompt.pronunciationTipAr}</p>
                                )}
                              </div>
                            </div>
                            {currentPrompt.phonetics && (
                              <div className="mt-2 bg-white/10 px-3 py-2 rounded">
                                <p className="text-xs font-mono">{currentPrompt.phonetics}</p>
                              </div>
                            )}
                            {currentPrompt.difficulty && (
                              <div className="mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  currentPrompt.difficulty === 'easy' ? 'bg-green-500/30' :
                                  currentPrompt.difficulty === 'medium' ? 'bg-yellow-500/30' :
                                  'bg-red-500/30'
                                }`}>
                                  {currentPrompt.difficulty === 'easy' ? 'سهل / Easy' :
                                   currentPrompt.difficulty === 'medium' ? 'متوسط / Medium' :
                                   'صعب / Hard'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {!isRecording && !audioBlob && (
                        <Button
                          onClick={startRecording}
                          disabled={!currentPrompt}
                          className="flex items-center gap-2"
                        >
                          <Mic className="w-5 h-5" />
                          بدء التسجيل
                        </Button>
                      )}

                      {isRecording && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-red-500">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="font-mono text-xl">{formatTime(recordingTime)}</span>
                          </div>
                          <Button onClick={stopRecording} variant="danger">
                            <MicOff className="w-5 h-5 ml-2" />
                            إيقاف التسجيل
                          </Button>
                        </div>
                      )}

                      {audioBlob && (
                        <div className="flex flex-wrap items-center gap-4">
                          <audio src={URL.createObjectURL(audioBlob)} controls className="max-w-xs" />
                          <Button onClick={saveRecording} className="flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            حفظ التسجيل
                          </Button>
                          <Button variant="outline" onClick={() => setAudioBlob(null)}>
                            <RefreshCw className="w-5 h-5 ml-2" />
                            إعادة التسجيل
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {recordings.length > 0 && (
                  <Card>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#10B981] mb-4">
                        تسجيلاتي / My Recordings
                      </h3>
                      <div className="space-y-3">
                        {recordings.map(recording => (
                          <div key={recording.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => playRecording(recording)}
                              className={`p-3 rounded-full ${playingId === recording.id ? 'bg-[#10B981] text-white' : 'bg-white border'}`}
                            >
                              {playingId === recording.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </button>
                            <div className="flex-1">
                              <p className="font-medium">{recording.promptText}</p>
                              <p className="text-sm text-gray-600">{recording.promptTextAr}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {recording.duration}s • {new Date(recording.createdAt).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteRecording(recording.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div>
                {!selectedConversation ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {textConversations.map(conv => (
                      <Card key={conv.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                        setSelectedConversation(conv)
                        setCurrentQuestionIndex(0)
                        setTextAnswers([])
                        setTextResults(null)
                      }}>
                        <div className="p-4">
                          <h3 className="font-bold text-[#10B981] mb-1">{conv.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{conv.titleAr}</p>
                          <p className="text-sm text-gray-700 mb-3">{conv.description}</p>
                          <div className="flex items-center justify-between">
                            {getLevelBadge(conv.level)}
                            <span className="text-xs text-gray-500">{conv.questions.length} أسئلة</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : textResults ? (
                  <Card className="max-w-2xl mx-auto">
                    <div className="p-6">
                      <div className="text-center mb-6">
                        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-[#10B981]">
                          النتيجة / Result
                        </h2>
                        <div className="text-4xl font-bold text-[#10B981] my-4">
                          {textResults.percentage}%
                        </div>
                        <p className="text-gray-600">
                          {textResults.score} / {textResults.totalQuestions} إجابات صحيحة
                        </p>
                      </div>

                      <div className="space-y-4">
                        {textResults.evaluatedAnswers.map((answer: any, index: number) => (
                          <div key={index} className={`p-4 rounded-lg ${answer.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-start gap-2 mb-2">
                              {answer.correct ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                              <div>
                                <p className="font-medium">إجابتك: {answer.text}</p>
                                {answer.matchedKeywords.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    الكلمات المطابقة: {answer.matchedKeywords.join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 p-2 bg-white rounded">
                              <p className="text-sm font-medium text-gray-700">نموذج الإجابة:</p>
                              <p className="text-sm">{answer.sampleAnswer}</p>
                              <p className="text-sm text-gray-600">{answer.sampleAnswerAr}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-center gap-4">
                        <Button variant="outline" onClick={resetTextConversation}>
                          <ArrowRight className="w-4 h-4 ml-2" />
                          العودة للقائمة
                        </Button>
                        <Button onClick={() => {
                          setCurrentQuestionIndex(0)
                          setTextAnswers([])
                          setCurrentTextAnswer('')
                          setTextResults(null)
                        }}>
                          <RefreshCw className="w-4 h-4 ml-2" />
                          إعادة المحاولة
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="max-w-2xl mx-auto">
                    <div className="p-4 border-b flex justify-between items-center">
                      <div>
                        <h2 className="font-bold text-[#10B981]">{selectedConversation.title}</h2>
                        <p className="text-sm text-gray-600">{selectedConversation.titleAr}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">
                            السؤال {currentQuestionIndex + 1} من {selectedConversation.questions.length}
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-[#10B981] rounded-full transition-all"
                              style={{ width: `${((currentQuestionIndex + 1) / selectedConversation.questions.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                        {textAnswers.map((answer, index) => {
                          const question = selectedConversation.questions.find(q => q.id === answer.questionId)
                          return (
                            <div key={index} className="space-y-2">
                              <div className="bg-[#10B981] text-white p-3 rounded-lg rounded-br-none max-w-[80%]">
                                <p>{question?.question}</p>
                              </div>
                              <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none max-w-[80%] mr-auto">
                                <p>{answer.text}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {currentQuestionIndex < selectedConversation.questions.length && !textAnswers.find(a => a.questionId === selectedConversation.questions[currentQuestionIndex].id) && (
                        <div>
                          <div className="bg-[#10B981] text-white p-4 rounded-lg mb-4">
                            <p className="text-lg">{selectedConversation.questions[currentQuestionIndex].question}</p>
                            <p className="text-sm opacity-80 mt-2">{selectedConversation.questions[currentQuestionIndex].questionAr}</p>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={currentTextAnswer}
                              onChange={(e) => setCurrentTextAnswer(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTextAnswer()}
                              placeholder="اكتب إجابتك هنا..."
                              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                            />
                            <Button onClick={handleAddTextAnswer} disabled={!currentTextAnswer.trim()}>
                              <Send className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {textAnswers.length === selectedConversation.questions.length && (
                        <div className="mt-6 text-center">
                          <Button onClick={submitTextConversation} disabled={submittingText} className="px-8">
                            {submittingText ? <LoadingSpinner size="sm" /> : 'إرسال الإجابات'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
