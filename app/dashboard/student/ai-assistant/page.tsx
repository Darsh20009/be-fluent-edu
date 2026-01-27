'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Send, 
  ChevronLeft, 
  Loader2, 
  Sparkles,
  MessageCircle,
  User,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Settings,
  History,
  X,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import Script from 'next/script'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ConversationHistory {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function AIAssistantPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [puterReady, setPuterReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Voice features
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  
  // History
  const [showHistory, setShowHistory] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>('')
  
  // Speech synthesis and recognition refs
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check TTS support
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis
        setSpeechSupported(true)
      }
      
      // Check STT support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setRecognitionSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('')
          setInput(transcript)
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }
    
    // Load conversation history from localStorage
    loadConversationHistory()
    
    // Generate new conversation ID
    setCurrentConversationId(Date.now().toString())
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `مرحباً! 🎓 أنا Be Fluent AI، مساعدك الذكي المجاني لتعلم اللغة الإنجليزية!

Hello! I'm Be Fluent AI, your FREE smart English learning assistant!

🎤 يمكنني التحدث معك بالصوت! اضغط على أيقونة السماعة لسماعي.
🎙️ يمكنك التحدث معي! اضغط على أيقونة المايكروفون.

كيف يمكنني مساعدتك اليوم؟ أستطيع:
✅ شرح قواعد اللغة الإنجليزية
✅ تصحيح الأخطاء اللغوية  
✅ مساعدتك في الترجمة
✅ تعليمك كلمات جديدة
✅ التدرب على المحادثة

How can I help you today?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  const loadConversationHistory = () => {
    try {
      const saved = localStorage.getItem('befluent-ai-history')
      if (saved) {
        const history = JSON.parse(saved)
        setConversationHistory(history)
      }
    } catch (e) {
      console.error('Error loading history:', e)
    }
  }

  const saveConversation = useCallback((msgs: Message[]) => {
    if (msgs.length <= 1) return
    
    try {
      const title = msgs.find(m => m.role === 'user')?.content.slice(0, 40) || 'محادثة جديدة'
      const conversation: ConversationHistory = {
        id: currentConversationId,
        title,
        messages: msgs,
        createdAt: new Date()
      }
      
      const history = [...conversationHistory.filter(c => c.id !== currentConversationId), conversation]
        .slice(-20) // Keep last 20 conversations
      
      localStorage.setItem('befluent-ai-history', JSON.stringify(history))
      setConversationHistory(history)
    } catch (e) {
      console.error('Error saving conversation:', e)
    }
  }, [currentConversationId, conversationHistory])

  // Speak text using Web Speech API
  const speak = useCallback((text: string) => {
    if (!synthRef.current || !speechSupported) return
    
    // Cancel any ongoing speech
    synthRef.current.cancel()
    
    // Clean text for speech (remove emojis, markdown, etc.)
    const cleanText = text
      .replace(/[🎓📚✨🌟💡✅❌🎤🎙️🔊]/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n+/g, '. ')
      .slice(0, 500) // Limit length
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1
    
    // Try to get a good English voice
    const voices = synthRef.current.getVoices()
    const englishVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) 
      || voices.find(v => v.lang.includes('en-US'))
      || voices[0]
    if (englishVoice) {
      utterance.voice = englishVoice
    }
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }, [speechSupported])

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current || !recognitionSupported) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error('Error starting recognition:', e)
      }
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      if (!window.puter) {
        throw new Error('AI service not ready')
      }

      const systemPrompt = `You are "Be Fluent AI" - a friendly, expert English teacher for Arabic speakers. Your name is Be Fluent AI.

IMPORTANT RULES:
1. Always respond in BOTH English AND Arabic to help understanding
2. Be warm, encouraging, and patient like a supportive friend
3. Use simple, clear language for beginners
4. Provide practical examples from daily life
5. Correct mistakes gently and explain why
6. Use emojis to make learning fun 🎓📚✨

YOUR CAPABILITIES:
- Explain English grammar rules with Arabic translations
- Teach new vocabulary with pronunciation guides
- Practice conversations for different situations
- Translate between English and Arabic
- Help with writing and speaking skills

RESPONSE FORMAT EXAMPLE:
"Great question! 🌟
**In English:** The word 'beautiful' means very pretty.
**بالعربي:** كلمة 'beautiful' تعني جميل جداً.

**Example:** She has beautiful eyes.
**مثال:** لديها عيون جميلة.

💡 **Pronunciation:** BYOO-tih-ful

