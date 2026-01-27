'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, X, Loader2, MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  fromUserId: string
  toUserId: string
  createdAt: string
  fromUser: {
    id: string
    name: string
    profilePhoto: string | null
  }
}

interface ChatBoxProps {
  otherUser: {
    id: string
    name: string
    profilePhoto?: string | null
    role?: string
  }
  onClose?: () => void
}

export default function ChatBox({ otherUser, onClose }: ChatBoxProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?userId=${otherUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])

          await fetch('/api/chat/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromUserId: otherUser.id })
          })
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    const socketInstance = io({
      path: '/api/socket/io',
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected')
      socketInstance.emit('join-room', session.user.id)
    })

    socketInstance.on('new-message', (data) => {
      if (data.fromUserId === otherUser.id) {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          content: data.message,
          fromUserId: data.fromUserId,
          toUserId: session.user.id,
          createdAt: data.timestamp,
          fromUser: {
            id: otherUser.id,
            name: otherUser.name,
            profilePhoto: otherUser.profilePhoto || null
          }
        }])
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session?.user?.id, otherUser])

  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user?.id || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: otherUser.id,
          content: newMessage.trim()
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setNewMessage('')

        if (socket) {
          socket.emit('send-message', {
            toUserId: otherUser.id,
            fromUserId: session.user.id,
            message: newMessage.trim()
          })
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'TEACHER': return 'text-purple-600'
      case 'STUDENT': return 'text-blue-600'
      case 'ADMIN': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'TEACHER': return 'مدرس'
      case 'STUDENT': return 'طالب'
      case 'ADMIN': return 'مدير'
      default: return ''
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden">
      {/* Header */}
      <div className="bg-[#10B981] p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-neutral-200 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-700 font-bold">
              {otherUser.profilePhoto ? (
                <img src={otherUser.profilePhoto} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                otherUser.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{otherUser.name}</h3>
              {otherUser.role && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {getRoleBadge(otherUser.role)}
                </span>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-500">
            <MessageCircle className="w-16 h-16 mb-2" />
            <p>لا توجد رسائل بعد</p>
            <p className="text-sm">ابدأ المحادثة الآن!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.fromUserId === session?.user?.id
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-[#10B981] text-white rounded-br-sm'
                      : 'bg-gray-100 text-black border-2 border-gray-300 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-right" dir="rtl">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    {new Date(message.createdAt).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t-2 border-gray-300">
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 bg-white text-black placeholder:text-gray-500 rounded-full focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-right"
            dir="rtl"
            disabled={sending}
          />
        </div>
      </div>
    </div>
  )
}