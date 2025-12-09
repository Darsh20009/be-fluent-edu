'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, X, MessageCircle } from 'lucide-react'

interface ChatBoxProps {
  otherUser: any
  onClose: () => void
}

export default function ChatBox({ otherUser, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [otherUser.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/chat/messages?userId=${otherUser.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

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
        setNewMessage('')
        await fetchMessages()
        inputRef.current?.focus()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white p-4 sm:p-6 flex items-center justify-between flex-shrink-0 hidden lg:flex">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {otherUser.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg">{otherUser.name}</h3>
            <p className="text-sm text-gray-200">{otherUser.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-[#004E89] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">لا توجد رسائل بعد</p>
              <p className="text-sm text-gray-400 mt-1">ابدأ المحادثة بإرسال رسالة</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.fromUserId === otherUser.id ? 'justify-start' : 'justify-end'} animate-fadeIn`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl font-medium break-words shadow-md ${
                  msg.fromUserId === otherUser.id
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white'
                }`}
              >
                <p className="text-sm lg:text-base">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.fromUserId === otherUser.id ? 'text-gray-600' : 'text-gray-200'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t-2 border-slate-200 p-4 sm:p-6 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="اكتب رسالتك هنا..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-3 sm:py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-[#004E89] focus:ring-2 focus:ring-[#004E89]/20 disabled:opacity-50 transition-all text-base sm:text-lg"
            autoFocus
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 font-bold flex items-center gap-2 flex-shrink-0"
            title="إرسال الرسالة"
          >
            <Send className="h-5 w-5" />
            <span className="hidden sm:inline">إرسال</span>
          </button>
        </form>
      </div>
    </div>
  )
}