Keep practicing! استمر في التدريب! 💪"`

      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage.content }
      ]

      const response = await window.puter.ai.chat(apiMessages, {
        model: 'gpt-4o-mini',
        stream: false
      })

      let aiContent = ''
      if (typeof response === 'string') {
        aiContent = response
      } else if (response && typeof response === 'object') {
        const resp = response as any
        if (resp.message?.content) {
          aiContent = resp.message.content
        } else if (resp.text) {
          aiContent = resp.text
        } else if (resp.content) {
          aiContent = resp.content
        }
      }

      if (!aiContent) {
        aiContent = 'عذراً، لم أتمكن من فهم الرد. يرجى المحاولة مرة أخرى.\nSorry, I could not understand the response. Please try again.'
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      }
      
      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      saveConversation(updatedMessages)
      
      // Auto-speak if enabled
      if (autoSpeak && voiceEnabled) {
        setTimeout(() => speak(aiContent), 500)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.\nSorry, a connection error occurred. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    stopSpeaking()
    setCurrentConversationId(Date.now().toString())
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `مرحباً! 🎓 أنا جاهز لمساعدتك في تعلم الإنجليزية!

Hello! I'm ready to help you learn English!

كيف يمكنني مساعدتك؟ How can I help you?`,
      timestamp: new Date()
    }])
  }

  const loadConversation = (conv: ConversationHistory) => {
    setMessages(conv.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    })))
    setCurrentConversationId(conv.id)
    setShowHistory(false)
  }

  const deleteConversation = (id: string) => {
    const updated = conversationHistory.filter(c => c.id !== id)
    setConversationHistory(updated)
    localStorage.setItem('befluent-ai-history', JSON.stringify(updated))
  }

  const suggestedQuestions = [
    'كيف أقول "أنا بخير" بالإنجليزية؟',
    'What is the difference between "a" and "an"?',
    'اشرح لي قاعدة المضارع البسيط',
    'How do I introduce myself?',
    'ما الفرق بين was و were؟',
    'Teach me 5 new words today'
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col hide-floating-contact">
      <Script 
        src="https://js.puter.com/v2/" 
        strategy="afterInteractive"
        onLoad={() => setPuterReady(true)}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/student')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg flex items-center gap-2">
                  Be Fluent AI
                  <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">مجاني FREE</span>
                </h1>
                <p className="text-xs text-white/80">مساعدك الذكي للتعلم • يتكلم ويسمع 🎤</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice Controls */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-lg transition-colors ${autoSpeak ? 'bg-white/20' : 'bg-white/10'}`}
              title={autoSpeak ? 'إيقاف الرد الصوتي التلقائي' : 'تفعيل الرد الصوتي التلقائي'}
            >
              {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            {/* History */}
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="سجل المحادثات"
            >
              <History className="w-5 h-5" />
            </button>
            
            {/* Clear Chat */}
            <button
              onClick={clearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="مسح المحادثة"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#10B981]">سجل المحادثات</h2>
                <button onClick={() => setShowHistory(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {conversationHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد محادثات سابقة</p>
              ) : (
                <div className="space-y-2">
                  {conversationHistory.map(conv => (
                    <div
                      key={conv.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <button
                        onClick={() => loadConversation(conv)}
                        className="flex-1 text-right"
                      >
                        <p className="font-medium text-gray-800 truncate">{conv.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(conv.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </button>
                      <button
                        onClick={() => deleteConversation(conv.id)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4 pb-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-[#10B981] text-white' 
                      : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#10B981] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap text-right" dir="auto">
                      {message.content}
                    </p>
                    <div className={`flex items-center justify-between mt-2 gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <p className={`text-xs ${message.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {message.role === 'assistant' && speechSupported && (
                        <button
                          onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
                          className={`p-1 rounded-full transition-colors ${
                            isSpeaking ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-500'
                          }`}
                          title={isSpeaking ? 'إيقاف' : 'استمع'}
                        >
                          {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                    <span className="text-gray-500">جاري التفكير... 🤔</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-3 text-center">أسئلة مقترحة / Suggested questions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 bg-white rounded-full text-sm text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981] hover:text-white transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-center">
            {/* Mic Button */}
            {recognitionSupported && (
              <button
                onClick={toggleListening}
                disabled={loading}
                className={`p-3 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'إيقاف الاستماع' : 'تحدث معي'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading || !puterReady}
              className="bg-[#10B981] text-white p-3 rounded-full hover:bg-[#003a6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
            
            {/* Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? '🎤 جاري الاستماع...' : 'اكتب سؤالك هنا... / Type your question...'}
              className="flex-1 px-4 py-3 border-2 border-gray-300 bg-white text-black placeholder:text-gray-500 rounded-full focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-right"
              dir="auto"
              disabled={loading || !puterReady}
            />
          </div>
          
          {/* Status indicators */}
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
            {!puterReady && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                جاري تحميل الذكاء الاصطناعي...
              </span>
            )}
            {puterReady && (
              <span className="text-green-600 flex items-center gap-1">
                ✓ AI جاهز
              </span>
            )}
            {speechSupported && (
              <span className="text-blue-600 flex items-center gap-1">
                🔊 الصوت متاح
              </span>
            )}
            {recognitionSupported && (
              <span className="text-purple-600 flex items-center gap-1">
                🎤 التحدث متاح
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
