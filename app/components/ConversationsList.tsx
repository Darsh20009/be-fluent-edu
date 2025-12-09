'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, UserPlus } from 'lucide-react'

interface ConversationsListProps {
  onSelectConversation: (user: any) => void
  selectedUserId?: string
}

export default function ConversationsList({
  onSelectConversation,
  selectedUserId
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 3000)
    return () => clearInterval(interval)
  }, [])

  async function fetchConversations() {
    try {
      const res = await fetch('/api/chat/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#004E89] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
          <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-bold text-base">لا توجد محادثات</p>
          <p className="text-sm mt-2 text-gray-400">ابدأ محادثة جديدة لتظهر هنا</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.user.id}
              onClick={() => onSelectConversation(conv.user)}
              className={`w-full p-4 transition-all duration-200 hover:scale-102 rounded-xl text-left group ${
                selectedUserId === conv.user.id
                  ? 'bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                  selectedUserId === conv.user.id
                    ? 'bg-white/30'
                    : 'bg-gradient-to-br from-[#004E89] to-[#1A5F7A]'
                }`}>
                  {conv.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">
                    {conv.user.name}
                  </h4>
                  <p className={`text-xs truncate ${
                    selectedUserId === conv.user.id ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {conv.lastMessage?.content || 'لا توجد رسائل'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
